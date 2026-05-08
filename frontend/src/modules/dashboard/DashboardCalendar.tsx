import { Box, Typography, Paper, Stack, Chip, Divider, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from 'react-i18next';
import EventIcon from '@mui/icons-material/Event';
import BusinessIcon from '@mui/icons-material/Business';
import ChurchIcon from '@mui/icons-material/Church';

export const DashboardCalendar = () => {
  const { t } = useTranslation();
  
  const { user } = useAuthStore();
  
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities-dashboard'],
    queryFn: async () => {
      const from = new Date().toISOString();
      const to = new Date();
      to.setFullYear(to.getFullYear() + 1);
      const toStr = to.toISOString();

      const baseParams = `from=${from}&to=${toStr}`;
      const url = !user?.churchId 
        ? `/tenant/activities?onlyCouncil=true&${baseParams}` 
        : `/tenant/activities?${baseParams}`;
        
      const resp = await api.get(url);
      return resp.data;
    },
  });

  if (isLoading) return <CircularProgress />;

  // Group by month
  const grouped = activities.reduce((acc: any, act: any) => {
    const date = new Date(act.startDate);
    const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(act);
    return acc;
  }, {});

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <EventIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{t('activities.title')}</Typography>
      </Stack>

      <Box sx={{ maxHeight: 600, overflowY: 'auto', pr: 1 }}>
        {Object.keys(grouped).length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            {t('activities.noActivities')}
          </Typography>
        ) : (
          Object.entries(grouped).map(([month, acts]: [string, any]) => (
            <Box key={month} sx={{ mb: 3 }}>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
                {month}
              </Typography>
              <Stack spacing={2}>
                {acts.map((activity: any) => (
                  <Paper 
                    key={activity._id} 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      borderRadius: 3, 
                      transition: '0.2s',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ 
                        textAlign: 'center', 
                        minWidth: 50, 
                        p: 1, 
                        borderRadius: 2, 
                        bgcolor: 'primary.main', 
                        color: 'white' 
                      }}>
                        <Typography variant="h6" sx={{ lineHeight: 1, fontWeight: 700 }}>
                          {new Date(activity.startDate).getDate()}
                        </Typography>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', fontSize: 10 }}>
                          {new Date(activity.startDate).toLocaleString('default', { weekday: 'short' })}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {activity.title}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(activity.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                          <Divider orientation="vertical" flexItem sx={{ height: 10, my: 'auto' }} />
                          {activity.church ? (
                            <Chip 
                              icon={<ChurchIcon sx={{ fontSize: '14px !important' }} />} 
                              label={activity.church.name} 
                              size="small" 
                              variant="outlined"
                              sx={{ height: 20, fontSize: 10 }}
                            />
                          ) : (
                            <Chip 
                              icon={<BusinessIcon sx={{ fontSize: '14px !important' }} />} 
                              label={t('activities.councilEvent')} 
                              size="small" 
                              color="secondary"
                              sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                            />
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>
          ))
        )}
      </Box>
    </Paper>
  );
};
