import { Box, Text, Stack, Group, Badge, Divider } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconHash } from '@tabler/icons-react'
import { EntryResponse } from '../../utils/api'

interface EntryViewProps {
  entry: EntryResponse
}

export function EntryView({ entry }: EntryViewProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

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
        {/* Title */}
        {entry.title && (
          <Text
            style={{
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: 400,
              color: 'var(--theme-text)',
              lineHeight: 1.3,
            }}
          >
            {entry.title}
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

        {/* Content */}
        <Text
          style={{
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: 400,
            color: 'var(--theme-text)',
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {entry.content}
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
                      {entry.tags.map((tag, idx) => (
                        <Badge
                          key={idx}
                          variant="light"
                          radius="sm"
                          leftSection={<IconHash size={10} />}
                          style={{
                            backgroundColor: 'var(--theme-hover)',
                            color: 'var(--theme-text-secondary)',
                            border: 'none',
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
            </Stack>
          </>
        )}
      </Stack>
    </Box>
  )
}

