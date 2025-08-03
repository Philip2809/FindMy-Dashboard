import { createRoot } from 'react-dom/client'
import './index.css'
import { DataProvider } from './context/data.tsx'
import Main from './pages/main/main.tsx'

createRoot(document.getElementById('root')!).render(
  <DataProvider>
      <Main />
  </DataProvider>
)
