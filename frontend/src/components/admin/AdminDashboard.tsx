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
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';

interface DashboardStats {
  users: number;
  groups: number;
  panels: number;
  online_apps: number;
  offline_apps: number;
}

interface RecentUser {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

interface RecentPanel {
  id: number;
  name: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentPanels, setRecentPanels] = useState<RecentPanel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/admin/stats`);
        setStats(response.data.stats);
        setRecentUsers(response.data.recent_users);
        setRecentPanels(response.data.recent_panels);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError('Nie udało się pobrać statystyk. Spróbuj odświeżyć stronę.');
        
        // Fallback data for development
        setStats({
          users: 10,
          groups: 4,
          panels: 5,
          online_apps: 4,
          offline_apps: 1
        });
        
        setRecentUsers([
          {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            username: 'dyspozytor',
            email: 'dyspozytor@example.com',
            created_at: new Date().toISOString()
          }
        ]);
        
        setRecentPanels([
          {
            id: 1,
            name: 'Panel Finansowy',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Panel Budowy',
            created_at: new Date().toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleCheckStatus = async () => {
    try {
      setCheckingStatus(true);
      setStatusMessage('');
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/admin/check-status`);
      
      setStatusMessage('Statusy aplikacji zostały zaktualizowane pomyślnie');
      
      // Refresh stats
      const statsResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/admin/stats`);
      setStats(statsResponse.data.stats);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setStatusMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error checking application status:', err);
      setError('Nie udało się sprawdzić statusów aplikacji. Spróbuj ponownie.');
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setCheckingStatus(false);
    }
  };

  if (loading && !stats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Panel Administratora
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {statusMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {statusMessage}
        </Alert>
      )}
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5">{stats?.users || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">Użytkowników</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <GroupIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5">{stats?.groups || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">Grup</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <DashboardIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5">{stats?.panels || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">Paneli</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box display="flex" flexDirection="column" alignItems="center" mr={2}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="body2" color="success.main">{stats?.online_apps || 0}</Typography>
                </Box>
                <Box display="flex" flexDirection="column" alignItems="center" mr={2}>
                  <ErrorIcon color="error" />
                  <Typography variant="body2" color="error.main">{stats?.offline_apps || 0}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Status Aplikacji</Typography>
                  <Button 
                    size="small" 
                    onClick={handleCheckStatus}
                    disabled={checkingStatus}
                    sx={{ mt: 1 }}
                  >
                    {checkingStatus ? 'Sprawdzanie...' : 'Sprawdź teraz'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Ostatnio dodani użytkownicy
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {recentUsers.map((user) => (
                <ListItem key={user.id}>
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={user.username} 
                    secondary={
                      <>
                        {user.email}
                        <br />
                        Dodano: {new Date(user.created_at).toLocaleString()}
                      </>
                    } 
                  />
                </ListItem>
              ))}
              {recentUsers.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  Brak ostatnio dodanych użytkowników
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Ostatnio dodane panele
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {recentPanels.map((panel) => (
                <ListItem key={panel.id}>
                  <ListItemAvatar>
                    <Avatar>
                      <DashboardIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={panel.name} 
                    secondary={`Dodano: ${new Date(panel.created_at).toLocaleString()}`} 
                  />
                </ListItem>
              ))}
              {recentPanels.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  Brak ostatnio dodanych paneli
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
