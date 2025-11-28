import { Box, Group, Text, ActionIcon, Avatar, Menu, Button } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconSettings, IconMenu2, IconUser, IconLogout, IconHome, IconBook, IconUpload, IconMicrophone } from '@tabler/icons-react'
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
            onClick={() => navigate('/')}
            style={{
              fontSize: isMobile ? '16px' : '20px',
              fontWeight: 400,
              letterSpacing: isMobile ? '2px' : '4px',
              color: 'var(--theme-text)',
              textTransform: 'uppercase',
              cursor: 'pointer',
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

        <Group gap={isMobile ? 'xs' : 'md'}>
          {onAudioRecord && (
            <ActionIcon
              variant="subtle"
              radius="md"
              size={isMobile ? 'lg' : 'md'}
              onClick={onAudioRecord}
              style={{
                color: 'var(--theme-text)',
                backgroundColor: 'transparent',
                border: '1px solid var(--theme-border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              title="Записать аудио"
            >
              <IconMicrophone size={isMobile ? 22 : 20} />
            </ActionIcon>
          )}
          <Button
            variant="subtle"
            leftSection={<IconHome size={16} />}
            onClick={() => navigate('/dashboard')}
            size="sm"
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
            {isMobile ? '' : 'Главная'}
          </Button>
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
              <Menu.Item
                leftSection={<IconBook size={16} />}
                onClick={() => navigate('/tutorial')}
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
                Руководство
              </Menu.Item>
              <Menu.Item
                leftSection={<IconUpload size={16} />}
                onClick={() => setTelegramImportOpened(true)}
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
                <Group gap={4} align="center">
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
      <TelegramImport
        opened={telegramImportOpened}
        onClose={() => setTelegramImportOpened(false)}
        onImportComplete={onImportComplete}
      />
    </Box>
  )
}

