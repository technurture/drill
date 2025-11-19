import React, { useState, useMemo, useContext, useEffect } from "react";
import { StoreContext } from "@/contexts/StoreContext";
import { Button } from "@/components/ui/button";
import { Download, Plus, Users, BarChart2, Filter } from "lucide-react";
import toast from "react-hot-toast";
import SalesSummary from "../components/sales/SalesSummary";
import SalesFilter from "../components/sales/SalesFilter";
import SalesTable from "../components/sales/SalesTable";
import DeleteConfirmationModal from "../components/inventory/DeleteConfirmationModal";
import {
  useSales,
  useDeleteSale,
  useUpdateSaleNote,
  useGetSale,
} from "../integrations/supabase/hooks/sales";
import { filterSalesByDateRange } from "../utils/salesUtils";
import { DateRange } from "react-day-picker";
import { useProducts, useReturnProduct } from "@/integrations/supabase/hooks/products";
import { addDays, endOfWeek, format, startOfWeek } from "date-fns";
import { usePermissions } from "@/hooks/usePermissions";
import { SubscriptionContext } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAddNotification,
  useGetDeviceToken,
} from "@/integrations/supabase/hooks/notifications";
import { saveAs } from "file-saver";
import { sendPushNotification } from "@/utils/pushNotification";
import { useNavigate } from "react-router-dom";
import { AddSaleIcon } from "@/components/ui/Icons";
import { supabase } from '@/integrations/supabase/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NoStoreMessage from "@/components/NoStoreMessage";
import { useTranslation } from "react-i18next";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

