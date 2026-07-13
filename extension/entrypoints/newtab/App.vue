<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import type { Rating } from '@interview-prep/shared'
import MarkdownContent from '../../components/MarkdownContent.vue'
import RatingButtons from '../../components/RatingButtons.vue'
import { useFlashCards } from '../../composables/useFlashCards'

const {
  ready,
  progress,
  currentQuestion,
  showAnswer,
  showHint,
  sessionComplete,
  sessionProgress,
  ratings,
  startSession,
  revealAnswer,
  rate,
  restart
} = useFlashCards()

onMounted(() => {
  startSession()
})

watch(currentQuestion, () => {
  showHint.value = false
  showAnswer.value = false
})

function handleRate(rating: Rating) {
  rate(rating)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
  if (sessionComplete.value) return

  if (event.code === 'Space' && !showAnswer.value) {
    event.preventDefault()
    revealAnswer()
    return
  }

  if (!showAnswer.value) return

  const ratingMap: Record<string, Rating> = {
    1: 'again',
    2: 'hard',
    3: 'good',
    4: 'easy'
  }

  if (ratingMap[event.key]) {
    event.preventDefault()
    handleRate(ratingMap[event.key]!)
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

function difficultyLabel(difficulty: string) {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
}
</script>

<template>
  <div class="page">
    <header class="header">
      <div class="brand">
        <img
          class="brand-mark"
          src="/icon-128.png"
          width="40"
          height="40"
          alt=""
        >
        <div>
          <p class="brand-name">
            FlashTab
          </p>
          <p class="brand-sub">
            JavaScript · new tab
          </p>
        </div>
      </div>
      <div
        v-if="progress"
        class="streak"
      >
        <span class="streak-value">{{ progress.currentStreak }}</span>
        <span class="streak-label">day streak</span>
      </div>
    </header>

    <main
      v-if="!ready"
      class="center"
    >
      <p class="muted">
        Loading…
      </p>
    </main>

    <main
      v-else-if="sessionComplete"
      class="center complete"
    >
      <p class="complete-kicker">
        Session complete
      </p>
      <h1 class="complete-title">
        Nice work.
      </h1>
      <p class="muted">
        You rated {{ ratings.length }} questions.
        Streak: {{ progress?.currentStreak ?? 0 }} day{{ (progress?.currentStreak ?? 0) === 1 ? '' : 's' }}.
      </p>
      <button
        type="button"
        class="primary-btn"
        @click="restart"
      >
        Start another 5
      </button>
    </main>

    <main
      v-else-if="currentQuestion"
      class="session"
    >
      <div class="progress-row">
        <span>Question {{ sessionProgress.current }} / {{ sessionProgress.total }}</span>
        <div class="progress-track">
          <div
            class="progress-fill"
            :style="{ width: `${(sessionProgress.current / sessionProgress.total) * 100}%` }"
          />
        </div>
      </div>

      <section class="card">
        <div class="meta">
          <span class="badge">JavaScript</span>
          <span class="badge outline">{{ difficultyLabel(currentQuestion.difficulty) }}</span>
        </div>
        <h1 class="question-title">
          {{ currentQuestion.title }}
        </h1>
      </section>

      <div class="actions">
        <button
          v-if="!showHint && currentQuestion.hint"
          type="button"
          class="ghost-btn"
          @click="showHint = true"
        >
          Show hint
        </button>

        <div
          v-if="showHint && currentQuestion.hint"
          class="hint"
        >
          {{ currentQuestion.hint }}
        </div>

        <button
          v-if="!showAnswer"
          type="button"
          class="primary-btn"
          @click="revealAnswer"
        >
          Reveal answer
          <kbd>Space</kbd>
        </button>

        <div
          v-if="showAnswer"
          class="answer"
        >
          <MarkdownContent :content="currentQuestion.answer" />
        </div>
      </div>

      <div
        v-if="showAnswer"
        class="rate-block"
      >
        <p class="muted">
          How well did you know this?
        </p>
        <RatingButtons @rate="handleRate" />
      </div>
    </main>

    <main
      v-else
      class="center"
    >
      <p class="muted">
        No questions available.
      </p>
    </main>
  </div>
</template>
