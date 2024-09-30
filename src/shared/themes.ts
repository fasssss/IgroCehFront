import { createTheme } from "@mui/material/styles";
import AkrobatRegular from "root/assets/AkrobatFont/Akrobat-Regular.ttf"

//can be customized like on this Docs page https://mui.com/material-ui/customization/palette/
export const themes = createTheme({
  colorSchemes: {
    dark: true
  },
  palette: {
    mode: 'dark',
  },
  typography: {
    fontFamily: [
      'AkrobatRegular',
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
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'AkrobatRegular';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: local('AkrobatRegular'), local('Akrobat-Regular'), url(${AkrobatRegular}) format('ttf');
        }
      `,
    },
  },
});
