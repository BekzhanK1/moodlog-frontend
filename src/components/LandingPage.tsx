import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Card,
  Grid,
  ThemeIcon,
  Box,
  Transition,
  Image,
} from '@mantine/core'
import { useIntersection, useMediaQuery } from '@mantine/hooks'
import { useEffect, useState, useRef } from 'react'
import { IconBrain, IconLock, IconChartLine, IconSparkles, IconTrendingUp, IconFileText } from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface FeatureCardProps {
  icon: React.ComponentType<{ size?: number | string; style?: React.CSSProperties }>
  title: string
  description: string
  index: number
  visible: boolean
}

function FeatureCard({ icon: Icon, title, description, index, visible }: FeatureCardProps) {
  const [mounted, setMounted] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setMounted(true)
      }, index * 150)
      return () => clearTimeout(timer)
    }
  }, [visible, index])

  return (
    <Transition
      mounted={mounted}
      transition="slide-up"
      duration={1000}
      timingFunction="cubic-bezier(0.16, 1, 0.3, 1)"
    >
      {(styles) => (
        <Card
          padding={isMobile ? 'md' : 'xl'}
          radius="md"
          style={{
            ...styles,
            backgroundColor: '#f9f9f9',
            border: '1px solid #eee',
            height: '100%',
            cursor: 'pointer',
          }}
          className="card-hover"
        >
          <Stack gap={isMobile ? 'sm' : 'md'}>
            <ThemeIcon
              size={isMobile ? 40 : 50}
              radius="md"
              variant="light"
              style={{
                backgroundColor: '#eee',
                color: '#000',
                border: '1px solid #ddd',
                transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="card-icon"
            >
              <Icon size={isMobile ? 20 : 24} />
            </ThemeIcon>
            <Title
              order={4}
              size={isMobile ? 18 : 22}
              style={{
                color: '#000',
                fontWeight: 500,
                letterSpacing: '0.3px',
                marginTop: '8px',
              }}
            >
              {title}
            </Title>
            <Text
              size="sm"
              style={{
                color: '#555',
                fontWeight: 300,
                lineHeight: 1.7,
                marginTop: '8px',
                fontSize: isMobile ? '14px' : '15px',
              }}
            >
              {description}
            </Text>
          </Stack>
        </Card>
      )}
    </Transition>
  )
}

function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const [featuresVisible, setFeaturesVisible] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px) and (min-width: 769px)')
  const { ref: featuresIntersectionRef, entry: featuresEntry } = useIntersection({
    threshold: 0.1,
  })
  const heroRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleLoginClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  useEffect(() => {
    if (featuresEntry?.isIntersecting) {
      const timer = setTimeout(() => {
        setFeaturesVisible(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [featuresEntry?.isIntersecting])

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Box
      style={{
        backgroundColor: '#fff',
        color: '#000',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      {/* Navbar */}
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
          padding: isMobile ? '10px 12px' : '12px 20px',
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
          <Button
            onClick={handleLoginClick}
            size={isMobile ? 'sm' : 'md'}
            radius="md"
            variant="filled"
            style={{
              backgroundColor: '#000',
              color: '#fff',
              border: '1px solid #000',
              fontWeight: 500,
              letterSpacing: '0.5px',
              fontSize: isMobile ? '13px' : '14px',
              padding: isMobile ? '8px 18px' : '10px 22px',
            }}
            className="button-smooth"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fff'
              e.currentTarget.style.color = '#000'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#000'
              e.currentTarget.style.color = '#fff'
            }}
          >
            Войти
          </Button>
        </Group>
      </Box>
      {/* Hero Section */}
      <Box
        ref={heroRef}
        style={{
          minHeight: isMobile ? '80vh' : '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: isMobile ? '80px 20px 40px' : isTablet ? '100px 40px 60px' : '120px 40px 80px',
        }}
      >
        {/* Animated background gradient */}
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.02) 100%)',
            animation: mounted ? 'pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
            willChange: 'opacity, transform',
          }}
        />
        {/* Decorative elements - hidden on mobile */}
        {!isMobile && (
          <>
            <Box
              style={{
                position: 'absolute',
                top: '20%',
                right: '10%',
                width: isTablet ? '200px' : '300px',
                height: isTablet ? '200px' : '300px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 70%)',
                filter: 'blur(60px)',
                animation: mounted ? 'float 20s ease-in-out infinite' : 'none',
              }}
            />
            <Box
              style={{
                position: 'absolute',
                bottom: '20%',
                left: '10%',
                width: isTablet ? '150px' : '250px',
                height: isTablet ? '150px' : '250px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,0,0,0.02) 0%, transparent 70%)',
                filter: 'blur(50px)',
                animation: mounted ? 'float 25s ease-in-out infinite reverse' : 'none',
              }}
            />
          </>
        )}
        <style>{`
          @keyframes pulse {
            0%, 100% { 
              opacity: 0.3; 
              transform: scale(1) translate(0, 0);
            }
            50% { 
              opacity: 0.6; 
              transform: scale(1.1) translate(0, -5px);
            }
          }
          @keyframes float {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            50% {
              transform: translate(30px, -30px) scale(1.1);
            }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .fade-in-up {
            animation: fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .fade-in {
            animation: fadeIn 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .card-hover {
            transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1), 
                        box-shadow 1s cubic-bezier(0.16, 1, 0.3, 1),
                        border-color 1s cubic-bezier(0.16, 1, 0.3, 1),
                        background-color 1s cubic-bezier(0.16, 1, 0.3, 1);
            will-change: transform;
          }
          .card-hover:hover {
            transform: translateY(-10px) scale(1.01);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border-color: #ddd;
            background-color: #f5f5f5;
          }
          .card-hover:hover .card-icon {
            transform: scale(1.1);
            border-color: #ccc;
            background-color: #e5e5e5;
          }
          .icon-box {
            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            will-change: transform, border-color, background-color;
          }
          .icon-box:hover {
            transform: scale(1.1) rotate(5deg);
            border-color: #000;
            background-color: #f0f0f0;
          }
          .button-smooth {
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            will-change: background-color, color, transform;
          }
          .button-smooth:hover {
            transform: scale(1.05);
          }
          .button-smooth:active {
            transform: scale(0.98);
          }
        `}</style>

        <Container size="lg" style={{ position: 'relative', zIndex: 1, padding: isMobile ? '0 16px' : '0 24px' }}>
          <Stack align="center" gap={isMobile ? 'lg' : 'xl'} ta="center">
            <Transition
              mounted={mounted}
              transition="slide-up"
              duration={1600}
              timingFunction="cubic-bezier(0.16, 1, 0.3, 1)"
            >
              {(styles) => (
                <Title
                  order={1}
                  style={{
                    ...styles,
                    color: '#111',
                    maxWidth: isMobile ? '100%' : '760px',
                    fontWeight: 500,
                    letterSpacing: '0.4px',
                    fontSize: isMobile ? '28px' : isTablet ? '34px' : '40px',
                    lineHeight: 1.2,
                    padding: isMobile ? '0 8px' : '0',
                    textAlign: 'center',
                  }}
                >
                  Что если ваш дневник мог бы читать между строк?
                </Title>
              )}
            </Transition>

            <Transition
              mounted={mounted}
              transition="slide-up"
              duration={1800}
              timingFunction="cubic-bezier(0.16, 1, 0.3, 1)"
            >
              {(styles) => (
                <Text
                  style={{
                    ...styles,
                    color: '#555',
                    maxWidth: isMobile ? '100%' : '650px',
                    fontWeight: 300,
                    lineHeight: 1.7,
                    fontSize: isMobile ? '18px' : isTablet ? '19px' : '20px',
                    marginTop: '20px',
                    padding: isMobile ? '0 8px' : '0',
                  }}
                >
                  MoodLog анализирует ваши записи, обнаруживает скрытые паттерны и помогает понять себя глубже. 
                  <strong style={{ color: '#000', fontWeight: 500 }}> Просто пишите. Всё остальное — за ИИ.</strong>
                </Text>
              )}
            </Transition>

            <Transition
              mounted={mounted}
              transition="slide-up"
              duration={2000}
              timingFunction="cubic-bezier(0.16, 1, 0.3, 1)"
            >
              {(styles) => (
                <Group mt="xl" style={styles} gap={isMobile ? 'md' : 'lg'} justify="center" wrap={isMobile ? 'wrap' : 'nowrap'}>
                  <Button
                    component={Link}
                    to="/register"
                    size={isMobile ? 'md' : 'lg'}
                    radius="md"
                    variant="filled"
                    fullWidth={isMobile}
                    style={{
                      backgroundColor: '#000',
                      color: '#fff',
                      border: '1px solid #000',
                      fontWeight: 500,
                      letterSpacing: '1px',
                      padding: isMobile ? '14px 32px' : '16px 40px',
                      fontSize: isMobile ? '14px' : '16px',
                      textDecoration: 'none',
                    }}
                    className="button-smooth"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fff'
                      e.currentTarget.style.color = '#000'
                      e.currentTarget.style.transform = 'scale(1.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#000'
                      e.currentTarget.style.color = '#fff'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    Попробовать бесплатно →
                  </Button>
                </Group>
              )}
            </Transition>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        ref={featuresIntersectionRef}
        py={isMobile ? 60 : isTablet ? 80 : 120}
        style={{
          backgroundColor: '#fff',
          borderTop: '1px solid #eee',
        }}
      >
        <Container size="lg" style={{ padding: isMobile ? '0 16px' : '0 24px' }}>
          <Stack align="center" gap={isMobile ? 'md' : 'xl'} mb={isMobile ? 40 : isTablet ? 60 : 80}>
            <Text
              size="sm"
              style={{
                color: '#999',
                letterSpacing: isMobile ? '2px' : '4px',
                textTransform: 'uppercase',
                fontWeight: 300,
                fontSize: isMobile ? '11px' : '12px',
              }}
            >
              Почему MoodLog?
            </Text>
            <Text
              size="xl"
              style={{
                color: '#000',
                fontWeight: 400,
                marginTop: '16px',
                maxWidth: isMobile ? '100%' : '600px',
                textAlign: 'center',
                fontSize: isMobile ? '20px' : isTablet ? '24px' : '28px',
                padding: isMobile ? '0 8px' : '0',
              }}
            >
              Это не просто дневник. Это ваш личный психолог с искусственным интеллектом
            </Text>
          </Stack>

          <Grid gutter={isMobile ? 'md' : 'xl'}>
            {[
              {
                icon: IconBrain,
                title: 'ИИ читает между строк',
                description: 'Анализирует не только слова, но и контекст. Обнаруживает скрытые эмоции, о которых вы даже не подозревали',
              },
              {
                icon: IconSparkles,
                title: 'Инсайты, которые меняют всё',
                description: 'Еженедельные отчеты показывают, что действительно влияет на ваше настроение. Неожиданные открытия гарантированы',
              },
              {
                icon: IconChartLine,
                title: 'Видите свой прогресс',
                description: 'Визуализируйте эмоциональное путешествие. Графики, календари и тренды — всё, чтобы понять себя лучше',
              },
              {
                icon: IconLock,
                title: 'Ваши мысли в безопасности',
                description: 'Шифрование на уровне банков. Ваши записи принадлежат только вам — мы их не читаем и не передаём',
              },
            ].map((feature, index) => (
              <Grid.Col key={index} span={{ base: 12, sm: 6, md: 6 }}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  index={index}
                  visible={featuresVisible}
                />
              </Grid.Col>
            ))}
          </Grid>
          
          <Box mt={isMobile ? 40 : isTablet ? 60 : 80} ta="center" style={{ padding: isMobile ? '0 16px' : '0' }}>
            <Text
              size="lg"
              style={{
                color: '#666',
                fontWeight: 300,
                fontStyle: 'italic',
                maxWidth: isMobile ? '100%' : '600px',
                margin: '0 auto',
                lineHeight: 1.8,
                fontSize: isMobile ? '16px' : isTablet ? '18px' : '20px',
              }}
            >
              "Впервые я увидел реальные паттерны в своих эмоциях. Это изменило всё."
            </Text>
            <Text
              size="sm"
              style={{
                color: '#999',
                marginTop: '16px',
                fontWeight: 300,
                fontSize: isMobile ? '12px' : '14px',
              }}
            >
              — Пользователь MoodLog
            </Text>
          </Box>
        </Container>
      </Box>

      {/* How it works - Simplified */}
      <Box
        py={isMobile ? 60 : isTablet ? 80 : 120}
        style={{
          backgroundColor: '#fff',
          borderTop: '1px solid #eee',
        }}
      >
        <Container size="lg" style={{ padding: isMobile ? '0 16px' : '0 24px' }}>
          <Stack align="center" gap={isMobile ? 'md' : 'xl'} mb={isMobile ? 40 : isTablet ? 60 : 80}>
            <Text
              size="sm"
              style={{
                color: '#999',
                letterSpacing: isMobile ? '2px' : '4px',
                textTransform: 'uppercase',
                fontWeight: 300,
                fontSize: isMobile ? '11px' : '12px',
              }}
            >
              Три простых шага
            </Text>
            <Text
              size="xl"
              style={{
                color: '#000',
                fontWeight: 400,
                marginTop: '16px',
                maxWidth: isMobile ? '100%' : '500px',
                fontSize: isMobile ? '20px' : isTablet ? '24px' : '28px',
                padding: isMobile ? '0 8px' : '0',
                textAlign: 'center',
              }}
            >
              Начните понимать себя уже сегодня
            </Text>
          </Stack>

          <Grid gutter={isMobile ? 'md' : 'xl'}>
            {[
              { 
                icon: IconFileText, 
                step: '1', 
                text: 'Пишите как обычно',
                description: 'Никаких форм и чекбоксов. Просто излейте душу'
              },
              { 
                icon: IconBrain, 
                step: '2', 
                text: 'ИИ находит паттерны',
                description: 'Анализирует каждое слово, каждый контекст, каждую эмоцию'
              },
              { 
                icon: IconTrendingUp, 
                step: '3', 
                text: 'Откройте себя заново',
                description: 'Получайте инсайты, которые меняют взгляд на себя'
              },
            ].map((item, index) => (
              <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
                <Stack align="center" gap={isMobile ? 'sm' : 'md'} ta="center">
                  <Box
                    className="icon-box"
                    style={{
                      width: isMobile ? '60px' : '80px',
                      height: isMobile ? '60px' : '80px',
                      border: '1px solid #ddd',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f9f9f9',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#000'
                      e.currentTarget.style.backgroundColor = '#f0f0f0'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#ddd'
                      e.currentTarget.style.backgroundColor = '#f9f9f9'
                    }}
                  >
                    <item.icon size={isMobile ? 24 : 32} style={{ color: '#000' }} />
                  </Box>
                  <Text
                    size="xs"
                    style={{
                      color: '#999',
                      letterSpacing: '2px',
                      fontWeight: 300,
                      fontSize: isMobile ? '10px' : '12px',
                    }}
                  >
                    {item.step}
                  </Text>
                  <Text
                    size="lg"
                    style={{
                      color: '#000',
                      fontWeight: 400,
                      letterSpacing: '0.5px',
                      marginTop: '8px',
                      fontSize: isMobile ? '18px' : isTablet ? '20px' : '22px',
                    }}
                  >
                    {item.text}
                  </Text>
                  {item.description && (
                    <Text
                      size="sm"
                      style={{
                        color: '#666',
                        fontWeight: 300,
                        marginTop: '8px',
                        maxWidth: isMobile ? '100%' : '200px',
                        lineHeight: 1.5,
                        fontSize: isMobile ? '14px' : '15px',
                        padding: isMobile ? '0 16px' : '0',
                      }}
                    >
                      {item.description}
                    </Text>
                  )}
                </Stack>
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        py={isMobile ? 60 : isTablet ? 80 : 120}
        style={{
          backgroundColor: '#000',
          borderTop: '1px solid #eee',
        }}
      >
        <Container size="lg" style={{ padding: isMobile ? '0 16px' : '0 24px' }}>
          <Stack align="center" gap={isMobile ? 'md' : 'xl'} ta="center">
            <Text
              size="xl"
              style={{
                color: '#fff',
                fontWeight: 300,
                letterSpacing: '1px',
                maxWidth: isMobile ? '100%' : '700px',
                lineHeight: 1.7,
                fontSize: isMobile ? '22px' : isTablet ? '26px' : '32px',
                padding: isMobile ? '0 8px' : '0',
              }}
            >
              Готовы узнать о себе то, чего не знали?
            </Text>
            <Text
              size="lg"
              style={{
                color: '#ddd',
                fontWeight: 300,
                maxWidth: isMobile ? '100%' : '600px',
                marginTop: isMobile ? '16px' : '24px',
                lineHeight: 1.6,
                fontSize: isMobile ? '16px' : isTablet ? '17px' : '18px',
                padding: isMobile ? '0 8px' : '0',
              }}
            >
              Присоединяйтесь к тысячам людей, которые уже открыли новые грани себя
            </Text>
            <Button
              component={Link}
              to="/register"
              size={isMobile ? 'md' : 'lg'}
              radius="md"
              variant="filled"
              fullWidth={isMobile}
              style={{
                backgroundColor: '#fff',
                color: '#000',
                border: '1px solid #fff',
                fontWeight: 500,
                letterSpacing: '1px',
                padding: isMobile ? '14px 32px' : '18px 56px',
                marginTop: isMobile ? '32px' : '48px',
                fontSize: isMobile ? '14px' : '16px',
                textDecoration: 'none',
              }}
              className="button-smooth"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#000'
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.borderColor = '#fff'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff'
                e.currentTarget.style.color = '#000'
                e.currentTarget.style.borderColor = '#fff'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              Начать бесплатно →
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        py={isMobile ? 24 : 40}
        style={{
          backgroundColor: '#fff',
          borderTop: '1px solid #eee',
        }}
      >
        <Container size="lg" style={{ padding: isMobile ? '0 16px' : '0 24px' }}>
          <Text
            ta="center"
            size="sm"
            style={{
              color: '#999',
              fontWeight: 300,
              letterSpacing: '1px',
              fontSize: isMobile ? '12px' : '14px',
            }}
          >
            © 2025 MoodLog
          </Text>
        </Container>
      </Box>
    </Box>
  )
}

export default LandingPage
