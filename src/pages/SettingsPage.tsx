import { Box, Container, Title, Stack, Group, Button, Text, Card, Divider, Select, Badge } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import {
  IconArrowLeft,
  IconCheck,
  IconPalette,
  IconTypography,
  IconSnowflake,
  IconEye,
  IconSettings,
  IconCrown,
  IconCircleOff,
  IconDroplets,
  IconLeaf,
  IconStars,
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useTheme, ThemeName, themes } from '../contexts/ThemeContext'
import { getEditorFont, setEditorFont, fontOptions, FontFamily, getFontFamily } from '../utils/fonts'
import { getWeatherEffect, setWeatherEffect, weatherEffectOptions, WeatherEffect } from '../utils/weatherEffects'
import { useState, useEffect } from 'react'
import { useSubscription } from '../contexts/SubscriptionContext'
import { SubscriptionMenu } from '../components/subscription/SubscriptionMenu'

export function SettingsPage() {
  const navigate = useNavigate()
  const { currentTheme, setTheme } = useTheme()
  const { canUseFeature } = useSubscription()
  const hasVisualThemesAccess = canUseFeature('has_visual_themes')
  const hasVisualEffectsAccess = canUseFeature('has_visual_effects')
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [selectedFont, setSelectedFont] = useState<FontFamily>(getEditorFont())
  const [selectedEffect, setSelectedEffect] = useState<WeatherEffect>(getWeatherEffect())
  const [subscriptionMenuOpened, setSubscriptionMenuOpened] = useState(false)

  useEffect(() => {
    setSelectedFont(getEditorFont())
    setSelectedEffect(getWeatherEffect())
  }, [])

  // Reset to basic theme/effect if user doesn't have access
  useEffect(() => {
    const basicThemes: ThemeName[] = ['light', 'dark']
    if (!hasVisualThemesAccess && !basicThemes.includes(currentTheme)) {
      setTheme('light')
    }
    if (!hasVisualEffectsAccess && selectedEffect !== 'none') {
      setSelectedEffect('none')
      setWeatherEffect('none')
      window.dispatchEvent(new CustomEvent('weatherEffectChanged', { detail: 'none' }))
    }
  }, [hasVisualThemesAccess, hasVisualEffectsAccess, currentTheme, selectedEffect, setTheme])

  const handleThemeChange = (theme: ThemeName) => {
    // Check if user has access to visual themes (non-basic themes)
    const basicThemes: ThemeName[] = ['light', 'dark']
    if (!basicThemes.includes(theme) && !hasVisualThemesAccess) {
      setSubscriptionMenuOpened(true)
      return
    }
    setTheme(theme)
  }

  const handleFontChange = (font: FontFamily) => {
    setSelectedFont(font)
    setEditorFont(font)
  }

  const handleEffectChange = (effect: WeatherEffect) => {
    if (!hasVisualEffectsAccess && effect !== 'none') {
      setSubscriptionMenuOpened(true)
      return
    }
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
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              const basicThemes: ThemeName[] = ['light', 'dark']
              if (hasVisualThemesAccess || basicThemes.includes(currentTheme)) {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {!hasVisualThemesAccess && (
              <Badge
                color="yellow"
                variant="light"
                size="sm"
                leftSection={<IconCrown size={12} />}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  zIndex: 10,
                  backgroundColor: 'rgba(253, 181, 0, 0.15)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(253, 181, 0, 0.3)',
                }}
              >
                Pro
              </Badge>
            )}
            <Stack gap="lg" style={{ position: 'relative' }}>
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
                    {hasVisualThemesAccess 
                      ? 'Выберите цветовую схему для интерфейса'
                      : 'Базовые темы доступны бесплатно. Pro темы требуют подписки'}
                  </Text>
                </Box>
              </Group>

              <Select
                value={currentTheme}
                onChange={(value) => value && handleThemeChange(value as ThemeName)}
                data={(Object.keys(themes) as ThemeName[]).map((themeName) => {
                  const basicThemes: ThemeName[] = ['light', 'dark']
                  const isProTheme = !basicThemes.includes(themeName)
                  return {
                    value: themeName,
                    label: themes[themeName].displayName,
                    disabled: isProTheme && !hasVisualThemesAccess,
                  }
                })}
                renderOption={({ option, checked }) => {
                  const theme = themes[option.value as ThemeName]
                  const basicThemes: ThemeName[] = ['light', 'dark']
                  const isProTheme = !basicThemes.includes(option.value as ThemeName)
                  const isDisabled = isProTheme && !hasVisualThemesAccess
                  const isLightTheme = option.value === 'light'
                  const isDarkTheme = option.value === 'dark'
                  return (
                    <Group 
                      gap="sm" 
                      style={{ 
                        padding: '8px 4px', 
                        opacity: isDisabled ? 0.6 : 1,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                      }}
                      onClick={(e) => {
                        if (isDisabled) {
                          e.preventDefault()
                          e.stopPropagation()
                          setSubscriptionMenuOpened(true)
                        }
                      }}
                    >
                      <Box
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          // Для базовых тем используем понятные маркеры:
                          // светлая тема — белый круг, тёмная — чёрный
                          backgroundColor: isLightTheme
                            ? '#ffffff'
                            : isDarkTheme
                              ? '#000000'
                              : theme.colors.primary,
                          border: isLightTheme ? '1px solid var(--theme-border)' : 'none',
                          flexShrink: 0,
                        }}
                      />
                      <Text style={{ flex: 1, color: isDisabled ? 'var(--theme-text-secondary)' : 'var(--theme-text)' }}>
                        {option.label}
                      </Text>
                      {isProTheme && (
                        <Badge
                          size="xs"
                          variant="light"
                          radius="sm"
                          style={{
                            color: '#FDB500',
                            backgroundColor: 'rgba(253, 181, 0, 0.15)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            border: '1px solid rgba(253, 181, 0, 0.3)',
                          }}
                        >
                          Pro
                        </Badge>
                      )}
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
                    '&[data-disabled]': {
                      opacity: 0.6,
                      cursor: 'not-allowed',
                      '&:hover': {
                        backgroundColor: 'var(--theme-surface)',
                      },
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
                renderOption={({ option, checked }) => (
                  <Group
                    gap="sm"
                    style={{
                      padding: '8px 4px',
                    }}
                  >
                    <Text
                      style={{
                        flex: 1,
                        color: 'var(--theme-text)',
                        fontFamily: getFontFamily(option.value as FontFamily),
                      }}
                    >
                      {option.label}
                    </Text>
                    {checked && (
                      <IconCheck size={16} style={{ color: 'var(--theme-primary)' }} />
                    )}
                  </Group>
                )}
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
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              if (hasVisualEffectsAccess || selectedEffect === 'none') {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {!hasVisualEffectsAccess && (
              <Badge
                color="yellow"
                variant="light"
                size="sm"
                leftSection={<IconCrown size={12} />}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  zIndex: 10,
                  backgroundColor: 'rgba(253, 181, 0, 0.15)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(253, 181, 0, 0.3)',
                }}
              >
                Pro
              </Badge>
            )}
            <Stack gap="lg" style={{ position: 'relative' }}>
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
                    {selectedEffect !== 'none' && hasVisualEffectsAccess && (
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
                    {hasVisualEffectsAccess 
                      ? 'Добавьте праздничное настроение с помощью эффектов'
                      : 'Визуальные эффекты доступны только в Pro плане'}
                  </Text>
                </Box>
              </Group>

              <Select
                value={selectedEffect}
                onChange={(value) => value && handleEffectChange(value as WeatherEffect)}
                data={weatherEffectOptions.map(option => ({
                  value: option.value,
                  label: option.label,
                  disabled: !hasVisualEffectsAccess && option.value !== 'none',
                }))}
                renderOption={({ option, checked }) => {
                  const isProEffect = option.value !== 'none'
                  const isDisabled = isProEffect && !hasVisualEffectsAccess
                  return (
                    <Group 
                      gap="sm" 
                      style={{ 
                        padding: '8px 4px',
                        opacity: isDisabled ? 0.6 : 1,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                      }}
                      onClick={(e) => {
                        if (isDisabled) {
                          e.preventDefault()
                          e.stopPropagation()
                          setSubscriptionMenuOpened(true)
                        }
                      }}
                    >
                      <Box
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          backgroundColor: 'color-mix(in srgb, var(--theme-primary) 8%, transparent)',
                        }}
                      >
                        {option.value === 'none' && (
                          <IconCircleOff size={16} style={{ color: 'var(--theme-text-secondary)' }} />
                        )}
                        {option.value === 'snow' && (
                          <IconSnowflake size={16} style={{ color: 'var(--mantine-color-blue-5)' }} />
                        )}
                        {option.value === 'rain' && (
                          <IconDroplets size={16} style={{ color: 'var(--mantine-color-blue-5)' }} />
                        )}
                        {option.value === 'leaves' && (
                          <IconLeaf size={16} style={{ color: '#16a34a' }} />
                        )}
                        {option.value === 'stars' && (
                          <IconStars size={16} style={{ color: '#eab308' }} />
                        )}
                      </Box>
                      <Text style={{ flex: 1, color: isDisabled ? 'var(--theme-text-secondary)' : 'var(--theme-text)' }}>
                        {option.label}
                      </Text>
                      {isProEffect && (
                        <Badge 
                          size="xs" 
                          variant="light" 
                          radius="sm"
                          style={{
                            backgroundColor: 'rgba(253, 181, 0, 0.15)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            border: '1px solid rgba(253, 181, 0, 0.3)',
                            color: '#FDB500',
                            fontWeight: 600,
                          }}
                        >
                          Pro
                        </Badge>
                      )}
                      {checked && (
                        <IconCheck size={16} style={{ color: 'var(--mantine-color-blue-5)' }} />
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
                    '&[data-disabled]': {
                      opacity: 0.6,
                      cursor: 'not-allowed',
                      '&:hover': {
                        backgroundColor: 'var(--theme-surface)',
                      },
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
      <SubscriptionMenu
        opened={subscriptionMenuOpened}
        onClose={() => setSubscriptionMenuOpened(false)}
        initialTab="upgrade"
      />
    </Box>
  )
}


