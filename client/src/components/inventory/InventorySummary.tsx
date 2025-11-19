import React, { useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { Product, Sale } from "../../types/database.types";
import { formatNumber } from "@/utils/formatNumber";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { useHideBalance, useUser } from "@/integrations/supabase/hooks/users";
import {
  ObscurityContext,
  setObsurityContext,
} from "@/contexts/ObscureContext";
import { useTranslation } from "react-i18next";

interface InventorySummaryProps {
  products: Product[];
  sales: Sale[];
}

const InventorySummary: React.FC<InventorySummaryProps> = ({
  products,
  sales,
}) => {
  const { t } = useTranslation('pages');
  const totalProducts = products.length;
  const totalValue = products.reduce(
    (sum, product) => sum + product.unit_price * product.quantity,
    0,
  );
  // Calculate total inventory value based on purchase price
  const totalPurchaseValue = products.reduce(
    (sum, product) => {
      const purchasePrice = product.purchased_price || 0;
      return sum + (purchasePrice * product.quantity);
    },
    0,
  );
  const lowStockProducts = products.filter(
    (product) => product.quantity <= product.low_stock_threshold,
  ).length;
  const highestSellingProduct = products.reduce<Product | null>(
    (top, product) => {
      const productSales = sales
        .flatMap((sale) => sale.items || [])
        .filter((item) => item.product_id === product.id);
      const totalSold = productSales.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      return !top || totalSold > (top as any).totalSold
        ? { ...product, totalSold }
        : top;
    },
    null,
  );
  const obscureStatus = useContext(ObscurityContext);
  const setObscureStatus = useContext(setObsurityContext);
  const toggleBalance = async () => {
    if (obscureStatus?.inventory === null) {
      setObscureStatus.setStatus("inventory", true);
    } else {
      setObscureStatus.setStatus("inventory", null);
    }
  };

  return (
    <>
    <div className="lg:grid md:grid hidden grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 bg-green">
      <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 bg-white dark:bg-[#18191A]">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>{t('inventory.totalProducts')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(totalProducts)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('inventory.productsInInventory')}</p>
          </div>
        </CardContent>
      </Card>
      
      {
        <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 bg-white dark:bg-[#18191A]">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400 font-semibold">₦</span>
              <span>{t('inventory.inventoryValue')}</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              {obscureStatus?.inventory && (
                <span
                  onClick={() => toggleBalance()}
                  className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <EyeOff className="size-4" />
                </span>
              )}
              {!obscureStatus?.inventory && (
                <span
                  onClick={() => toggleBalance()}
                  className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <Eye className="size-4" />
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div>
              {!obscureStatus?.inventory && (
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₦{new Intl.NumberFormat().format(totalValue)}
                </div>
              )}
              {obscureStatus?.inventory && (
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₦{"*****"}
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('inventory.totalValueOfInventory')}</p>
            </div>
          </CardContent>
        </Card>
      }

      <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 transition-all duration-200 bg-white dark:bg-[#18191A]">
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>{t('inventory.purchaseValue')}</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            {obscureStatus?.inventory && (
              <span
                onClick={() => toggleBalance()}
                className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <EyeOff className="size-4" />
              </span>
            )}
            {!obscureStatus?.inventory && (
              <span
                onClick={() => toggleBalance()}
                className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Eye className="size-4" />
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div>
            {!obscureStatus?.inventory && (
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ₦{new Intl.NumberFormat().format(totalPurchaseValue)}
              </div>
            )}
            {obscureStatus?.inventory && (
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ₦{"*****"}
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('inventory.basedOnPurchasePrice')}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 bg-white dark:bg-[#18191A]">
        <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>{t('inventory.topSellingProduct')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {highestSellingProduct?.name || "N/A"}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {(highestSellingProduct as any)?.totalSold || 0} {t('inventory.unitsSold')}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 transition-all duration-200 bg-white dark:bg-[#18191A]">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span>{t('dashboard.lowStockAlert')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {lowStockProducts}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.productsBelowThreshold')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
    
    <div className="grid md:hidden lg:hidden grid-cols-2 gap-4 w-full">
      <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18191A]">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>{t('inventory.totalProducts')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(totalProducts)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('inventory.productsInInventory')}</p>
          </div>
        </CardContent>
      </Card>
      
      {
        <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18191A]">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400 font-semibold">₦</span>
              <span>{t('inventory.inventoryValue')}</span>
              {obscureStatus?.inventory && (
                <span
                  onClick={() => toggleBalance()}
                  className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <EyeOff className="size-4" />
                </span>
              )}
              {!obscureStatus?.inventory && (
                <span
                  onClick={() => toggleBalance()}
                  className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <Eye className="size-4" />
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              {!obscureStatus?.inventory && (
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₦{new Intl.NumberFormat().format(totalValue)}
                </div>
              )}
              {obscureStatus?.inventory && (
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₦{"*****"}
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('inventory.totalValueOfInventory')}</p>
            </div>
          </CardContent>
        </Card>
      }

      <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18191A]">
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>{t('inventory.purchaseValue')}</span>
            {obscureStatus?.inventory && (
              <span
                onClick={() => toggleBalance()}
                className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <EyeOff className="size-4" />
              </span>
            )}
            {!obscureStatus?.inventory && (
              <span
                onClick={() => toggleBalance()}
                className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Eye className="size-4" />
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            {!obscureStatus?.inventory && (
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ₦{new Intl.NumberFormat().format(totalPurchaseValue)}
              </div>
            )}
            {obscureStatus?.inventory && (
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ₦{"*****"}
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('inventory.basedOnPurchasePrice')}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18191A]">
        <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>{t('inventory.topSellingProduct')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {highestSellingProduct?.name || "N/A"}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {(highestSellingProduct as any)?.totalSold || 0} {t('inventory.unitsSold')}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18191A]">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span>{t('dashboard.lowStockAlert')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {lowStockProducts}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.productsBelowThreshold')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default InventorySummary;
