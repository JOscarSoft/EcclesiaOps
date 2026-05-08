import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip, Stack, TextField, Button } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { useAuthStore } from '../../stores/authStore';
import { TransactionFormDialog } from './TransactionFormDialog';


export const FinanceTransactions = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [open, setOpen] = useState(false);

  const { user } = useAuthStore();

  const canManage = user?.role === 'SUPER_ADMIN' || user?.permissions?.includes('MANAGE_FINANCE');

  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['finance-transactions', fromDate, toDate],
    queryFn: async () => (await api.get('/tenant/finance/transactions', {
      params: { from: fromDate, to: toDate }
    })).data,
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
    const headers = ['Fecha', 'Categoría', 'Tipo', 'Monto', 'Miembro', 'Descripción'].join(',');
    const rows = transactions.map((t: any) => [
      new Date(t.date).toLocaleDateString(),
      t.category?.name || 'N/A',
      t.kind === 'Expense' ? 'Gasto' : 'Ingreso',
      t.amount,
      t.member ? `${t.member.firstName} ${t.member.lastName}` : 'N/A',
      t.description || ''
    ].join(',')).join('\n');

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transacciones_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
        <TextField
          label="Desde"
          type="date"
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          sx={{
            '& .MuiInputLabel-root': { transform: 'translate(14px, -9px) scale(0.75)', bgcolor: 'background.paper', px: 0.5 },
            '& .MuiInputBase-input': { color: 'text.primary' }
          }}
        />
        <TextField
          label="Hasta"
          type="date"
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          sx={{
            '& .MuiInputLabel-root': { transform: 'translate(14px, -9px) scale(0.75)', bgcolor: 'background.paper', px: 0.5 },
            '& .MuiInputBase-input': { color: 'text.primary' }
          }}
        />
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={exportToCSV}
          disabled={!transactions?.length}
        >
          Exportar CSV
        </Button>
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
              <TableCell sx={{ fontWeight: 800 }}>{t('finance.type')}</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>{t('finance.amount')}</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>{t('menu.members')}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} align="center">Cargando...</TableCell></TableRow>
            ) : transactions?.map((transaction: any) => (
              <TableRow key={transaction._id} hover>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell>{transaction.category?.name}</TableCell>
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
