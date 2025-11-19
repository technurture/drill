import React, { useContext } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, RefreshCw, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePermissions } from "../../hooks/usePermissions";
import ProductMobileView from "./ProductMobileView";
import { formatNumber } from "@/utils/formatNumber";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToggleFavouriteProduct } from "@/integrations/supabase/hooks/product-mutations";
import { Switch } from "@/components/ui/switch";
import { useProducts } from "@/integrations/supabase/hooks/products";
import { StoreContext } from "@/contexts/StoreContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const ProductTable = ({
  products,
  onEdit,
  onRestock,
  onDelete,
  stockFilter,
}) => {
  const { t } = useTranslation('pages');
  const { canEditInventory } = usePermissions();
  const navigate = useNavigate();
  const mobileProductEdit = (product) => {
    navigate(`/inventory/edit-product/${product.id}`);
  };
  const [favLimitAlert, setFavLimitAlert] = useState(false);
  const toggleFavouriteMutation = useToggleFavouriteProduct();
  const theStore = useContext(StoreContext);
  const { refetch } = useProducts(theStore?.id || "");
  const handleToggleFavourite = (product, checked) => {
    const favCount = products.filter((p) => p.favourite).length;
    if (!product.favourite && favCount >= 10) {
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
  };
  const filteredProducts =
    stockFilter === "all"
      ? products
      : products.filter((product) =>
          stockFilter === "in" && product.quantity > product.low_stock_threshold ||
          stockFilter === "low" && product.quantity <= product.low_stock_threshold && product.quantity !== 0 ||
          stockFilter === "out" && product.quantity === 0
        );
  return (
    <div className="space-y-4">
      {favLimitAlert && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-sm">You can only have 10 favourite products.</div>
      )}
      {/* Mobile View */}
      <div className="lg:hidden">
        {filteredProducts.map((product) => (
          <ProductMobileView
            key={product.id}
            product={product}
            onEdit={mobileProductEdit}
            onRestock={onRestock}
            onDelete={onDelete}
            canEditInventory={canEditInventory}
          />
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('inventory.product')}</TableHead>
              <TableHead>{t('inventory.unitPrice')}</TableHead>
              <TableHead>{t('inventory.purchasedPrice')}</TableHead>
              <TableHead>{t('inventory.quantity')}</TableHead>
              <TableHead>{t('inventory.lowStockThreshold')}</TableHead>
              <TableHead>{t('inventory.stockStatus')}</TableHead>
              <TableHead>{t('inventory.addToFavourite')}</TableHead>
              {canEditInventory && <TableHead>{t('inventory.actions')}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="w-2/12">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {product.category || t('inventory.noCategory')}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>₦{formatNumber(product.unit_price)}</TableCell>
                <TableCell>
                  {product.purchased_price !== undefined && product.purchased_price !== null
                    ? `₦${formatNumber(product.purchased_price)}`
                    : <span className="text-gray-400">{t('inventory.notSet')}</span>}
                </TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{product.low_stock_threshold}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded ${product.quantity <= product.low_stock_threshold ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"}`}
                  >
                    {product.quantity <= product.low_stock_threshold && product.quantity !== 0 && t('inventory.lowStock')}
                    {product.quantity > product.low_stock_threshold && t('inventory.inStock')}
                    {product.quantity === 0 && t('inventory.finished')}
                  </span>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={!!product.favourite}
                    onCheckedChange={(checked) => handleToggleFavourite(product, checked)}
                    aria-label={product.favourite ? t('inventory.removeFromFavourite') : t('inventory.setAsFavourite')}
                    className="mx-auto"
                    disabled={toggleFavouriteMutation.isPending}
                  />
                </TableCell>
                {canEditInventory && (
                  <TableCell>
                    <Button variant="ghost" onClick={() => onEdit(product)}>
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" onClick={() => onRestock(product)}>
                      <RefreshCw size={16} />
                    </Button>
                    <Button variant="ghost" onClick={() => onDelete(product)}>
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductTable;
