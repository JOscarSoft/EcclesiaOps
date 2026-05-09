import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../core/api';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from 'react-i18next';

export const ChangePasswordDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [success, setSuccess] = useState(false);

  const schema = z.object({
    currentPassword: z.string().min(1, t('common.required')),
    newPassword: z.string().min(6, t('changePassword.minLength')),
    confirmPassword: z.string().min(1, t('common.required')),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t('changePassword.mismatch'),
    path: ['confirmPassword'],
  });

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const endpoint = user?.type === 'platform'
        ? '/platform/users/change-password'
        : '/tenant/users/change-password';
      return api.post(endpoint, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      setSuccess(true);
      reset();
    },
  });

  const handleClose = () => {
    setSuccess(false);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('changePassword.title')}</DialogTitle>
      {success ? (
        <>
          <DialogContent dividers>
            <Typography color="success.main" sx={{ textAlign: 'center', py: 2, fontWeight: 600 }}>
              {t('changePassword.success')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} variant="contained">{t('common.close')}</Button>
          </DialogActions>
        </>
      ) : (
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
          <DialogContent dividers>
            <TextField
              margin="dense"
              label={t('changePassword.currentPassword')}
              type="password"
              fullWidth
              error={!!errors.currentPassword}
              helperText={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <TextField
              margin="dense"
              label={t('changePassword.newPassword')}
              type="password"
              fullWidth
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <TextField
              margin="dense"
              label={t('changePassword.confirmPassword')}
              type="password"
              fullWidth
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            {mutation.isError && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {(mutation.error as any).response?.data?.message || (mutation.error as Error).message}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained" disabled={mutation.isPending}>
              {mutation.isPending ? t('common.saving') : t('common.save')}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
};
