import { useState } from 'react'
import {
  Box,
  Stack,
  Text,
  Group,
  Badge,
  Divider,
} from '@mantine/core'
import {
  IconChevronRight,
  IconChevronLeft,
  IconHash,
} from '@tabler/icons-react'
import { EntryResponse } from '../../utils/api'

interface RightSidebarProps {
  entry?: EntryResponse | null
  wordCount?: number
  isNewEntry?: boolean
}

export function RightSidebar({ entry, wordCount, isNewEntry }: RightSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
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

  const sidebarContent = (
    <Box style={{ padding: '24px', overflowY: 'auto', flex: 1, position: 'relative', zIndex: 1 }}>
        <Stack gap="lg">
          {isNewEntry ? (
            <>
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
                  {wordCount || 0}
                </Text>
              </Box>

              <Divider style={{ borderColor: 'var(--theme-border)' }} />

              {/* Current date */}
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

              <Divider style={{ borderColor: 'var(--theme-border)' }} />

              {/* Static question */}
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
            </>
          ) : entry ? (
            <>
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

              <Divider style={{ borderColor: 'var(--theme-border)' }} />

              {/* Created date */}
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
                  Дата создания
                </Text>
                <Text
                  size="sm"
                  style={{
                    color: 'var(--theme-text)',
                    fontWeight: 400,
                  }}
                >
                  {formatDate(entry.created_at)}
                </Text>
              </Box>

              {entry.updated_at !== entry.created_at && (
                <>
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
                      Дата обновления
                    </Text>
                    <Text
                      size="sm"
                      style={{
                        color: 'var(--theme-text)',
                        fontWeight: 400,
                      }}
                    >
                      {formatDate(entry.updated_at)}
                    </Text>
                  </Box>
                </>
              )}

              <Divider style={{ borderColor: 'var(--theme-border)' }} />

              {/* Mood rating */}
              {entry.mood_rating !== null && (
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
              )}

              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <>
                  <Divider style={{ borderColor: 'var(--theme-border)' }} />
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
                      {entry.tags.map((tag, idx) => (
                        <Badge
                          key={idx}
                          variant="light"
                          radius="sm"
                          leftSection={<IconHash size={10} />}
                          style={{
                            backgroundColor: 'var(--theme-hover)',
                            color: 'var(--theme-text-secondary)',
                            border: '1px solid var(--theme-border)',
                            fontWeight: 400,
                            fontSize: '11px',
                            padding: '4px 8px',
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </Group>
                  </Box>
                </>
              )}

              {/* AI processed */}
              {entry.ai_processed_at && (
                <>
                  <Divider style={{ borderColor: 'var(--theme-border)' }} />
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
                      Обработано AI
                    </Text>
                    <Text
                      size="sm"
                      style={{
                        color: 'var(--theme-text)',
                        fontWeight: 400,
                      }}
                    >
                      {formatDate(entry.ai_processed_at)}
                    </Text>
                  </Box>
                </>
              )}
            </>
          ) : null}
        </Stack>
      </Box>
  )

  return (
    <Box
      style={{
        width: isCollapsed ? '48px' : '304px',
        height: 'calc(100vh - 64px)',
        borderLeft: '1px solid var(--theme-border)',
        backgroundColor: 'var(--theme-bg)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
      }}
    >
      {/* Collapse button */}
      <Box
        style={{
          position: 'absolute',
          top: '16px',
          left: isCollapsed ? '12px' : '-12px',
          cursor: 'pointer',
          zIndex: 100,
          transition: 'left 0.3s ease',
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Box
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'var(--theme-bg)',
            border: '1px solid var(--theme-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'relative',
            zIndex: 100,
          }}
        >
          {isCollapsed ? (
            <IconChevronLeft size={14} style={{ color: 'var(--theme-text-secondary)' }} />
          ) : (
            <IconChevronRight size={14} style={{ color: 'var(--theme-text-secondary)' }} />
          )}
        </Box>
      </Box>

      {!isCollapsed && sidebarContent}
    </Box>
  )
}

