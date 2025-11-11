import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { toast } from 'sonner';

// Types
export interface AdminStats {
  total_users: number;
  total_agents: number;
  total_stores: number;
  total_help_articles: number;
  draft_help_articles: number;
  total_help_views: number;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  name: string;
  is_agent: boolean;
  registered_by: string;
  store_count: number;
  sales_count: number;
  products_count: number;
  gender?: string;
  age_range?: string;
  total_sales_value?: number;
}

export interface AdminStore {
  id: string;
  store_name: string;
  description: string;
  created_at: string;
  updated_at: string;
  owner_email: string;
  owner_name: string;
  owner_is_agent: boolean;
  products_count: number;
  sales_count: number;
  total_revenue: number;
}

export interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  category_id: string;
  language: 'english' | 'yoruba' | 'hausa' | 'igbo' | 'pidgin';
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  views_count: number;
  media_links: string[];
  notes: string;
  important_sections: any[];
  created_by: string;
  created_at: string;
  updated_at: string;
  category?: HelpCategory;
}

// Admin Stats Hook
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      const { data, error } = await supabase
        .from('admin_dashboard_stats')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
  });
};

// Admin Users Hook
export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<AdminUser[]> => {
      const { data, error } = await supabase
        .from('admin_user_management')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

// Admin Stores Hook
export const useAdminStores = () => {
  return useQuery({
    queryKey: ['admin-stores'],
    queryFn: async (): Promise<AdminStore[]> => {
      const { data, error } = await supabase
        .from('admin_store_management')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

// Help Categories Hook
export const useHelpCategories = () => {
  return useQuery({
    queryKey: ['help-categories'],
    queryFn: async (): Promise<HelpCategory[]> => {
      const { data, error } = await supabase
        .from('help_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });
};

// Help Articles Hook
export const useHelpArticles = (filters?: {
  category_id?: string;
  language?: string;
  status?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['help-articles', filters],
    queryFn: async (): Promise<HelpArticle[]> => {
      let query = supabase
        .from('help_articles')
        .select(`
          *,
          category:help_categories(*)
        `)
        .order('created_at', { ascending: false });

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters?.language) {
        query = query.eq('language', filters.language);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
};

// Published Help Articles Hook (for users)
export const usePublishedHelpArticles = (filters?: {
  category_id?: string;
  language?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['published-help-articles', filters],
    queryFn: async (): Promise<HelpArticle[]> => {
      let query = supabase
        .from('help_articles')
        .select(`
          *,
          category:help_categories(*)
        `)
        .eq('status', 'published')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters?.language) {
        query = query.eq('language', filters.language);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
};

// Mutations

// Update User Agent Status
export const useUpdateUserAgentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, isAgent }: { userId: string; isAgent: boolean }) => {
      const { error } = await supabase
        .from('users')
        .update({ is_agent: isAgent })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User agent status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update user agent status');
      console.error('Update agent status error:', error);
    },
  });
};

// Delete User
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete user');
      console.error('Delete user error:', error);
    },
  });
};

// Create Help Category
export const useCreateHelpCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: Omit<HelpCategory, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('help_categories')
        .insert(category);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-categories'] });
      toast.success('Help category created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create help category');
      console.error('Create category error:', error);
    },
  });
};

// Create Help Article
export const useCreateHelpArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    // Accepts partial article; created_by will be filled from auth if missing
    mutationFn: async (article: Partial<Omit<HelpArticle, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'category'>> & { created_by?: string }) => {
      // Ensure created_by is a valid UUID from the current authenticated user
      let createdBy = article.created_by;
      if (!createdBy) {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        createdBy = authData?.user?.id;
      }
      if (!createdBy) {
        throw new Error('You must be signed in to create help articles.');
      }

      const payload = { ...article, created_by: createdBy } as any;

      const { error } = await supabase
        .from('help_articles')
        .insert(payload);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-articles'] });
      queryClient.invalidateQueries({ queryKey: ['published-help-articles'] });
      toast.success('Help article created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create help article');
      console.error('Create article error:', error);
    },
  });
};

// Update Help Article
export const useUpdateHelpArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...article }: Partial<HelpArticle> & { id: string }) => {
      const { error } = await supabase
        .from('help_articles')
        .update(article)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-articles'] });
      queryClient.invalidateQueries({ queryKey: ['published-help-articles'] });
      toast.success('Help article updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update help article');
      console.error('Update article error:', error);
    },
  });
};

// Delete Help Article
export const useDeleteHelpArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (articleId: string) => {
      const { error } = await supabase
        .from('help_articles')
        .delete()
        .eq('id', articleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-articles'] });
      queryClient.invalidateQueries({ queryKey: ['published-help-articles'] });
      toast.success('Help article deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete help article');
      console.error('Delete article error:', error);
    },
  });
};

// Increment Help Article Views
export const useIncrementHelpViews = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ articleId, userId }: { articleId: string; userId?: string }) => {
      const { error } = await supabase.rpc('increment_help_views', {
        article_uuid: articleId,
        user_uuid: userId
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-articles'] });
      queryClient.invalidateQueries({ queryKey: ['published-help-articles'] });
    },
  });
}; 

// Markets management hooks
export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });
};

export const useMarkets = () => {
  return useQuery({
    queryKey: ['markets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });
};



export const useCreateMarket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ locationId, name }: { locationId: string; name: string }) => {
      const { data, error } = await supabase
        .from('markets')
        .insert([
          {
            location_id: locationId,
            name: name.trim()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      queryClient.invalidateQueries({ queryKey: ['markets-by-location'] });
    }
  });
};

export const useDeleteMarket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (marketId: string) => {
      const { data, error } = await supabase
        .from('markets')
        .delete()
        .eq('id', marketId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      queryClient.invalidateQueries({ queryKey: ['markets-by-location'] });
    }
  });
};

// Enhanced store statistics hook
export const useStoreStatistics = () => {
  return useQuery({
    queryKey: ['store-statistics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_statistics')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

// Enhanced admin stores hook with filtering
export const useAdminStoresWithFilters = (filters: {
  locationId?: string;
  marketId?: string;
  searchTerm?: string;
}) => {
  return useQuery({
    queryKey: ['admin-stores', filters],
    queryFn: async () => {
      let query = supabase
        .from('store_statistics')
        .select('*');
      
      if (filters.locationId) {
        query = query.eq('location_id', filters.locationId);
      }
      
      if (filters.marketId) {
        query = query.eq('market_id', filters.marketId);
      }
      
      if (filters.searchTerm) {
        query = query.or(`store_name.ilike.%${filters.searchTerm}%,owner_email.ilike.%${filters.searchTerm}%,owner_name.ilike.%${filters.searchTerm}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}; 

// Activity log hooks
export const useAdminActivityLog = (limit: number = 10) => {
  return useQuery({
    queryKey: ['admin-activity-log', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_recent_admin_activities', { limit_count: limit });
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};

export const useLogAdminActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      activityType, 
      description, 
      userId, 
      storeId, 
      metadata 
    }: {
      activityType: string;
      description: string;
      userId?: string;
      storeId?: string;
      metadata?: any;
    }) => {
      const { data, error } = await supabase
        .rpc('log_admin_activity', {
          activity_type: activityType,
          description,
          user_id: userId,
          store_id: storeId,
          metadata: metadata || {}
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-activity-log'] });
    }
  });
}; 