import { createContext, ReactNode, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useUser } from "@/integrations/supabase/hooks/users";

type RequestContextProviderType = {
  setStatus: (section: string, value: any) => void;
};

export const ObscurityContext = createContext<{
  main: boolean | null;
  inventory: boolean | null;
  sales: boolean | null;
} | null>(null);

export const setObsurityContext = createContext<
  RequestContextProviderType | undefined
>(undefined);

export const ObscurityProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { data: admin } = useUser(user?.id);
  const [obs, setObs] = useState<{
    main: boolean | null;
    inventory: boolean | null;
    sales: boolean | null;
  } | null>(null);
  
  useEffect(() => {
    if (admin) {
      setObs((prev) => ({
        ...prev,
        main: admin?.hide_balance,
        inventory: admin?.hide_balance,
        sales: admin?.hide_balance,
      }));
    }
  }, [user, admin]);
  
  const setStatus = (section: string, value: any) => {
    if (section === "main") {
      setObs((prev) => ({ ...prev, main: value }));
    } else if (section === "inventory") {
      setObs((prev) => ({ ...prev, inventory: value }));
    } else if (section === "sales") {
      setObs((prev) => ({ ...prev, sales: value }));
    }
  };
  
  return (
    <setObsurityContext.Provider value={{ setStatus }}>
      <ObscurityContext.Provider value={obs}>
        {children}
      </ObscurityContext.Provider>
    </setObsurityContext.Provider>
  );
};

export default ObscurityProvider;
