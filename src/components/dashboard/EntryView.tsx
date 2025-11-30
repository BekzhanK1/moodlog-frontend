import { Box, Text, Stack, Group, Badge, Divider, Button, Modal, TextInput } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconHash, IconPencil, IconTrash, IconX } from '@tabler/icons-react'
import { EntryResponse } from '../../utils/api'
import { highlightText, shouldHighlightTag } from '../../utils/highlight'
import { useState, useEffect } from 'react'
import { getEditorFont, getFontFamily } from '../../utils/fonts'

interface EntryViewProps {
  entry: EntryResponse
  onEdit?: () => void
  onDelete?: () => void
  onTagClick?: (tag: string) => void
  onClose?: () => void
  searchQuery?: string
}

export function EntryView({ entry, onEdit, onDelete, onTagClick, onClose, searchQuery }: EntryViewProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [deleteModalOpened, setDeleteModalOpened] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentFont, setCurrentFont] = useState(getEditorFont())

  // Listen for font changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'editor_font_family' && e.newValue) {
        setCurrentFont(e.newValue as any)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also check for changes in the same tab
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

  const handleDeleteClick = () => {
    setDeleteModalOpened(true)
    setDeleteConfirmText('')
  }

  const handleDeleteConfirm = async () => {
    if (deleteConfirmText.trim().toUpperCase() === 'УДАЛИТЬ') {
      setIsDeleting(true)
      try {
        if (onDelete) {
          await onDelete()
        }
        setDeleteModalOpened(false)
        setDeleteConfirmText('')
      } catch (error) {
        console.error('Failed to delete entry:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const canDelete = deleteConfirmText.trim().toUpperCase() === 'УДАЛИТЬ'

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getMoodColor = (rating: number | null) => {
    if (rating === null) return '#999'
    if (rating >= 0.5) return '#22c55e'
    if (rating >= 0) return '#84cc16'
    if (rating >= -0.5) return '#f59e0b'
    return '#ef4444'
  }

  const getMoodLabel = (rating: number | null) => {
    if (rating === null) return 'Не определено'
    if (rating >= 0.5) return 'Очень позитивное'
    if (rating >= 0) return 'Позитивное'
    if (rating >= -0.5) return 'Нейтральное'
    return 'Негативное'
  }

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
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
      <Stack gap={isMobile ? 'md' : 'lg'}>
        {/* Header with buttons */}
        <Group justify="flex-end" align="center">
          {/* Close, Edit and Delete buttons */}
          <Group gap="xs">
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
                Закрыть
              </Button>
            )}
            {onEdit && (
              <Button
                leftSection={<IconPencil size={16} />}
                variant="subtle"
                size={isMobile ? 'sm' : 'md'}
                onClick={onEdit}
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
                Редактировать
              </Button>
            )}
            {onDelete && (
              <Button
                leftSection={<IconTrash size={16} />}
                variant="subtle"
                size={isMobile ? 'sm' : 'md'}
                onClick={handleDeleteClick}
                radius="md"
                style={{
                  color: '#ef4444',
                  backgroundColor: 'transparent',
                  border: '1px solid #ef4444',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                Удалить
              </Button>
            )}
          </Group>
        </Group>

        {/* Title and Date */}
        <Stack gap="xs">
          {/* Title */}
          {entry.title && (
            <Text
              style={{
                fontSize: isMobile ? '24px' : '32px',
                fontWeight: 400,
                color: 'var(--theme-text)',
                lineHeight: 1.3,
                wordBreak: 'break-word',
                fontFamily: getFontFamily(currentFont),
              }}
            >
              {searchQuery && !searchQuery.startsWith('#')
                ? highlightText(entry.title, searchQuery, false)
                : entry.title}
            </Text>
          )}

          {/* Date */}
          <Text
            size={isMobile ? 'xs' : 'sm'}
            style={{
              color: 'var(--theme-text-secondary)',
              fontWeight: 400,
            }}
          >
            {formatDate(entry.created_at)}
          </Text>
        </Stack>

        {/* Content */}
        <Text
          style={{
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: 400,
            color: 'var(--theme-text)',
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: getFontFamily(currentFont),
          }}
        >
          {searchQuery && !searchQuery.startsWith('#')
            ? highlightText(entry.content, searchQuery, false)
            : entry.content}
        </Text>

        {/* Mobile: Right sidebar info at bottom */}
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
                  {countWords(entry.content)}
                </Text>
              </Box>

              {/* Mood rating */}
              {entry.mood_rating !== null && (
                <>
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
                      Настроение
                    </Text>
                    <Group gap="xs" align="center">
                      <Text
                        size="lg"
                        style={{
                          color: getMoodColor(entry.mood_rating),
                          fontWeight: 500,
                          fontFamily: 'monospace',
                        }}
                      >
                        {entry.mood_rating.toFixed(2)}
                      </Text>
                      <Text
                        size="sm"
                        style={{
                          color: 'var(--theme-text-secondary)',
                          fontWeight: 400,
                        }}
                      >
                        {getMoodLabel(entry.mood_rating)}
                      </Text>
                    </Group>
                  </Box>
                </>
              )}

              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <>
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
                      Теги
                    </Text>
                    <Group gap="xs" style={{ flexWrap: 'wrap' }}>
                      {entry.tags.map((tag, idx) => {
                        const isHighlighted = shouldHighlightTag(tag, searchQuery || '')
                        return (
                          <Badge
                            key={idx}
                            variant="light"
                            radius="sm"
                            leftSection={<IconHash size={10} />}
                            onClick={() => onTagClick && onTagClick(tag)}
                            style={{
                              backgroundColor: isHighlighted ? 'var(--theme-primary)' : 'var(--theme-hover)',
                              color: isHighlighted ? 'var(--theme-bg)' : 'var(--theme-text-secondary)',
                              border: isHighlighted ? '1px solid var(--theme-primary)' : 'none',
                              fontWeight: isHighlighted ? 500 : 400,
                              fontSize: '11px',
                              padding: '4px 8px',
                              cursor: onTagClick ? 'pointer' : 'default',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (onTagClick && !isHighlighted) {
                                e.currentTarget.style.backgroundColor = 'var(--theme-primary)'
                                e.currentTarget.style.color = 'var(--theme-bg)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (onTagClick && !isHighlighted) {
                                e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
                                e.currentTarget.style.color = 'var(--theme-text-secondary)'
                              }
                            }}
                          >
                            {tag}
                          </Badge>
                        )
                      })}
                    </Group>
                  </Box>
                </>
              )}

            </Stack>
          </>
        )}
      </Stack>

      {/* Delete confirmation modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => {
          setDeleteModalOpened(false)
          setDeleteConfirmText('')
        }}
        title="Подтверждение удаления"
        centered
        styles={{
          content: {
            backgroundColor: 'var(--theme-bg)',
          },
          header: {
            backgroundColor: 'var(--theme-bg)',
            borderBottom: '1px solid var(--theme-border)',
          },
          title: {
            color: 'var(--theme-text)',
            fontWeight: 600,
          },
        }}
      >
        <Stack gap="md">
          <Text style={{ color: 'var(--theme-text)' }}>
            Вы уверены, что хотите удалить эту запись? Это действие нельзя отменить.
          </Text>
          <Text size="sm" style={{ color: 'var(--theme-text-secondary)' }}>
            Для подтверждения введите <strong>УДАЛИТЬ</strong> в поле ниже:
          </Text>
          <TextInput
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.currentTarget.value)}
            placeholder="УДАЛИТЬ"
            styles={{
              input: {
                backgroundColor: 'var(--theme-bg)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)',
              },
            }}
          />
          <Group justify="flex-end" gap="xs">
            <Button
              variant="subtle"
              onClick={() => {
                setDeleteModalOpened(false)
                setDeleteConfirmText('')
              }}
              style={{
                color: 'var(--theme-text)',
                border: '1px solid var(--theme-border)',
              }}
            >
              Отмена
            </Button>
            <Button
              color="red"
              onClick={handleDeleteConfirm}
              disabled={!canDelete}
              loading={isDeleting}
              style={{
                backgroundColor: canDelete ? '#ef4444' : 'var(--theme-border)',
                color: canDelete ? 'white' : 'var(--theme-text-secondary)',
              }}
            >
              Удалить
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  )
}

