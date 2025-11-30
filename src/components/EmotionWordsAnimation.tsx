import { useEffect, useState, useMemo } from 'react'
import { Box, Text } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'

const emotions = [
  'Радость', 'Грусть', 'Тревога', 'Спокойствие', 'Восторг', 'Надежда', 'Страх', 
  'Любовь', 'Умиротворение', 'Вдохновение', 'Усталость', 'Благодарность', 'Стыд', 
  'Гордость', 'Счастье', 'Тоска', 'Нежность', 'Апатия', 'Энтузиазм', 'Меланхолия',
  'Ясность', 'Осознанность', 'Трепет', 'Азарт', 'Ностальгия'
]

const thoughts = [
   // --- Старое (База) ---
   'почему я?', 'а что если...', 'надо разобраться', 'кто я на самом деле?', 
   'правильный выбор?', 'откуда это чувство?', 'просто тишина', 'сил нет', 
   'нужна пауза', 'все наладится', 'я смогу', 'шаг за шагом', 'дышать легче', 
   'вижу свет', 'странно...', 'время летит', 'с чистого листа',
 
   // --- Новое (Сомнения и поиск) ---
   'куда я иду?', 'в чем смысл?', 'это знак?', 'слушай себя', 
   'голос внутри', 'слишком сложно', 'замкнутый круг', 'хочу понять',
   'быть собой', 'сбросить маски', 'это иллюзия?', 'страх отступает',
   
   // --- Новое (Момент и чувства) ---
   'вдох-выдох', 'сердце бьется', 'остановись', 'здесь и сейчас',
   'момент истины', 'пустота внутри', 'искры радости', 'тяжело на душе',
   'отпусти ситуацию', 'просто быть', 'чувствую жизнь', 'холодный разум',
   
   // --- Новое (Короткие вспышки) ---
   'подожди...', 'не сейчас', 'важно', 'зачем?', 'возможно...', 
   'рискнуть?', 'хватит думать', 'еще раз', 'начало', 'конец?',
   
   // --- Новое (Надежда и Ресурс) ---
   'солнце взойдет', 'я сильнее', 'доверься процессу', 'пазл сложился',
   'ясный взгляд', 'тепло', 'свобода', 'новый день', 'все проходит',
   'мой выбор', 'ценный урок', 'благодарю', 'живи'
 ]

interface WordItem {
  id: string
  text: string
  x: number
  y: number
  size: number
  opacity: number
  type: 'emotion' | 'thought'
  animDuration: number
  animDelay: number
  driftX: number
}

// Функция перемешивания массива
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array]
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr
}

export function MoodBackground() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const random = (min: number, max: number) => Math.random() * (max - min) + min

  // Проверка "Безопасной зоны" (центр экрана)
  const isInSafeZone = (x: number, y: number) => {
    // Зона очистки: от 15% до 85% по ширине, от 25% до 75% по высоте
    return (x > 15 && x < 85) && (y > 25 && y < 75)
  }

  const words = useMemo(() => {
    if (!mounted && typeof window === 'undefined') return []
    
    // 1. Настройка сетки
    // Чем больше ячеек, тем равномернее распределение
    const rows = isMobile ? 6 : 8
    const cols = isMobile ? 4 : 8
    
    // Генерируем все возможные ячейки сетки
    let availableSlots: { x: number, y: number }[] = []

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Вычисляем границы ячейки в процентах
        const minX = (c / cols) * 100
        const maxX = ((c + 1) / cols) * 100
        const minY = (r / rows) * 100
        const maxY = ((r + 1) / rows) * 100

        // Выбираем случайную точку ВНУТРИ ячейки (с отступами 2%, чтобы не липли к краям ячеек)
        const x = random(minX + 2, maxX - 2)
        const y = random(minY + 2, maxY - 2)

        // Если точка НЕ попадает в центр (Safe Zone), добавляем её в доступные
        if (!isInSafeZone(x, y)) {
          availableSlots.push({ x, y })
        }
      }
    }

    // 2. Перемешиваем доступные слоты, чтобы слова появлялись в случайных частях экрана, 
    // а не заполнялись слева-направо
    availableSlots = shuffleArray(availableSlots)

    // 3. Берем только нужное количество слотов (обрезаем лишние)
    const maxWords = isMobile ? 10 : 20
    const selectedSlots = availableSlots.slice(0, maxWords)

    // 4. Готовим данные слов
    const shuffledEmotions = shuffleArray(emotions)
    const shuffledThoughts = shuffleArray(thoughts)
    let emotionIdx = 0
    let thoughtIdx = 0

    return selectedSlots.map((slot, i) => {
      const isThought = Math.random() > 0.65
      
      let text = ''
      if (isThought) {
        text = shuffledThoughts[thoughtIdx % shuffledThoughts.length]
        thoughtIdx++
      } else {
        text = shuffledEmotions[emotionIdx % shuffledEmotions.length]
        emotionIdx++
      }
      
      const duration = isThought ? random(15, 25) : random(40, 60)

      return {
        id: `word-${i}`,
        text,
        x: slot.x,
        y: slot.y,
        size: isThought ? random(0.85, 1.1) : random(1.5, 2.8),
        opacity: isThought ? random(0.3, 0.5) : random(0.1, 0.25),
        type: isThought ? 'thought' : 'emotion',
        animDuration: duration,
        animDelay: random(-duration, 0),
        driftX: isThought ? random(-20, 20) : random(-50, 50)
      } as WordItem
    })
  }, [mounted, isMobile])

  if (!mounted) return null

  return (
    <Box
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {words.map((word) => (
        <Text
          key={word.id}
          style={{
            position: 'absolute',
            left: `${word.x}%`,
            top: `${word.y}%`,
            fontSize: `${word.size}rem`,
            lineHeight: 1,
            fontWeight: word.type === 'emotion' ? 700 : 400,
            fontStyle: word.type === 'thought' ? 'italic' : 'normal',
            color: '#000',
            whiteSpace: 'nowrap',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            
            // @ts-ignore
            '--opacity-target': word.opacity,
            '--drift-x': `${word.driftX}px`,
            '--duration': `${word.animDuration}s`,
            '--delay': `${word.animDelay}s`,
            
            animation: 'floatingWord var(--duration) ease-in-out infinite',
            animationDelay: 'var(--delay)',
            opacity: 0, 

            filter: word.type === 'thought' 
              ? 'blur(0px)' 
              : (word.size < 2 ? 'blur(2px)' : 'blur(1px)'),
            
            zIndex: word.type === 'thought' ? 2 : 1,
          }}
        >
          {word.text}
        </Text>
      ))}

      <style>{`
        @keyframes floatingWord {
          0% {
            opacity: 0;
            transform: translate(0, 30px) scale(0.9);
          }
          15% {
            opacity: var(--opacity-target);
            transform: translate(calc(var(--drift-x) * 0.2), 10px) scale(1);
          }
          50% {
            opacity: var(--opacity-target);
            transform: translate(calc(var(--drift-x) * 0.5), -20px) scale(1.05);
          }
          85% {
            opacity: var(--opacity-target);
            transform: translate(calc(var(--drift-x) * 0.8), -50px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--drift-x), -80px) scale(0.9);
          }
        }
      `}</style>
    </Box>
  )
}