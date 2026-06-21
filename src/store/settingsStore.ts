import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  fontSizeDelta: number
  setFontSizeDelta: (delta: number | ((prev: number) => number)) => void
  resetFontSizeDelta: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fontSizeDelta: 0,
      setFontSizeDelta: (delta) => set((state) => ({
        fontSizeDelta: typeof delta === 'function' ? delta(state.fontSizeDelta) : delta
      })),
      resetFontSizeDelta: () => set({ fontSizeDelta: 0 }),
    }),
    {
      name: 'typing-settings-storage',
    }
  )
)
