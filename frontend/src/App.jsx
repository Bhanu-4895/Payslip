import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import AddEmployee from './pages/AddEmployee';
import SearchPayslip from './pages/SearchPayslip';
import ViewEmployees from './pages/ViewEmployees';
import EditEmployee from './pages/EditEmployee';
import QuickGenerate from './pages/QuickGenerate';
import logo from './assets/logo.jpeg';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a365d', // Deep corporate blue
      light: '#2b6cb0',
      dark: '#0f172a',
    },
    secondary: {
      main: '#e2e8f0', // Soft cool grey
      dark: '#cbd5e1',
      contrastText: '#0f172a',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        }
      }
    }
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppBar position="sticky" sx={{ mb: 4, backgroundColor: 'primary.dark', boxShadow: 3 }} className="hide-on-print">
          <Toolbar sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box component="img" src={logo} alt="Company Logo" sx={{ height: 60, mr: 2, borderRadius: 1 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', letterSpacing: 1, color: '#fff' }}>
                  NR SOFTECH (I) PVT.LTD.
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2 }}>
                  Payslip Generating System
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" component={Link} to="/" sx={{ border: '1px solid rgba(255,255,255,0.2)' }}>Search & Generate</Button>
              <Button color="inherit" component={Link} to="/employees" sx={{ border: '1px solid rgba(255,255,255,0.2)' }}>Employee Directory</Button>
              <Button color="inherit" component={Link} to="/add" sx={{ border: '1px solid rgba(255,255,255,0.2)' }}>Add Employee</Button>
              <Button color="inherit" component={Link} to="/quick" sx={{ border: '1px solid rgba(255,255,255,0.2)' }}>Quick Generator</Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 1, md: 3 } }}>
          <Routes>
            <Route path="/" element={<SearchPayslip />} />
            <Route path="/add" element={<AddEmployee />} />
            <Route path="/employees" element={<ViewEmployees />} />
            <Route path="/edit/:id" element={<EditEmployee />} />
            <Route path="/quick" element={<QuickGenerate />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
