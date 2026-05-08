import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Box, Stack, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useAuthStore } from '../../stores/authStore';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const TransactionFormDialog = ({
  open, onClose, onSuccess
}: { open: boolean; onClose: () => void; onSuccess: () => void }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const schema = useMemo(() => z.object({
    kind: z.enum(['Tithe', 'Offering', 'Expense']),
    amount: z.number().min(0.01, t('common.required')),
    date: z.string().min(1, t('common.required')),
    category: z.string().min(1, t('common.required')),
    description: z.string().optional(),
    church: z.string().min(1, t('common.required')),
    // Specific fields
    member: z.string().optional(),
    method: z.string().optional(),
    type: z.string().optional(),
    recipient: z.string().optional(),
    referenceNumber: z.string().optional(),
  }), [t]);

  type FormValues = z.infer<typeof schema>;
  const { user } = useAuthStore();

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { 
      kind: 'Tithe', 
      amount: 0, 
      date: new Date().toISOString().substring(0, 10),
      method: 'CASH',
      type: 'GENERAL',
      church: user?.churchId || ''
    }
  });

  const kind = watch('kind');

  useEffect(() => { 
    if (open) {
      reset({
        kind: 'Tithe', 
        amount: 0, 
        date: new Date().toISOString().substring(0, 10),
        method: 'CASH',
        type: 'GENERAL',
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
    enabled: kind === 'Tithe'
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => api.post('/tenant/finance/transactions', data),
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
                  <ToggleButton value="Tithe">{t('finance.tithes')}</ToggleButton>
                  <ToggleButton value="Offering">{t('finance.offerings')}</ToggleButton>
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
                  disabled={!!user?.churchId} // Bloqueado si el usuario ya pertenece a una iglesia específica
                >
                  {churches.map((c: any) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                </TextField>
              )}
            />

            <Stack direction="row" spacing={2}>
              <TextField 
                label={t('finance.amount')} 
                type="number" 
                fullWidth 
                {...register('amount', { valueAsNumber: true })} 
                error={!!errors.amount} 
              />
              <TextField 
                label={t('finance.date')} 
                type="date" 
                fullWidth 
                slotProps={{ inputLabel: { shrink: true } }} 
                {...register('date')} 
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

            {kind === 'Tithe' && (
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
              </Stack>
            )}

            {kind === 'Offering' && (
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField select label={t('finance.type')} fullWidth {...field}>
                    <MenuItem value="GENERAL">{t('finance.general')}</MenuItem>
                    <MenuItem value="MISSION">{t('finance.mission')}</MenuItem>
                    <MenuItem value="CONSTRUCTION">{t('finance.construction')}</MenuItem>
                    <MenuItem value="SPECIAL">{t('finance.special')}</MenuItem>
                  </TextField>
                )}
              />
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
