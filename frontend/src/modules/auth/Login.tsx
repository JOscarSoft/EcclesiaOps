import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import ChurchIcon from '@mui/icons-material/Church';
import { useTranslation } from 'react-i18next';

export const Login = () => {
  const { t } = useTranslation();
  
  const schema = z.object({
    username: z.string().min(1, t('common.required')),
    password: z.string().min(1, t('common.required')),
    tenantId: z.string().optional(),
  });

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: localStorage.getItem('ecclesia_last_tenant') || '',
    }
  });
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      let response;
      if (!data.tenantId) {
        response = await api.post('/platform/auth/login', {
          username: data.username,
          password: data.password,
        });
      } else {
        response = await api.post('/tenant/auth/login', {
          username: data.username,
          password: data.password,
        }, {
          headers: { 'x-tenant-id': data.tenantId }
        });
      }
      const tokenPayload = JSON.parse(atob(response.data.access_token.split('.')[1]));
      return { token: response.data.access_token, tenantId: data.tenantId || '', user: tokenPayload };
    },
    onSuccess: (data) => {
      if (data.tenantId) {
        localStorage.setItem('ecclesia_last_tenant', data.tenantId);
      }
      setAuth(data.token, data.tenantId, data.user);
      navigate('/');
    },
  });

  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Paper elevation={3} sx={{ p: 5, width: '100%', maxWidth: 420, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{ bgcolor: 'primary.main', p: 1.5, borderRadius: 2, mb: 2 }}>
            <ChurchIcon sx={{ color: 'white', fontSize: 40 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            EcclesiaOps
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('login.title')}
          </Typography>
        </Box>
        
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
          <TextField
            label={t('login.username')}
            fullWidth
            margin="normal"
            {...register('username')}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
          <TextField
            label={t('login.password')}
            type="password"
            fullWidth
            margin="normal"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <TextField
            label={t('login.tenantId')}
            fullWidth
            margin="normal"
            {...register('tenantId')}
            helperText={t('login.tenantHint')}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={mutation.isPending}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {mutation.isPending ? t('login.submitting') : t('login.submit')}
          </Button>
          {mutation.isError && (
            <Typography color="error" variant="body2" align="center">
              {(mutation.error as any).response?.data?.message || 'Error'}
            </Typography>
          )}
        </form>
      </Paper>
    </Box>
  );
};
