import { RotateCcw, Square, BarChart2, Clock, Settings, Plus, Minus, Shield, LogOut, ChevronLeft, ChevronRight, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import type { DurationMinutes, TestStatus, TypingText } from '../types/typing'
import { ThemeToggle } from './ThemeToggle'
import { motion, AnimatePresence } from 'framer-motion'
import { CustomSelect } from './CustomSelect'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'
import React, { useMemo, useState } from 'react'
import { ConfirmationDialog } from './ConfirmationDialog'

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
  isMobile?: boolean
  hasPrevText?: boolean
  hasNextText?: boolean
  onPrevText?: () => void
  onNextText?: () => void
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
  isMobile = false,
  hasPrevText = false,
  hasNextText = false,
  onPrevText,
  onNextText,
}: SettingsPanelProps) {
  const isRunning = status === 'running'
  const { user, logout } = useAuthStore()
  const { fontSizeDelta, setFontSizeDelta, resetFontSizeDelta, isColorWarningEnabled, toggleColorWarningEnabled } = useSettingsStore()

  const [isSelectExited, setIsSelectExited] = useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)

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
      <div className="mx-auto flex flex-wrap w-full max-w-[90rem] items-end gap-3 px-4 py-3 sm:px-6 lg:px-8">
        
        <AnimatePresence onExitComplete={() => setIsSelectExited(true)}>
          {!isZenMode && (
            <motion.div 
              initial={{ height: 0, opacity: 0, marginTop: 0, overflow: 'hidden' }}
              animate={{ height: 'auto', opacity: 1, marginTop: 0, overflow: 'visible' }}
              exit={{ height: 0, opacity: 0, marginTop: -8, overflow: 'hidden' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-1 flex-wrap items-end gap-4"
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

              <div className="grid gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 w-full sm:w-[150px]">
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
                <div className="flex items-center gap-1">
                  <div className="flex-1">
                    <CustomSelect
                      value={durationOptions.find(o => o.value === durationMinutes) || null}
                      options={durationOptions}
                      isDisabled={isRunning}
                      onChange={(option) => {
                        if (option) onDurationChange(Number(option.value) as DurationMinutes)
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md p-0.5 h-[38px]">
                    <button
                      type="button"
                      disabled={isRunning || !hasPrevText}
                      onClick={onPrevText}
                      className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Önceki Metin"
                    >
                      <ChevronLeft size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      disabled={isRunning || !hasNextText}
                      onClick={onNextText}
                      className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Sonraki Metin"
                    >
                      <ChevronRight size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex w-full lg:w-auto flex-1 justify-end items-center gap-2 flex-wrap">
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

          {isRunning && !isMobile && (
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
          {!isMobile && (
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500/25 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-slate-500/30"
              onClick={onReset}
            >
              <RotateCcw size={17} />
              Sıfırla
            </button>
          )}
          
          {!isZenMode && !user && (
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
          )}

          <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800" title="Ayarlar">
              <span className="sr-only">Ayarlar</span>
              <Settings className="h-5 w-5" />
            </MenuButton>

            <MenuItems
              transition
              className="absolute right-0 z-30 mt-2 w-64 origin-top-right rounded-md border border-slate-200 bg-white p-2 shadow-lg outline-none transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Yazı Boyutu
              </div>
              <div className="mt-1 flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 p-1 dark:border-slate-700/50 dark:bg-slate-900">
                <button
                  onClick={() => setFontSizeDelta((d) => Math.max(-8, d - 2))}
                  className="rounded-md p-1.5 text-slate-700 shadow-sm hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800"
                  title="Küçült"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => resetFontSizeDelta()}
                  className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  title="Varsayılana Dön"
                >
                  {fontSizeDelta > 0 ? `+${fontSizeDelta}` : fontSizeDelta}
                </button>
                <button
                  onClick={() => setFontSizeDelta((d) => Math.min(24, d + 2))}
                  className="rounded-md p-1.5 text-slate-700 shadow-sm hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800"
                  title="Büyüt"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="my-2 border-t border-slate-100 dark:border-slate-700/50"></div>

              <div className="flex items-center justify-between px-2 py-1.5">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Süre Uyarısı</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Son 10 saniye</span>
                </div>
                <button
                  role="switch"
                  aria-checked={isColorWarningEnabled}
                  onClick={() => toggleColorWarningEnabled()}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 ${isColorWarningEnabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isColorWarningEnabled ? 'translate-x-4' : 'translate-x-0'}`}
                  />
                </button>
              </div>
              
              {user && (
                <>
                  <div className="my-2 border-t border-slate-100 dark:border-slate-700/50"></div>
                  <div className="px-2 py-1.5 flex flex-col gap-2">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
                      KULLANICI: <span className="text-slate-700 dark:text-slate-300">{user.username}</span>
                    </div>
                    <MenuItem>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={`${
                            active ? 'bg-slate-100 dark:bg-slate-700/50 text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                          } flex items-center gap-3 w-full rounded-md px-2 py-2 text-sm font-medium transition-colors`}
                        >
                          <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          Profil & İstatistikler
                        </Link>
                      )}
                    </MenuItem>
                    {user.username === 'admin' && (
                      <MenuItem>
                        {({ active }) => (
                          <Link
                            to="/manage"
                            className={`${
                              active ? 'bg-slate-100 dark:bg-slate-700/50 text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                            } flex items-center gap-3 w-full rounded-md px-2 py-2 text-sm font-medium transition-colors`}
                          >
                            <Shield className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                            Yönetim Paneli
                          </Link>
                        )}
                      </MenuItem>
                    )}
                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={() => setIsLogoutConfirmOpen(true)}
                          className={`${
                            active ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'
                          } flex items-center gap-3 w-full rounded-md px-2 py-2 text-sm font-medium transition-colors text-left`}
                        >
                          <LogOut className="h-4 w-4" />
                          Çıkış Yap
                        </button>
                      )}
                    </MenuItem>
                  </div>
                </>
              )}
            </MenuItems>
          </Menu>

          <ThemeToggle />
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={logout}
        title="Çıkış Yap"
        message="Hesabınızdan çıkış yapmak istediğinize emin misiniz?"
        confirmText="Çıkış Yap"
        cancelText="Vazgeç"
      />
    </section>
  )
}
