/**
 * Получает часовой пояс пользователя в часах относительно UTC
 * Например, для UTC+5 вернет 5, для UTC-5 вернет -5
 */
export function getUserTimezoneOffset(): number {
  // JavaScript Date.getTimezoneOffset() возвращает смещение в минутах
  // и оно отрицательное для часовых поясов восточнее UTC
  // Например, для UTC+5 (Алматы) вернет -300 минут
  // Нам нужно преобразовать в часы и инвертировать знак
  const offsetMinutes = new Date().getTimezoneOffset()
  // Инвертируем знак, потому что getTimezoneOffset возвращает противоположное значение
  return -offsetMinutes / 60
}

/**
 * Получает строку часового пояса пользователя (например, "Asia/Almaty")
 * Возвращает null, если Intl API недоступен
 */
export function getUserTimezoneName(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return null
  }
}









