import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface Panel {
  id: number;
  name: string;
  description: string;
  icon: string;
  url: string;
  is_active: boolean;
}

interface Group {
  id: number;
  name: string;
  description: string;
}

const PanelManagement: React.FC = () => {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [currentPanel, setCurrentPanel] = useState<Panel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    url: '',
    is_active: true,
    groups: [] as number[]
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [panelToDelete, setPanelToDelete] = useState<Panel | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [panelsResponse, groupsResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/panels`),
          axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/groups`)
        ]);
        
        setPanels(panelsResponse.data.panels);
        setGroups(groupsResponse.data.groups);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Nie udało się pobrać danych. Spróbuj odświeżyć stronę.');
        
        // Fallback data for development
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
        
        setGroups([
          { id: 1, name: 'prezes', description: 'Grupa administratorów z pełnym dostępem' },
          { id: 2, name: 'dyspozytorki', description: 'Grupa z dostępem do grafiku' },
          { id: 3, name: 'instalatorzy', description: 'Grupa instalatorów' },
          { id: 4, name: 'kadry', description: 'Grupa kadr' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setFormData({
      name: '',
      description: '',
      icon: '',
      url: '',
      is_active: true,
      groups: []
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (panel: Panel) => {
    setDialogMode('edit');
    setCurrentPanel(panel);
    
    // Fetch panel groups
    const fetchPanelGroups = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/panels/${panel.id}/groups`);
        const groupIds = response.data.groups.map((g: Group) => g.id);
        
        setFormData({
          name: panel.name,
          description: panel.description || '',
          icon: panel.icon || '',
          url: panel.url || '',
          is_active: panel.is_active,
          groups: groupIds
        });
      } catch (err) {
        console.error('Error fetching panel groups:', err);
        // Fallback for development
        setFormData({
          name: panel.name,
          description: panel.description || '',
          icon: panel.icon || '',
          url: panel.url || '',
          is_active: panel.is_active,
          groups: panel.name === 'Panel Grafik' ? [1, 2] : [1] // Prezes and dyspozytorki for Panel Grafik, only prezes for others
        });
      }
    };
    
    fetchPanelGroups();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentPanel(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      is_active: e.target.checked
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (dialogMode === 'add') {
        // Create new panel
        await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/panels`, formData);
        setSuccessMessage('Panel został dodany pomyślnie');
      } else {
        // Update existing panel
        if (currentPanel) {
          await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/panels/${currentPanel.id}`, formData);
          setSuccessMessage('Panel został zaktualizowany pomyślnie');
        }
      }
      
      // Refresh panel list
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/panels`);
      setPanels(response.data.panels);
      
      handleCloseDialog();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error saving panel:', err);
      setError('Nie udało się zapisać panelu. Spróbuj ponownie.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (panel: Panel) => {
    setPanelToDelete(panel);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPanelToDelete(null);
  };

  const handleDeletePanel = async () => {
    if (!panelToDelete) return;
    
    try {
      setLoading(true);
      await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/panels/${panelToDelete.id}`);
      
      // Update panel list
      setPanels(panels.filter(panel => panel.id !== panelToDelete.id));
      setSuccessMessage('Panel został usunięty pomyślnie');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting panel:', err);
      setError('Nie udało się usunąć panelu. Spróbuj ponownie.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setLoading(false);
      handleCloseDeleteDialog();
    }
  };

  if (loading && panels.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            Zarządzanie Panelami
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Dodaj Panel
          </Button>
        </Box>
        
        {successMessage && (
          <Alert severity="success" sx={{ mx: 2, mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="panels table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nazwa</TableCell>
                <TableCell>Opis</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Aktywny</TableCell>
                <TableCell>Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {panels
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((panel) => (
                  <TableRow key={panel.id}>
                    <TableCell>{panel.id}</TableCell>
                    <TableCell>{panel.name}</TableCell>
                    <TableCell>{panel.description}</TableCell>
                    <TableCell>{panel.url}</TableCell>
                    <TableCell>
                      <Switch 
                        checked={panel.is_active} 
                        disabled 
                        color="primary" 
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenEditDialog(panel)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(panel)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={panels.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Wierszy na stronę:"
        />
      </Paper>

      {/* Add/Edit Panel Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Dodaj Nowy Panel' : 'Edytuj Panel'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Nazwa panelu"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Opis"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={2}
          />
          <TextField
            margin="dense"
            name="url"
            label="URL aplikacji"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.url}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="icon"
            label="Ścieżka do ikony"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.icon}
            onChange={handleInputChange}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={handleSwitchChange}
                name="is_active"
                color="primary"
              />
            }
            label="Aktywny"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === 'add' ? 'Dodaj' : 'Zapisz'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Potwierdź usunięcie</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Czy na pewno chcesz usunąć panel {panelToDelete?.name}? Tej operacji nie można cofnąć.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Anuluj</Button>
          <Button onClick={handleDeletePanel} color="error" variant="contained">
            Usuń
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PanelManagement;
