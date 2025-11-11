import { MantineProvider, createTheme } from '@mantine/core'
import LandingPage from './components/LandingPage'

const theme = createTheme({
  primaryColor: 'gray',
  defaultRadius: 0,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
})

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <LandingPage />
    </MantineProvider>
  )
}

export default App

