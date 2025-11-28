import { useState, useRef, useEffect } from 'react'
import { Button, Group, Text, Box, Stack, Alert, Modal, Loader, Slider, ActionIcon, Progress } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconMicrophone, IconPlayerStop, IconCheck, IconX, IconAlertCircle, IconRefresh, IconPlayerPlay, IconPlayerPause } from '@tabler/icons-react'
import { apiClient } from '../../utils/api'

interface AudioRecorderProps {
  onRecordingComplete?: (entryId: string) => void
  onClose?: () => void
  title?: string
}

export function AudioRecorder({ onRecordingComplete, onClose, title }: AudioRecorderProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showRerecordConfirm, setShowRerecordConfirm] = useState(false)
  const [recordingMimeType, setRecordingMimeType] = useState<string>('audio/webm')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(20).fill(0))

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) {
      return '00:00'
    }
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Audio player controls
  useEffect(() => {
    const audio = audioPlayerRef.current
    if (!audio || !audioUrl) return

    const updateTime = () => {
      if (isFinite(audio.currentTime) && !isNaN(audio.currentTime)) {
        setCurrentTime(audio.currentTime)
      }
    }
    
    const updateDuration = () => {
      if (isFinite(audio.duration) && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration)
      } else {
        // Fallback to recording time if duration is not available
        setDuration(recordingTime)
      }
    }
    
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    
    const handleLoadedData = () => {
      updateDuration()
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('durationchange', updateDuration)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    // Try to load duration immediately
    if (audio.readyState >= 1) {
      updateDuration()
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('durationchange', updateDuration)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [audioUrl, recordingTime])

  const togglePlayPause = () => {
    const audio = audioPlayerRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  const handleSeek = (value: number) => {
    const audio = audioPlayerRef.current
    if (!audio) return
    audio.currentTime = value
    setCurrentTime(value)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  // Audio level visualization
  useEffect(() => {
    if (!isRecording || !analyserRef.current) {
      return
    }

    const analyser = analyserRef.current
    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const updateAudioLevels = () => {
      if (!isRecording || !analyserRef.current) {
        return
      }

      analyser.getByteFrequencyData(dataArray)
      
      // Create 20 bars from frequency data
      const barCount = 20
      const step = Math.floor(dataArray.length / barCount)
      const levels: number[] = []

      for (let i = 0; i < barCount; i++) {
        let sum = 0
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j]
        }
        // Normalize to 0-100
        const average = sum / step / 255
        levels.push(Math.min(average * 100, 100))
      }

      setAudioLevels(levels)
      animationFrameRef.current = requestAnimationFrame(updateAudioLevels)
    }

    updateAudioLevels()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      setError(null)
      
      // Check if MediaRecorder is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Ваш браузер не поддерживает запись аудио. Пожалуйста, используйте современный браузер (Chrome, Firefox, Edge, Safari).')
        return
      }

      if (!window.MediaRecorder) {
        setError('Ваш браузер не поддерживает MediaRecorder API. Пожалуйста, используйте современный браузер.')
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Check if stream has audio tracks
      const audioTracks = stream.getAudioTracks()
      if (audioTracks.length === 0) {
        stream.getTracks().forEach(track => track.stop())
        setError('Не удалось получить доступ к микрофону. Убедитесь, что микрофон подключен и разрешен доступ.')
        return
      }

      // Set up audio context for visualization
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext
      
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      analyserRef.current = analyser
      
      source.connect(analyser)

      // Find supported MIME type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/mpeg',
      ]
      
      let selectedMimeType = ''
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType
          break
        }
      }

      // If no specific type is supported, use default
      const options = selectedMimeType ? { mimeType: selectedMimeType } : {}
      
      // Store the MIME type for later use
      setRecordingMimeType(selectedMimeType || 'audio/webm')
      
      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      console.log('MediaRecorder created with MIME type:', selectedMimeType || 'default')
      console.log('MediaRecorder state:', mediaRecorder.state)

      // Handle errors
      mediaRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event)
        setError('Ошибка при записи аудио. Попробуйте еще раз.')
        stopRecording()
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped. Chunks:', audioChunksRef.current.length)
        console.log('Total size:', audioChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0))
        
        if (audioChunksRef.current.length === 0) {
          setError('Запись пуста. Попробуйте записать еще раз.')
          return
        }

        // Determine blob type from MIME type or default to webm
        const blobType = recordingMimeType || 'audio/webm'
        const blob = new Blob(audioChunksRef.current, { type: blobType })
        console.log('Blob created:', blob.size, 'bytes, type:', blobType)
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        // Stop all tracks and close audio context
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
        analyserRef.current = null
        setAudioLevels(new Array(20).fill(0))
      }

      // Start recording with timeslice to ensure data is collected
      try {
        mediaRecorder.start(1000) // Collect data every second
        setIsRecording(true)
        setRecordingTime(0)

        // Start timer
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1)
        }, 1000)
      } catch (err) {
        console.error('Error starting MediaRecorder:', err)
        stream.getTracks().forEach(track => track.stop())
        setError('Не удалось начать запись. Попробуйте еще раз или используйте другой браузер.')
        setIsRecording(false)
      }
    } catch (err: any) {
      console.error('Error starting recording:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Доступ к микрофону запрещен. Разрешите доступ к микрофону в настройках браузера.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('Микрофон не найден. Убедитесь, что микрофон подключен.')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Микрофон используется другим приложением. Закройте другие приложения, использующие микрофон.')
      } else {
        setError(`Не удалось получить доступ к микрофону: ${err.message || 'Неизвестная ошибка'}`)
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        // Check if recorder is actually recording
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop()
        } else if (mediaRecorderRef.current.state === 'paused') {
          mediaRecorderRef.current.resume()
          mediaRecorderRef.current.stop()
        }
        
        setIsRecording(false)
        setIsPaused(false)
        
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      } catch (err) {
        console.error('Error stopping recording:', err)
        setError('Ошибка при остановке записи. Попробуйте еще раз.')
        // Force cleanup
        setIsRecording(false)
        setIsPaused(false)
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }
    }
  }

  const handleUpload = async () => {
    if (!audioBlob) return

    try {
      setIsUploading(true)
      setIsProcessing(true)
      setError(null)

      // Normalize MIME type (remove codecs parameter for backend compatibility)
      const normalizeMimeType = (mimeType: string): string => {
        // Remove codecs parameter if present
        if (mimeType.includes(';')) {
          return mimeType.split(';')[0]
        }
        return mimeType
      }
      
      // Convert blob to File with correct extension based on MIME type
      const getFileExtension = (mimeType: string) => {
        const normalized = normalizeMimeType(mimeType)
        const extensions: Record<string, string> = {
          'audio/webm': 'webm',
          'audio/ogg': 'ogg',
          'audio/mp4': 'm4a',
          'audio/mpeg': 'mp3',
          'audio/wav': 'wav',
        }
        return extensions[normalized] || 'webm'
      }
      
      const normalizedMimeType = normalizeMimeType(recordingMimeType)
      const extension = getFileExtension(recordingMimeType)
      const audioFile = new File([audioBlob], `recording.${extension}`, { type: normalizedMimeType })
      console.log('Uploading file:', audioFile.name, 'type:', audioFile.type, 'size:', audioFile.size, 'original MIME:', recordingMimeType)

      // Step 1: Upload and transcribe audio
      const entry = await apiClient.createEntryFromAudio(audioFile, title || undefined)
      
      setIsProcessing(false)
      setIsAnalyzing(true)

      // Step 2: Wait for AI analysis (poll for updated entry)
      let attempts = 0
      const maxAttempts = 30 // 30 seconds max wait
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
        
        try {
          const updatedEntry = await apiClient.getEntryById(entry.id)
          // Check if AI analysis is complete (mood_rating is set or ai_processed_at exists)
          if (updatedEntry.mood_rating !== null || updatedEntry.ai_processed_at !== null) {
            setIsAnalyzing(false)
            setIsUploading(false)
            if (onRecordingComplete) {
              onRecordingComplete(entry.id)
            }
            return
          }
        } catch (err) {
          console.error('Error checking entry status:', err)
        }
        
        attempts++
      }
      
      // If we reach here, analysis is taking longer than expected
      // Still complete the flow
      setIsAnalyzing(false)
      setIsUploading(false)
      if (onRecordingComplete) {
        onRecordingComplete(entry.id)
      }
    } catch (err) {
      console.error('Error uploading audio:', err)
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке аудио. Попробуйте еще раз.')
      setIsProcessing(false)
      setIsAnalyzing(false)
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    // If there's a recording (either in progress or completed), show confirmation
    if (isRecording || audioBlob) {
      setShowCancelConfirm(true)
    } else {
      // No recording, just close
      if (onClose) {
        onClose()
      }
    }
  }

  const confirmCancel = () => {
    if (isRecording) {
      stopRecording()
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setAudioBlob(null)
    setRecordingTime(0)
    setError(null)
    setShowCancelConfirm(false)
    if (onClose) {
      onClose()
    }
  }

  const handleRerecord = () => {
    setShowRerecordConfirm(true)
  }

  const confirmRerecord = () => {
    // Stop current recording if active
    if (isRecording) {
      stopRecording()
    }
    
    // Stop audio playback if playing
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
      audioPlayerRef.current.currentTime = 0
    }
    
    // Clean up audio
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    
    // Reset state
    setAudioBlob(null)
    setRecordingTime(0)
    setError(null)
    setShowRerecordConfirm(false)
    setAudioLevels(new Array(20).fill(0))
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
  }

  return (
    <Box
      style={{
        padding: isMobile ? '20px 16px' : '40px',
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'var(--theme-bg)',
      }}
    >
      <Stack gap="lg">
        <Text
          size={isMobile ? 'lg' : 'xl'}
          fw={600}
          style={{ color: 'var(--theme-text)' }}
        >
          Запись аудио
        </Text>

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Ошибка"
            color="red"
            variant="light"
            onClose={() => setError(null)}
            withCloseButton
          >
            {error}
          </Alert>
        )}

        {(isProcessing || isAnalyzing) ? (
          <Box
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              border: '2px solid var(--theme-border)',
              borderRadius: '12px',
              backgroundColor: 'var(--theme-hover)',
            }}
          >
            <Stack gap="lg" align="center">
              <Loader size="lg" color="var(--theme-primary)" />
              <Stack gap="xs" align="center">
                <Text
                  size="lg"
                  fw={600}
                  style={{
                    color: 'var(--theme-text)',
                  }}
                >
                  {isProcessing ? 'Обработка аудио...' : 'Анализ записи...'}
                </Text>
                <Text
                  size="sm"
                  style={{
                    color: 'var(--theme-text-secondary)',
                    maxWidth: '400px',
                    lineHeight: 1.6,
                  }}
                >
                  {isProcessing
                    ? 'Аудио транскрибируется в текст. Это может занять несколько секунд...'
                    : 'Искусственный интеллект анализирует вашу запись и определяет настроение, теги и другие характеристики'}
                </Text>
              </Stack>
            </Stack>
          </Box>
        ) : !audioBlob ? (
          <>
            <Box
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                border: '2px dashed var(--theme-border)',
                borderRadius: '12px',
                backgroundColor: 'var(--theme-hover)',
              }}
            >
              {!isRecording ? (
                <Stack gap="md" align="center">
                  <IconMicrophone size={48} style={{ color: 'var(--theme-text-secondary)' }} />
                  <Text size="sm" style={{ color: 'var(--theme-text-secondary)' }}>
                    Нажмите кнопку ниже, чтобы начать запись
                  </Text>
                </Stack>
              ) : (
                <Stack gap="md" align="center">
                  <Box
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--theme-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'pulse 1.5s ease-in-out infinite',
                      marginBottom: '8px',
                    }}
                  >
                    <IconMicrophone size={40} style={{ color: 'white' }} />
                  </Box>
                  <Text
                    size="xl"
                    fw={600}
                    style={{
                      color: 'var(--theme-text)',
                      fontFamily: 'monospace',
                      marginBottom: '8px',
                    }}
                  >
                    {formatTime(recordingTime)}
                  </Text>
                  
                  {/* Audio Level Equalizer */}
                  <Box
                    style={{
                      width: '100%',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      gap: '3px',
                      padding: '0 20px',
                    }}
                  >
                    {audioLevels.map((level, index) => {
                      const barHeight = Math.max((level / 100) * 60, 4) // 4px minimum, up to 60px
                      return (
                        <Box
                          key={index}
                          style={{
                            flex: 1,
                            minWidth: '4px',
                            maxWidth: '8px',
                            height: `${barHeight}px`,
                            minHeight: '4px',
                            backgroundColor: `hsl(${200 + level * 0.5}, 70%, ${50 + level * 0.3}%)`,
                            borderRadius: '2px',
                            transition: 'height 0.1s ease-out, background-color 0.1s ease-out',
                            boxShadow: level > 30 ? `0 0 ${level * 0.1}px var(--theme-primary)` : 'none',
                          }}
                        />
                      )
                    })}
                  </Box>
                  
                  <Text size="sm" style={{ color: 'var(--theme-text-secondary)' }}>
                    Идет запись...
                  </Text>
                </Stack>
              )}
            </Box>

            <Group justify="center" gap="md">
              {!isRecording ? (
                <Button
                  leftSection={<IconMicrophone size={20} />}
                  onClick={startRecording}
                  size={isMobile ? 'md' : 'lg'}
                  radius="xl"
                  style={{
                    backgroundColor: 'var(--theme-primary)',
                    color: 'var(--theme-bg)',
                    minWidth: '160px',
                  }}
                >
                  Начать запись
                </Button>
              ) : (
                <Button
                  leftSection={<IconPlayerStop size={20} />}
                  onClick={stopRecording}
                  size={isMobile ? 'md' : 'lg'}
                  radius="xl"
                  color="red"
                  style={{
                    minWidth: '160px',
                  }}
                >
                  Остановить
                </Button>
              )}
              {onClose && (
                <Button
                  variant="subtle"
                  onClick={handleCancel}
                  size={isMobile ? 'md' : 'lg'}
                  radius="xl"
                  style={{
                    color: 'var(--theme-text)',
                    border: '1px solid var(--theme-border)',
                  }}
                >
                  Отмена
                </Button>
              )}
            </Group>
          </>
        ) : (
          <>
            <Box
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                border: '2px solid var(--theme-border)',
                borderRadius: '12px',
                backgroundColor: 'var(--theme-hover)',
              }}
            >
              <Stack gap="md" align="center">
                <IconCheck size={48} style={{ color: 'var(--theme-primary)' }} />
                <Text size="sm" style={{ color: 'var(--theme-text-secondary)' }}>
                  Запись завершена ({formatTime(recordingTime)})
                </Text>
                {audioUrl && (
                  <Box style={{ width: '100%', marginTop: '16px' }}>
                    {/* Hidden audio element for playback */}
                    <audio
                      ref={audioPlayerRef}
                      src={audioUrl}
                      style={{ display: 'none' }}
                    />
                    
                    {/* Custom Audio Player */}
                    <Box
                      style={{
                        padding: '16px',
                        backgroundColor: 'var(--theme-bg)',
                        border: '1px solid var(--theme-border)',
                        borderRadius: '12px',
                        width: '100%',
                      }}
                    >
                      <Stack gap="md">
                        {/* Progress Bar */}
                        <Box>
                          <Slider
                            value={(isFinite(duration) && duration > 0) ? (currentTime / duration) * 100 : 0}
                            onChange={(value) => {
                              const audioDuration = isFinite(duration) && duration > 0 ? duration : recordingTime
                              if (audioDuration > 0) {
                                handleSeek((value / 100) * audioDuration)
                              }
                            }}
                            size="sm"
                            color="var(--theme-primary)"
                            styles={{
                              root: {
                                cursor: 'pointer',
                              },
                              track: {
                                backgroundColor: 'var(--theme-hover)',
                              },
                              thumb: {
                                border: '2px solid var(--theme-primary)',
                                backgroundColor: 'var(--theme-bg)',
                              },
                            }}
                          />
                        </Box>
                        
                        {/* Controls and Time */}
                        <Group justify="space-between" align="center">
                          <Group gap="xs" align="center">
                            <ActionIcon
                              variant="filled"
                              size="lg"
                              radius="xl"
                              onClick={togglePlayPause}
                              style={{
                                backgroundColor: 'var(--theme-primary)',
                                color: 'var(--theme-bg)',
                                width: '44px',
                                height: '44px',
                              }}
                            >
                              {isPlaying ? (
                                <IconPlayerPause size={20} />
                              ) : (
                                <IconPlayerPlay size={20} />
                              )}
                            </ActionIcon>
                            <Stack gap={0}>
                              <Text
                                size="xs"
                                style={{
                                  color: 'var(--theme-text-secondary)',
                                  fontFamily: 'monospace',
                                }}
                              >
                                {formatTime(currentTime)} / {formatTime(isFinite(duration) && duration > 0 ? duration : recordingTime)}
                              </Text>
                            </Stack>
                          </Group>
                        </Group>
                      </Stack>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Box>

            <Group justify="center" gap="md">
              <Button
                leftSection={<IconCheck size={20} />}
                onClick={handleUpload}
                loading={isUploading}
                size={isMobile ? 'md' : 'lg'}
                radius="xl"
                disabled={isUploading}
                styles={{
                  root: {
                    backgroundColor: 'var(--theme-primary)',
                    border: 'none',
                    '&:disabled': {
                      backgroundColor: 'var(--theme-primary)',
                      opacity: 0.7,
                    },
                  },
                  label: {
                    color: 'var(--theme-bg)',
                  },
                  loading: {
                    color: 'var(--theme-bg)',
                  },
                }}
                style={{
                  minWidth: '160px',
                }}
              >
                {isUploading ? 'Загрузка...' : 'Сохранить'}
              </Button>
              <Button
                leftSection={<IconRefresh size={20} />}
                onClick={handleRerecord}
                variant="subtle"
                size={isMobile ? 'md' : 'lg'}
                radius="xl"
                disabled={isUploading}
                styles={{
                  root: {
                    backgroundColor: 'transparent',
                    border: '1px solid var(--theme-border)',
                    '&:disabled': {
                      opacity: 0.5,
                    },
                  },
                  label: {
                    color: 'var(--theme-text)',
                  },
                }}
              >
                Перезаписать
              </Button>
              <Button
                leftSection={<IconX size={20} />}
                onClick={handleCancel}
                variant="subtle"
                size={isMobile ? 'md' : 'lg'}
                radius="xl"
                disabled={isUploading}
                styles={{
                  root: {
                    backgroundColor: 'transparent',
                    border: '1px solid var(--theme-border)',
                    '&:disabled': {
                      opacity: 0.5,
                    },
                  },
                  label: {
                    color: 'var(--theme-text)',
                  },
                }}
              >
                Отмена
              </Button>
            </Group>
          </>
        )}
      </Stack>

      {/* Cancel Confirmation Modal */}
      <Modal
        opened={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        title="Подтверждение"
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
        }}
      >
        <Stack gap="md">
          <Text style={{ color: 'var(--theme-text)' }}>
            Вы уверены, что хотите отменить? Запись будет потеряна.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={() => setShowCancelConfirm(false)}
              styles={{
                root: {
                  backgroundColor: 'transparent',
                  border: '1px solid var(--theme-border)',
                },
                label: {
                  color: 'var(--theme-text)',
                },
              }}
            >
              Нет
            </Button>
            <Button
              color="red"
              onClick={confirmCancel}
              styles={{
                root: {
                  backgroundColor: '#dc2626',
                  border: 'none',
                },
                label: {
                  color: 'white',
                },
              }}
            >
              Да, отменить
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Rerecord Confirmation Modal */}
      <Modal
        opened={showRerecordConfirm}
        onClose={() => setShowRerecordConfirm(false)}
        title="Подтверждение"
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
        }}
      >
        <Stack gap="md">
          <Text style={{ color: 'var(--theme-text)' }}>
            Вы уверены, что хотите перезаписать? Текущая запись будет удалена.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={() => setShowRerecordConfirm(false)}
              styles={{
                root: {
                  backgroundColor: 'transparent',
                  border: '1px solid var(--theme-border)',
                },
                label: {
                  color: 'var(--theme-text)',
                },
              }}
            >
              Нет
            </Button>
            <Button
              color="red"
              onClick={confirmRerecord}
              styles={{
                root: {
                  backgroundColor: '#dc2626',
                  border: 'none',
                },
                label: {
                  color: 'white',
                },
              }}
            >
              Да, перезаписать
            </Button>
          </Group>
        </Stack>
      </Modal>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>
    </Box>
  )
}

