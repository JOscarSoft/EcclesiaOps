import { Box, Button, TextField, MenuItem, Paper, List, ListItem, ListItemText, Typography, Stack } from '@mui/material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';

export const FinanceCategories = () => {
  const { t } = useTranslation();
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('INCOME');

  const { data: categories = [], refetch } = useQuery({
    queryKey: ['finance-categories-all'],
    queryFn: async () => (await api.get('/tenant/finance/categories')).data,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => api.post('/tenant/finance/categories', data),
    onSuccess: () => {
      setNewName('');
      refetch();
    },
  });

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>{t('finance.newCategory')}</Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            size="small"
            label={t('common.name') || 'Nombre'}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            sx={{ flex: 2 }}
          />
          <TextField
            select
            size="small"
            label={t('finance.type')}
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            sx={{ flex: 1 }}
          >
            <MenuItem value="INCOME">{t('finance.income')}</MenuItem>
            <MenuItem value="EXPENSE">{t('finance.expense')}</MenuItem>
          </TextField>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            disabled={!newName}
            onClick={() => createMutation.mutate({ name: newName, type: newType })}
          >
            {t('common.save')}
          </Button>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <List>
          {categories.map((cat: any) => (
            <ListItem key={cat._id} divider>
              <ListItemText 
                primary={cat.name} 
                secondary={cat.type === 'INCOME' ? t('finance.income') : t('finance.expense')} 
              />
            </ListItem>
          ))}
          {categories.length === 0 && (
            <ListItem>
              <ListItemText primary="No hay categorías creadas." sx={{ textAlign: 'center', color: 'text.secondary' }} />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};
