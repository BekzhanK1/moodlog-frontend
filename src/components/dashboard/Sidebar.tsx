import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Stack,
  Button,
  TextInput,
  Text,
  Card,
  Group,
  Badge,
  ScrollArea,
  Drawer,
  ActionIcon,
  Loader,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import {
  IconPlus,
  IconChartLine,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconHash,
  IconX,
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { EntryResponse } from '../../utils/api'
import { highlightText, shouldHighlightTag } from '../../utils/highlight'

interface SidebarProps {
  entries: EntryResponse[]
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onNewEntry: () => void
  onEntryClick: (entry: EntryResponse) => void
  onSearch?: (query: string) => void
  searchQuery?: string
  opened?: boolean
  onClose?: () => void
  selectedEntryId?: string | null
  deletingEntryId?: string | null
}

export function Sidebar({
  entries,
  isLoading,
  hasMore,
  onLoadMore,
  onNewEntry,
  onEntryClick,
  onSearch,
  searchQuery = '',
  opened,
  onClose,
  selectedEntryId,
  deletingEntryId,
}: SidebarProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchValue, setSearchValue] = useState(searchQuery)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Sync searchValue with searchQuery prop
  useEffect(() => {
    setSearchValue(searchQuery)
  }, [searchQuery])

  // Keyboard shortcut for search (Cmd/Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // On mobile, close sidebar when entry is clicked
  const handleEntryClick = (entry: EntryResponse) => {
    onEntryClick(entry)
    if (isMobile && onClose) {
      onClose()
    }
  }

  const handleNewEntry = () => {
    onNewEntry()
    if (isMobile && onClose) {
      onClose()
    }
  }

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, isLoading, onLoadMore])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatDateGroup = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const dateStr = date.toDateString()
    const todayStr = today.toDateString()
    const yesterdayStr = yesterday.toDateString()
    
    if (dateStr === todayStr) {
      return 'Сегодня'
    } else if (dateStr === yesterdayStr) {
      return 'Вчера'
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      })
    }
  }

  // Group entries by date
  const groupedEntries = entries.reduce((acc, entry) => {
    const dateKey = new Date(entry.created_at).toDateString()
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(entry)
    return acc
  }, {} as Record<string, typeof entries>)

  const truncateContent = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength).trim() + '...'
  }

  const getMoodEmoji = (rating: number | null): string => {
    if (rating === null) return '😐'
    
    // Range: -2.0 to +2.0
    // Division:
    // -2.0 to -1.0: 😢 (very negative/sad)
    // -1.0 to -0.3: 😕 (negative/unhappy)
    // -0.3 to 0.3: 😐 (neutral)
    // 0.3 to 1.0: 🙂 (positive/happy)
    // 1.0 to 2.0: 😄 (very positive/very happy)
    
    if (rating <= -1.0) return '😢'
    if (rating <= -0.3) return '😕'
    if (rating <= 0.3) return '😐'
    if (rating <= 1.0) return '🙂'
    return '😄'
  }

  const getMoodColor = (rating: number | null) => {
    if (rating === null) return '#999'
    if (rating >= 1.0) return '#22c55e' // green - very positive
    if (rating >= 0.3) return '#84cc16' // yellow-green - positive
    if (rating >= -0.3) return '#999' // gray - neutral
    if (rating >= -1.0) return '#f59e0b' // orange - negative
    return '#ef4444' // red - very negative
  }

  const sidebarContent = (
    <>
      {/* Buttons - Hidden on mobile (using floating buttons instead) */}
      {!isMobile && (
        <Box style={{ padding: '16px', borderBottom: '1px solid var(--theme-border)' }}>
          <Stack gap="sm">
            <Button
              fullWidth
              leftSection={<IconPlus size={18} />}
              radius="md"
              size="sm"
              onClick={handleNewEntry}
              style={{
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-bg)',
                fontWeight: 400,
                border: '1px solid var(--theme-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-bg)'
                e.currentTarget.style.color = 'var(--theme-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-primary)'
                e.currentTarget.style.color = 'var(--theme-bg)'
              }}
            >
              Новая запись
            </Button>

            <Button
              fullWidth
              leftSection={<IconChartLine size={18} />}
              variant="outline"
              radius="md"
              size="sm"
              onClick={() => navigate('/analytics')}
              style={{
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)',
                backgroundColor: 'var(--theme-bg)',
                fontWeight: 400,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--theme-primary)'
                e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--theme-border)'
                e.currentTarget.style.backgroundColor = 'var(--theme-bg)'
              }}
            >
              Аналитика
            </Button>
          </Stack>
        </Box>
      )}

      {/* Search Input */}
      <Box style={{ padding: '16px', borderBottom: '1px solid var(--theme-border)' }}>
        <TextInput
          ref={searchInputRef}
          placeholder="Поиск или #тег (⌘K)"
          value={searchValue}
          onChange={(e) => {
              const value = e.currentTarget.value
              setSearchValue(value)
              
              // Clear timeout if exists
              if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
              }
              
              // If empty, clear search immediately
              if (!value.trim()) {
                if (onSearch) {
                  onSearch('')
                }
              } else {
                // Debounce search - wait 500ms after user stops typing
                searchTimeoutRef.current = setTimeout(() => {
                  if (onSearch) {
                    onSearch(value)
                  }
                }, 500)
              }
            }}
            rightSection={
              searchValue ? (
                <IconX
                  size={16}
                  style={{
                    color: 'var(--theme-text-secondary)',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setSearchValue('')
                    if (onSearch) {
                      onSearch('')
                    }
                  }}
                />
              ) : null
            }
            leftSection={
              <IconSearch 
                size={isMobile ? 18 : 16} 
                style={{ color: 'var(--theme-text-secondary)' }} 
              />
            }
            radius="md"
            size={isMobile ? 'md' : 'sm'}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            styles={{
              input: {
                borderColor: isSearchFocused ? 'var(--theme-primary)' : 'var(--theme-border)',
                backgroundColor: 'var(--theme-bg)',
                color: 'var(--theme-text)',
                transition: 'border-color 0.3s ease',
              },
              section: {
                color: 'var(--theme-text-secondary)',
              },
            }}
          />
      </Box>

      {/* Entries list */}
      <ScrollArea
        style={{ flex: 1 }}
        viewportRef={scrollAreaRef}
      >
        <Box style={{ padding: isMobile ? '12px' : '16px' }}>
          {!isLoading && entries.length === 0 ? (
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 24px',
                textAlign: 'center',
                minHeight: '300px',
              }}
            >
              <Box
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--theme-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  opacity: 0.6,
                }}
              >
                <IconPlus size={32} style={{ color: 'var(--theme-text-secondary)' }} />
              </Box>
              <Text
                size="lg"
                style={{
                  color: 'var(--theme-text)',
                  fontWeight: 500,
                  marginBottom: '8px',
                }}
              >
                {searchQuery ? 'Записи не найдены' : 'Пока нет записей'}
              </Text>
              <Text
                size="sm"
                style={{
                  color: 'var(--theme-text-secondary)',
                  marginBottom: '24px',
                  maxWidth: '280px',
                }}
              >
                {searchQuery 
                  ? 'Попробуйте изменить поисковый запрос или создать новую запись'
                  : 'Создайте свою первую запись, чтобы начать вести дневник настроения'}
              </Text>
              {!searchQuery && (
                <Button
                  leftSection={<IconPlus size={18} />}
                  onClick={handleNewEntry}
                  style={{
                    backgroundColor: 'var(--theme-primary)',
                    color: 'var(--theme-bg)',
                  }}
                >
                  Создать запись
                </Button>
              )}
            </Box>
          ) : (
            <Stack gap={isMobile ? 'md' : 'lg'}>
              {Object.entries(groupedEntries).map(([dateKey, dateEntries]) => (
                <Box key={dateKey}>
                  <Text
                    size="xs"
                    style={{
                      color: 'var(--theme-text-secondary)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '12px',
                      paddingLeft: '4px',
                    }}
                  >
                    {formatDateGroup(dateEntries[0].created_at)}
                  </Text>
                  <Stack gap={isMobile ? 'sm' : 'md'}>
                    {dateEntries.map((entry) => {
              const isSelected = selectedEntryId === entry.id
              const isDeleting = deletingEntryId === entry.id
              const isDraft = entry.is_draft || false
              return (
                <Card
                  key={entry.id}
                  padding={isMobile ? 'sm' : 'md'}
                  radius="md"
                  style={{
                    border: isSelected 
                      ? '1px solid var(--theme-primary)' 
                      : isDraft 
                        ? '1px dashed var(--theme-border)' 
                        : '1px solid var(--theme-border)',
                    borderLeft: isSelected 
                      ? '4px solid var(--theme-primary)' 
                      : isDraft 
                        ? '4px dashed var(--theme-text-secondary)' 
                        : '1px solid var(--theme-border)',
                    backgroundColor: isSelected 
                      ? 'var(--theme-hover)' 
                      : isDraft 
                        ? 'var(--theme-hover)' 
                        : 'var(--theme-bg)',
                    opacity: isDraft && !isSelected ? 0.85 : (isDeleting ? 0 : 1),
                    cursor: isDeleting ? 'default' : 'pointer',
                    transition: isDeleting ? 'opacity 0.5s ease, transform 0.5s ease, max-height 0.5s ease, margin 0.5s ease, padding 0.5s ease' : 'all 0.3s ease',
                    position: 'relative',
                    transform: isDeleting ? 'translateX(-20px) scale(0.95)' : 'translateX(0) scale(1)',
                    maxHeight: isDeleting ? 0 : 'none',
                    marginBottom: isDeleting ? 0 : undefined,
                    padding: isDeleting ? 0 : undefined,
                    overflow: 'hidden',
                    pointerEvents: isDeleting ? 'none' : 'auto',
                  }}
                  onClick={() => !isDeleting && handleEntryClick(entry)}
                  onMouseEnter={(e) => {
                    if (!isSelected && !isDeleting) {
                      e.currentTarget.style.borderColor = 'var(--theme-primary)'
                      e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !isDeleting) {
                      e.currentTarget.style.borderColor = 'var(--theme-border)'
                      e.currentTarget.style.backgroundColor = 'var(--theme-bg)'
                    }
                  }}
                >
                <Stack gap="xs">
                  {/* Date and Draft badge */}
                  <Group justify="space-between" align="center" gap="xs">
                    <Text
                      size="xs"
                      style={{
                        color: 'var(--theme-text-secondary)',
                        fontWeight: 400,
                      }}
                    >
                      {formatDate(entry.created_at)}
                    </Text>
                    {entry.is_draft && (
                      <Box
                        style={{
                          backgroundColor: 'var(--theme-hover)',
                          border: '1px solid var(--theme-border)',
                          borderRadius: '4px',
                          padding: '2px 6px',
                        }}
                      >
                        <Text
                          size="xs"
                          style={{
                            color: 'var(--theme-text-secondary)',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontSize: '10px',
                          }}
                        >
                          Черновик
                        </Text>
                      </Box>
                    )}
                  </Group>

                  {/* Title or content preview */}
                  {entry.title ? (
                    <Text
                      size={isMobile ? 'xs' : 'sm'}
                      style={{
                        color: 'var(--theme-text)',
                        fontWeight: 500,
                        marginBottom: '4px',
                      }}
                    >
                      {searchQuery && !searchQuery.startsWith('#')
                        ? highlightText(entry.title, searchQuery, false)
                        : entry.title}
                    </Text>
                  ) : null}

                  <Text
                    size={isMobile ? 'xs' : 'sm'}
                    style={{
                      color: 'var(--theme-text-secondary)',
                      fontWeight: 400,
                      lineHeight: 1.5,
                    }}
                  >
                    {searchQuery && !searchQuery.startsWith('#')
                      ? highlightText(truncateContent(entry.content, isMobile ? 40 : 50), searchQuery, false)
                      : truncateContent(entry.content, isMobile ? 40 : 50)}
                  </Text>

                  {/* Tags and mood rating */}
                  <Group gap="xs" justify="space-between" align="flex-end">
                    <Group gap="xs" style={{ flexWrap: 'wrap', flex: 1 }}>
                      {entry.tags && entry.tags.length > 0 ? (
                        entry.tags.slice(0, isMobile ? 2 : 3).map((tag, idx) => {
                          const isHighlighted = shouldHighlightTag(tag, searchQuery)
                          return (
                            <Badge
                              key={idx}
                              variant="light"
                              radius="sm"
                              leftSection={<IconHash size={8} />}
                              style={{
                                backgroundColor: isHighlighted ? 'var(--theme-primary)' : 'var(--theme-hover)',
                                color: isHighlighted ? 'var(--theme-bg)' : 'var(--theme-text-secondary)',
                                border: isHighlighted ? '1px solid var(--theme-primary)' : 'none',
                                fontWeight: isHighlighted ? 500 : 400,
                                fontSize: isMobile ? '8px' : '9px',
                                padding: '1px 4px',
                                lineHeight: 1.2,
                                transition: 'all 0.2s ease',
                              }}
                            >
                              {tag}
                            </Badge>
                          )
                        })
                      ) : null}
                    </Group>

                    {entry.mood_rating !== null && (
                      <Group gap={4} align="center">
                        <Text
                          style={{
                            fontSize: isMobile ? '14px' : '16px',
                            lineHeight: 1,
                          }}
                        >
                          {getMoodEmoji(entry.mood_rating)}
                        </Text>
                        <Text
                          size="xs"
                          style={{
                            color: getMoodColor(entry.mood_rating),
                            fontWeight: 500,
                            fontFamily: 'monospace',
                          }}
                        >
                          {entry.mood_rating.toFixed(1)}
                        </Text>
                      </Group>
                    )}
                  </Group>
                </Stack>
              </Card>
              )
                    })}
                  </Stack>
                </Box>
              ))}

            {/* Load more trigger */}
            {hasMore && (
              <Box ref={loadMoreRef} style={{ height: '20px' }} />
            )}

              {isLoading && entries.length === 0 && (
                <Box style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <Stack gap="md" align="center">
                    <Loader size="md" color="var(--theme-primary)" />
                    <Text size="sm" style={{ color: 'var(--theme-text-secondary)' }}>
                      Загрузка записей...
                    </Text>
                  </Stack>
                </Box>
              )}

              {isLoading && entries.length > 0 && (
                <Box style={{ textAlign: 'center', padding: '16px' }}>
                  <Loader size="sm" color="var(--theme-primary)" />
                </Box>
              )}
            </Stack>
          )}
        </Box>
      </ScrollArea>
    </>
  )

  // Mobile: Use Drawer
  if (isMobile) {
    return (
      <Drawer
        opened={opened || false}
        onClose={onClose || (() => {})}
        title={
          <Group justify="space-between" style={{ width: '100%' }}>
            <Text style={{ fontWeight: 500, color: 'var(--theme-text)' }}>Записи</Text>
            {onClose && (
              <ActionIcon
                variant="subtle"
                onClick={onClose}
                radius="md"
              >
                <IconX size={18} />
              </ActionIcon>
            )}
          </Group>
        }
        padding="md"
        size="85%"
        styles={{
          content: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--theme-bg)',
          },
          body: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: 'var(--theme-bg)',
          },
          header: {
            backgroundColor: 'var(--theme-bg)',
            borderBottom: '1px solid var(--theme-border)',
          },
          title: {
            color: 'var(--theme-text)',
          },
        }}
      >
        <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {sidebarContent}
        </Box>
      </Drawer>
    )
  }

  // Desktop: Regular sidebar
  return (
    <Box
      style={{
        width: isCollapsed ? '64px' : '320px',
        height: 'calc(100vh - 64px)',
        borderRight: '1px solid var(--theme-border)',
        backgroundColor: 'var(--theme-bg)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'relative',
      }}
    >
      {/* Collapse button */}
      <Box
        style={{
          position: 'absolute',
          top: '16px',
          right: '-12px',
          zIndex: 10,
          cursor: 'pointer',
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
          }}
        >
          {isCollapsed ? (
            <IconChevronRight size={14} style={{ color: 'var(--theme-text-secondary)' }} />
          ) : (
            <IconChevronLeft size={14} style={{ color: 'var(--theme-text-secondary)' }} />
          )}
        </Box>
      </Box>

      {!isCollapsed && sidebarContent}
    </Box>
  )
}

