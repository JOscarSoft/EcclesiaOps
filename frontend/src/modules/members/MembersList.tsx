import { Box, Button, Typography, Paper, Chip, TextField, MenuItem, InputAdornment, Tooltip, IconButton, Stack } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../core/api';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupsIcon from '@mui/icons-material/Groups';
import { MemberFormDialog } from './MemberFormDialog';
import { MembersReportDialog } from './MembersReportDialog';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { SEO } from '../../components/common/SEO';

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'default'> = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  VISITOR: 'warning',
};

export const MembersList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const canManage = user?.role === 'SUPER_ADMIN' || user?.permissions?.includes('MANAGE_MEMBERS');

  const [open, setOpen] = useState(false);
  const [openReports, setOpenReports] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [filters, setFilters] = useState({ status: '', gender: '', ministry: '', search: '' });

  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.set('status', filters.status);
  if (filters.gender) queryParams.set('gender', filters.gender);
  if (filters.ministry) queryParams.set('ministry', filters.ministry);
  if (filters.search) queryParams.set('search', filters.search);

  const { data: members = [], isLoading, refetch } = useQuery({
    queryKey: ['members', filters],
    queryFn: async () => {
      const { data } = await api.get(`/tenant/members?${queryParams.toString()}`);
      return data;
    }
  });

  const { data: ministries = [] } = useQuery({
    queryKey: ['ministries'],
    queryFn: async () => (await api.get('/tenant/ministries')).data,
  });

  const { data: stats } = useQuery({
    queryKey: ['members-stats'],
    queryFn: async () => (await api.get('/tenant/members/stats')).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/tenant/members/${id}`),
    onSuccess: () => refetch(),
  });

  const statusLabel: Record<string, string> = {
    ACTIVE: t('members.statusActive'),
    INACTIVE: t('members.statusInactive'),
    VISITOR: t('members.statusVisitor'),
  };

  const columns: GridColDef[] = [
    {
      field: 'fullName',
      headerName: t('members.fullName'),
      flex: 1,
      valueGetter: (_val: any, row: any) => `${row.firstName} ${row.lastName}`,
    },
    { field: 'age', headerName: t('members.age'), width: 80 },
    {
      field: 'gender',
      headerName: t('members.gender'),
      width: 120,
      renderCell: (params) => params.value === 'MALE' ? t('members.male') : params.value === 'FEMALE' ? t('members.female') : '-',
    },
    {
      field: 'status',
      headerName: t('members.status'),
      width: 130,
      renderCell: (params) => (
        <Chip
          label={statusLabel[params.value] || params.value}
          color={STATUS_COLORS[params.value] || 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'baptized',
      headerName: t('members.baptized'),
      width: 110,
      renderCell: (params) => (
        <Chip label={params.value ? t('members.yes') : t('members.no')} size="small" color={params.value ? 'primary' : 'default'} />
      ),
    },
    {
      field: 'ministries',
      headerName: t('members.ministries'),
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', py: 0.5 }}>
          {(params.value || []).map((m: any) => (
            <Chip key={m._id} label={m.name} size="small" sx={{ fontSize: '0.7rem' }} />
          ))}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 130,
      renderCell: (params) => (
        <Box>
          <Tooltip title={t('members.viewDetail')}>
            <IconButton size="small" onClick={() => navigate(`/members/${params.row._id}`)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {canManage && (
            <>
              <Tooltip title={t('common.edit')}>
                <IconButton size="small" color="primary" onClick={() => { setSelectedMember(params.row); setOpen(true); }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('common.delete')}>
                <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(params.row._id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <SEO title={t('members.title')} />
      {/* Stats bar */}
      {stats && (
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          {[
            { icon: <PeopleAltIcon />, label: t('members.statusActive'), value: stats.active, color: 'success.main' },
            { icon: <GroupsIcon />, label: t('members.statusVisitor'), value: stats.visitors, color: 'warning.main' },
            { icon: <PersonAddIcon />, label: 'Nuevos (30d)', value: stats.newThisMonth, color: 'primary.main' },
          ].map((s, i) => (
            <Paper key={i} elevation={0} sx={{ flex: 1, p: 2, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Box sx={{ color: s.color }}>{s.icon}</Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: s.color }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>{t('members.title')}</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<AssessmentIcon />} onClick={() => setOpenReports(true)}>
            Reportes
          </Button>
          {canManage && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedMember(null); setOpen(true); }}>
              {t('members.newMember')}
            </Button>
          )}
        </Stack>
      </Box>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            size="small"
            placeholder={t('members.search')}
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            sx={{ flex: 2 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
          <TextField select size="small" label={t('members.filterByStatus')} value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))} sx={{ flex: 1 }}>
            <MenuItem value="">{t('members.allStatuses')}</MenuItem>
            <MenuItem value="ACTIVE">{t('members.statusActive')}</MenuItem>
            <MenuItem value="INACTIVE">{t('members.statusInactive')}</MenuItem>
            <MenuItem value="VISITOR">{t('members.statusVisitor')}</MenuItem>
          </TextField>
          <TextField select size="small" label={t('members.filterByGender')} value={filters.gender} onChange={(e) => setFilters(f => ({ ...f, gender: e.target.value }))} sx={{ flex: 1 }}>
            <MenuItem value="">{t('members.allGenders')}</MenuItem>
            <MenuItem value="MALE">{t('members.male')}</MenuItem>
            <MenuItem value="FEMALE">{t('members.female')}</MenuItem>
          </TextField>
          <TextField select size="small" label={t('members.filterByMinistry')} value={filters.ministry} onChange={(e) => setFilters(f => ({ ...f, ministry: e.target.value }))} sx={{ flex: 1 }}>
            <MenuItem value="">{t('members.allMinistries')}</MenuItem>
            {ministries.map((m: any) => <MenuItem key={m._id} value={m._id}>{m.name}</MenuItem>)}
          </TextField>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ height: 550, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <DataGrid
          rows={members}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          disableRowSelectionOnClick
          rowHeight={52}
          sx={{ border: 'none' }}
        />
      </Paper>

      <MemberFormDialog open={open} onClose={() => setOpen(false)} onSuccess={refetch} initialData={selectedMember} />
      <MembersReportDialog open={openReports} onClose={() => setOpenReports(false)} />
    </Box>
  );
};
