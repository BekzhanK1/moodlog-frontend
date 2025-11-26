import { useState, forwardRef, useImperativeHandle, useEffect, useRef } from 'react'
import * as React from 'react'
import { Box, TextInput, Textarea, Stack, Button, Group, Divider, Text } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconCheck, IconLoader, IconX } from '@tabler/icons-react'

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
  }, ref) {
    const isMobile = useMediaQuery('(max-width: 768px)')
    const [title, setTitle] = useState(initialTitle)
    const [content, setContent] = useState(initialContent)
    const [isAutoSaving, setIsAutoSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const lastSavedRef = useRef<string>('') // Track last saved content to avoid unnecessary saves

    // Update state when initial values change
    React.useEffect(() => {
      setTitle(initialTitle)
      setContent(initialContent)
    }, [initialTitle, initialContent])

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

    return (
      <>
        <Box
        style={{
          padding: isMobile ? '20px 16px' : '40px',
          paddingBottom: isMobile ? '100px' : '120px',
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: 'var(--theme-bg)',
          position: 'relative',
        }}
      >
        <Stack gap="lg">
          {/* Close button and auto-save indicator */}
          <Group justify="space-between" align="center" style={{ marginTop: '-8px', marginBottom: '-8px' }}>
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
              <Group gap={4}>
                {isAutoSaving ? (
                  <>
                    <IconLoader size={14} style={{ color: 'var(--theme-text-secondary)', animation: 'spin 1s linear infinite' }} />
                    <Text size="xs" style={{ color: 'var(--theme-text-secondary)' }}>
                      Сохранение...
                    </Text>
                  </>
                ) : lastSaved ? (
                  <>
                    <IconCheck size={14} style={{ color: 'var(--theme-primary)' }} />
                    <Text size="xs" style={{ color: 'var(--theme-text-secondary)' }}>
                      Сохранено {lastSaved.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </>
                ) : null}
              </Group>
            )}
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
            placeholder="Начните писать..."
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            variant="unstyled"
            minRows={isMobile ? 15 : 20}
            autosize
            autoFocus={!isEditing}
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

          {/* Mobile: Word count and date info */}
          {isMobile && (
            <>
              <Divider style={{ borderColor: 'var(--theme-border)', marginTop: '24px' }} />
              <Stack gap="md" style={{ marginTop: '16px' }}>
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

                <Box>
                  <Text
                    size="sm"
                    style={{
                      color: 'var(--theme-text)',
                      fontWeight: 400,
                      lineHeight: 1.6,
                    }}
                  >
                    О чем вы думали в последнее время?
                  </Text>
                </Box>
              </Stack>
            </>
          )}

        </Stack>
      </Box>

      {/* Floating Save Button - All screen sizes */}
      <Box
        style={{
          position: 'fixed',
          bottom: isMobile ? '24px' : '32px',
          right: isMobile ? '50%' : '32px',
          transform: isMobile ? 'translateX(50%)' : 'none',
          zIndex: 1000,
        }}
      >
        <Button
          onClick={onSave}
          loading={isSaving}
          disabled={!content.trim() || isSaving}
          radius="xl"
          size={isMobile ? 'lg' : 'md'}
          style={{
            backgroundColor: 'var(--theme-primary)',
            color: 'var(--theme-bg)',
            fontWeight: 500,
            border: '1px solid var(--theme-primary)',
            transition: 'all 0.3s ease',
            minHeight: isMobile ? '56px' : '48px',
            minWidth: isMobile ? '120px' : '140px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            padding: isMobile ? '0 32px' : '0 40px',
          }}
          onMouseEnter={(e) => {
            if (!isSaving && content.trim()) {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isSaving && content.trim()) {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)'
            }
          }}
          onTouchStart={(e) => {
            if (!isSaving && content.trim()) {
              e.currentTarget.style.transform = 'scale(0.95)'
            }
          }}
          onTouchEnd={(e) => {
            if (!isSaving && content.trim()) {
              e.currentTarget.style.transform = 'scale(1)'
            }
          }}
        >
          {buttonText}
        </Button>
      </Box>
      </>
    )
  }
)

NewEntryEditor.displayName = 'NewEntryEditor'

