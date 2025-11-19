import React, { useContext, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateProduct } from "@/integrations/supabase/hooks/product-mutations";
import { StoreContext } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import SlideInModal from "../SlideInModal";
import { Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

// Full screen mobile component
const MobileEditProductScreen = ({ 
  open, 
  setOpen, 
  product,
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
            Edit Product
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

interface EditProductModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  product: any;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ open, setOpen, product }) => {
  const { register, handleSubmit, reset, control, setValue } = useForm();
  const theStore = useContext(StoreContext);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const nameValue = useWatch({ control, name: "name" });
  const purchasedPriceValue = useWatch({ control, name: "purchased_price" });
  const retailValue = useWatch({ control, name: "unit_price" });
  const wholesaleValue = useWatch({ control, name: "wholesale_price" });
  const quantityValue = useWatch({ control, name: "quantity" });
  const thresholdValue = useWatch({ control, name: "low_stock_threshold" });

  const updateProductMutation = useUpdateProduct();

  // Detect mobile screen size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Initialize form with product data
  useEffect(() => {
    if (product && open) {
      reset({
        name: product.name || "",
        purchased_price: product.purchased_price || "",
        unit_price: product.unit_price || "",
        wholesale_price: product.wholesale_price || "",
        quantity: product.quantity || "",
        low_stock_threshold: product.low_stock_threshold || "",
      });
      
      // No image handling
    }
  }, [product, open, reset]);

  const onSubmit = async (data: any) => {
    if (!product?.id) {
      toast.error("Product ID is required");
      return;
    }

    if (!theStore?.id) {
      toast.error("Store ID is required");
      return;
    }

    const updateData: any = {
      id: product.id,
      store_id: theStore.id,
      ...data,
    };

    const currentlyOnline = typeof navigator !== 'undefined' && navigator.onLine;

    if (!currentlyOnline) {
      setIsLoading(true);
      updateProductMutation.mutate(updateData);
      setOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      await updateProductMutation.mutateAsync(updateData);

      setOpen(false);
      toast.success('Product updated successfully!');
      
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error('Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      <div className="grid gap-4">
        {/* Form Fields */}
        <div className="flex flex-col gap-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
          </label>
          <Input
            className={`w-full focus:outline-none focus:border-none`}
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
            className={`w-full focus:outline-none focus:border-none`}
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
            className={`w-full focus:outline-none focus:border-none`}
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
            className={`w-full focus:outline-none focus:border-none`}
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
            className={`w-full focus:outline-none focus:border-none`}
            {...register("low_stock_threshold", { required: true, min: 0, setValueAs: v => v === '' ? 0 : parseFloat(v) })}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Product"
          )}
        </Button>
      </div>
    </form>
  );

  // Mobile full screen
  if (isMobile) {
    return (
      <MobileEditProductScreen
        open={open}
        setOpen={setOpen}
        product={product}
        formContent={formContent}
      />
    );
  }

  // Desktop slide-in modal
  return (
    <SlideInModal
      isOpen={open}
      onClose={() => setOpen(false)}
      title="Edit Product"
      width="w-[400px]"
    >
      {formContent}
    </SlideInModal>
  );
};

export default EditProductModal;
