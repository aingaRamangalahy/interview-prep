import type { Question, Subcategory } from '~/types'

export async function fetchQuestions(): Promise<Question[]> {
  const docs = await queryCollection('questions').all()

  return docs.map((doc) => {
    const subcategory = doc.subcategory as Subcategory
    const path = doc.path ?? doc.id

    return {
      id: path.replace(/^\//, ''),
      title: doc.title,
      category: doc.category,
      subcategory,
      difficulty: doc.difficulty,
      hint: doc.hint,
      tags: doc.tags ?? [],
      source: doc.source,
      notes: doc.notes,
      body: doc.body,
      path
    }
  })
}

export function useQuestions() {
  const { data: questions, pending, refresh } = useAsyncData('questions', fetchQuestions, {
    default: () => [] as Question[]
  })

  function getQuestionById(id: string) {
    return questions.value?.find(q => q.id === id || q.path === id)
  }

  return {
    questions,
    pending,
    refresh,
    getQuestionById
  }
}
