import { createRoot } from 'react-dom/client'
import './index.css'
import { DataProvider } from './context/data.tsx'
import Main from './pages/main/main.tsx'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from './theme.ts'
import { CssBaseline } from '@mui/material'

createRoot(document.getElementById('root')!).render(
  <DataProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Main />
    </ThemeProvider>
  </DataProvider>
)


const setDocHeight = () => {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight / 100}px`);
};

setDocHeight();