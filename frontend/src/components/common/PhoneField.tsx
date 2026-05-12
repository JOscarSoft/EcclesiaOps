import { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material/TextField';
import { formatPhone } from '../../utils/format';

type PhoneFieldProps = Omit<TextFieldProps, 'type'>;

export const PhoneField = ({ value, onChange, onBlur, ...props }: PhoneFieldProps) => {
  const [textValue, setTextValue] = useState(() => formatPhone(value as string || ''));

  useEffect(() => {
    setTextValue(formatPhone(value as string || ''));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    setTextValue(formatPhone(digits));
    if (onChange) {
      onChange({ target: { value: digits } } as any);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const digits = textValue.replace(/\D/g, '');
    setTextValue(formatPhone(digits));
    if (onChange) onChange({ target: { value: digits } } as any);
    if (onBlur) onBlur(e);
  };

  return (
    <TextField
      {...props}
      type="tel"
      value={textValue}
      onChange={handleChange}
      onBlur={handleBlur}
      slotProps={{ inputLabel: { shrink: true }, ...props.slotProps }}
    />
  );
};
