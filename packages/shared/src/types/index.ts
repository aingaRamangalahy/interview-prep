export type Category = 'technical' | 'non-technical'

export type Subcategory
  = | 'javascript'
    | 'typescript'
    | 'vue'
    | 'angular'
    | 'node'
    | 'problem-solving'
    | 'behavioral'
    | 'communication'
    | 'career'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type Rating = 'easy' | 'good' | 'hard' | 'again'

export interface Question {
  id: string
  title: string
  category: Category
  subcategory: Subcategory
  difficulty: Difficulty
  hint?: string
  tags: string[]
  source?: string
  notes?: string
  answer: string
  path: string
}

export interface ReviewState {
  questionId: string
  lastRating: Rating | null
  nextReviewDate: string | null
  reviewCount: number
  lastReviewedAt: string | null
  mastered: boolean
}

export interface ExtensionProgress {
  reviews: Record<string, ReviewState>
  lastSessionDate: string | null
  currentStreak: number
  longestStreak: number
  completedSessions: number
}
