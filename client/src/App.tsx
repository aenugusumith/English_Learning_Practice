import React, { useEffect, useMemo, useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Typography,
  Switch,
  FormControlLabel,
  Box,
  Paper,
  Grid,
} from '@mui/material';

import MicRecorder from './components/MicRecorder';
import SessionList from './components/SessionList';
import FluencyChart from './components/FluencyChart';
import DailyPrompt from './components/DailyPrompt';
import ReminderForm from './components/ReminderForm';

interface Session {
  id: number;
  transcript: string;
  created_at: string;
  feedback?: string;
  fluency_score?: number;
  prompt?: string;
}

const App: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Toggle MUI Theme
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode]
  );

  // Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/sessions');
        const data = await res.json();
        setSessions(data);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      }
    };

    fetchSessions();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 2 } }}>
        <Container maxWidth="xl">
          {/* Header Section */}
          <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
            <Grid>
              <Typography 
                variant="h4"
                fontWeight="bold"
                sx={{ 
                  fontSize: { 
                    xs: '1.5rem',
                    sm: '2rem',
                    md: '2.125rem'
                  }
                }}
              >
                🧠 English Speaking Practice
              </Typography>

            </Grid>
            <Grid>
              <FormControlLabel
                control={
                  <Switch
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                  />
                }
                label="🌙 Dark Mode"
              />
            </Grid>
          </Grid>

          {/* Main Dashboard Grid */}
          <Grid container spacing={2}>
            {/* LEFT: Recorder + Prompt + Waveform */}
            <Grid size={{ xs: 8, md: 4 }}>
              <Box display="flex" flexDirection="column" gap={3}>
                <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
                  <DailyPrompt onUsePrompt={setSelectedPrompt} />
                </Paper>

                <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
                  <MicRecorder selectedPrompt={selectedPrompt || undefined} />
                </Paper>

                <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
                  <ReminderForm />
                </Paper>
              </Box>
            </Grid>

            {/* RIGHT: Chart + History */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Box display="flex" flexDirection="column" gap={3}>
                <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
                  <FluencyChart sessions={sessions} />
                </Paper>

                <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
                  <SessionList sessions={sessions} />
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;