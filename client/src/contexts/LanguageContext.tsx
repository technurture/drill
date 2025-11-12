import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LanguageCode, 
  DEFAULT_LANGUAGE, 
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES 
} from '@/i18n/constants';
import { useAuth } from './AuthContext';
import { useUpdateUserLanguage } from '@/integrations/supabase/hooks/user-language';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  tSubheading: (key: string, options?: any) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { i18n, t } = useTranslation('subheadings');
  const { user } = useAuth();
  const updateLanguageMutation = useUpdateUserLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored && stored in SUPPORTED_LANGUAGES) {
        return stored as LanguageCode;
      }
    }
    return DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    if (language !== i18n.language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  useEffect(() => {
    if (user?.user_metadata?.language) {
      const userLang = user.user_metadata.language as LanguageCode;
      if (userLang in SUPPORTED_LANGUAGES && userLang !== language) {
        setLanguageState(userLang);
      }
    }
  }, [user]);

  const setLanguage = async (newLang: LanguageCode) => {
    try {
      setIsLoading(true);
      
      setLanguageState(newLang);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
      }
      await i18n.changeLanguage(newLang);

      if (user?.id) {
        await updateLanguageMutation.mutateAsync({ 
          userId: user.id, 
          language: newLang 
        });
      }
    } catch (error) {
      console.error('Failed to update language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tSubheading = (key: string, options?: any): string => {
    return String(t(key, options));
  };

  const value = {
    language,
    setLanguage,
    tSubheading,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
