import { useState, useRef, useEffect } from 'react';
import { TextField, InputAdornment, IconButton, Box } from '@mui/material';
import type { TextFieldProps } from '@mui/material/TextField';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

type DateTimeFieldProps = Omit<TextFieldProps, 'type'>;

const LOCAL_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

const getLocalParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: LOCAL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '';
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute') };
};

const formatDisplay = (iso: string) => {
  if (!iso) return '';
  if (!iso.includes('T')) {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const p = getLocalParts(date);
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`;
};

const localToUTC = (y: number, m: number, d: number, h: number, min: number) => {
  let guess = new Date(Date.UTC(y, m - 1, d, h, min));
  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: LOCAL_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(guess);
    const get = (t: string) => parts.find(p => p.type === t)?.value ?? '';
    const gy = parseInt(get('year')), gm = parseInt(get('month')), gd = parseInt(get('day'));
    const gh = parseInt(get('hour')), gmin = parseInt(get('minute'));
    if (gy === y && gm === m && gd === d && gh === h && gmin === min) return guess;
    const guessEpoch = Date.UTC(gy, gm - 1, gd, gh, gmin);
    const targetEpoch = Date.UTC(y, m - 1, d, h, min);
    guess = new Date(guess.getTime() + (targetEpoch - guessEpoch));
  }
  return guess;
};

const parseDisplay = (display: string) => {
  const cleaned = display.replace(/\D/g, '');
  if (cleaned.length < 8) return '';
  const d = parseInt(cleaned.slice(0, 2));
  const m = parseInt(cleaned.slice(2, 4));
  const y = parseInt(cleaned.slice(4, 8));
  if (cleaned.length >= 12) {
    const h = parseInt(cleaned.slice(8, 10));
    const min = parseInt(cleaned.slice(10, 12));
    return localToUTC(y, m, d, h, min).toISOString();
  }
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

const toPickerValue = (iso: string) => {
  if (!iso) return '';
  if (!iso.includes('T')) return iso;
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const p = getLocalParts(date);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
};

export const DateTimeField = ({ value, onChange, onBlur, slotProps, sx, ...props }: DateTimeFieldProps) => {
  const pickerRef = useRef<HTMLInputElement>(null);
  const [textValue, setTextValue] = useState(() => formatDisplay(value as string || ''));

  useEffect(() => {
    setTextValue(formatDisplay(value as string || ''));
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, '').slice(0, 12);

    const formatted = digits.length > 8
      ? `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)} ${digits.slice(8, 10)}:${digits.slice(10, 12)}`
      : digits.length > 4
        ? `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
        : digits.length > 2
          ? `${digits.slice(0, 2)}/${digits.slice(2)}`
          : digits;

    setTextValue(formatted);

    if (digits.length === 12) {
      const iso = parseDisplay(digits);
      if (iso && onChange) {
        onChange({ target: { value: iso } } as any);
      }
    }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      setTextValue('');
      if (onChange) onChange({ target: { value: '' } } as any);
      return;
    }
    const [dateStr, timeStr] = val.split('T');
    const [y, m, d] = dateStr.split('-').map(Number);
    const [h, min] = timeStr.split(':').map(Number);
    const utcDate = localToUTC(y, m, d, h, min);
    setTextValue(formatDisplay(utcDate.toISOString()));
    if (onChange) onChange({ target: { value: utcDate.toISOString() } } as any);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const digits = textValue.replace(/\D/g, '');
    if (digits.length >= 8) {
      const iso = parseDisplay(digits);
      if (iso && onChange) onChange({ target: { value: iso } } as any);
    } else if (digits.length > 0) {
      setTextValue('');
      if (onChange) onChange({ target: { value: '' } } as any);
    }
    if (onBlur) onBlur(e);
  };

  return (
    <Box sx={{ position: 'relative', ...(sx as any) }}>
      <TextField
        {...props}
        type="text"
        value={textValue}
        onChange={handleTextChange}
        onBlur={handleBlur}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => pickerRef.current?.showPicker()}>
                  <CalendarMonthIcon />
                </IconButton>
              </InputAdornment>
            ),
            sx: { cursor: 'text' },
          },
          ...slotProps,
        }}
      />
      <input
        ref={pickerRef}
        type="datetime-local"
        value={toPickerValue(value as string || '')}
        onChange={handlePickerChange}
        onBlur={onBlur}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />
    </Box>
  );
};
