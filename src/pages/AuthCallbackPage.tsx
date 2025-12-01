import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Text, Loader, Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { TokenResponse } from '../utils/api'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const { setTokens, user } = useAuth()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleCallback = () => {
      // Check for error in query params
      const error = searchParams.get('error')
      if (error) {
        // Error will be handled by the UI below
        return
      }

      // Extract tokens from URL hash
      const hash = window.location.hash.substring(1) // Remove the '#'
      if (!hash) {
        return
      }

      try {
        // Parse URL-encoded tokens from hash
        const params = new URLSearchParams(hash)
        const tokens: TokenResponse = {
          access_token: params.get('access_token') || '',
          refresh_token: params.get('refresh_token') || '',
          token_type: params.get('token_type') || 'bearer',
          expires_in: parseInt(params.get('expires_in') || '0'),
        }

        if (tokens.access_token && tokens.refresh_token) {
          setTokens(tokens)
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname)
          // Wait a bit for user data to load, then redirect
          setTimeout(() => {
            // This will be handled by the redirect logic in useEffect below
          }, 100)
        }
      } catch (err) {
        // Error will be handled by UI below
        if (import.meta.env.DEV) {
          console.error('Error parsing tokens:', err)
        }
      }
    }

    handleCallback()
  }, [navigate, setTokens, searchParams])

  // Redirect based on user role after tokens are set
  useEffect(() => {
    if (user) {
      if (user.is_admin) {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    }
  }, [user, navigate])

  const error = searchParams.get('error')

  if (error) {
    return (
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '40px',
        }}
      >
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Ошибка аутентификации"
          color="red"
          variant="light"
          style={{
            maxWidth: '400px',
            backgroundColor: '#fff5f5',
            border: '1px solid #fecaca',
            color: '#991b1b',
          }}
        >
          {error}
        </Alert>
        <Text
          component="button"
          onClick={() => navigate('/login')}
          style={{
            marginTop: '20px',
            color: '#000',
            textDecoration: 'underline',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Вернуться к входу
        </Text>
      </Box>
    )
  }

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px',
      }}
    >
      <Loader size="lg" />
      <Text style={{ color: '#666', fontSize: '14px' }}>
        Завершение входа...
      </Text>
    </Box>
  )
}

