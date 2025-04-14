import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';

interface ApplicationStatus {
  id: number;
  application_name: string;
  status: string;
  last_check: string;
}

const ApplicationStatus: React.FC = () => {
  const [statuses, setStatuses] = useState<ApplicationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/application-status`);
        setStatuses(response.data.statuses);
      } catch (err) {
        console.error('Error fetching application statuses:', err);
        setError('Nie udało się pobrać statusów aplikacji. Spróbuj odświeżyć stronę.');
        
        // Fallback data for development
        setStatuses([
          {
            id: 1,
            application_name: 'Panel Finansowy',
            status: 'online',
            last_check: new Date().toISOString()
          },
          {
            id: 2,
            application_name: 'Panel Budowy',
            status: 'online',
            last_check: new Date().toISOString()
          },
          {
            id: 3,
            application_name: 'Panel Grafik',
            status: 'online',
            last_check: new Date().toISOString()
          },
          {
            id: 4,
            application_name: 'Panel Odzież i Sprzęt',
            status: 'offline',
            last_check: new Date().toISOString()
          },
          {
            id: 5,
            application_name: 'Panel Samochody',
            status: 'online',
            last_check: new Date().toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
    
    // Refresh status every 30 seconds
    const intervalId = setInterval(fetchStatuses, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading && statuses.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Status Podpiętych Aplikacji
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {statuses.map((status) => (
            <Grid item xs={12} sm={6} md={4} key={status.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderLeft: status.status === 'online' ? '4px solid #4caf50' : '4px solid #f44336'
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" component="div">
                      {status.application_name}
                    </Typography>
                    <Chip 
                      icon={status.status === 'online' ? <CheckCircleIcon /> : <ErrorIcon />}
                      label={status.status === 'online' ? 'Online' : 'Offline'}
                      color={status.status === 'online' ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Ostatnie sprawdzenie: {new Date(status.last_check).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Typography variant="caption" color="text.secondary">
            Dane odświeżane automatycznie co 30 sekund
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ApplicationStatus;
