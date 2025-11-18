import React, { useState, useEffect, useContext } from "react";
import { StoreContext } from "@/contexts/StoreContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useProducts,
  useAddProduct,
  useUpdateProduct,
  useDeleteProduct,
  useRestockProduct,
} from "../integrations/supabase/hooks/products";
import { useSales } from "../integrations/supabase/hooks/sales";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";
import RestockModal from "../components/inventory/RestockModal";
import DeleteConfirmationModal from "../components/inventory/DeleteConfirmationModal";
import ProductTable from "../components/inventory/ProductTable";
import { Product } from "../types/database.types";
import InventorySummary from "../components/inventory/InventorySummary";
import { usePermissions } from "../hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";
import { CheckinventoryRestriction } from "@/utils/subscriptionHelpers/inventoryRestriction";
import { SubscriptionContext } from "@/contexts/SubscriptionContext";
import AddProductModal from "@/components/ui/modals/AddProductModal";
import EditProductModal from "@/components/ui/modals/EditProductModal";
import { useNavigate, useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { SheetClient } from "@/utils/google_sheet";
import { Plus } from "lucide-react";
import NoStoreMessage from "@/components/NoStoreMessage";
import { useTranslation } from "react-i18next";

const Inventory = () => {
  const { t } = useTranslation(['pages', 'common', 'notifications']);
  const theStore = useContext(StoreContext);
  const location = useLocation();
  const subscriptionData = useContext(SubscriptionContext);
  const { canViewInventory } = usePermissions();
  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts(theStore?.id || "");
  const { data: sales } = useSales(theStore?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [modals, setModals] = useState({
    editModal: false,
    deleteModal: false,
    addModal: false,
    restockModal: false,
    productOption: false
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Get the stock filter from navigation state, default to "all"
  const [stockFilter, setStockFilter] = useState(location.state?.stockFilter || "all");

  const addProduct = useAddProduct();
  const deleteProduct = useDeleteProduct();
  const restockProduct = useRestockProduct();

  useEffect(() => {
    if (productsError) {
      toast.error(t('notifications:product.fetchFailed'));
      console.error("Products fetch error:", productsError);
    }
  }, [productsError, t]);

  // Show NoStoreMessage if no store is selected (after all hooks)
  if (!theStore) {
    return (
      <NoStoreMessage 
        title={t('pages:inventory.title')}
        description={t('pages:inventory.createStoreDesc')}
      />
    );
  }

  const handleEditProduct = (product: Product | null = null) => {
    setSelectedProduct(product);
    setModals((prev: any) => ({ ...prev, editModal: true }));
  };

  const handleRestock = (product: Product) => {
    setSelectedProduct(product);
    setModals((prev: any) => ({ ...prev, restockModal: true }));
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setModals((prev: any) => ({ ...prev, deleteModal: true }));
  };

  const onSaveProduct = async (
    productData: Omit<Product, "id" | "store_id">,
  ) => {
    try {
      if (!theStore?.id) {
        toast.error(t('common:selectStoreFirst'));
        return;
      }

      /* Commented out subscription checker to make all features free for the main time */
      
      // const inventoryRestriction = CheckinventoryRestriction(
      //   subscriptionData?.userSub?.userSub?.plan_type,
      //   products.length,
      // );
      // if (inventoryRestriction === "success") {
        await addProduct.mutateAsync({
          ...productData,
          store_id: theStore?.id,
        } as Omit<Product, "id">);
        toast.success(t('notifications:product.added'));
      // } else {
      //   toast.error("Upgrade your plan to add more products");
      // }
      setModals((prev: any) => ({ ...prev, addModal: false }));
    } catch (error) {
      console.log(error);
      toast.error(t('notifications:product.addFailed'));
    }
  };

  const onRestock = async (
    productId: string,
    quantity: number
  ) => {
    try {
      await restockProduct.mutateAsync({
        id: productId,
        quantity,
        storeId: theStore?.id || "",
      });
      toast.success(t('notifications:product.restocked'));
      setModals((prev: any) => ({ ...prev, restockModal: false }));
    } catch (error) {
      toast.error(t('notifications:product.restockFailed'));
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct.mutateAsync({
        id: selectedProduct.id,
        storeId: theStore?.id || "",
      });
      toast.success(t('notifications:product.deleted'));
      setModals((prev: any) => ({ ...prev, deleteModal: false }));
    } catch (error) {
      toast.error(t('notifications:product.deleteFailed'));
    }
  };

  const filteredProducts =
    products?.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];
  if (productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
      </div>
    );
  }

  if (!theStore?.id) {
    return (
      <div className="flex items-center justify-center h-64">
        Please select a store first
      </div>
    );
  }

  if (!canViewInventory) {
    return (
      <div className="flex items-center justify-center h-64">
        You don't have permission to view inventory
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#18191A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-4">
        {/* Header Section */}
        <div className="bg-white dark:bg-[#18191A] rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6">
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-l lg:text-3xl font-bold text-gray-900 dark:text-white">
                {t('inventory.title')}
              </h1>
            </div>
            
            {/* Add Product Button with Dropdown */}
            <div className="relative">
              <div className="flex items-center gap-2">
                <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span className="hidden md:inline">Filters</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t('inventory.filterInventory')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="search">{t('inventory.searchProducts')}</Label>
                        <Input
                          id="search"
                          placeholder={t('inventory.searchPlaceholder')}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="stock-filter">{t('inventory.stockStatus')}</Label>
                        <Select value={stockFilter} onValueChange={setStockFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('inventory.allStock')}</SelectItem>
                            <SelectItem value="low">{t('inventory.lowStock')}</SelectItem>
                            <SelectItem value="out">{t('inventory.outOfStock')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchTerm("");
                            setStockFilter("all");
                          }}
                          className="flex-1"
                        >
                          Clear Filters
                        </Button>
                        <Button 
                          onClick={() => setIsFilterModalOpen(false)}
                          className="flex-1"
                        >
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  onClick={() => setModals((prev: any) => ({ ...prev, addModal: true }))}
                  className="hidden md:inline-flex bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('inventory.addProduct')}
                </Button>
              </div>
              
              {modals.productOption && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-20">
                  <div className="py-2">
                    {/* Removed productOption.map as per edit hint */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Inventory Summary */}
        <InventorySummary products={products || []} sales={sales || []} />
        
        {/* Product Table */}
        <div className="bg-white dark:bg-[#18191A] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filteredProducts.length === 0 && !productsLoading ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? t('inventory.noProductsFound') : t('inventory.noProductsYet')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchTerm 
                  ? t('inventory.noProductsDesc')
                  : t('inventory.noProductsGetStarted')
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setModals((prev: any) => ({ ...prev, addModal: true }))}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  {t('inventory.addFirstProduct')}
                </Button>
              )}
            </div>
          ) : (
            <ProductTable
              products={filteredProducts}
              onEdit={handleEditProduct}
              onRestock={handleRestock}
              onDelete={handleDelete}
              stockFilter={stockFilter}
            />
          )}
        </div>

        {/* Modals */}
        <AddProductModal
          open={modals.addModal}
          setOpen={(open) => {
            setModals((prev: any) => ({ ...prev, addModal: open }));
            // Refetch products when modal closes
            if (!open) {
              setTimeout(() => refetchProducts(), 100);
            }
          }}
        />

        <EditProductModal
          open={modals.editModal}
          setOpen={(open) => {
            setModals((prev: any) => ({ ...prev, editModal: open }));
            // Refetch products when modal closes
            if (!open) {
              setTimeout(() => refetchProducts(), 100);
            }
          }}
          product={selectedProduct}
        />
        
        {modals.restockModal && (
          <RestockModal
            isOpen={modals.restockModal}
            setOpen={() =>
              setModals((prev: any) => ({ ...prev, restockModal: false }))
            }
            onRestock={onRestock}
            product={selectedProduct}
          />
        )}
        
        <DeleteConfirmationModal
          isOpen={modals.deleteModal}
          onClose={() =>
            setModals((prev: any) => ({ ...prev, deleteModal: false }))
          }
          onConfirm={onDeleteConfirm}
          productName={selectedProduct?.name}
        />
      </div>

      {/* Floating Add Product Button for Mobile */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <Button 
          size="icon"
          className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg"
          onClick={() => setModals((prev: any) => ({ ...prev, addModal: true }))}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default Inventory;
