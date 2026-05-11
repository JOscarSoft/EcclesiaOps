import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Stack, CircularProgress, Alert, Autocomplete
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../core/api';
import { formatDate, getDaysDiff, isSpanishFeminine } from '../../utils/format';
import PrintIcon from '@mui/icons-material/Print';
import { ACTIVITY_TEMPLATE } from './activityTemplate';

interface BookEntry {
  testament: string;
  title: string;
  shortTitle: string;
  abbr: string;
  category: string;
  key: string;
  number: number;
  chapters: number;
  verses: number;
}

export const InvitationModal = ({
  open, onClose, activity
}: { open: boolean; onClose: () => void; activity: any }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const [books, setBooks] = useState<BookEntry[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookEntry | null>(null);
  const [chapter, setChapter] = useState<number>(1);
  const [verse, setVerse] = useState<number>(1);
  const [verseText, setVerseText] = useState('');
  const [loadingVerse, setLoadingVerse] = useState(false);
  const [verseError, setVerseError] = useState('');

  const maxChapters = selectedBook?.chapters || 1;

  useEffect(() => {
    if (open) {
      api.get('/platform/bible/bookList').then(({ data }) => setBooks(data));
      setSelectedBook(null);
      setChapter(1);
      setVerse(1);
      setVerseText('');
      setVerseError('');
      setError('');
    }
  }, [open]);

  const fetchVerse = useCallback(async () => {
    if (!selectedBook || !chapter || !verse) return

    setLoadingVerse(true);
    setVerseError('');
    try {
      const { data } = await api.get(`/platform/bible/${selectedBook.key}/${chapter}/${verse}`);
      setVerseText(data.verse.replaceAll('_', ' '));
    } catch {
      setVerseText('');
      setVerseError(t('activities.verseNotFound'));
    } finally {
      setLoadingVerse(false);
    }
  }, [selectedBook, chapter, verse, t]);

  useEffect(() => {
    if (selectedBook && chapter >= 1 && verse >= 1) {
      fetchVerse();
      return
    } else {
      setVerseText('');
      setVerseError('');
    }

  }, [fetchVerse]);

  const schema = useMemo(() => z.object({
    activityTheme: z.string().optional(),
  }), [t]);

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors }, reset: resetForm } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    resetForm({
      activityTheme: activity?.description || '',
    });
  }, [activity, resetForm]);

  const generatePDF = useCallback(async (data: FormValues) => {
    if (!activity) return;

    setIsGenerating(true);
    setError('');

    try {
      let html = ACTIVITY_TEMPLATE;

      let churchAddress = '';
      let churchPhone = '';
      let pastorName = '';

      if (activity.church?._id) {
        try {
          const { data: churchData } = await api.get(`/tenant/churches/${activity.church._id}`);
          churchAddress = churchData.address || '';
          churchPhone = churchData.phone || '';
          const pastor = churchData.pastor;
          if (pastor) {
            pastorName = `${pastor.firstName || ''} ${pastor.lastName || ''}`.trim();
          }
        } catch {
          // proceed with empty values
        }
      } else if (user?.tenantId) {
        try {
          const { data: councilData } = await api.get(`/platform/councils/by-domain/${user.tenantId}`);
          churchAddress = councilData.address || '';
          churchPhone = councilData.phone || '';
          pastorName = councilData.contactName || '';
        } catch {
          // proceed with empty values
        }
      }

      const councilName = user?.churchName?.split(' - ')?.[0] || '';

      const activityTitle = isSpanishFeminine(activity.title.split(' ')[0]) ? `nuestra próxima <b>${activity.title}</b>` : `nuestro próximo <b>${activity.title}</b>`;
      const daysDiff = getDaysDiff(new Date(activity.startDate), new Date(activity.endDate));
      let formatedPastorName = pastorName.padStart(((40 - pastorName.length) / 2) + pastorName.length, '_');
      formatedPastorName = formatedPastorName.padEnd(((40 - pastorName.length) / 2) + formatedPastorName.length, '_');

      const verseRef = selectedBook && verseText ? `${selectedBook.shortTitle} ${chapter}:${verse}` : '';

      const replacements: Record<string, string> = {
        CouncilName: councilName,
        ChurchName: activity.church?.name || '',
        ChurchAddress: activity.location || churchAddress,
        ChurchPhone: churchPhone,
        ActivityType: activity.activityType?.name || '',
        ActivityTitle: activityTitle,
        ActivityDate: daysDiff > 1 ? formatDate(activity.startDate) + " hasta el " + formatDate(activity.endDate) : formatDate(activity.startDate),
        PastorName: formatedPastorName,
        VerseText: verseText,
        VerseReference: verseRef,
        ActivityTheme: data.activityTheme ? '"' + data.activityTheme + '"' : '',
      };

      for (const [key, value] of Object.entries(replacements)) {
        html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        setError(t('activities.popupBlocked'));
        setIsGenerating(false);
        return;
      }

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();

      printWindow.onafterprint = () => {
        printWindow.close();
      };

      setTimeout(() => {
        printWindow.print();
      }, 500);

      onClose();
    } catch {
      setError(t('activities.generateError'));
    } finally {
      setIsGenerating(false);
    }
  }, [activity, user, onClose, t, selectedBook, chapter, verse, verseText]);

  return (
    <Dialog open={open} onClose={isGenerating ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {t('activities.generateInvitation')}
      </DialogTitle>
      <form onSubmit={handleSubmit(generatePDF)}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label={t('activities.activityTheme')}
              fullWidth
              {...register('activityTheme')}
              error={!!errors.activityTheme}
              helperText={errors.activityTheme?.message}
            />

            <Autocomplete
              options={books}
              value={selectedBook}
              onChange={(_, value) => setSelectedBook(value)}
              getOptionLabel={(option) => `${option.shortTitle} (${option.abbr})`}
              isOptionEqualToValue={(option, value) => option.key === value.key}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('activities.book')}
                />
              )}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label={t('activities.chapter')}
                type="number"
                value={chapter}
                onChange={(e) => setChapter(Math.max(1, Math.min(maxChapters, parseInt(e.target.value) || 1)))}
                slotProps={{ htmlInput: { min: 1, max: maxChapters } }}
                fullWidth
                required
                disabled={!selectedBook}
              />
              <TextField
                label={t('activities.verse')}
                type="number"
                value={verse}
                onChange={(e) => setVerse(Math.max(1, parseInt(e.target.value) || 1))}
                slotProps={{ htmlInput: { min: 1 } }}
                fullWidth
                required
                disabled={!selectedBook}
              />
            </Stack>

            <TextField
              label={t('activities.verseText')}
              fullWidth
              multiline
              rows={3}
              value={verseText}
              slotProps={{ input: { readOnly: true } }}
              error={!!verseError}
              helperText={verseError || (loadingVerse ? t('activities.loadingVerse') : '')}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={onClose} disabled={isGenerating}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isGenerating}
            startIcon={isGenerating ? <CircularProgress size={20} /> : <PrintIcon />}
          >
            {isGenerating ? t('activities.generating') : t('activities.generatePDF')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
