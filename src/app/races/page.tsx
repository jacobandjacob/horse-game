'use client'

import { useState, useEffect } from 'react'
import { useGame } from '@/lib/game-context'
import { BetType, Horse, Race } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Minus, Plus, Play } from 'lucide-react'

const BET_TYPES: { value: BetType; label: string; picks: number }[] = [
  { value: 'win', label: 'Win', picks: 1 },
  { value: 'place', label: 'Place', picks: 1 },
  { value: 'show', label: 'Show', picks: 1 },
  { value: 'exacta', label: 'Exacta', picks: 2 },
  { value: 'trifecta', label: 'Trifecta', picks: 3 },
]

const PRESET_AMOUNTS = [2, 5, 10, 20]

const PAYOUT_MULTIPLIERS: Record<BetType, number> = {
  win: 5,
  place: 2.5,
  show: 1.5,
  exacta: 25,
  trifecta: 100,
}

export default function RacesPage() {
  const { races, balance, placeBet, startRace, isRaceAnimating, resetGame, setFullScreen } = useGame()

  const [selectedRaceId, setSelectedRaceId] = useState(races[0]?.id)
  const [betType, setBetType] = useState<BetType>('win')
  const [selections, setSelections] = useState<string[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [betAmount, setBetAmount] = useState(2)
  const [showRaceView, setShowRaceView] = useState(false)

  const selectedRace = races.find(r => r.id === selectedRaceId)
  const currentBetType = BET_TYPES.find(b => b.value === betType)!
  const isAnimating = selectedRace ? isRaceAnimating(selectedRace.id) : false

  // Auto-show race view when animation starts
  useEffect(() => {
    if (isAnimating) {
      setShowRaceView(true)
    }
  }, [isAnimating])

  // Toggle full screen mode when race view is shown/hidden
  useEffect(() => {
    setFullScreen(showRaceView)
  }, [showRaceView, setFullScreen])

  const handleHorseSelect = (horseId: string, position?: number) => {
    if (currentBetType.picks === 1) {
      setSelections([horseId])
    } else {
      if (position !== undefined) {
        const newSelections = [...selections]
        const existingIndex = newSelections.indexOf(horseId)
        if (existingIndex !== -1) {
          newSelections[existingIndex] = ''
        }
        newSelections[position] = horseId
        setSelections(newSelections.filter(Boolean))
      }
    }
  }

  const isSelectionComplete = selections.length === currentBetType.picks

  const handlePlaceBet = () => {
    if (betAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (betAmount > balance) {
      toast.error('Insufficient balance')
      return
    }

    const success = placeBet(
      selectedRaceId,
      selectedRace!.number,
      betType,
      selections,
      betAmount
    )

    if (success) {
      toast.success('Bet Placed!')
      setDrawerOpen(false)
      setSelections([])
      setBetAmount(2)
    }
  }

  const handleStartRace = () => {
    if (selectedRace && selectedRace.status !== 'finished') {
      startRace(selectedRace.id)
    }
  }

  const adjustAmount = (delta: number) => {
    setBetAmount(prev => Math.max(1, Math.min(prev + delta, balance)))
  }


  // Race animation view
  if (showRaceView && selectedRace) {
    return (
      <RaceAnimation
        race={selectedRace}
        isAnimating={isAnimating}
        onClose={() => setShowRaceView(false)}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">Gemini Downs</h1>
            <button
              onClick={resetGame}
              className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground hover:bg-muted/80"
            >
              Reset
            </button>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="font-bold">${balance.toFixed(2)}</p>
          </div>
        </div>
      </header>

      {/* Race Selector */}
      <div className="p-4 border-b overflow-x-auto">
        <div className="flex gap-2">
          {races.map(race => (
            <button
              key={race.id}
              onClick={() => {
                setSelectedRaceId(race.id)
                setSelections([])
              }}
              className={cn(
                "flex-shrink-0 px-3 py-2 rounded-lg border text-center min-w-[70px]",
                race.id === selectedRaceId
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border",
                race.status === 'finished' && "opacity-50"
              )}
            >
              <div className="text-[10px] text-muted-foreground">RACE {race.number}</div>
              <div className="text-sm font-bold mt-0.5">
                {race.status === 'live' ? (
                  <span className="text-red-500">LIVE</span>
                ) : race.status === 'finished' ? (
                  'Done'
                ) : (
                  `${race.minutesToPost}m`
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Race Info */}
      {selectedRace && (
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            {selectedRace.status === 'live' ? (
              <>
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">LIVE NOW</span>
              </>
            ) : selectedRace.status === 'finished' ? (
              <span className="text-sm text-muted-foreground">Finished</span>
            ) : (
              <span className="text-sm text-muted-foreground">
                {selectedRace.minutesToPost} mins to post
              </span>
            )}
            <span className="text-muted-foreground">|</span>
            <span className="text-sm text-muted-foreground">{selectedRace.distance}</span>
          </div>
          {selectedRace.status === 'finished' ? (
            <Button variant="outline" size="sm" onClick={() => setShowRaceView(true)}>
              <Play className="w-4 h-4 mr-1" />
              Watch Replay
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleStartRace}>
              <Play className="w-4 h-4 mr-1" />
              {selectedRace.status === 'live' ? 'Watch' : 'Run Race'}
            </Button>
          )}
        </div>
      )}

      {/* Bet Type Selector */}
      {selectedRace?.status !== 'finished' && (
        <div className="p-4 border-b overflow-x-auto">
          <div className="flex gap-2">
            {BET_TYPES.map(type => (
              <Button
                key={type.value}
                variant={betType === type.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setBetType(type.value)
                  setSelections([])
                }}
                className="flex-shrink-0"
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Multi-pick instruction */}
      {selectedRace?.status !== 'finished' && currentBetType.picks > 1 && (
        <div className="px-4 py-2 bg-muted/50 text-sm text-muted-foreground flex justify-between">
          <span>Pick {currentBetType.picks === 2 ? '1st and 2nd' : '1st, 2nd, and 3rd'} in exact order</span>
          <div className="flex gap-4">
            {Array.from({ length: currentBetType.picks }, (_, i) => (
              <span key={i} className="font-medium">{i + 1}{i === 0 ? 'st' : i === 1 ? 'nd' : 'rd'}</span>
            ))}
          </div>
        </div>
      )}

      {/* Horse List */}
      <div className={cn("flex-1 overflow-y-auto", isSelectionComplete && "pb-20")}>
        {selectedRace && [...selectedRace.horses]
          .sort((a, b) => {
            // Sort by finish order for completed races
            if (selectedRace.status === 'finished' && selectedRace.results) {
              return selectedRace.results.indexOf(a.id) - selectedRace.results.indexOf(b.id)
            }
            return 0
          })
          .map(horse => (
          <HorseRow
            key={horse.id}
            horse={horse}
            betType={currentBetType}
            selections={selections}
            onSelect={handleHorseSelect}
            disabled={selectedRace.status === 'finished'}
            isWinner={selectedRace.results?.[0] === horse.id}
            placement={selectedRace.results?.indexOf(horse.id)}
          />
        ))}
      </div>

      {/* Fixed Bet Button - above bottom nav */}
      {isSelectionComplete && selectedRace?.status !== 'finished' && (
        <div className="fixed left-0 right-0 p-4 bg-background border-t max-w-md mx-auto bottom-24">
          <Button
            className="w-full"
            size="lg"
            onClick={() => setDrawerOpen(true)}
          >
            Enter Amount
          </Button>
        </div>
      )}

      {/* Bet Amount Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>Place Your Bet</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-6">
            {/* Bet Summary */}
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Race {selectedRace?.number} - {currentBetType.label}</p>
              <div className="mt-2 space-y-1">
                {selections.map((id, i) => {
                  const horse = selectedRace?.horses.find(h => h.id === id)
                  return (
                    <p key={id} className="font-medium">
                      {currentBetType.picks > 1 && `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : 'rd'}: `}
                      {horse?.name} ({horse?.odds})
                    </p>
                  )
                })}
              </div>
            </div>

            {/* Amount Stepper */}
            <div>
              <p className="text-sm text-muted-foreground mb-3">Wager Amount</p>
              <div className="flex items-center justify-center gap-6 p-4 border rounded-lg">
                <button
                  onClick={() => adjustAmount(-1)}
                  className="w-12 h-12 rounded-full border-2 border-muted-foreground flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-4xl font-bold min-w-[100px] text-center">
                  ${betAmount}
                </span>
                <button
                  onClick={() => adjustAmount(1)}
                  className="w-12 h-12 rounded-full border-2 border-muted-foreground flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preset Amounts */}
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map(amount => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  className={cn(
                    "py-3 rounded-lg border text-sm font-medium transition-colors",
                    betAmount === amount
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-foreground"
                  )}
                >
                  ${amount}
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Available: ${balance.toFixed(2)}
            </p>
          </div>
          <DrawerFooter className="pb-10">
            <Button onClick={handlePlaceBet} size="lg" className="w-full">
              Place ${betAmount} Bet
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

function HorseRow({
  horse,
  betType,
  selections,
  onSelect,
  disabled,
  isWinner,
  placement,
}: {
  horse: Horse
  betType: { value: BetType; label: string; picks: number }
  selections: string[]
  onSelect: (horseId: string, position?: number) => void
  disabled?: boolean
  isWinner?: boolean
  placement?: number
}) {
  const isSimpleBet = betType.picks === 1
  const isSelected = selections.includes(horse.id)

  return (
    <div className={cn(
      "flex items-center gap-3 p-4 border-b",
      isWinner && "bg-green-500/10",
      placement === 1 && "bg-blue-500/10",
      placement === 2 && "bg-orange-500/10"
    )}>
      {/* Post Position */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
        style={{ backgroundColor: horse.color }}
      >
        {horse.number}
      </div>

      {/* Horse Info */}
      <div className="flex-1">
        <p className="font-semibold">{horse.name}</p>
        <p className="text-sm text-muted-foreground">{horse.jockey}</p>
      </div>

      {/* Placement badge for finished races */}
      {placement !== undefined && placement >= 0 && placement < 3 && (
        <Badge variant={placement === 0 ? "default" : "secondary"}>
          {placement === 0 ? '1st' : placement === 1 ? '2nd' : '3rd'}
        </Badge>
      )}

      {/* Odds */}
      <Badge variant="secondary" className="font-mono">
        {horse.odds}
      </Badge>

      {/* Selection UI */}
      {!disabled && (
        isSimpleBet ? (
          <button
            onClick={() => onSelect(horse.id)}
            className={cn(
              "w-8 h-8 rounded-full border-2 transition-colors",
              isSelected
                ? "bg-primary border-primary"
                : "border-muted-foreground"
            )}
          />
        ) : (
          <div className="flex gap-2">
            {Array.from({ length: betType.picks }, (_, i) => (
              <button
                key={i}
                onClick={() => onSelect(horse.id, i)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors",
                  selections[i] === horse.id
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground text-muted-foreground"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )
      )}
    </div>
  )
}

function RaceAnimation({
  race,
  isAnimating,
  onClose,
}: {
  race: Race
  isAnimating: boolean
  onClose: () => void
}) {
  const { bets } = useGame()
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [isReplaying, setIsReplaying] = useState(false)
  const [replayFinished, setReplayFinished] = useState(false)
  const [finishOrder, setFinishOrder] = useState<string[]>([]) // Track actual crossing order

  // Get bets for this race
  const raceBets = bets.filter(bet => bet.raceId === race.id)


  // Start replay automatically for finished races
  useEffect(() => {
    if (!isAnimating && race.results && !isReplaying && !replayFinished) {
      setIsReplaying(true)
    }
  }, [isAnimating, race.results, isReplaying, replayFinished])

  useEffect(() => {
    const shouldAnimate = isAnimating || isReplaying

    if (!shouldAnimate) {
      // Show final positions based on results
      if (race.results && replayFinished) {
        const finalProgress: Record<string, number> = {}
        race.horses.forEach(h => {
          const position = race.results!.indexOf(h.id)
          if (position === 0) finalProgress[h.id] = 100
          else if (position === 1) finalProgress[h.id] = 95
          else if (position === 2) finalProgress[h.id] = 90
          else finalProgress[h.id] = 70 + Math.random() * 15
        })
        setProgress(finalProgress)
      }
      return
    }

    // Calculate target speeds based on results (works for both live and replay now)
    // Ensure all horses finish, with appropriate gaps based on placement
    const targetSpeeds: Record<string, number> = {}
    if (race.results) {
      race.horses.forEach(h => {
        const position = race.results!.indexOf(h.id)
        // Winner is fastest, others progressively slower but all will finish
        if (position === 0) targetSpeeds[h.id] = 2.0
        else if (position === 1) targetSpeeds[h.id] = 1.85
        else if (position === 2) targetSpeeds[h.id] = 1.7
        else targetSpeeds[h.id] = 1.4 + (race.horses.length - position) * 0.05
      })
    }

    // Animate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const next: Record<string, number> = {}
        let allFinished = true

        race.horses.forEach(h => {
          const current = prev[h.id] || 0
          // Use predetermined speeds based on results (now available for live races too)
          const baseSpeed = targetSpeeds[h.id] || 1.8
          const speed = baseSpeed + (Math.random() * 0.2 - 0.1)
          next[h.id] = Math.min(current + speed, 100)

          if (next[h.id] < 100) allFinished = false

          // Track when horses cross the finish line
          if (current < 100 && next[h.id] >= 100) {
            setFinishOrder(order => order.includes(h.id) ? order : [...order, h.id])
          }
        })

        // End replay only after ALL horses have crossed the finish line
        if (allFinished && isReplaying) {
          setTimeout(() => {
            setIsReplaying(false)
            setReplayFinished(true)
          }, 500) // Small delay after last horse finishes
        }

        return next
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isAnimating, isReplaying, race, replayFinished])

  const showingAnimation = isAnimating || isReplaying


  return (
    <div className="fixed inset-0 bg-background flex flex-col z-50">
      <header className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">Race {race.number}</h1>
            <p className="text-xs text-muted-foreground">{race.distance}</p>
          </div>
          {showingAnimation ? (
            <Badge variant="destructive" className="animate-pulse">
              {isReplaying ? 'REPLAY' : 'LIVE'}
            </Badge>
          ) : (
            <Badge variant="secondary">FINISHED</Badge>
          )}
        </div>
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Back to Races
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setProgress({})
              setFinishOrder([])
              setReplayFinished(false)
              setIsReplaying(true)
            }}
            disabled={showingAnimation}
          >
            Watch Replay
          </Button>
        </div>
      </header>


      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {race.horses.map(horse => {
          const horseProgress = progress[horse.id] || 0

          // Use actual finish order for placement (tracks when horses visually cross the line)
          const placement = finishOrder.indexOf(horse.id)
          const hasFinished = placement >= 0

          return (
            <div key={horse.id} className="flex items-center">
              {/* Horse number badge */}
              <div
                className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mr-2"
                style={{ backgroundColor: horse.color }}
              >
                {horse.number}
              </div>

              {/* Progress bar track - no gap to finish line */}
              <div className="flex-1 h-3 bg-muted rounded-l-full overflow-hidden">
                <div
                  className="h-full transition-all duration-100 rounded-l-full"
                  style={{
                    width: `${horseProgress}%`,
                    backgroundColor: horse.color,
                  }}
                />
              </div>

              {/* Finish line - directly adjacent to progress bar */}
              <div className="w-0.5 h-5 bg-foreground flex-shrink-0" />

              {/* Results area */}
              <div className="w-12 flex-shrink-0 flex justify-center ml-1">
                {hasFinished && placement < 3 ? (
                  <Badge
                    variant={placement === 0 ? "default" : "secondary"}
                    className={cn(
                      "text-xs",
                      placement === 0 && "bg-yellow-500 hover:bg-yellow-500"
                    )}
                  >
                    {placement === 0 ? '1st' : placement === 1 ? '2nd' : '3rd'}
                  </Badge>
                ) : hasFinished ? (
                  <span className="text-xs text-muted-foreground">{placement + 1}th</span>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {/* Your Bets for this race */}
      {raceBets.length > 0 && (
        <div className="border-t p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Your Bets</h3>
          {/* Each bet is ~70px tall + 8px gap. Show 3 full + peek of 4th */}
          <div
            className={cn(
              "space-y-2",
              raceBets.length > 3 && "max-h-[270px] overflow-y-auto"
            )}
          >
            {[...raceBets]
              .sort((a, b) => {
                // Post-race: winners first, then by potential payout
                if (race.status === 'finished') {
                  if (a.status === 'won' && b.status !== 'won') return -1
                  if (b.status === 'won' && a.status !== 'won') return 1
                }
                // Then sort by potential payout (amount * multiplier), highest first
                const aPayoutPotential = a.amount * PAYOUT_MULTIPLIERS[a.betType]
                const bPayoutPotential = b.amount * PAYOUT_MULTIPLIERS[b.betType]
                return bPayoutPotential - aPayoutPotential
              })
              .map(bet => {
              const betTypeLabel = bet.betType.charAt(0).toUpperCase() + bet.betType.slice(1)
              const selectedHorses = bet.selections.map(id => race.horses.find(h => h.id === id))

              const isMultiPick = bet.selections.length > 1

              return (
                <div
                  key={bet.id}
                  className={cn(
                    "p-3 rounded-lg border",
                    bet.status === 'won' && "bg-green-500/10 border-green-500/30",
                    bet.status === 'lost' && "bg-red-500/10 border-red-500/30",
                    bet.status === 'active' && "bg-muted/50"
                  )}
                >
                  {/* Row 1: Bet type + status + amount */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{betTypeLabel}</span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          bet.status === 'won' && "bg-green-500 text-white",
                          bet.status === 'lost' && "bg-red-500 text-white"
                        )}
                      >
                        {bet.status === 'active' ? 'Active' : bet.status === 'won' ? 'Won' : 'Lost'}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">${bet.amount.toFixed(2)}</span>
                  </div>

                  {/* Row 2: Horse selections + payout */}
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1">
                      {isMultiPick ? (
                        // Multi-pick: just colored boxes with numbers
                        selectedHorses.map((horse, i) => (
                          <div key={horse?.id || i} className="flex items-center">
                            {i > 0 && (
                              <span className="text-muted-foreground text-xs mx-0.5">→</span>
                            )}
                            <div
                              className="w-5 h-5 rounded text-[11px] flex items-center justify-center text-white font-semibold"
                              style={{ backgroundColor: horse?.color }}
                            >
                              {horse?.number}
                            </div>
                          </div>
                        ))
                      ) : (
                        // Single pick: colored box + name
                        selectedHorses.map((horse) => (
                          <div key={horse?.id} className="flex items-center gap-1.5">
                            <div
                              className="w-5 h-5 rounded text-[11px] flex items-center justify-center text-white font-semibold"
                              style={{ backgroundColor: horse?.color }}
                            >
                              {horse?.number}
                            </div>
                            <span className="text-sm text-muted-foreground">{horse?.name}</span>
                          </div>
                        ))
                      )}
                    </div>
                    {bet.status === 'won' && bet.payout && (
                      <span className="text-sm text-green-500 font-medium">+${bet.payout.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
