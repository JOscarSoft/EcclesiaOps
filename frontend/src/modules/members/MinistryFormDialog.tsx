import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Box, Typography, Stack
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const MinistryFormDialog = ({
  open, onClose, onSuccess, initialData
}: { open: boolean; onClose: () => void; onSuccess: () => void; initialData?: any }) => {
  const { t } = useTranslation();

  const schema = useMemo(() => z.object({
    name: z.string().min(1, t('common.required')),
    description: z.string().optional(),
    leader: z.string().optional().or(z.literal('')),
  }), [t]);

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', leader: '' }
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initialData?.name || '',
        description: initialData?.description || '',
        leader: initialData?.leader?._id || initialData?.leader || '',
      });
    }
  }, [open, initialData, reset]);

  // Query for members to select a leader
  const { data: members = [] } = useQuery({
    queryKey: ['members-list-simple'],
    queryFn: async () => (await api.get('/tenant/members')).data,
    enabled: open
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload = { ...data };
      if (!payload.leader) delete payload.leader;
      
      if (initialData?._id) return api.put(`/tenant/ministries/${initialData._id}`, payload);
      return api.post('/tenant/ministries', payload);
    },
    onSuccess: () => {
      reset();
      onSuccess();
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {initialData ? t('ministries.editMinistry') : t('ministries.newMinistry')}
      </DialogTitle>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <TextField
              size="small"
              label={t('ministries.name')}
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name')}
            />
            
            <TextField
              size="small"
              label={t('ministries.description')}
              fullWidth
              multiline
              rows={3}
              {...register('description')}
            />

            <Controller
              name="leader"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  size="small"
                  label={t('ministries.leader')}
                  fullWidth
                  {...field}
                  value={field.value || ''}
                >
                  <MenuItem value="">{t('common.none') || 'Ninguno'}</MenuItem>
                  {members.map((m: any) => (
                    <MenuItem key={m._id} value={m._id}>
                      {m.firstName} {m.lastName}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
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
