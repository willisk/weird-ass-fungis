import React from 'react';
import { styled, MenuItem, Button, TextField, Stack, InputAdornment } from '@mui/material';

import DateTimePicker from '@mui/lab/DateTimePicker';

const StyledStack = styled(Stack)(({ theme }) => ({
  padding: '2em 1em',
  maxWidth: 600,
  margin: 'auto',
  textAlign: 'center',
}));

export const SStack = (props) => <StyledStack spacing={2} {...props} />;
export const STextField = (props) => <TextField variant="outlined" {...props} />;
export const STextFieldReadOnly = (props) => (
  <STextField
    variant="standard"
    inputProps={{
      readOnly: true,
    }}
    {...props}
  />
);
export const SDateTimePicker = ({ error, helperText, ...props }) => (
  <DateTimePicker
    {...props}
    renderInput={(params) => <STextField {...params} error={error} helperText={helperText} />}
  />
);
