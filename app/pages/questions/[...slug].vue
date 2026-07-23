<script setup lang="ts">
import { DIFFICULTY_COLORS, formatDifficulty, formatSubcategory, SUBCATEGORY_ICONS } from '~/utils/categories'

const route = useRoute()
const toast = useToast()
const { questions, pending, updateQuestion, setQuestionStatus } = useQuestions()
// Await the shared questions payload so SSR meta/OG see the question on first paint.
await useAsyncData('questions', fetchQuestions, { default: () => [] })
const { getQuestionStatus } = useStatistics()
const { isMuted, toggleMute } = useReviewState()
const { isAdmin, isVisitor } = useAuth()
const isEditing = ref(false)
const isSaving = ref(false)
const draftTitle = ref('')
const draftHint = ref('')
const draftAnswer = ref('')
const isArchiving = ref(false)
const showArchiveConfirm = ref(false)

const questionId = computed(() => {
  const param = route.params.slug
  return Array.isArray(param) ? param.join('/') : String(param)
})

const question = computed(() =>
  questions.value?.find(q => q.id === questionId.value)
)

useQuestionSeo(question)

watch(question, (value) => {
  if (!value) return
  draftTitle.value = value.title
  draftHint.value = value.hint ?? ''
  draftAnswer.value = value.answer ?? ''
}, { immediate: true })

function startEditing() {
  if (!question.value) return
  draftTitle.value = question.value.title
  draftHint.value = question.value.hint ?? ''
  draftAnswer.value = question.value.answer ?? ''
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
  if (!question.value) return
  draftTitle.value = question.value.title
  draftHint.value = question.value.hint ?? ''
  draftAnswer.value = question.value.answer ?? ''
}

async function saveEdits() {
  if (!question.value || isSaving.value) return

  const title = draftTitle.value.trim()
  const answer = draftAnswer.value.trim()
  const hint = draftHint.value.trim()

  if (!title) {
    toast.add({ title: 'Question title is required', color: 'warning' })
    return
  }

  if (!answer) {
    toast.add({ title: 'Answer is required', color: 'warning' })
    return
  }

  try {
    isSaving.value = true
    await updateQuestion(question.value.id, {
      title,
      hint: hint ? hint : null,
      answer
    })
    isEditing.value = false
    toast.add({ title: 'Question updated', color: 'success' })
  } catch {
    toast.add({ title: 'Failed to update question', color: 'error' })
  } finally {
    isSaving.value = false
  }
}

async function toggleArchive() {
  if (!question.value || isArchiving.value) return

  const nextStatus = question.value.status === 'archived' ? 'active' : 'archived'

  try {
    isArchiving.value = true
    await setQuestionStatus(question.value.id, nextStatus)
    showArchiveConfirm.value = false
    toast.add({
      title: nextStatus === 'archived' ? 'Question archived for all users' : 'Question restored',
      color: nextStatus === 'archived' ? 'warning' : 'success'
    })
  } catch {
    toast.add({ title: 'Failed to update question status', color: 'error' })
  } finally {
    isArchiving.value = false
  }
}
</script>

