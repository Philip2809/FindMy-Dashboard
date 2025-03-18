import { createTheme } from "@mui/material/styles";


export const theme = createTheme({
    palette: {
        primary: {
            main: '#39375B',
            contrastText: '#fff',
        },
        secondary: {
            main: '#0A2342',
        },
        text: {
            primary: '#fff',
            secondary: '#fff',
        },
        background: {
            default: '#39375B',
            paper: '#39375B',
        },
    }
});
