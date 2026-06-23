import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Plus, Edit2, Trash2, Loader2, Save, X } from 'lucide-react'
import { ConfirmationDialog } from '../../components/ConfirmationDialog'

export default function TextsPanel() {
  const [texts, setTexts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({ title: '', content: '' })
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, textId: number | null}>({isOpen: false, textId: null})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/texts')
      setTexts(res.data)
    } catch (error) {
      alert('Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) return alert('Tüm alanları doldurun')
    
    try {
      if (editId) {
        await api.put(`/admin/texts/${editId}`, formData)
      } else {
        await api.post('/admin/texts', formData)
      }
      setIsEditing(false)
      setEditId(null)
      setFormData({ title: '', content: '' })
      await fetchData()
    } catch (error) {
      alert('Kayıt işlemi başarısız')
    }
  }

  const handleEdit = (text: any) => {
    setFormData({ title: text.title, content: text.content })
    setEditId(text.id)
    setIsEditing(true)
  }

  const handleDelete = async () => {
    if (!deleteConfirm.textId) return
    try {
      await api.delete(`/admin/texts/${deleteConfirm.textId}`)
      await fetchData()
      setDeleteConfirm({isOpen: false, textId: null})
    } catch (error: any) {
      alert(error.response?.data?.error || 'Silinirken bir hata oluştu')
      setDeleteConfirm({isOpen: false, textId: null})
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-teal-600" /></div>

  if (isEditing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{editId ? 'Metni Düzenle' : 'Yeni Metin Ekle'}</h2>
          <button onClick={() => { setIsEditing(false); setEditId(null) }} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
        </div>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-600">Referans Başlık (Sadece Yönetici Görür)</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Örn: 2022 İcra Metni 1" className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-teal-500" />
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-semibold text-slate-600">İçerik</label>
            <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} rows={12} className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-teal-500 resize-none font-mono text-sm leading-relaxed" />
          </div>
          <div className="flex justify-end mt-2">
            <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2">
              <Save size={18} /> Kaydet
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Havuzdaki Metinler</h2>
        <button onClick={() => { setFormData({ title: '', content: '' }); setIsEditing(true) }} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <Plus size={18} /> Yeni Metin
        </button>
      </div>
      
      <div className="flex flex-col gap-3">
        {texts.map(text => (
          <div key={text.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate">{text.title}</h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{text.content.substring(0, 100)}...</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => handleEdit(text)} className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"><Edit2 size={16} /></button>
              <button onClick={() => setDeleteConfirm({isOpen: true, textId: text.id})} className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {texts.length === 0 && (
          <p className="text-center text-slate-500 py-8">Kayıtlı metin bulunmuyor.</p>
        )}
      </div>

      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({isOpen: false, textId: null})}
        onConfirm={handleDelete}
        title="Metni Sil"
        message="Bu metni silmek istediğinize emin misiniz? Bu metne ait geçmiş test kayıtları kalıcı olarak silinecektir."
        confirmText="Sil"
        type="danger"
      />
    </div>
  )
}
