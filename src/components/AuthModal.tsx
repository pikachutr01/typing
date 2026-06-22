import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Info } from 'lucide-react'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const login = useAuthStore((state) => state.login)

  useEffect(() => {
    if (isOpen) {
      setIsLogin(true)
      setError('')
      setUsername('')
      setPassword('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register'
      const response = await api.post(endpoint, { username, password })
      
      login(response.data.user, response.data.token)
      onClose()
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Bir hata oluştu.')
      } else {
        setError('Sunucu ile bağlantı kurulamadı.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-black/60">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900"
          >
            <button
              type="button"
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              onClick={onClose}
            >
              <X size={20} />
            </button>

            <h2 className="mb-4 text-2xl font-bold text-slate-800 dark:text-slate-100">
              {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
            </h2>

            <div className="mb-5 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800/40 dark:bg-blue-900/20 dark:text-blue-300">
              <Info className="mt-0.5 shrink-0" size={18} />
              <p className="leading-relaxed">
                Sisteme giriş yapmak tamamen <strong>isteğe bağlıdır</strong> ve yalnızca yazdığınız metinlerin geçmiş performans kayıtlarını tutabilmeniz içindir. Giriş yapmadan da uygulamayı özgürce kullanabilirsiniz.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400">
                Kullanıcı Adı
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-10 rounded-md border border-slate-300 bg-slate-50 px-3 text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-teal-500"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400">
                Şifre
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-md border border-slate-300 bg-slate-50 px-3 text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-teal-500"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-10 items-center justify-center gap-2 rounded-md bg-teal-600 px-4 font-semibold text-white transition hover:bg-teal-700 disabled:opacity-70 dark:bg-teal-600 dark:hover:bg-teal-500"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              {isLogin ? 'Hesabınız yok mu? ' : 'Zaten hesabınız var mı? '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                }}
                className="font-semibold text-teal-600 hover:underline dark:text-teal-400"
              >
                {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
