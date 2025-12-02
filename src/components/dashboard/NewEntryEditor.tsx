import { useState, forwardRef, useImperativeHandle, useEffect, useRef } from 'react'
import * as React from 'react'
import { Box, TextInput, Textarea, Stack, Button, Group, Divider, Text, Loader } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconCheck, IconLoader, IconX, IconTemperature, IconRefresh } from '@tabler/icons-react'
import { getEditorFont, getFontFamily, FontFamily } from '../../utils/fonts'
import { WeatherData, getWeatherIconUrl } from '../../utils/weather'

export interface NewEntryEditorHandle {
  getTitle: () => string
  getContent: () => string
  reset: () => void
  setInitialValues: (title: string, content: string) => void
}

interface NewEntryEditorProps {
  onContentChange?: (wordCount: number) => void
  onSave?: () => void
  onAutoSave?: (title: string, content: string) => Promise<string | null> // Returns draft entry ID
  onClose?: () => void // Close/cancel the editor
  isSaving?: boolean
  wordCount?: number
  initialTitle?: string
  initialContent?: string
  buttonText?: string
  draftEntryId?: string | null
  isEditing?: boolean // Whether we're editing an existing entry (not creating new)
  writingQuestions?: string[] // Dynamic questions to display
  questionsLoading?: boolean // Whether questions are loading
  fontFamily?: FontFamily // Selected font family
  // Optional weather info for mobile view (mirrors RightSidebar weather block)
  weather?: WeatherData | null
  weatherLoading?: boolean
  weatherError?: string | null
  // Optional AI questions controls for mobile (cooldown logic)
  onRefreshQuestions?: () => Promise<{ success: boolean; message?: string }>
  canRefreshQuestions?: () => {
    allowed: boolean
    remaining: number
    resetTime: number | null
    isUnlimited?: boolean
    maxSkips?: number
  }
}

