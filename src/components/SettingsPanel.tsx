import { RotateCcw, Square, BarChart2, Clock } from 'lucide-react'
import type { DurationMinutes, TestStatus, TypingText } from '../types/typing'
import { ThemeToggle } from './ThemeToggle'
import { motion, AnimatePresence } from 'framer-motion'
import { CustomSelect } from './CustomSelect'
import { useAuthStore } from '../store/authStore'
import React, { useMemo, useState } from 'react'

type SettingsPanelProps = {
  texts: TypingText[]
  selectedTextId: string | number
  durationMinutes: DurationMinutes
  status: TestStatus
  onTextChange: (textId: string | number) => void
  onDurationChange: (duration: DurationMinutes) => void
  onReset: () => void
  onFinish: () => void
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  hasHistory: boolean
  onShowHistory: () => void
  isZenMode?: boolean
  remainingSeconds?: number
  onLoginClick?: () => void
}

const durations: DurationMinutes[] = [1, 3, 5, 7, 10]

export function SettingsPanel({
  texts,
  selectedTextId,
  durationMinutes,
  status,
  onTextChange,
  onDurationChange,
  onReset,
  onFinish,
  categories,
  selectedCategory,
  onCategoryChange,
  hasHistory,
  onShowHistory,
  isZenMode = false,
  remainingSeconds = 0,
  onLoginClick,
}: SettingsPanelProps) {
  const isRunning = status === 'running'
  const { user, logout } = useAuthStore()

  const [isSelectExited, setIsSelectExited] = useState(false)

  React.useEffect(() => {
    if (!isZenMode) {
      setIsSelectExited(false)
    }
  }, [isZenMode])

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c, label: c })),
    [categories]
  )
  const textOptions = useMemo(
    () => texts.map((t) => ({ value: t.id, label: t.title })),
    [texts]
  )
  const durationOptions = useMemo(
    () => durations.map((d) => ({ value: d, label: `${d} dk` })),
    []
  )

  const formattedRemainingTime = `${Math.floor(remainingSeconds / 60)}:${String(
    remainingSeconds % 60,
  ).padStart(2, '0')}`

  return (
    <section className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 shadow-sm backdrop-blur transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex flex-wrap w-full max-w-7xl items-end gap-3 px-4 py-3 sm:px-6 lg:px-8">
        
        <AnimatePresence onExitComplete={() => setIsSelectExited(true)}>
          {!isZenMode && (
            <motion.div 
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: 0 }}
              exit={{ height: 0, opacity: 0, marginTop: -8 }}
              className="flex flex-wrap w-full lg:w-auto items-end gap-3"
            >
              <div className="grid gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 min-w-[150px]">
                <span>Kategori</span>
                <CustomSelect
                  value={categoryOptions.find(o => o.value === selectedCategory) || null}
                  options={categoryOptions}
                  isDisabled={isRunning}
                  onChange={(option) => {
                    if (option) onCategoryChange(option.value as string)
                  }}
                />
              </div>

              <div className="grid gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 flex-1 min-w-[250px]">
                <span>Metin</span>
                <CustomSelect
                  value={textOptions.find(o => o.value === selectedTextId) || null}
                  options={textOptions}
                  isDisabled={isRunning}
                  onChange={(option) => {
                    if (option) onTextChange(option.value as string | number)
                  }}
                />
              </div>

              <div className="grid gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 min-w-[120px]">
                <span>Süre</span>
                <CustomSelect
                  value={durationOptions.find(o => o.value === durationMinutes) || null}
                  options={durationOptions}
                  isDisabled={isRunning}
                  onChange={(option) => {
                    if (option) onDurationChange(Number(option.value) as DurationMinutes)
                  }}
                />
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-1 justify-end items-center gap-2">
          {/* Zen Mode Timer */}
          <AnimatePresence>
            {isZenMode && isSelectExited && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 mr-auto"
              >
                <div className="flex items-center gap-1.5 rounded-md bg-teal-100 px-3 py-1.5 text-sm font-bold text-teal-800 dark:bg-teal-900/50 dark:text-teal-300">
                  <Clock size={16} />
                  <span>{formattedRemainingTime}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isRunning && (
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-800 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/30 dark:bg-slate-700 dark:hover:bg-slate-600"
              onClick={onFinish}
            >
              <Square size={17} />
              Bitir
            </button>
          )}
          {!isZenMode && hasHistory && !isRunning && (
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-teal-200 bg-teal-50 px-4 text-sm font-semibold text-teal-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500/25 dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-400 dark:hover:bg-teal-900/50"
              onClick={onShowHistory}
            >
              <BarChart2 size={17} />
              Geçmişi Gör
            </button>
          )}
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500/25 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-slate-500/30"
            onClick={onReset}
          >
            <RotateCcw size={17} />
            Sıfırla
          </button>
          
          {!isZenMode && (
            user ? (
              <div className="flex items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-700 ml-1">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {user.username}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  disabled={isRunning}
                  className="flex h-10 items-center justify-center rounded-md bg-slate-200 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-300 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <div className="border-l border-slate-200 pl-3 dark:border-slate-700 ml-1">
                <button
                  type="button"
                  onClick={onLoginClick}
                  disabled={isRunning}
                  className="flex h-10 items-center justify-center rounded-md bg-teal-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-50 dark:bg-teal-600 dark:hover:bg-teal-500"
                >
                  Giriş Yap
                </button>
              </div>
            )
          )}

          <ThemeToggle />
        </div>
      </div>
    </section>
  )
}
