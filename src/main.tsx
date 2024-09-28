import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { themes } from './shared/themes'
import { ApplicationRoutes } from './shared/routes'
import { Provider } from 'react-redux'
import { store } from './shared/store'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={themes}>
        <BrowserRouter>
          <CssBaseline />
          <ApplicationRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
