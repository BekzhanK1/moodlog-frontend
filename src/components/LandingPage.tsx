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
} from '@mantine/core'
import { useIntersection } from '@mantine/hooks'
import { useEffect, useState } from 'react'
import {
  IconBrain,
  IconLock,
  IconChartLine,
  IconSparkles,
  IconTrendingUp,
  IconFileText,
} from '@tabler/icons-react'

interface FeatureCardProps {
  icon: React.ComponentType<{ size?: number | string; style?: React.CSSProperties }>
  title: string
  description: string
  index: number
  visible: boolean
}

function FeatureCard({ icon: Icon, title, description, index, visible }: FeatureCardProps) {
  const [mounted, setMounted] = useState(false)

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
          padding="xl"
          radius={0}
          style={{
            ...styles,
            backgroundColor: '#f9f9f9',
            border: '1px solid #eee',
            height: '100%',
            cursor: 'pointer',
          }}
          className="card-hover"
        >
          <Stack gap="md">
            <ThemeIcon
              size={50}
              radius={0}
              variant="light"
              style={{
                backgroundColor: '#eee',
                color: '#000',
                border: '1px solid #ddd',
                transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="card-icon"
            >
              <Icon size={24} />
            </ThemeIcon>
            <Title
              order={4}
              size={22}
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
  const { ref: featuresIntersectionRef, entry: featuresEntry } = useIntersection({
    threshold: 0.1,
  })

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
      }}
    >
      {/* Hero Section */}
      <Box
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
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
        {/* Decorative elements */}
        <Box
          style={{
            position: 'absolute',
            top: '20%',
            right: '10%',
            width: '300px',
            height: '300px',
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
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,0,0,0.02) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animation: mounted ? 'float 25s ease-in-out infinite reverse' : 'none',
          }}
        />
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

        <Container size="lg" style={{ position: 'relative', zIndex: 1 }}>
          <Stack align="center" gap="xl" ta="center">
            <Transition
              mounted={mounted}
              transition="fade"
              duration={1500}
              timingFunction="cubic-bezier(0.16, 1, 0.3, 1)"
            >
              {(styles) => (
                <Title
                  order={1}
                  size={90}
                  fw={200}
                  style={{
                    ...styles,
                    letterSpacing: '12px',
                    textTransform: 'uppercase',
                    color: '#000',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  MoodLog
                </Title>
              )}
            </Transition>

            <Transition
              mounted={mounted}
              transition="slide-up"
              duration={1600}
              timingFunction="cubic-bezier(0.16, 1, 0.3, 1)"
            >
              {(styles) => (
                <Text
                  size="xl"
                  style={{
                    ...styles,
                    color: '#333',
                    maxWidth: '700px',
                    fontWeight: 400,
                    letterSpacing: '0.5px',
                    fontSize: '28px',
                    lineHeight: 1.4,
                  }}
                >
                  Что если ваш дневник мог бы читать между строк?
                </Text>
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
                  size="lg"
                  style={{
                    ...styles,
                    color: '#555',
                    maxWidth: '650px',
                    fontWeight: 300,
                    lineHeight: 1.8,
                    fontSize: '18px',
                    marginTop: '20px',
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
                <Group mt="xl" style={styles}>
                  <Button
                    size="lg"
                    radius={0}
                    variant="filled"
                    style={{
                      backgroundColor: '#000',
                      color: '#fff',
                      border: '1px solid #000',
                      fontWeight: 500,
                      letterSpacing: '1px',
                      padding: '16px 40px',
                      fontSize: '16px',
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
                  <Button
                    size="lg"
                    radius={0}
                    variant="outline"
                    style={{
                      borderColor: '#000',
                      color: '#000',
                      backgroundColor: 'transparent',
                      fontWeight: 400,
                      letterSpacing: '1px',
                      padding: '12px 32px',
                    }}
                    className="button-smooth"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#000'
                      e.currentTarget.style.color = '#fff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#000'
                    }}
                  >
                    Как это работает →
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
        py={120}
        style={{
          backgroundColor: '#fff',
          borderTop: '1px solid #eee',
        }}
      >
        <Container size="lg">
          <Stack align="center" gap="xl" mb={80}>
            <Text
              size="sm"
              style={{
                color: '#999',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                fontWeight: 300,
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
                maxWidth: '600px',
                textAlign: 'center',
              }}
            >
              Это не просто дневник. Это ваш личный психолог с искусственным интеллектом
            </Text>
          </Stack>

          <Grid>
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
          
          <Box mt={80} ta="center">
            <Text
              size="lg"
              style={{
                color: '#666',
                fontWeight: 300,
                fontStyle: 'italic',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: 1.8,
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
              }}
            >
              — Пользователь MoodLog
            </Text>
          </Box>
        </Container>
      </Box>

      {/* How it works - Simplified */}
      <Box
        py={120}
        style={{
          backgroundColor: '#fff',
          borderTop: '1px solid #eee',
        }}
      >
        <Container size="lg">
          <Stack align="center" gap="xl" mb={80}>
            <Text
              size="sm"
              style={{
                color: '#999',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                fontWeight: 300,
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
                maxWidth: '500px',
              }}
            >
              Начните понимать себя уже сегодня
            </Text>
          </Stack>

          <Grid>
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
              <Grid.Col key={index} span={{ base: 12, md: 4 }}>
                <Stack align="center" gap="md" ta="center">
                  <Box
                    className="icon-box"
                    style={{
                      width: '80px',
                      height: '80px',
                      border: '1px solid #ddd',
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
                    <item.icon size={32} style={{ color: '#000' }} />
                  </Box>
                  <Text
                    size="xs"
                    style={{
                      color: '#999',
                      letterSpacing: '2px',
                      fontWeight: 300,
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
                        maxWidth: '200px',
                        lineHeight: 1.5,
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
        py={120}
        style={{
          backgroundColor: '#000',
          borderTop: '1px solid #eee',
        }}
      >
        <Container size="lg">
          <Stack align="center" gap="xl" ta="center">
            <Text
              size="xl"
              style={{
                color: '#fff',
                fontWeight: 300,
                letterSpacing: '1px',
                maxWidth: '700px',
                lineHeight: 1.7,
                fontSize: '32px',
              }}
            >
              Готовы узнать о себе то, чего не знали?
            </Text>
            <Text
              size="lg"
              style={{
                color: '#ddd',
                fontWeight: 300,
                maxWidth: '600px',
                marginTop: '24px',
                lineHeight: 1.6,
              }}
            >
              Присоединяйтесь к тысячам людей, которые уже открыли новые грани себя
            </Text>
            <Button
              size="lg"
              radius={0}
              variant="filled"
              style={{
                backgroundColor: '#fff',
                color: '#000',
                border: '1px solid #fff',
                fontWeight: 500,
                letterSpacing: '1px',
                padding: '18px 56px',
                marginTop: '48px',
                fontSize: '16px',
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
        py={40}
        style={{
          backgroundColor: '#fff',
          borderTop: '1px solid #eee',
        }}
      >
        <Container size="lg">
          <Text
            ta="center"
            size="sm"
            style={{
              color: '#999',
              fontWeight: 300,
              letterSpacing: '1px',
            }}
          >
            © 2024 MoodLog
          </Text>
        </Container>
      </Box>
    </Box>
  )
}

export default LandingPage
