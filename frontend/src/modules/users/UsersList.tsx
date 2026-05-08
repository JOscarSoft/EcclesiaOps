import { Box, Button, Typography, Paper, IconButton } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../core/api';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { UserFormDialog } from './UserFormDialog';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from 'react-i18next';
import { SEO } from '../../components/common/SEO';

export const UsersList = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { user } = useAuthStore();

  const canManageUsers = user?.role === 'SUPER_ADMIN' || user?.permissions?.includes('MANAGE_USERS');

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/tenant/users');
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/tenant/users/${id}`);
    },
    onSuccess: () => refetch()
  });

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setOpen(true);
  };

  const columns: GridColDef[] = [
    { field: 'firstName', headerName: t('users.firstName'), flex: 1 },
    { field: 'lastName', headerName: t('users.lastName'), flex: 1 },
    { field: 'email', headerName: t('users.email'), flex: 1 },
    {
      field: 'role',
      headerName: t('users.role'),
      width: 150,
      renderCell: (params) => params.value?.name || '-'
    },
    {
      field: 'church',
      headerName: t('users.church'),
      width: 200,
      renderCell: (params) => params.value?.name || t('users.globalCouncil')
    },
    {
      field: 'isActive',
      headerName: t('common.status'),
      width: 120,
      renderCell: (params) => (
        <Typography color={params.value ? 'success.main' : 'error.main'} sx={{ fontWeight: 600 }}>
          {params.value ? t('common.active') : t('common.inactive')}
        </Typography>
      )
    }
  ];

  if (canManageUsers) {
    columns.push({
      field: 'actions',
      headerName: t('common.actions'),
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton color="primary" onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => deleteMutation.mutate(params.row._id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    });
  }

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <SEO title={t('users.title')} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>{t('users.title')}</Typography>
        {canManageUsers && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            {t('users.newUser')}
          </Button>
        )}
      </Box>

      <Paper sx={{ height: 600, width: '100%' }} elevation={0}>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Paper>

      <UserFormDialog open={open} onClose={() => setOpen(false)} onSuccess={refetch} initialData={selectedUser} />
    </Box>
  );
};
