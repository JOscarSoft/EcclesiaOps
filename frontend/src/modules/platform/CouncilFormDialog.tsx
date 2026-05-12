import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PhoneField } from '../../components/common/PhoneField';

export const CouncilFormDialog = ({ open, onClose, onSuccess, initialData }: { open: boolean, onClose: () => void, onSuccess: () => void, initialData?: any }) => {
  const { t } = useTranslation();

  const schema = useMemo(() => z.object({
    name: z.string().min(1, t('common.required')),
    domain: z.string().min(3, t('common.required')).regex(/^[a-z0-9-]+$/, t('councils.domainRegex')),
    phone: z.string().optional(),
    address: z.string().optional(),
    contactName: z.string().optional(),
    email: z.string().optional(),
    adminEmail: z.string().email(t('common.invalidEmail')).or(z.literal('')).optional(),
    adminPassword: z.string().min(6, t('councils.min6chars')).or(z.literal('')).optional(),
  }), [t]);

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', domain: '', phone: '', address: '', contactName: '', email: '', adminEmail: '', adminPassword: '' }
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initialData?.name || '',
        domain: initialData?.domain || '',
        phone: initialData?.phone || '',
        address: initialData?.address || '',
        contactName: initialData?.contactName || '',
        email: initialData?.email || '',
        adminEmail: '',
        adminPassword: '',
      });
    }
  }, [open, initialData, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (initialData?._id) {
        return api.put(`/platform/councils/${initialData._id}`, {
          name: data.name, domain: data.domain,
          phone: data.phone || undefined,
          address: data.address || undefined,
          contactName: data.contactName || undefined,
          email: data.email || undefined,
        });
      }
      return api.post('/platform/councils', data);
    },
    onSuccess: () => {
      reset();
      onSuccess();
      onClose();
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? t('councils.editCouncil') : t('councils.newCouncil')}</DialogTitle>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <DialogContent dividers>
          <Typography variant="subtitle2" color="primary" gutterBottom>{t('councils.details')}</Typography>
          <TextField
            autoFocus margin="dense" label={t('councils.institutionName')} fullWidth
            error={!!errors.name} helperText={errors.name?.message} {...register('name')}
          />
          <TextField
            margin="dense" label={t('councils.domain')} fullWidth
            error={!!errors.domain} helperText={errors.domain?.message} {...register('domain')}
          />
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneField margin="dense" label={t('councils.phone')} fullWidth {...field} />
            )}
          />
          <TextField
            margin="dense" label={t('councils.address')} fullWidth
            {...register('address')}
          />
          <TextField
            margin="dense" label={t('councils.contactName')} fullWidth
            {...register('contactName')}
          />
          <TextField
            margin="dense" label={t('councils.email')} fullWidth
            {...register('email')}
          />

          {!initialData && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>{t('councils.adminDetails')}</Typography>
              <TextField
                margin="dense" label={t('councils.adminEmail')} fullWidth
                error={!!errors.adminEmail} helperText={errors.adminEmail?.message} {...register('adminEmail')}
              />
              <TextField
                margin="dense" label={t('councils.adminPassword')} type="password" fullWidth
                error={!!errors.adminPassword} helperText={errors.adminPassword?.message} {...register('adminPassword')}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? t('councils.creating') : t('councils.saveProvision')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
