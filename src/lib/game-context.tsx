'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { store, Race, Bet, BetType } from './store'

interface GameState {
  races: Race[]
  bets: Bet[]
  balance: number
  currentRaceAnimation: string | null // race ID being animated
}

interface GameContextType extends GameState {
  placeBet: (raceId: string, raceNumber: number, betType: BetType, selections: string[], amount: number) => boolean
  startRace: (raceId: string) => void
  isRaceAnimating: (raceId: string) => boolean
}

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>({
    races: store.getRaces(),
    bets: store.getBets(),
    balance: store.getBalance(),
    currentRaceAnimation: null,
  })

  const refreshState = useCallback(() => {
    setState(prev => ({
      ...prev,
      races: store.getRaces(),
      bets: store.getBets(),
      balance: store.getBalance(),
    }))
  }, [])

  const placeBet = useCallback((
    raceId: string,
    raceNumber: number,
    betType: BetType,
    selections: string[],
    amount: number
  ) => {
    const bet = store.placeBet({ raceId, raceNumber, betType, selections, amount })
    if (bet) {
      refreshState()
      return true
    }
    return false
  }, [refreshState])

  const startRace = useCallback((raceId: string) => {
    const race = store.getRace(raceId)
    if (!race || race.status === 'finished') return

    // Set race to live
    setState(prev => ({
      ...prev,
      currentRaceAnimation: raceId,
    }))

    // Simulate race duration (5 seconds)
    setTimeout(() => {
      // Generate random results
      const horses = race.horses
      const shuffled = [...horses].sort(() => Math.random() - 0.5)
      const results = shuffled.slice(0, 3).map(h => h.id)

      // Finish race and settle bets
      store.finishRace(raceId, results)

      setState(prev => ({
        ...prev,
        currentRaceAnimation: null,
        races: store.getRaces(),
        bets: store.getBets(),
        balance: store.getBalance(),
      }))
    }, 5000)
  }, [])

  const isRaceAnimating = useCallback((raceId: string) => {
    return state.currentRaceAnimation === raceId
  }, [state.currentRaceAnimation])

  return (
    <GameContext.Provider value={{
      ...state,
      placeBet,
      startRace,
      isRaceAnimating,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
