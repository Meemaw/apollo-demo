"use client"
import { useEffect, useRef } from "react"

export function useAccumulateBatch<T>(
  callback: (items: T[]) => void,
  {
    delay = 3000,
    leading = true,
    // So we can discard accumulated items whenever e.g. filters change
    resetKey,
  }: { delay?: number; leading?: boolean; resetKey?: string } = {},
): (item: T) => void {
  const accumulated = useRef<T[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      accumulated.current = []
    }

    resetTimer()

    return resetTimer
  }, [resetKey])

  function batchFunction(item: T) {
    if (timerRef.current === null) {
      if (leading) {
        // Process the first item immediately
        callback([item])
      } else {
        accumulated.current.push(item)
      }

      // Start the timer for the batching window
      timerRef.current = setTimeout(() => {
        if (accumulated.current.length > 0) {
          callback(accumulated.current)
          accumulated.current = []
        }
        timerRef.current = null
      }, delay)
    } else {
      // We are within the delay window; batch subsequent calls
      accumulated.current.push(item)
    }
  }

  return batchFunction
}
