'use client'

import { useState } from 'react'
import { useGame } from '@/lib/game-context'
import { Bet } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Tab = 'active' | 'past'

export default function MyBetsPage() {
  const { bets, races } = useGame()
  const [tab, setTab] = useState<Tab>('active')

  const activeBets = bets.filter(b => b.status === 'active')
  const pastBets = bets.filter(b => b.status !== 'active')

  const displayBets = tab === 'active' ? activeBets : pastBets

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="p-4 border-b">
        <h1 className="text-lg font-bold">My Bets</h1>
      </header>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setTab('active')}
          className={cn(
            "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
            tab === 'active'
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          )}
        >
          Active ({activeBets.length})
        </button>
        <button
          onClick={() => setTab('past')}
          className={cn(
            "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
            tab === 'past'
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          )}
        >
          Past ({pastBets.length})
        </button>
      </div>

      {/* Bet List */}
      <div className="flex-1 overflow-y-auto">
        {displayBets.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            No {tab} bets
          </div>
        ) : (
          displayBets.map(bet => (
            <BetCard key={bet.id} bet={bet} races={races} />
          ))
        )}
      </div>
    </div>
  )
}

function BetCard({ bet, races }: { bet: Bet; races: typeof import('@/lib/store').store extends { getRaces: () => infer R } ? R : never }) {
  const race = races.find(r => r.id === bet.raceId)

  const statusColor = {
    active: 'bg-blue-500',
    won: 'bg-green-500',
    lost: 'bg-red-500',
  }

  return (
    <div className="p-4 border-b">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold capitalize">{bet.betType}</p>
          <p className="text-sm text-muted-foreground">
            Race {bet.raceNumber}
          </p>
        </div>
        <Badge className={cn(statusColor[bet.status], 'text-white capitalize')}>
          {bet.status}
        </Badge>
      </div>

      <div className="text-sm space-y-1 mb-2">
        {bet.selections.map((id, i) => {
          const horse = race?.horses.find(h => h.id === id)
          return (
            <p key={id} className="text-muted-foreground">
              {bet.selections.length > 1 && `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : 'rd'}: `}
              {horse?.name || 'Unknown Horse'}
            </p>
          )
        })}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Wagered: ${bet.amount.toFixed(2)}
        </span>
        {bet.status === 'won' && bet.payout && (
          <span className="text-green-500 font-semibold">
            Won: ${bet.payout.toFixed(2)}
          </span>
        )}
        {bet.status === 'lost' && (
          <span className="text-red-500 font-semibold">
            Lost
          </span>
        )}
      </div>
    </div>
  )
}
