import React, { useContext, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, TrendingUp } from "lucide-react";
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

const SalesSummary = ({ sales, products }) => {
  const { t } = useTranslation('pages');
  const { user } = useAuth();
  const obscureStatus = useContext(ObscurityContext);
  const setObscureStatus = useContext(setObsurityContext);
  // Hooks must be declared before any conditional returns
  const [activeIndex, setActiveIndex] = useState(0);
  const cardsData = [1, 2, 3]; // 3 cards for admin
  const containerRef = useRef<HTMLDivElement>();
  const toggleBalance = async () => {
    if (obscureStatus?.sales === null) {
      setObscureStatus.setStatus("sales", true);
    } else {
      setObscureStatus.setStatus("sales", null);
    }
  };
  const hasSales = Array.isArray(sales) && sales.length > 0;

  const totalSales = (hasSales ? sales : []).reduce(
    (sum, sale) => sum + (sale.total_price || 0),
    0,
  );
  const totalTransactions = hasSales ? sales.length : 0;

  // Create a map to count quantities sold for each product
  const productSalesMap = new Map();

  (hasSales ? sales : []).forEach((sale) => {
    sale.products?.forEach((product) => {
      const currentQuantity = productSalesMap.get(product.name) || 0;
      productSalesMap.set(
        product.name,
        currentQuantity + (product.quantity || 0),
      );
    });
  });

  // Find the product with the highest quantity sold
  const topSellingProduct = Array.from(productSalesMap.entries()).reduce(
    (top, [name, quantity]) =>
      quantity > top.quantity ? { name, quantity } : top,
    { name: "N/A", quantity: 0 },
  );
  
  
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const cardWidth = container.offsetWidth;
    const scrollLeft = container.scrollLeft;
    const index = Math.round(scrollLeft / cardWidth)
    setActiveIndex(index);
  };
  
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [containerRef.current]);
  
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({ left: 0, behavior: "auto" });
    }
  }, [containerRef.current]);

  // Calculate total profit
  let totalProfit = 0;
  (hasSales ? sales : []).forEach((sale) => {
    sale.items?.forEach((item) => {
      const purchasedPrice = item.product?.purchased_price;
      if (typeof purchasedPrice === "number") {
        totalProfit += (item.unit_price - purchasedPrice) * item.quantity;
      }
    });
  });
  
  return (
    <>
      {!hasSales && (
        <div>{t('sales.noSalesDataAvailable')}</div>
      )}
      {hasSales && (
      <div className="lg:grid md:grid hidden grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 bg-white dark:bg-[#18191A]">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <span className="h-4 w-4 text-green-600 dark:text-green-400 font-semibold">₦</span>
              <span>{t('sales.totalSales')}</span>
              {obscureStatus?.sales && (
                <span
                  onClick={() => toggleBalance()}
                  className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <EyeOff className="size-4" />
                </span>
              )}
              {!obscureStatus?.sales && (
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
              {!obscureStatus?.sales && (
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₦{new Intl.NumberFormat().format(totalSales)}
                </div>
              )}
              {obscureStatus?.sales && (
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₦{"*****"}
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('sales.revenueGenerated')}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 bg-white dark:bg-[#18191A]">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>{t('sales.transactions')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(totalTransactions)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('sales.completedSales')}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Total Profit Card */}
        <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 bg-white dark:bg-[#18191A]">
          <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>{t('sales.totalProfit')}</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              {obscureStatus?.sales && (
                <span
                  onClick={() => toggleBalance()}
                  className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <EyeOff className="size-4" />
                </span>
              )}
              {!obscureStatus?.sales && (
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
              {!obscureStatus?.sales && (
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₦{formatNumber(totalProfit)}
                </div>
              )}
              {obscureStatus?.sales && (
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₦{"*****"}
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('sales.basedOnPurchasePrices')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      )}
      
      {hasSales && (
      <div className="grid md:hidden lg:hidden grid-cols-2 gap-4 w-full">
        <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18191A]">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <span className="h-4 w-4 text-green-600 dark:text-green-400 font-semibold">₦</span>
              <span>{t('sales.totalSales')}</span>
              {obscureStatus?.sales && (
                <span
                  onClick={() => toggleBalance()}
                  className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <EyeOff className="size-4" />
                </span>
              )}
              {!obscureStatus?.sales && (
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
              {!obscureStatus?.sales && (
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₦{new Intl.NumberFormat().format(totalSales)}
                </div>
              )}
              {obscureStatus?.sales && (
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₦{"*****"}
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('sales.revenueGenerated')}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18191A]">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-600 dark.text-blue-400" />
              <span>{t('sales.transactions')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(totalTransactions)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('sales.completedSales')}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Total Profit Card */}
        <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18191A]">
          <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>{t('sales.totalProfit')}</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              {obscureStatus?.sales && (
                <span
                  onClick={() => toggleBalance()}
                  className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <EyeOff className="size-4" />
                </span>
              )}
              {!obscureStatus?.sales && (
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
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ₦{formatNumber(totalProfit)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('sales.basedOnPurchasePrices')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      )}
      {/* Removed dots indicator since grid layout is used on mobile */}
    </>    
  );
};

export default SalesSummary;
