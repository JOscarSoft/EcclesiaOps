import { useState, useMemo, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Stack, Typography
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/format';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const AGE_RANGES = ['0-12', '13-17', '18-25', '26-35', '36-50', '51-65', '65+'] as const;

type ReportType = 'directory' | 'by-status' | 'by-gender' | 'by-ministry' | 'age-ranges' | 'baptized' | 'family-groups' | 'by-church' | 'new-believers';

const REPORT_OPTIONS: { value: ReportType; labelKey: string }[] = [
  { value: 'directory', labelKey: 'members.reports.directory' },
  { value: 'by-status', labelKey: 'members.reports.byStatus' },
  { value: 'by-gender', labelKey: 'members.reports.byGender' },
  { value: 'by-ministry', labelKey: 'members.reports.byMinistry' },
  { value: 'age-ranges', labelKey: 'members.reports.ageRanges' },
  { value: 'baptized', labelKey: 'members.reports.baptized' },
  { value: 'family-groups', labelKey: 'members.reports.familyGroups' },
  { value: 'by-church', labelKey: 'members.reports.byChurch' },
  { value: 'new-believers', labelKey: 'members.reports.newBelievers' },
];

const calculateAge = (birthDate?: string) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const getAgeRange = (age: number | null) => {
  if (age === null) return null;
  if (age <= 12) return '0-12';
  if (age <= 17) return '13-17';
  if (age <= 25) return '18-25';
  if (age <= 35) return '26-35';
  if (age <= 50) return '36-50';
  if (age <= 65) return '51-65';
  return '65+';
};

const formatMemberName = (m: any) => `${m.firstName} ${m.lastName}`;

interface ReportResult {
  columns: string[];
  rows: string[][];
}

const buildReport = (members: any[], type: ReportType, t: (key: string) => string): ReportResult => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  switch (type) {
    case 'directory': {
      const columns = [
        t('members.fullName'), t('members.age'), t('members.gender'),
        t('members.status'), t('members.baptized'), t('members.phone'),
        t('members.email'), t('members.church'), t('members.ministries'),
      ];
      const rows = members.map((m: any) => [
        formatMemberName(m),
        String(calculateAge(m.birthDate) ?? '-'),
        m.gender === 'MALE' ? t('members.male') : m.gender === 'FEMALE' ? t('members.female') : '-',
        m.status ? t(`members.status${m.status.charAt(0) + m.status.slice(1).toLowerCase()}` as any) || m.status : '-',
        m.baptized ? t('members.yes') : t('members.no'),
        m.phone || '-',
        m.email || '-',
        m.church?.name || '-',
        (m.ministries || []).map((min: any) => min.name).join(', ') || '-',
      ]);
      return { columns, rows };
    }

    case 'by-status': {
      const columns = [t('members.status'), t('members.fullName'), t('members.age'), t('members.gender'), t('members.phone')];
      const rows = members.map((m: any) => [
        m.status ? t(`members.status${m.status.charAt(0) + m.status.slice(1).toLowerCase()}` as any) || m.status : '-',
        formatMemberName(m),
        String(calculateAge(m.birthDate) ?? '-'),
        m.gender === 'MALE' ? t('members.male') : m.gender === 'FEMALE' ? t('members.female') : '-',
        m.phone || '-',
      ]);
      return { columns, rows };
    }

    case 'by-gender': {
      const columns = [t('members.gender'), t('members.fullName'), t('members.age'), t('members.status'), t('members.phone')];
      const rows = members.map((m: any) => [
        m.gender === 'MALE' ? t('members.male') : m.gender === 'FEMALE' ? t('members.female') : '-',
        formatMemberName(m),
        String(calculateAge(m.birthDate) ?? '-'),
        m.status ? t(`members.status${m.status.charAt(0) + m.status.slice(1).toLowerCase()}` as any) || m.status : '-',
        m.phone || '-',
      ]);
      return { columns, rows };
    }

    case 'by-ministry': {
      const columns = [t('members.ministries'), t('members.fullName'), t('members.age'), t('members.status')];
      const rows: string[][] = [];
      members.forEach((m: any) => {
        const mins = m.ministries || [];
        if (mins.length === 0) {
          rows.push([t('members.reports.withoutMinistry'), formatMemberName(m), String(calculateAge(m.birthDate) ?? '-'), m.status || '-']);
        } else {
          mins.forEach((min: any) => {
            rows.push([min.name, formatMemberName(m), String(calculateAge(m.birthDate) ?? '-'), m.status || '-']);
          });
        }
      });
      return { columns, rows };
    }

    case 'age-ranges': {
      const columns = [t('members.reports.ageRange'), t('members.reports.count')];
      const counts: Record<string, number> = {};
      AGE_RANGES.forEach(r => { counts[r] = 0; });
      members.forEach((m: any) => {
        const range = getAgeRange(calculateAge(m.birthDate));
        if (range && counts[range] !== undefined) counts[range]++;
      });
      const rows = Object.entries(counts).map(([range, count]) => [range, String(count)]);
      return { columns, rows };
    }

    case 'baptized': {
      const columns = [t('members.fullName'), t('members.baptismDate'), t('members.age')];
      const baptized = members.filter((m: any) => m.baptized);
      const rows = baptized.map((m: any) => [
        formatMemberName(m),
        m.baptismDate ? formatDate(m.baptismDate) : '-',
        String(calculateAge(m.birthDate) ?? '-'),
      ]);
      return { columns, rows };
    }

    case 'family-groups': {
      const columns = [t('members.familyGroup'), t('members.fullName'), t('members.age'), t('members.phone')];
      const rows = members.map((m: any) => [
        m.familyGroup || t('members.reports.withoutGroup'),
        formatMemberName(m),
        String(calculateAge(m.birthDate) ?? '-'),
        m.phone || '-',
      ]);
      return { columns, rows };
    }

    case 'by-church': {
      const columns = [t('members.church'), t('members.fullName'), t('members.age'), t('members.status'), t('members.phone')];
      const rows = members.map((m: any) => [
        m.church?.name || t('finance.council'),
        formatMemberName(m),
        String(calculateAge(m.birthDate) ?? '-'),
        m.status ? t(`members.status${m.status.charAt(0) + m.status.slice(1).toLowerCase()}` as any) || m.status : '-',
        m.phone || '-',
      ]);
      return { columns, rows };
    }

    case 'new-believers': {
      const columns = [t('members.fullName'), t('members.joinDate'), t('members.age'), t('members.phone')];
      const filtered = members.filter((m: any) => {
        if (m.baptized) return false;
        if (!m.joinDate) return false;
        return new Date(m.joinDate) >= oneYearAgo;
      });
      const rows = filtered.map((m: any) => [
        formatMemberName(m),
        formatDate(m.joinDate),
        String(calculateAge(m.birthDate) ?? '-'),
        m.phone || '-',
      ]);
      return { columns, rows };
    }

    default:
      return { columns: [], rows: [] };
  }
};

