import { Box, Container, Title, Stack, Group, Button, Text, Card, Divider } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconArrowLeft, IconCheck } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useTheme, ThemeName, themes } from '../contexts/ThemeContext'

export function SettingsPage() {
  const navigate = useNavigate()
  const { currentTheme, setTheme } = useTheme()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const handleThemeChange = (theme: ThemeName) => {
    setTheme(theme)
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--theme-bg)',
        padding: isMobile ? '20px 16px' : '40px',
      }}
    >
      <Container size="md">
        <Stack gap="xl">
          {/* Header */}
          <Group gap="md" align="center">
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={18} />}
              onClick={() => navigate('/dashboard')}
              style={{
                color: 'var(--theme-text)',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              Назад
            </Button>
            <Title
              order={1}
              style={{
                fontSize: isMobile ? '24px' : '32px',
                fontWeight: 400,
                color: 'var(--theme-text)',
              }}
            >
              Настройки
            </Title>
          </Group>

          <Divider style={{ borderColor: 'var(--theme-border)' }} />

          {/* Theme Selection */}
          <Card
            padding={isMobile ? 'md' : 'lg'}
            radius="md"
            style={{
              backgroundColor: 'var(--theme-surface)',
              border: '1px solid var(--theme-border)',
            }}
          >
            <Stack gap="lg">
              <Box>
                <Text
                  style={{
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: 500,
                    color: 'var(--theme-text)',
                    marginBottom: '8px',
                  }}
                >
                  Тема оформления
                </Text>
                <Text
                  size="sm"
                  style={{
                    color: 'var(--theme-text-secondary)',
                  }}
                >
                  Выберите тему для интерфейса
                </Text>
              </Box>

              <Stack gap="md">
                {(Object.keys(themes) as ThemeName[]).map((themeName) => {
                  const theme = themes[themeName]
                  const isSelected = currentTheme === themeName

                  return (
                    <Box
                      key={themeName}
                      onClick={() => handleThemeChange(themeName)}
                      style={{
                        padding: '16px',
                        borderRadius: '8px',
                        border: isSelected
                          ? `2px solid ${theme.colors.primary}`
                          : '1px solid var(--theme-border)',
                        backgroundColor: isSelected
                          ? 'var(--theme-hover)'
                          : 'var(--theme-bg)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
                          e.currentTarget.style.borderColor = 'var(--theme-border)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'var(--theme-bg)'
                          e.currentTarget.style.borderColor = 'var(--theme-border)'
                        }
                      }}
                    >
                      {/* Theme indicator */}
                      <Box
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: theme.colors.primary,
                          border: isSelected ? '2px solid var(--theme-text)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isSelected && (
                          <IconCheck size={14} style={{ color: theme.colors.background }} />
                        )}
                      </Box>

                      {/* Theme name */}
                      <Text
                        style={{
                          fontSize: '16px',
                          fontWeight: isSelected ? 500 : 400,
                          color: 'var(--theme-text)',
                          flex: 1,
                        }}
                      >
                        {theme.displayName}
                      </Text>

                      {/* Selection indicator */}
                      {isSelected && (
                        <Box
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: theme.colors.primary,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </Box>
                  )
                })}
              </Stack>

              {/* Theme Preview */}
              <Box
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--theme-bg)',
                  border: '1px solid var(--theme-border)',
                }}
              >
                <Text
                  size="sm"
                  style={{
                    color: 'var(--theme-text-secondary)',
                    marginBottom: '8px',
                  }}
                >
                  Предпросмотр:
                </Text>
                <Box
                  style={{
                    padding: '12px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--theme-surface)',
                    border: '1px solid var(--theme-border)',
                  }}
                >
                  <Text
                    style={{
                      color: 'var(--theme-text)',
                      fontSize: '14px',
                    }}
                  >
                    Пример текста в выбранной теме
                  </Text>
                  <Text
                    size="sm"
                    style={{
                      color: 'var(--theme-text-secondary)',
                      marginTop: '4px',
                    }}
                  >
                    Вторичный текст
                  </Text>
                </Box>
              </Box>
            </Stack>
          </Card>

          {/* Future settings sections can be added here */}
        </Stack>
      </Container>
    </Box>
  )
}

