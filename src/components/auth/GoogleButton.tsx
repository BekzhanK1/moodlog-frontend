import { Button } from '@mantine/core'
import { IconBrandGoogle } from '@tabler/icons-react'

interface GoogleButtonProps {
  onClick: () => void
  loading?: boolean
}

export function GoogleButton({ onClick, loading = false }: GoogleButtonProps) {
  return (
    <Button
      fullWidth
      size="lg"
      radius={0}
      variant="outline"
      leftSection={<IconBrandGoogle size={20} />}
      style={{
        borderColor: '#ddd',
        color: '#000',
        backgroundColor: '#fff',
        fontWeight: 400,
        letterSpacing: '0.5px',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className="button-smooth"
      onClick={onClick}
      loading={loading}
      disabled={loading}
      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (!loading) {
          e.currentTarget.style.borderColor = '#000'
          e.currentTarget.style.backgroundColor = '#f9f9f9'
        }
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (!loading) {
          e.currentTarget.style.borderColor = '#ddd'
          e.currentTarget.style.backgroundColor = '#fff'
        }
      }}
    >
      Продолжить с Google
    </Button>
  )
}

