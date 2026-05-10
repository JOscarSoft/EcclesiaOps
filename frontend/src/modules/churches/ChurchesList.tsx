import { Box, Button, Typography, Paper, IconButton } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../core/api';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ChurchFormDialog } from './ChurchFormDialog';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from 'react-i18next';
import { SEO } from '../../components/common/SEO';

export const ChurchesList = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState<any>(null);
  const { user } = useAuthStore();
  const canManageChurches = user?.role === 'SUPER_ADMIN' || user?.permissions?.includes('MANAGE_CHURCHES');

  const { data: churches = [], isLoading, refetch } = useQuery({
    queryKey: ['churches'],
    queryFn: async () => {
      const { data } = await api.get('/tenant/churches');
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/tenant/churches/${id}`);
    },
    onSuccess: () => refetch()
  });

  const handleEdit = (church: any) => {
    setSelectedChurch(church);
    setOpen(true);
  };

  const handleAdd = () => {
    setSelectedChurch(null);
    setOpen(true);
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: t('churches.name'), flex: 1 },
    { field: 'address', headerName: t('churches.address'), flex: 1 },
    { field: 'pastor', headerName: t('churches.pastor'), flex: 1, valueGetter: (value: any) => value ? `${value.firstName} ${value.lastName}` : '—' },
    {
      field: 'isActive',
      headerName: t('common.status'),
      width: 120,
      renderCell: (params) => (
        <Typography color={params.value ? 'success.main' : 'error.main'} sx={{ fontWeight: 600 }}>
          {params.value ? t('common.active') : t('common.inactive')}
        </Typography>
      )
    },
  ];

  if (canManageChurches) {
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
      <SEO title={t('churches.title')} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>{t('churches.title')}</Typography>
        {canManageChurches && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            {t('churches.newChurch')}
          </Button>
        )}
      </Box>

      <Paper sx={{ height: 600, width: '100%' }} elevation={0}>
        <DataGrid
          rows={churches}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Paper>

      <ChurchFormDialog open={open} onClose={() => setOpen(false)} onSuccess={refetch} initialData={selectedChurch} />
    </Box>
  );
};