<template>
  <div
    v-if="pending"
    class="space-y-4"
  >
    <USkeleton class="h-8 w-2/3" />
    <USkeleton class="h-32 w-full" />
  </div>

  <div
    v-else-if="!question"
    class="space-y-4 rounded-2xl border border-dashed border-default p-10 text-center"
  >
    <UIcon
      name="i-lucide-file-question"
      class="mx-auto size-6 text-muted"
    />
    <p class="text-muted">
      Question not found.
    </p>
    <UButton to="/questions">
      Back to library
    </UButton>
  </div>

  <div
    v-else
    class="space-y-6"
  >
    <UButton
      to="/questions"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back
    </UButton>

    <div class="space-y-3 rounded-2xl border border-default/80 bg-elevated/30 p-5 sm:p-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <UBadge
            color="neutral"
            variant="subtle"
            :icon="SUBCATEGORY_ICONS[question.subcategory]"
          >
            {{ formatSubcategory(question.subcategory) }}
          </UBadge>
          <UBadge
            :color="DIFFICULTY_COLORS[question.difficulty]"
            variant="subtle"
          >
            {{ formatDifficulty(question.difficulty) }}
          </UBadge>
          <QuestionStatusBadge :status="getQuestionStatus(question.id)" />
          <UBadge
            v-if="isAdmin && question.status === 'archived'"
            color="neutral"
            variant="soft"
            icon="i-lucide-archive"
          >
            Archived
          </UBadge>
          <UBadge
            v-if="!isVisitor && isMuted(question.id)"
            color="neutral"
            variant="soft"
            icon="i-lucide-bell-off"
          >
            Muted
          </UBadge>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            v-if="!isVisitor"
            color="neutral"
            variant="soft"
            :icon="isMuted(question.id) ? 'i-lucide-bell' : 'i-lucide-bell-off'"
            size="sm"
            @click="toggleMute(question.id)"
          >
            {{ isMuted(question.id) ? 'Unmute' : 'Mute' }}
          </UButton>
          <UButton
            v-if="isAdmin && question.status === 'archived'"
            color="success"
            variant="soft"
            icon="i-lucide-archive-restore"
            size="sm"
            :loading="isArchiving"
            @click="toggleArchive"
          >
            Restore
          </UButton>
          <UButton
            v-else-if="isAdmin"
            color="warning"
            variant="soft"
            icon="i-lucide-archive"
            size="sm"
            @click="showArchiveConfirm = true"
          >
            Archive
          </UButton>
          <UButton
            v-if="isAdmin && !isEditing"
            color="neutral"
            variant="soft"
            icon="i-lucide-pencil"
            size="sm"
            @click="startEditing"
          >
            Edit
          </UButton>
          <template v-else-if="isAdmin">
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              @click="cancelEditing"
            >
              Cancel
            </UButton>
            <UButton
              size="sm"
              :loading="isSaving"
              icon="i-lucide-save"
              @click="saveEdits"
            >
              Save
            </UButton>
          </template>
        </div>
      </div>

      <div v-if="!isEditing">
        <h1 class="text-2xl font-semibold text-highlighted">
          {{ question.title }}
        </h1>
      </div>
      <UInput
        v-else
        v-model="draftTitle"
        class="w-full"
        placeholder="Question title"
      />
    </div>

    <UCard v-if="isEditing">
      <UFormField
        label="Hint"
        hint="Optional"
        description="Shown before revealing the answer during practice."
      >
        <UTextarea
          v-model="draftHint"
          class="w-full"
          :rows="3"
          placeholder="Optional hint"
        />
      </UFormField>
    </UCard>
    <UAlert
      v-else-if="question.hint"
      color="warning"
      variant="subtle"
      icon="i-lucide-lightbulb"
      :description="question.hint"
    />

    <UCard>
      <UFormField
        v-if="isEditing"
        label="Answer"
        description="Markdown supported."
      >
        <UTextarea
          v-model="draftAnswer"
          class="w-full"
          :rows="14"
          placeholder="Write the ideal answer in markdown..."
        />
      </UFormField>
      <template v-else>
        <p class="mb-3 text-sm font-medium text-muted">
          Ideal Answer
        </p>
        <div class="prose dark:prose-invert max-w-none">
          <MarkdownContent
            v-if="question.answer"
            :content="question.answer"
          />
          <p
            v-else
            class="text-sm text-muted"
          >
            No answer content yet.
          </p>
        </div>
      </template>
    </UCard>

    <UModal v-model:open="showArchiveConfirm">
      <template #content>
        <UCard>
          <p class="font-medium text-highlighted">
            Archive for all users?
          </p>
          <p class="mt-2 text-sm text-muted">
            This hides the question from everyone's library and practice sessions. It can be restored later, and
            existing progress/history is kept. This is different from Mute, which only affects you.
          </p>
          <div class="mt-4 flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              @click="showArchiveConfirm = false"
            >
              Cancel
            </UButton>
            <UButton
              color="warning"
              :loading="isArchiving"
              @click="toggleArchive"
            >
              Archive
            </UButton>
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
