import {
  Box, Typography, Paper, Chip, Avatar, Button, Stack, Divider,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton, CircularProgress
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../core/api';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import ChurchIcon from '@mui/icons-material/Church';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CakeIcon from '@mui/icons-material/Cake';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useState } from 'react';
import { MemberFormDialog } from './MemberFormDialog';
import { useAuthStore } from '../../stores/authStore';

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'default'> = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  VISITOR: 'warning',
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  SUNDAY: 'members.sunday',
  MIDWEEK: 'members.midweek',
  SPECIAL: 'members.special',
};

export const MemberDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const canManage = user?.role === 'SUPER_ADMIN' || user?.permissions?.includes('MANAGE_MEMBERS');
  const [editOpen, setEditOpen] = useState(false);

  const { data: member, isLoading, refetch } = useQuery({
    queryKey: ['member', id],
    queryFn: async () => (await api.get(`/tenant/members/${id}`)).data,
    enabled: !!id,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['attendance', id],
    queryFn: async () => (await api.get(`/tenant/members/${id}/attendance`)).data,
    enabled: !!id,
  });

  const { data: tithes = [] } = useQuery({
    queryKey: ['member-tithes', id],
    queryFn: async () => (await api.get(`/tenant/finance/stats/member-tithes/${id}`)).data,
    enabled: !!id && (user?.permissions?.includes('VIEW_FINANCE') || user?.role === 'SUPER_ADMIN'),
  });

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  if (!member) return null;

  const statusLabel: Record<string, string> = {
    ACTIVE: t('members.statusActive'),
    INACTIVE: t('members.statusInactive'),
    VISITOR: t('members.statusVisitor'),
  };

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) => (
    value ? (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }}>
        <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
        <Box>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
        </Box>
      </Box>
    ) : null
  );

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString() : undefined;

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto' }}>
      {/* Top actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/members')}><ArrowBackIcon /></IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>{member.firstName} {member.lastName}</Typography>
        <Chip label={statusLabel[member.status] || member.status} color={STATUS_COLORS[member.status] || 'default'} />
        {canManage && (
          <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
            {t('common.edit')}
          </Button>
        )}
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        {/* Left column */}
        <Box sx={{ flex: 1 }}>
          {/* Avatar Card */}
          <Paper elevation={0} sx={{ p: 3, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
            <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: 40 }}>
              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{member.firstName} {member.lastName}</Typography>
            {member.age && <Typography color="text.secondary">{member.age} {t('members.age')}</Typography>}
          </Paper>

          {/* Personal Info */}
          <Paper elevation={0} sx={{ p: 3, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon fontSize="small" color="primary" /> {t('members.personalInfo')}
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <InfoRow icon={<CakeIcon fontSize="small" />} label={t('members.birthDate')} value={formatDate(member.birthDate)} />
            <InfoRow icon={<PersonIcon fontSize="small" />} label={t('members.gender')} value={member.gender === 'MALE' ? t('members.male') : member.gender === 'FEMALE' ? t('members.female') : undefined} />
          </Paper>

          {/* Contact */}
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon fontSize="small" color="primary" /> {t('members.contactInfo')}
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <InfoRow icon={<PhoneIcon fontSize="small" />} label={t('members.phone')} value={member.phone} />
            <InfoRow icon={<EmailIcon fontSize="small" />} label={t('members.email')} value={member.email} />
            <InfoRow icon={<PersonIcon fontSize="small" />} label={t('members.address')} value={member.address} />
          </Paper>
        </Box>

        {/* Right column */}
        <Box sx={{ flex: 1.4 }}>
          {/* Church Info */}
          <Paper elevation={0} sx={{ p: 3, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChurchIcon fontSize="small" color="primary" /> {t('members.churchInfo')}
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <InfoRow icon={<ChurchIcon fontSize="small" />} label={t('members.church')} value={member.church?.name} />
            <InfoRow icon={<PersonIcon fontSize="small" />} label={t('members.joinDate')} value={formatDate(member.joinDate)} />
            <InfoRow icon={<PersonIcon fontSize="small" />} label={t('members.baptized')} value={member.baptized ? `${t('members.yes')} ${member.baptismDate ? `(${formatDate(member.baptismDate)})` : ''}` : t('members.no')} />
            <InfoRow icon={<PersonIcon fontSize="small" />} label={t('members.familyGroup')} value={member.familyGroup} />
            {member.ministries?.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">{t('members.ministries')}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {member.ministries.map((m: any) => <Chip key={m._id} label={m.name} size="small" color="primary" variant="outlined" />)}
                </Box>
              </Box>
            )}
            {member.notes && (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" color="text.secondary">{t('members.notes')}</Typography>
                <Typography variant="body2" sx={{ mt: 0.5, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>{member.notes}</Typography>
              </Box>
            )}
          </Paper>

          {/* Attendance history */}
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupsIcon fontSize="small" color="primary" /> {t('members.attendanceHistory')}
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            {attendance.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                {t('members.noAttendance')}
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendance.map((a: any) => (
                    <TableRow key={a._id}>
                      <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                      <TableCell>{t(EVENT_TYPE_LABELS[a.eventType] || a.eventType)}</TableCell>
                      <TableCell>
                        <Chip label={a.present ? 'Presente' : 'Ausente'} color={a.present ? 'success' : 'default'} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            </Paper>

            {/* Tithes History (only if has permission) */}
            {(user?.permissions?.includes('VIEW_FINANCE') || user?.role === 'SUPER_ADMIN') && (
              <Paper elevation={0} sx={{ p: 3, mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalanceWalletIcon fontSize="small" color="primary" /> {t('finance.tithes')}
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                {tithes.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    Sin registros de diezmos.
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell align="right">Monto</TableCell>
                        <TableCell>Método</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tithes.map((t: any) => (
                        <TableRow key={t._id}>
                          <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(t.amount)}
                          </TableCell>
                          <TableCell>{t.method}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Paper>
            )}
          </Box>
        </Stack>

      <MemberFormDialog open={editOpen} onClose={() => setEditOpen(false)} onSuccess={() => { setEditOpen(false); refetch(); }} initialData={member} />
    </Box>
  );
};
