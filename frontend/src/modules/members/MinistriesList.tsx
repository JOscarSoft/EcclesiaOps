import { Box, Button, Typography, Paper, Tooltip, IconButton, Stack } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupsIcon from '@mui/icons-material/Groups';
import { MinistryFormDialog } from './MinistryFormDialog';
import { SEO } from '../../components/common/SEO';

export const MinistriesList = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const canManage = user?.role === 'SUPER_ADMIN' || user?.permissions?.includes('MANAGE_MINISTRIES');

  const [open, setOpen] = useState(false);
  const [selectedMinistry, setSelectedMinistry] = useState<any>(null);

  const { data: ministries = [], isLoading, refetch } = useQuery({
    queryKey: ['ministries'],
    queryFn: async () => (await api.get('/tenant/ministries')).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/tenant/ministries/${id}`),
    onSuccess: () => refetch(),
  });

  const columns: GridColDef[] = [
    { field: 'name', headerName: t('ministries.name'), flex: 1 },
    { field: 'description', headerName: t('ministries.description'), flex: 1.5 },
    {
      field: 'leader',
      headerName: t('ministries.leader'),
      flex: 1,
      valueGetter: (_val: any, row: any) =>
        row.leader ? `${row.leader.firstName} ${row.leader.lastName}` : '-',
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Box>
          {canManage && (
            <>
              <Tooltip title={t('common.edit')}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => { setSelectedMinistry(params.row); setOpen(true); }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('common.delete')}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de eliminar este ministerio?')) {
                      deleteMutation.mutate(params.row._id);
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <SEO title={t('ministries.title')} />
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <GroupsIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{t('ministries.title')}</Typography>
        </Stack>
        {canManage && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => { setSelectedMinistry(null); setOpen(true); }}
          >
            {t('ministries.newMinistry')}
          </Button>
        )}
      </Box>

      <Paper elevation={0} sx={{ height: 500, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <DataGrid
          rows={ministries}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          disableRowSelectionOnClick
          rowHeight={52}
          sx={{ border: 'none' }}
        />
      </Paper>

      <MinistryFormDialog
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={refetch}
        initialData={selectedMinistry}
      />
    </Box>
  );
};
