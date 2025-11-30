export interface WeatherData {
  temperature: number
  description: string
  icon: string
  city: string
  feelsLike: number
  humidity: number
}

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || ''
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5'

export async function getCurrentLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    )
  })
}

export async function getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
  if (!OPENWEATHER_API_KEY) {
    throw new Error('OpenWeatherMap API key is not configured')
  }

  const url = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ru`
  
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`)
  }

  const data = await response.json()

  return {
    temperature: Math.round(data.main.temp),
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    city: data.name,
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
  }
}

export async function getCurrentWeather(): Promise<WeatherData> {
  const CACHE_KEY = 'weather_cache'
  const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

  // Check cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      const now = Date.now()
      
      // If cache is still valid, use it
      if (now - timestamp < CACHE_DURATION) {
        return data
      }
    }
  } catch (error) {
    console.error('Failed to read weather cache:', error)
    // Continue to fetch if cache read fails
  }

  // Fetch from API
  try {
    const location = await getCurrentLocation()
    const weatherData = await getWeatherByCoords(location.lat, location.lon)
    
    // Cache the weather data
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: weatherData,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('Failed to cache weather:', error)
      // Non-critical error, continue
    }
    
    return weatherData
  } catch (error) {
    console.error('Failed to get weather:', error)
    throw error
  }
}

export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}

