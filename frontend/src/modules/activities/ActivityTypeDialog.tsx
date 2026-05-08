import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Stack, Box
} from '@mui/material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export const ActivityTypeDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { t } = useTranslation();
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#2196f3');

  const { data: types = [], refetch } = useQuery({
    queryKey: ['activity-types'],
    queryFn: async () => (await api.get('/tenant/activities/types')).data,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => api.post('/tenant/activities/types', data),
    onSuccess: () => {
      setNewName('');
      refetch();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{t('activities.typeManagement')}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mb: 3, mt: 1 }}>
          <TextField 
            label={t('common.name')} 
            fullWidth 
            size="small" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
          />
          <TextField 
            label={t('activities.color')} 
            type="color" 
            fullWidth 
            size="small" 
            value={newColor} 
            onChange={(e) => setNewColor(e.target.value)} 
          />
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            disabled={!newName} 
            onClick={() => createMutation.mutate({ name: newName, color: newColor })}
          >
            {t('common.save')}
          </Button>
        </Stack>

        <List dense>
          {types.map((type: any) => (
            <ListItem key={type._id} divider>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: type.color, mr: 2 }} />
              <ListItemText primary={type.name} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
};
