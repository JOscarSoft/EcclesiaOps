import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormGroup, FormControlLabel, Checkbox, Typography, Box } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const RoleFormDialog = ({ open, onClose, onSuccess, initialData }: { open: boolean, onClose: () => void, onSuccess: () => void, initialData?: any }) => {
  const { t } = useTranslation();

  const schema = useMemo(() => z.object({
    name: z.string().min(1, t('common.required')),
    permissions: z.array(z.string()),
  }), [t]);

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', permissions: [] }
  });

  const { data: availablePermissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => (await api.get('/tenant/roles/permissions')).data
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initialData?.name || '',
        permissions: initialData?.permissions?.map((p: any) => p._id) || [],
      });
    }
  }, [open, initialData, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (initialData?._id) {
        return api.put(`/tenant/roles/${initialData._id}`, data);
      }
      return api.post('/tenant/roles', data);
    },
    onSuccess: () => {
      reset();
      onSuccess();
      onClose();
    }
  });

  const isReadOnlyAdmin = initialData?.name === 'ADMIN';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? t('roles.editRole') : t('roles.newRole')}</DialogTitle>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <DialogContent dividers>
          <TextField 
            autoFocus 
            margin="dense" 
            label={t('roles.roleName')} 
            fullWidth 
            error={!!errors.name} 
            helperText={errors.name?.message} 
            {...register('name')} 
            disabled={isReadOnlyAdmin}
          />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              {t('roles.assignedPermissions')}
            </Typography>
            <Controller
              name="permissions"
              control={control}
              render={({ field }) => (
                <FormGroup>
                  {availablePermissions.map((perm: any) => (
                    <FormControlLabel
                      key={perm._id}
                      control={
                        <Checkbox
                          checked={field.value.includes(perm._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, perm._id]);
                            } else {
                              field.onChange(field.value.filter((id: string) => id !== perm._id));
                            }
                          }}
                        />
                      }
                      label={perm.description || perm.name}
                    />
                  ))}
                </FormGroup>
              )}
            />
          </Box>
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
