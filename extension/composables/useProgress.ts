import {
  applyRating,
  createDefaultProgress,
  createReviewState,
  todayISO,
  updateStreak,
  type ExtensionProgress,
  type Rating
} from '@interview-prep/shared'
import { storage } from 'wxt/utils/storage'

export const progressItem = storage.defineItem<ExtensionProgress>('local:progress', {
  fallback: createDefaultProgress()
})

export function useProgress() {
  async function load(): Promise<ExtensionProgress> {
    return progressItem.getValue()
  }

  async function save(progress: ExtensionProgress): Promise<void> {
    await progressItem.setValue(progress)
  }

  async function rateQuestion(questionId: string, rating: Rating): Promise<ExtensionProgress> {
    const progress = await load()
    const current = progress.reviews[questionId] ?? createReviewState(questionId)
    progress.reviews[questionId] = applyRating(current, rating)
    await save(progress)
    return progress
  }

  async function completeSession(): Promise<ExtensionProgress> {
    const progress = await load()
    const streak = updateStreak(
      progress.lastSessionDate,
      progress.currentStreak,
      progress.longestStreak,
      todayISO()
    )
    const next: ExtensionProgress = {
      ...progress,
      ...streak,
      completedSessions: progress.completedSessions + 1
    }
    await save(next)
    return next
  }

  async function resetProgress(): Promise<ExtensionProgress> {
    const next = createDefaultProgress()
    await save(next)
    return next
  }

  return {
    load,
    save,
    rateQuestion,
    completeSession,
    resetProgress
  }
}
