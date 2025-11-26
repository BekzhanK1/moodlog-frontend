import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Alert, Stack, ScrollArea, Text, ActionIcon } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconAlertCircle, IconPlus, IconChartLine } from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { apiClient, EntryResponse, EntryListResponse } from '../utils/api'
import { Navbar } from '../components/dashboard/Navbar'
import { Sidebar } from '../components/dashboard/Sidebar'
import { EntryView } from '../components/dashboard/EntryView'
import { NewEntryEditor, NewEntryEditorHandle } from '../components/dashboard/NewEntryEditor'
import { RightSidebar } from '../components/dashboard/RightSidebar'

export function DashboardPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { logout, isAuthenticated, isLoading: authLoading, user } = useAuth()
  const [entries, setEntries] = useState<EntryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<EntryResponse | null>(null)
  const [isNewEntry, setIsNewEntry] = useState(false)
  const [isEditingEntry, setIsEditingEntry] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [sidebarOpened, setSidebarOpened] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null)
  const [draftEntryId, setDraftEntryId] = useState<string | null>(null)
  const editorRef = useRef<NewEntryEditorHandle>(null)
  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    // Wait for auth to finish loading before checking authentication
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
      return
    }
  }, [isAuthenticated, authLoading, navigate])

  const fetchEntries = useCallback(async (page: number, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      let response: EntryListResponse
      if (searchQuery.trim()) {
        response = await apiClient.searchEntries(searchQuery.trim(), page, 10)
      } else {
        response = await apiClient.getEntries(page, 10)
      }
      
      if (append) {
        setEntries((prev) => [...prev, ...response.entries])
      } else {
        setEntries(response.entries)
      }

      setHasMore(response.page < response.total_pages)
      setCurrentPage(response.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить записи')
      if (err instanceof Error && err.message.includes('401')) {
        logout()
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [logout, searchQuery])

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchEntries(1, false)
    }
  }, [isAuthenticated, authLoading, fetchEntries])

  // Refetch entries when search query changes
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchEntries(1, false)
    }
  }, [searchQuery, isAuthenticated, authLoading, fetchEntries])

  // Restore selected entry from URL on mount or when entries change
  useEffect(() => {
    const entryId = searchParams.get('entry')
    if (entryId && !selectedEntry && !isNewEntry && !isEditingEntry) {
      // First, try to find entry in current entries list
      const entry = entries.find((e) => e.id === entryId)
      if (entry) {
        setSelectedEntry(entry)
        setIsNewEntry(false)
        setIsEditingEntry(false)
      } else if (entries.length > 0) {
        // Entry not in current list, fetch it directly
        apiClient.getEntryById(entryId)
          .then((fetchedEntry) => {
            setSelectedEntry(fetchedEntry)
            setIsNewEntry(false)
            setIsEditingEntry(false)
          })
          .catch(() => {
            // Entry not found or error, clear URL param
            setSearchParams({})
          })
      }
    }
  }, [entries, searchParams, selectedEntry, isNewEntry, isEditingEntry, setSearchParams])

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchEntries(currentPage + 1, true)
    }
  }, [currentPage, hasMore, loadingMore, fetchEntries])

  const handleNewEntry = () => {
    setSelectedEntry(null)
    setIsNewEntry(true)
    setIsEditingEntry(false)
    setWordCount(0)
    setSearchQuery('') // Clear search when creating new entry
    // Clear entry from URL
    setSearchParams({})
  }

  const handleEntryClick = (entry: EntryResponse) => {
    setSelectedEntry(entry)
    setIsNewEntry(false)
    setIsEditingEntry(false)
    // Don't clear search when clicking entry - user might want to see other search results
    // Update URL with entry ID
    setSearchParams({ entry: entry.id })
  }

  const handleEditEntry = () => {
    if (selectedEntry) {
      setIsEditingEntry(true)
      setIsNewEntry(false)
      // Set word count for the entry being edited
      const words = selectedEntry.content.trim().split(/\s+/).filter(word => word.length > 0).length
      setWordCount(words)
      // Set initial values in editor
      if (editorRef.current) {
        editorRef.current.setInitialValues(selectedEntry.title || '', selectedEntry.content)
      }
    }
  }

  const handleDeleteEntry = async () => {
    if (!selectedEntry) return

    const deletedEntryId = selectedEntry.id

    try {
      setIsDeleting(true)
      setDeletingEntryId(deletedEntryId)
      
      // Start fade-out animation
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Delete entry from backend
      await apiClient.deleteEntry(deletedEntryId)
      
      // Wait for fade-out animation to complete (400ms more)
      await new Promise(resolve => setTimeout(resolve, 400))
      
      // Remove entry from local state after animation
      setEntries((prevEntries) =>
        prevEntries.filter((entry) => entry.id !== deletedEntryId)
      )

      // Clear selection after animation completes
      setSelectedEntry(null)
      setIsNewEntry(false)
      setIsEditingEntry(false)
      setSearchParams({})
      setIsDeleting(false)
      setDeletingEntryId(null)

      // Refresh entries list to ensure consistency
      fetchEntries(1, false)
    } catch (error) {
      console.error('Failed to delete entry:', error)
      setIsDeleting(false)
      setDeletingEntryId(null)
      // You might want to show an error notification here
    }
  }

  const handleWordCountChange = (count: number) => {
    setWordCount(count)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleTagClick = (tag: string) => {
    setSearchQuery(`#${tag}`)
    setCurrentPage(1)
  }

  const handleAutoSave = useCallback(async (title: string | null, content: string): Promise<string | null> => {
    if (!content.trim()) {
      return null
    }

    try {
      if (draftEntryId) {
        // Update existing draft
        await apiClient.updateEntry(draftEntryId, {
          title,
          content,
          is_draft: true,
        })
        return draftEntryId
      } else {
        // Create new draft
        const draftEntry = await apiClient.createEntry({
          title,
          content,
          is_draft: true,
        })
        setDraftEntryId(draftEntry.id)
        return draftEntry.id
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
      return null
    }
  }, [draftEntryId])

  const handleSaveEntry = useCallback(async () => {
    if (!editorRef.current) return

    const title = editorRef.current.getTitle()
    const content = editorRef.current.getContent()

    if (!content.trim()) {
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      if (isEditingEntry && selectedEntry) {
        // Update existing entry
        const updatedEntry = await apiClient.updateEntry(selectedEntry.id, {
          title: title.trim() || null,
          content: content.trim(),
        })

        // Reset editor immediately
        editorRef.current.reset()
        setWordCount(0)

        // Show AI analysis loader immediately after saving
        setIsAnalyzing(true)
        setIsEditingEntry(false)
        setIsSaving(false) // Hide saving button loader

        // Refresh entries list in background (don't wait for it)
        fetchEntries(1, false).catch(() => {
          // Silently handle errors, we'll refresh later
        })
        
        // Wait 5 seconds for AI analysis
        await new Promise(resolve => setTimeout(resolve, 5000))

        // Fetch the updated entry with AI analysis
        const finalEntry = await apiClient.getEntryById(updatedEntry.id)

        // Refresh entries list one more time to ensure it's up to date
        await fetchEntries(1, false)

        // Select the updated entry
        setSelectedEntry(finalEntry)
        setSearchParams({ entry: finalEntry.id })
      } else {
        // Publish entry (either create new or publish existing draft)
        let publishedEntry: EntryResponse

        if (draftEntryId) {
          // Publish existing draft by changing is_draft to false
          publishedEntry = await apiClient.updateEntry(draftEntryId, {
            title: title.trim() || null,
            content: content.trim(),
            is_draft: false,
          })
          setDraftEntryId(null)
        } else {
          // Create new entry (not a draft)
          publishedEntry = await apiClient.createEntry({
            title: title.trim() || null,
            content: content.trim(),
            is_draft: false,
          })
        }

        // Reset editor immediately
        editorRef.current.reset()
        setWordCount(0)
        setDraftEntryId(null)

        // Show AI analysis loader immediately after saving
        setIsAnalyzing(true)
        setIsNewEntry(false)
        setIsSaving(false) // Hide saving button loader

        // Refresh entries list in background (don't wait for it)
        fetchEntries(1, false).catch(() => {
          // Silently handle errors, we'll refresh later
        })
        
        // Wait 5 seconds for AI analysis
        await new Promise(resolve => setTimeout(resolve, 5000))

        // Fetch the updated entry with AI analysis
        const updatedEntry = await apiClient.getEntryById(publishedEntry.id)

        // Refresh entries list one more time to ensure it's up to date
        await fetchEntries(1, false)

        // Select the new entry
        setSelectedEntry(updatedEntry)
        setSearchParams({ entry: updatedEntry.id })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить запись')
      if (err instanceof Error && err.message.includes('401')) {
        logout()
      }
    } finally {
      setIsSaving(false)
      setIsAnalyzing(false)
    }
  }, [fetchEntries, logout, setSearchParams, isEditingEntry, selectedEntry, draftEntryId])

  // Show loading while auth is being checked or entries are loading
  if (authLoading || (loading && entries.length === 0)) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--theme-bg)',
        }}
      >
        <Stack align="center" gap="xl">
          <Box
            style={{
              fontSize: isMobile ? '32px' : '48px',
              fontWeight: 200,
              letterSpacing: isMobile ? '4px' : '8px',
              color: 'var(--theme-text)',
              opacity: 0.8,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            MoodLog
          </Box>
          <Box
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--theme-primary)',
                  opacity: 0.4,
                  animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </Box>
        </Stack>
      </Box>
    )
  }

  if (error && entries.length === 0) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--theme-bg)',
          padding: '40px',
        }}
      >
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Ошибка"
          color="red"
          variant="light"
          style={{
            backgroundColor: '#fff5f5',
            border: '1px solid #fecaca',
            color: '#991b1b',
            maxWidth: '500px',
          }}
        >
          {error}
        </Alert>
      </Box>
    )
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--theme-bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar
        userPicture={user?.picture}
        onMenuClick={() => setSidebarOpened(true)}
      />

      <Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {!isMobile && (
          <Sidebar
            entries={entries}
            isLoading={loadingMore}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onNewEntry={handleNewEntry}
            onEntryClick={handleEntryClick}
            onSearch={handleSearch}
            searchQuery={searchQuery}
            selectedEntryId={selectedEntry?.id || null}
            deletingEntryId={deletingEntryId}
          />
        )}
        {isMobile && (
          <Sidebar
            entries={entries}
            isLoading={loadingMore}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onNewEntry={handleNewEntry}
            onEntryClick={handleEntryClick}
            onSearch={handleSearch}
            searchQuery={searchQuery}
            opened={sidebarOpened}
            onClose={() => setSidebarOpened(false)}
            selectedEntryId={selectedEntry?.id || null}
            deletingEntryId={deletingEntryId}
          />
        )}

        {/* Main content area */}
        <ScrollArea
          style={{
            flex: 1,
            backgroundColor: 'var(--theme-bg)',
            height: '100%',
            paddingBottom: isMobile ? '100px' : '0',
          }}
        >
          {error && (
            <Box style={{ padding: isMobile ? '16px' : '20px 40px' }}>
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Ошибка"
                color="red"
                variant="light"
                onClose={() => setError(null)}
                withCloseButton
                style={{
                  backgroundColor: '#fff5f5',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                }}
              >
                {error}
              </Alert>
            </Box>
          )}
          {isAnalyzing ? (
            <Box
              style={{
                minHeight: 'calc(100vh - 120px)',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                gap: '32px',
                backgroundColor: 'var(--theme-bg)',
                position: 'relative',
                animation: 'fadeIn 0.4s ease-out',
              }}
            >
              {/* Modern AI brain icon with animation */}
              <Box
                style={{
                  position: 'relative',
                  width: isMobile ? '80px' : '100px',
                  height: isMobile ? '80px' : '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Outer ring */}
                <Box
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    border: '2px solid var(--theme-border)',
                    borderRadius: '50%',
                    borderTopColor: 'var(--theme-primary)',
                    animation: 'spin 1.5s linear infinite',
                  }}
                />
                {/* Inner ring */}
                <Box
                  style={{
                    position: 'absolute',
                    width: '70%',
                    height: '70%',
                    border: '2px solid var(--theme-border)',
                    borderRadius: '50%',
                    borderBottomColor: 'var(--theme-primary)',
                    animation: 'spin 1s linear infinite reverse',
                  }}
                />
                {/* Brain icon placeholder - using dots */}
                <Box
                  style={{
                    fontSize: isMobile ? '28px' : '36px',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                >
                  🧠
                </Box>
              </Box>
              
              <Stack gap="md" align="center">
                <Text
                  component="div"
                  style={{
                    fontSize: isMobile ? '18px' : '22px',
                    fontWeight: 500,
                    color: 'var(--theme-text)',
                    animation: 'fadeIn 0.5s ease-out 0.2s backwards',
                  }}
                >
                  Анализ записи...
                </Text>
                <Text
                  component="div"
                  size="sm"
                  style={{
                    color: 'var(--theme-text-secondary)',
                    textAlign: 'center',
                    maxWidth: '400px',
                    lineHeight: 1.6,
                    animation: 'fadeIn 0.5s ease-out 0.4s backwards',
                  }}
                >
                  Искусственный интеллект анализирует вашу запись и определяет настроение, теги и другие характеристики
                </Text>
                
                {/* Progress dots */}
                <Box
                  style={{
                    display: 'flex',
                    gap: '6px',
                    marginTop: '8px',
                    animation: 'fadeIn 0.5s ease-out 0.6s backwards',
                  }}
                >
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Box
                      key={i}
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--theme-primary)',
                        opacity: 0.3,
                        animation: `pulse 1s ease-in-out ${i * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </Box>
              </Stack>
            </Box>
          ) : isNewEntry || isEditingEntry ? (
            <NewEntryEditor
              ref={editorRef}
              onContentChange={handleWordCountChange}
              onSave={handleSaveEntry}
              onAutoSave={handleAutoSave}
              onClose={() => {
                // Capture current editing state before resetting
                const wasEditing = isEditingEntry
                setIsNewEntry(false)
                setIsEditingEntry(false)
                setWordCount(0)
                setDraftEntryId(null)
                // Keep selectedEntry if we were editing, to show it after cancel
                if (!wasEditing) {
                  setSelectedEntry(null)
                  setSearchParams({})
                }
              }}
              isSaving={isSaving}
              wordCount={wordCount}
              initialTitle={isEditingEntry && selectedEntry ? selectedEntry.title || '' : ''}
              initialContent={isEditingEntry && selectedEntry ? selectedEntry.content : ''}
              buttonText={isEditingEntry ? 'Сохранить изменения' : (draftEntryId ? 'Опубликовать' : 'Сохранить')}
              draftEntryId={draftEntryId}
              isEditing={isEditingEntry}
            />
          ) : selectedEntry ? (
            <Box
              style={{
                opacity: isDeleting ? 0 : 1,
                transform: isDeleting ? 'translateY(-30px) scale(0.95)' : 'translateY(0) scale(1)',
                transition: isDeleting ? 'opacity 0.5s ease, transform 0.5s ease' : 'none',
                pointerEvents: isDeleting ? 'none' : 'auto',
                filter: isDeleting ? 'blur(4px)' : 'blur(0)',
              }}
            >
              <EntryView 
                entry={selectedEntry} 
                onEdit={handleEditEntry} 
                onDelete={handleDeleteEntry}
                onTagClick={handleTagClick}
                onClose={() => {
                  setSelectedEntry(null)
                  setSearchParams({})
                }}
                searchQuery={searchQuery} 
              />
            </Box>
          ) : (
            <Box
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                cursor: 'pointer',
              }}
              onClick={handleNewEntry}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-bg)'
              }}
            >
              <Box
                style={{
                  textAlign: 'center',
                  color: '#999',
                  transition: 'transform 0.3s ease',
                }}
              >
                <Box
                  style={{
                    fontSize: isMobile ? '32px' : '48px',
                    fontWeight: 200,
                    letterSpacing: isMobile ? '4px' : '8px',
                    marginBottom: '16px',
                  }}
                >
                  MoodLog
                </Box>
                <Box style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 300, marginBottom: '24px' }}>
                  Нажмите, чтобы начать писать
                </Box>
                <Box
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    border: '1px solid var(--theme-border)',
                    borderRadius: '8px',
                    color: 'var(--theme-text-secondary)',
                    fontSize: isMobile ? '14px' : '16px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span style={{ 
                    display: 'inline-block',
                    width: '2px',
                    height: '20px',
                    backgroundColor: 'var(--theme-primary)',
                    animation: 'blink 1s step-end infinite',
                    marginRight: '4px',
                    verticalAlign: 'middle',
                  }} />
                  Начните писать...
                </Box>
              </Box>
            </Box>
          )}
        </ScrollArea>

        {/* Right sidebar - hidden on mobile */}
        {!isMobile && (
          <RightSidebar
            entry={selectedEntry}
            wordCount={wordCount}
            isNewEntry={isNewEntry}
            onTagClick={handleTagClick}
          />
        )}
      </Box>

      {/* Mobile Floating Action Buttons - Hidden when editing/creating */}
      {isMobile && !isNewEntry && !isEditingEntry && (
        <Box
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          {/* Analytics Button */}
          <ActionIcon
            variant="filled"
            size="xl"
            radius="xl"
            onClick={() => navigate('/analytics')}
            style={{
              backgroundColor: 'var(--theme-bg)',
              color: 'var(--theme-text)',
              border: '1px solid var(--theme-border)',
              width: '56px',
              height: '56px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              pointerEvents: 'auto',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)'
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <IconChartLine size={26} stroke={2} />
          </ActionIcon>

          {/* New Entry Button - Big Plus */}
          <ActionIcon
            variant="filled"
            size="xl"
            radius="xl"
            onClick={handleNewEntry}
            style={{
              backgroundColor: 'var(--theme-primary)',
              color: 'var(--theme-bg)',
              width: '56px',
              height: '56px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              pointerEvents: 'auto',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)'
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <IconPlus size={28} stroke={2.5} />
          </ActionIcon>
        </Box>
      )}
    </Box>
  )
}
