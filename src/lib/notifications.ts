import { toast } from 'sonner';
import { translations, Language } from '@/config/translations';

const LANGUAGE_STORAGE_KEY = 'app-language';

function getLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'pl' || stored === 'en') {
      return stored;
    }
  }
  return 'pl';
}

function getTranslations() {
  return translations[getLanguage()];
}

export function showSuccessNotification() {
  const t = getTranslations();
  toast.success(t.operationSuccess);
}

export function showErrorNotification() {
  const t = getTranslations();
  toast.error(t.operationError);
}
