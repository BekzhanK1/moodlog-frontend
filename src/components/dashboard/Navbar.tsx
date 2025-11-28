import { Box, Group, Text, ActionIcon, Avatar, Menu } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconSettings, IconMenu2, IconUser, IconLogout, IconBook, IconUpload, IconMicrophone } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useState } from 'react'
import { TelegramImport } from './TelegramImport'

interface NavbarProps {
  userPicture?: string | null
  onMenuClick?: () => void
  onImportComplete?: () => void
  onAudioRecord?: () => void
}

export function Navbar({ userPicture, onMenuClick, onImportComplete, onAudioRecord }: NavbarProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [telegramImportOpened, setTelegramImportOpened] = useState(false)

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
          {isMobile && onMenuClick && (
            <ActionIcon
              variant="subtle"
              radius="md"
              size="lg"
              onClick={onMenuClick}
              styles={{
                root: {
                  color: 'var(--theme-text)',
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.2s ease, color 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'var(--theme-hover)',
                  },
                  '&[data-hovered]': {
                    backgroundColor: 'var(--theme-hover)',
                  },
                },
              }}
            >
              <IconMenu2 size={22} />
            </ActionIcon>
          )}
          <Text
            onClick={() => navigate('/dashboard')}
            style={{
              fontSize: isMobile ? '18px' : '22px',
              fontWeight: 500,
              letterSpacing: isMobile ? '1px' : '2px',
              color: 'var(--theme-text)',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.7'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            MoodLog
          </Text>
        </Group>

        <Group gap={isMobile ? 'xs' : 'sm'} align="center">
          {onAudioRecord && (
            <ActionIcon
              variant="light"
              radius="md"
              size={isMobile ? 'lg' : 'md'}
              onClick={onAudioRecord}
              styles={{
                root: {
                  color: 'var(--theme-primary)',
                  backgroundColor: 'var(--theme-hover)',
                  border: 'none',
                  transition: 'background-color 0.2s ease, color 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'var(--theme-primary)',
                    color: 'var(--theme-bg)',
                  },
                  '&[data-hovered]': {
                    backgroundColor: 'var(--theme-primary)',
                    color: 'var(--theme-bg)',
                  },
                },
              }}
              title="Записать аудио"
            >
              <IconMicrophone size={isMobile ? 20 : 18} />
            </ActionIcon>
          )}
          <ActionIcon
            variant="subtle"
            radius="md"
            size={isMobile ? 'lg' : 'md'}
            onClick={() => navigate('/settings')}
            styles={{
              root: {
                color: 'var(--theme-text)',
                backgroundColor: 'transparent',
                transition: 'background-color 0.2s ease, color 0.2s ease',
                '&:hover': {
                  backgroundColor: 'var(--theme-hover)',
                },
                '&[data-hovered]': {
                  backgroundColor: 'var(--theme-hover)',
                },
              },
            }}
            title="Настройки"
          >
            <IconSettings size={isMobile ? 22 : 20} />
          </ActionIcon>

          <Menu
            shadow="md"
            width={200}
            position="bottom-end"
            offset={8}
            radius="md"
            styles={{
              dropdown: {
                border: '1px solid var(--theme-border)',
                backgroundColor: 'var(--theme-bg)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              },
              label: {
                fontSize: '11px',
                color: 'var(--theme-text-secondary)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '8px 12px',
                backgroundColor: 'var(--theme-bg)',
              },
              divider: {
                borderColor: 'var(--theme-border)',
                margin: '4px 0',
              },
              item: {
                fontSize: '14px',
                color: 'var(--theme-text)',
                padding: '10px 12px',
                backgroundColor: 'var(--theme-bg)',
                '&:hover': {
                  backgroundColor: 'var(--theme-hover)',
                },
                '&[data-hovered]': {
                  backgroundColor: 'var(--theme-hover)',
                },
              },
            }}
          >
            <Menu.Target>
              <Avatar
                src={userPicture || undefined}
                radius="xl"
                size={isMobile ? 32 : 36}
                style={{
                  border: '2px solid var(--theme-border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--theme-primary)'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--theme-border)'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                {!userPicture && (
                  <Box
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'var(--theme-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isMobile ? '14px' : '16px',
                      color: 'var(--theme-bg)',
                      fontWeight: 600,
                    }}
                  >
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </Box>
                )}
              </Avatar>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>{user?.email}</Menu.Label>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconUser size={16} />}
                onClick={() => navigate('/profile')}
              >
                Профиль
              </Menu.Item>
              <Menu.Item
                leftSection={<IconBook size={16} />}
                onClick={() => navigate('/tutorial')}
              >
                Руководство
              </Menu.Item>
              <Menu.Item
                leftSection={<IconUpload size={16} />}
                onClick={() => setTelegramImportOpened(true)}
              >
                <Group gap={6} align="center">
                  <Text>Импорт из Telegram</Text>
                  <Text
                    size="xs"
                    style={{
                      color: 'var(--theme-text-secondary)',
                      fontWeight: 600,
                      backgroundColor: 'var(--theme-hover)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    BETA
                  </Text>
                </Group>
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLogout size={16} />}
                onClick={logout}
                style={{
                  fontSize: '14px',
                  color: '#dc2626',
                  padding: '10px 12px',
                  backgroundColor: 'var(--theme-bg)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff5f5'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-bg)'
                }}
              >
                Выйти
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
      <TelegramImport
        opened={telegramImportOpened}
        onClose={() => setTelegramImportOpened(false)}
        onImportComplete={onImportComplete}
      />
    </Box>
  )
}

