import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  RefreshCw,
  Trash2,
  ChevronRight,
  ArrowLeft,
  X,
} from "lucide-react";
import { formatNumber } from "@/utils/formatNumber";
import { useState } from "react";
import { useToggleFavouriteProduct } from "@/integrations/supabase/hooks/product-mutations";
import { Switch } from "@/components/ui/switch";
import { useProducts } from "@/integrations/supabase/hooks/products";
import { StoreContext } from "@/contexts/StoreContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const ProductMobileView = ({
  product,
  onEdit,
  onRestock,
  onDelete,
  canEditInventory,
  favouriteCount = 0,
}) => {
  const { t } = useTranslation('pages');
  const [isOpen, setIsOpen] = React.useState(false);
  const [favLimitAlert, setFavLimitAlert] = useState(false);
  const toggleFavouriteMutation = useToggleFavouriteProduct();
  const theStore = React.useContext(StoreContext);
  const { refetch } = useProducts(theStore?.id || "");

  const handleToggleFavourite = () => {
    if (!product.favourite && favouriteCount >= 10) {
      toast.error("Sorry, you cannot add more than 10 product to favourite");
      return;
    }
    toggleFavouriteMutation.mutate({
      id: product.id,
      favourite: !product.favourite,
      store_id: product.store_id,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center justify-between p-4 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
          <div className="flex items-center space-x-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {product.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {product.category || t('inventory.noCategory')}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </DialogTrigger>
      <DialogContent className="w-full h-full max-w-none max-h-none m-0 rounded-none p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-[#18191A] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-lg font-semibold">{t('inventory.productDetails')}</DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Product Image */}
          {product.product_image && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t('inventory.productImage')}
              </h4>
              <div className="flex justify-center">
                <img
                  src={product.product_image}
                  alt={product.name}
                  className="w-48 h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>
          )}
          
          {/* Product Information */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                {t('inventory.productName')}
              </h4>
              <p className="mt-1 text-lg font-medium">{product.name}</p>
            </div>
            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('inventory.unitPriceLabel')}</span>
                <span className="text-sm font-medium">₦{formatNumber(product.unit_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('inventory.quantityLabel')}</span>
                <span className="text-sm font-medium">{product.quantity}</span>
              </div>
            </div>
            <Separator />

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                {t('inventory.lowStockThreshold')}
              </h4>
              <p className="mt-1">{product.low_stock_threshold}</p>
            </div>
            <Separator />

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                {t('inventory.stockStatus')}
              </h4>
              <div className="mt-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  product.quantity <= product.low_stock_threshold
                      ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                      : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                }`}
              >
                {product.quantity <= product.low_stock_threshold
                  ? t('inventory.lowStock')
                  : t('inventory.inStock')}
                </span>
              </div>
            </div>
            <Separator />

            {/* Favourite Switch */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  {t('inventory.addToFavourites')}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('inventory.markAsFavourite')}
                </p>
          </div>
            <Switch
              checked={!!product.favourite}
              onCheckedChange={(checked) => {
                if (checked && favouriteCount >= 10) {
                  toast.error("Sorry, you cannot add more than 10 product to favourite");
                  return;
                }
                toggleFavouriteMutation.mutate({
                  id: product.id,
                  favourite: checked,
                  store_id: product.store_id,
                }, {
                  onSettled: () => refetch()
                });
              }}
              aria-label={product.favourite ? t('inventory.removeFromFavourite') : t('inventory.setAsFavourite')}
              disabled={toggleFavouriteMutation.isPending}
            />
            </div>
          </div>

          {favLimitAlert && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
              You can only have 10 favourite products.
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <div className="grid grid-cols-1 gap-3">
            {canEditInventory && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    onEdit(product);
                    setIsOpen(false);
                  }}
                  className="h-12 w-full"
                >
                <Edit size={16} className="mr-2" />
                  {t('inventory.editProduct')}
              </Button>
            )}
              <Button 
                variant="outline" 
                onClick={() => {
                  onRestock(product);
                  setIsOpen(false);
                }}
                className="h-12 w-full"
              >
              <RefreshCw size={16} className="mr-2" />
                {t('inventory.restockProduct')}
            </Button>
            {canEditInventory && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    onDelete(product);
                    setIsOpen(false);
                  }}
                  className="h-12 w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                <Trash2 size={16} className="mr-2" />
                  {t('inventory.deleteProduct')}
              </Button>
            )}
            </div>
          </div>

          {/* Bottom padding for safe area */}
          <div className="h-4"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductMobileView;
