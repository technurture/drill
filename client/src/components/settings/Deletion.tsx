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

const Deletion = ({ storeId }: { storeId: string }) => {
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
          toast.success("Store deleted successfully");
        });
      } catch (error) {
        toast.error("Failed to delete Store");
      }
    } else {
      toast.error(
        "Failed to delete store, minimum number of store can only be 1 !!!",
      );
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync(user?.id).then(() => {
        navigate("/signup");
        toast.success("Account deleted successfully");
      });
    } catch (error) {
      toast.error("Failed to delete Account");
    }
  };

  return (
    <Card className="bg-destructive/5 border-destructive/20">
      <CardHeader>
        <CardTitle className="text-sm text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        <div className="rounded-lg border border-destructive/30 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm md:text-sm font-semibold text-destructive">
                Delete Store
              </h3>
              <p className="text-sm text-muted-foreground max-w-[500px]">
                This action will permanently delete your store and all its data
                including sales, inventory, and notes. This action cannot be
                undone.
              </p>
            </div>
            <DeleteDialog
              actionStatement="Delete Store"
              details="This action will permanently delete your store and all its data. This cannot be undone."
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
                Delete Account
              </h3>
              <p className="text-sm text-muted-foreground max-w-[500px]">
                This action will permanently delete your account and all
                associated stores, sales, inventory, and notes. This action
                cannot be undone.
              </p>
            </div>
            <DeleteDialog
              actionStatement="Delete Account"
              details="This action will permanently delete your account and all associated data. This cannot be undone."
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
