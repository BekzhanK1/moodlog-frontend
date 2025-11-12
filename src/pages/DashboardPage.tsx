import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Loader, Alert, Stack, ScrollArea, Text } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconAlertCircle } from '@tabler/icons-react'
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
  }, [searchQuery])

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
        // Create new entry
        const newEntry = await apiClient.createEntry({
          title: title.trim() || null,
          content: content.trim(),
          is_draft: false,
        })

        // Reset editor immediately
        editorRef.current.reset()
        setWordCount(0)

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
        const updatedEntry = await apiClient.getEntryById(newEntry.id)

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
  }, [fetchEntries, logout, setSearchParams, isEditingEntry, selectedEntry])

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
        <Stack align="center" gap="md">
          <Loader size="lg" />
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
          />
        )}

        {/* Main content area */}
        <ScrollArea
          style={{
            flex: 1,
            backgroundColor: 'var(--theme-bg)',
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
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                gap: '24px',
              }}
            >
              <Loader size="lg" color="var(--theme-primary)" />
              <Stack gap="xs" align="center">
                <Text
                  style={{
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: 500,
                    color: 'var(--theme-text)',
                  }}
                >
                  Анализ записи...
                </Text>
                <Text
                  size="sm"
                  style={{
                    color: 'var(--theme-text-secondary)',
                    textAlign: 'center',
                    maxWidth: '400px',
                  }}
                >
                  Искусственный интеллект анализирует вашу запись и определяет настроение, теги и другие характеристики
                </Text>
              </Stack>
            </Box>
          ) : isNewEntry || isEditingEntry ? (
            <NewEntryEditor
              ref={editorRef}
              onContentChange={handleWordCountChange}
              onSave={handleSaveEntry}
              isSaving={isSaving}
              wordCount={wordCount}
              initialTitle={isEditingEntry && selectedEntry ? selectedEntry.title || '' : ''}
              initialContent={isEditingEntry && selectedEntry ? selectedEntry.content : ''}
              buttonText={isEditingEntry ? 'Сохранить изменения' : 'Сохранить'}
            />
          ) : selectedEntry ? (
            <EntryView entry={selectedEntry} onEdit={handleEditEntry} onTagClick={handleTagClick} searchQuery={searchQuery} />
          ) : (
            <Box
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
              }}
            >
              <Box
                style={{
                  textAlign: 'center',
                  color: '#999',
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
                <Box style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 300 }}>
                  Выберите запись из списка или создайте новую
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
    </Box>
  )
}
