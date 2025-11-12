import { useState, forwardRef, useImperativeHandle } from 'react'
import * as React from 'react'
import { Box, TextInput, Textarea, Stack, Button, Group, Divider, Text } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'

export interface NewEntryEditorHandle {
  getTitle: () => string
  getContent: () => string
  reset: () => void
  setInitialValues: (title: string, content: string) => void
}

interface NewEntryEditorProps {
  onContentChange?: (wordCount: number) => void
  onSave?: () => void
  isSaving?: boolean
  wordCount?: number
  initialTitle?: string
  initialContent?: string
  buttonText?: string
}

export const NewEntryEditor = forwardRef<NewEntryEditorHandle, NewEntryEditorProps>(
  function NewEntryEditor({ 
    onContentChange, 
    onSave, 
    isSaving = false, 
    wordCount = 0,
    initialTitle = '',
    initialContent = '',
    buttonText = 'Сохранить',
  }, ref) {
    const isMobile = useMediaQuery('(max-width: 768px)')
    const [title, setTitle] = useState(initialTitle)
    const [content, setContent] = useState(initialContent)

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
      },
      setInitialValues: (newTitle: string, newContent: string) => {
        setTitle(newTitle)
        setContent(newContent)
      },
    }))

    const handleContentChange = (value: string) => {
      setContent(value)
      const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length
      onContentChange?.(wordCount)
    }

    return (
      <Box
        style={{
          padding: isMobile ? '20px 16px' : '40px',
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: 'var(--theme-bg)',
        }}
      >
        <Stack gap="lg">
          {/* Title input */}
          <TextInput
            placeholder="Заголовок (необязательно)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            styles={{
              input: {
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--theme-text)',
                fontSize: isMobile ? '14px' : '16px',
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

          {/* Save button */}
          <Group justify="flex-end" mt="md">
            <Button
              onClick={onSave}
              loading={isSaving}
              disabled={!content.trim() || isSaving}
              radius="md"
              size={isMobile ? 'lg' : 'md'}
              fullWidth={isMobile}
              style={{
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-bg)',
                fontWeight: 400,
                border: '1px solid var(--theme-primary)',
                transition: 'all 0.3s ease',
                minHeight: isMobile ? '48px' : 'auto',
              }}
              onMouseEnter={(e) => {
                if (!isSaving && content.trim()) {
                  e.currentTarget.style.backgroundColor = 'var(--theme-bg)'
                  e.currentTarget.style.color = 'var(--theme-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving && content.trim()) {
                  e.currentTarget.style.backgroundColor = 'var(--theme-primary)'
                  e.currentTarget.style.color = 'var(--theme-bg)'
                }
              }}
            >
              {buttonText}
            </Button>
          </Group>
        </Stack>
      </Box>
    )
  }
)

NewEntryEditor.displayName = 'NewEntryEditor'

