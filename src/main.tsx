import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { themes } from './shared/themes';
import { router } from './shared/router';
import { Provider } from 'react-redux';
import { store } from './shared/store';
import './shared/localization';
import './shared/helpers/webSocketHelper';
import './index.css';

const socket = new WebSocket('wss://igroceh.xyz:60444/api/ws');

setTimeout(() => {console.log(socket)}, 2000)

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <ThemeProvider theme={themes}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>,
)
