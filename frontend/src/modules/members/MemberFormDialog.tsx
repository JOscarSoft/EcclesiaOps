import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Checkbox, FormControlLabel, Box, Typography, Divider, Stack
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DateField } from '../../components/common/DateField';
import { useAuthStore } from '../../stores/authStore';

export const MemberFormDialog = ({
  open, onClose, onSuccess, initialData
}: { open: boolean; onClose: () => void; onSuccess: () => void; initialData?: any }) => {
  const { t } = useTranslation();

  const schema = useMemo(() => z.object({
    firstName: z.string().min(1, t('common.required')),
    lastName: z.string().min(1, t('common.required')),
    birthDate: z.string().optional().or(z.literal('')),
    gender: z.string().optional(),
    status: z.string().min(1, t('common.required')),
    baptized: z.boolean().optional(),
    baptismDate: z.string().optional().or(z.literal('')),
    joinDate: z.string().optional().or(z.literal('')),
    phone: z.string().optional(),
    email: z.string().email(t('common.invalidEmail')).optional().or(z.literal('')),
    address: z.string().optional(),
    church: z.string().optional().or(z.literal('')),
    ministries: z.array(z.string()).optional(),
    familyGroup: z.string().optional(),
    notes: z.string().optional(),
  }), [t]);

  type FormValues = z.infer<typeof schema>;

  const { user } = useAuthStore();
  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'ACTIVE', baptized: false, ministries: [] }
  });

  const baptized = watch('baptized');

  useEffect(() => {
    if (open) {
      reset({
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        birthDate: initialData?.birthDate ? initialData.birthDate.substring(0, 10) : '',
        gender: initialData?.gender || '',
        status: initialData?.status || 'ACTIVE',
        baptized: initialData?.baptized || false,
        baptismDate: initialData?.baptismDate ? initialData.baptismDate.substring(0, 10) : '',
        joinDate: initialData?.joinDate ? initialData.joinDate.substring(0, 10) : '',
        phone: initialData?.phone || '',
        email: initialData?.email || '',
        address: initialData?.address || '',
        church: user?.churchId || initialData?.church?._id || '',
        ministries: initialData?.ministries?.map((m: any) => m._id || m) || [],
        familyGroup: initialData?.familyGroup || '',
        notes: initialData?.notes || '',

      });
    }
  }, [open, initialData, reset]);

  const { data: churches = [] } = useQuery({ queryKey: ['churches'], queryFn: async () => (await api.get('/tenant/churches')).data });
  const { data: ministries = [] } = useQuery({ queryKey: ['ministries'], queryFn: async () => (await api.get('/tenant/ministries')).data });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload: any = { ...data };
      if (!payload.church) delete payload.church;
      if (!payload.email) delete payload.email;
      if (!payload.birthDate) delete payload.birthDate;
      if (!payload.baptismDate) delete payload.baptismDate;
      if (!payload.joinDate) delete payload.joinDate;
      if (initialData?._id) return api.put(`/tenant/members/${initialData._id}`, payload);
      return api.post('/tenant/members', payload);
    },
    onSuccess: () => { reset(); onSuccess(); onClose(); },
  });

  const SectionLabel = ({ label }: { label: string }) => (
    <Box sx={{ mt: 2.5, mb: 1 }}>
      <Typography variant="caption" color="primary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </Typography>
      <Divider sx={{ mt: 0.5 }} />
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {initialData ? t('members.editMember') : t('members.newMember')}
      </DialogTitle>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <DialogContent dividers>
          {/* Personal Info */}
          <SectionLabel label={t('members.personalInfo')} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField size="small" label={t('members.firstName')} fullWidth error={!!errors.firstName} helperText={errors.firstName?.message} {...register('firstName')} />
            <TextField size="small" label={t('members.lastName')} fullWidth error={!!errors.lastName} helperText={errors.lastName?.message} {...register('lastName')} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1.5 }}>
            <Controller
              name="birthDate"
              control={control}
              render={({ field }) => (
                <DateField size="small" label={t('members.birthDate')} fullWidth {...field} />
              )}
            />
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <TextField select size="small" label={t('members.gender')} fullWidth {...field} value={field.value || ''}>
                  <MenuItem value="">{t('members.allGenders')}</MenuItem>
                  <MenuItem value="MALE">{t('members.male')}</MenuItem>
                  <MenuItem value="FEMALE">{t('members.female')}</MenuItem>
                </TextField>
              )}
            />
          </Stack>

          {/* Church Info */}
          <SectionLabel label={t('members.churchInfo')} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField select size="small" label={t('members.status')} fullWidth error={!!errors.status} helperText={errors.status?.message} {...field}>
                  <MenuItem value="ACTIVE">{t('members.statusActive')}</MenuItem>
                  <MenuItem value="INACTIVE">{t('members.statusInactive')}</MenuItem>
                  <MenuItem value="VISITOR">{t('members.statusVisitor')}</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="joinDate"
              control={control}
              render={({ field }) => (
                <DateField size="small" label={t('members.joinDate')} fullWidth {...field} />
              )}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1.5, alignItems: 'center' }}>
            <Controller
              name="baptized"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={t('members.baptized')}
                  sx={{ flex: 1 }}
                />
              )}
            />
            {baptized && (
              <Controller
                name="baptismDate"
                control={control}
                render={({ field }) => (
                  <DateField size="small" label={t('members.baptismDate')} fullWidth sx={{ flex: 1 }} {...field} />
                )}
              />
            )}
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1.5 }}>
            <Controller
              name="church"
              control={control}
              render={({ field }) => (
                <TextField select disabled={user?.churchId ? true : false} size="small" label={t('members.church')} fullWidth {...field} value={field.value || ''}>
                  <MenuItem value="">—</MenuItem>
                  {churches.map((c: any) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                </TextField>
              )}
            />
            <TextField size="small" label={t('members.familyGroup')} fullWidth {...register('familyGroup')} />
          </Stack>

          {/* Ministries */}
          <SectionLabel label={t('members.ministries')} />
          <Controller
            name="ministries"
            control={control}
            render={({ field }) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {ministries.map((m: any) => (
                  <FormControlLabel
                    key={m._id}
                    control={
                      <Checkbox
                        size="small"
                        checked={(field.value || []).includes(m._id)}
                        onChange={(e) => {
                          const val = field.value || [];
                          field.onChange(e.target.checked ? [...val, m._id] : val.filter((id: string) => id !== m._id));
                        }}
                      />
                    }
                    label={m.name}
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                  />
                ))}
                {ministries.length === 0 && <Typography variant="caption" color="text.secondary">No hay ministerios creados aún.</Typography>}
              </Box>
            )}
          />

          {/* Contact */}
          <SectionLabel label={t('members.contactInfo')} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField size="small" label={t('members.phone')} fullWidth {...register('phone')} />
            <TextField size="small" label={t('members.email')} fullWidth error={!!errors.email} helperText={errors.email?.message} {...register('email')} />
          </Stack>
          <TextField size="small" label={t('members.address')} fullWidth {...register('address')} sx={{ mt: 1.5 }} />
          <TextField size="small" label={t('members.notes')} fullWidth multiline rows={3} {...register('notes')} sx={{ mt: 1.5 }} />
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
