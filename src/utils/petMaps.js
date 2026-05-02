// ─── src/utils/petMaps.js ─────────────────────────────────────────────────────
// Regla: BD en inglés, UI en español.
// Todos los componentes importan desde aquí para ser consistentes.
// ─────────────────────────────────────────────────────────────────────────────

export const ANIMAL_TYPE_OPTIONS = [
  { value: 'dog',       label: 'Perro',   emoji: '🐕' },
  { value: 'cat',       label: 'Gato',    emoji: '🐈' },
  { value: 'bird',      label: 'Ave',     emoji: '🐦' },
  { value: 'rabbit',    label: 'Conejo',  emoji: '🐰' },
  { value: 'rodent',    label: 'Roedor',  emoji: '🐹' },
  { value: 'reptile',   label: 'Reptil',  emoji: '🦎' },
  { value: 'amphibian', label: 'Anfibio', emoji: '🐸' },
  { value: 'horse',     label: 'Equino',  emoji: '🐴' },
  { value: 'other',     label: 'Otro',    emoji: '🐾' },
]

export const SEX_OPTIONS = [
  { value: 'male',   label: 'Macho',  symbol: '♂' },
  { value: 'female', label: 'Hembra', symbol: '♀' },
]

// Helpers para mostrar texto legible en la UI
export const animalTypeLabel = (value) => {
  const opt = ANIMAL_TYPE_OPTIONS.find(o => o.value === value)
  return opt ? `${opt.emoji} ${opt.label}` : value
}

export const animalEmoji = (value) =>
  ANIMAL_TYPE_OPTIONS.find(o => o.value === value)?.emoji ?? '🐾'

export const animalGradient = (value) => {
  const map = {
    dog:       'linear-gradient(135deg, #F5A86B, #E07B3F)',
    cat:       'linear-gradient(135deg, #3D4E4B, #2C3836)',
    bird:      'linear-gradient(135deg, #87CEEB, #4682B4)',
    rabbit:    'linear-gradient(135deg, #DDA0DD, #9B59B6)',
    rodent:    'linear-gradient(135deg, #F0C080, #D4A050)',
    reptile:   'linear-gradient(135deg, #8BC34A, #558B2F)',
    amphibian: 'linear-gradient(135deg, #80CBC4, #00897B)',
    horse:     'linear-gradient(135deg, #BCAAA4, #795548)',
    other:     'linear-gradient(135deg, #A9A9A9, #808080)',
  }
  return map[value] ?? map.other
}

export const sexLabel = (value) => {
  if (value === 'male')   return '♂ Macho'
  if (value === 'female') return '♀ Hembra'
  return '—'
}

// Calcula la edad a partir de una fecha DATE de Supabase ("YYYY-MM-DD")
export const calcAge = (birthDate) => {
  if (!birthDate) return null
  const years = Math.floor(
    (new Date() - new Date(birthDate)) / (1000 * 60 * 60 * 24 * 365.25)
  )
  if (years < 1) return 'Menos de 1 año'
  return years === 1 ? '1 año' : `${years} años`
}