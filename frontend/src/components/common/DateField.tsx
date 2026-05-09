import { useState, useRef, useEffect } from 'react';
import { TextField, InputAdornment, IconButton, Box } from '@mui/material';
import type { TextFieldProps } from '@mui/material/TextField';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

type DateFieldProps = Omit<TextFieldProps, 'type'>;

const formatDisplay = (iso: string) => !iso ? '' : iso.split('-').reverse().join('/');

const parseDisplay = (display: string) => {
  const cleaned = display.replace(/\D/g, '');
  if (cleaned.length !== 8) return '';
  const day = cleaned.slice(0, 2);
  const month = cleaned.slice(2, 4);
  const year = cleaned.slice(4, 8);
  return `${year}-${month}-${day}`;
};

export const DateField = ({ value, onChange, onBlur, slotProps, sx, ...props }: DateFieldProps) => {
  const pickerRef = useRef<HTMLInputElement>(null);
  const [textValue, setTextValue] = useState(() => formatDisplay(value as string || ''));

  useEffect(() => {
    setTextValue(formatDisplay(value as string || ''));
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 4
      ? `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
      : digits.length > 2
        ? `${digits.slice(0, 2)}/${digits.slice(2)}`
        : digits;
    setTextValue(formatted);

    if (digits.length === 8) {
      const iso = parseDisplay(digits);
      if (iso && onChange) {
        onChange({ target: { value: iso } } as any);
      }
    }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextValue(formatDisplay(e.target.value));
    if (onChange) onChange(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const digits = textValue.replace(/\D/g, '');
    if (digits.length === 8 && !parseDisplay(digits)) {
      setTextValue('');
      if (onChange) onChange({ target: { value: '' } } as any);
    } else if (digits.length === 8) {
      const iso = parseDisplay(digits);
      if (onChange) onChange({ target: { value: iso } } as any);
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
        type="date"
        value={value as string || ''}
        onChange={handlePickerChange}
        onBlur={onBlur}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />
    </Box>
  );
};
