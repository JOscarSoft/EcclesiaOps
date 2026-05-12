import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Stack, Accordion, AccordionSummary, AccordionDetails,
  Checkbox, FormControlLabel, FormGroup, Typography, Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { DateTimeField } from '../../components/common/DateTimeField';

const DAY_LABELS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

function generateRecurrenceDates(
  startDate: Date,
  frequency: 'weekly' | 'monthly' | 'yearly',
  interval: number,
  daysOfWeek: number[],
  monthlyOption: 'sameDay' | 'sameWeekDay',
  totalOccurrences: number
): Date[] {
  const dates: Date[] = [];

  if (frequency === 'weekly') {
    const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
    const startDay = startDate.getDay();
    let weekIndex = 0;

    while (dates.length < totalOccurrences) {
      const weekSunday = new Date(startDate);
      weekSunday.setDate(weekSunday.getDate() - startDay + weekIndex * 7 * interval);

      for (const day of sortedDays) {
        if (dates.length >= totalOccurrences) break;
        const d = new Date(weekSunday);
        d.setDate(weekSunday.getDate() + day);
        dates.push(d);
      }

      weekIndex++;
    }
  } else if (frequency === 'monthly') {
    if (monthlyOption === 'sameDay') {
      for (let i = 0; i < totalOccurrences; i++) {
        const d = new Date(startDate);
        d.setMonth(d.getMonth() + i * interval);
        if (d.getDate() !== startDate.getDate()) {
          d.setDate(0);
        }
        dates.push(d);
      }
    } else {
      const dayOfWeek = startDate.getDay();
      const weekOrdinal = Math.ceil(startDate.getDate() / 7);

      for (let i = 0; i < totalOccurrences; i++) {
        const targetMonth = new Date(startDate.getFullYear(), startDate.getMonth() + i * interval, 1);
        let count = 0;
        let day = 1;
        while (count < weekOrdinal && day <= 31) {
          const testDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day);
          if (testDate.getMonth() !== targetMonth.getMonth()) break;
          if (testDate.getDay() === dayOfWeek) count++;
          if (count < weekOrdinal) day++;
        }
        const result = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), Math.min(day, 31));
        if (result.getMonth() === targetMonth.getMonth()) {
          dates.push(result);
        }
      }
    }
  } else if (frequency === 'yearly') {
    for (let i = 0; i < totalOccurrences; i++) {
      const d = new Date(startDate);
      d.setFullYear(d.getFullYear() + i * interval);
      dates.push(d);
    }
  }

  return dates;
}

