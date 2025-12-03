import { Box, Container, Stack, Image, Group } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  children: ReactNode
  title: ReactNode
  subtitle?: ReactNode
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0.03) 50%, rgba(0,0,0,0.01) 100%)',
        }}
      />
      <Box
        style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,0,0,0.02) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <Box
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,0,0,0.02) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Navbar (shared with landing style, simplified) */}
      <Box
        component="header"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          borderBottom: '1px solid #eee',
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(8px)',
          padding: isMobile ? '10px 16px' : '12px 24px',
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap="xs" align="center">
            <Box
              component={Link}
              to="/"
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <Image
                src="/moodlog-logo-black.png"
                alt="MoodLog"
                h={28}
                mah={28}
                fit="contain"
                style={{ display: 'block' }}
              />
            </Box>
          </Group>
        </Group>
      </Box>

      <Container
        size="xs"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          paddingTop: isMobile ? 96 : 112,
        }}
      >
        <Stack gap="xl" align="center">
          <Stack gap="xs" align="center" style={{ marginBottom: '20px' }}>
            <Box
              component="h2"
              style={{
                fontSize: '24px',
                fontWeight: 400,
                color: '#333',
                margin: 0,
                marginTop: '8px',
              }}
            >
              {title}
            </Box>
            {subtitle && (
              <Box
                component="p"
                style={{
                  fontSize: '16px',
                  fontWeight: 300,
                  color: '#666',
                  margin: 0,
                  marginTop: '4px',
                  textAlign: 'center',
                }}
              >
                {subtitle}
              </Box>
            )}
          </Stack>
          {children}
        </Stack>
      </Container>
    </Box>
  )
}

