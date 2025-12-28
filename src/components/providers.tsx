'use client'

import { GameProvider } from '@/lib/game-context'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GameProvider>
      {children}
    </GameProvider>
  )
}
