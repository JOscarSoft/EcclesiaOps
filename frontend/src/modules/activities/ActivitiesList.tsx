import { Box, Button, Typography, Paper, Grid, Card, CardContent, Chip, IconButton, Tooltip, Stack, CircularProgress, TextField } from '@mui/material';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import FilterListIcon from '@mui/icons-material/FilterList';
import ChurchIcon from '@mui/icons-material/Church';
import BusinessIcon from '@mui/icons-material/Business';
import { ActivityFormDialog } from './ActivityFormDialog';
import { ActivityTypeDialog } from './ActivityTypeDialog';

export const ActivitiesList = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const canManage = user?.role === 'SUPER_ADMIN' || user?.permissions?.includes('MANAGE_ACTIVITIES');
  
  const [open, setOpen] = useState(false);
  const [openTypes, setOpenTypes] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  
  // Date filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data: activities = [], isLoading, refetch } = useQuery({
    queryKey: ['activities', fromDate, toDate],
    queryFn: async () => {
      let url = '/tenant/activities';
      const params = new URLSearchParams();
      if (fromDate) params.append('from', fromDate);
      if (toDate) params.append('to', toDate);
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      
      return (await api.get(url)).data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/tenant/activities/${id}`),
    onSuccess: () => refetch(),
  });

  const handleEdit = (activity: any) => {
    setSelectedActivity(activity);
    setOpen(true);
  };

  const handleCreate = () => {
    setSelectedActivity(null);
    setOpen(true);
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <CalendarMonthIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{t('activities.title')}</Typography>
          </Stack>
          {canManage && (
            <Stack direction="row" spacing={1}>
              <Tooltip title={t('activities.typeManagement')}>
                <IconButton onClick={() => setOpenTypes(true)} sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                {t('activities.newActivity')}
              </Button>
            </Stack>
          )}
        </Box>

        {/* Date Range Filters */}
        <Paper sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <FilterListIcon color="action" />
            <Typography variant="body2" sx={{ fontWeight: 700, mr: 1 }}>Filtros:</Typography>
          </Stack>
          <TextField 
            label="Desde" 
            type="date" 
            size="small" 
            value={fromDate} 
            onChange={(e) => setFromDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }} 
          />
          <TextField 
            label="Hasta" 
            type="date" 
            size="small" 
            value={toDate} 
            onChange={(e) => setToDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }} 
          />
          {(fromDate || toDate) && (
            <Button size="small" onClick={() => { setFromDate(''); setToDate(''); }}>
              Limpiar
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          {!fromDate && !toDate && (
            <Typography variant="caption" color="text.secondary">
              Mostrando solo actividades futuras por defecto.
            </Typography>
          )}
        </Paper>
      </Box>

      {activities.length === 0 ? (
        <Paper sx={{ p: 10, textAlign: 'center', borderRadius: 4, bgcolor: 'transparent', border: '2px dashed', borderColor: 'divider' }}>
          <Typography color="text.secondary">{t('activities.noActivities')}</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {activities.map((activity: any) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={activity._id}>
              <Card 
                onClick={() => canManage && handleEdit(activity)}
                sx={{ 
                  borderRadius: 4, 
                  height: '100%', 
                  transition: '0.3s', 
                  cursor: canManage ? 'pointer' : 'default',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } 
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                    <Chip 
                      label={activity.activityType?.name || 'Evento'} 
                      size="small" 
                      variant="filled" 
                      sx={{ fontWeight: 700, bgcolor: activity.activityType?.color || 'primary.light' }}
                    />
                    {!activity.church && (
                      <Chip 
                        label={t('activities.councilEvent')} 
                        size="small" 
                        color="secondary" 
                        variant="outlined" 
                        sx={{ fontWeight: 700, fontSize: 10 }}
                      />
                    )}
                    <Box sx={{ flex: 1 }} />
                    {canManage && (
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={(e) => {
                          e.stopPropagation(); // Evitar abrir el modal al borrar
                          if(window.confirm('¿Eliminar actividad?')) deleteMutation.mutate(activity._id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                  
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{activity.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{activity.description}</Typography>
                  
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <CalendarMonthIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {new Date(activity.startDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      {activity.church ? <ChurchIcon sx={{ fontSize: 18, color: 'text.secondary' }} /> : <BusinessIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
                      <Typography variant="body2" color="text.secondary">
                        {activity.church?.name || t('activities.councilEvent')}
                      </Typography>
                    </Stack>
                    {activity.location && (
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2">{activity.location}</Typography>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <ActivityFormDialog 
        open={open} 
        onClose={() => { setOpen(false); setSelectedActivity(null); }} 
        onSuccess={refetch} 
        initialData={selectedActivity} 
      />
      <ActivityTypeDialog open={openTypes} onClose={() => setOpenTypes(false)} />
    </Box>
  );
};
