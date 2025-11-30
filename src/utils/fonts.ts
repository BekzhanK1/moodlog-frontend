export type FontFamily = 
  | 'system'
  | 'serif'
  | 'monospace'
  | 'georgia'
  | 'times'
  | 'courier'
  | 'arial'
  | 'helvetica'
  | 'verdana'
  | 'trebuchet'
  | 'comic-sans'
  | 'impact'
  | 'inter'
  | 'playfair'
  | 'merriweather'
  | 'lora'
  | 'open-sans'
  | 'raleway'
  | 'montserrat'
  | 'source-serif'
  | 'crimson'
  | 'poppins'
  | 'work-sans'
  | 'space-mono'
  | 'jetbrains-mono'
  | 'cormorant'
  | 'libre-baskerville'
  | 'pt-serif'

export interface FontOption {
  value: FontFamily
  label: string
  fontFamily: string
}

export const fontOptions: FontOption[] = [
  {
    value: 'system',
    label: 'Системный',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  {
    value: 'serif',
    label: 'С засечками',
    fontFamily: 'Georgia, "Times New Roman", serif',
  },
  {
    value: 'monospace',
    label: 'Моноширинный',
    fontFamily: '"Courier New", Courier, monospace',
  },
  {
    value: 'georgia',
    label: 'Georgia',
    fontFamily: 'Georgia, serif',
  },
  {
    value: 'times',
    label: 'Times New Roman',
    fontFamily: '"Times New Roman", Times, serif',
  },
  {
    value: 'courier',
    label: 'Courier New',
    fontFamily: '"Courier New", Courier, monospace',
  },
  {
    value: 'arial',
    label: 'Arial',
    fontFamily: 'Arial, sans-serif',
  },
  {
    value: 'helvetica',
    label: 'Helvetica',
    fontFamily: 'Helvetica, Arial, sans-serif',
  },
  {
    value: 'verdana',
    label: 'Verdana',
    fontFamily: 'Verdana, sans-serif',
  },
  {
    value: 'trebuchet',
    label: 'Trebuchet MS',
    fontFamily: '"Trebuchet MS", sans-serif',
  },
  {
    value: 'comic-sans',
    label: 'Comic Sans MS',
    fontFamily: '"Comic Sans MS", cursive',
  },
  {
    value: 'impact',
    label: 'Impact',
    fontFamily: 'Impact, sans-serif',
  },
  // Designer fonts from Google Fonts
  {
    value: 'inter',
    label: 'Inter',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  {
    value: 'playfair',
    label: 'Playfair Display',
    fontFamily: '"Playfair Display", Georgia, serif',
  },
  {
    value: 'merriweather',
    label: 'Merriweather',
    fontFamily: '"Merriweather", Georgia, serif',
  },
  {
    value: 'lora',
    label: 'Lora',
    fontFamily: '"Lora", Georgia, serif',
  },
  {
    value: 'open-sans',
    label: 'Open Sans',
    fontFamily: '"Open Sans", Arial, sans-serif',
  },
  {
    value: 'raleway',
    label: 'Raleway',
    fontFamily: '"Raleway", Arial, sans-serif',
  },
  {
    value: 'montserrat',
    label: 'Montserrat',
    fontFamily: '"Montserrat", Arial, sans-serif',
  },
  {
    value: 'source-serif',
    label: 'Source Serif Pro',
    fontFamily: '"Source Serif Pro", Georgia, serif',
  },
  {
    value: 'crimson',
    label: 'Crimson Pro',
    fontFamily: '"Crimson Pro", Georgia, serif',
  },
  {
    value: 'poppins',
    label: 'Poppins',
    fontFamily: '"Poppins", Arial, sans-serif',
  },
  {
    value: 'work-sans',
    label: 'Work Sans',
    fontFamily: '"Work Sans", Arial, sans-serif',
  },
  {
    value: 'space-mono',
    label: 'Space Mono',
    fontFamily: '"Space Mono", "Courier New", monospace',
  },
  {
    value: 'jetbrains-mono',
    label: 'JetBrains Mono',
    fontFamily: '"JetBrains Mono", "Courier New", monospace',
  },
  {
    value: 'cormorant',
    label: 'Cormorant Garamond',
    fontFamily: '"Cormorant Garamond", Georgia, serif',
  },
  {
    value: 'libre-baskerville',
    label: 'Libre Baskerville',
    fontFamily: '"Libre Baskerville", Georgia, serif',
  },
  {
    value: 'pt-serif',
    label: 'PT Serif',
    fontFamily: '"PT Serif", Georgia, serif',
  },
]

const FONT_STORAGE_KEY = 'editor_font_family'

export function getEditorFont(): FontFamily {
  try {
    const saved = localStorage.getItem(FONT_STORAGE_KEY)
    if (saved && fontOptions.some(f => f.value === saved)) {
      return saved as FontFamily
    }
  } catch (error) {
    console.error('Failed to read font preference:', error)
  }
  return 'system' // Default
}

export function setEditorFont(font: FontFamily): void {
  try {
    localStorage.setItem(FONT_STORAGE_KEY, font)
  } catch (error) {
    console.error('Failed to save font preference:', error)
  }
}

export function getFontFamily(font: FontFamily): string {
  const option = fontOptions.find(f => f.value === font)
  return option?.fontFamily || fontOptions[0].fontFamily
}

