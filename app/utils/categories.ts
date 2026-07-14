import type { Category, Difficulty, PracticeModePreset, Subcategory } from '~/types'
import type { RatingColor } from './srs'

export const SUBCATEGORY_LABELS: Record<Subcategory, string> = {
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'vue': 'Vue',
  'angular': 'Angular',
  'node': 'Node.js',
  'problem-solving': 'Problem Solving',
  'behavioral': 'Behavioral',
  'communication': 'Communication',
  'career': 'Career'
}

export const SUBCATEGORY_ICONS: Record<Subcategory, string> = {
  'javascript': 'i-simple-icons-javascript',
  'typescript': 'i-simple-icons-typescript',
  'vue': 'i-simple-icons-vuedotjs',
  'angular': 'i-simple-icons-angular',
  'node': 'i-simple-icons-nodedotjs',
  'problem-solving': 'i-lucide-puzzle',
  'behavioral': 'i-lucide-users',
  'communication': 'i-lucide-message-circle',
  'career': 'i-lucide-briefcase'
}

export const DIFFICULTY_COLORS: Record<Difficulty, RatingColor> = {
  easy: 'success',
  medium: 'warning',
  hard: 'error'
}

export const TECHNICAL_SUBCATEGORIES: Subcategory[] = [
  'javascript',
  'typescript',
  'vue',
  'angular',
  'node',
  'problem-solving'
]

export const NON_TECHNICAL_SUBCATEGORIES: Subcategory[] = [
  'behavioral',
  'communication',
  'career'
]

export const ALL_SUBCATEGORIES: Subcategory[] = [
  ...TECHNICAL_SUBCATEGORIES,
  ...NON_TECHNICAL_SUBCATEGORIES
]

export const PRACTICE_MODE_OPTIONS: { value: PracticeModePreset, label: string, description?: string }[] = [
  { value: 'mixed', label: 'Mixed', description: 'All categories' },
  { value: 'technical', label: 'Technical Only', description: 'All technical topics' },
  { value: 'non-technical', label: 'Non-Technical Only', description: 'Behavioral, communication, career' },
  { value: 'javascript', label: 'JavaScript Only' },
  { value: 'typescript', label: 'TypeScript Only' },
  { value: 'vue', label: 'Vue Only' },
  { value: 'angular', label: 'Angular Only' },
  { value: 'node', label: 'Node Only' },
  { value: 'problem-solving', label: 'Problem Solving Only' },
  { value: 'custom', label: 'Custom', description: 'Pick topics in Settings' }
]

export function getSubcategoriesForMode(
  mode: PracticeModePreset,
  customSubcategories: Subcategory[]
): Subcategory[] | null {
  switch (mode) {
    case 'mixed':
      return null
    case 'technical':
      return TECHNICAL_SUBCATEGORIES
    case 'non-technical':
      return NON_TECHNICAL_SUBCATEGORIES
    case 'javascript':
    case 'typescript':
    case 'vue':
    case 'angular':
    case 'node':
    case 'problem-solving':
      return [mode]
    case 'custom':
      return customSubcategories.length > 0 ? customSubcategories : ALL_SUBCATEGORIES
  }
}

export function getCategoryForSubcategory(subcategory: Subcategory): Category {
  return TECHNICAL_SUBCATEGORIES.includes(subcategory) ? 'technical' : 'non-technical'
}

export function formatSubcategory(subcategory: Subcategory): string {
  return SUBCATEGORY_LABELS[subcategory] ?? subcategory
}

export function formatDifficulty(difficulty: string): string {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
}
