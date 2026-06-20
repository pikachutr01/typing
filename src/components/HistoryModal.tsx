import { CalendarDays, Clock, X, BarChart2 } from 'lucide-react'
import type { TestHistoryEntry } from '../types/typing'

type HistoryModalProps = {
  isOpen: boolean
  onClose: () => void
  history: TestHistoryEntry[]
}

export function HistoryModal({ isOpen, onClose, history }: HistoryModalProps) {
  if (!isOpen) {
    return null
  }

  // Sort history by date descending
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-slate-50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 dark:bg-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
            <div className="rounded-lg bg-teal-50 p-2 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
              <BarChart2 size={24} />
            </div>
            <h2 className="text-xl font-bold">Geçmiş Performanslar</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {sortedHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
              <BarChart2 size={48} className="mb-4 opacity-20" />
              <p className="text-lg">Henüz bu metin ve süre için geçmiş kayıt bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedHistory.map((entry, index) => {
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
                    className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-teal-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-800"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800/50 dark:bg-slate-900/50">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                        <CalendarDays size={14} className="text-slate-400 dark:text-slate-500" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <Clock size={12} className="text-slate-400 dark:text-slate-500" />
                        <span>{formattedTime}</span>
                      </div>
                    </div>

                    <div className="relative flex flex-col items-center justify-center py-2">
                      {entry.isFailedBySkippedWords && (
                        <div className="absolute top-0 right-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          BAŞARISIZ
                        </div>
                      )}
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Doğru Kelime
                      </div>
                      <div className="text-4xl font-extrabold text-teal-600 dark:text-teal-500">
                        {entry.correctWords}
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 pb-3 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center" title="Dakika başına tuş vuruşu">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{entry.keystrokesPerMinute?.toFixed(0) ?? '-'}</span>
                        <span className="text-[10px] uppercase">Vuruş/Dk</span>
                      </div>
                      <div className="flex flex-col items-center" title="Toplam tuş vuruşu">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{entry.totalKeystrokes ?? '-'}</span>
                        <span className="text-[10px] uppercase">Vuruş</span>
                      </div>
                      <div className="flex flex-col items-center" title="Atlanan kelime sayısı">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{entry.skippedWords ?? '-'}</span>
                        <span className="text-[10px] uppercase">Atlanan</span>
                      </div>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-900">
                      <div className="flex flex-col items-center border-r border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Doğruluk</div>
                        <div className="font-bold text-slate-700 dark:text-slate-300">%{entry.accuracy}</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Hata</div>
                        <div className="font-bold text-red-500 dark:text-red-400">{entry.wordErrorCount}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
