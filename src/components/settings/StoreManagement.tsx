import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Copy, Edit2 } from "lucide-react";
import { Store } from "../../types/database.types";
import {
  useDuplicateStore,
  useUpdateStoreName,
} from "../../integrations/supabase/hooks/stores";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface StoreManagementProps {
  store: Store | undefined;
  isEditingName: boolean;
  newStoreName: string;
  storeLocation: string;
  setNewStoreName: (name: string) => void;
  setNewStoreLocation: (name: string) => void;
  setIsEditingName: (isEditing: boolean) => void;
  handleUpdateStoreName: () => void;
}

const StoreManagement = ({
  store,
  isEditingName,
  newStoreName,
  storeLocation,
  setNewStoreName,
  setNewStoreLocation,
  setIsEditingName,
  handleUpdateStoreName,
}: StoreManagementProps) => {
  const [isDuplicating, setIsDuplicating] = useState(false);
  const duplicateStore = useDuplicateStore();
  const navigate = useNavigate();

  const handleDuplicateStore = async (duplicateName: string) => {
    if (!store?.id || !store?.owner_id) return;
    setIsDuplicating(true);
    try {
      await duplicateStore
        .mutateAsync({
          storeId: store.id,
          newStoreName: duplicateName,
          ownerId: store.owner_id,
          newStoreLocation: storeLocation,
        })
        .then(() => {
          navigate("/dashboard");
          toast.success("Store duplicated successfully");
        })
        .catch((error) => {
          toast.error(error?.message || "Error duplicating store");
        });
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <Card className="bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
      <CardContent>
        <div className="space-y-6 pt-6">
          <div className="space-y-1 w-full flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 font-semibold">
              Store Name
            </h3>
            <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
              {isEditingName ? (
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <Input
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button onClick={handleUpdateStoreName}>Save</Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingName(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 flex-grow">
                  <p className="text-[16px]">{store?.store_name}</p>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsEditingName(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreManagement;
