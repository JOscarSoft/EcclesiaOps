import { Box, Button, Typography, Paper, IconButton } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../core/api';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { CouncilFormDialog } from './CouncilFormDialog';
import { useTranslation } from 'react-i18next';

export const CouncilsList = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedCouncil, setSelectedCouncil] = useState<any>(null);

  const { data: councils = [], isLoading, refetch } = useQuery({
    queryKey: ['councils'],
    queryFn: async () => {
      const { data } = await api.get('/platform/councils');
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/platform/councils/${id}`);
    },
    onSuccess: () => refetch()
  });

  const handleEdit = (council: any) => {
    setSelectedCouncil(council);
    setOpen(true);
  };

  const handleAdd = () => {
    setSelectedCouncil(null);
    setOpen(true);
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: t('councils.name'), flex: 1 },
    { field: 'domain', headerName: t('councils.domain'), flex: 1 },
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
    {
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
    }
  ];

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>{t('councils.title')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          {t('councils.newCouncil')}
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }} elevation={0}>
        <DataGrid
          rows={councils}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Paper>

      <CouncilFormDialog open={open} onClose={() => setOpen(false)} onSuccess={refetch} initialData={selectedCouncil} />
    </Box>
  );
};
