import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createTheme } from '@mantine/core'

export type ThemeName = 'light' | 'dark' | 'monkeytype' | 'nord' | 'dracula' | 'solarized' | 'gruvbox' | 'catppuccin'

// eslint-disable-next-line react-refresh/only-export-components
export interface ThemeConfig {
  name: ThemeName
  displayName: string
  colors: {
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    primary: string
    hover: string
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export const themes: Record<ThemeName, ThemeConfig> = {
  light: {
    name: 'light',
    displayName: 'Светлая',
    colors: {
      background: '#ffffff',
      surface: '#ffffff',
      text: '#000000',
      textSecondary: '#666666',
      border: '#eeeeee',
      primary: '#000000',
      hover: '#f9f9f9',
    },
  },
  dark: {
    name: 'dark',
    displayName: 'Темная',
    colors: {
      background: '#1a1a1a',
      surface: '#2a2a2a',
      text: '#ffffff',
      textSecondary: '#999999',
      border: '#333333',
      primary: '#ffffff',
      hover: '#333333',
    },
  },
  monkeytype: {
    name: 'monkeytype',
    displayName: 'Monkeytype',
    colors: {
      background: '#323437',
      surface: '#2c2e31',
      text: '#d1d0c5',
      textSecondary: '#646669',
      border: '#3c3f41',
      primary: '#e2b714',
      hover: '#3c3f41',
    },
  },
  nord: {
    name: 'nord',
    displayName: 'Nord',
    colors: {
      background: '#2e3440',
      surface: '#3b4252',
      text: '#eceff4',
      textSecondary: '#d8dee9',
      border: '#434c5e',
      primary: '#88c0d0',
      hover: '#434c5e',
    },
  },
  dracula: {
    name: 'dracula',
    displayName: 'Dracula',
    colors: {
      background: '#282a36',
      surface: '#343746',
      text: '#f8f8f2',
      textSecondary: '#6272a4',
      border: '#44475a',
      primary: '#bd93f9',
      hover: '#44475a',
    },
  },
  solarized: {
    name: 'solarized',
    displayName: 'Solarized',
    colors: {
      background: '#002b36',
      surface: '#073642',
      text: '#839496',
      textSecondary: '#586e75',
      border: '#073642',
      primary: '#b58900',
      hover: '#073642',
    },
  },
  gruvbox: {
    name: 'gruvbox',
    displayName: 'Gruvbox',
    colors: {
      background: '#282828',
      surface: '#3c3836',
      text: '#ebdbb2',
      textSecondary: '#a89984',
      border: '#504945',
      primary: '#fe8019',
      hover: '#504945',
    },
  },
  catppuccin: {
    name: 'catppuccin',
    displayName: 'Catppuccin',
    colors: {
      background: '#1e1e2e',
      surface: '#313244',
      text: '#cdd6f4',
      textSecondary: '#bac2de',
      border: '#45475a',
      primary: '#f38ba8',
      hover: '#45475a',
    },
  },
}

interface ThemeContextType {
  currentTheme: ThemeName
  themeConfig: ThemeConfig
  setTheme: (theme: ThemeName) => void
  mantineTheme: ReturnType<typeof createTheme>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('theme')
    return (saved as ThemeName) || 'light'
  })

  const themeConfig = themes[currentTheme]

  useEffect(() => {
    localStorage.setItem('theme', currentTheme)
    // Apply theme colors to document root for CSS variables
    const root = document.documentElement
    root.style.setProperty('--theme-bg', themeConfig.colors.background)
    root.style.setProperty('--theme-surface', themeConfig.colors.surface)
    root.style.setProperty('--theme-text', themeConfig.colors.text)
    root.style.setProperty('--theme-text-secondary', themeConfig.colors.textSecondary)
    root.style.setProperty('--theme-border', themeConfig.colors.border)
    root.style.setProperty('--theme-primary', themeConfig.colors.primary)
    root.style.setProperty('--theme-hover', themeConfig.colors.hover)
  }, [currentTheme, themeConfig])

  const mantineTheme = createTheme({
    primaryColor: 'gray',
    defaultRadius: 0,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    colors: {
      gray: [
        themeConfig.colors.background,
        themeConfig.colors.hover,
        themeConfig.colors.border,
        themeConfig.colors.textSecondary,
        themeConfig.colors.text,
        themeConfig.colors.text,
        themeConfig.colors.text,
        themeConfig.colors.text,
        themeConfig.colors.text,
        themeConfig.colors.text,
      ],
    },
  })

  const setTheme = (theme: ThemeName) => {
    setCurrentTheme(theme)
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeConfig,
        setTheme,
        mantineTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

