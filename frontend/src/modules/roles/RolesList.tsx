import { Box, Button, Typography, Paper, IconButton } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../core/api';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { RoleFormDialog } from './RoleFormDialog';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from 'react-i18next';
import { SEO } from '../../components/common/SEO';

export const RolesList = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const { user } = useAuthStore();

  const canManageRoles = user?.role === 'SUPER_ADMIN' || user?.permissions?.includes('MANAGE_ROLES');

  const { data: roles = [], isLoading, refetch } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data } = await api.get('/tenant/roles');
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/tenant/roles/${id}`);
    },
    onSuccess: () => refetch()
  });

  const handleEdit = (role: any) => {
    setSelectedRole(role);
    setOpen(true);
  };

  const handleAdd = () => {
    setSelectedRole(null);
    setOpen(true);
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: t('roles.roleName'), flex: 1 },
    {
      field: 'permissions',
      headerName: t('roles.permissions'),
      flex: 2,
      renderCell: (params) => {
        const perms = params.value || [];
        return perms.map((p: any) => p.description || p.name).join(', ');
      }
    },
  ];

  if (canManageRoles) {
    columns.push({
      field: 'actions',
      headerName: t('common.actions'),
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton color="primary" onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          {params.row.name !== 'ADMIN' && (
            <IconButton color="error" onClick={() => deleteMutation.mutate(params.row._id)}>
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      )
    });
  }

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <SEO title={t('roles.title')} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>{t('roles.title')}</Typography>
        {canManageRoles && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            {t('roles.newRole')}
          </Button>
        )}
      </Box>

      <Paper sx={{ height: 600, width: '100%' }} elevation={0}>
        <DataGrid
          rows={roles}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Paper>

      <RoleFormDialog open={open} onClose={() => setOpen(false)} onSuccess={refetch} initialData={selectedRole} />
    </Box>
  );
};
