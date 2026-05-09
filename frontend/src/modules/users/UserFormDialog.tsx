import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';

export const UserFormDialog = ({ open, onClose, onSuccess, initialData }: { open: boolean, onClose: () => void, onSuccess: () => void, initialData?: any }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const schema = useMemo(() => z.object({
    firstName: z.string().min(1, t('common.required')),
    lastName: z.string().min(1, t('common.required')),
    username: z.string().min(1, t('common.required')),
    email: z.string().email(t('common.invalidEmail')).optional().or(z.literal('')),
    password: z.string().optional(),
    role: z.string().min(1, t('common.required')),
    church: z.string().optional().or(z.literal('')),
  }), [t]);

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      reset({
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        username: initialData?.username || '',
        email: initialData?.email || '',
        password: '',
        role: initialData?.role?._id || '',
        church: user?.churchId || initialData?.church?._id || '',
      });
    }
  }, [open, initialData, reset]);

  const { data: roles = [] } = useQuery({
    queryKey: ['tenant-roles'],
    queryFn: async () => (await api.get('/tenant/roles')).data,
  });

  const { data: churches = [] } = useQuery({
    queryKey: ['churches'],
    queryFn: async () => (await api.get('/tenant/churches')).data
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload: any = { ...data };
      if (!payload.email) delete payload.email;
      if (!payload.church) delete payload.church;
      if (!payload.password) delete payload.password;

      if (initialData?._id) {
        return api.put(`/tenant/users/${initialData._id}`, payload);
      }
      return api.post('/tenant/users', payload);
    },
    onSuccess: () => {
      reset();
      onSuccess();
      onClose();
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? t('users.editUser') : t('users.newUser')}</DialogTitle>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <DialogContent dividers>
          <TextField margin="dense" label={t('users.firstName')} fullWidth error={!!errors.firstName} helperText={errors.firstName?.message} {...register('firstName')} />
          <TextField margin="dense" label={t('users.lastName')} fullWidth error={!!errors.lastName} helperText={errors.lastName?.message} {...register('lastName')} />
          <TextField margin="dense" label={t('users.username')} fullWidth error={!!errors.username} helperText={errors.username?.message} {...register('username')} />
          <TextField margin="dense" label={t('users.email')} fullWidth error={!!errors.email} helperText={errors.email?.message} {...register('email')} />
          <TextField margin="dense" label={initialData ? t('users.newPassword') : t('users.password')} type="password" fullWidth error={!!errors.password} helperText={errors.password?.message} {...register('password')} />

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <TextField select margin="dense" label={t('users.role')} fullWidth error={!!errors.role} helperText={errors.role?.message} {...field}>
                {roles.map((r: any) => <MenuItem key={r._id} value={r._id}>{r.name}</MenuItem>)}
              </TextField>
            )}
          />

          <Controller
            name="church"
            control={control}
            render={({ field }) => (
              <TextField select disabled={user?.churchId ? true : false} margin="dense" label={t('users.church')} fullWidth error={!!errors.church} helperText={errors.church?.message} {...field}>
                <MenuItem value="">{t('users.none')}</MenuItem>
                {churches.map((c: any) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
              </TextField>
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>{mutation.isPending ? t('common.saving') : t('common.save')}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
