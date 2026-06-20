import { DiffViewer } from './DiffViewer'
import type { TypingResult } from '../types/typing'

type ResultPanelProps = {
  result: TypingResult
}

export function ResultPanel({ result }: ResultPanelProps) {
  const details = [
    {
      label: 'Doğru kelime',
      value: result.correctWords,
      detail: `${result.wordsPerMinute.toFixed(1)} kelime/dk`,
    },
    {
      label: 'Kelime hatası',
      value: result.wordErrorCount,
      detail: `${result.extraSpaceErrors} fazla boşluk`,
    },
    {
      label: 'Atlanan kelime',
      value: result.skippedWords,
      detail: result.isFailedBySkippedWords ? '14+ atlama: başarısız' : undefined,
    },
    {
      label: 'Tuş vuruşu',
      value: result.totalKeystrokes,
      detail: `${result.keystrokesPerMinute.toFixed(1)} vuruş/dk`,
    },
  ]

  return (
    <section className="grid gap-4">
      {result.hasIncompleteLastWord && (
        <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800 shadow-sm dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-300">
          Eksik son kelime hata olarak değerlendirilmedi.
        </div>
      )}

      {result.isFailedBySkippedWords && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 shadow-sm dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          Toplam 14 veya daha fazla kelime atlandığı için sınav başarısız kabul edilir.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="rounded-md border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              {detail.label}
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {detail.value}
            </div>
            {detail.detail !== undefined && (
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{detail.detail}</div>
            )}
          </div>
        ))}
      </div>

      <DiffViewer segments={result.diffSegments} />
    </section>
  )
}
