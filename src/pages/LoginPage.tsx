import { useForm } from '@mantine/form'
import { useState } from 'react'
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
} from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { AuthLayout } from '../components/auth/AuthLayout'
import { GoogleButton } from '../components/auth/GoogleButton'
import { loginSchema } from '../utils/validation'
import { zodResolver } from '../utils/zodResolver'

export function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: zodResolver(loginSchema),
  })

  const handleSubmit = async (_values: typeof form.values) => {
    setError(null)
    setLoading(true)

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Simulate API error for demo
      // throw new Error('Неверный email или пароль')
      
      // On success, redirect to dashboard
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при входе')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    setLoading(true)

    try {
      // TODO: Implement Google OAuth
      // window.location.href = '/api/auth/google'
      await new Promise((resolve) => setTimeout(resolve, 1000))
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при входе через Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Вход"
      subtitle="Войдите в свой аккаунт, чтобы продолжить"
    >
      <Box
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '40px',
          backgroundColor: '#fff',
          border: '1px solid #eee',
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
                radius={0}
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
                  },
                }}
                {...form.getInputProps('email')}
              />

              <PasswordInput
                label="Пароль"
                placeholder="Введите пароль"
                required
                radius={0}
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
                radius={0}
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
