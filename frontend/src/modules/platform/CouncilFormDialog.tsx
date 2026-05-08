import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const CouncilFormDialog = ({ open, onClose, onSuccess, initialData }: { open: boolean, onClose: () => void, onSuccess: () => void, initialData?: any }) => {
  const { t } = useTranslation();

  const schema = useMemo(() => z.object({
    name: z.string().min(1, t('common.required')),
    domain: z.string().min(3, t('common.required')).regex(/^[a-z0-9-]+$/, t('councils.domainRegex')),
    adminEmail: z.string().email(t('common.invalidEmail')).optional(),
    adminPassword: z.string().min(6, t('councils.min6chars')).optional(),
  }), [t]);

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', domain: '', adminEmail: '', adminPassword: '' }
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initialData?.name || '',
        domain: initialData?.domain || '',
        adminEmail: '',
        adminPassword: '',
      });
    }
  }, [open, initialData, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (initialData?._id) {
        return api.put(`/platform/councils/${initialData._id}`, { name: data.name, domain: data.domain });
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
