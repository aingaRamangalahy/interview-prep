import type { AppState } from '~/types'

export const GUEST_STATE_KEY = 'iprep:guest-state'
export const GUEST_MERGE_DISMISSED_KEY = 'iprep:guest-merge-dismissed'

export function readGuestState(): AppState | null {
  if (!import.meta.client) return null

  try {
    const raw = localStorage.getItem(GUEST_STATE_KEY)
    return raw ? (JSON.parse(raw) as AppState) : null
  } catch {
    return null
  }
}

export function writeGuestState(state: AppState) {
  if (!import.meta.client) return

  try {
    localStorage.setItem(GUEST_STATE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage errors (quota exceeded, private browsing, etc.)
  }
}

export function clearGuestState() {
  if (!import.meta.client) return
  localStorage.removeItem(GUEST_STATE_KEY)
}

export function hasGuestProgress(state: AppState | null): boolean {
  return !!state && Object.keys(state.reviews).length > 0
}

/** Most-recent-review wins per question; muted ids are unioned. */
export function mergeAppStates(serverState: AppState, guestState: AppState): AppState {
  const reviews = { ...serverState.reviews }

  for (const [id, guestReview] of Object.entries(guestState.reviews)) {
    const serverReview = reviews[id]
    if (!serverReview || (guestReview.lastReviewedAt ?? '') > (serverReview.lastReviewedAt ?? '')) {
      reviews[id] = guestReview
    }
  }

  const mutedQuestionIds = Array.from(
    new Set([...(serverState.mutedQuestionIds ?? []), ...(guestState.mutedQuestionIds ?? [])])
  )

  return {
    ...serverState,
    reviews,
    mutedQuestionIds
  }
}
