import React, { useEffect, useRef, useState } from "react";
import { useStores } from "../integrations/supabase/hooks/stores";
import { useSales } from "../integrations/supabase/hooks/sales";
import { useProducts } from "../integrations/supabase/hooks/products";
import { useSavingsSummary } from "../integrations/supabase/hooks/savings";
import { useFinancialSummary } from "../integrations/supabase/hooks/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/Overview";
import { RecentSales } from "@/components/RecentSales";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, ArrowDown, CalendarIcon, PlusIcon, PlusSquare, PiggyBank } from "lucide-react";
import { useContext } from "react";
import { StoreContext } from "@/contexts/StoreContext";
import NotificationList from "@/components/notifications/NotificationList";
import { useLocation, useNavigate } from "react-router-dom";
import { formatNumber } from "@/utils/formatNumber";
import { Calendar } from "@/components/ui/calendar";
import { DateCalendar } from "@/components/ui/DateCalender";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import {
  ObscurityContext,
  setObsurityContext,
} from "@/contexts/ObscureContext";

import { AddSaleIcon, CartIcon } from "@/components/ui/Icons";

import { supabase } from "@/integrations/supabase/supabase";
import { useQueryClient } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import NoStoreMessage from "@/components/NoStoreMessage";
import CreateSavingsModal from "@/components/ui/modals/CreateSavingsModal";
import AddFinancialRecordModal from "@/components/ui/modals/AddFinancialRecordModal";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t } = useTranslation('pages');
  const location = useLocation();
  const initialTab = location.state?.activeTab || "overview";
  const theStore = useContext(StoreContext);
  const navigate = useNavigate()
  const { user } = useAuth();
  const { data: stores, isLoading: storesLoading } = useStores(user?.id || "");
  const { data: sales, isLoading: salesLoading } = useSales(theStore?.id || "");
  const { data: products, isLoading: productsLoading } = useProducts(
    theStore?.id || "",
  );
  const { data: savingsSummary, isLoading: savingsLoading } = useSavingsSummary(theStore?.id || "");
  const { data: financialSummary, isLoading: financialLoading } = useFinancialSummary(theStore?.id || "");
  
  const [date, setDate] = useState<Date | undefined>();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>();
  const obscureStatus = useContext(ObscurityContext);
  const setObscureStatus = useContext(setObsurityContext);
  const queryClient = useQueryClient();
  
  // Modal states
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Calculate total revenue from sales
  const totalRevenue =
    sales?.reduce((sum, sale) => {
      const saleTotal =
        sale.items?.reduce(
          (itemSum, item) =>
            itemSum + (item.unit_price || 0) * (item.quantity || 0),
          0,
        ) || 0;
      return sum + saleTotal;
    }, 0) || 0;
  
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

  // Realtime updates for savings: contributions and plans
  useEffect(() => {
    if (!theStore?.id) return;
    const channel = supabase
      .channel('savings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'savings_contributions' },
        async () => {
          await queryClient.invalidateQueries({ queryKey: ['savings-summary', theStore.id] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'savings_plans' },
        async () => {
          await queryClient.invalidateQueries({ queryKey: ['savings-summary', theStore.id] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [theStore?.id, queryClient]);

  // Calculate transaction breakdown for pie chart
  const transactionBreakdown = React.useMemo(() => {
    if (!sales) return [];

    const adminSales = sales.length;

    const data = [
      { 
        name: 'Admin', 
        value: adminSales, 
        color: '#3b82f6', // Blue
        description: 'Sales made directly by admin'
      }
    ].filter(item => item.value > 0);

    return data;
  }, [sales]);

  // Calculate payment mode breakdown for pie chart
  const paymentModeData = React.useMemo(() => {
    if (!sales || sales.length === 0) return [];

    const paymentCounts = sales.reduce((acc, sale) => {
      const mode = sale.payment_mode || 'Unknown';
      acc[mode] = (acc[mode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      'cash': '#22c55e',
      'credit': '#f59e0b', 
      'bank_transfer': '#3b82f6',
      'POS': '#8b5cf6',
      'Unknown': '#6b7280'
    };

    return Object.entries(paymentCounts).map(([mode, count]) => ({
      name: mode.charAt(0).toUpperCase() + mode.slice(1).replace('_', ' '),
      value: count,
      color: colors[mode] || '#6b7280'
    }));
  }, [sales]);

  // Calculate income breakdown for pie chart
  const incomeBreakdownData = React.useMemo(() => {
    if (!financialSummary || !sales) return [];

    const salesIncome = totalRevenue;
    const otherIncome = financialSummary.totalIncome - salesIncome;

    const data = [];
    
    if (salesIncome > 0) {
      data.push({
        name: 'Sales Income',
        value: salesIncome,
        color: '#22c55e', // Green
        description: 'Income from product sales'
      });
    }
    
    if (otherIncome > 0) {
      data.push({
        name: 'Other Income',
        value: otherIncome,
        color: '#3b82f6', // Blue
        description: 'Income from other sources'
      });
    }

    return data;
  }, [financialSummary, sales, totalRevenue]);

  // Add subscription to product changes
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up product changes subscription for store:', user.id);

    const subscription = supabase
      .channel('product_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'products',
          filter: `store_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log('Product change detected:', payload);
          // Invalidate and refetch products query
          await queryClient.invalidateQueries({ queryKey: ['products', user.id] });
          // Also invalidate the specific product if it's an update
          if (payload.eventType === 'UPDATE' && payload.new?.id) {
            await queryClient.invalidateQueries({ queryKey: ['products', payload.new.id] });
          }
          await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          console.log('Cache invalidated and queries refetched');
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up product changes subscription');
      subscription.unsubscribe();
    };
  }, [user?.id, queryClient]);

  const toggleBalance = async () => {
    if (obscureStatus?.main === null) {
      setObscureStatus.setStatus("main", true);
    } else {
      setObscureStatus.setStatus("main", null);
    }
  };

  // Show NoStoreMessage if no store is selected
  if (!theStore) {
    return (
      <NoStoreMessage 
        title={t('dashboard.welcomeToSheBalance')}
        description={t('dashboard.createFirstStoreDesc')}
        showBackButton={false}
      />
    );
  }

  const totalSales = sales?.length || 0;
  const totalProducts = products?.length || 0;
  const cardsData = [1,2,3,4]
  const lowStockCount =
    products?.filter(
      (product) => product.quantity <= product.low_stock_threshold,
    ).length || 0;
  const expiringProducts = [];

  // Debug logging
  console.log("Dashboard - Active store:", theStore);
  console.log("Dashboard - Store ID:", theStore?.id);
  console.log("Dashboard - User ID:", user?.id);
  console.log("Dashboard - All stores:", stores);
  console.log("Dashboard - Sales data:", sales);
  console.log("Dashboard - Sales loading:", salesLoading);
  console.log("Dashboard - Products data:", products);
  console.log("Dashboard - Products loading:", productsLoading);
  console.log("Dashboard - Total revenue:", totalRevenue);
  console.log("Dashboard - Total sales:", totalSales);
  console.log("Dashboard - Total products:", totalProducts);

  if (storesLoading || salesLoading || productsLoading || savingsLoading || financialLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
      <div className="relative bg-white dark:bg-[#18191A]">
      <div className="space-y-6 py-6 flex flex-col gap-4 sm:px-6">
        <Tabs defaultValue={initialTab} className="space-y-6">
          
          <TabsContent value="overview" className="space-y-6">

            {/* Desktop Stats Cards */}
            <div className="md:grid hidden lg:grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 bg-white dark:bg-[#18192A]">
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-2 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span>{t('dashboard.totalSalesRevenue')}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {obscureStatus?.main && (
                      <span
                        onClick={() => toggleBalance()}
                        className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <EyeOff className="size-4" />
                      </span>
                    )}
                    {!obscureStatus?.main && (
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
                  <div className="flex items-center gap-3">
                    
                    <div>
                      {!obscureStatus?.main && (
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          ₦{new Intl.NumberFormat().format(totalRevenue)}
                        </div>
                      )}
                      {obscureStatus?.main && (
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          ₦{"*****"}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.totalRevenueDesc')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 bg-white dark:bg-[#18191A]">
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>{t('dashboard.totalSales')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {totalSales}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.transactionsCompleted')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 bg-white dark:bg-[#18191A]">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>{t('dashboard.totalSavings')}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {obscureStatus && obscureStatus?.main && (
                      <span
                        onClick={() => toggleBalance()}
                        className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <EyeOff className="size-4" />
                      </span>
                    )}
                    {obscureStatus && obscureStatus?.main === null && (
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
                  <div className="flex items-center gap-3">
                    <div>
                      {!obscureStatus?.main && (
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          ₦{new Intl.NumberFormat().format(savingsSummary?.total_saved || 0)}
                        </div>
                      )}
                      {obscureStatus?.main && (
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          ₦{"*****"}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.totalSavedAmount')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="relative overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 transition-all duration-200 cursor-pointer bg-white dark:bg-[#18191A] hover:scale-[1.02]"
                onClick={() => navigate('/dashboard/inventory', { state: { stockFilter: 'low' } })}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span>{t('dashboard.lowStockAlert')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {lowStockCount}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.productsBelowThreshold')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Income Card */}
              <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 bg-white dark:bg-[#18191A]">
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>{t('dashboard.totalIncome')}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {obscureStatus && obscureStatus?.main && (
                      <span
                        onClick={() => toggleBalance()}
                        className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <EyeOff className="size-4" />
                      </span>
                    )}
                    {obscureStatus && obscureStatus?.main === null && (
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
                  <div className="flex items-center gap-3">
                    <div>
                      {!obscureStatus?.main && (
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          ₦{new Intl.NumberFormat().format(financialSummary?.totalIncome || 0)}
                        </div>
                      )}
                      {obscureStatus?.main && (
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          ₦{"*****"}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.totalIncomeDesc')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Expenses Card */}
              <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 transition-all duration-200 bg-white dark:bg-[#18191A]">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                    <span>{t('dashboard.totalExpenses')}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {obscureStatus && obscureStatus?.main && (
                      <span
                        onClick={() => toggleBalance()}
                        className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <EyeOff className="size-4" />
                      </span>
                    )}
                    {obscureStatus && obscureStatus?.main === null && (
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
                  <div className="flex items-center gap-3">
                    <div>
                      {!obscureStatus?.main && (
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          ₦{new Intl.NumberFormat().format(financialSummary?.totalExpenses || 0)}
                        </div>
                      )}
                      {obscureStatus?.main && (
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          ₦{"*****"}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total expenses paid</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Stats Cards - 2 per row */}
            <div className="grid md:hidden lg:hidden grid-cols-2 gap-2 w-full">
              <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18191A]">
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    
                    <span>Total Sales Revenue</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {obscureStatus?.main ? (
                      <span onClick={toggleBalance} className="cursor-pointer text-gray-400 dark:text-gray-500">
                        <EyeOff className="size-4" />
                      </span>
                    ) : (
                      <span onClick={toggleBalance} className="cursor-pointer text-gray-400 dark:text-gray-500">
                        <Eye className="size-4" />
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    {!obscureStatus?.main ? (
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₦{new Intl.NumberFormat().format(totalRevenue)}
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₦{"*****"}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total revenue generated from sales</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18191A]">
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>{t('dashboard.totalSales')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {totalSales}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed sales transactions</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18191A]">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>{t('dashboard.totalSavings')}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {obscureStatus?.main ? (
                      <span onClick={toggleBalance} className="cursor-pointer text-gray-400 dark:text-gray-500">
                        <EyeOff className="size-4" />
                      </span>
                    ) : (
                      <span onClick={toggleBalance} className="cursor-pointer text-gray-400 dark:text-gray-500">
                        <Eye className="size-4" />
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    {!obscureStatus?.main ? (
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₦{new Intl.NumberFormat().format(savingsSummary?.total_saved || 0)}
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₦{"*****"}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total saved amount</p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="relative overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer bg-white dark:bg-[#18191A]"
                onClick={() => navigate('/dashboard/inventory', { state: { stockFilter: 'low' } })}
              >
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
                      {lowStockCount}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Products below threshold</p>
                  </div>
                </CardContent>
              </Card>

              {/* Total Income Card - Mobile */}
              <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18191A]">
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>{t('dashboard.totalIncome')}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {obscureStatus?.main ? (
                      <span onClick={toggleBalance} className="cursor-pointer text-gray-400 dark:text-gray-500">
                        <EyeOff className="size-4" />
                      </span>
                    ) : (
                      <span onClick={toggleBalance} className="cursor-pointer text-gray-400 dark:text-gray-500">
                        <Eye className="size-4" />
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    {!obscureStatus?.main ? (
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₦{new Intl.NumberFormat().format(financialSummary?.totalIncome || 0)}
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₦{"*****"}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400"> Income from Sales and other sources </p>
                  </div>
                </CardContent>
              </Card>

              {/* Total Expenses Card - Mobile */}
              <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18191A]">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                    <span>{t('dashboard.totalExpenses')}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {obscureStatus?.main ? (
                      <span onClick={toggleBalance} className="cursor-pointer text-gray-400 dark:text-gray-500">
                        <EyeOff className="size-4" />
                      </span>
                    ) : (
                      <span onClick={toggleBalance} className="cursor-pointer text-gray-400 dark:text-gray-500">
                        <Eye className="size-4" />
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    {!obscureStatus?.main ? (
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₦{new Intl.NumberFormat().format(financialSummary?.totalExpenses || 0)}
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₦{"*****"}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total expenses paid</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Removed mobile dots indicator since we switched to grid */}

            {/* Quick Actions Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
              
              {/* Desktop Quick Actions */}
              <div className="hidden md:grid grid-cols-4 gap-4">
                <Button
                  onClick={() => navigate("/add-sales")}
                  className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="font-medium">{t('dashboard.addNewSale')}</span>
                </Button>

                <Button
                  onClick={() => setIsSavingsModalOpen(true)}
                  className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <PiggyBank className="w-6 h-6" />
                  <span className="font-medium">Create Savings</span>
                </Button>

                <Button
                  onClick={() => setIsIncomeModalOpen(true)}
                  className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium">Add Income</span>
                </Button>

                <Button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  <span className="font-medium">Add Expenses</span>
                </Button>
              </div>

              {/* Mobile Quick Actions */}
              <div className="grid md:hidden grid-cols-2 gap-3">
                <Button
                  onClick={() => navigate("/add-sales")}
                  className="h-16 flex flex-col items-center justify-center gap-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 text-xs"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="font-medium">{t('dashboard.addNewSale')}</span>
                </Button>

                <Button
                  onClick={() => setIsSavingsModalOpen(true)}
                  className="h-16 flex flex-col items-center justify-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 text-xs"
                >
                  <PiggyBank className="w-5 h-5" />
                  <span className="font-medium">{t('dashboard.addSavings')}</span>
                </Button>

                <Button
                  onClick={() => setIsIncomeModalOpen(true)}
                  className="h-16 flex flex-col items-center justify-center gap-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 text-xs"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium">{t('dashboard.addIncome')}</span>
                </Button>

                <Button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="h-16 flex flex-col items-center justify-center gap-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 text-xs"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  <span className="font-medium">{t('dashboard.addExpense')}</span>
                </Button>
              </div>
            </div>

            {/* Charts Section: Responsive layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income Breakdown Chart */}
              {incomeBreakdownData.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.incomeBreakdown', { defaultValue: 'Income Breakdown' })}</h3>
                  <Card className="p-6">
                    <div className="h-80 md:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={incomeBreakdownData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {incomeBreakdownData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any) => [`₦${formatNumber(value)}`, 'Amount']}
                            labelFormatter={(label) => `${label}`}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              )}

              {/* Payment Methods Chart */}
              {paymentModeData.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.paymentMethods', { defaultValue: 'Payment Methods' })}</h3>
                  <Card className="p-6">
                    <div className="h-80 md:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={paymentModeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={70}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {paymentModeData.map((entry, index) => (
                              <Cell key={`pm-cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any, name: any, props: any) => [
                              `${value} ${value === 1 ? 'sale' : 'sales'}`,
                              props?.payload?.name || 'Payment Method'
                            ]}
                            labelFormatter={() => ''}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              )}
            </div>

          {/* Charts Section - Removed specified cards */}
          {/* Overview and Payment Mode Charts - Removed */}
        </TabsContent>
      </Tabs>
      </div>

      {/* Modals */}
      <CreateSavingsModal 
        open={isSavingsModalOpen} 
        setOpen={setIsSavingsModalOpen} 
      />
      
      <AddFinancialRecordModal 
        open={isIncomeModalOpen} 
        setOpen={setIsIncomeModalOpen} 
        defaultType="income"
      />
      
      <AddFinancialRecordModal 
        open={isExpenseModalOpen} 
        setOpen={setIsExpenseModalOpen} 
        defaultType="expense"
      />
    </div>
  );
};

export default Dashboard;
