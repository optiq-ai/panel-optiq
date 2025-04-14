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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  groups: string[];
}

interface Group {
  id: number;
  name: string;
  description: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    groups: [] as string[]
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersResponse, groupsResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/users`),
          axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/groups`)
        ]);
        
        setUsers(usersResponse.data.users);
        setGroups(groupsResponse.data.groups);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Nie udało się pobrać danych. Spróbuj odświeżyć stronę.');
        
        // Fallback data for development
        setUsers([
          {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            first_name: 'Admin',
            last_name: 'User',
            groups: ['prezes']
          },
          {
            id: 2,
            username: 'dyspozytor',
            email: 'dyspozytor@example.com',
            first_name: 'Dyspozytor',
            last_name: 'User',
            groups: ['dyspozytorki']
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
      username: '',
      password: '',
      email: '',
      first_name: '',
      last_name: '',
      groups: []
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (user: User) => {
    setDialogMode('edit');
    setCurrentUser(user);
    setFormData({
      username: user.username,
      password: '',
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      groups: user.groups || []
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentUser(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleGroupsChange = (event: any) => {
    setFormData({
      ...formData,
      groups: event.target.value as string[]
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (dialogMode === 'add') {
        // Create new user
        await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/users`, formData);
        setSuccessMessage('Użytkownik został dodany pomyślnie');
      } else {
        // Update existing user
        if (currentUser) {
          await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/users/${currentUser.id}`, formData);
          setSuccessMessage('Użytkownik został zaktualizowany pomyślnie');
        }
      }
      
      // Refresh user list
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/users`);
      setUsers(response.data.users);
      
      handleCloseDialog();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Nie udało się zapisać użytkownika. Spróbuj ponownie.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/users/${userToDelete.id}`);
      
      // Update user list
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setSuccessMessage('Użytkownik został usunięty pomyślnie');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Nie udało się usunąć użytkownika. Spróbuj ponownie.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setLoading(false);
      handleCloseDeleteDialog();
    }
  };

  if (loading && users.length === 0) {
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
            Zarządzanie Użytkownikami
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Dodaj Użytkownika
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
          <Table sx={{ minWidth: 650 }} aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nazwa użytkownika</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Imię</TableCell>
                <TableCell>Nazwisko</TableCell>
                <TableCell>Grupy</TableCell>
                <TableCell>Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.first_name}</TableCell>
                    <TableCell>{user.last_name}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {user.groups && user.groups.map((group) => (
                          <Chip 
                            key={group} 
                            label={group} 
                            size="small" 
                            color={group === 'prezes' ? 'primary' : 'default'} 
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenEditDialog(user)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(user)}
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
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Wierszy na stronę:"
        />
      </Paper>

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Dodaj Nowego Użytkownika' : 'Edytuj Użytkownika'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="username"
            label="Nazwa użytkownika"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.username}
            onChange={handleInputChange}
            disabled={dialogMode === 'edit'}
          />
          <TextField
            margin="dense"
            name="password"
            label={dialogMode === 'add' ? 'Hasło' : 'Nowe hasło (pozostaw puste, aby nie zmieniać)'}
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="first_name"
            label="Imię"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.first_name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="last_name"
            label="Nazwisko"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.last_name}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="groups-label">Grupy</InputLabel>
            <Select
              labelId="groups-label"
              multiple
              value={formData.groups}
              onChange={handleGroupsChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.name}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
            Czy na pewno chcesz usunąć użytkownika {userToDelete?.username}? Tej operacji nie można cofnąć.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Anuluj</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Usuń
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
