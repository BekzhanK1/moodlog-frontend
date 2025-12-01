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
} from '@mantine/core'
import { IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { AuthLayout } from '../components/auth/AuthLayout'
import { GoogleButton } from '../components/auth/GoogleButton'
import { registerSchema } from '../utils/validation'
import { zodResolver } from '../utils/zodResolver'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../utils/api'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: zodResolver(registerSchema),
  })

  const handleSubmit = async (values: typeof form.values) => {
    setError(null)
    setLoading(true)

    try {
      await register(values.email, values.password)
      // Navigation will be handled by useEffect below based on user role
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при регистрации')
      setLoading(false)
    }
  }

  // Redirect based on user role after registration
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

  const handleGoogleRegister = () => {
    setError(null)
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/google/login`
  }

  const passwordRequirements = [
    { label: 'Минимум 8 символов', met: form.values.password.length >= 8 },
    { label: 'Заглавная буква', met: /[A-Z]/.test(form.values.password) },
    { label: 'Строчная буква', met: /[a-z]/.test(form.values.password) },
    { label: 'Цифра', met: /[0-9]/.test(form.values.password) },
  ]

  return (
    <AuthLayout
      title="Регистрация"
      subtitle="Создайте аккаунт, чтобы начать свой путь самопознания"
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
                placeholder="Создайте надежный пароль"
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

              {form.values.password && (
                <Box
                  style={{
                    padding: '12px',
                    backgroundColor: '#f9f9f9',
                    border: '1px solid #eee',
                    borderRadius: 12,
                  }}
                >
                  <Text size="xs" style={{ color: '#666', marginBottom: '8px', fontWeight: 500 }}>
                    Требования к паролю:
                  </Text>
                  <Stack gap="xs">
                    {passwordRequirements.map((req, index) => (
                      <Box key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconCheck
                          size={14}
                          style={{
                            color: req.met ? '#000' : '#ccc',
                            transition: 'color 0.3s ease',
                          }}
                        />
                        <Text
                          size="xs"
                          style={{
                            color: req.met ? '#000' : '#999',
                            fontWeight: req.met ? 400 : 300,
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {req.label}
                        </Text>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              <PasswordInput
                label="Подтвердите пароль"
                placeholder="Повторите пароль"
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
                {...form.getInputProps('confirmPassword')}
              />

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
                Создать аккаунт
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

          <GoogleButton onClick={handleGoogleRegister} loading={loading} />

          <Box style={{ textAlign: 'center', marginTop: '8px' }}>
            <Text size="sm" style={{ color: '#666', fontWeight: 300 }}>
              Уже есть аккаунт?{' '}
              <Text
                component={Link}
                to="/login"
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
                Войти
              </Text>
            </Text>
          </Box>
        </Stack>
      </Box>
    </AuthLayout>
  )
}
