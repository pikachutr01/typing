import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { FolderTree, FileText, Users, ArrowLeft, LogOut } from 'lucide-react'
import CategoriesPanel from './admin/CategoriesPanel'
import TextsPanel from './admin/TextsPanel'
import UsersPanel from './admin/UsersPanel'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuthStore } from '../store/authStore'

export default function AdminDashboard() {
  const location = useLocation()
  const { logout, user } = useAuthStore()

  const navLinks = [
    { name: 'Kategoriler', path: '/manage/categories', icon: FolderTree },
    { name: 'Metinler', path: '/manage/texts', icon: FileText },
    { name: 'Kullanıcılar', path: '/manage/users', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
      {/* Admin Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors" title="Ana Sayfaya Dön">
              <ArrowLeft size={20} />
            </Link>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400">
              Yönetim Paneli
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold">{user?.username}</span>
              <span className="text-[10px] uppercase tracking-wider text-teal-600 dark:text-teal-400 font-bold">Yetkili</span>
            </div>
            <ThemeToggle />
            <button
              onClick={() => logout()}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-rose-600 transition-colors hover:bg-rose-50 hover:border-rose-200 dark:border-slate-800 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-900/20 dark:hover:border-rose-800"
              title="Çıkış Yap"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6">

        {/* Sidebar Nav */}
        <nav className="w-full md:w-64 shrink-0 flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path)
            const Icon = link.icon
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
                  }`}
              >
                <Icon size={18} className={isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'} />
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* Dynamic Panel Content */}
        <main className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
          <Routes>
            <Route path="categories" element={<CategoriesPanel />} />
            <Route path="texts" element={<TextsPanel />} />
            <Route path="users" element={<UsersPanel />} />
            <Route path="*" element={<Navigate to="categories" replace />} />
          </Routes>
        </main>

      </div>
    </div>
  )
}
