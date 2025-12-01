import { ReactNode } from 'react'
import { Box, Badge, Button, Text, Overlay } from '@mantine/core'
import { IconCrown, IconLock } from '@tabler/icons-react'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { useState } from 'react'
import { SubscriptionMenu } from './SubscriptionMenu'

interface ProFeatureGateProps {
  feature: string
  children: ReactNode
  showBadge?: boolean
  badgePosition?: 'top-right' | 'top-left' | 'inline'
}

export function ProFeatureGate({
  feature,
  children,
  showBadge = true,
  badgePosition = 'top-right',
}: ProFeatureGateProps) {
  const { canUseFeature } = useSubscription()
  const [subscriptionMenuOpened, setSubscriptionMenuOpened] = useState(false)
  const hasAccess = canUseFeature(feature)

  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <Box style={{ position: 'relative' }}>
      {showBadge && (
        <Badge
          color="yellow"
          variant="light"
          size="sm"
          leftSection={<IconCrown size={12} />}
          style={{
            position: badgePosition === 'inline' ? 'relative' : 'absolute',
            top: badgePosition === 'top-right' || badgePosition === 'top-left' ? '8px' : 'auto',
            right: badgePosition === 'top-right' ? '8px' : 'auto',
            left: badgePosition === 'top-left' ? '8px' : 'auto',
            zIndex: 10,
            marginBottom: badgePosition === 'inline' ? '8px' : 0,
            backgroundColor: 'rgba(253, 181, 0, 0.15)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(253, 181, 0, 0.3)',
          }}
        >
          Pro
        </Badge>
      )}
      <Box style={{ position: 'relative', filter: 'blur(2px)', pointerEvents: 'none', opacity: 0.7 }}>
        {children}
      </Box>
      <Overlay
        color="var(--theme-bg)"
        opacity={0.85}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(var(--theme-bg-rgb, 255, 255, 255), 0.8)',
        }}
      >
        <Box 
          style={{ 
            textAlign: 'center', 
            padding: '24px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <IconLock size={32} style={{ color: 'var(--theme-text-secondary)', marginBottom: '12px' }} />
          <Text fw={600} mb="xs">
            Требуется Pro подписка
          </Text>
          <Text size="sm" c="dimmed" mb="md">
            Эта функция доступна только в Pro плане
          </Text>
          <Button
            leftSection={<IconCrown size={16} />}
            onClick={(e) => {
              e.stopPropagation()
              setSubscriptionMenuOpened(true)
            }}
            style={{ pointerEvents: 'auto' }}
          >
            Перейти на Pro
          </Button>
        </Box>
      </Overlay>
      <SubscriptionMenu
        opened={subscriptionMenuOpened}
        onClose={() => setSubscriptionMenuOpened(false)}
        initialTab="upgrade"
      />
    </Box>
  )
}

