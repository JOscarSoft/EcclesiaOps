import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Stack
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { DateTimeField } from '../../components/common/DateTimeField';

export const ActivityFormDialog = ({
  open, onClose, onSuccess, initialData
}: { open: boolean; onClose: () => void; onSuccess: () => void; initialData?: any }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isEditing = !!initialData?._id;

  const schema = useMemo(() => z.object({
    title: z.string().min(1, t('common.required')),
    description: z.string().optional(),
    startDate: z.string().min(1, t('common.required')),
    endDate: z.string().min(1, t('common.required')),
    location: z.string().optional(),
    activityType: z.string().min(1, t('common.required')),
    church: z.string().optional(),
  }), [t]);

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          title: initialData.title,
          description: initialData.description || '',
          startDate: new Date(initialData.startDate).toISOString(),
          endDate: new Date(initialData.endDate).toISOString(),
          location: initialData.location || '',
          activityType: initialData.activityType?._id || initialData.activityType || '',
          church: initialData.church?._id || initialData.church || '',
        });
      } else {
        reset({
          title: '',
          description: '',
          activityType: '',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 3600000).toISOString(),
          church: user?.churchId || ''
        });
      }
    }
  }, [open, reset, user, initialData]);

  const { data: churches = [] } = useQuery({
    queryKey: ['churches'],
    queryFn: async () => (await api.get('/tenant/churches')).data,
  });

  const { data: activityTypes = [] } = useQuery({
    queryKey: ['activity-types'],
    queryFn: async () => (await api.get('/tenant/activities/types')).data,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = { ...data, church: data.church || null };
      if (isEditing) {
        return api.put(`/tenant/activities/${initialData._id}`, payload);
      }
      return api.post('/tenant/activities', payload);
    },
    onSuccess: () => { onSuccess(); onClose(); },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEditing ? t('activities.editActivity') : t('activities.newActivity')}
      </DialogTitle>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField
              label={t('activities.activityTitle')}
              fullWidth
              {...register('title')}
              error={!!errors.title}
            />

            <Controller
              name="church"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label={t('finance.church')}
                  fullWidth
                  {...field}
                  error={!!errors.church}
                  disabled={!!user?.churchId}
                >
                  {!user?.churchId && <MenuItem value="">{t('activities.councilEvent')}</MenuItem>}
                  {churches.map((c: any) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                </TextField>
              )}
            />

            <Stack direction="row" spacing={2}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DateTimeField size="small" label={t('activities.startDate')} sx={{ flex: 1 }} {...field} />
                )}
              />
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <DateTimeField size="small" label={t('activities.endDate')} sx={{ flex: 1 }} {...field} />
                )}
              />
            </Stack>

            <Controller
              name="activityType"
              control={control}
              render={({ field }) => (
                <TextField select label={t('activities.type')} fullWidth {...field} error={!!errors.activityType}>
                  {activityTypes.map((type: any) => (
                    <MenuItem key={type._id} value={type._id}>{type.name}</MenuItem>
                  ))}
                </TextField>
              )}
            />

            <TextField label={t('activities.location')} fullWidth {...register('location')} />
            <TextField label={t('activities.description')} multiline rows={3} fullWidth {...register('description')} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
