import { Box, Typography, Paper, Grid, Stack, CircularProgress, Tabs, Tab } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { FinanceTransactions } from './FinanceTransactions';
import { FinanceCategories } from './FinanceCategories';

import { SEO } from '../../components/common/SEO';

export const FinanceDashboard = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const { data: balance, isLoading } = useQuery({
    queryKey: ['finance-balance', currentMonth, currentYear],
    queryFn: async () => (await api.get(`/tenant/finance/stats/balance?month=${currentMonth}&year=${currentYear}`)).data,
  });

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
  };

  const SummaryCard = ({ title, amount, icon, color }: any) => (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}.50`, color: `${color}.main`, display: 'flex' }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {formatCurrency(amount)}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );

  return (
    <Box component="main">
      <SEO title={t('finance.title')} />
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>{t('finance.dashboard')}</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <SummaryCard 
            title={t('finance.income')} 
            amount={balance?.totalIncome || 0} 
            icon={<TrendingUpIcon />} 
            color="success" 
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard 
            title={t('finance.expense')} 
            amount={balance?.expenses || 0} 
            icon={<TrendingDownIcon />} 
            color="error" 
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard 
            title={t('finance.balance')} 
            amount={balance?.netBalance || 0} 
            icon={<AccountBalanceWalletIcon />} 
            color="primary" 
          />
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
          <Tab label={t('finance.transactions')} />
          <Tab label={t('finance.categories')} />
        </Tabs>
      </Box>

      {tabValue === 0 && <FinanceTransactions />}
      {tabValue === 1 && <FinanceCategories />}
    </Box>
  );
};
