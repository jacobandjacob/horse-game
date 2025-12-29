'use client'

import { useState } from 'react'
import { useGame } from '@/lib/game-context'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'

type TimePeriod = 'week' | 'season' | 'allTime'

interface PlayerStats {
  name: string
  winnings: number
  wins: number
  losses: number
  totalBets: number
}

const leaderboardData: Record<TimePeriod, PlayerStats[]> = {
  week: [
    { name: 'GoodGreif', winnings: 847.50, wins: 12, losses: 8, totalBets: 20 },
    { name: 'Ydan', winnings: 623.00, wins: 9, losses: 6, totalBets: 15 },
    { name: 'adwawg', winnings: 412.25, wins: 7, losses: 11, totalBets: 18 },
    { name: 'benji', winnings: 89.00, wins: 4, losses: 9, totalBets: 13 },
    { name: 'chuckyM', winnings: -156.50, wins: 2, losses: 12, totalBets: 14 },
  ],
  season: [
    { name: 'Ydan', winnings: 4892.75, wins: 67, losses: 43, totalBets: 110 },
    { name: 'GoodGreif', winnings: 3241.00, wins: 58, losses: 52, totalBets: 110 },
    { name: 'chuckyM', winnings: 2156.50, wins: 49, losses: 41, totalBets: 90 },
    { name: 'adwawg', winnings: 1834.25, wins: 44, losses: 56, totalBets: 100 },
    { name: 'benji', winnings: 967.00, wins: 31, losses: 49, totalBets: 80 },
  ],
  allTime: [
    { name: 'Ydan', winnings: 24567.00, wins: 312, losses: 198, totalBets: 510 },
    { name: 'chuckyM', winnings: 18934.50, wins: 287, losses: 223, totalBets: 510 },
    { name: 'GoodGreif', winnings: 12453.25, wins: 245, losses: 195, totalBets: 440 },
    { name: 'adwawg', winnings: 8721.75, wins: 198, losses: 232, totalBets: 430 },
    { name: 'benji', winnings: 3456.00, wins: 156, losses: 204, totalBets: 360 },
  ],
}

export default function HomePage() {
  const { balance, bets } = useGame()
  const activeBets = bets.filter(b => b.status === 'active')
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week')

  const players = leaderboardData[timePeriod]

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

      <div className="bg-card rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold">Leaderboard</p>
          <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="season">This Season</SelectItem>
              <SelectItem value="allTime">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {players.map((player, index) => (
            <div
              key={player.name}
              className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0 ? 'bg-yellow-500 text-yellow-950' :
                index === 1 ? 'bg-gray-300 text-gray-700' :
                index === 2 ? 'bg-amber-600 text-amber-950' :
                'bg-muted text-muted-foreground'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{player.name}</p>
                <p className="text-xs text-muted-foreground">
                  {player.wins}W - {player.losses}L · {player.totalBets} bets
                </p>
              </div>
              <div className={`text-right font-semibold ${
                player.winnings >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {player.winnings >= 0 ? '+' : ''}${player.winnings.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

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
