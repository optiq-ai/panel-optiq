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
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface Group {
  id: number;
  name: string;
  description: string;
}

const GroupManagement: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/groups`);
        setGroups(response.data.groups);
      } catch (err) {
        console.error('Error fetching groups:', err);
        setError('Nie udało się pobrać grup. Spróbuj odświeżyć stronę.');
        
        // Fallback data for development
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

    fetchGroups();
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
      description: ''
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (group: Group) => {
    setDialogMode('edit');
    setCurrentGroup(group);
    setFormData({
      name: group.name,
      description: group.description || ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentGroup(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (dialogMode === 'add') {
        // Create new group
        await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/groups`, formData);
        setSuccessMessage('Grupa została dodana pomyślnie');
      } else {
        // Update existing group
        if (currentGroup) {
          await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/groups/${currentGroup.id}`, formData);
          setSuccessMessage('Grupa została zaktualizowana pomyślnie');
        }
      }
      
      // Refresh group list
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/groups`);
      setGroups(response.data.groups);
      
      handleCloseDialog();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error saving group:', err);
      setError('Nie udało się zapisać grupy. Spróbuj ponownie.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (group: Group) => {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setGroupToDelete(null);
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    
    try {
      setLoading(true);
      
      // Check if it's a default group
      if (['prezes', 'dyspozytorki', 'instalatorzy', 'kadry'].includes(groupToDelete.name)) {
        setError('Nie można usunąć domyślnej grupy systemowej');
        setTimeout(() => {
          setError('');
        }, 3000);
        handleCloseDeleteDialog();
        return;
      }
      
      await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/groups/${groupToDelete.id}`);
      
      // Update group list
      setGroups(groups.filter(group => group.id !== groupToDelete.id));
      setSuccessMessage('Grupa została usunięta pomyślnie');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting group:', err);
      setError('Nie udało się usunąć grupy. Spróbuj ponownie.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setLoading(false);
      handleCloseDeleteDialog();
    }
  };

  if (loading && groups.length === 0) {
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
            Zarządzanie Grupami
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Dodaj Grupę
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
          <Table sx={{ minWidth: 650 }} aria-label="groups table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nazwa</TableCell>
                <TableCell>Opis</TableCell>
                <TableCell>Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>{group.id}</TableCell>
                    <TableCell>{group.name}</TableCell>
                    <TableCell>{group.description}</TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenEditDialog(group)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(group)}
                        size="small"
                        disabled={['prezes', 'dyspozytorki', 'instalatorzy', 'kadry'].includes(group.name)}
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
          count={groups.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Wierszy na stronę:"
        />
      </Paper>

      {/* Add/Edit Group Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Dodaj Nową Grupę' : 'Edytuj Grupę'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Nazwa grupy"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
            disabled={dialogMode === 'edit' && ['prezes', 'dyspozytorki', 'instalatorzy', 'kadry'].includes(currentGroup?.name || '')}
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
            rows={3}
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
            Czy na pewno chcesz usunąć grupę {groupToDelete?.name}? Tej operacji nie można cofnąć.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Anuluj</Button>
          <Button onClick={handleDeleteGroup} color="error" variant="contained">
            Usuń
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroupManagement;
