import { Box, Typography, Grid, Paper, Stack, CircularProgress, Button, IconButton, Tooltip as MuiTooltip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';
import ChurchIcon from '@mui/icons-material/Church';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { SEO } from '../../components/common/SEO';
import { formatDate } from '../../utils/format';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const ExecutiveDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isCouncil = !user?.churchId;

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['stats-summary'],
    queryFn: async () => (await api.get('/tenant/stats/summary')).data,
  });

  const { data: trends, isLoading: loadingTrends } = useQuery({
    queryKey: ['stats-trends'],
    queryFn: async () => (await api.get('/tenant/stats/finance-trends')).data,
  });

  const { data: demographics, isLoading: loadingDemo } = useQuery({
    queryKey: ['stats-demo'],
    queryFn: async () => (await api.get('/tenant/stats/member-demographics')).data,
  });

  const { data: categories, isLoading: loadingCat } = useQuery({
    queryKey: ['stats-categories'],
    queryFn: async () => (await api.get('/tenant/stats/finance-categories')).data,
  });

  const { data: churches, isLoading: loadingChurches } = useQuery({
    queryKey: ['stats-churches'],
    queryFn: async () => (await api.get('/tenant/stats/finance-churches')).data,
    enabled: isCouncil,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || !data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => {
      return Object.values(row).map(val => {
        if (typeof val === 'object') return JSON.stringify(val);
        return val;
      }).join(',');
    }).join('\n');
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const now = formatDate(new Date());

    doc.setFontSize(20);
    doc.text(`Reporte Ejecutivo EcclesiaOps`, 14, 22);
    doc.setFontSize(10);
    doc.text(`${t('analytics.generatedAt')}: ${now} | ${t('analytics.periodLastYear')}`, 14, 30);

    // Resumen KPIs
    doc.setFontSize(14);
    doc.text(t('analytics.executiveSummary'), 14, 45);
    autoTable(doc, {
      startY: 50,
      head: [[t('analytics.metrics'), t('analytics.value')]],
      body: [
        [`${t('menu.members')} (${t('analytics.periodLastYear')})`, summary?.members?.total || '0'],
        [t('finance.income'), formatCurrency(summary?.finance?.income)],
        [t('finance.expense'), formatCurrency(summary?.finance?.expenses)],
        [t('finance.balance'), formatCurrency(summary?.finance?.balance)],
        [t('menu.churches'), summary?.churches?.total || '0']
      ],
    });

    // Tendencias
    doc.addPage();
    doc.text(t('analytics.financialTrend'), 14, 22);
    autoTable(doc, {
      startY: 30,
      head: [['Período', t('finance.income'), t('finance.expense')]],
      body: trends?.map((t: any) => [
        `${t._id.month}/${t._id.year}`,
        formatCurrency(t.income),
        formatCurrency(t.expenses)
      ]) || [],
    });

    // Categorías
    doc.addPage();
    doc.text(t('analytics.categoryDistribution'), 14, 22);
    autoTable(doc, {
      startY: 30,
      head: [[t('finance.category'), t('finance.type'), t('finance.amount')]],
      body: categories?.map((c: any) => [
        c._id,
        c.type === 'Expense' ? t('finance.expense') : t('finance.income'),
        formatCurrency(c.total)
      ]) || [],
    });

    if (isCouncil && churches) {
      doc.addPage();
      doc.text(t('analytics.churchPerformance'), 14, 22);
      autoTable(doc, {
        startY: 30,
        head: [[t('finance.church'), t('finance.income'), t('finance.expense')]],
        body: churches.map((c: any) => [
          c._id,
          formatCurrency(c.income),
          formatCurrency(c.expenses)
        ]),
      });
    }

    doc.save(`reporte_ejecutivo_${now}.pdf`);
  };

  if (loadingSummary || loadingTrends || loadingDemo || loadingCat || (isCouncil && loadingChurches)) {
     return (
       <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
         <CircularProgress />
       </Box>
     );
  }

  const trendData = trends?.map((t: any) => ({
    name: `${t._id.month}/${t._id.year}`,
    income: t.income,
    expenses: t.expenses,
  })) || [];

  const genderData = demographics?.[0]?.byGender.map((g: any) => ({
    name: g._id === 'MALE' ? t('members.male') : g._id === 'FEMALE' ? t('members.female') : 'N/A',
    value: g.count
  })) || [];

  const categoryData = categories?.map((c: any) => ({
    name: c._id,
    value: c.total,
    type: c.type
  })) || [];

  const churchData = churches?.map((c: any) => ({
    ...c,
    _id: c._id || t('finance.council'),
  })) || [];

  return (
    <Box component="main">
      <SEO title={t('analytics.title')} />
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', sx: { alignItems: 'center' } }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{t('analytics.title')}</Typography>
          <Typography color="text.secondary">{t('analytics.subtitle')}</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<PictureAsPdfIcon />}
            onClick={generatePDF}
          >
            {t('analytics.generatePDF')}
          </Button>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 4, position: 'relative' }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'primary.light', color: 'primary.main' }}>
                <GroupsIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{summary?.members.total || 0}</Typography>
                <Typography variant="caption" color="text.secondary">{t('menu.members')} ({t('analytics.periodLastYear')})</Typography>
              </Box>
            </Stack>
            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
              <MuiTooltip title={t('analytics.downloadDetail')}>
                <IconButton size="small" onClick={() => exportToCSV([{ total: summary?.members.total }], 'total_miembros')}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </MuiTooltip>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 4, position: 'relative' }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'success.light', color: 'success.main' }}>
                <TrendingUpIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatCurrency(summary?.finance.income)}</Typography>
                <Typography variant="caption" color="text.secondary">{t('finance.income')}</Typography>
              </Box>
            </Stack>
            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
              <MuiTooltip title={t('analytics.downloadDetail')}>
                <IconButton size="small" onClick={() => exportToCSV(trendData, 'tendencias_ingresos')}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </MuiTooltip>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 4, position: 'relative' }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'error.light', color: 'error.main' }}>
                <AccountBalanceWalletIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatCurrency(summary?.finance.expenses)}</Typography>
                <Typography variant="caption" color="text.secondary">{t('finance.expense')}</Typography>
              </Box>
            </Stack>
            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
              <MuiTooltip title={t('analytics.downloadDetail')}>
                <IconButton size="small" onClick={() => exportToCSV(categoryData, 'gastos_por_categoria')}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </MuiTooltip>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Finance Trends */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{t('analytics.financialTrend')}</Typography>
              <IconButton size="small" onClick={() => exportToCSV(trendData, 'tendencia_financiera')}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                  <Legend />
                  <Area type="monotone" dataKey="income" stroke="#82ca9d" fillOpacity={1} fill="url(#colorIncome)" name={t('finance.income')} />
                  <Area type="monotone" dataKey="expenses" stroke="#8884d8" fillOpacity={1} fill="url(#colorExpenses)" name={t('finance.expense')} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Demographics */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{t('analytics.genderDistribution')}</Typography>
              <IconButton size="small" onClick={() => exportToCSV(genderData, 'demografia_genero')}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderData.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Categories Bar Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{t('analytics.categoryDistribution')}</Typography>
              <Stack direction="row" spacing={1}>
                <IconButton size="small" onClick={() => exportToCSV(categoryData, 'detalle_categorias')}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
                <CategoryIcon color="disabled" />
              </Stack>
            </Stack>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.type === 'Expense' ? '#FF8042' : '#00C49F'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Church Breakdown (Council Only) */}
        {isCouncil && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{t('analytics.churchPerformance')}</Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" onClick={() => exportToCSV(churchData, 'detalle_iglesias')}>
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                  <ChurchIcon color="disabled" />
                </Stack>
              </Stack>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={churchData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                    <Legend />
                    <Bar dataKey="income" fill="#82ca9d" name={t('finance.income')} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#8884d8" name={t('finance.expense')} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Growth Bar Chart */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>{t('analytics.membershipGrowth')}</Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demographics?.[0]?.growth.map((g: any) => ({ name: `${g._id.month}/${g._id.year}`, count: g.count })) || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} name={t('analytics.newMembers')} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
