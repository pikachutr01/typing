import { CalendarDays, Clock, X, BarChart2, Eye, ChevronLeft, Loader2 } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import type { TestHistoryEntry, DurationMinutes } from '../types/typing'
import { getReachedExpectedText } from '../utils/evaluateExamRules'
import { diffText } from '../utils/diffText'
import { DiffViewer } from './DiffViewer'
import { getTestHistoryDurations, getPaginatedTestHistory } from '../utils/history'

type HistoryModalProps = {
  isOpen: boolean
  onClose: () => void
  textId: string | number | undefined
  textTitle?: string
}

const LIMIT = 20

export function HistoryModal({ isOpen, onClose, textId, textTitle }: HistoryModalProps) {
  const [selectedEntry, setSelectedEntry] = useState<TestHistoryEntry | null>(null)

  const [durations, setDurations] = useState<number[]>([])
  const [isDurationsLoading, setIsDurationsLoading] = useState(true)
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
  const [historyItems, setHistoryItems] = useState<TestHistoryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  useEffect(() => {
    if (isOpen && textId) {
      // Veri çekme başlamadan önce loading durumunu hemen göstermek için
      // kasıtlı senkron setState. Async .then() içindeki çağrılar zaten
      // mikrotask kuyruğunda, sorun değil.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDurationsLoading(true)
      getTestHistoryDurations(textId).then(durs => {
        setDurations(durs)
        if (durs.length > 0) {
          setSelectedDuration(durs[0])
        }
        setIsDurationsLoading(false)
      })
    } else {
      setDurations([])
      setIsDurationsLoading(true)
      setSelectedDuration(null)
      setHistoryItems([])
      setPage(0)
      setHasMore(true)
      setSelectedEntry(null)
    }
  }, [isOpen, textId])

  useEffect(() => {
    if (isOpen && textId && selectedDuration !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true)
      getPaginatedTestHistory(textId, selectedDuration as DurationMinutes, LIMIT, page * LIMIT).then(items => {
        if (page === 0) {
          setHistoryItems(items)
        } else {
          setHistoryItems(prev => [...prev, ...items])
        }
        if (items.length < LIMIT) {
          setHasMore(false)
        }
        setLoading(false)
      })
    }
  }, [selectedDuration, page, isOpen, textId])

  const handleDurationChange = (d: number) => {
    if (d === selectedDuration) return
    setSelectedDuration(d)
    setPage(0)
    setHasMore(true)
    setHistoryItems([])
    setSelectedEntry(null)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (selectedEntry) return // Don't infinite scroll when viewing diff
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop <= clientHeight + 100 && !loading && hasMore) {
      setPage(p => p + 1)
    }
  }

  const diffSegments = useMemo(() => {
    if (!selectedEntry) return []
    const evaluatedTargetText = getReachedExpectedText(
      selectedEntry.originalText,
      selectedEntry.inputValue
    )
    return diffText(evaluatedTargetText, selectedEntry.inputValue)
  }, [selectedEntry])

  if (!isOpen) {
    return null
  }

  const handleClose = () => {
    setSelectedEntry(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Main Modal */}
      <div className="relative flex min-h-[500px] sm:min-h-[600px] max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-slate-50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 dark:bg-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
            {selectedEntry ? (
              <button
                onClick={() => setSelectedEntry(null)}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <ChevronLeft size={20} />
              </button>
            ) : (
              <div className="rounded-lg bg-teal-50 p-2 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                <BarChart2 size={24} />
              </div>
            )}
            <h2 className="text-xl font-bold flex items-center gap-2">
              {selectedEntry ? (
                'Sınav Detayı'
              ) : textTitle ? (
                <span className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  {textTitle}
                </span>
              ) : (
                'Geçmiş Performanslar'
              )}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        {!selectedEntry && durations.length > 0 && (
          <div className="flex gap-2 px-6 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 shrink-0 overflow-x-auto">
            {durations.map(d => (
              <button
                key={d}
                onClick={() => handleDurationChange(d)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
                  selectedDuration === d 
                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700'
                }`}
              >
                {d} Dakika
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6" onScroll={handleScroll}>
          {isDurationsLoading || (loading && historyItems.length === 0) ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 size={48} className="animate-spin mb-4 text-teal-500" />
              <p className="text-lg">Kayıtlar yükleniyor...</p>
            </div>
          ) : selectedEntry ? (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-4">
                <div className="rounded-md border border-slate-200 bg-white p-3 sm:p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-center">
                  <div className="text-[11px] sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Doğru kelime</div>
                  <div className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-500">{selectedEntry.correctWords}</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-3 sm:p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-center">
                  <div className="text-[11px] sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Kelime hatası</div>
                  <div className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold text-red-500 dark:text-red-400">{selectedEntry.wordErrorCount}</div>
                  <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500">{selectedEntry.extraSpaceErrors} fazla boşluk</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-3 sm:p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-center">
                  <div className="text-[11px] sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Atlanan kelime</div>
                  <div className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold text-orange-500 dark:text-orange-400">{selectedEntry.skippedWords}</div>
                  {selectedEntry.isFailedBySkippedWords && (
                    <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-red-500 font-semibold leading-tight">22+ atlama:<br className="sm:hidden" /> başarısız</div>
                  )}
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-3 sm:p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-center">
                  <div className="text-[11px] sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Tuş vuruşu</div>
                  <div className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">{selectedEntry.totalKeystrokes}</div>
                  <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500">{selectedEntry.keystrokesPerMinute != null ? Number(selectedEntry.keystrokesPerMinute).toFixed(1) : '-'} vuruş/dk</div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800/50 dark:bg-slate-900/50">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200">Metin Analizi</h3>
                </div>
                <div className="p-4">
                  <DiffViewer segments={diffSegments} />
                </div>
              </div>
            </div>
          ) : durations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
              <BarChart2 size={48} className="mb-4 opacity-20" />
              <p className="text-lg">Henüz bu metin için geçmiş kayıt bulunmuyor.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {historyItems.map((entry, index) => {
                const date = new Date(entry.date)
                const formattedDate = date.toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })
                const formattedTime = date.toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })

                return (
                  <div
                    key={index}
                    className="flex w-full flex-col sm:flex-row overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-teal-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-800"
                  >
                    {/* Left: Info */}
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays size={14} className="text-slate-400 dark:text-slate-500" />
                            <span>{formattedDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-slate-400 dark:text-slate-500" />
                            <span>{formattedTime}</span>
                          </div>
                        </div>
                        {entry.isFailedBySkippedWords && (
                          <div className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            BAŞARISIZ
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Doğru Kelime</span>
                          <span className="text-xl font-extrabold text-teal-600 dark:text-teal-500">{entry.correctWords}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Hata/Atlanan</span>
                          <span className="text-xl font-bold text-red-500 dark:text-red-400">{entry.wordErrorCount} / {entry.skippedWords}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Doğruluk</span>
                          <span className="text-xl font-bold text-slate-700 dark:text-slate-300">%{entry.accuracy}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Hız (Vuruş/Dk)</span>
                          <span className="text-xl font-bold text-slate-700 dark:text-slate-300">{entry.keystrokesPerMinute != null ? Number(entry.keystrokesPerMinute).toFixed(0) : '-'}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                        <span>Doğru Harf: <strong>{entry.correctChars}</strong></span>
                        <span>Yanlış Harf: <strong>{entry.incorrectChars}</strong></span>
                        <span>Eksik Harf: <strong>{entry.missedChars}</strong></span>
                        <span>Fazla Harf: <strong>{entry.extraChars}</strong></span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center justify-center bg-slate-50 p-4 border-t sm:border-t-0 sm:border-l border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-teal-600 shadow-sm border border-slate-200 transition-all hover:bg-teal-50 hover:border-teal-300 dark:bg-slate-800 dark:border-slate-700 dark:text-teal-400 dark:hover:bg-slate-800/80 dark:hover:border-teal-600 w-full justify-center"
                      >
                        <Eye size={16} />
                        Detaylı İncele
                      </button>
                    </div>
                  </div>
                )
              })}
              
              {loading && (
                <div className="flex justify-center p-4">
                  <Loader2 size={24} className="animate-spin text-teal-500" />
                </div>
              )}
              
              {!loading && !hasMore && historyItems.length > 0 && (
                <div className="text-center p-4 text-sm text-slate-500 dark:text-slate-400">
                  Tüm kayıtlar yüklendi.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
