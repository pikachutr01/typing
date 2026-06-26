import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart2, CheckCircle2, Keyboard, Timer, TrendingUp, CalendarDays, Award, ChevronRight, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { api } from '../lib/api'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { DiffViewer } from '../components/DiffViewer'
import { diffText } from '../utils/diffText'
import { getReachedExpectedText } from '../utils/evaluateExamRules'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface DurationStats {
  duration_minutes: number
  total_tests: number
  avg_wpm: number
  avg_accuracy: number
  total_keystrokes: number
  best_wpm: number
  avg_correct_words: number
  best_correct_words: number
}

interface UserStats {
  overall: DurationStats[]
  history: {
    id: number
    duration_minutes: number
    keystrokes_per_minute: number
    accuracy: number
    correct_words: number
    created_at: string
    text_title: string
  }[]
  bestTests: {
    id: number
    duration_minutes: number
    keystrokes_per_minute: number
    accuracy: number
    correct_words: number
    word_error_count: number
    total_keystrokes: number
    input_value: string
    created_at: string
    text_title: string
    target_text: string
  }[]
  topMistypedWords: {
    word: string
    count: number
  }[]
}

export default function ProfilePage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeDuration, setActiveDuration] = useState<number | null>(null)
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }

    api.get('/user/stats')
      .then(res => {
        setStats(res.data)
        if (res.data.overall && res.data.overall.length > 0) {
          const maxTest = res.data.overall.reduce((max: DurationStats, obj: DurationStats) => obj.total_tests > max.total_tests ? obj : max, res.data.overall[0])
          setActiveDuration(maxTest.duration_minutes)
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [user, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">İstatistikler Yükleniyor...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <p className="text-red-500">Veriler alınamadı.</p>
        <Link to="/" className="mt-4 text-teal-600 hover:underline">Ana Sayfaya Dön</Link>
      </div>
    )
  }

  const activeOverall = stats.overall.find(o => o.duration_minutes === activeDuration) || {
    total_tests: 0,
    avg_wpm: 0,
    avg_accuracy: 0,
    total_keystrokes: 0,
    best_wpm: 0,
    avg_correct_words: 0,
    best_correct_words: 0
  }

  const chartData = stats.history
    .filter(h => h.duration_minutes === activeDuration)
    .map((h) => ({
      name: format(new Date(h.created_at), 'dd MMM HH:mm', { locale: tr }),
      wpm: Number(h.keystrokes_per_minute),
      accuracy: Number(h.accuracy),
      correctWords: Number(h.correct_words),
      title: h.text_title
    }))

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-teal-600 mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Ana Sayfaya Dön
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight">Profil & İstatistikler</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Merhaba <span className="font-semibold text-teal-600 dark:text-teal-400">{user?.username}</span>, klavye performansın burada!
            </p>
          </div>
          
          {/* Duration Tabs */}
          {stats.overall.length > 0 && (
            <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl">
              {stats.overall.map((o) => (
                <button
                  key={o.duration_minutes}
                  onClick={() => setActiveDuration(o.duration_minutes)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeDuration === o.duration_minutes
                      ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {o.duration_minutes} Dakika
                </button>
              ))}
            </div>
          )}
        </div>

        {stats.overall.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Henüz hiç test tamamlamadınız.</h2>
            <p className="text-slate-500 mt-2">İstatistiklerinizi görebilmek için en az bir test bitirmelisiniz.</p>
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <StatCard
                icon={<TrendingUp className="text-rose-500" />}
                title="Ort. Doğru Kelime"
                value={Number(activeOverall.avg_correct_words || 0).toFixed(1)}
                bgColor="bg-rose-50 dark:bg-rose-950/30"
              />
              <StatCard
                icon={<TrendingUp className="text-blue-500" />}
                title="Ortalama Hız"
                value={`${Number(activeOverall.avg_wpm || 0).toFixed(1)} vuruş/dk`}
                bgColor="bg-blue-50 dark:bg-blue-950/30"
              />
              <StatCard
                icon={<CheckCircle2 className="text-emerald-500" />}
                title="Ort. Doğruluk"
                value={`%${Number(activeOverall.avg_accuracy || 0).toFixed(1)}`}
                bgColor="bg-emerald-50 dark:bg-emerald-950/30"
              />
              <StatCard
                icon={<BarChart2 className="text-purple-500" />}
                title="En İyi Kelime"
                value={Number(activeOverall.best_correct_words || 0).toString()}
                bgColor="bg-purple-50 dark:bg-purple-950/30"
              />
              <StatCard
                icon={<Timer className="text-orange-500" />}
                title="Tamamlanan Test"
                value={activeOverall.total_tests.toString()}
                bgColor="bg-orange-50 dark:bg-orange-950/30"
              />
              <StatCard
                icon={<Keyboard className="text-indigo-500" />}
                title="Toplam Vuruş"
                value={Number(activeOverall.total_keystrokes || 0).toLocaleString('tr-TR')}
                bgColor="bg-indigo-50 dark:bg-indigo-950/30"
              />
            </div>

            {/* Best Test Banner */}
            {stats.bestTests && stats.bestTests.find(b => b.duration_minutes === activeDuration) && (() => {
              const bestTest = stats.bestTests.find(b => b.duration_minutes === activeDuration)!
              return (
                <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 dark:from-amber-500/5 dark:via-orange-500/5 dark:to-rose-500/5 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Award size={120} />
                  </div>
                  
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="bg-amber-100 dark:bg-amber-900/50 p-4 rounded-full text-amber-600 dark:text-amber-400">
                      <Award size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">En İyi Performansınız</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{bestTest.text_title}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5"><CalendarDays size={14} /> {new Date(bestTest.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 relative z-10 w-full md:w-auto mt-4 md:mt-0">
                    <div className="flex items-center justify-between md:justify-start gap-4 md:gap-6 w-full md:w-auto">
                      <div className="flex flex-col items-center flex-1 md:flex-none">
                        <span className="text-2xl font-black text-amber-600 dark:text-amber-500">{bestTest.correct_words}</span>
                        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-700/60 dark:text-amber-400/60">Doğru</span>
                      </div>
                      <div className="w-px h-10 bg-amber-200 dark:bg-amber-800/50"></div>
                      <div className="flex flex-col items-center flex-1 md:flex-none">
                        <span className="text-2xl font-black text-slate-800 dark:text-slate-200">{bestTest.keystrokes_per_minute}</span>
                        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">Hız</span>
                      </div>
                      <div className="w-px h-10 bg-amber-200 dark:bg-amber-800/50"></div>
                      <div className="flex flex-col items-center flex-1 md:flex-none">
                        <span className="text-2xl font-black text-slate-800 dark:text-slate-200">%{bestTest.accuracy}</span>
                        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">Doğruluk</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setIsDiffModalOpen(true)}
                      className="w-full md:w-auto md:ml-2 flex justify-center items-center gap-1.5 px-4 py-2.5 md:py-2 bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-500 font-semibold rounded-xl shadow-sm hover:shadow border border-amber-100 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-slate-700 transition-all"
                    >
                      Detay Gör
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )
            })()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Correct Words Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-rose-500" />
                Doğru Kelime Sayısı (Son 30 Test)
              </h2>
              <div className="h-[250px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="name" tick={{fontSize: 12}} tickMargin={10} stroke="#64748b" minTickGap={30} />
                      <YAxis tick={{fontSize: 12}} stroke="#64748b" tickFormatter={(v) => `${v}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: ValueType | undefined) => [`${value} kelime`, "Doğru Kelime"]}
                        labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                      />
                      <Line type="monotone" dataKey="correctWords" stroke="#f43f5e" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    Henüz yeterli test verisi yok.
                  </div>
                )}
              </div>
            </div>
            {/* WPM Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-500" />
                Performans Gelişimi (Son 30 Test)
              </h2>
              <div className="h-[300px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis 
                        dataKey="name" 
                        tick={{fontSize: 12}} 
                        tickMargin={10}
                        stroke="#64748b"
                        minTickGap={30}
                      />
                      <YAxis 
                        tick={{fontSize: 12}} 
                        stroke="#64748b" 
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: ValueType | undefined) => [`${value} vuruş/dk`, "Hız"]}
                        labelStyle={{ color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="wpm" 
                        stroke="#0d9488" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorWpm)" 
                        activeDot={{ r: 6, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    Henüz yeterli test verisi yok.
                  </div>
                )}
              </div>
            </div>
            
            {/* Accuracy Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Doğruluk Oranı (Son 30 Test)
              </h2>
              <div className="h-[250px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="name" tick={{fontSize: 12}} tickMargin={10} stroke="#64748b" minTickGap={30} />
                      <YAxis domain={[0, 100]} tick={{fontSize: 12}} stroke="#64748b" tickFormatter={(v) => `%${v}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: ValueType | undefined) => [`%${value}`, "Doğruluk"]}
                        labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                      />
                      <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    Henüz yeterli test verisi yok.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mistyped Words List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col max-h-[700px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-1.5 rounded-lg">
                  <Keyboard className="w-5 h-5" />
                </span>
                En Çok Hata Yapılan Kelimeler
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
              {stats.topMistypedWords.length > 0 ? (
                stats.topMistypedWords.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-400 dark:text-slate-500 w-5">{index + 1}.</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 select-all">{item.word}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-950/50 px-2.5 py-1 rounded-full">
                      {item.count} kez
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 mt-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="font-medium">Harika!</p>
                  <p className="text-sm mt-1">Henüz hiç hatalı kelimeniz bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Diff Modal */}
        {stats.bestTests && stats.bestTests.find(b => b.duration_minutes === activeDuration) && (
          <Transition appear show={isDiffModalOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => setIsDiffModalOpen(false)}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
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
                    <Dialog.Panel className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden text-left align-middle transition-all dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      
                      {(() => {
                        const bestTest = stats.bestTests.find(b => b.duration_minutes === activeDuration)!;
                        return (
                          <>
                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950 shrink-0">
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500">
                                  <Award size={20} />
                                </div>
                                <div>
                                  <Dialog.Title as="h2" className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                    En İyi Performans Detayı
                                  </Dialog.Title>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{bestTest.text_title}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => setIsDiffModalOpen(false)}
                                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                              >
                                <X size={20} />
                              </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Doğru Kelime</div>
                                  <div className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-500">{bestTest.correct_words}</div>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Hız (Vuruş/Dk)</div>
                                  <div className="mt-1 text-2xl font-bold text-teal-600 dark:text-teal-400">{bestTest.keystrokes_per_minute}</div>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Doğruluk</div>
                                  <div className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">%{bestTest.accuracy}</div>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Hatalı Kelime</div>
                                  <div className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">{bestTest.word_error_count}</div>
                                </div>
                              </div>
                              
                              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                                <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Metin Analizi</h3>
                                <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                  {bestTest.target_text ? (
                                    <DiffViewer 
                                      segments={diffText(
                                        getReachedExpectedText(bestTest.target_text, bestTest.input_value || ''), 
                                        bestTest.input_value || ''
                                      )} 
                                    />
                                  ) : (
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-sm border border-amber-200 dark:border-amber-800/50">
                                      <div className="font-semibold mb-1">Metin Bulunamadı</div>
                                      Orijinal metin silindiği için analiz yapılamıyor.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        )}
        </>
      )}
    </div>
    </div>
  )
}

function StatCard({ icon, title, value, bgColor }: { icon: React.ReactNode, title: string, value: string, bgColor: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 transition-transform hover:-translate-y-1 duration-200 text-center sm:text-left">
      <div className={`p-2.5 sm:p-3 rounded-xl ${bgColor} shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] sm:text-sm font-semibold text-slate-500 dark:text-slate-400 truncate" title={title}>{title}</p>
        <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5 truncate">{value}</p>
      </div>
    </div>
  )
}
