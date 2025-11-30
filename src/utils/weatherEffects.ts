export type WeatherEffect = 
  | 'none'
  | 'snow'
  | 'rain'
  | 'leaves'
  | 'stars'

export interface WeatherEffectOption {
  value: WeatherEffect
  label: string
  description: string
}

export const weatherEffectOptions: WeatherEffectOption[] = [
  {
    value: 'none',
    label: 'Без эффектов',
    description: 'Обычный интерфейс без эффектов',
  },
  {
    value: 'snow',
    label: 'Снег',
    description: 'Снегопад в честь Нового года',
  },
  {
    value: 'rain',
    label: 'Дождь',
    description: 'Дождевые капли',
  },
  {
    value: 'leaves',
    label: 'Листья',
    description: 'Падающие осенние листья',
  },
  {
    value: 'stars',
    label: 'Звёзды',
    description: 'Падающие звёзды',
  },
]

const WEATHER_EFFECT_STORAGE_KEY = 'weather_effect'

export function getWeatherEffect(): WeatherEffect {
  try {
    const saved = localStorage.getItem(WEATHER_EFFECT_STORAGE_KEY)
    if (saved && weatherEffectOptions.some(e => e.value === saved)) {
      return saved as WeatherEffect
    }
  } catch (error) {
    console.error('Failed to read weather effect preference:', error)
  }
  return 'none' // Default
}

export function setWeatherEffect(effect: WeatherEffect): void {
  try {
    localStorage.setItem(WEATHER_EFFECT_STORAGE_KEY, effect)
  } catch (error) {
    console.error('Failed to save weather effect preference:', error)
  }
}

