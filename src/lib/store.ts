// In-memory store for POC
// Will be replaced with Supabase for real MVP

export type BetType = 'win' | 'place' | 'show' | 'exacta' | 'trifecta'

export type RaceStatus = 'upcoming' | 'live' | 'finished'

export interface Horse {
  id: string
  number: number
  name: string
  jockey: string
  odds: string
  color: string
}

export interface Race {
  id: string
  number: number
  status: RaceStatus
  minutesToPost: number
  distance: string
  horses: Horse[]
  results?: string[] // horse IDs in finish order
}

export interface Bet {
  id: string
  raceId: string
  raceNumber: number
  betType: BetType
  selections: string[] // horse IDs
  amount: number
  timestamp: Date
  status: 'active' | 'won' | 'lost'
  payout?: number
}

// Mock data
const HORSE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']

const HORSE_NAMES = [
  'Thunderbolt', 'Midnight Star', 'Galloping Gus', 'Speedy G',
  'Old Bessie', 'Rocket Man', 'Lucky Charm', 'Ghost Rider',
  'Wild Spirit', 'Storm Chaser', 'Golden Arrow', 'Dark Knight'
]

const JOCKEY_NAMES = [
  'J. Smith', 'M. Garcia', 'R. Jones', 'L. Davis',
  'K. Wilson', 'T. Brown', 'A. Miller', 'P. Moore'
]

function generateHorses(count: number): Horse[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `horse-${i + 1}`,
    number: i + 1,
    name: HORSE_NAMES[i % HORSE_NAMES.length],
    jockey: JOCKEY_NAMES[i % JOCKEY_NAMES.length],
    odds: ['2-1', '5-1', '10-1', '7-2', '50-1', '3-1', '15-1', '8-1'][i % 8],
    color: HORSE_COLORS[i % HORSE_COLORS.length]
  }))
}

// Initial mock races for today
function createInitialRaces(): Race[] {
  return [
    { id: 'race-1', number: 1, status: 'live', minutesToPost: 0, distance: '6 Furlongs', horses: generateHorses(8) },
    { id: 'race-2', number: 2, status: 'upcoming', minutesToPost: 15, distance: '1 Mile', horses: generateHorses(8) },
    { id: 'race-3', number: 3, status: 'upcoming', minutesToPost: 30, distance: '6 Furlongs', horses: generateHorses(6) },
    { id: 'race-4', number: 4, status: 'upcoming', minutesToPost: 45, distance: '1 1/8 Miles', horses: generateHorses(8) },
    { id: 'race-5', number: 5, status: 'upcoming', minutesToPost: 60, distance: '7 Furlongs', horses: generateHorses(7) },
    { id: 'race-6', number: 6, status: 'upcoming', minutesToPost: 75, distance: '1 Mile', horses: generateHorses(8) },
  ]
}

// In-memory state
let races: Race[] = createInitialRaces()
let bets: Bet[] = []
let balance: number = 1000 // Starting balance

// Store functions
export const store = {
  // Races
  getRaces: () => races,
  getRace: (id: string) => races.find(r => r.id === id),

  // Balance
  getBalance: () => balance,

  // Bets
  getBets: () => bets,
  getActiveBets: () => bets.filter(b => b.status === 'active'),
  getPastBets: () => bets.filter(b => b.status !== 'active'),

  placeBet: (bet: Omit<Bet, 'id' | 'timestamp' | 'status'>): Bet | null => {
    if (bet.amount > balance) return null

    const newBet: Bet = {
      ...bet,
      id: `bet-${Date.now()}`,
      timestamp: new Date(),
      status: 'active'
    }

    bets = [...bets, newBet]
    balance -= bet.amount

    return newBet
  },

  // Set results when race starts (for animation), but keep status as live
  setRaceResults: (raceId: string, results: string[]) => {
    races = races.map(r =>
      r.id === raceId
        ? { ...r, status: 'live' as RaceStatus, results }
        : r
    )
  },

  // For simulating race results
  finishRace: (raceId: string) => {
    races = races.map(r =>
      r.id === raceId
        ? { ...r, status: 'finished' as RaceStatus }
        : r
    )

    const race = races.find(r => r.id === raceId)
    if (!race?.results) return

    const results = race.results

    // Settle bets for this race
    bets = bets.map(bet => {
      if (bet.raceId !== raceId || bet.status !== 'active') return bet

      const won = checkBetWon(bet, results)
      const payout = won ? calculatePayout(bet) : 0

      if (won) {
        balance += payout
      }

      return { ...bet, status: won ? 'won' : 'lost', payout }
    })
  },

  // Reset everything for dev/testing
  reset: () => {
    races = createInitialRaces()
    bets = []
    balance = 1000
  }
}

function checkBetWon(bet: Bet, results: string[]): boolean {
  switch (bet.betType) {
    case 'win':
      return bet.selections[0] === results[0]
    case 'place':
      return results.slice(0, 2).includes(bet.selections[0])
    case 'show':
      return results.slice(0, 3).includes(bet.selections[0])
    case 'exacta':
      return bet.selections[0] === results[0] && bet.selections[1] === results[1]
    case 'trifecta':
      return bet.selections[0] === results[0] &&
             bet.selections[1] === results[1] &&
             bet.selections[2] === results[2]
    default:
      return false
  }
}

function calculatePayout(bet: Bet): number {
  // Simplified payout calculation for POC
  const multipliers: Record<BetType, number> = {
    win: 5,
    place: 2.5,
    show: 1.5,
    exacta: 25,
    trifecta: 100
  }
  return bet.amount * multipliers[bet.betType]
}
