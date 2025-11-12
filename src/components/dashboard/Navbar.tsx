import { Box, Group, Text, ActionIcon, Avatar, Menu } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconSettings, IconMenu2, IconUser, IconLogout } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface NavbarProps {
  userPicture?: string | null
  onMenuClick?: () => void
}

export function Navbar({ userPicture, onMenuClick }: NavbarProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { logout, user } = useAuth()
  const navigate = useNavigate()

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
      }}
    >
      <Group justify="space-between" style={{ width: '100%' }}>
        <Group gap={isMobile ? 'sm' : 'md'}>
          {isMobile && onMenuClick && (
            <ActionIcon
              variant="subtle"
              radius="md"
              size="lg"
              onClick={onMenuClick}
              style={{
                color: 'var(--theme-text)',
                backgroundColor: 'transparent',
              }}
            >
              <IconMenu2 size={22} />
            </ActionIcon>
          )}
          <Text
            style={{
              fontSize: isMobile ? '16px' : '20px',
              fontWeight: 400,
              letterSpacing: isMobile ? '2px' : '4px',
              color: 'var(--theme-text)',
              textTransform: 'uppercase',
            }}
          >
            MoodLog
          </Text>
        </Group>

        <Group gap={isMobile ? 'xs' : 'md'}>
          <ActionIcon
            variant="subtle"
            radius="md"
            size={isMobile ? 'lg' : 'md'}
            onClick={() => navigate('/settings')}
            style={{
              color: 'var(--theme-text)',
              backgroundColor: 'transparent',
              border: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <IconSettings size={isMobile ? 22 : 20} />
          </ActionIcon>

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
                size={isMobile ? 28 : 32}
                style={{
                  border: '1px solid var(--theme-border)',
                  cursor: 'pointer',
                  transition: 'border-color 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--theme-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--theme-border)'
                }}
              >
                {!userPicture && (
                  <Box
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'var(--theme-hover)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isMobile ? '12px' : '14px',
                      color: 'var(--theme-text-secondary)',
                    }}
                  >
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </Box>
                )}
              </Avatar>
            </Menu.Target>

            <Menu.Dropdown
              style={{
                border: '1px solid var(--theme-border)',
                backgroundColor: 'var(--theme-bg)',
              }}
            >
              <Menu.Label
                style={{
                  fontSize: '12px',
                  color: 'var(--theme-text-secondary)',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {user?.email}
              </Menu.Label>
              <Menu.Divider style={{ borderColor: 'var(--theme-border)' }} />
              <Menu.Item
                leftSection={<IconUser size={16} />}
                onClick={() => navigate('/profile')}
                style={{
                  fontSize: '14px',
                  color: 'var(--theme-text)',
                  fontWeight: 400,
                  padding: '8px 12px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                Профиль
              </Menu.Item>
              <Menu.Divider style={{ borderColor: 'var(--theme-border)' }} />
              <Menu.Item
                leftSection={<IconLogout size={16} />}
                color="red"
                onClick={logout}
                style={{
                  fontSize: '14px',
                  color: 'var(--theme-text)',
                  fontWeight: 400,
                  padding: '8px 12px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff5f5'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
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

