import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Plus, Edit2, Trash2, Loader2, Save, X } from 'lucide-react'

export default function CategoriesPanel() {
  const [categories, setCategories] = useState<{id: number, name: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [newName, setNewName] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories')
      setCategories(res.data)
    } catch (error) {
      alert('Kategoriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    try {
      await api.post('/admin/categories', { name: newName })
      setNewName('')
      await fetchCategories()
    } catch (error) {
      alert('Kategori eklenemedi')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return
    try {
      await api.put(`/admin/categories/${id}`, { name: editName })
      setEditId(null)
      await fetchCategories()
    } catch (error) {
      alert('Kategori güncellenemedi')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return
    try {
      await api.delete(`/admin/categories/${id}`)
      await fetchCategories()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Silinirken bir hata oluştu')
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-teal-600" /></div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Kategoriler</h2>
      
      {/* Add New */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-8 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
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

      {/* List */}
      <div className="flex flex-col gap-2">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            {editId === cat.id ? (
              <div className="flex items-center gap-2 flex-1 mr-4">
                <input 
                  autoFocus
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-900 border border-teal-500 rounded px-3 py-1 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
                />
                <button onClick={() => handleUpdate(cat.id)} className="p-1 text-teal-600 hover:bg-teal-50 rounded"><Save size={18} /></button>
                <button onClick={() => setEditId(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X size={18} /></button>
              </div>
            ) : (
              <>
                <span className="font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditId(cat.id); setEditName(cat.name) }} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </div>
              </>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-center text-slate-500 py-8">Kayıtlı kategori bulunmuyor.</p>
        )}
      </div>
    </div>
  )
}
