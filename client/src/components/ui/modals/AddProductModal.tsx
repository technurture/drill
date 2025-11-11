import React, { useContext, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddProduct } from "@/integrations/supabase/hooks/product-mutations";
import { StoreContext } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useStores } from "@/integrations/supabase/hooks/stores";
import SlideInModal from "../SlideInModal";
import { Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

// Full screen mobile component
const MobileAddProductScreen = ({ 
  open, 
  setOpen, 
  selectedStoreIds, 
  setSelectedStoreIds,
  stores,
  storesLoading,
  popoverOpen,
  setPopoverOpen,
  formContent 
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-[#18191A] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18191A]">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Product
          </h1>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {formContent}
      </div>
    </div>
  );
};

interface AddProductModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ open, setOpen }) => {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm();
  const theStore = useContext(StoreContext);
  const { user } = useAuth();
  const { data: stores, isLoading: storesLoading } = useStores(user?.id);
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const nameValue = useWatch({ control, name: "name" });
  const purchasedPriceValue = useWatch({ control, name: "purchased_price" });
  const retailValue = useWatch({ control, name: "unit_price" });
  const quantityValue = useWatch({ control, name: "quantity" });
  const thresholdValue = useWatch({ control, name: "low_stock_threshold" });

  const addProductMutation = useAddProduct();

  // Detect mobile screen size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    if (theStore?.id && stores) {
      setSelectedStoreIds([theStore.id]);
    }
  }, [theStore?.id, stores]);

  const onSubmit = async (data: any) => {
    console.log("AddProductModal onSubmit called with data:", data);
    console.log("Selected store IDs:", selectedStoreIds);
    
    if (selectedStoreIds.length === 0) {
      alert("Please select at least one store");
      return;
    }

    setIsLoading(true);
    try {
      const promises = selectedStoreIds.map(storeId => {
        const productData = {
          ...data,
          store_id: storeId,
        };
        console.log("Calling addProductMutation with:", productData);
        return addProductMutation.mutateAsync(productData);
      });

      await Promise.all(promises);
      console.log("All products added successfully");
      reset();
      setOpen(false);
      setSelectedStoreIds(theStore?.id ? [theStore.id] : []);
      toast.success('Product added successfully!');
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error('Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      <div className="grid gap-4">
        {/* Store Select Field - Always show if multiple stores */}
        {stores && stores.length > 1 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Stores</label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full justify-between text-left"
                  disabled={storesLoading || !stores || stores.length === 0}
                >
                  <span className={selectedStoreIds.length > 0 ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}>
                    {storesLoading
                      ? "Loading stores..."
                      : selectedStoreIds.length === 0
                      ? "Select store(s)"
                      : selectedStoreIds.length === 1
                      ? stores.find(s => s.id === selectedStoreIds[0])?.store_name
                      : `${selectedStoreIds.length} stores selected`}
                  </span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-2" align="start">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {stores && stores.length > 0 ? (
                    stores.map((store) => (
                      <div key={store.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                        <Checkbox
                          id={`store-${store.id}`}
                          checked={selectedStoreIds.includes(store.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedStoreIds(prev => [...prev, store.id]);
                            } else {
                              setSelectedStoreIds(prev => prev.filter(id => id !== store.id));
                            }
                          }}
                        />
                        <label 
                          htmlFor={`store-${store.id}`} 
                          className="text-sm font-medium cursor-pointer flex-1"
                        >
                          {store.store_name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">No stores found</div>
                  )}
                </div>
                <div className="border-t pt-2 mt-2">
                  <Button
                    type="button"
                    size="sm"
                    className="w-full"
                    onClick={() => setPopoverOpen(false)}
                  >
                    Done
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            {selectedStoreIds.length === 0 && (
              <p className="text-xs text-red-500">Please select at least one store</p>
            )}
          </div>
        )}

        {/* Form Fields */}
        <div className="flex flex-col gap-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
          </label>
          <Input
            className="w-full focus:outline-none focus:border-none"
            placeholder="Name"
            id="name"
            {...register("name", { required: true })}
          />
        </div>

        <div className="flex flex-col gap-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Purchased Price (This is the price at which you bought this product)
          </label>
          <Input
            id="purchased_price"
            placeholder="Purchased Price (optional)"
            type="number"
            className="w-full focus:outline-none focus:border-none"
            step="0.01"
            {...register("purchased_price", { required: false, min: 0, setValueAs: v => v === '' ? undefined : parseFloat(v) })}
          />
        </div>

        <div className="flex flex-col gap-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Unit Price (This is the price at which you sell this product)
          </label>
          <Input
            id="unit_price"
            placeholder="Unit Price (optional)"
            type="number"
            className="w-full focus:outline-none focus:border-none"
            step="0.01"
            {...register("unit_price", { required: false, min: 0, setValueAs: v => v === '' ? undefined : parseFloat(v) })}
          />
        </div>

        <div className="flex flex-col gap-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quantity (This is the quantity of the product in stock)
          </label>
          <Input
            id="quantity"
            placeholder="Quantity"
            type="number"
            step="0.1"
            className="w-full focus:outline-none focus:border-none"
            {...register("quantity", { required: true, min: 0, setValueAs: v => v === '' ? 0 : parseFloat(v) })}
          />
        </div>

        <div className="flex flex-col gap-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Low Stock Threshold (This is the quantity at which you will be notified to restock)
          </label>
          <Input
            id="low_stock_threshold"
            placeholder="Low Stock Threshold"
            type="number"
            className="w-full focus:outline-none focus:border-none"
            {...register("low_stock_threshold", { required: true, min: 0, setValueAs: v => v === '' ? 0 : parseFloat(v) })}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 max-w-[200px]">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || selectedStoreIds.length === 0} className="flex-1 max-w-[200px]">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Product"
          )}
        </Button>
      </div>
    </form>
  );

  // Mobile full screen
  if (isMobile) {
    return (
      <MobileAddProductScreen
        open={open}
        setOpen={setOpen}
        selectedStoreIds={selectedStoreIds}
        setSelectedStoreIds={setSelectedStoreIds}
        stores={stores}
        storesLoading={storesLoading}
        popoverOpen={popoverOpen}
        setPopoverOpen={setPopoverOpen}
        formContent={formContent}
      />
    );
  }

  // Desktop slide-in modal
  return (
    <SlideInModal
      isOpen={open}
      onClose={() => setOpen(false)}
      title="Add Product"
      width="w-[400px]"
    >
      {formContent}
    </SlideInModal>
  );
};

export default AddProductModal;
