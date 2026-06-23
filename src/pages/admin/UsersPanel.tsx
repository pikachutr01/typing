import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Trash2, Loader2, Eye, CalendarDays } from 'lucide-react'
import AdminHistoryModal from './AdminHistoryModal'
import { ConfirmationDialog } from '../../components/ConfirmationDialog'

export default function UsersPanel() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedUsername, setSelectedUsername] = useState<string>('')
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, userId: number | null}>({isOpen: false, userId: null})

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data)
    } catch (error) {
      alert('Kullanıcılar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm.userId) return
    try {
      await api.delete(`/admin/users/${deleteConfirm.userId}`)
      setUsers(users.filter(u => u.id !== deleteConfirm.userId))
      setDeleteConfirm({isOpen: false, userId: null})
    } catch (error: any) {
      alert(error.response?.data?.error || 'Silinirken bir hata oluştu')
      setDeleteConfirm({isOpen: false, userId: null})
    }
  }

  const openHistory = (id: number, username: string) => {
    setSelectedUserId(id)
    setSelectedUsername(username)
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-teal-600" /></div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Kullanıcılar</h2>

      <div className="flex flex-col gap-3">
        {users.map(user => (
          <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{user.username}</h3>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <CalendarDays size={14} />
                {new Date(user.created_at).toLocaleDateString('tr-TR')} tarihinde katıldı
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openHistory(user.id, user.username)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-200 dark:hover:border-teal-800 transition-colors flex items-center gap-2"
              >
                <Eye size={16} /> Performans Geçmişi
              </button>
              {user.username !== 'admin' && (
                <button
                  onClick={() => setDeleteConfirm({isOpen: true, userId: user.id})}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  title="Kullanıcıyı Sil"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-center text-slate-500 py-8">Sistemde kayıtlı kullanıcı bulunmuyor.</p>
        )}
      </div>

      <AdminHistoryModal
        userId={selectedUserId}
        username={selectedUsername}
        onClose={() => setSelectedUserId(null)}
      />
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({isOpen: false, userId: null})}
        onConfirm={handleDelete}
        title="Kullanıcıyı Sil"
        message="Bu kullanıcıyı silmek istediğinize emin misiniz? Kullanıcının tüm geçmiş performans kayıtları da silinecektir. Bu işlem geri alınamaz."
        confirmText="Sil"
      />
    </div>
  )
}
