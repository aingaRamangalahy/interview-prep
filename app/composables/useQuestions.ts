import type { Question } from '~/types'

export async function fetchQuestions(): Promise<Question[]> {
  return $fetch<Question[]>('/api/questions')
}

export function useQuestions() {
  const { data: questions, pending, refresh } = useAsyncData('questions', fetchQuestions, {
    default: () => [] as Question[]
  })

  function getQuestionById(id: string) {
    return questions.value?.find(q => q.id === id || q.path === `/${id}`)
  }

  return {
    questions,
    pending,
    refresh,
    getQuestionById
  }
}
