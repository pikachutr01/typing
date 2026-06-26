import { useState, useEffect, useCallback } from 'react'
import { api } from '../../lib/api'
import { Plus, Edit2, Trash2, Loader2, Save, X, ChevronDown, ChevronRight, Link2, Unlink, Eye, ArrowUp, ArrowDown } from 'lucide-react'
import { ConfirmationDialog } from '../../components/ConfirmationDialog'
import { isAxiosError } from 'axios'

type Category = {
  id: number
  name: string
}

type TextSummary = {
  id: number
  title: string
}

type CategoryText = {
  id: number
  display_title: string
  reference_title: string
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error) && typeof error.response?.data?.error === 'string') {
    return error.response.data.error
  }
  return fallback
}

export default function CategoriesPanel() {
  const [categories, setCategories] = useState<Category[]>([])
  const [allTexts, setAllTexts] = useState<TextSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [newName, setNewName] = useState('')

  const [expandedCat, setExpandedCat] = useState<number | null>(null)
  const [categoryTexts, setCategoryTexts] = useState<Record<number, CategoryText[]>>({})

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [targetCategoryId, setTargetCategoryId] = useState<number | null>(null)
  const [assignForm, setAssignForm] = useState({ text_id: '', display_title: '' })

  // Preview Modal
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)

  // Confirmation Modals
  const [deleteCatConfirm, setDeleteCatConfirm] = useState<{isOpen: boolean, categoryId: number | null}>({isOpen: false, categoryId: null})
  const [unlinkConfirm, setUnlinkConfirm] = useState<{isOpen: boolean, categoryId: number | null, textId: number | null}>({isOpen: false, categoryId: null, textId: null})

  const fetchData = useCallback(async () => {
    try {
      const [catsRes, textsRes] = await Promise.all([
        api.get('/admin/categories'),
        api.get('/admin/texts')
      ])
      setCategories(catsRes.data)
      setAllTexts(textsRes.data)
    } catch {
      alert('Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [fetchData])

  const fetchCategoryTexts = async (categoryId: number) => {
    try {
      const res = await api.get(`/admin/categories/${categoryId}/texts`)
      setCategoryTexts(prev => ({ ...prev, [categoryId]: res.data }))
    } catch (error) {
      console.error(error)
    }
  }

  const toggleCategory = (id: number) => {
    if (expandedCat === id) {
      setExpandedCat(null)
    } else {
      setExpandedCat(id)
      if (!categoryTexts[id]) {
        fetchCategoryTexts(id)
      }
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    try {
      await api.post('/admin/categories', { name: newName })
      setNewName('')
      await fetchData()
    } catch {
      alert('Kategori eklenemedi')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateCategory = async (id: number) => {
    if (!editName.trim()) return
    try {
      await api.put(`/admin/categories/${id}`, { name: editName })
      setEditId(null)
      await fetchData()
    } catch {
      alert('Kategori güncellenemedi')
    }
  }

  const handleDeleteCategory = async () => {
    if (!deleteCatConfirm.categoryId) return
    try {
      await api.delete(`/admin/categories/${deleteCatConfirm.categoryId}`)
      await fetchData()
      setDeleteCatConfirm({isOpen: false, categoryId: null})
    } catch (error) {
      alert(getErrorMessage(error, 'Silinirken bir hata oluştu'))
      setDeleteCatConfirm({isOpen: false, categoryId: null})
    }
  }

  const openAssignModal = (categoryId: number) => {
    setTargetCategoryId(categoryId)
    setAssignForm({ text_id: '', display_title: '' })
    setIsModalOpen(true)
  }

  const handleAssignText = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetCategoryId || !assignForm.text_id || !assignForm.display_title.trim()) return
    
    try {
      await api.post(`/admin/categories/${targetCategoryId}/texts`, assignForm)
      setIsModalOpen(false)
      await fetchCategoryTexts(targetCategoryId)
    } catch (error) {
      alert(getErrorMessage(error, 'Metin eklenemedi'))
    }
  }

  const handleRemoveText = async () => {
    if (!unlinkConfirm.categoryId || !unlinkConfirm.textId) return
    try {
      await api.delete(`/admin/categories/${unlinkConfirm.categoryId}/texts/${unlinkConfirm.textId}`)
      await fetchCategoryTexts(unlinkConfirm.categoryId)
      setUnlinkConfirm({isOpen: false, categoryId: null, textId: null})
    } catch (error) {
      alert(getErrorMessage(error, 'Çıkarılırken hata oluştu'))
      setUnlinkConfirm({isOpen: false, categoryId: null, textId: null})
    }
  }

  const handlePreviewText = async (textId: number) => {
    setPreviewLoading(true)
    setIsPreviewModalOpen(true)
    try {
      const res = await api.get(`/admin/texts/${textId}`)
      setPreviewContent(res.data.content)
    } catch {
      alert('İçerik alınamadı')
      setIsPreviewModalOpen(false)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleMoveText = async (categoryId: number, index: number, direction: 'up' | 'down') => {
    const texts = [...(categoryTexts[categoryId] || [])]
    if (direction === 'up' && index > 0) {
      const temp = texts[index]
      texts[index] = texts[index - 1]
      texts[index - 1] = temp
    } else if (direction === 'down' && index < texts.length - 1) {
      const temp = texts[index]
      texts[index] = texts[index + 1]
      texts[index + 1] = temp
    } else {
      return
    }
    
    setCategoryTexts(prev => ({ ...prev, [categoryId]: texts }))
    
    try {
      const orderedTextIds = texts.map(t => t.id)
      await api.put(`/admin/categories/${categoryId}/texts/order`, { orderedTextIds })
    } catch {
      alert('Sıralama güncellenemedi')
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-teal-600" /></div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Kategoriler ve Metin Atamaları</h2>
      
      {/* Add New Category */}
      <form onSubmit={handleAddCategory} className="flex gap-2 mb-8 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
        <input 
          type="text" 
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Yeni kategori adı..." 
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-teal-500"
        />
        <button 
          type="submit" 
          disabled={saving || !newName.trim()}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          Ekle
        </button>
      </form>

      {/* Categories List */}
      <div className="flex flex-col gap-3">
        {categories.map(cat => (
          <div key={cat.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            
            {/* Category Header */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleCategory(cat.id)}>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  {expandedCat === cat.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
                
                {editId === cat.id ? (
                  <div className="flex items-center gap-2 flex-1 mr-4" onClick={e => e.stopPropagation()}>
                    <input 
                      autoFocus
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-teal-500 rounded px-3 py-1 outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory(cat.id)}
                    />
                    <button onClick={() => handleUpdateCategory(cat.id)} className="p-1 text-teal-600 hover:bg-teal-50 rounded"><Save size={18} /></button>
                    <button onClick={() => setEditId(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X size={18} /></button>
                  </div>
                ) : (
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{cat.name}</span>
                )}
              </div>
              
              {!editId && (
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); setEditId(cat.id); setEditName(cat.name) }} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors"><Edit2 size={16} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteCatConfirm({isOpen: true, categoryId: cat.id}) }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </div>
              )}
            </div>

            {/* Category Texts List */}
            {expandedCat === cat.id && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-end mb-4">
                  <button onClick={() => openAssignModal(cat.id)} className="text-sm bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:hover:bg-teal-900/50 dark:text-teal-300 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors">
                    <Link2 size={16} /> Metin Ata
                  </button>
                </div>
                
                <div className="flex flex-col gap-2">
                  {categoryTexts[cat.id]?.map((text, index) => (
                    <div key={text.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1 pr-2 border-r border-slate-200 dark:border-slate-700/50">
                          <button onClick={() => handleMoveText(cat.id, index, 'up')} disabled={index === 0} className="text-slate-400 hover:text-teal-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"><ArrowUp size={14}/></button>
                          <button onClick={() => handleMoveText(cat.id, index, 'down')} disabled={index === categoryTexts[cat.id].length - 1} className="text-slate-400 hover:text-teal-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"><ArrowDown size={14}/></button>
                        </div>
                        <div>
                          <div className="font-medium text-slate-700 dark:text-slate-200">{text.display_title}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-500">Havuz Referansı: {text.reference_title}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handlePreviewText(text.id)} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-md transition-colors" title="İçeriği Gör">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => setUnlinkConfirm({isOpen: true, categoryId: cat.id, textId: text.id})} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-md transition-colors" title="Kategoriden Çıkar">
                          <Unlink size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {categoryTexts[cat.id]?.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">Bu kategoriye henüz metin atanmamış.</p>
                  )}
                </div>
              </div>
            )}

          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-center text-slate-500 py-8">Kayıtlı kategori bulunmuyor.</p>
        )}
      </div>

      {/* Assign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Kategoriye Metin Ata</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleAssignText} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Havuzdan Metin Seç</label>
                <div className="flex gap-2">
                  <select 
                    required
                    value={assignForm.text_id} 
                    onChange={e => setAssignForm({...assignForm, text_id: e.target.value})}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-teal-500"
                  >
                    <option value="">Seçiniz...</option>
                    {allTexts.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                  {assignForm.text_id && (
                    <button 
                      type="button"
                      onClick={() => handlePreviewText(Number(assignForm.text_id))}
                      className="p-2 bg-slate-100 dark:bg-slate-800 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center shrink-0"
                      title="Seçili Metni İncele"
                    >
                      <Eye size={20} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Görünür İsim (Display Title)</label>
                <input 
                  required
                  type="text"
                  placeholder="Örn: Metin 5"
                  value={assignForm.display_title}
                  onChange={e => setAssignForm({...assignForm, display_title: e.target.value})}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg">İptal</button>
                <button type="submit" className="px-4 py-2 font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg">Ata</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Metin İçeriği</h3>
              <button onClick={() => { setIsPreviewModalOpen(false); setPreviewContent(null) }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2">
              {previewLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-teal-600" /></div>
              ) : (
                <div className="font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-300 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap">
                  {previewContent}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={deleteCatConfirm.isOpen}
        onClose={() => setDeleteCatConfirm({isOpen: false, categoryId: null})}
        onConfirm={handleDeleteCategory}
        title="Kategoriyi Sil"
        message="Bu kategoriyi silmek istediğinize emin misiniz? Kategori içindeki atamalar da silinecektir."
        confirmText="Sil"
      />

      <ConfirmationDialog
        isOpen={unlinkConfirm.isOpen}
        onClose={() => setUnlinkConfirm({isOpen: false, categoryId: null, textId: null})}
        onConfirm={handleRemoveText}
        title="Metni Çıkar"
        message="Metni bu kategoriden çıkarmak istediğinize emin misiniz?"
        confirmText="Çıkar"
      />
    </div>
  )
}
