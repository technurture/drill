import React, { useState } from "react";
import NotificationList from "@/components/notifications/NotificationList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  BellRing, 
  CheckCircle2, 
  Sparkles,
  MailOpen
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useContext } from "react";
import { StoreContext } from "@/contexts/StoreContext";
import { useNotifications } from "@/integrations/supabase/hooks/notifications";
import { useTranslation } from 'react-i18next';

const Notifications = () => {
  const { t } = useTranslation('pages');
  const { user } = useAuth();
  const theStore = useContext(StoreContext);
  const { data: notifications = [] } = useNotifications(user?.id || "", theStore?.id || "");
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;
  
    return (
    <div className="min-h-screen bg-white dark:bg-[#18191A]">
      <div className="container mx-auto p-2 sm:p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col items-start text-left gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-start space-x-3">
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {t('notification.title')}
                </h1>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <div className="flex items-center justify-center space-x-2">
                <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {unreadCount} {t('notification.newNotification')}{unreadCount !== 1 ? 's' : ''}
                </Badge>
              </div>
            )}
          </div>
        </div>
        
        {/* Notifications Content */}
        <div className="bg-white dark:bg-[#18191A] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <Tabs defaultValue="all" className="w-full">
            <div className="border-b border-gray-200 dark:border-gray-700 px-2 py-4">
              <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto">
                <TabsTrigger value="all" className="flex items-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span>{t('notification.all')}</span>
                </TabsTrigger>
                <TabsTrigger value="unread" className="flex items-center space-x-2">
                  <BellRing className="w-4 h-4" />
                  <span>{t('notification.unread')}</span>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="read" className="flex items-center space-x-2">
                  <MailOpen className="w-4 h-4" />
                  <span>{t('notification.read')}</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="m-0">
              <div className="p-2">
            <NotificationList />
              </div>
            </TabsContent>
            
            <TabsContent value="unread" className="m-0">
              <div className="p-2">
                <NotificationList filter="unread" />
              </div>
            </TabsContent>
            
            <TabsContent value="read" className="m-0">
              <div className="p-2">
                <NotificationList filter="read" />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Notifications;