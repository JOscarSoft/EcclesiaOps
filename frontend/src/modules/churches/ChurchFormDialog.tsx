import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const ChurchFormDialog = ({ open, onClose, onSuccess, initialData }: { open: boolean, onClose: () => void, onSuccess: () => void, initialData?: any }) => {
  const { t } = useTranslation();

  const schema = useMemo(() => z.object({
    name: z.string().min(1, t('common.required')),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email(t('common.invalidEmail')).optional().or(z.literal('')),
    pastor: z.string().optional().or(z.literal('')),
  }), [t]);

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', address: '', phone: '', email: '', pastor: '' }
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initialData?.name || '',
        address: initialData?.address || '',
        phone: initialData?.phone || '',
        email: initialData?.email || '',
        pastor: initialData?.pastor?._id || '',
      });
    }
  }, [open, initialData, reset]);

  const { data: members = [] } = useQuery({
    queryKey: ['members', initialData?._id],
    queryFn: async () => {
      const params = initialData?._id ? `?church=${initialData._id}` : '';
      const { data } = await api.get(`/tenant/members${params}`);
      return data;
    },
    enabled: !!initialData?._id,
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload: any = { ...data };
      if (!payload.pastor) delete payload.pastor;
      if (initialData?._id) {
        return api.put(`/tenant/churches/${initialData._id}`, payload);
      }
      return api.post('/tenant/churches', payload);
    },
    onSuccess: () => {
      reset();
      onSuccess();
      onClose();
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? t('churches.editChurch') : t('churches.newChurch')}</DialogTitle>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <DialogContent dividers>
          <TextField autoFocus margin="dense" label={t('churches.name')} fullWidth error={!!errors.name} helperText={errors.name?.message} {...register('name')} />
          <TextField margin="dense" label={t('churches.address')} fullWidth {...register('address')} />
          <TextField margin="dense" label={t('churches.phone')} fullWidth {...register('phone')} />
          <TextField margin="dense" label={t('churches.email')} fullWidth error={!!errors.email} helperText={errors.email?.message} {...register('email')} />
          {initialData?._id && (
            <Controller
              name="pastor"
              control={control}
              render={({ field }) => (
                <TextField select margin="dense" label={t('churches.pastor')} fullWidth {...field} value={field.value || ''}>
                  <MenuItem value="">—</MenuItem>
                  {members.map((m: any) => (
                    <MenuItem key={m._id} value={m._id}>
                      {m.firstName} {m.lastName}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}
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
