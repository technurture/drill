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

  const getUserStorageKey = (userId?: string) => {
    return userId ? `${LANGUAGE_STORAGE_KEY}-${userId}` : LANGUAGE_STORAGE_KEY;
  };

  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    if (language !== i18n.language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  useEffect(() => {
    if (user?.id) {
      const userStorageKey = getUserStorageKey(user.id);
      
      if (user.user_metadata?.language) {
        const userLang = user.user_metadata.language as LanguageCode;
        if (userLang in SUPPORTED_LANGUAGES) {
          setLanguageState(userLang);
          if (typeof window !== 'undefined') {
            localStorage.setItem(userStorageKey, userLang);
          }
          return;
        }
      }
      
      if (typeof window !== 'undefined') {
        const userStored = localStorage.getItem(userStorageKey);
        if (userStored && userStored in SUPPORTED_LANGUAGES) {
          if (userStored !== language) {
            setLanguageState(userStored as LanguageCode);
          }
          return;
        }
      }
      
      if (language !== DEFAULT_LANGUAGE) {
        setLanguageState(DEFAULT_LANGUAGE);
      }
    } else {
      if (typeof window !== 'undefined') {
        const guestStored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (guestStored && guestStored in SUPPORTED_LANGUAGES) {
          if (guestStored !== language) {
            setLanguageState(guestStored as LanguageCode);
          }
          return;
        }
      }
      
      if (language !== DEFAULT_LANGUAGE) {
        setLanguageState(DEFAULT_LANGUAGE);
      }
    }
  }, [user]);

  const setLanguage = async (newLang: LanguageCode) => {
    try {
      setIsLoading(true);
      
      setLanguageState(newLang);
      if (typeof window !== 'undefined') {
        const storageKey = getUserStorageKey(user?.id);
        localStorage.setItem(storageKey, newLang);
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
