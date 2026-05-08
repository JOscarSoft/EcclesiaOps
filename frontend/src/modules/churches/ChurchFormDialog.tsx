import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
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
  }), [t]);

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData || { name: '', address: '', phone: '', email: '' }
  });

  useEffect(() => {
    if (open) {
      reset(initialData || { name: '', address: '', phone: '', email: '' });
    }
  }, [open, initialData, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (initialData?._id) {
        return api.put(`/tenant/churches/${initialData._id}`, data);
      }
      return api.post('/tenant/churches', data);
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
