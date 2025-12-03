import { useForm } from '@mantine/form'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Text,
  Divider,
  Box,
  Alert,
  Image,
} from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { AuthLayout } from '../components/auth/AuthLayout'
import { GoogleButton } from '../components/auth/GoogleButton'
import { loginSchema } from '../utils/validation'
import { zodResolver } from '../utils/zodResolver'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../utils/api'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: zodResolver(loginSchema),
  })

  const handleSubmit = async (values: typeof form.values) => {
    setError(null)
    setLoading(true)

    try {
      await login(values.email, values.password)
      // Navigation will be handled by useEffect below based on user role
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при входе')
      setLoading(false)
    }
  }

  // Redirect based on user role after login
  useEffect(() => {
    if (user) {
      if (user.is_admin) {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
      setLoading(false)
    }
  }, [user, navigate])

  const handleGoogleLogin = () => {
    setError(null)
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/google/login`
  }

  return (
    <AuthLayout
      title={
        <Image
          src="/moodlog-logo-black.png"
          alt="MoodLog"
          h={28}
          fit="contain"
          style={{ display: 'block' }}
        />
      }
      subtitle="Войдите в свой аккаунт, чтобы продолжить"
    >
      <Box
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '40px',
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          border: '1px solid #eee',
          backdropFilter: 'blur(10px)',
          borderRadius: 12,
          boxShadow: '0 18px 45px rgba(0, 0, 0, 0.08)',
          // чуть больше отступ снизу, чтобы форма «дышала»
          marginBottom: '32px',
        }}
      >
        <Stack gap="lg">
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Ошибка"
              color="red"
              variant="light"
              style={{
                backgroundColor: '#fff5f5',
                border: '1px solid #fecaca',
                color: '#991b1b',
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="your@email.com"
                required
                radius="md"
                styles={{
                  label: {
                    color: '#000',
                    fontWeight: 400,
                    marginBottom: '8px',
                  },
                  input: {
                    borderColor: '#ddd',
                    backgroundColor: '#fff',
                    color: '#000',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:focus': {
                      borderColor: '#000',
                      outline: 'none',
                    },
                    '&::placeholder': {
                      color: 'rgba(0, 0, 0, 0.2)',
                    },
                  },
                }}
                {...form.getInputProps('email')}
              />

              <PasswordInput
                label="Пароль"
                placeholder="Введите пароль"
                required
                radius="md"
                styles={{
                  label: {
                    color: '#000',
                    fontWeight: 400,
                    marginBottom: '8px',
                  },
                  input: {
                    borderColor: '#ddd',
                    backgroundColor: '#fff',
                    color: '#000',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:focus': {
                      borderColor: '#000',
                      outline: 'none',
                    },
                    '&::placeholder': {
                      color: 'rgba(0, 0, 0, 0.2)',
                    },
                  },
                }}
                {...form.getInputProps('password')}
              />

              <Box style={{ textAlign: 'right', marginTop: '-8px' }}>
                <Text
                  component={Link}
                  to="/forgot-password"
                  size="sm"
                  style={{
                    color: '#666',
                    textDecoration: 'none',
                    fontWeight: 300,
                    transition: 'color 0.3s ease',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.currentTarget.style.color = '#000'
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.currentTarget.style.color = '#666'
                  }}
                >
                  Забыли пароль?
                </Text>
              </Box>

              <Button
                type="submit"
                fullWidth
                size="lg"
                radius="md"
                loading={loading}
                disabled={loading}
                style={{
                  backgroundColor: '#000',
                  color: '#fff',
                  border: '1px solid #000',
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                  marginTop: '8px',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="button-smooth"
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#fff'
                    e.currentTarget.style.color = '#000'
                  }
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#000'
                    e.currentTarget.style.color = '#fff'
                  }
                }}
              >
                Войти
              </Button>
            </Stack>
          </form>

          <Divider
            label={
              <Text size="sm" style={{ color: '#999', fontWeight: 300 }}>
                или
              </Text>
            }
            labelPosition="center"
            style={{ borderColor: '#eee' }}
          />

          <GoogleButton onClick={handleGoogleLogin} loading={loading} />

          <Box style={{ textAlign: 'center', marginTop: '8px' }}>
            <Text size="sm" style={{ color: '#666', fontWeight: 300 }}>
              Нет аккаунта?{' '}
              <Text
                component={Link}
                to="/register"
                style={{
                  color: '#000',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'opacity 0.3s ease',
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.opacity = '0.7'
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                Зарегистрироваться
              </Text>
            </Text>
          </Box>
        </Stack>
      </Box>
    </AuthLayout>
  )
}
