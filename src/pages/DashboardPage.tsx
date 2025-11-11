import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Loader, Alert, Stack, ScrollArea } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconAlertCircle } from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { apiClient, EntryResponse } from '../utils/api'
import { Navbar } from '../components/dashboard/Navbar'
import { Sidebar } from '../components/dashboard/Sidebar'
import { EntryView } from '../components/dashboard/EntryView'
import { NewEntryEditor, NewEntryEditorHandle } from '../components/dashboard/NewEntryEditor'
import { RightSidebar } from '../components/dashboard/RightSidebar'

export function DashboardPage() {
  const navigate = useNavigate()
  const { logout, isAuthenticated, isLoading: authLoading, user } = useAuth()
  const [entries, setEntries] = useState<EntryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<EntryResponse | null>(null)
  const [isNewEntry, setIsNewEntry] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [sidebarOpened, setSidebarOpened] = useState(false)
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

      const response = await apiClient.getEntries(page, 10)
      
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
  }, [logout])

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchEntries(1, false)
    }
  }, [isAuthenticated, authLoading, fetchEntries])

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchEntries(currentPage + 1, true)
    }
  }, [currentPage, hasMore, loadingMore, fetchEntries])

  const handleNewEntry = () => {
    setSelectedEntry(null)
    setIsNewEntry(true)
    setWordCount(0)
  }

  const handleEntryClick = (entry: EntryResponse) => {
    setSelectedEntry(entry)
    setIsNewEntry(false)
  }

  const handleWordCountChange = (count: number) => {
    setWordCount(count)
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

      const newEntry = await apiClient.createEntry({
        title: title.trim() || null,
        content: content.trim(),
        is_draft: false,
      })

      // Reset editor
      editorRef.current.reset()
      setWordCount(0)

      // Refresh entries list
      await fetchEntries(1, false)

      // Switch to view mode and select the new entry
      setSelectedEntry(newEntry)
      setIsNewEntry(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить запись')
    } finally {
      setIsSaving(false)
    }
  }, [fetchEntries])

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
          {isNewEntry ? (
            <NewEntryEditor
              ref={editorRef}
              onContentChange={handleWordCountChange}
              onSave={handleSaveEntry}
              isSaving={isSaving}
              wordCount={wordCount}
            />
          ) : selectedEntry ? (
            <EntryView entry={selectedEntry} />
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
          />
        )}
      </Box>
    </Box>
  )
}
