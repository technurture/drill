import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@nextui-org/select";
import { useStores } from "@/integrations/supabase/hooks/stores";
import { useAuth } from "@/contexts/AuthContext";
import {
  StoreContext,
  deviceToken,
  setStoreContext,
} from "@/contexts/StoreContext";
import { useAddNotification } from "@/integrations/supabase/hooks/notifications";
import { format } from "date-fns";
import { sendPushNotification } from "@/utils/pushNotification";
import { useTranslation } from "react-i18next";

export const StoreSelector = ({ onClose }: { onClose?: () => void }) => {
  const { t } = useTranslation('navigation');
  const { user, loginState, setLoginState } = useAuth();
  const theStore = useContext(StoreContext);
  const deviceTOk = useContext(deviceToken);
  const addNotification = useAddNotification();
  const setStore = useContext(setStoreContext);
  
  const pushNotification = (message: string, title: string) => {
    if (deviceTOk) {
      for (const device of deviceTOk) {
        sendPushNotification(device?.token, message, title, "/dashboard/notes");
      }
    }
  };
  
  const navigate = useNavigate();
  const { data: stores, isLoading: storesLoading } = useStores(user?.id || "");

  useEffect(() => {
    if (loginState) {

    }
      }, [loginState, theStore]);

  const handleStoreChange = (selectedStore) => {
    setStore.setStore(selectedStore);
    onClose?.();
  };

  const handleAddNewStore = () => {
    navigate("/create-store");
    onClose?.();
  };

  return (
    <div className="px-4 mb-6">
      {stores?.length > 0 && theStore && user && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6  text-green-600  dark:text-green-400 rounded-lg flex items-center justify-center">
              <Store size={12} />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('storeSelector.activeStore')}
            </span>
          </div>
          <Select
            value={theStore?.id}
            aria-labelledby="Select Store"
            onSelectionChange={(selectedId) => {
              const selectedStore = stores.find(
                (store) => store.id === selectedId?.currentKey,
              );
              handleStoreChange(selectedStore);
            }}
            placeholder={theStore?.store_name || t('storeSelector.selectStore')}
            classNames={{
              trigger:
                "!h-12 !px-4 !pr-10 !flex !items-center !justify-between !rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-500 transition-colors",
              value:
                "!text-sm !text-gray-900 dark:!text-gray-100 group-data-[has-value=true]:!font-medium !pr-2",
              selectorIcon: "text-gray-500 dark:text-gray-400 size-4 !absolute !right-3",
              listbox:
                "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2 shadow-lg",
            }}
          >
            {stores?.map((store) => (
              <SelectItem
                className=""
                classNames={{
                  base: "data-[hover=true]:!bg-gray-50 dark:data-[hover=true]:!bg-gray-700 rounded-lg data-[selected=true]:!bg-blue-50 dark:data-[selected=true]:!bg-blue-900/20 !outline-none",
                  title: "text-sm font-medium",
                }}
                key={store.id}
                value={store.id}
              >
                {store.store_name}
              </SelectItem>
            ))}
          </Select>
          
          {/* Add New Store Button */}
          <Button
            onClick={handleAddNewStore}
            variant="outline"
            size="sm"
            className="w-full h-10 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-all duration-200"
          >
            <Plus size={16} className="mr-2" />
            {t('storeSelector.addNewStore')}
          </Button>
        </div>
      )}
    </div>
  );
};
