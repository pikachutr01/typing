import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MetricStrip } from './components/MetricStrip'
import { ResultPanel } from './components/ResultPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { TypingWorkspace } from './components/TypingWorkspace'
import type { DurationMinutes, TestStatus, TypingText } from './types/typing'
import { calculateTypingResult } from './utils/calculateMetrics'
import { diffText } from './utils/diffText'
import { getReachedExpectedText } from './utils/evaluateExamRules'
import { checkTestHistory, saveTestHistory } from './utils/history'
import { HistoryModal } from './components/HistoryModal'
import { api } from './lib/api'
import { useAuthStore } from './store/authStore'
import { AuthModal } from './components/AuthModal'

function isTypingKey(key: string) {
  return key.length === 1 || key === 'Backspace' || key === 'Delete' || key === 'Enter'
}

function App() {
  const { user } = useAuthStore()
  const [allTexts, setAllTexts] = useState<TypingText[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTextId, setSelectedTextId] = useState<string | number>('')

  useEffect(() => {
    api.get('/texts/all').then((res) => {
      const fetchedTexts = res.data.map((t: any) => ({ ...t, category: t.category_name }))
      setAllTexts(fetchedTexts)
      const cats: string[] = Array.from(new Set(fetchedTexts.map((t: any) => t.category_name)))
      setCategories(cats)
      if (cats.length > 0) {
        setSelectedCategory(cats[0])
        const firstText = fetchedTexts.find((t: any) => t.category === cats[0])
        if (firstText) setSelectedTextId(firstText.id)
      }
    }).catch(err => {
      console.error(err)
    })
  }, [])

  const availableTexts = useMemo(
    () => allTexts.filter((t) => (t.category || 'Diğer') === selectedCategory),
    [allTexts, selectedCategory]
  )

  const [durationMinutes, setDurationMinutes] = useState<DurationMinutes>(3)
  const [status, setStatus] = useState<TestStatus>('idle')
  const [inputValue, setInputValue] = useState('')
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [endedAt, setEndedAt] = useState<number | null>(null)
  const [keystrokeCount, setKeystrokeCount] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(durationMinutes * 60)
  const [hasSavedResult, setHasSavedResult] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [hasHistory, setHasHistory] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const selectedText = useMemo(
    () =>
      availableTexts.find((text) => text.id === selectedTextId) ?? availableTexts[0],
    [selectedTextId, availableTexts],
  )
  const targetText = selectedText?.content ?? ''
  const comparableInput = inputValue
  const totalSeconds = durationMinutes * 60

  const resetToIdle = useCallback((nextTotalSeconds: number) => {
    setStatus('idle')
    setInputValue('')
    setStartedAt(null)
    setEndedAt(null)
    setKeystrokeCount(0)
    setRemainingSeconds(nextTotalSeconds)
    setHasSavedResult(false)
  }, [])

  const resetTest = useCallback(() => {
    resetToIdle(totalSeconds)
  }, [resetToIdle, totalSeconds])

  const handleTextChange = useCallback(
    (textId: string | number) => {
      setSelectedTextId(textId)
      resetToIdle(durationMinutes * 60)
    },
    [durationMinutes, resetToIdle],
  )

  const handleCategoryChange = useCallback(
    (category: string) => {
      setSelectedCategory(category)
      const newAvailable = allTexts.filter((t) => (t.category || 'Diğer') === category)
      setSelectedTextId(newAvailable[0]?.id ?? allTexts[0]?.id ?? '')
      resetToIdle(totalSeconds)
    },
    [resetToIdle, totalSeconds, allTexts],
  )

  const handleDurationChange = useCallback(
    (duration: DurationMinutes) => {
      setDurationMinutes(duration)
      resetToIdle(duration * 60)
    },
    [resetToIdle],
  )

  const finishTest = useCallback(() => {
    setStatus((currentStatus) => {
      if (currentStatus !== 'running') {
        return currentStatus
      }

      setEndedAt(Date.now())
      setRemainingSeconds(0)
      return 'finished'
    })
  }, [])

  const startTest = useCallback(
    (initialValue: string) => {
      const now = Date.now()

      setInputValue(initialValue)
      setStartedAt(now)
      setEndedAt(null)
      setRemainingSeconds(totalSeconds)
      setStatus('running')
    },
    [totalSeconds],
  )

  const handleInputChange = useCallback(
    (value: string) => {
      if (status === 'finished') {
        return
      }

      if (status === 'idle' && value.length > 0) {
        startTest(value)
        return
      }

      setInputValue(value)
    },
    [startTest, status],
  )

  const handleTypingKeyDown = useCallback(
    (key: string) => {
      if (status === 'finished' || !isTypingKey(key)) {
        return
      }

      setKeystrokeCount((currentCount) => currentCount + 1)
    },
    [status],
  )

  useEffect(() => {
    if (status !== 'running' || startedAt === null) {
      return
    }

    const timerId = window.setInterval(() => {
      const elapsedSeconds = (Date.now() - startedAt) / 1000
      const nextRemainingSeconds = Math.max(
        0,
        Math.ceil(totalSeconds - elapsedSeconds),
      )

      setRemainingSeconds(nextRemainingSeconds)

      if (nextRemainingSeconds <= 0) {
        finishTest()
      }
    }, 250)

    return () => window.clearInterval(timerId)
  }, [finishTest, startedAt, status, totalSeconds])

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F5') {
        event.preventDefault()
        resetTest()
        setTimeout(() => inputRef.current?.focus(), 0)
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [resetTest])

  const elapsedSeconds = useMemo(() => {
    if (startedAt === null) {
      return 0
    }

    if (endedAt !== null) {
      return Math.min(totalSeconds, (endedAt - startedAt) / 1000)
    }

    return Math.min(totalSeconds, totalSeconds - remainingSeconds)
  }, [endedAt, remainingSeconds, startedAt, totalSeconds])

  const comparableInputForResult = useMemo(
    () => comparableInput.trimEnd(),
    [comparableInput],
  )
  const result = useMemo(() => {
    if (status !== 'finished') {
      return undefined
    }

    const evaluatedTargetText = getReachedExpectedText(
      targetText,
      comparableInputForResult,
    )
    const segments = diffText(evaluatedTargetText, comparableInputForResult)

    return calculateTypingResult(
      evaluatedTargetText,
      comparableInputForResult,
      Math.max(elapsedSeconds, 1),
      segments,
      keystrokeCount,
    )
  }, [comparableInputForResult, elapsedSeconds, keystrokeCount, status, targetText])

  useEffect(() => {
    if (status === 'finished' && result !== undefined && !hasSavedResult) {
      saveTestHistory(selectedTextId, durationMinutes, result, comparableInput).then(() => {
        setHasSavedResult(true)
      })
    }
  }, [status, result, selectedTextId, durationMinutes, hasSavedResult, comparableInput])

  useEffect(() => {
    document.title = selectedText ? `${selectedText.title} - Hızlı Klavye Sınavı` : 'Hızlı Klavye Sınavı'
  }, [selectedText])

  useEffect(() => {
    if (selectedTextId) {
      checkTestHistory(selectedTextId).then(setHasHistory)
    }
  }, [selectedTextId, hasSavedResult, isHistoryModalOpen, user])

  const errorCount =
    result === undefined ? undefined : result.wordErrorCount
  const isZenMode = status !== 'finished' && (isFocused || status === 'running')

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <SettingsPanel
        texts={availableTexts}
        selectedTextId={selectedTextId}
        durationMinutes={durationMinutes}
        status={status}
        onTextChange={handleTextChange}
        onDurationChange={handleDurationChange}
        onReset={resetTest}
        onFinish={finishTest}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        hasHistory={hasHistory}
        onShowHistory={() => setIsHistoryModalOpen(true)}
        isZenMode={isZenMode}
        remainingSeconds={remainingSeconds}
        onLoginClick={() => setIsAuthModalOpen(true)}
      />

      <main className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {!isZenMode && status === 'finished' && (
          <MetricStrip
            accuracy={result?.accuracy}
            errorCount={errorCount}
          />
        )}

        {result === undefined ? (
          <TypingWorkspace
            ref={inputRef}
            targetText={targetText}
            inputValue={inputValue}
            status={status}
            onInputChange={handleInputChange}
            onTypingKeyDown={handleTypingKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        ) : (
          <ResultPanel result={result} />
        )}
      </main>

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        textId={selectedTextId}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}

export default App