const exportCSV = (report: ReportResult, filename: string) => {
  if (!report.rows.length) return;
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
    + report.columns.join(',') + '\n'
    + report.rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csvContent));
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportPDF = (report: ReportResult, title: string) => {
  if (!report.rows.length) return;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 22);
  doc.setFontSize(10);
  doc.text(`Generado: ${formatDate(new Date())}`, 14, 30);
  autoTable(doc, {
    startY: 38,
    head: [report.columns],
    body: report.rows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [66, 66, 66] },
  });
  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

interface MembersReportDialogProps {
  open: boolean;
  onClose: () => void;
}

export const MembersReportDialog = ({ open, onClose }: MembersReportDialogProps) => {
  const { t } = useTranslation();
  const [reportType, setReportType] = useState<ReportType>('directory');
  const [filterChurch, setFilterChurch] = useState('');
  const [filterMinistry, setFilterMinistry] = useState('');

  useEffect(() => {
    setFilterChurch('');
    setFilterMinistry('');
  }, [reportType]);

  const { data: members = [] } = useQuery({
    queryKey: ['members-report'],
    queryFn: async () => (await api.get('/tenant/members')).data,
    enabled: open,
  });

  const { data: churches = [] } = useQuery({
    queryKey: ['churches'],
    queryFn: async () => (await api.get('/tenant/churches')).data,
    enabled: open,
  });

  const { data: ministries = [] } = useQuery({
    queryKey: ['ministries'],
    queryFn: async () => (await api.get('/tenant/ministries')).data,
    enabled: open,
  });

  const filteredMembers = useMemo(() => {
    let result = members;
    if (filterChurch) {
      result = result.filter((m: any) => m.church?._id === filterChurch || m.church === filterChurch);
    }
    if (filterMinistry) {
      result = result.filter((m: any) => (m.ministries || []).some((min: any) => min._id === filterMinistry || min === filterMinistry));
    }
    return result;
  }, [members, filterChurch, filterMinistry]);

  const report = useMemo(() => buildReport(filteredMembers, reportType, t), [filteredMembers, reportType, t]);
  const currentLabel = REPORT_OPTIONS.find(o => o.value === reportType)?.labelKey || '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{t('members.reports.title')}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            select
            size="small"
            label={t('members.reports.selectType')}
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            sx={{ minWidth: 280 }}
          >
            {REPORT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{t(opt.labelKey)}</MenuItem>
            ))}
          </TextField>

          {reportType === 'by-church' && (
            <TextField select size="small" label="Iglesia" value={filterChurch} onChange={(e) => setFilterChurch(e.target.value)} sx={{ minWidth: 240 }}>
              <MenuItem value="">Todas las iglesias</MenuItem>
              {churches.map((c: any) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
            </TextField>
          )}
          {reportType === 'by-ministry' && (
            <TextField select size="small" label="Ministerio" value={filterMinistry} onChange={(e) => setFilterMinistry(e.target.value)} sx={{ minWidth: 240 }}>
              <MenuItem value="">Todos los ministerios</MenuItem>
              {ministries.map((m: any) => <MenuItem key={m._id} value={m._id}>{m.name}</MenuItem>)}
            </TextField>
          )}

          {report.rows.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              {t('members.reports.noData')}
            </Typography>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">
                {report.rows.length} {t('members.reports.records')}
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 400, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {report.columns.map((col, i) => (
                        <TableCell key={i} sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>{col}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.rows.map((row, i) => (
                      <TableRow key={i}>
                        {row.map((cell, j) => (
                          <TableCell key={j} sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button
          startIcon={<DownloadIcon />}
          onClick={() => exportCSV(report, t(currentLabel as any))}
          disabled={!report.rows.length}
        >
          {t('members.reports.exportCSV')}
        </Button>
        <Button
          startIcon={<PictureAsPdfIcon />}
          onClick={() => exportPDF(report, t(currentLabel as any))}
          disabled={!report.rows.length}
        >
          {t('members.reports.exportPDF')}
        </Button>
        <Button onClick={onClose}>{t('common.close')}</Button>
      </DialogActions>
    </Dialog>
  );
};
