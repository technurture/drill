import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Store } from "@/types/database.types";
import { useStore as useStoreData, useStores } from "@/integrations/supabase/hooks/stores";
import { useAuth } from "./AuthContext";
import { useGetDeviceToken } from "@/integrations/supabase/hooks/notifications";
import { supabase } from "@/integrations/supabase/supabase";

type RequestContextProviderType = {
  setStore: (request: Store) => void;
};

export const StoreContext = createContext<Store | undefined>(undefined);
export const setStoreContext = createContext<
  RequestContextProviderType | undefined
>(undefined);
export const deviceToken = createContext(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [selectedStore, setSelectedStore] = useState<Store>();
  const { user } = useAuth();
  const { data: stores } = useStores(user?.id || "");
  const { data: token } = useGetDeviceToken(selectedStore?.owner_id);
  const [tokens, setTokens] = useState();
  
  // Debug logging
  console.log("StoreContext - User:", user);
  console.log("StoreContext - Stores:", stores);
  console.log("StoreContext - Selected store:", selectedStore);

  // Load the stored store ID from localStorage on initial mount

  // Add subscription to store changes
  useEffect(() => {
    if (!selectedStore?.id) return;

    const subscription = supabase
      .channel('store_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stores',
          filter: `id=eq.${selectedStore.id}`,
        },
        async (payload) => {
          // Update the selected store with new data
          setSelectedStore(current => ({
            ...current,
            ...payload.new,
          }));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedStore?.id]);

  useEffect(() => {
    const storedStoreId = localStorage.getItem("selectedStoreId");
    if (user) {
      if (storedStoreId && stores) {
        const store = stores.find((s) => s.id === storedStoreId);
        if (store) {
          setSelectedStore(store);
        }
      } else if (stores && stores.length > 0 && !selectedStore) {
        // Only set first store if no store is selected and no stored ID exists
        setSelectedStore(stores[0]);
        localStorage.setItem("selectedStoreId", stores[0].id);
      }
    }
  }, [stores]);


  const setStore = (store: Store) => {
    setSelectedStore(store);
    localStorage.setItem("selectedStoreId", store.id);
  };

  return (
    <StoreContext.Provider value={selectedStore}>
      <setStoreContext.Provider value={{ setStore }}>
        <deviceToken.Provider value={tokens}>{children}</deviceToken.Provider>
      </setStoreContext.Provider>
    </StoreContext.Provider>
  );
};

// Hook to use the store context
export const useStore = () => {
  const context = useContext(StoreContext);
  // Do not throw; allow undefined during initial load and when no store is selected
  return context;
};

