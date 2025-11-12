import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import { LanguageCode } from '@/i18n/constants';

interface UpdateLanguageParams {
  userId: string;
  language: LanguageCode;
}

export const useUpdateUserLanguage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, language }: UpdateLanguageParams) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.auth.updateUser({
        data: { language }
      });

      if (error) throw error;

      return { language };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
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