export const NewEntryEditor = forwardRef<NewEntryEditorHandle, NewEntryEditorProps>(
  function NewEntryEditor({
    onContentChange,
    onSave,
    onAutoSave,
    onClose,
    isSaving = false,
    wordCount = 0,
    initialTitle = '',
    initialContent = '',
    buttonText = 'Сохранить',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    draftEntryId: _externalDraftEntryId = null,
    isEditing = false,
    writingQuestions = [],
    questionsLoading = false,
    fontFamily = getEditorFont(),
    weather,
    weatherLoading,
    weatherError,
    onRefreshQuestions,
    canRefreshQuestions,
  }, ref) {
    const isMobile = useMediaQuery('(max-width: 768px)')
    const [title, setTitle] = useState(initialTitle)
    const [content, setContent] = useState(initialContent)
    const [isAutoSaving, setIsAutoSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [currentFont, setCurrentFont] = useState<FontFamily>(fontFamily)
    const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const lastSavedRef = useRef<string>('') // Track last saved content to avoid unnecessary saves
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [refreshingQuestions, setRefreshingQuestions] = useState(false)
    const [rateLimitInfo, setRateLimitInfo] = useState<{
      allowed: boolean
      remaining: number
      resetTime: number | null
      isUnlimited?: boolean
      maxSkips?: number
    } | null>(null)
    const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set())

    // Listen for font changes in localStorage
    useEffect(() => {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'editor_font_family' && e.newValue) {
          setCurrentFont(e.newValue as FontFamily)
        }
      }

      window.addEventListener('storage', handleStorageChange)
      
      // Also check for changes in the same tab (storage event doesn't fire in same tab)
      const interval = setInterval(() => {
        const newFont = getEditorFont()
        if (newFont !== currentFont) {
          setCurrentFont(newFont)
        }
      }, 500)

      return () => {
        window.removeEventListener('storage', handleStorageChange)
        clearInterval(interval)
      }
    }, [currentFont])

    // Update state when initial values change
    React.useEffect(() => {
      setTitle(initialTitle)
      setContent(initialContent)
    }, [initialTitle, initialContent])

    // Update font when prop changes
    useEffect(() => {
      setCurrentFont(fontFamily)
    }, [fontFamily])

    // Auto-focus textarea when editor opens (only for new entries, not editing)
    useEffect(() => {
      if (!isEditing) {
        // Small delay to ensure the component is fully rendered
        const timer = setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus()
            // Move cursor to the end
            const length = textareaRef.current.value.length
            textareaRef.current.setSelectionRange(length, length)
          }
        }, 150)
        return () => clearTimeout(timer)
      }
    }, [isEditing, content]) // Re-focus when content changes (new entry opened)

    useImperativeHandle(ref, () => ({
      getTitle: () => title,
      getContent: () => content,
      reset: () => {
        setTitle('')
        setContent('')
        setLastSaved(null)
        lastSavedRef.current = ''
      },
      setInitialValues: (newTitle: string, newContent: string) => {
        setTitle(newTitle)
        setContent(newContent)
      },
    }))

    // Auto-save logic with debounce (only for new entries, not editing)
    useEffect(() => {
      // Don't auto-save when editing existing entries
      if (isEditing) {
        return
      }

      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }

      // Don't auto-save if content is empty or hasn't changed
      const currentContent = `${title}|${content}`
      if (!content.trim() || currentContent === lastSavedRef.current) {
        return
      }

      // Set up auto-save after 3 seconds of inactivity
      autoSaveTimeoutRef.current = setTimeout(async () => {
        if (onAutoSave && content.trim()) {
          setIsAutoSaving(true)
          try {
            const savedDraftId = await onAutoSave(title.trim() || '', content.trim())
            if (savedDraftId) {
              setLastSaved(new Date())
              lastSavedRef.current = `${title}|${content}`
            }
          } catch (error) {
            console.error('Auto-save failed:', error)
          } finally {
            setIsAutoSaving(false)
          }
        }
      }, 3000) // 3 seconds debounce

      return () => {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current)
        }
      }
    }, [title, content, onAutoSave, isEditing])

    const handleTitleChange = (value: string) => {
      setTitle(value)
    }

    const handleContentChange = (value: string) => {
      setContent(value)
      const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length
      onContentChange?.(wordCount)
    }

    const toggleQuestionCompleted = (question: string) => {
      setCompletedQuestions((prev) => {
        const next = new Set(prev)
        if (next.has(question)) {
          next.delete(question)
        } else {
          next.add(question)
        }
        return next
      })
    }

    // Sync AI questions cooldown info for mobile (similar to RightSidebar)
    useEffect(() => {
      if (!isMobile || !canRefreshQuestions) return

      const update = () => {
        const info = canRefreshQuestions()
        setRateLimitInfo(info)
      }

      update()
      const interval = setInterval(update, 1000)
      return () => clearInterval(interval)
    }, [isMobile, canRefreshQuestions])

    const getTimeUntilReset = (resetTime: number | null): string => {
      if (!resetTime) return ''
      const now = Date.now()
      const diff = resetTime - now
      if (diff <= 0) return ''

      const totalSeconds = Math.floor(diff / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      if (hours > 0) {
        return `${hours}ч ${minutes}м ${seconds}с`
      } else if (minutes > 0) {
        return `${minutes}м ${seconds}с`
      }
      return `${seconds}с`
    }

    const handleRefreshQuestionsClick = async () => {
      if (!onRefreshQuestions || refreshingQuestions || (rateLimitInfo && !rateLimitInfo.allowed)) {
        return
      }
      setRefreshingQuestions(true)
      try {
        await onRefreshQuestions()
        // cooldown info обновится через canRefreshQuestions в useEffect
      } catch (error) {
        console.error('Failed to refresh questions (mobile):', error)
      } finally {
        setRefreshingQuestions(false)
      }
    }

    return (
      <>
        <Box
          style={{
            padding: isMobile ? '20px 16px' : '40px',
            // 40px достаточно, так как плавающие кнопки снизу скрыты в режиме редактирования/создания
            paddingBottom: '40px',
            maxWidth: '800px',
            margin: '0 auto',
            backgroundColor: 'var(--theme-bg)',
            position: 'relative',
          }}
        >
        <Stack gap="lg">
          {/* Close button, auto-save indicator and save button */}
          <Group justify="space-between" align="center" style={{ marginTop: '-8px', marginBottom: '-8px' }}>
            <Group gap={isMobile ? 8 : 12} align="center">
              {/* Close button */}
              {onClose && (
                <Button
                  variant="subtle"
                  leftSection={<IconX size={16} />}
                  size={isMobile ? 'sm' : 'md'}
                  onClick={onClose}
                  radius="md"
                  style={{
                    color: 'var(--theme-text)',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--theme-border)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {isEditing ? 'Отмена' : 'Закрыть'}
                </Button>
              )}

              {/* Auto-save indicator */}
              {(isAutoSaving || lastSaved) && (
                <Group gap={4} align="center">
                  {isAutoSaving ? (
                    <>
                      <IconLoader
                        size={14}
                        style={{ color: 'var(--theme-text-secondary)', animation: 'spin 1s linear infinite' }}
                      />
                      <Text size="xs" style={{ color: 'var(--theme-text-secondary)' }}>
                        Сохранение...
                      </Text>
                    </>
                  ) : lastSaved ? (
                    <>
                      <IconCheck size={14} style={{ color: 'var(--theme-primary)' }} />
                      <Text size="xs" style={{ color: 'var(--theme-text-secondary)' }}>
                        Сохранено{' '}
                        {lastSaved.toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </>
                  ) : null}
                </Group>
              )}
            </Group>

            {/* Save button in header: non-floating, same row as "Закрыть" */}
            <Button
              onClick={onSave}
              loading={isSaving}
              disabled={!content.trim() || isSaving}
              radius="md"
              size={isMobile ? 'sm' : 'md'}
              style={{
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-bg)',
                fontWeight: 500,
                border: '1px solid var(--theme-primary)',
                transition: 'all 0.3s ease',
                minHeight: '40px',
                padding: isMobile ? '0 20px' : '0 28px',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.18)',
              }}
              onMouseEnter={(e) => {
                if (!isSaving && content.trim()) {
                  e.currentTarget.style.transform = 'scale(1.03)'
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.24)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving && content.trim()) {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.18)'
                }
              }}
            >
              {buttonText}
            </Button>
          </Group>

          {/* Title input */}
          <TextInput
            placeholder="Заголовок (необязательно)"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            variant="unstyled"
            size={isMobile ? 'md' : 'lg'}
            styles={{
              input: {
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--theme-text)',
                fontSize: isMobile ? '24px' : '32px',
                fontWeight: 400,
                padding: isMobile ? '10px 0' : '12px 0',
                fontFamily: getFontFamily(currentFont),
                '&:focus': {
                  border: 'none',
                  outline: 'none',
                },
                '&::placeholder': {
                  color: 'var(--theme-text-secondary)',
                  opacity: 0.6,
                },
              },
            }}
          />

          {/* Content textarea */}
          <Textarea
            ref={textareaRef}
            placeholder=""
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            variant="unstyled"
            minRows={isMobile ? 15 : 20}
            autosize
            onKeyDown={() => {
              // Allow immediate typing without needing to click
              if (!textareaRef.current?.matches(':focus')) {
                textareaRef.current?.focus()
              }
            }}
            styles={{
              input: {
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--theme-text)',
                // Minimum 16px on mobile to prevent iOS auto-zoom on focus
                fontSize: isMobile ? '16px' : '16px',
                fontWeight: 400,
                lineHeight: 1.8,
                padding: isMobile ? '12px 0' : '16px 0',
                resize: 'none',
                fontFamily: getFontFamily(currentFont),
                '&:focus': {
                  border: 'none',
                  outline: 'none',
                },
                '&::placeholder': {
                  color: 'var(--theme-text-secondary)',
                  opacity: 0.6,
                },
              },
            }}
          />

          {/* Mobile: Word count, date, weather and AI questions (compact RightSidebar-like info) */}
          {isMobile && (
            <>
              <Divider style={{ borderColor: 'var(--theme-border)', marginTop: '24px' }} />
              <Stack gap="md" style={{ marginTop: '16px' }}>
                {/* Word count */}
                <Box>
                  <Text
                    size="xs"
                    style={{
                      color: 'var(--theme-text-secondary)',
                      fontWeight: 400,
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Количество слов
                  </Text>
                  <Text
                    size="lg"
                    style={{
                      color: 'var(--theme-text)',
                      fontWeight: 500,
                      fontFamily: 'monospace',
                    }}
                  >
                    {wordCount}
                  </Text>
                </Box>

                <Divider style={{ borderColor: '#eee' }} />

                {/* Date */}
                <Box>
                  <Text
                    size="xs"
                    style={{
                      color: 'var(--theme-text-secondary)',
                      fontWeight: 400,
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Дата
                  </Text>
                  <Text
                    size="sm"
                    style={{
                      color: 'var(--theme-text)',
                      fontWeight: 400,
                    }}
                  >
                    {new Date().toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </Box>

                <Divider style={{ borderColor: '#eee' }} />

                {/* Weather */}
                {(weatherLoading || weatherError || weather) && (
                  <Box>
                    <Text
                      size="xs"
                      style={{
                        color: 'var(--theme-text-secondary)',
                        fontWeight: 400,
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Погода
                    </Text>
                    {weatherLoading ? (
                      <Group gap="xs" align="center">
                        <Loader size="sm" color="var(--theme-primary)" />
                        <Text
                          size="sm"
                          style={{
                            color: 'var(--theme-text-secondary)',
                            fontStyle: 'italic',
                          }}
                        >
                          Загрузка...
                        </Text>
                      </Group>
                    ) : weatherError ? (
                      <Text
                        size="sm"
                        style={{
                          color: 'var(--theme-text-secondary)',
                          fontStyle: 'italic',
                        }}
                      >
                        {weatherError}
                      </Text>
                    ) : weather ? (
                      <Group gap="xs" align="center">
                        {weather.icon && (
                          <img
                            src={getWeatherIconUrl(weather.icon)}
                            alt={weather.description}
                            style={{ width: '28px', height: '28px' }}
                          />
                        )}
                        <Group gap={4} align="center">
                          <IconTemperature
                            size={16}
                            style={{ color: 'var(--theme-text-secondary)' }}
                          />
                          <Text
                            size="lg"
                            style={{
                              color: 'var(--theme-text)',
                              fontWeight: 400,
                              fontFamily: 'monospace',
                            }}
                          >
                            {weather.temperature}°
                          </Text>
                        </Group>
                      </Group>
                    ) : null}
                  </Box>
                )}

                {/* AI questions */}
                {writingQuestions.length > 0 && (
                  <Box>
                    <Group justify="space-between" align="center" style={{ marginBottom: '8px' }}>
                      <Text
                        size="xs"
                        style={{
                          color: 'var(--theme-text-secondary)',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Вопросы от ИИ
                      </Text>
                      {canRefreshQuestions && rateLimitInfo && (
                        <Text
                          size="xs"
                          style={{
                            color: 'var(--theme-text-secondary)',
                            fontWeight: 400,
                          }}
                        >
                          {rateLimitInfo.remaining > 0 ? (
                            `Осталось: ${rateLimitInfo.remaining}/${rateLimitInfo.maxSkips || 1}`
                          ) : rateLimitInfo.resetTime ? (
                            `Через: ${getTimeUntilReset(rateLimitInfo.resetTime)}`
                          ) : null}
                        </Text>
                      )}
                    </Group>
                    {questionsLoading || refreshingQuestions ? (
                      <Group gap="xs" align="center">
                        <Loader size="sm" color="var(--theme-primary)" />
                        <Text
                          size="sm"
                          style={{
                            color: 'var(--theme-text-secondary)',
                            fontStyle: 'italic',
                          }}
                        >
                          {refreshingQuestions ? 'Загрузка новых вопросов...' : 'Загрузка вопросов...'}
                        </Text>
                      </Group>
                    ) : (
                      <Stack gap="sm">
                        {writingQuestions.map((question, index) => (
                          <Box
                            key={index}
                            onClick={() => toggleQuestionCompleted(question)}
                            style={{ cursor: 'pointer' }}
                          >
                            <Text
                              size="sm"
                              style={{
                                color: 'var(--theme-text)',
                                fontWeight: 400,
                                lineHeight: 1.6,
                                opacity: completedQuestions.has(question) ? 0.5 : 1,
                                animation: `fadeInUp 0.6s ease-out ${index * 0.15 + 0.2}s forwards`,
                                textDecoration: completedQuestions.has(question)
                                  ? 'line-through'
                                  : 'none',
                                transition: 'opacity 0.2s ease, text-decoration-color 0.2s ease',
                              }}
                            >
                              {question}
                            </Text>
                          </Box>
                        ))}
                        {onRefreshQuestions && (
                          <Button
                            variant="subtle"
                            size="xs"
                            leftSection={<IconRefresh size={14} />}
                            onClick={handleRefreshQuestionsClick}
                            disabled={
                              refreshingQuestions ||
                              (rateLimitInfo !== null && rateLimitInfo.allowed === false)
                            }
                            style={{
                              marginTop: '8px',
                              alignSelf: 'flex-end',
                              color:
                                rateLimitInfo?.allowed ?? true
                                  ? 'var(--theme-primary)'
                                  : 'var(--theme-text-secondary)',
                            }}
                          >
                            Другие вопросы
                          </Button>
                        )}
                      </Stack>
                    )}
                  </Box>
                )}
              </Stack>
            </>
          )}

        </Stack>
      </Box>
      </>
    )
  }
)

NewEntryEditor.displayName = 'NewEntryEditor'

