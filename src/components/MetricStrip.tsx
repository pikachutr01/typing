import { Activity, Gauge, Timer, TriangleAlert } from 'lucide-react'

type MetricStripProps = {
  remainingSeconds: number
  wpm: number
  accuracy?: number
  errorCount?: number
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function MetricStrip({
  remainingSeconds,
  wpm,
  accuracy,
  errorCount,
}: MetricStripProps) {
  const metrics = [
    {
      label: 'Kalan süre',
      value: formatTime(remainingSeconds),
      icon: Timer,
    },
    {
      label: 'WPM',
      value: wpm.toFixed(1),
      icon: Gauge,
    },
    {
      label: 'Doğruluk',
      value: accuracy === undefined ? 'Finalde' : `%${accuracy.toFixed(1)}`,
      icon: Activity,
    },
    {
      label: 'Hata',
      value: errorCount === undefined ? '-' : errorCount.toString(),
      icon: TriangleAlert,
    },
  ]

  return (
    <section className="sticky top-[237px] z-10 grid gap-2 bg-slate-50/95 py-2 backdrop-blur transition-colors duration-200 dark:bg-slate-950/95 sm:top-[189px] sm:grid-cols-2 md:top-[185px] lg:top-[65px] lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon

        return (
          <div
            key={metric.label}
            className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <Icon size={17} className="text-teal-600 dark:text-teal-500" />
              {metric.label}
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metric.value}</div>
          </div>
        )
      })}
    </section>
  )
}
