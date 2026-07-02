export type Category = 'technical' | 'non-technical'

export type Subcategory =
  | 'javascript'
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

export type PracticeModePreset =
  | 'mixed'
  | 'technical'
  | 'non-technical'
  | 'javascript'
  | 'typescript'
  | 'vue'
  | 'angular'
  | 'node'
  | 'problem-solving'
  | 'custom'

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

export interface SessionRecord {
  date: string
  questionsCount: number
  averageConfidence: number
  durationMinutes: number
}

export interface AppSettings {
  sessionSize: number
  defaultPracticeMode: PracticeModePreset
  customSubcategories: Subcategory[]
}

export interface AppState {
  reviews: Record<string, ReviewState>
  sessions: SessionRecord[]
  lastSessionDate: string | null
  currentStreak: number
  longestStreak: number
  settings: AppSettings
}

export interface ActiveSession {
  questionIds: string[]
  currentIndex: number
  startedAt: number
  mode: PracticeModePreset
  ratings: Rating[]
}

export type QuestionStatus = 'new' | 'due' | 'mastered' | 'scheduled'
