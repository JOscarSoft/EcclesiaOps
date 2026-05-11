import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Stack, ToggleButton, ToggleButtonGroup, InputAdornment
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useAuthStore } from '../../stores/authStore';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DateField } from '../../components/common/DateField';

export const TransactionFormDialog = ({
  open, onClose, onSuccess
}: { open: boolean; onClose: () => void; onSuccess: () => void }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const schema = useMemo(() => z.object({
    kind: z.enum(['Income', 'Expense']),
    amount: z.number().min(0.01, t('common.required')),
    date: z.string().min(1, t('common.required')),
    category: z.string().min(1, t('common.required')),
    description: z.string().optional(),
    church: z.string().optional(),
    // Specific fields
    member: z.string().optional(),
    method: z.string().optional(),
    recipient: z.string().optional(),
    referenceNumber: z.string().optional(),
  }), [t]);

  type FormValues = z.infer<typeof schema>;
  const { user } = useAuthStore();

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      kind: 'Income',
      amount: 0,
      date: new Date().toISOString().substring(0, 10),
      method: 'CASH',
      church: user?.churchId || ''
    }
  });

  const kind = watch('kind');
  const [amountFocused, setAmountFocused] = useState(false);

  useEffect(() => {
    if (open) {
      reset({
        kind: 'Income',
        amount: 0,
        date: new Date().toISOString().substring(0, 10),
        method: 'CASH',
        church: user?.churchId || ''
      });
    }
  }, [open, reset, user]);

  const { data: churches = [] } = useQuery({
    queryKey: ['churches'],
    queryFn: async () => (await api.get('/tenant/churches')).data,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['finance-categories', kind],
    queryFn: async () => (await api.get(`/tenant/finance/categories?type=${kind === 'Expense' ? 'EXPENSE' : 'INCOME'}`)).data,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members-simple'],
    queryFn: async () => (await api.get('/tenant/members')).data,
    enabled: kind === 'Income'
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => api.post('/tenant/finance/transactions', { ...data, church: data.church || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-balance'] });
      queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
      onSuccess();
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{t('finance.newTransaction')}</DialogTitle>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Controller
              name="kind"
              control={control}
              render={({ field }) => (
                <ToggleButtonGroup
                  fullWidth
                  color="primary"
                  value={field.value}
                  exclusive
                  onChange={(_, val) => val && field.onChange(val)}
                  size="small"
                >
                  <ToggleButton value="Income">{t('finance.income')}</ToggleButton>
                  <ToggleButton value="Expense">{t('finance.expenses')}</ToggleButton>
                </ToggleButtonGroup>
              )}
            />

            <Controller
              name="church"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label={t('finance.church') || t('churches.title')}
                  fullWidth
                  {...field}
                  error={!!errors.church}
                  disabled={!!user?.churchId}
                >
                  {!user?.churchId && <MenuItem value="">{t('finance.council')}</MenuItem>}
                  {churches.map((c: any) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                </TextField>
              )}
            />

            <Stack direction="row" spacing={2}>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => {
                  const formatted = field.value
                    ? new Intl.NumberFormat('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(field.value)
                    : '';
                  return (
                    <TextField
                      label={t('finance.amount')}
                      fullWidth
                      type="text"
                      value={amountFocused ? (field.value || '') : formatted}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9.]/g, '');
                        if (raw === '' || raw === '.') {
                          field.onChange(0);
                          return;
                        }
                        const num = parseFloat(raw);
                        if (!isNaN(num)) field.onChange(num);
                      }}
                      onFocus={() => setAmountFocused(true)}
                      onBlur={() => setAmountFocused(false)}
                      error={!!errors.amount}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">RD$</InputAdornment>,
                        },
                      }}
                    />
                  );
                }}
              />
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DateField label={t('finance.date')} fullWidth {...field} />
                )}
              />
            </Stack>

            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <TextField select label={t('finance.category')} fullWidth {...field} error={!!errors.category}>
                  {categories.map((c: any) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                </TextField>
              )}
            />

            <Controller
              name="method"
              control={control}
              render={({ field }) => (
                <TextField select label={t('finance.method')} fullWidth {...field}>
                  <MenuItem value="CASH">{t('finance.cash')}</MenuItem>
                  <MenuItem value="TRANSFER">{t('finance.transfer')}</MenuItem>
                  <MenuItem value="CHECK">{t('finance.check')}</MenuItem>
                </TextField>
              )}
            />

            {kind === 'Income' && (
              <Stack spacing={3}>
                <Controller
                  name="member"
                  control={control}
                  render={({ field }) => (
                    <TextField select label={t('finance.member')} fullWidth {...field}>
                      {members.map((m: any) => <MenuItem key={m._id} value={m._id}>{m.firstName} {m.lastName}</MenuItem>)}
                    </TextField>
                  )}
                />
              </Stack>
            )}

            {kind === 'Expense' && (
              <Stack spacing={3}>
                <TextField label={t('finance.recipient')} fullWidth {...register('recipient')} />
                <TextField label={t('finance.reference')} fullWidth {...register('referenceNumber')} />
              </Stack>
            )}

            <TextField label={t('finance.description')} multiline rows={2} fullWidth {...register('description')} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
