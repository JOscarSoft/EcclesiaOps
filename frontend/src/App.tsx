import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline } from '@mui/material';
import { getTheme } from './core/theme';
import { useUiStore } from './stores/uiStore';
import { useEffect } from 'react';
import './core/i18n';
import { useTranslation } from 'react-i18next';
import { AppRouter } from './routes';

const queryClient = new QueryClient();

function App() {
  const { mode, language } = useUiStore();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={getTheme(mode)}>
        <CssBaseline />
        <AppRouter />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
