import type { AppState, AppSettings, SessionRecord } from '~/types'
import { clearGuestState, readGuestState, writeGuestState } from '~/utils/guest-state'
import { createReviewState, updateStreak } from '~/utils/srs'

const DEFAULT_SETTINGS: AppSettings = {
  sessionSize: 5,
  defaultPracticeMode: 'mixed',
  customSubcategories: ['javascript', 'vue', 'behavioral']
}

function createDefaultState(): AppState {
  return {
    reviews: {},
    sessions: [],
    lastSessionDate: null,
    currentStreak: 0,
    longestStreak: 0,
    settings: { ...DEFAULT_SETTINGS },
    mutedQuestionIds: []
  }
}

let persistTimer: ReturnType<typeof setTimeout> | null = null

export function useReviewState() {
  const state = useState<AppState>('review-state', createDefaultState)
  const hydrated = useState('review-state-hydrated', () => false)
  const syncing = useState('review-state-syncing', () => false)
  const { isVisitor } = useAuth()

  async function hydrate() {
    if (!import.meta.client || hydrated.value) return

    // Ensure auth resolves first — visitors persist to localStorage instead of the server.
    const { data: authUser } = await useAsyncData('auth-me', fetchAuthUser, { default: () => null })

    if (!authUser.value) {
      state.value = { ...createDefaultState(), ...(readGuestState() ?? {}) }
      hydrated.value = true
      return
    }

    try {
      const data = await $fetch<AppState>('/api/state')
      state.value = { ...createDefaultState(), ...data }
    } catch {
      state.value = createDefaultState()
    }

    hydrated.value = true
  }

  function persist() {
    if (!import.meta.client || !hydrated.value) return

    if (persistTimer) clearTimeout(persistTimer)
    persistTimer = setTimeout(async () => {
      if (isVisitor.value) {
        writeGuestState(state.value)
        return
      }

      syncing.value = true
      try {
        await $fetch('/api/state', {
          method: 'PUT',
          body: state.value
        })
      } catch {
        // Keep local state; user can retry on next change
      } finally {
        syncing.value = false
      }
    }, 400)
  }

  if (import.meta.client) {
    onMounted(hydrate)
    watch(state, persist, { deep: true })
  }

  function getReview(questionId: string) {
    return state.value.reviews[questionId]
  }

  function ensureReview(questionId: string) {
    if (!state.value.reviews[questionId]) {
      state.value.reviews[questionId] = createReviewState(questionId)
    }
    return state.value.reviews[questionId]!
  }

  function updateSettings(partial: Partial<AppSettings>) {
    state.value.settings = { ...state.value.settings, ...partial }
  }

  function recordSession(session: SessionRecord) {
    state.value.sessions.push(session)
    const streak = updateStreak(
      state.value.lastSessionDate,
      state.value.currentStreak,
      state.value.longestStreak,
      session.date
    )
    state.value.lastSessionDate = streak.lastSessionDate
    state.value.currentStreak = streak.currentStreak
    state.value.longestStreak = streak.longestStreak
  }

  function isMuted(questionId: string) {
    return state.value.mutedQuestionIds.includes(questionId)
  }

  function toggleMute(questionId: string) {
    const muted = new Set(state.value.mutedQuestionIds)
    if (muted.has(questionId)) muted.delete(questionId)
    else muted.add(questionId)
    state.value.mutedQuestionIds = Array.from(muted)
  }

  function exportState(): string {
    return JSON.stringify(state.value, null, 2)
  }

  async function persistNow() {
    if (isVisitor.value) {
      writeGuestState(state.value)
      return
    }
    await $fetch('/api/state', {
      method: 'PUT',
      body: state.value
    })
  }

  async function importState(json: string) {
    const parsed = JSON.parse(json) as AppState
    state.value = { ...createDefaultState(), ...parsed }
    await persistNow()
  }

  async function resetProgress() {
    state.value = {
      ...createDefaultState(),
      settings: state.value.settings
    }
    if (isVisitor.value) clearGuestState()
    await persistNow()
  }

  return {
    state,
    hydrated,
    syncing,
    hydrate,
    getReview,
    ensureReview,
    updateSettings,
    recordSession,
    isMuted,
    toggleMute,
    exportState,
    importState,
    resetProgress
  }
}
