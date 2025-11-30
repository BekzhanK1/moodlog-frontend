import { Modal, Text, Stack, Group, Box, ScrollArea, Button, Checkbox, FileButton, Alert, Loader, Card, Divider, Badge } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconUpload, IconAlertCircle, IconCheck, IconBrandTelegram, IconInfoCircle, IconDeviceDesktop, IconFileCode, IconDownload, IconDots } from '@tabler/icons-react'
import { useState, useCallback } from 'react'
import { apiClient } from '../../utils/api'

interface TelegramMessage {
  date: string
  text: string
}

interface TelegramImportProps {
  opened: boolean
  onClose: () => void
  onImportComplete?: () => void
}

export function TelegramImport({ opened, onClose, onImportComplete }: TelegramImportProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [messages, setMessages] = useState<TelegramMessage[]>([])
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successCount, setSuccessCount] = useState<number | null>(null)

  const processJsonFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string)
        const desiredKeys = ['date', 'text']
        
        const filteredMessages = jsonData.messages
          ?.filter((m: any) => m.type === 'message' && m.text)
          .map((m: any) => {
            // Normalize text if it's a list (common in some exports)
            let text = m.text
            if (Array.isArray(text)) {
              text = text
                .map((t: any) => {
                  if (typeof t === 'string') return t
                  if (typeof t === 'object' && t.text) return t.text
                  return ''
                })
                .join('')
            }
            
            const result: any = {}
            desiredKeys.forEach((key) => {
              if (key === 'text') {
                result.text = text
              } else if (m[key]) {
                result[key] = m[key]
              }
            })
            return result
          })
          .filter((m: any) => m.date && m.text) || []

        if (filteredMessages.length === 0) {
          setError('Не найдено сообщений в файле. Убедитесь, что файл содержит сообщения с датами и текстом.')
          return
        }

        setMessages(filteredMessages)
        setSelectedIndices(new Set(filteredMessages.map((_: any, i: number) => i)))
        setError(null)
      } catch (err) {
        setError('Ошибка при чтении файла. Убедитесь, что это валидный JSON файл экспорта Telegram.')
        console.error('Error parsing JSON:', err)
      }
    }
    reader.readAsText(file)
  }, [])

  const handleFileSelect = (file: File | null) => {
    if (file) {
      setLoading(true)
      setError(null)
      setMessages([])
      setSelectedIndices(new Set())
      setSuccessCount(null)
      processJsonFile(file)
      setLoading(false)
    }
  }

  const toggleSelection = (index: number) => {
    const newSelected = new Set(selectedIndices)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedIndices(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIndices.size === messages.length) {
      setSelectedIndices(new Set())
    } else {
      setSelectedIndices(new Set(messages.map((_, i) => i)))
    }
  }

  const handleImport = async () => {
    if (selectedIndices.size === 0) {
      setError('Выберите хотя бы одно сообщение для импорта.')
      return
    }

    setImporting(true)
    setError(null)
    setSuccessCount(null)

    const selectedMessages = Array.from(selectedIndices)
      .sort((a, b) => a - b)
      .map((i) => messages[i])

    // Parse and prepare entries for batch creation
    const entriesToCreate = []
    const invalidIndices: number[] = []

    for (let i = 0; i < selectedMessages.length; i++) {
      const message = selectedMessages[i]
      try {
        // Parse the date from Telegram export format
        // Telegram exports can use ISO format, Unix timestamp (seconds or milliseconds), or date_unixtime
        let date: Date
        if (typeof message.date === 'string') {
          // Try parsing as ISO string first
          date = new Date(message.date)
          // If that fails, try parsing as Unix timestamp string
          if (isNaN(date.getTime()) && /^\d+$/.test(message.date)) {
            const timestamp = parseInt(message.date, 10)
            // If it's less than a reasonable timestamp (year 2000), assume seconds, otherwise milliseconds
            date = new Date(timestamp < 946684800000 ? timestamp * 1000 : timestamp)
          }
        } else if (typeof message.date === 'number') {
          // If it's less than a reasonable timestamp (year 2000), assume seconds, otherwise milliseconds
          date = new Date(message.date < 946684800000 ? message.date * 1000 : message.date)
        } else {
          date = new Date(message.date)
        }

        // Validate date
        if (isNaN(date.getTime())) {
          console.warn('Invalid date for message:', message)
          invalidIndices.push(i)
          continue
        }

        entriesToCreate.push({
          content: message.text,
          title: null,
          tags: null,
          is_draft: false,
          created_at: date.toISOString(),
        })
      } catch (err) {
        console.error('Error parsing message:', err)
        invalidIndices.push(i)
      }
    }

    // Create entries in batch
    let result: { total_created: number; total_failed: number } | null = null
    try {
      result = await apiClient.createEntriesBatch({
        entries: entriesToCreate,
      })

      setSuccessCount(result.total_created)
      
      if (result.total_failed > 0 || invalidIndices.length > 0) {
        const totalFailed = result.total_failed + invalidIndices.length
        setError(`Импортировано: ${result.total_created}. Ошибок: ${totalFailed}.`)
      }
    } catch (err) {
      console.error('Error importing messages:', err)
      setError('Ошибка при импорте сообщений. Попробуйте еще раз.')
    }

    setImporting(false)

    if (result && result.total_created > 0 && onImportComplete) {
      // Wait a bit before calling onImportComplete to show success message
      setTimeout(() => {
        onImportComplete()
        handleClose()
      }, 2000)
    }
  }

  const handleClose = () => {
    setMessages([])
    setSelectedIndices(new Set())
    setError(null)
    setSuccessCount(null)
    setLoading(false)
    setImporting(false)
    onClose()
  }

  const formatDate = (dateString: string | number) => {
    let date: Date
    if (typeof dateString === 'string') {
      date = new Date(dateString)
      // If that fails, try parsing as Unix timestamp string
      if (isNaN(date.getTime()) && /^\d+$/.test(dateString)) {
        const timestamp = parseInt(dateString, 10)
        date = new Date(timestamp < 946684800000 ? timestamp * 1000 : timestamp)
      }
    } else if (typeof dateString === 'number') {
      date = new Date(dateString < 946684800000 ? dateString * 1000 : dateString)
    } else {
      date = new Date(dateString)
    }

    if (isNaN(date.getTime())) {
      return 'Неверная дата'
    }

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs" align="center">
          <Box
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconBrandTelegram size={18} style={{ color: 'var(--theme-primary)' }} />
          </Box>
          <Text style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 600, color: 'var(--theme-text)' }}>
            Импорт из Telegram
          </Text>
          <Badge
            size="sm"
            radius="md"
            variant="light"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
              color: 'var(--theme-primary)',
              border: '1px solid var(--theme-border)',
            }}
          >
            Beta
          </Badge>
        </Group>
      }
      size={isMobile ? '95%' : '900px'}
      centered
      styles={{
        root: {
          '--mantine-color-body': 'var(--theme-bg)',
        },
        content: {
          backgroundColor: 'var(--theme-bg)',
          border: '1px solid var(--theme-border)',
        },
        header: {
          backgroundColor: 'var(--theme-bg)',
          borderBottom: '1px solid var(--theme-border)',
        },
        title: {
          color: 'var(--theme-text)',
          fontWeight: 600,
        },
        body: {
          backgroundColor: 'var(--theme-bg)',
        },
        close: {
          color: 'var(--theme-text)',
          '&:hover': {
            backgroundColor: 'var(--theme-hover)',
          },
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      <Stack gap="lg">
        {messages.length === 0 && !loading && (
          <>
            {/* Instructions Card */}
            <Card
              padding="lg"
              radius="lg"
              style={{
                backgroundColor: 'var(--theme-surface)',
                border: '1px solid var(--theme-border)',
              }}
            >
              <Stack gap="md">
                <Group gap="xs" align="center">
                  <Box
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconBrandTelegram size={18} style={{ color: 'var(--theme-primary)' }} />
                  </Box>
                  <Text
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: 'var(--theme-text)',
                    }}
                  >
                    Как экспортировать данные из Telegram
                  </Text>
                </Group>

                <Alert
                  icon={<IconInfoCircle size={16} />}
                  title="Важно"
                  color="blue"
                  variant="light"
                  styles={{
                    root: {
                      backgroundColor: 'color-mix(in srgb, var(--theme-primary) 5%, transparent)',
                      border: '1px solid var(--theme-border)',
                    },
                    title: {
                      color: 'var(--theme-text)',
                      fontWeight: 600,
                    },
                    message: {
                      color: 'var(--theme-text-secondary)',
                    },
                  }}
                >
                  Экспорт можно сделать только на десктопе. Импорт работает только с личными каналами (Saved Messages) или каналами, где вы являетесь администратором.
                </Alert>

                <Stack gap="sm">
                  <Group gap="sm" align="flex-start" wrap="nowrap">
                    <Box
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--theme-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--theme-bg)',
                        fontWeight: 600,
                        fontSize: '14px',
                        flexShrink: 0,
                      }}
                    >
                      1
                    </Box>
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Group gap="xs" align="center">
                        <IconDeviceDesktop size={16} style={{ color: 'var(--theme-primary)' }} />
                        <Text
                          style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: 'var(--theme-text)',
                          }}
                        >
                          Откройте Telegram Desktop
                        </Text>
                      </Group>
                      <Text
                        size="sm"
                        style={{
                          color: 'var(--theme-text-secondary)',
                          lineHeight: 1.6,
                        }}
                      >
                        Откройте приложение Telegram на вашем компьютере (десктопная версия)
                      </Text>
                    </Stack>
                  </Group>

                  <Group gap="sm" align="flex-start" wrap="nowrap">
                    <Box
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--theme-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--theme-bg)',
                        fontWeight: 600,
                        fontSize: '14px',
                        flexShrink: 0,
                      }}
                    >
                      2
                    </Box>
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Group gap="xs" align="center">
                        <IconBrandTelegram size={16} style={{ color: 'var(--theme-primary)' }} />
                        <Text
                          style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: 'var(--theme-text)',
                          }}
                        >
                          Зайдите в канал
                        </Text>
                      </Group>
                      <Text
                        size="sm"
                        style={{
                          color: 'var(--theme-text-secondary)',
                          lineHeight: 1.6,
                        }}
                      >
                        Откройте нужный канал (личный канал "Saved Messages" или канал, где вы администратор)
                      </Text>
                    </Stack>
                  </Group>

                  <Group gap="sm" align="flex-start" wrap="nowrap">
                    <Box
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--theme-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--theme-bg)',
                        fontWeight: 600,
                        fontSize: '14px',
                        flexShrink: 0,
                      }}
                    >
                      3
                    </Box>
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Group gap="xs" align="center">
                        <IconDots size={16} style={{ color: 'var(--theme-primary)' }} />
                        <Text
                          style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: 'var(--theme-text)',
                          }}
                        >
                          Откройте меню канала
                        </Text>
                      </Group>
                      <Text
                        size="sm"
                        style={{
                          color: 'var(--theme-text-secondary)',
                          lineHeight: 1.6,
                        }}
                      >
                        Нажмите на три точки (⋮) в правом верхнем углу канала и выберите <strong>"Экспорт истории чата"</strong>
                      </Text>
                    </Stack>
                  </Group>

                  <Group gap="sm" align="flex-start" wrap="nowrap">
                    <Box
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--theme-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--theme-bg)',
                        fontWeight: 600,
                        fontSize: '14px',
                        flexShrink: 0,
                      }}
                    >
                      4
                    </Box>
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Group gap="xs" align="center">
                        <IconFileCode size={16} style={{ color: 'var(--theme-primary)' }} />
                        <Text
                          style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: 'var(--theme-text)',
                          }}
                        >
                          Настройте экспорт
                        </Text>
                      </Group>
                      <Text
                        size="sm"
                        style={{
                          color: 'var(--theme-text-secondary)',
                          lineHeight: 1.6,
                        }}
                      >
                        В настройках экспорта выберите формат <strong>"Машиночитаемый JSON"</strong> и <strong>уберите все галочки</strong> (фотографии, видео, файлы и т.д.)
                      </Text>
                    </Stack>
                  </Group>

                  <Group gap="sm" align="flex-start" wrap="nowrap">
                    <Box
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--theme-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--theme-bg)',
                        fontWeight: 600,
                        fontSize: '14px',
                        flexShrink: 0,
                      }}
                    >
                      5
                    </Box>
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Group gap="xs" align="center">
                        <IconDownload size={16} style={{ color: 'var(--theme-primary)' }} />
                        <Text
                          style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: 'var(--theme-text)',
                          }}
                        >
                          Экспортируйте и загрузите файл
                        </Text>
                      </Group>
                      <Text
                        size="sm"
                        style={{
                          color: 'var(--theme-text-secondary)',
                          lineHeight: 1.6,
                        }}
                      >
                        Нажмите <strong>"Экспортировать"</strong>. После завершения экспорта найдите файл <strong>result.json</strong> в архиве и загрузите его здесь
                      </Text>
                    </Stack>
                  </Group>

                  
                </Stack>
              </Stack>
            </Card>

            <Divider style={{ borderColor: 'var(--theme-border)', opacity: 0.5 }} />

            {/* Upload Section */}
            <Card
              padding="lg"
              radius="lg"
              style={{
                backgroundColor: 'var(--theme-surface)',
                border: '2px dashed var(--theme-border)',
                transition: 'all 0.2s ease',
              }}
            >
              <Stack gap="md" align="center">
                <Box
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconUpload size={32} style={{ color: 'var(--theme-primary)' }} />
                </Box>
                <Stack gap="xs" align="center">
                  <Text
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: 'var(--theme-text)',
                      textAlign: 'center',
                    }}
                  >
                    Загрузите файл экспорта
                  </Text>
                  <Text
                    size="sm"
                    style={{
                      color: 'var(--theme-text-secondary)',
                      textAlign: 'center',
                      maxWidth: '400px',
                    }}
                  >
                    Выберите файл <strong>result.json</strong> из архива экспорта Telegram
                  </Text>
                </Stack>
                <FileButton onChange={handleFileSelect} accept="application/json">
                  {(props) => (
                    <Button
                      {...props}
                      leftSection={<IconUpload size={18} />}
                      size="md"
                      radius="md"
                      styles={{
                        root: {
                          backgroundColor: 'var(--theme-primary)',
                          border: 'none',
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: 'var(--theme-primary)',
                            opacity: 0.9,
                          },
                        },
                        label: {
                          color: 'var(--theme-bg)',
                        },
                      }}
                    >
                      Выбрать файл
                    </Button>
                  )}
                </FileButton>
                <Badge
                  variant="light"
                  size="sm"
                  radius="md"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                    color: 'var(--theme-text-secondary)',
                    border: '1px solid var(--theme-border)',
                  }}
                >
                  Только JSON формат
                </Badge>
              </Stack>
            </Card>
          </>
        )}

        {loading && (
          <Box style={{ textAlign: 'center', padding: '40px 0' }}>
            <Loader size="md" />
            <Text mt="md" style={{ color: 'var(--theme-text-secondary)' }}>
              Обработка файла...
            </Text>
          </Box>
        )}

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Ошибка"
            color="red"
            variant="light"
            onClose={() => setError(null)}
            withCloseButton
            styles={{
              root: {
                backgroundColor: 'var(--theme-bg)',
                border: '1px solid var(--theme-border)',
              },
              title: {
                color: 'var(--theme-text)',
              },
              message: {
                color: 'var(--theme-text)',
              },
              closeButton: {
                color: 'var(--theme-text)',
                '&:hover': {
                  backgroundColor: 'var(--theme-hover)',
                },
              },
            }}
          >
            {error}
          </Alert>
        )}

        {importing && (
          <Box style={{ textAlign: 'center', padding: '20px 0' }}>
            <Loader size="md" />
            <Text mt="md" style={{ color: 'var(--theme-text-secondary)' }}>
              Импорт сообщений...
            </Text>
          </Box>
        )}

        {successCount !== null && !importing && (
          <Alert
            icon={<IconCheck size={16} />}
            title="Успешно"
            color="green"
            variant="light"
            styles={{
              root: {
                backgroundColor: 'var(--theme-bg)',
                border: '1px solid var(--theme-border)',
              },
              title: {
                color: 'var(--theme-text)',
              },
              message: {
                color: 'var(--theme-text)',
              },
            }}
          >
            Импортировано записей: {successCount}
          </Alert>
        )}

        {messages.length > 0 && (
          <>
            <Card
              padding="md"
              radius="md"
              style={{
                backgroundColor: 'var(--theme-surface)',
                border: '1px solid var(--theme-border)',
              }}
            >
              <Group justify="space-between" align="center">
                <Group gap="xs" align="center">
                  <IconCheck size={18} style={{ color: 'var(--theme-primary)' }} />
                  <Text style={{ color: 'var(--theme-text)', fontWeight: 500 }}>
                    Найдено сообщений: {messages.length}
                  </Text>
                </Group>
              <Group gap="xs">
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={toggleSelectAll}
                  style={{ 
                    color: 'var(--theme-text)',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {selectedIndices.size === messages.length ? 'Снять все' : 'Выбрать все'}
                </Button>
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => {
                    setMessages([])
                    setSelectedIndices(new Set())
                    setError(null)
                  }}
                  style={{ 
                    color: 'var(--theme-text)',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  Очистить
                </Button>
              </Group>
              </Group>
            </Card>

            <ScrollArea 
              style={{ height: isMobile ? '400px' : '500px' }}
              styles={{
                scrollbar: {
                  '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
                    backgroundColor: 'var(--theme-border)',
                  },
                },
                thumb: {
                  backgroundColor: 'var(--theme-border)',
                },
              }}
            >
              <Stack gap="xs">
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    style={{
                      padding: '12px',
                      backgroundColor: selectedIndices.has(index)
                        ? 'var(--theme-hover)'
                        : 'transparent',
                      borderRadius: '8px',
                      border: '1px solid var(--theme-border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => toggleSelection(index)}
                    onMouseEnter={(e) => {
                      if (!selectedIndices.has(index)) {
                        e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedIndices.has(index)) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <Group align="flex-start" gap="sm" wrap="nowrap">
                      <Checkbox
                        checked={selectedIndices.has(index)}
                        onChange={() => toggleSelection(index)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ marginTop: '4px' }}
                        styles={{
                          input: {
                            backgroundColor: 'var(--theme-bg)',
                            borderColor: 'var(--theme-border)',
                            '&:checked': {
                              backgroundColor: 'var(--theme-primary)',
                              borderColor: 'var(--theme-primary)',
                            },
                          },
                          label: {
                            color: 'var(--theme-text)',
                          },
                        }}
                      />
                      <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          size="xs"
                          style={{
                            color: 'var(--theme-text-secondary)',
                            fontWeight: 500,
                          }}
                        >
                          {formatDate(message.date)}
                        </Text>
                        <Text
                          size="sm"
                          style={{
                            color: 'var(--theme-text)',
                            wordBreak: 'break-word',
                          }}
                        >
                          {truncateText(message.text, 200)}
                        </Text>
                      </Stack>
                    </Group>
                  </Box>
                ))}
              </Stack>
            </ScrollArea>

            <Group justify="space-between" align="center">
              <Text size="sm" style={{ color: 'var(--theme-text-secondary)' }}>
                Выбрано: {selectedIndices.size} из {messages.length}
              </Text>
              <Group gap="sm">
                <Button
                  variant="subtle"
                  onClick={handleClose}
                  disabled={importing}
                  style={{ 
                    color: 'var(--theme-text)',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--theme-border)',
                  }}
                  onMouseEnter={(e) => {
                    if (!importing) {
                      e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleImport}
                  loading={importing}
                  disabled={selectedIndices.size === 0}
                  styles={{
                    root: {
                      backgroundColor: 'var(--theme-primary)',
                      border: 'none',
                      fontWeight: 500,
                      '&:hover:not(:disabled)': {
                        backgroundColor: 'var(--theme-primary)',
                        opacity: 0.9,
                      },
                      '&:disabled': {
                        backgroundColor: 'var(--theme-border)',
                        opacity: 0.6,
                      },
                    },
                    label: {
                      color: 'var(--theme-bg)',
                    },
                  }}
                >
                  Импортировать выбранные
                </Button>
              </Group>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  )
}

