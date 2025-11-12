import { Box, Text, Stack, Group, Button, Card, Accordion, Divider } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconArrowLeft, IconBook, IconHelpCircle, IconCheck, IconBulb } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/dashboard/Navbar'
import { useAuth } from '../contexts/AuthContext'

export function TutorialPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const steps = [
    {
      title: 'Создание записи',
      description: 'Нажмите на кнопку "Новая запись" в левой боковой панели. Введите заголовок и напишите о своих мыслях и чувствах. Запись автоматически сохраняется как черновик каждые 3 секунды.',
      icon: <IconBook size={20} />
    },
    {
      title: 'Публикация записи',
      description: 'Когда вы закончите писать, нажмите кнопку "Сохранить". ИИ проанализирует вашу запись, определит настроение (от -2 до 2) и выделит основные темы. После анализа запись автоматически откроется.',
      icon: <IconCheck size={20} />
    },
    {
      title: 'Просмотр записей',
      description: 'Все ваши записи отображаются в левой боковой панели. Нажмите на любую запись, чтобы увидеть её полный текст. Вы можете редактировать или удалять записи.',
      icon: <IconBulb size={20} />
    },
    {
      title: 'Поиск',
      description: 'Используйте поле поиска в левой панели для поиска по заголовку или содержимому. Для поиска по тегам введите #тег (например, #работа). Также можно кликнуть на тег в записи для быстрого поиска.',
      icon: <IconHelpCircle size={20} />
    },
    {
      title: 'Аналитика',
      description: 'Перейдите на страницу "Аналитика" через боковую панель или меню. Здесь вы найдете календарь настроения, график трендов, ключевые моменты месяца, основные темы и еженедельные/ежемесячные сводки от ИИ.',
      icon: <IconBulb size={20} />
    },
    {
      title: 'Настройки',
      description: 'Нажмите на иконку настроек в правом верхнем углу, чтобы изменить тему приложения. Доступны светлая, темная и несколько кастомных тем.',
      icon: <IconHelpCircle size={20} />
    }
  ]

  const faqItems = [
    {
      question: 'Как работает анализ настроения?',
      answer: 'ИИ анализирует текст вашей записи и определяет эмоциональное состояние по шкале от -2 (очень негативное) до +2 (очень позитивное). Анализ происходит автоматически после сохранения записи.'
    },
    {
      question: 'Что такое теги и как они создаются?',
      answer: 'Теги - это ключевые темы, которые ИИ автоматически выделяет из ваших записей. Они помогают отслеживать повторяющиеся темы в ваших записях. Теги создаются автоматически при анализе записи.'
    },
    {
      question: 'Можно ли редактировать записи?',
      answer: 'Да, вы можете редактировать любую запись. Нажмите на запись, затем на кнопку "Редактировать". После сохранения изменений ИИ повторно проанализирует запись и обновит настроение и теги.'
    },
    {
      question: 'Что такое черновики?',
      answer: 'Черновики - это записи, которые автоматически сохраняются во время написания. Они помечены как "Черновик" и имеют пунктирную рамку. Когда вы нажмете "Сохранить", черновик станет опубликованной записью.'
    },
    {
      question: 'Как работает поиск?',
      answer: 'Поиск работает по заголовку и содержимому записей. Для поиска по тегам используйте формат #тег. Результаты поиска подсвечиваются в записях. Вы также можете кликнуть на тег в любой записи для быстрого поиска.'
    },
    {
      question: 'Когда можно создать еженедельную сводку?',
      answer: 'Еженедельную сводку можно создать только в выходные дни (суббота или воскресенье). Это позволяет ИИ проанализировать всю неделю целиком.'
    },
    {
      question: 'Когда можно создать ежемесячную сводку?',
      answer: 'Ежемесячную сводку можно создать только в последние 5 дней месяца. Это позволяет ИИ проанализировать весь месяц целиком.'
    },
    {
      question: 'Можно ли просматривать старые сводки?',
      answer: 'Да, используйте стрелки навигации в карточках сводок для переключения между неделями или месяцами. Также можно нажать "Все сводки" для просмотра списка всех созданных сводок.'
    },
    {
      question: 'Как работает календарь настроения?',
      answer: 'Календарь показывает ваше настроение за каждый день месяца. Цвета от красного (негативное) до зеленого (позитивное) отражают средний рейтинг настроения за день. Вы можете переключаться между месяцами и неделями.'
    },
    {
      question: 'Что показывает график настроения?',
      answer: 'График отображает тренд вашего настроения во времени. Вы можете выбрать вид: неделя, месяц или год. Для годового вида график показывает средний рейтинг настроения за каждый месяц.'
    },
    {
      question: 'Безопасны ли мои данные?',
      answer: 'Да, все ваши записи шифруются перед сохранением в базе данных. Только вы можете видеть расшифрованное содержимое ваших записей.'
    },
    {
      question: 'Можно ли удалить аккаунт?',
      answer: 'В данный момент функция удаления аккаунта находится в разработке. Если вам нужно удалить аккаунт, пожалуйста, свяжитесь с поддержкой.'
    }
  ]

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--theme-bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar userPicture={user?.picture || null} />
      
      <Box
        style={{
          flex: 1,
          padding: isMobile ? '20px 16px' : '40px',
          maxWidth: '1000px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <Stack gap="xl">
          {/* Header */}
          <Group gap="md" align="center" wrap="wrap">
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={18} />}
              onClick={() => navigate('/dashboard')}
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
              Назад
            </Button>
            <Text
              style={{
                fontSize: isMobile ? '28px' : '36px',
                fontWeight: 400,
                color: 'var(--theme-text)',
              }}
            >
              Руководство пользователя
            </Text>
          </Group>

          {/* Introduction */}
          <Card
            padding={isMobile ? 'md' : 'lg'}
            radius="md"
            style={{
              backgroundColor: 'var(--theme-bg)',
              border: '1px solid var(--theme-border)',
            }}
          >
            <Stack gap="md">
              <Text
                style={{
                  fontSize: isMobile ? '18px' : '20px',
                  fontWeight: 600,
                  color: 'var(--theme-text)',
                }}
              >
                Добро пожаловать в MoodLog!
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? '14px' : '16px',
                  color: 'var(--theme-text-secondary)',
                  lineHeight: 1.7,
                }}
              >
                MoodLog - это ваш личный дневник настроения с искусственным интеллектом. 
                Записывайте свои мысли, отслеживайте эмоции и получайте аналитику о вашем 
                эмоциональном состоянии. Это руководство поможет вам начать работу.
              </Text>
            </Stack>
          </Card>

          {/* Steps */}
          <Card
            padding={isMobile ? 'md' : 'lg'}
            radius="md"
            style={{
              backgroundColor: 'var(--theme-bg)',
              border: '1px solid var(--theme-border)',
            }}
          >
            <Stack gap="lg">
              <Text
                style={{
                  fontSize: isMobile ? '20px' : '24px',
                  fontWeight: 600,
                  color: 'var(--theme-text)',
                  marginBottom: '8px',
                }}
              >
                Пошаговая инструкция
              </Text>
              
              <Stack gap="md">
                {steps.map((step, index) => (
                  <Box key={index}>
                    <Group gap="md" align="flex-start" wrap="nowrap">
                      <Box
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--theme-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--theme-bg)',
                          flexShrink: 0,
                          fontWeight: 600,
                          fontSize: '16px',
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Stack gap="xs" style={{ flex: 1 }}>
                        <Group gap="xs" align="center">
                          <Box style={{ color: 'var(--theme-primary)' }}>
                            {step.icon}
                          </Box>
                          <Text
                            style={{
                              fontSize: isMobile ? '16px' : '18px',
                              fontWeight: 600,
                              color: 'var(--theme-text)',
                            }}
                          >
                            {step.title}
                          </Text>
                        </Group>
                        <Text
                          style={{
                            fontSize: isMobile ? '14px' : '16px',
                            color: 'var(--theme-text-secondary)',
                            lineHeight: 1.7,
                          }}
                        >
                          {step.description}
                        </Text>
                      </Stack>
                    </Group>
                    {index < steps.length - 1 && (
                      <Divider 
                        style={{ 
                          borderColor: 'var(--theme-border)',
                          marginTop: '20px',
                          marginLeft: '60px',
                        }} 
                      />
                    )}
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Card>

          {/* FAQ */}
          <Card
            padding={isMobile ? 'md' : 'lg'}
            radius="md"
            style={{
              backgroundColor: 'var(--theme-bg)',
              border: '1px solid var(--theme-border)',
            }}
          >
            <Stack gap="lg">
              <Group gap="xs" align="center">
                <IconHelpCircle size={24} style={{ color: 'var(--theme-primary)' }} />
                <Text
                  style={{
                    fontSize: isMobile ? '20px' : '24px',
                    fontWeight: 600,
                    color: 'var(--theme-text)',
                  }}
                >
                  Часто задаваемые вопросы
                </Text>
              </Group>
              
              <Accordion
                variant="separated"
                radius="md"
                styles={{
                  item: {
                    backgroundColor: 'var(--theme-hover)',
                    border: '1px solid var(--theme-border)',
                  },
                  control: {
                    color: 'var(--theme-text)',
                    '&:hover': {
                      backgroundColor: 'var(--theme-border)',
                    },
                  },
                  label: {
                    color: 'var(--theme-text)',
                    fontWeight: 500,
                  },
                  content: {
                    color: 'var(--theme-text-secondary)',
                  },
                }}
              >
                {faqItems.map((item, index) => (
                  <Accordion.Item key={index} value={`item-${index}`}>
                    <Accordion.Control>
                      <Text style={{ fontSize: isMobile ? '14px' : '16px' }}>
                        {item.question}
                      </Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Text
                        style={{
                          fontSize: isMobile ? '14px' : '15px',
                          lineHeight: 1.7,
                          paddingTop: '8px',
                        }}
                      >
                        {item.answer}
                      </Text>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Stack>
          </Card>

          {/* Tips */}
          <Card
            padding={isMobile ? 'md' : 'lg'}
            radius="md"
            style={{
              backgroundColor: 'var(--theme-hover)',
              border: '1px solid var(--theme-border)',
            }}
          >
            <Stack gap="md">
              <Group gap="xs" align="center">
                <IconBulb size={20} style={{ color: 'var(--theme-primary)' }} />
                <Text
                  style={{
                    fontSize: isMobile ? '18px' : '20px',
                    fontWeight: 600,
                    color: 'var(--theme-text)',
                  }}
                >
                  Полезные советы
                </Text>
              </Group>
              <Stack gap="sm">
                <Text
                  style={{
                    fontSize: isMobile ? '14px' : '15px',
                    color: 'var(--theme-text-secondary)',
                    lineHeight: 1.7,
                  }}
                >
                  • Регулярно записывайте свои мысли - это поможет лучше отслеживать изменения настроения
                </Text>
                <Text
                  style={{
                    fontSize: isMobile ? '14px' : '15px',
                    color: 'var(--theme-text-secondary)',
                    lineHeight: 1.7,
                  }}
                >
                  • Используйте теги для быстрого поиска записей по определенным темам
                </Text>
                <Text
                  style={{
                    fontSize: isMobile ? '14px' : '15px',
                    color: 'var(--theme-text-secondary)',
                    lineHeight: 1.7,
                  }}
                >
                  • Просматривайте аналитику регулярно, чтобы замечать закономерности в своем настроении
                </Text>
                <Text
                  style={{
                    fontSize: isMobile ? '14px' : '15px',
                    color: 'var(--theme-text-secondary)',
                    lineHeight: 1.7,
                  }}
                >
                  • Еженедельные и ежемесячные сводки помогут вам лучше понять свои эмоциональные паттерны
                </Text>
                <Text
                  style={{
                    fontSize: isMobile ? '14px' : '15px',
                    color: 'var(--theme-text-secondary)',
                    lineHeight: 1.7,
                  }}
                >
                  • Не забывайте про черновики - они автоматически сохраняются, так что вы не потеряете свои мысли
                </Text>
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Box>
    </Box>
  )
}

