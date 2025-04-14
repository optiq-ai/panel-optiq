import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  CardActionArea,
  Box,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Panel {
  id: number;
  name: string;
  description: string;
  icon: string;
  url: string;
  is_active: boolean;
}

const PanelGrid: React.FC = () => {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchPanels = async () => {
      try {
        setLoading(true);
        // Fetch panels assigned to user's groups
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/panels/user`);
        setPanels(response.data.panels);
      } catch (err) {
        console.error('Error fetching panels:', err);
        setError('Nie udało się pobrać paneli. Spróbuj odświeżyć stronę.');
        
        // Fallback to default panels for development
        setPanels([
          {
            id: 1,
            name: 'Panel Finansowy',
            description: 'Panel do zarządzania finansami',
            icon: '/icons/finance.svg',
            url: '/finance',
            is_active: true
          },
          {
            id: 2,
            name: 'Panel Budowy',
            description: 'Panel do zarządzania budowami',
            icon: '/icons/construction.svg',
            url: '/construction',
            is_active: true
          },
          {
            id: 3,
            name: 'Panel Grafik',
            description: 'Panel do zarządzania grafikiem',
            icon: '/icons/schedule.svg',
            url: '/schedule',
            is_active: true
          },
          {
            id: 4,
            name: 'Panel Odzież i Sprzęt',
            description: 'Panel do zarządzania odzieżą i sprzętem',
            icon: '/icons/equipment.svg',
            url: '/equipment',
            is_active: true
          },
          {
            id: 5,
            name: 'Panel Samochody',
            description: 'Panel do zarządzania samochodami',
            icon: '/icons/cars.svg',
            url: '/cars',
            is_active: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPanels();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Filter panels based on user groups
  const filteredPanels = panels.filter(panel => {
    // If user is in prezes group, show all panels
    if (user?.groups.includes('prezes')) return true;
    
    // For dyspozytorki, show only Panel Grafik
    if (user?.groups.includes('dyspozytorki')) {
      return panel.name === 'Panel Grafik';
    }
    
    // For other groups, filter based on specific needs
    // This is a placeholder and should be replaced with actual logic
    return true;
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={4}>
        {filteredPanels.map((panel) => (
          <Grid item xs={12} sm={6} md={4} key={panel.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                },
              }}
            >
              <CardActionArea sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                <CardMedia
                  component="div"
                  sx={{
                    height: 140,
                    backgroundColor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Placeholder for icon - in production would use actual icons */}
                  <Typography variant="h1" color="white" align="center">
                    {panel.name.charAt(0)}
                  </Typography>
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {panel.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {panel.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PanelGrid;
