import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  fontSizeDelta: number
  isColorWarningEnabled: boolean
  setFontSizeDelta: (delta: number | ((prev: number) => number)) => void
  resetFontSizeDelta: () => void
  toggleColorWarningEnabled: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fontSizeDelta: 0,
      isColorWarningEnabled: true,
      setFontSizeDelta: (delta) => set((state) => ({
        fontSizeDelta: typeof delta === 'function' ? delta(state.fontSizeDelta) : delta
      })),
      resetFontSizeDelta: () => set({ fontSizeDelta: 0 }),
      toggleColorWarningEnabled: () => set((state) => ({ isColorWarningEnabled: !state.isColorWarningEnabled })),
    }),
    {
      name: 'typing-settings-storage',
    }
  )
)
