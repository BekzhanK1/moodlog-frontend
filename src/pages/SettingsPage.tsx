import { Box, Container, Title, Stack, Group, Button, Text, Card, Divider, Select, Badge } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconArrowLeft, IconCheck, IconPalette, IconTypography, IconSnowflake, IconEye, IconSettings } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useTheme, ThemeName, themes } from '../contexts/ThemeContext'
import { getEditorFont, setEditorFont, fontOptions, FontFamily, getFontFamily } from '../utils/fonts'
import { getWeatherEffect, setWeatherEffect, weatherEffectOptions, WeatherEffect } from '../utils/weatherEffects'
import { useState, useEffect } from 'react'

export function SettingsPage() {
  const navigate = useNavigate()
  const { currentTheme, setTheme } = useTheme()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [selectedFont, setSelectedFont] = useState<FontFamily>(getEditorFont())
  const [selectedEffect, setSelectedEffect] = useState<WeatherEffect>(getWeatherEffect())

  useEffect(() => {
    setSelectedFont(getEditorFont())
    setSelectedEffect(getWeatherEffect())
  }, [])

  const handleThemeChange = (theme: ThemeName) => {
    setTheme(theme)
  }

  const handleFontChange = (font: FontFamily) => {
    setSelectedFont(font)
    setEditorFont(font)
  }

  const handleEffectChange = (effect: WeatherEffect) => {
    setSelectedEffect(effect)
    setWeatherEffect(effect)
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('weatherEffectChanged', { detail: effect }))
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
          <Stack gap="md">
            <Group gap="md" align="center">
              <Button
                variant="subtle"
                leftSection={<IconArrowLeft size={18} />}
                onClick={() => navigate('/dashboard')}
                style={{
                  color: 'var(--theme-text)',
                  backgroundColor: 'transparent',
                  transition: 'all 0.2s ease',
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
            </Group>
            <Group gap="md" align="center">
              <Box
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--theme-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--theme-bg)',
                }}
              >
                <IconSettings size={24} />
              </Box>
              <Box>
                <Title
                  order={1}
                  style={{
                    fontSize: isMobile ? '28px' : '36px',
                    fontWeight: 600,
                    color: 'var(--theme-text)',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  Настройки
                </Title>
                <Text
                  size="sm"
                  style={{
                    color: 'var(--theme-text-secondary)',
                    marginTop: '4px',
                  }}
                >
                  Персонализируйте свой опыт использования приложения
                </Text>
              </Box>
            </Group>
          </Stack>

          <Divider style={{ borderColor: 'var(--theme-border)', opacity: 0.5 }} />

          {/* Theme Selection */}
          <Card
            padding={isMobile ? 'md' : 'xl'}
            radius="lg"
            style={{
              backgroundColor: 'var(--theme-surface)',
              border: '1px solid var(--theme-border)',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <Stack gap="lg">
              <Group gap="md" align="flex-start">
                <Box
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconPalette size={20} style={{ color: 'var(--theme-primary)' }} />
                </Box>
                <Box style={{ flex: 1 }}>
                  <Group gap="sm" align="center" mb={4}>
                    <Text
                      style={{
                        fontSize: isMobile ? '18px' : '20px',
                        fontWeight: 600,
                        color: 'var(--theme-text)',
                      }}
                    >
                      Тема оформления
                    </Text>
                  </Group>
                  <Text
                    size="sm"
                    style={{
                      color: 'var(--theme-text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    Выберите цветовую схему для интерфейса
                  </Text>
                </Box>
              </Group>

              <Select
                value={currentTheme}
                onChange={(value) => value && handleThemeChange(value as ThemeName)}
                data={(Object.keys(themes) as ThemeName[]).map((themeName) => ({
                  value: themeName,
                  label: themes[themeName].displayName,
                }))}
                renderOption={({ option, checked }) => {
                  const theme = themes[option.value as ThemeName]
                  return (
                    <Group gap="sm" style={{ padding: '8px 4px' }}>
                      <Box
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: theme.colors.primary,
                          flexShrink: 0,
                        }}
                      />
                      <Text style={{ flex: 1, color: 'var(--theme-text)' }}>
                        {option.label}
                      </Text>
                      {checked && (
                        <IconCheck size={16} style={{ color: 'var(--theme-primary)' }} />
                      )}
                    </Group>
                  )
                }}
                styles={{
                  input: {
                    backgroundColor: 'var(--theme-bg)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                    fontSize: '15px',
                    padding: '14px 18px',
                    minHeight: '52px',
                    borderRadius: '10px',
                    transition: 'all 0.2s ease',
                    '&:focus': {
                      borderColor: 'var(--theme-primary)',
                      borderWidth: '2px',
                      boxShadow: '0 0 0 3px color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                    },
                    '&:hover': {
                      borderColor: 'var(--theme-primary)',
                    },
                  },
                  dropdown: {
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                    padding: '8px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  },
                  option: {
                    backgroundColor: 'var(--theme-surface)',
                    color: 'var(--theme-text)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    marginBottom: '4px',
                    transition: 'all 0.2s ease',
                    '&[data-selected]': {
                      backgroundColor: 'var(--theme-hover)',
                      color: 'var(--theme-text)',
                    },
                    '&[data-hovered]': {
                      backgroundColor: 'var(--theme-hover)',
                    },
                  },
                }}
              />
            </Stack>
          </Card>

          {/* Font Selection */}
          <Card
            padding={isMobile ? 'md' : 'xl'}
            radius="lg"
            style={{
              backgroundColor: 'var(--theme-surface)',
              border: '1px solid var(--theme-border)',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <Stack gap="lg">
              <Group gap="md" align="flex-start">
                <Box
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconTypography size={20} style={{ color: 'var(--theme-primary)' }} />
                </Box>
                <Box style={{ flex: 1 }}>
                  <Group gap="sm" align="center" mb={4}>
                    <Text
                      style={{
                        fontSize: isMobile ? '18px' : '20px',
                        fontWeight: 600,
                        color: 'var(--theme-text)',
                      }}
                    >
                      Шрифт редактора
                    </Text>
                  </Group>
                  <Text
                    size="sm"
                    style={{
                      color: 'var(--theme-text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    Выберите шрифт для написания записей
                  </Text>
                </Box>
              </Group>

              <Select
                value={selectedFont}
                onChange={(value) => value && handleFontChange(value as FontFamily)}
                data={fontOptions.map(option => ({
                  value: option.value,
                  label: option.label,
                }))}
                styles={{
                  input: {
                    backgroundColor: 'var(--theme-bg)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                    fontSize: '15px',
                    padding: '14px 18px',
                    minHeight: '52px',
                    borderRadius: '10px',
                    transition: 'all 0.2s ease',
                    '&:focus': {
                      borderColor: 'var(--theme-primary)',
                      borderWidth: '2px',
                      boxShadow: '0 0 0 3px color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                    },
                    '&:hover': {
                      borderColor: 'var(--theme-primary)',
                    },
                  },
                  dropdown: {
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                    padding: '8px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  },
                  option: {
                    backgroundColor: 'var(--theme-surface)',
                    color: 'var(--theme-text)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    marginBottom: '4px',
                    transition: 'all 0.2s ease',
                    '&[data-selected]': {
                      backgroundColor: 'var(--theme-hover)',
                      color: 'var(--theme-text)',
                    },
                    '&[data-hovered]': {
                      backgroundColor: 'var(--theme-hover)',
                    },
                  },
                }}
              />
            </Stack>
          </Card>

          {/* Weather Effects Selection */}
          <Card
            padding={isMobile ? 'md' : 'xl'}
            radius="lg"
            style={{
              backgroundColor: 'var(--theme-surface)',
              border: '1px solid var(--theme-border)',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <Stack gap="lg">
              <Group gap="md" align="flex-start">
                <Box
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconSnowflake size={20} style={{ color: 'var(--theme-primary)' }} />
                </Box>
                <Box style={{ flex: 1 }}>
                  <Group gap="sm" align="center" mb={4}>
                    <Text
                      style={{
                        fontSize: isMobile ? '18px' : '20px',
                        fontWeight: 600,
                        color: 'var(--theme-text)',
                      }}
                    >
                      Атмосферные эффекты
                    </Text>
                    {selectedEffect !== 'none' && (
                      <Badge
                        size="sm"
                        style={{
                          backgroundColor: 'var(--theme-primary)',
                          color: 'var(--theme-bg)',
                        }}
                      >
                        Активно
                      </Badge>
                    )}
                  </Group>
                  <Text
                    size="sm"
                    style={{
                      color: 'var(--theme-text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    Добавьте праздничное настроение с помощью эффектов
                  </Text>
                </Box>
              </Group>

              <Select
                value={selectedEffect}
                onChange={(value) => value && handleEffectChange(value as WeatherEffect)}
                data={weatherEffectOptions.map(option => ({
                  value: option.value,
                  label: option.label,
                }))}
                styles={{
                  input: {
                    backgroundColor: 'var(--theme-bg)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                    fontSize: '15px',
                    padding: '14px 18px',
                    minHeight: '52px',
                    borderRadius: '10px',
                    transition: 'all 0.2s ease',
                    '&:focus': {
                      borderColor: 'var(--theme-primary)',
                      borderWidth: '2px',
                      boxShadow: '0 0 0 3px color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                    },
                    '&:hover': {
                      borderColor: 'var(--theme-primary)',
                    },
                  },
                  dropdown: {
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                    padding: '8px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  },
                  option: {
                    backgroundColor: 'var(--theme-surface)',
                    color: 'var(--theme-text)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    marginBottom: '4px',
                    transition: 'all 0.2s ease',
                    '&[data-selected]': {
                      backgroundColor: 'var(--theme-hover)',
                      color: 'var(--theme-text)',
                    },
                    '&[data-hovered]': {
                      backgroundColor: 'var(--theme-hover)',
                    },
                  },
                }}
              />
            </Stack>
          </Card>

          {/* Combined Preview */}
          <Card
            padding={isMobile ? 'md' : 'xl'}
            radius="lg"
            style={{
              backgroundColor: 'var(--theme-surface)',
              border: '2px solid var(--theme-primary)',
              borderStyle: 'dashed',
              transition: 'all 0.3s ease',
            }}
          >
            <Stack gap="lg">
              <Group gap="md" align="flex-start">
                <Box
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconEye size={20} style={{ color: 'var(--theme-primary)' }} />
                </Box>
                <Box style={{ flex: 1 }}>
                  <Group gap="sm" align="center" mb={4}>
                    <Text
                      style={{
                        fontSize: isMobile ? '18px' : '20px',
                        fontWeight: 600,
                        color: 'var(--theme-text)',
                      }}
                    >
                      Предпросмотр
                    </Text>
                  </Group>
                  <Text
                    size="sm"
                    style={{
                      color: 'var(--theme-text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    Как будет выглядеть ваш текст в выбранной теме и шрифте
                  </Text>
                </Box>
              </Group>

              <Box
                style={{
                  padding: isMobile ? '20px' : '24px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--theme-bg)',
                  border: '1px solid var(--theme-border)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Text
                  style={{
                    color: 'var(--theme-text)',
                    fontSize: isMobile ? '15px' : '17px',
                    fontFamily: getFontFamily(selectedFont),
                    lineHeight: 1.8,
                    marginBottom: '12px',
                    fontWeight: 500,
                  }}
                >
                  Заголовок записи
                </Text>
                <Text
                  style={{
                    color: 'var(--theme-text)',
                    fontSize: isMobile ? '14px' : '16px',
                    fontFamily: getFontFamily(selectedFont),
                    lineHeight: 1.8,
                    marginBottom: '12px',
                  }}
                >
                  Это пример текста в выбранном шрифте. Здесь вы можете увидеть, как будет выглядеть ваш текст при написании записей. Попробуйте изменить тему или шрифт, чтобы увидеть изменения в реальном времени.
                </Text>
                <Text
                  size="sm"
                  style={{
                    color: 'var(--theme-text-secondary)',
                    fontFamily: getFontFamily(selectedFont),
                    lineHeight: 1.6,
                  }}
                >
                  Вторичный текст в выбранной теме и шрифте
                </Text>
              </Box>
            </Stack>
          </Card>

          {/* Future settings sections can be added here */}
        </Stack>
      </Container>
    </Box>
  )
}


