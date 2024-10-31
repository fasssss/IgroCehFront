import { createTheme } from "@mui/material/styles";
import styles from 'root/shared/default.module.scss';

//can be customized like on this Docs page https://mui.com/material-ui/customization/palette/
export const themes = createTheme({
  colorSchemes: {
    dark: true
  },
  palette: {
    mode: 'dark',
    primary: {
      main: styles.discordBluerple,
    },
    warning: {
      main: styles.yellow
    }
  },
  typography: {
    fontFamily: [
      'Akrobat',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});
