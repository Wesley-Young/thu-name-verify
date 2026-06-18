import { AppBar, Box, CssBaseline, createTheme, ThemeProvider, Toolbar, Typography } from '@mui/material';
import { Outlet } from 'react-router/internal/react-server-client';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f9f9f9',
    },
    text: {
      primary: 'rgba(0,0,0,0.825)',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant={'h6'} style={{ userSelect: 'none' }}>
            <b>NAME VERIFICATION</b>
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Toolbar />
        <Box id="detail" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
          <Outlet />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            justifyContent: 'center',
            paddingY: 1,
          }}
        >
          <Typography variant="caption">© {new Date().getFullYear()} Wesley-Young</Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
