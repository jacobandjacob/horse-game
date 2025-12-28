'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { store, Race, Bet, BetType } from './store'

interface GameState {
  races: Race[]
  bets: Bet[]
  balance: number
  currentRaceAnimation: string | null // race ID being animated
  isFullScreen: boolean // hide bottom nav for immersive views
}

interface GameContextType extends GameState {
  placeBet: (raceId: string, raceNumber: number, betType: BetType, selections: string[], amount: number) => boolean
  startRace: (raceId: string) => void
  isRaceAnimating: (raceId: string) => boolean
  resetGame: () => void
  setFullScreen: (value: boolean) => void
}

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>({
    races: store.getRaces(),
    bets: store.getBets(),
    balance: store.getBalance(),
    currentRaceAnimation: null,
    isFullScreen: false,
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

    // Generate results upfront so animation can use them
    const horses = race.horses
    const shuffled = [...horses].sort(() => Math.random() - 0.5)
    const results = shuffled.map(h => h.id)

    // Set results immediately (keeps status as 'live')
    store.setRaceResults(raceId, results)

    // Set race to animating
    setState(prev => ({
      ...prev,
      currentRaceAnimation: raceId,
      races: store.getRaces(),
    }))

    // Simulate race duration (7 seconds to ensure animation completes first)
    setTimeout(() => {
      // Finish race and settle bets (uses the pre-set results)
      store.finishRace(raceId)

      setState(prev => ({
        ...prev,
        currentRaceAnimation: null,
        races: store.getRaces(),
        bets: store.getBets(),
        balance: store.getBalance(),
      }))
    }, 7000)
  }, [])

  const isRaceAnimating = useCallback((raceId: string) => {
    return state.currentRaceAnimation === raceId
  }, [state.currentRaceAnimation])

  const resetGame = useCallback(() => {
    store.reset()
    setState({
      races: store.getRaces(),
      bets: store.getBets(),
      balance: store.getBalance(),
      currentRaceAnimation: null,
      isFullScreen: false,
    })
  }, [])

  const setFullScreen = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, isFullScreen: value }))
  }, [])

  return (
    <GameContext.Provider value={{
      ...state,
      placeBet,
      startRace,
      isRaceAnimating,
      resetGame,
      setFullScreen,
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
