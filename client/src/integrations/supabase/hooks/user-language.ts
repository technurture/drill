import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import { LanguageCode } from '@/i18n/constants';
import { sendNotificationToStore } from '@/lib/notificationHelper';

interface UpdateLanguageParams {
  userId: string;
  language: LanguageCode;
  storeId?: string;
}

export const useUpdateUserLanguage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, language, storeId }: UpdateLanguageParams) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.auth.updateUser({
        data: { language }
      });

      if (error) throw error;

      return { language, storeId };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });

      // Send notification about language change
      if (data.storeId) {
        try {
          const languageNames: Record<LanguageCode, string> = {
            'en': 'English',
            'yo': 'Yoruba',
            'ha': 'Hausa',
            'ig': 'Igbo',
            'pidgin': 'Pidgin English'
          };
          
          await sendNotificationToStore(
            data.storeId,
            `Language changed to ${languageNames[data.language] || data.language}`,
            "language_change",
            "/dashboard/settings"
          );
        } catch (error) {
          console.error("Failed to send language change notification:", error);
        }
      }
    },
    onError: (error) => {
      console.error('Failed to update language preference:', error);
    }
  });
};

export const useGetUserLanguage = (userId: string | undefined) => {
  return async (): Promise<LanguageCode | null> => {
    if (!userId) return null;

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) return null;

      return (user.user_metadata?.language as LanguageCode) || null;
    } catch (error) {
      console.error('Failed to get user language:', error);
      return null;
    }
  };
};