const Sales = () => {
  const { t } = useTranslation('pages');
  const theStore = useContext(StoreContext);
  const { isOnline } = useOfflineStatus();
  const navigate = useNavigate()
  const { data: token } = useGetDeviceToken(theStore?.owner_id);
  const subscriptionData = useContext(SubscriptionContext);
  const { user } = useAuth();
  const deleteSale = useDeleteSale();
  const updateSaleNote = useUpdateSaleNote();
  const { canAddSales } = usePermissions();
  const [isAddingSale, setIsAddingSale] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: null, to: null });
  const [salesView, setSalesView] = useState("all");
  const [singleDate, setSingleDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentModeFilter, setPaymentModeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const addNotification = useAddNotification();
  const returnProduct = useReturnProduct();
  
  // Debug logging
  console.log("Sales page - Active store:", theStore);
  console.log("Sales page - Store ID:", theStore?.id);
  
  const pushNotification = (message: string, title: string) => {
    if (token) {
      for (const device of token) {
        sendPushNotification(device?.token, message, title, "/dashboard/notes");
      }
    }
  };
  
  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useProducts(theStore?.id || "");
  const { data: sales, isLoading, error } = useSales(theStore?.id);
  
  // Debug logging for sales data
  console.log("Sales page - Sales data:", sales);
  console.log("Sales page - Sales loading:", isLoading);
  console.log("Sales page - Sales error:", error);
  
  const filteredSales = useMemo(() => {
    if (!sales) return [];
    let filtered = sales;
    const date = format(new Date(), "MMM dd, yyyy");
    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from).setHours(0,0,0,0);
      const toDate = new Date(dateRange.to).setHours(23,59,59,999);
      filtered = filtered.filter((sale) => {
        const saleDate = new Date(sale?.created_at).getTime();
        return saleDate >= fromDate && saleDate <= toDate;
      });
    } else if (dateRange.from && dateRange.to === undefined) {
      const dateSelected = format(dateRange.from, "MMM dd, yyyy");
      filtered = filtered.filter(
        (sale) => format(sale?.created_at, "MMM dd, yyyy") === dateSelected,
      );
      if (dateSelected === date) {
        setSalesView("daily");
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (sale) =>
          (sale.id &&
            sale.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
          sale.items?.some((item) =>
            item.product?.name.toLowerCase().includes(searchTerm.toLowerCase()),
          ) ||
          (sale.sales_rep_id &&
            sale.sales_rep_id.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }
    if (salesView === "daily") {
      const day = format(Date(), "MMM dd, yyyy");
      filtered = filtered.filter(
        (sale) => format(sale?.created_at, "MMM dd, yyyy") === day,
      );
    }
    if (salesView === "monthly") {
      const month = format(Date(), "MM, yyyy");
      filtered = filtered.filter(
        (sale) => format(sale?.created_at, "MM, yyyy") === month,
      );
    }
    if (salesView === "weekly") {
      const date = new Date();
      const start_week = format(
        startOfWeek(date, { weekStartsOn: 1 }),
        "yyyy-MM-dd",
      );
      const end_week = format(
        endOfWeek(date, { weekStartsOn: 1 }),
        "yyyy-MM-dd",
      );
      filtered = filtered.filter(
        (sale) =>
          format(sale?.created_at, "yyyy-MM-dd") >= start_week &&
          format(sale?.created_at, "yyyy-MM-dd") <= end_week,
      );
    }
    if (salesView === "yearly") {
      const year = format(Date(), "yyyy");
      filtered = filtered.filter(
        (sale) => format(sale?.created_at, "yyyy") === year,
      );
    }

    if (paymentModeFilter !== "all") {
      filtered = filtered.filter(
        (sale) => sale.payment_mode === paymentModeFilter,
      );
    }

    // Sort the filtered sales
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
    return filtered;
  }, [sales, searchTerm, paymentModeFilter, sortOrder, salesView, dateRange]);

  // Show NoStoreMessage if no store is selected (after all hooks, including useMemo)
  if (!theStore) {
    return (
      <NoStoreMessage 
        title={t('sales.salesManagement')}
        description={t('sales.salesManagementDesc')}
      />
    );
  }
  const handleExport = () => {
    const csvHeader = [
      "transaction_id",
      "created_at",
      "product_sold",
      "total_price",
      "payment_mode",
      "sales_rep",
      "note",
    ];
    const rows = filteredSales.map((sale) => {
      const productsSold =
        sale.items
          ?.map((item) => item.product?.name || "Unknown Product")
          .join("; ") || "";
      return {
        transaction_id: sale.id,
        created_at: sale.created_date || "",
        product_sold: productsSold,
        total_price: sale.total_price || 0,
        payment_mode: sale.payment_mode || "",
        sales_rep: sale.sales_rep_name || "",
        note: sale.note || "",
      };
    });
    const csvContent = [
      csvHeader.join(","),
      ...rows.map((row) =>
        csvHeader
          .map((header) => JSON.stringify(row[header.toLowerCase()] || ""))
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${theStore.store_name} sales.csv`);
  };

  const handleAddSale = () => {
    setIsAddingSale(true);
  };

  const handleSaleComplete = () => {
    setIsAddingSale(false);
    toast.success(t('notifications:sale.completed'));
  };

  const handleDelete = (sale) => {
    setSelectedSale(sale);
    setIsDeleteModalOpen(true);
  };
  const onDeleteConfirm = async () => {
    try {
      await deleteSale.mutateAsync({
        id: selectedSale.id,
        storeId: theStore?.id || "",
      });
      selectedSale.items.forEach(sale => {
         returnProduct.mutateAsync({
          product_id: sale?.product_id,
          store_id: theStore?.id,
          quantity: sale?.quantity
         })
      })
      toast.success(isOnline ? t('notifications:sale.deleted') : 'Saved locally. Will sync when online.');
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error(error)
      toast.error(t('notifications:sale.failedToDelete'));
    }
  };

  const handleNoteUpdate = async (saleId, newNote) => {
    try {
      await updateSaleNote.mutateAsync({
        id: saleId,
        note: newNote,
        storeId: theStore?.id || "",
      });
      
      // Only send notifications when online
      if (isOnline && theStore?.id) {
        try {
          await addNotification.mutateAsync({
            user_id: user?.id || theStore?.owner_id,
            message: `New note: "${newNote}" added by Admin`,
            type: "note",
            read: false,
            store_id: theStore.id,
          });
        } catch (notifError) {
          console.warn("Notification failed (non-critical):", notifError);
        }
        
        try {
          pushNotification(
            `"${newNote}" added by Admin`,
            t('common:newNote'),
          );
        } catch (pushError) {
          console.warn("Push notification failed (non-critical):", pushError);
        }
      }
      
      toast.success(isOnline ? t('notifications:sale.noteUpdated') : 'Saved locally. Will sync when online.');
    } catch (error) {
      toast.error(t('notifications:sale.failedToUpdateNote'));
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#18191A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-[#18191A] rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {t('sales.title')}
              </h1>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="hidden md:inline">{t('common:filters')}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('sales.filterSales')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="search">{t('sales.searchProducts')}</Label>
                      <Input
                        id="search"
                        placeholder={t('sales.searchByProductName')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="duration">{t('sales.duration')}</Label>
                      <Select value={salesView} onValueChange={setSalesView}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('sales.all')}</SelectItem>
                          <SelectItem value="daily">{t('sales.daily')}</SelectItem>
                          <SelectItem value="weekly">{t('common.weekly')}</SelectItem>
                          <SelectItem value="monthly">{t('common.monthly')}</SelectItem>
                          <SelectItem value="yearly">{t('common.yearly')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="date">{t('sales.date')}</Label>
                      <Input
                        id="date"
                        type="date"
                        value={singleDate}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSingleDate(value);
                          if (value) {
                            const d = new Date(value);
                            setDateRange({ from: d as unknown as Date, to: undefined });
                          } else {
                            setDateRange({ from: null, to: null });
                          }
                        }}
                      />
                    </div>

                    <div>
                      <Label htmlFor="payment-mode">{t('sales.paymentMode')}</Label>
                      <Select value={paymentModeFilter} onValueChange={setPaymentModeFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('sales.allPaymentModes')}</SelectItem>
                          <SelectItem value="cash">{t('sales.cash')}</SelectItem>
                          <SelectItem value="bank_transfer">{t('sales.bankTransfer')}</SelectItem>
                          <SelectItem value="credit">{t('sales.credit')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="sort-order">{t('sales.sortOrder')}</Label>
                      <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">{t('sales.newestFirst')}</SelectItem>
                          <SelectItem value="oldest">{t('sales.oldestFirst')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchTerm("");
                          setPaymentModeFilter("all");
                          setSortOrder("newest");
                          setSalesView("all");
                          setDateRange({ from: null, to: null });
                          setSingleDate("");
                        }}
                        className="flex-1"
                      >
                        {t('common:clearFilters')}
                      </Button>
                      <Button 
                        onClick={() => setIsFilterModalOpen(false)}
                        className="flex-1"
                      >
                        {t('common:applyFilters')}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              {canAddSales && (
                <Button
                  onClick={() => navigate("/add-sales")}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <AddSaleIcon />
                  <span className="hidden md:inline">{t('sales.addNewSale')}</span>
                  <span className="md:hidden"></span>
                </Button>
              )}
              
              <Button
                onClick={handleExport}
                variant="outline"
                className="flex items-center gap-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200"
              >
                <Download className="h-4 w-4" />
                <span className="hidden lg:inline">{t('sales.exportReport')}</span>
                <span className="lg:hidden"></span>
              </Button>
            </div>
          </div>
        </div>

        {/* Sales Summary Section */}
        <SalesSummary sales={filteredSales} products={products} />

        {/* Sales Table Section */}
        <div className="bg-white dark:bg-[#18191A] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('sales.salesTransactions')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredSales.length} {filteredSales.length === 1 ? t('sales.transactionFound') : t('sales.transactionsFound')}
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-hidden">
            {filteredSales.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <BarChart2 className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('sales.noSalesFound')}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {t('sales.adjustFilters')}
                </p>
                {canAddSales && (
                  <Button 
                    onClick={() => navigate("/add-sales")}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    <AddSaleIcon />
                    <span className="ml-2">{t('sales.addFirstSale')}</span>
                  </Button>
                )}
              </div>
            ) : (
              <SalesTable
                sales={filteredSales}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>

        {/* Modals */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={onDeleteConfirm}
          productName={`Sale ${selectedSale?.id}`}
        />
      </div>
    </div>
  );
};

export default Sales;
