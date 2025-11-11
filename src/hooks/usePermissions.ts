import { useAuth } from "@/contexts/AuthContext";
export const usePermissions = () => {
  

  return {
    canViewInventory: true,
    canEditInventory: true,
    canAddSales: true,
    canEditSales: true,
  };
};
