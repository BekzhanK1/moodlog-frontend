import { Card, Text, Stack, Group, Box, Progress } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconBulb } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { apiClient } from '../../utils/api'

interface Theme {
  tag: string
  frequency: number
  relative_percentage: number
}

export function ThemesCard() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date()
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
        
        const result = await apiClient.getMainThemes(startDate, endDate)
        setThemes(result)
      } catch (error) {
        console.error('Failed to fetch themes data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <Card
        padding={isMobile ? 'md' : 'lg'}
        radius="md"
        style={{
          backgroundColor: 'var(--theme-bg)',
          border: '1px solid var(--theme-border)',
          minHeight: '200px',
        }}
      >
        <Text style={{ color: 'var(--theme-text-secondary)' }}>Загрузка...</Text>
      </Card>
    )
  }

  return (
    <Card
      padding={isMobile ? 'md' : 'lg'}
      radius="md"
      style={{
        backgroundColor: 'var(--theme-bg)',
        border: '1px solid var(--theme-border)',
      }}
    >
      <Stack gap="md">
        <Text
          style={{
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: 600,
            color: 'var(--theme-text)',
          }}
        >
          Темы и триггеры
        </Text>

        {themes.length === 0 ? (
          <Text style={{ color: 'var(--theme-text-secondary)', fontSize: isMobile ? '14px' : '16px' }}>
            Недостаточно данных для анализа тем
          </Text>
        ) : (
          <>
            <Text
              style={{
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 500,
                color: 'var(--theme-text)',
                marginBottom: '8px',
              }}
            >
              Ваши главные темы в {new Date().toLocaleDateString('ru-RU', { month: 'long' })}:
            </Text>

            <Stack gap="sm">
              {themes.map((theme) => (
                <Box key={theme.tag}>
                  <Group justify="space-between" align="center" mb="xs">
                    <Text
                      style={{
                        fontSize: isMobile ? '14px' : '16px',
                        color: 'var(--theme-text)',
                        fontWeight: 500,
                      }}
                    >
                      #{theme.tag}
                    </Text>
                    <Text
                      style={{
                        fontSize: isMobile ? '14px' : '16px',
                        color: 'var(--theme-text-secondary)',
                        fontWeight: 500,
                      }}
                    >
                      {theme.relative_percentage}%
                    </Text>
                  </Group>
                  <Progress
                    value={theme.relative_percentage}
                    color="var(--theme-primary)"
                    size="sm"
                    radius="xs"
                    style={{
                      backgroundColor: 'var(--theme-hover)',
                    }}
                  />
                </Box>
              ))}
            </Stack>

            {/* AI Insight */}
            {themes.length >= 2 && (
              <Box
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: 'var(--theme-hover)',
                  borderRadius: '8px',
                  border: '1px solid var(--theme-border)',
                }}
              >
                <Group gap="xs" align="flex-start" mb="xs">
                  <IconBulb size={18} style={{ color: 'var(--theme-primary)', marginTop: '2px' }} />
                  <Text
                    style={{
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: 500,
                      color: 'var(--theme-text)',
                    }}
                  >
                    Инсайт от ИИ:
                  </Text>
                </Group>
                <Text
                  style={{
                    fontSize: isMobile ? '13px' : '14px',
                    color: 'var(--theme-text-secondary)',
                    fontStyle: 'italic',
                    marginLeft: '26px',
                  }}
                >
                  «Обратите внимание на темы, которые чаще всего появляются в ваших записях. Они могут указывать на важные аспекты вашей жизни.»
                </Text>
              </Box>
            )}
          </>
        )}
      </Stack>
    </Card>
  )
}

