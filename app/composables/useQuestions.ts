import type { Question } from '~/types'

export async function fetchQuestions(): Promise<Question[]> {
  return $fetch<Question[]>('/api/questions')
}

export function useQuestions() {
  const { data: questions, pending, refresh } = useAsyncData('questions', fetchQuestions, {
    default: () => [] as Question[]
  })

  function mergeQuestions(updatedQuestions: Question[]) {
    const current = questions.value ?? []
    const map = new Map(current.map(question => [question.id, question]))

    for (const updated of updatedQuestions) {
      map.set(updated.id, updated)
    }

    questions.value = Array.from(map.values())
      .sort((a, b) => a.subcategory.localeCompare(b.subcategory) || a.title.localeCompare(b.title))
  }

  async function updateQuestion(
    id: string,
    updates: {
      title?: string
      hint?: string | null
      answer?: string
    }
  ) {
    const updated = await $fetch<Question>(`/api/questions/${id}`, {
      method: 'PUT',
      body: updates
    })

    if (questions.value?.length) {
      mergeQuestions([updated])
    }

    return updated
  }

  async function createQuestions(input: {
    slug?: string
    title: string
    subcategory: string
    difficulty: string
    hint?: string
    answer: string
    tags?: string[]
    source?: string
    notes?: string
  }[] | {
    slug?: string
    title: string
    subcategory: string
    difficulty: string
    hint?: string
    answer: string
    tags?: string[]
    source?: string
    notes?: string
  }) {
    const response = await $fetch<{
      created: number
      updated: number
      questions: Question[]
    }>('/api/questions', {
      method: 'POST',
      body: input
    })

    if (response.questions.length) {
      mergeQuestions(response.questions)
    }

    return response
  }

  function getQuestionById(id: string) {
    return questions.value?.find(q => q.id === id || q.path === `/${id}`)
  }

  return {
    questions,
    pending,
    refresh,
    getQuestionById,
    updateQuestion,
    createQuestions
  }
}
