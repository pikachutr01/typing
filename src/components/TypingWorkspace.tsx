import { forwardRef, useEffect, useRef } from 'react'
import type { TestStatus } from '../types/typing'
import { useSettingsStore } from '../store/settingsStore'

type TypingWorkspaceProps = {
  targetText: string
  inputValue: string
  status: TestStatus
  onInputChange: (value: string) => void
  onTypingKeyDown: (key: string) => void
  onFocus?: () => void
  onBlur?: () => void
  isZenMode?: boolean
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getCharacterRect(container: HTMLDivElement, characterIndex: number) {
  const textNode = container.firstChild

  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
    return undefined
  }

  const range = document.createRange()
  range.setStart(textNode, Math.max(characterIndex - 1, 0))
  range.setEnd(textNode, characterIndex)

  const rect = range.getBoundingClientRect()
  range.detach()

  return rect.width > 0 || rect.height > 0 ? rect : undefined
}

export const TypingWorkspace = forwardRef<HTMLTextAreaElement, TypingWorkspaceProps>(
  function TypingWorkspace(
    { targetText, inputValue, status, onInputChange, onTypingKeyDown, onFocus, onBlur, isZenMode = false },
    ref,
  ) {
    const { fontSizeDelta } = useSettingsStore()
    const textScrollRef = useRef<HTMLDivElement>(null)
    const scrollAnimationRef = useRef<number | null>(null)
    const progressIndex = clamp(inputValue.trimEnd().length, 0, targetText.length)

    useEffect(() => {
      if (status !== 'running' || progressIndex === 0) {
        return
      }

      const scrollContainer = textScrollRef.current

      if (!scrollContainer) {
        return
      }

      const characterRect = getCharacterRect(scrollContainer, progressIndex)

      if (!characterRect) {
        return
      }

      const containerRect = scrollContainer.getBoundingClientRect()
      const markerTop = characterRect.top - containerRect.top
      const threshold = scrollContainer.clientHeight * (2 / 3)

      if (markerTop <= threshold) {
        return
      }

      const lineHeight = Number.parseFloat(
        window.getComputedStyle(scrollContainer).lineHeight,
      )
      const scrollDelta = markerTop - threshold + lineHeight
      const targetScrollTop = scrollContainer.scrollTop + scrollDelta

      if (scrollAnimationRef.current !== null) {
        cancelAnimationFrame(scrollAnimationRef.current)
      }

      const startTop = scrollContainer.scrollTop
      const distance = targetScrollTop - startTop
      const startTime = performance.now()
      const durationMs = 2000

      function step(currentTime: number) {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / durationMs, 1)
        
        // easeInOutQuad
        const ease = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2

        if (scrollContainer) {
          scrollContainer.scrollTop = startTop + distance * ease
        }

        if (progress < 1) {
          scrollAnimationRef.current = requestAnimationFrame(step)
        } else {
          scrollAnimationRef.current = null
        }
      }

      scrollAnimationRef.current = requestAnimationFrame(step)
    }, [progressIndex, status])

    useEffect(() => {
      // Cleanup on unmount
      return () => {
        if (scrollAnimationRef.current !== null) {
          cancelAnimationFrame(scrollAnimationRef.current)
        }
      }
    }, [])

    const textStyle = {
      fontSize: `calc(1.125rem + ${fontSizeDelta}px)`,
      lineHeight: `calc(2rem + ${fontSizeDelta * 1.5}px)`
    }

    return (
      <section className={`flex flex-col gap-4 transition-all duration-500 ${isZenMode ? 'flex-1 min-h-0' : ''}`}>
        <div 
          className="rounded-md border border-slate-200 bg-white p-4 shadow-sm transition-all duration-500 ease-in-out dark:border-slate-800 dark:bg-slate-900 sm:p-5 flex flex-col overflow-hidden shrink-0"
          style={{ height: isZenMode ? '22rem' : '16rem' }}
        >
          <div
            ref={textScrollRef}
            className="flex-1 min-h-0 overflow-y-auto scroll-smooth whitespace-pre-wrap pr-2 text-left text-slate-800 dark:text-slate-200"
            style={textStyle}
          >
            {targetText}
          </div>
        </div>

        <div 
          className="rounded-md border border-slate-200 bg-white p-4 shadow-sm transition-all duration-500 ease-in-out dark:border-slate-800 dark:bg-slate-900 sm:p-5 flex flex-col overflow-hidden shrink-0"
          style={{ height: isZenMode ? 'calc(100vh - 30rem)' : '16rem' }}
        >
          <textarea
            ref={ref}
            id="typing-input"
            className="w-full h-full flex-1 min-h-0 resize-none rounded-md border border-slate-300 bg-slate-50 p-4 text-slate-900 shadow-inner outline-none transition-colors placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-500 dark:focus:bg-slate-950 dark:focus:ring-teal-500/30"
            style={textStyle}
            value={inputValue}
            disabled={status === 'finished'}
            placeholder="Yazmaya başladığında süre otomatik başlar."
            spellCheck={false}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={(event) => onTypingKeyDown(event.key)}
            onChange={(event) => onInputChange(event.target.value)}
            onPaste={(e) => e.preventDefault()}
          />
        </div>
      </section>
    )
  },
)
