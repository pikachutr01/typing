import type { DiffSegment } from '../types/typing'

type DiffViewerProps = {
  segments: DiffSegment[]
}

function segmentClassName(type: DiffSegment['type']) {
  switch (type) {
    case 'equal':
      return 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-300'
    case 'insert':
      return 'bg-amber-100 text-amber-900 underline decoration-amber-600 decoration-2 dark:bg-amber-900/30 dark:text-amber-300 dark:decoration-amber-500'
    case 'delete':
      return 'bg-rose-100 text-rose-900 line-through decoration-rose-700 decoration-2 dark:bg-rose-900/30 dark:text-rose-300 dark:decoration-rose-500'
    case 'replace':
      return 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300'
  }
}

export function DiffViewer({ segments }: DiffViewerProps) {
  if (segments.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        Karşılaştırılacak yazı bulunamadı.
      </p>
    )
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-400">
        <span className="rounded bg-green-100 px-2 py-1 font-medium text-green-900 dark:bg-green-900/30 dark:text-green-300">
          Doğru
        </span>
        <span className="rounded bg-blue-100 px-2 py-1 font-medium text-blue-900 dark:bg-blue-900/30 dark:text-blue-300">
          Yanlış
        </span>
        <span className="rounded bg-rose-100 px-2 py-1 font-medium text-rose-900 dark:bg-rose-900/30 dark:text-rose-300">
          Eksik
        </span>
        <span className="rounded bg-amber-100 px-2 py-1 font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-300">
          Fazla
        </span>
      </div>

      <div className="whitespace-pre-wrap text-left text-lg leading-9 text-slate-800 dark:text-slate-200">
        {segments.map((segment) => {
          if (segment.type === 'replace') {
            return (
              <span
                key={segment.id}
                className={`mx-0.5 rounded px-1 py-0.5 ${segmentClassName(
                  segment.type,
                )}`}
                title={`Beklenen: ${segment.expectedText} | Yazılan: ${segment.actualText}`}
              >
                {segment.actualText || segment.expectedText}
              </span>
            )
          }

          return (
            <span
              key={segment.id}
              className={`mx-0.5 rounded px-1 py-0.5 ${segmentClassName(
                segment.type,
              )}`}
            >
              {segment.actualText || segment.expectedText}
            </span>
          )
        })}
      </div>
    </div>
  )
}
