import { Box, Container, Stack } from '@mantine/core'
import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
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

      <Container size="xs" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <Stack gap="xl" align="center">
          <Stack gap="xs" align="center" style={{ marginBottom: '20px' }}>
            <Box
              component="h1"
              style={{
                fontSize: '48px',
                fontWeight: 200,
                letterSpacing: '8px',
                textTransform: 'uppercase',
                color: '#000',
                margin: 0,
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              MoodLog
            </Box>
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

