import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DeleteDialog from "./DeleteDialog";
import {
  useDeleteStore,
  useStores,
} from "@/integrations/supabase/hooks/stores";
import toast from "react-hot-toast";
import { useDeleteUser } from "@/integrations/supabase/hooks/users";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase";
import { setStoreContext } from "@/contexts/StoreContext";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

const Deletion = ({ storeId }: { storeId: string }) => {
  const { t } = useTranslation('pages');
  const deleteStore = useDeleteStore();
  const deleteAccount = useDeleteUser();
  const navigate = useNavigate();
  const { user } = useAuth();
  const setStore = useContext(setStoreContext);
  const { data: stores } = useStores(user?.id);

  // Get current store name
  const currentStore = stores?.find(store => store.id === storeId);

  const handleDeleteStore = async () => {
    if (stores.length > 1) {
      try {
        await deleteStore.mutateAsync({ id: storeId }).then(() => {
          supabase
            .from("stores")
            .select("*")
            .eq("owner_id", user?.id)
            .then((res) => {
              if (res.data.length > 0) {
                navigate("/dashboard");
                setStore.setStore(res.data[0]);
                localStorage.setItem("selectedStoreId", res.data[0].id);
              } else {
                navigate("/create-store");
              }
            });
          toast.success(t('settings.storeDeletedSuccess'));
        });
      } catch (error) {
        toast.error(t('settings.failedToDeleteStore'));
      }
    } else {
      toast.error(t('settings.minimumStoreError'));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync(user?.id).then(() => {
        navigate("/signup");
        toast.success(t('settings.accountDeletedSuccess'));
      });
    } catch (error) {
      toast.error(t('settings.failedToDeleteAccount'));
    }
  };

  return (
    <Card className="bg-destructive/5 border-destructive/20">
      <CardHeader>
        <CardTitle className="text-sm text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {t('settings.dangerZone')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        <div className="rounded-lg border border-destructive/30 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm md:text-sm font-semibold text-destructive">
                {t('settings.deleteStore')}
              </h3>
              <p className="text-sm text-muted-foreground max-w-[500px]">
                {t('settings.deleteStoreWarning')}
              </p>
            </div>
            <DeleteDialog
              actionStatement={t('settings.deleteStoreAction')}
              details={t('settings.deleteStoreConfirm')}
              action={handleDeleteStore}
              type="store"
              storeName={currentStore?.store_name}
            />
          </div>
        </div>

        <div className="rounded-lg border border-destructive/30 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-md md:text-md font-semibold text-destructive">
                {t('settings.deleteAccount')}
              </h3>
              <p className="text-sm text-muted-foreground max-w-[500px]">
                {t('settings.deleteAccountWarning')}
              </p>
            </div>
            <DeleteDialog
              actionStatement={t('settings.deleteAccountAction')}
              details={t('settings.deleteAccountConfirm')}
              action={handleDeleteAccount}
              type="account"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Deletion;
