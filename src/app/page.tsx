'use client'

import { useGame } from '@/lib/game-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HomePage() {
  const { balance, bets, races } = useGame()
  const activeBets = bets.filter(b => b.status === 'active')
  const liveRace = races.find(r => r.status === 'live')
  const nextRace = races.find(r => r.status === 'upcoming')

  return (
    <div className="p-4 space-y-6">
      <header className="text-center pt-4">
        <h1 className="text-6xl font-logo">Horsie Downs</h1>
        <p className="text-muted-foreground text-sm">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
          })}
        </p>
      </header>

      <div className="bg-card rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">Your Balance</p>
        <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
      </div>

      {liveRace && (
        <div className="bg-card rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-red-500">LIVE</span>
          </div>
          <p className="font-semibold">Race {liveRace.number}</p>
          <p className="text-sm text-muted-foreground">{liveRace.distance}</p>
          <Link href="/races">
            <Button className="w-full mt-3" size="sm">Watch Live</Button>
          </Link>
        </div>
      )}

      {nextRace && (
        <div className="bg-card rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Up Next</p>
          <p className="font-semibold">Race {nextRace.number}</p>
          <p className="text-sm text-muted-foreground">
            {nextRace.minutesToPost} mins to post - {nextRace.distance}
          </p>
          <Link href="/races">
            <Button variant="outline" className="w-full mt-3" size="sm">
              View & Bet
            </Button>
          </Link>
        </div>
      )}

      {activeBets.length > 0 && (
        <div className="bg-card rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Active Bets</p>
          <p className="text-2xl font-bold">{activeBets.length}</p>
          <Link href="/my-bets">
            <Button variant="ghost" className="w-full mt-2" size="sm">
              View My Bets
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
