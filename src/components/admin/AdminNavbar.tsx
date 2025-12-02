import { Box, Group, Text, ActionIcon, Avatar, Menu, Image, Badge } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import {
  IconSettings,
  IconLogout,
  IconCrown,
  IconGauge,
  IconTicket,
  IconChartBar,
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'

interface AdminNavbarProps {
  userPicture?: string | null
}

export function AdminNavbar({ userPicture }: AdminNavbarProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { logout, user } = useAuth()
  const { currentTheme } = useTheme()
  const navigate = useNavigate()

  const logoSrc =
    currentTheme === 'light' ? '/moodlog-logo-black.png' : '/moodlog-logo-white.png'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <Box
      style={{
        height: isMobile ? '56px' : '64px',
        borderBottom: '1px solid var(--theme-border)',
        backgroundColor: 'var(--theme-bg)',
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '0 16px' : '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <Group justify="space-between" style={{ width: '100%' }}>
        <Group gap={isMobile ? 'sm' : 'md'} align="center">
          <Group
            gap={isMobile ? 6 : 10}
            align="center"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/admin/dashboard')}
          >
            <Image
              src={logoSrc}
              alt="MoodLog"
              h={isMobile ? 22 : 26}
              mah={isMobile ? 22 : 26}
              fit="contain"
              style={{ display: 'block' }}
            />
            {!isMobile && (
              <Badge
                color="yellow"
                variant="light"
                leftSection={<IconCrown size={12} />}
                style={{ borderRadius: 999 }}
              >
                Admin
              </Badge>
            )}
          </Group>

          {!isMobile && (
            <Group gap="sm">
              <Text
                size="sm"
                style={{ cursor: 'pointer' }}
                c={location.pathname === '/admin/dashboard' ? 'white' : 'dimmed'}
                onClick={() => navigate('/admin/dashboard')}
              >
                Дашборд
              </Text>
              <Text
                size="sm"
                style={{ cursor: 'pointer' }}
                c={location.pathname === '/admin/analytics' ? 'white' : 'dimmed'}
                onClick={() => navigate('/admin/analytics')}
              >
                Аналитика
              </Text>
              <Text
                size="sm"
                style={{ cursor: 'pointer' }}
                c={location.pathname === '/admin/promo-codes' ? 'white' : 'dimmed'}
                onClick={() => navigate('/admin/promo-codes')}
              >
                Промокоды
              </Text>
            </Group>
          )}
        </Group>

        <Group gap={isMobile ? 'xs' : 'sm'} align="center">
          {!isMobile && (
            <ActionIcon
              variant="subtle"
              radius="md"
              size={isMobile ? 'lg' : 'md'}
              onClick={() => navigate('/settings')}
              title="Аккаунт и настройки"
            >
              <IconSettings size={isMobile ? 22 : 20} />
            </ActionIcon>
          )}

          <Menu
            shadow="md"
            width={200}
            position="bottom-end"
            offset={8}
            radius="md"
          >
            <Menu.Target>
              <Avatar
                src={userPicture || undefined}
                radius="xl"
                size={isMobile ? 32 : 36}
                style={{
                  border: '2px solid var(--theme-border)',
                  cursor: 'pointer',
                }}
              >
                {!userPicture && (user?.email?.[0]?.toUpperCase() || 'U')}
              </Avatar>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>{user?.email}</Menu.Label>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconGauge size={16} />}
                onClick={() => navigate('/admin/dashboard')}
              >
                Админ-панель
              </Menu.Item>
              <Menu.Item
                leftSection={<IconChartBar size={16} />}
                onClick={() => navigate('/admin/analytics')}
              >
                Бизнес-аналитика
              </Menu.Item>
              <Menu.Item
                leftSection={<IconTicket size={16} />}
                onClick={() => navigate('/admin/promo-codes')}
              >
                Промокоды
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconSettings size={16} />}
                onClick={() => navigate('/settings')}
              >
                Настройки аккаунта
              </Menu.Item>
              <Menu.Item
                leftSection={<IconLogout size={16} />}
                color="red"
                onClick={handleLogout}
              >
                Выйти
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </Box>
  )
}


