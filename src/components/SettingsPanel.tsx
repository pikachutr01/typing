import { RotateCcw, Square, BarChart2, Clock } from 'lucide-react'
import type { DurationMinutes, TestStatus, TypingText } from '../types/typing'
import { ThemeToggle } from './ThemeToggle'
import { motion, AnimatePresence } from 'framer-motion'

type SettingsPanelProps = {
  texts: TypingText[]
  selectedTextId: string
  durationMinutes: DurationMinutes
  status: TestStatus
  onTextChange: (textId: string) => void
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
}

const durations: DurationMinutes[] = [1, 3, 5, 7, 10]
const controlClassName =
  'h-10 rounded-md border border-slate-300 bg-white px-3 text-slate-800 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-teal-500 dark:focus:ring-teal-500/30 dark:disabled:bg-slate-800 dark:disabled:text-slate-500'

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
}: SettingsPanelProps) {
  const isRunning = status === 'running'

  const formattedRemainingTime = `${Math.floor(remainingSeconds / 60)}:${String(
    remainingSeconds % 60,
  ).padStart(2, '0')}`

  return (
    <section className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 shadow-sm backdrop-blur transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950/95 overflow-hidden">
      <div className="mx-auto flex flex-wrap w-full max-w-7xl items-end gap-3 px-4 py-3 sm:px-6 lg:px-8">
        
        <AnimatePresence>
          {!isZenMode && (
            <motion.div 
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: 0 }}
              exit={{ height: 0, opacity: 0, marginTop: -8 }}
              className="flex flex-wrap w-full lg:w-auto items-end gap-3 overflow-hidden"
            >
              <label className="grid gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                Kategori
                <select
                  className={controlClassName}
                  value={selectedCategory}
                  disabled={isRunning}
                  onChange={(event) => onCategoryChange(event.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 flex-1 min-w-[200px]">
                Metin
                <select
                  className={controlClassName}
                  value={selectedTextId}
                  disabled={isRunning}
                  onChange={(event) => onTextChange(event.target.value)}
                >
                  {texts.map((text) => (
                    <option key={text.id} value={text.id}>
                      {text.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                Süre
                <select
                  className={controlClassName}
                  value={durationMinutes}
                  disabled={isRunning}
                  onChange={(event) =>
                    onDurationChange(Number(event.target.value) as DurationMinutes)
                  }
                >
                  {durations.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration} dk
                    </option>
                  ))}
                </select>
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-1 justify-end items-center gap-2">
          {/* Zen Mode Timer */}
          <AnimatePresence>
            {isZenMode && (
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
          {hasHistory && !isRunning && (
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
          <ThemeToggle />
        </div>
      </div>
    </section>
  )
}