export const ActivityFormDialog = ({
  open, onClose, onSuccess, initialData
}: { open: boolean; onClose: () => void; onSuccess: () => void; initialData?: any }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isEditing = !!initialData?._id;
  const [recurrenceExpanded, setRecurrenceExpanded] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);

  const schema = useMemo(() => z.object({
    title: z.string().min(1, t('common.required')),
    description: z.string().optional(),
    startDate: z.string().min(1, t('common.required')),
    endDate: z.string().min(1, t('common.required')),
    location: z.string().optional(),
    activityType: z.string().min(1, t('common.required')),
    church: z.string().optional(),
    frequency: z.string().optional(),
    repeatInterval: z.string().optional(),
    daysOfWeek: z.array(z.number()).optional(),
    monthlyOption: z.string().optional(),
    occurrences: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('activities.endDateBeforeStart'), path: ['endDate'] });
    }
    if (recurrenceExpanded) {
      if (!data.frequency) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('common.required'), path: ['frequency'] });
      }
      if (!data.occurrences || Number(data.occurrences) < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('common.required'), path: ['occurrences'] });
      }
      if (data.frequency === 'weekly' && (!data.daysOfWeek || data.daysOfWeek.length === 0)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('common.required'), path: ['daysOfWeek'] });
      }
    }
  }), [t, recurrenceExpanded]);

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, reset, control, watch, setValue, clearErrors, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      frequency: 'weekly',
      repeatInterval: '1',
      daysOfWeek: [],
      monthlyOption: 'sameDay',
    },
  });

  const frequency = watch('frequency');
  const watchedStartDate = watch('startDate');
  const watchedEndDate = watch('endDate');

  useEffect(() => {
    if (open) {
      setRecurrenceExpanded(false);
      setBatchLoading(false);
      setBatchError(null);
      if (initialData) {
        reset({
          title: initialData.title,
          description: initialData.description || '',
          startDate: new Date(initialData.startDate).toISOString(),
          endDate: new Date(initialData.endDate).toISOString(),
          location: initialData.location || '',
          activityType: initialData.activityType?._id || initialData.activityType || '',
          church: initialData.church?._id || initialData.church || '',
          frequency: 'weekly',
          repeatInterval: '1',
          daysOfWeek: [],
          monthlyOption: 'sameDay',
        });
      } else {
        reset({
          title: '',
          description: '',
          activityType: '',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 3600000).toISOString(),
          church: user?.churchId || '',
          frequency: 'weekly',
          repeatInterval: '1',
          daysOfWeek: [],
          monthlyOption: 'sameDay',
        });
      }
    }
  }, [open, reset, user, initialData]);

  useEffect(() => {
    if (watchedStartDate && watchedEndDate && new Date(watchedEndDate) < new Date(watchedStartDate)) {
      setValue('endDate', watchedStartDate);
    }
  }, [watchedStartDate, watchedEndDate, setValue]);

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
      delete payload.frequency;
      delete payload.repeatInterval;
      delete payload.daysOfWeek;
      delete payload.monthlyOption;
      delete payload.occurrences;
      if (isEditing) {
        return api.put(`/tenant/activities/${initialData._id}`, payload);
      }
      return api.post('/tenant/activities', payload);
    },
    onSuccess: () => { onSuccess(); onClose(); },
  });

  const onSubmit = async (data: any) => {
    if (isEditing) {
      mutation.mutate(data);
      return;
    }

    if (!recurrenceExpanded) {
      mutation.mutate(data);
      return;
    }

    const freq = data.frequency as 'weekly' | 'monthly' | 'yearly';
    if (!freq) return;

    const occurrences = Number(data.occurrences);
    const maxOccurrences = freq === 'yearly' ? 5 : 24;
    if (!occurrences || occurrences < 1 || occurrences > maxOccurrences) return;

    if (freq === 'weekly' && (!data.daysOfWeek || data.daysOfWeek.length === 0)) return;

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const eventDuration = endDate.getTime() - startDate.getTime();

    const dates = generateRecurrenceDates(
      startDate,
      freq,
      Number(data.repeatInterval) || 1,
      data.daysOfWeek || [],
      data.monthlyOption || 'sameDay',
      occurrences
    );

    setBatchLoading(true);
    setBatchError(null);
    try {
      await Promise.all(dates.map((date) => {
        const payload = { ...data, church: data.church || null };
        delete payload.frequency;
        delete payload.repeatInterval;
        delete payload.daysOfWeek;
        delete payload.monthlyOption;
        delete payload.occurrences;

        payload.startDate = date.toISOString();
        payload.endDate = new Date(date.getTime() + eventDuration).toISOString();

        return api.post('/tenant/activities', payload);
      }));
      onSuccess();
      onClose();
    } catch (err: any) {
      setBatchError(err?.response?.data?.message || err?.message || t('common.error'));
    } finally {
      setBatchLoading(false);
    }
  };

  const isLoading = mutation.isPending || batchLoading;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEditing ? t('activities.editActivity') : t('activities.newActivity')}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
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
                render={({ field, fieldState }) => (
                  <DateTimeField
                    size="small"
                    label={t('activities.endDate')}
                    sx={{ flex: 1 }}
                    {...field}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
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

            {!isEditing && (
              <Accordion
                expanded={recurrenceExpanded}
                onChange={(_, expanded) => {
                  setRecurrenceExpanded(expanded);
                  if (!expanded) {
                    setValue('frequency', 'weekly');
                    setValue('repeatInterval', '1');
                    setValue('daysOfWeek', []);
                    setValue('monthlyOption', 'sameDay');
                    setValue('occurrences', '');
                    clearErrors(['frequency', 'repeatInterval', 'daysOfWeek', 'monthlyOption', 'occurrences']);
                  }
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600 }}>{t('activities.recurring')}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <TextField
                      select
                      label={t('activities.frequency')}
                      fullWidth
                      {...register('frequency')}
                      error={!!errors.frequency}
                      helperText={errors.frequency?.message}
                    >
                      <MenuItem value="weekly">{t('activities.weekly')}</MenuItem>
                      <MenuItem value="monthly">{t('activities.monthly')}</MenuItem>
                      <MenuItem value="yearly">{t('activities.yearly')}</MenuItem>
                    </TextField>

                    <TextField
                      label={`${t('activities.repeatEvery')} (${frequency === 'weekly'
                          ? t('activities.week')
                          : frequency === 'monthly'
                            ? t('activities.month')
                            : t('activities.year')
                        })`}
                      type="number"
                      fullWidth
                      {...register('repeatInterval')}
                      slotProps={{ htmlInput: { min: 1 } }}
                    />

                    {frequency === 'weekly' && (
                      <Controller
                        name="daysOfWeek"
                        control={control}
                        render={({ field, fieldState }) => (
                          <>
                            <FormGroup row>
                              {DAY_LABELS.map((label, index) => (
                                <FormControlLabel
                                  key={index}
                                  control={
                                    <Checkbox
                                      checked={field.value?.includes(index) || false}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          field.onChange([...(field.value || []), index]);
                                        } else {
                                          field.onChange((field.value || []).filter((d: number) => d !== index));
                                        }
                                      }}
                                    />
                                  }
                                  label={t(`activities.${label}`)}
                                />
                              ))}
                            </FormGroup>
                            {fieldState.error && (
                              <Typography variant="caption" color="error">
                                {fieldState.error.message || t('common.required')}
                              </Typography>
                            )}
                          </>
                        )}
                      />
                    )}

                    {frequency === 'monthly' && (
                      <TextField
                        select
                        label={t('activities.monthlyOption')}
                        fullWidth
                        {...register('monthlyOption')}
                        error={!!errors.monthlyOption}
                        helperText={errors.monthlyOption?.message}
                      >
                        <MenuItem value="sameDay">{t('activities.sameDay')}</MenuItem>
                        <MenuItem value="sameWeekDay">{t('activities.sameWeekDay')}</MenuItem>
                      </TextField>
                    )}

                    <TextField
                      label={`${t('activities.endAfter')} (${t('activities.occurrences')})`}
                      type="number"
                      fullWidth
                      {...register('occurrences')}
                      slotProps={{ htmlInput: { min: 1, max: frequency === 'yearly' ? 5 : 24 } }}
                      error={!!errors.occurrences}
                      helperText={errors.occurrences?.message || t('activities.maxOccurrences')}
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}

            {batchError && <Alert severity="error">{batchError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
