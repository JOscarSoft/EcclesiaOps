import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { DashboardCalendar } from './DashboardCalendar';
import GroupsIcon from '@mui/icons-material/Groups';
import ChurchIcon from '@mui/icons-material/Church';
import BusinessIcon from '@mui/icons-material/Business';

import { SEO } from '../../components/common/SEO';

export const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isCouncil = !user?.churchId && !isSuperAdmin;

  const { data: summary, isLoading } = useQuery({
    queryKey: [isSuperAdmin ? 'platform-stats' : 'stats-summary'],
    queryFn: async () => {
      const endpoint = isSuperAdmin ? '/platform/councils/stats/summary' : '/tenant/stats/summary';
      return (await api.get(endpoint)).data;
    },
  });

  return (
    <Box component="main">
      <SEO title={t('menu.dashboard')} />
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          {t('menu.dashboard')}
        </Typography>
        <Typography color="text.secondary">
          {isSuperAdmin ? 'Administrador Global' : `${user?.firstName} ${user?.lastName}`}
          {!isSuperAdmin && (user?.churchName ? ` | ${user.churchName}` : ' | Concilio Global')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Calendar - Only for tenant users, not for SuperAdmin (for now) */}
        {!isSuperAdmin && (
          <Grid size={{ xs: 12, md: 4 }}>
            <DashboardCalendar />
          </Grid>
        )}

        {/* Quick Stats */}
        <Grid size={{ xs: 12, md: isSuperAdmin ? 12 : 8 }}>
          <Grid container spacing={3}>
            {isSuperAdmin ? (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'primary.light', color: 'primary.main' }}>
                      <BusinessIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {isLoading ? <CircularProgress size={20} /> : summary?.totalCouncils || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Total Concilios</Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'success.light', color: 'success.main' }}>
                      <ChurchIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {isLoading ? <CircularProgress size={20} /> : summary?.totalChurches || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Total Iglesias Globales</Typography>
                    </Box>
                  </Paper>
                </Grid>
              </>
            ) : (
              <>
                <Grid size={{ xs: 12, sm: isCouncil ? 6 : 12 }}>
                  <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'primary.light', color: 'primary.main' }}>
                      <GroupsIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {isLoading ? <CircularProgress size={20} /> : summary?.members?.total || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{t('menu.members')}</Typography>
                    </Box>
                  </Paper>
                </Grid>

                {isCouncil && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'success.light', color: 'success.main' }}>
                        <ChurchIcon />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {isLoading ? <CircularProgress size={20} /> : summary?.churches?.total || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Iglesias</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
