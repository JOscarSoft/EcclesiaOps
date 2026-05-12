import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip, Stack, Button, TextField, MenuItem } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/format';
import { DateField } from '../../components/common/DateField';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { useAuthStore } from '../../stores/authStore';
import { TransactionFormDialog } from './TransactionFormDialog';


export const FinanceTransactions = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const today = new Date();
  const firstOfMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  const lastOfMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;
  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(lastOfMonth);
  const [churchFilter, setChurchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [kindFilter, setKindFilter] = useState('');
  const [open, setOpen] = useState(false);

  const { user } = useAuthStore();

  const canManage = user?.role === 'SUPER_ADMIN' || user?.permissions?.includes('MANAGE_FINANCE');

  const { data: churches = [] } = useQuery({
    queryKey: ['churches'],
    queryFn: async () => (await api.get('/tenant/churches')).data,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['finance-categories'],
    queryFn: async () => (await api.get('/tenant/finance/categories')).data,
  });

  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['finance-transactions', fromDate, toDate, churchFilter, categoryFilter, kindFilter],
    queryFn: async () => {
      const params: any = {};
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      if (churchFilter) params.church = churchFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (kindFilter) params.kind = kindFilter;
      return (await api.get('/tenant/finance/transactions', { params })).data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tenant/finance/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance-balance'] });
    },
  });

  const exportToCSV = () => {
    if (!transactions || !transactions.length) return;
    const headers = ['Fecha', 'Categoría', 'Iglesia', 'Tipo', 'Monto', 'Miembro', 'Descripción'].join(',');
    const rows = transactions.map((t: any) => [
      formatDate(t.date),
      t.category?.name || 'N/A',
      t.church?.name || t('finance.council'),
      t.kind === 'Expense' ? 'Gasto' : 'Ingreso',
      t.amount,
      t.member ? `${t.member.firstName} ${t.member.lastName}` : 'N/A',
      t.description || ''
    ].join(',')).join('\n');

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transacciones_${formatDate(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <DateField
          label="Desde"
          size="small"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          sx={{
            '& .MuiInputLabel-root': { transform: 'translate(14px, -9px) scale(0.75)', bgcolor: 'background.paper', px: 0.5 },
            '& .MuiInputBase-input': { color: 'text.primary' }
          }}
        />
        <DateField
          label="Hasta"
          size="small"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          sx={{
            '& .MuiInputLabel-root': { transform: 'translate(14px, -9px) scale(0.75)', bgcolor: 'background.paper', px: 0.5 },
            '& .MuiInputBase-input': { color: 'text.primary' }
          }}
        />
        <TextField
          select
          label="Iglesia"
          size="small"
          value={churchFilter}
          onChange={(e) => setChurchFilter(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Todas</MenuItem>
          <MenuItem value="__null__">{t('finance.council')}</MenuItem>
          {churches.map((c: any) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
        </TextField>
        <TextField
          select
          label="Categoría"
          size="small"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {categories.map((c: any) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
        </TextField>
        <TextField
          select
          label="Tipo"
          size="small"
          value={kindFilter}
          onChange={(e) => setKindFilter(e.target.value)}
          sx={{ minWidth: 130 }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="Income">Ingreso</MenuItem>
          <MenuItem value="Expense">Egreso</MenuItem>
        </TextField>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={exportToCSV}
          disabled={!transactions?.length}
        >
          Exportar CSV
        </Button>
        {(fromDate !== firstOfMonth || toDate !== lastOfMonth || churchFilter || categoryFilter || kindFilter) && (
          <Button size="small" onClick={() => { setFromDate(firstOfMonth); setToDate(lastOfMonth); setChurchFilter(''); setCategoryFilter(''); setKindFilter(''); }}>
            Limpiar
          </Button>
        )}
      </Stack>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        {canManage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            {t('finance.newTransaction')}
          </Button>
        )}
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, elevation: 0, border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>{t('finance.date')}</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>{t('finance.category')}</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>{t('finance.church')}</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>{t('finance.type')}</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>{t('finance.amount')}</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>{t('menu.members')}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} align="center">Cargando...</TableCell></TableRow>
            ) : transactions?.map((transaction: any) => (
              <TableRow key={transaction._id} hover>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>{transaction.category?.name}</TableCell>
                <TableCell>{transaction.church?.name || t('finance.council')}</TableCell>
                <TableCell>
                  <Chip
                    label={transaction.kind === 'Expense' ? 'Egreso' : 'Ingreso'}
                    size="small"
                    color={transaction.kind === 'Expense' ? 'error' : 'success'}
                    variant="filled"
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(transaction.amount)}</TableCell>
                <TableCell>
                  {transaction.member ? `${transaction.member.firstName} ${transaction.member.lastName}` : '--'}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title={t('common.delete')}>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => {
                        if (window.confirm(t('common.confirmDelete'))) {
                          deleteMutation.mutate(transaction._id);
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TransactionFormDialog open={open} onClose={() => setOpen(false)} onSuccess={refetch} />
    </Box>
  );
};
