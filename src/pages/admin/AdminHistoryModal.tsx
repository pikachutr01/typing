import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, ChevronLeft, BarChart2, CalendarDays, Clock, Trash2, Loader2, ArrowRight } from 'lucide-react'
import { api } from '../../lib/api'
import { DiffViewer } from '../../components/DiffViewer'
import { diffText } from '../../utils/diffText'
import { getReachedExpectedText } from '../../utils/evaluateExamRules'

type AdminHistoryModalProps = {
  userId: number | null
  username: string
  onClose: () => void
}

export default function AdminHistoryModal({ userId, username, onClose }: AdminHistoryModalProps) {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null)

  useEffect(() => {
    if (userId) {
      setHistory([])
      setPage(0)
      setHasMore(true)
      setSelectedEntry(null)
      fetchHistory(userId, 0)
    }
  }, [userId])

  const fetchHistory = async (uId: number, p: number) => {
    setLoading(true)
    try {
      const res = await api.get(`/admin/users/${uId}/history?page=${p}&limit=20`)
      if (p === 0) {
        setHistory(res.data.data)
      } else {
        setHistory(prev => [...prev, ...res.data.data])
      }
      setHasMore(res.data.hasMore)
      setPage(p)
    } catch (error) {
      alert('Geçmiş yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, historyId: number) => {
    e.stopPropagation()
    if (!window.confirm('Bu performans kaydını kalıcı olarak silmek istediğinize emin misiniz?')) return
    
    try {
      await api.delete(`/admin/history/${historyId}`)
      setHistory(prev => prev.filter(h => h.id !== historyId))
      if (selectedEntry && selectedEntry.id === historyId) {
        setSelectedEntry(null)
      }
    } catch (error) {
      alert('Kayıt silinemedi')
    }
  }

  return (
    <Transition appear show={!!userId} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative flex min-h-[500px] sm:min-h-[600px] max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-slate-50 shadow-2xl overflow-hidden text-left align-middle transition-all dark:bg-slate-900">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950 shrink-0">
                  <div className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
                    {selectedEntry ? (
                      <button
                        onClick={() => setSelectedEntry(null)}
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <ChevronLeft size={20} />
                      </button>
                    ) : (
                      <div className="rounded-lg bg-teal-50 p-2 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                        <BarChart2 size={24} />
                      </div>
                    )}
                    <Dialog.Title as="h2" className="text-xl font-bold flex items-center gap-2">
                      {selectedEntry ? (
                        'Sınav Detayı'
                      ) : (
                        <>
                          <span className="text-teal-600 dark:text-teal-400">{username}</span>
                          <span className="text-slate-400 font-normal">Kullanıcı Geçmişi</span>
                        </>
                      )}
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {selectedEntry ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Doğruluk</div>
                          <div className="mt-1 text-2xl font-bold text-teal-600 dark:text-teal-400">%{selectedEntry.accuracy}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Kelime / Dk</div>
                          <div className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{Math.round(selectedEntry.correct_words / (selectedEntry.elapsed_seconds / 60)) || 0}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Hatalı Kelime</div>
                          <div className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">{selectedEntry.word_error_count}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Brüt Vuruş</div>
                          <div className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{selectedEntry.total_keystrokes}</div>
                        </div>
                      </div>
                      
                      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                        <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Metin Analizi</h3>
                        <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          <DiffViewer 
                            segments={diffText(
                              getReachedExpectedText(selectedEntry.target_text || '', selectedEntry.input_value || ''), 
                              selectedEntry.input_value || ''
                            )} 
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {history.map((entry) => (
                        <div
                          key={entry.id}
                          className="group relative flex cursor-pointer flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-teal-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-500 sm:flex-row sm:items-center"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <div className="flex flex-1 flex-col gap-2">
                            <div className="flex flex-wrap gap-2 items-center">
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                                {entry.category_name}
                              </span>
                              <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                                {entry.text_title}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1.5">
                                <CalendarDays size={14} />
                                {new Date(entry.created_at).toLocaleDateString('tr-TR')}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock size={14} />
                                {entry.duration_minutes} Dk
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 sm:gap-6">
                            <div className="flex flex-col items-end">
                              <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{Math.round(entry.correct_words / (entry.elapsed_seconds / 60)) || 0}</span>
                              <span className="text-xs font-medium text-slate-500">Kelime / Dk</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xl font-bold text-teal-600 dark:text-teal-400">%{entry.accuracy}</span>
                              <span className="text-xs font-medium text-slate-500">Doğruluk</span>
                            </div>
                            <button 
                              onClick={(e) => handleDelete(e, entry.id)}
                              className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                              title="Kaydı Sil"
                            >
                              <Trash2 size={18} />
                            </button>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 dark:bg-slate-900 dark:group-hover:bg-teal-900/30 dark:group-hover:text-teal-400 transition-colors">
                              <ArrowRight size={16} />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {history.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                          <BarChart2 size={48} className="mb-4 opacity-20" />
                          <p>Kullanıcıya ait performans geçmişi bulunmuyor.</p>
                        </div>
                      )}

                      {hasMore && (
                        <button
                          onClick={() => {
                            if (userId) fetchHistory(userId, page + 1)
                          }}
                          disabled={loading}
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                        >
                          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Daha Fazla Göster'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
