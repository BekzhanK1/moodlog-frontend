import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Alert, Stack, ScrollArea, Text, ActionIcon } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconAlertCircle, IconPlus, IconChartLine } from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { apiClient, EntryResponse, EntryListResponse } from '../utils/api'
import { getEditorFont } from '../utils/fonts'
import { Navbar } from '../components/dashboard/Navbar'
import { Sidebar } from '../components/dashboard/Sidebar'
import { EntryView } from '../components/dashboard/EntryView'
import { NewEntryEditor, NewEntryEditorHandle } from '../components/dashboard/NewEntryEditor'
import { RightSidebar } from '../components/dashboard/RightSidebar'
import { AudioRecorder } from '../components/dashboard/AudioRecorder'
import { SubscriptionMenu } from '../components/subscription/SubscriptionMenu'

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
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)
  const [subscriptionMenuOpened, setSubscriptionMenuOpened] = useState(false)
  const [writingQuestions, setWritingQuestions] = useState<string[]>([])
  const [questionsLoading, setQuestionsLoading] = useState<boolean>(true)
  const editorRef = useRef<NewEntryEditorHandle>(null)
  const hasAutoOpenedRef = useRef(false) // Track if we've auto-opened editor on initial load
  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    // Wait for auth to finish loading before checking authentication
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
      return
    }
    // Redirect admins to admin dashboard
    if (!authLoading && isAuthenticated && user?.is_admin) {
      navigate('/admin/dashboard')
      return
    }
  }, [isAuthenticated, authLoading, navigate, user])

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

  const { subscription } = useSubscription()

  // Check skip status from localStorage (frontend-only logic)
  const checkSkipStatus = useCallback((): { allowed: boolean; remaining: number; resetTime: number | null; errorMessage: string | null; maxSkips: number } => {
    if (!user) {
      return { allowed: false, remaining: 0, resetTime: null, errorMessage: null, maxSkips: 0 }
    }

    // Determine limits based on subscription
    const isPro = subscription?.plan === 'pro_month' || subscription?.plan === 'pro_year'
    const MAX_SKIPS = isPro ? 5 : 1
    const COOLDOWN_MS = isPro ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 1 hour for Pro, 1 day for Free

    const SKIP_STORAGE_KEY = `ai_questions_skips_${user.id}`
    
    try {
      const stored = localStorage.getItem(SKIP_STORAGE_KEY)
      const now = Date.now()

      if (!stored) {
        return { allowed: true, remaining: MAX_SKIPS, resetTime: null, errorMessage: null, maxSkips: MAX_SKIPS }
      }

      const { count, resetAt } = JSON.parse(stored)
      
      // Check if cooldown has passed
      if (resetAt && now < resetAt + COOLDOWN_MS) {
        // Still in cooldown
        if (count >= MAX_SKIPS) {
          const timeRemaining = resetAt + COOLDOWN_MS - now
          const hours = Math.floor(timeRemaining / (60 * 60 * 1000))
          const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000))
          const errorMsg = isPro 
            ? `Сброс доступен через ${minutes}м`
            : `Сброс доступен через ${hours}ч ${minutes}м`
          return { 
            allowed: false, 
            remaining: 0, 
            resetTime: resetAt + COOLDOWN_MS, 
            errorMessage: errorMsg, 
            maxSkips: MAX_SKIPS 
          }
        }
      }

      // Cooldown passed or not started yet
      const remaining = MAX_SKIPS - count
      return { 
        allowed: remaining > 0, 
        remaining: Math.max(0, remaining), 
        resetTime: resetAt && count >= MAX_SKIPS ? resetAt + COOLDOWN_MS : null, 
        errorMessage: null, 
        maxSkips: MAX_SKIPS 
      }
    } catch (error) {
      console.error('Failed to check skip status:', error)
      return { allowed: true, remaining: MAX_SKIPS, resetTime: null, errorMessage: null, maxSkips: MAX_SKIPS }
    }
  }, [user, subscription])

  // Sync wrapper for compatibility with RightSidebar
  const canRequestNewQuestions = useCallback(() => {
    return checkSkipStatus()
  }, [checkSkipStatus])

  // Update skip status periodically (only when needed)
  useEffect(() => {
    if (!isAuthenticated || authLoading || !user || !isNewEntry) return

    // Update status every second for countdown
    const interval = setInterval(() => {
      // Status is computed from localStorage, no need to set state
    }, 1000)
      
    return () => clearInterval(interval)
  }, [isAuthenticated, authLoading, user, isNewEntry])

  // Function to fetch writing questions with caching
  const fetchQuestions = useCallback(async (forceRefresh: boolean = false) => {
    if (isAuthenticated && !authLoading && user) {
      const CACHE_KEY = `ai_questions_${user.id}`
      const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        try {
          const cached = localStorage.getItem(CACHE_KEY)
          if (cached) {
            const { questions, timestamp } = JSON.parse(cached)
            const now = Date.now()
            
            // If cache is still valid, use it
            if (now - timestamp < CACHE_DURATION) {
              setWritingQuestions(questions)
              setQuestionsLoading(false)
              return
            }
          }
        } catch (error) {
          console.error('Failed to read questions cache:', error)
          // Continue to fetch if cache read fails
        }
      }

      // Fetch from API
      setQuestionsLoading(true)
      try {
        const response = await apiClient.getWritingQuestion(10, 3)
        setWritingQuestions(response.questions)
        
        // Cache the questions
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            questions: response.questions,
            timestamp: Date.now()
          }))
        } catch (error) {
          console.error('Failed to cache questions:', error)
          // Non-critical error, continue
        }
      } catch (error) {
        console.error('Failed to fetch writing questions:', error)
        
        // Try to use cached questions even if expired as fallback
        try {
          const cached = localStorage.getItem(CACHE_KEY)
          if (cached) {
            const { questions } = JSON.parse(cached)
            setWritingQuestions(questions)
            return
          }
        } catch (cacheError) {
          // Ignore cache errors
        }
        
        // Fallback to default questions on error
        setWritingQuestions([
          'О чем вы думали в последнее время?',
          'Что вас сейчас волнует?',
          'Как вы себя чувствуете сегодня?'
        ])
      } finally {
        setQuestionsLoading(false)
      }
    }
  }, [isAuthenticated, authLoading, user])

  // Function to refresh questions (with frontend validation)
  const refreshQuestions = useCallback(async () => {
    if (!user) {
      return { success: false, message: 'Пользователь не найден' }
    }

    // Check skip status
    const skipStatus = checkSkipStatus()
    if (!skipStatus.allowed) {
      return { success: false, message: skipStatus.errorMessage || 'Сброс недоступен' }
    }

    // Determine limits based on subscription
    const isPro = subscription?.plan === 'pro_month' || subscription?.plan === 'pro_year'
    const MAX_SKIPS = isPro ? 5 : 1
    const COOLDOWN_MS = isPro ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000

    const SKIP_STORAGE_KEY = `ai_questions_skips_${user.id}`
    
    try {
      // Update skip counter in localStorage
      const stored = localStorage.getItem(SKIP_STORAGE_KEY)
      let count = 0
      let resetAt: number | null = null

      if (stored) {
        const parsed = JSON.parse(stored)
        count = parsed.count || 0
        resetAt = parsed.resetAt || null
        
        // Check if cooldown passed
        if (resetAt && Date.now() >= resetAt + COOLDOWN_MS) {
          // Reset counter
          count = 0
          resetAt = null
        }
      }

      // Increment counter
      count += 1
      
      // If reached max, start cooldown
      if (count >= MAX_SKIPS) {
        resetAt = Date.now()
      }

      localStorage.setItem(SKIP_STORAGE_KEY, JSON.stringify({ count, resetAt }))

      // Call backend to generate new questions using existing endpoint
      const response = await apiClient.getWritingQuestion(10, 3)
      
      // Use the new questions
      if (response.questions && response.questions.length > 0) {
        setWritingQuestions(response.questions)
        // Cache the new questions
        const CACHE_KEY = `ai_questions_${user.id}`
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            questions: response.questions,
            timestamp: Date.now()
          }))
        } catch (error) {
          console.error('Failed to cache questions:', error)
        }
      }
      
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.message || 'Не удалось сгенерировать новые вопросы' }
    }
  }, [fetchQuestions, user, checkSkipStatus, subscription])

  // Fetch writing questions once when authenticated
  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions]) // Only fetch once when authenticated

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

  // Auto-open new entry editor on initial load if no entry is selected
  useEffect(() => {
    if (isAuthenticated && !authLoading && !loading && !hasAutoOpenedRef.current) {
      const entryId = searchParams.get('entry')
      // Only auto-open if there's no entry in URL and no entry is currently selected
      if (!entryId && !selectedEntry && !isNewEntry && !isEditingEntry) {
        hasAutoOpenedRef.current = true
        setIsNewEntry(true)
        setSelectedEntry(null)
        setIsEditingEntry(false)
        setWordCount(0)
      } else if (entryId || selectedEntry) {
        // If there's an entry in URL or selected, mark as auto-opened to prevent reopening
        hasAutoOpenedRef.current = true
      }
    }
  }, [isAuthenticated, authLoading, loading, searchParams, selectedEntry, isNewEntry, isEditingEntry])

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

        // Refresh questions since a new entry was published (force refresh to invalidate cache)
        fetchQuestions(true).catch(() => {
          // Silently handle errors
        })

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
  }, [fetchEntries, logout, setSearchParams, isEditingEntry, selectedEntry, draftEntryId, fetchQuestions])

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
        height: '100vh',
        backgroundColor: 'var(--theme-bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar
        userPicture={user?.picture}
        onMenuClick={() => setSidebarOpened(true)}
        onImportComplete={() => {
          fetchEntries(1, false)
        }}
        onAudioRecord={() => {
          setShowAudioRecorder(true)
        }}
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
            paddingBottom: isMobile ? '160px' : '0',
          }}
        >
          {showAudioRecorder ? (
            <AudioRecorder
              onRecordingComplete={async (entryId) => {
                setShowAudioRecorder(false)
                // Refresh entries
                await fetchEntries(1, false)
                // Load and select the new entry
                try {
                  const newEntry = await apiClient.getEntryById(entryId)
                  setSelectedEntry(newEntry)
                  setSearchParams({ entry: entryId })
                  setIsNewEntry(false)
                  setIsEditingEntry(false)
                } catch (err) {
                  console.error('Error loading new entry:', err)
                }
              }}
              onClose={() => setShowAudioRecorder(false)}
            />
          ) : error ? (
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
          ) : isAnalyzing ? (
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
              writingQuestions={writingQuestions}
              questionsLoading={questionsLoading}
              fontFamily={getEditorFont()}
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
          ) : null}
        </ScrollArea>

        {/* Right sidebar - hidden on mobile */}
        {!isMobile && (
          <RightSidebar
            entry={selectedEntry}
            wordCount={wordCount}
            isNewEntry={isNewEntry}
            onTagClick={handleTagClick}
            writingQuestions={writingQuestions}
            questionsLoading={questionsLoading}
            onRefreshQuestions={refreshQuestions}
            canRefreshQuestions={canRequestNewQuestions}
          />
        )}
      </Box>

      {/* Mobile Floating Action Buttons - Hidden when editing/creating or recording */}
      {isMobile && !isNewEntry && !isEditingEntry && !showAudioRecorder && (
        <Box
          style={{
            position: 'fixed',
            bottom: '64px',
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
      <SubscriptionMenu
        opened={subscriptionMenuOpened}
        onClose={() => setSubscriptionMenuOpened(false)}
        initialTab="upgrade"
      />
    </Box>
  )
}
