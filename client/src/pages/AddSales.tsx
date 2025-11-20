import { OnPageLoad } from "@/components/ui/Icons";
import { Input } from "@/components/ui/input";
import SearchResult from "@/components/sales/AddSales/SearchResult";
import { StoreContext } from "@/contexts/StoreContext";
import { useContext, useState, useCallback, useMemo } from "react";
import { useAddProduct, useProducts, useUpdateProductQuantity } from "@/integrations/supabase/hooks/products";
import { Product } from "@/types/database.types";
import TopBar from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import EditProductModal from "@/components/ui/modals/EditProductModal";
import toast from "react-hot-toast";
import { CheckinventoryRestriction } from "@/utils/subscriptionHelpers/inventoryRestriction";
import { SubscriptionContext } from "@/contexts/SubscriptionContext";
import { Toggle } from "@/components/ui/toggle";
import { useToggleFavouriteProduct } from "@/integrations/supabase/hooks/product-mutations";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Star, Package, ArrowLeft, X, Plus, Minus, ChevronDown, Loader2, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAddSale, useSalesPerDay } from "@/integrations/supabase/hooks/sales";
import { useAddFinancialRecord } from "@/integrations/supabase/hooks/finance";
import { useAddNotification, useGetDeviceToken } from "@/integrations/supabase/hooks/notifications";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { checkSalesRestriction } from "@/utils/subscriptionHelpers/salesRestriction";
import { sendPushNotification } from "@/utils/pushNotification";
import React from "react";
import NoStoreMessage from "@/components/NoStoreMessage";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useQueryClient } from "@tanstack/react-query";

interface CartItem extends Product {
  cartQuantity: number;
  selectedPriceOption: 'retail' | 'wholesale' | 'custom';
}

const AddSales = () => {
  const theStore = useContext(StoreContext);
  const subscriptionData = useContext(SubscriptionContext);
  const addProduct = useAddProduct();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<boolean>(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined)
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [cartSlideOpen, setCartSlideOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'credit' | 'bank_transfer' | 'POS'>('cash');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Sales and notification hooks
  const { user } = useAuth();
  const { isOnline } = useOfflineStatus();
  const addSale = useAddSale();
  const addFinancialRecord = useAddFinancialRecord();
  const addNotification = useAddNotification();
  const updateProductQuantity = useUpdateProductQuantity();
  const { data: token } = useGetDeviceToken(theStore?.owner_id);
  const { data: sales_per_day } = useSalesPerDay(
    theStore?.id,
    format(new Date(), "yyyy-MM-dd"),
  );

  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useProducts(theStore?.id || "");

  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const toggleFavouriteMutation = useToggleFavouriteProduct();

  // Memoized filtered products for performance
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    // If there's a search query, show all products that match the search
    if (searchQuery.trim()) {
      return products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // If no search query, show only favorites
    return products.filter(product => product.favourite);
  }, [products, searchQuery]);

  // Note: Do not early-return before all hooks are declared to avoid hook-order issues.

  const onSaveProduct = async (
    productData: Omit<Product, "id" | "store_id">,
  ) => {
    try {
      if (!theStore?.id) {
        toast.error("No store selected");
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
      toast.success("Product added successfully");
      // } else {
      //   toast.error("Upgrade your plan to add more products");
      // }
      setModal(false);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    }
  };

  const favouriteProducts = useMemo(() =>
    products?.filter(product => product.favourite) || [],
    [products]
  );

  // Optimized cart functions with useCallback to prevent re-renders
  const handleAddToCart = useCallback((product: Product, quantity: number = 1, priceOption: 'retail' | 'wholesale' | 'custom' = 'retail', customPrice?: number) => {
    console.log('Adding to cart:', product.name, 'Quantity:', quantity, 'Price Option:', priceOption, 'Custom:', customPrice);

    if (quantity <= 0 || quantity > product.quantity) {
      toast.error("Invalid quantity");
      return;
    }

    if (priceOption === 'custom') {
      if (customPrice === undefined || isNaN(customPrice) || customPrice <= 0) {
        toast.error('Enter a valid custom price');
        return;
      }
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id && item.selectedPriceOption === priceOption);

      if (existingItem) {
        const newQuantity = existingItem.cartQuantity + quantity;
        if (newQuantity > product.quantity) {
          toast.error(`Only ${product.quantity - existingItem.cartQuantity} more available`);
          return prevItems;
        }
        const updatedItems = prevItems.map(item =>
          item.id === product.id && item.selectedPriceOption === priceOption
            ? { ...item, cartQuantity: newQuantity }
            : item
        );
        console.log('Updated existing item in cart. New cart:', updatedItems);
        return updatedItems;
      } else {
        const unitPriceToUse = priceOption === 'custom' && customPrice ? customPrice : product.unit_price;
        const newCartItem: any = {
          ...product,
          unit_price: unitPriceToUse,
          cartQuantity: quantity,
          selectedPriceOption: priceOption
        };
        const updatedItems = [...prevItems, newCartItem];
        console.log('Added new item to cart:', newCartItem, 'New cart:', updatedItems);
        return updatedItems;
      }
    });

    toast.success(`${product.name} added to cart`);
  }, []);

  const updateCartItem = useCallback((productId: string, updates: Partial<CartItem>) => {
    console.log('Updating cart item:', productId, updates);
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.id === productId) {
          const updatedItem = { ...item, ...updates };

          // Validate cartQuantity if it's being updated
          if (updates.cartQuantity !== undefined) {
            if (updates.cartQuantity < 0.1) {
              toast.error("Minimum quantity is 0.1");
              return item; // Return original item without update
            }
            if (updates.cartQuantity > item.quantity) {
              toast.error("Insufficient stock available");
              return item; // Return original item without update
            }
          }

          console.log('Updated item:', updatedItem);
          return updatedItem;
        }
        return item;
      });
      console.log('Updated cart items:', updatedItems);
      return updatedItems;
    });
  }, []);
  // const increaseCartQty = (id, qty) => {
  //   setCartItems((prevItems) => 
  //     prevItems.map((item) =>
  //       item.id === id ? { ...item, cartQuantity: Math.max(1, qty) } : item
  //     )
  //     // const updated = prevItems.map((item) => {
  //     //   if (item.id === id) {
  //     //     const updates = {...item, cartQuantity: qty}
  //     //     console.log(item)
  //     //     console.log(updates)
  //     //     return updates
  //     //   }
  //     //   return item;
  //     // })
  //     // return updated
  //   )
  // }

  const removeFromCart = useCallback((productId: string, priceOption: 'retail' | 'wholesale') => {
    setCartItems(prevItems =>
      prevItems.filter(item => !(item.id === productId && item.selectedPriceOption === priceOption))
    );
  }, []);

  const toggleFavourite = useCallback((product: Product) => {
    const favCount = favouriteProducts.length;
    if (!product.favourite && favCount >= 10) {
      toast.error("Sorry, you cannot add more than 10 products to favourites");
      return;
    }

    toggleFavouriteMutation.mutate({
      id: product.id,
      favourite: !product.favourite,
      store_id: product.store_id,
    });
  }, [favouriteProducts.length, toggleFavouriteMutation]);

  // Memoized total calculation for performance
  const getTotalAmount = useMemo(() => {
    return cartItems.reduce((total, item) =>
      total + item.unit_price * item.cartQuantity, 0
    );
  }, [cartItems]);

  const pushNotification = async (message: string, title: string) => {
    try {
      if (token && Array.isArray(token)) {
        const promises = token.map(device =>
          sendPushNotification(device?.token, message, title, "/dashboard/notes")
        );
        await Promise.allSettled(promises);
      }
    } catch (error) {
      console.log("Push notification error (non-critical):", error);
    }
  };

  const handleCheckout = async () => {
    if (isCheckingOut) {
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!paymentMode) {
      toast.error("Please select a payment method");
      return;
    }

    setIsCheckingOut(true);

    try {

      /* commented out subscription checker to make all features free for now */

      // const checkSalesPerDay = checkSalesRestriction(
      //   subscriptionData?.userSub?.userSub?.plan_type,
      //   sales_per_day?.length || 0,
      // );

      // if (checkSalesPerDay !== "success") {
      //   toast.error("Upgrade your plan to add more sales per day");
      //   setIsCheckingOut(false);
      //   return;
      // }

      // Calculate total as a number (not a memoized getter)
      const totalAmount = getTotalAmount; // This IS the computed value from useMemo

      const saleData: any = {
        total_price: totalAmount,
        payment_mode: paymentMode,
        store_id: theStore?.id || "",
        sales_rep_name: "Admin",
        created_date: format(new Date(), "yyyy-MM-dd"),
        sales_type: cartItems.map((item) => ({
          sales_type: item.selectedPriceOption,
        })),
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.cartQuantity,
          unit_price: item.unit_price,
          // Pass product details for optimistic updates (will be stripped before DB insert)
          product: item
        })),
      };

      // Attach financial record data for offline sync (if needed)
      // We attach it regardless of online status, and let the mutation handler decide
      // The useAddSale mutation strips this field before sending to Supabase when online
      if (theStore?.id && user?.id) {
        saleData.financial_record_data = {
          store_id: theStore.id,
          user_id: user.id,
          type: 'income',
          reason: 'Sales of products',
          amount: totalAmount,
          date: saleData.created_date,
        };
      }

      // Execute mutation - useOfflineMutation handles both online and offline cases
      // It also handles "Lie-fi" (connected but failed) by falling back to offline queue
      console.log('🔄 Starting sale mutation in AddSales...');
      const createdSale = await addSale.mutateAsync(saleData);
      console.log('✅ Sale mutation completed in AddSales:', createdSale);

      // Only execute secondary operations if we are truly online and the sale was created on server
      // If we are offline (or fell back to offline), createdSale will be the optimistic data
      // We can check if it's optimistic by checking if we are online, or if the ID is temporary (though UUIDs look real)
      // A better check is to rely on isOnline for these secondary side effects that MUST happen online
      // (or should be queued separately, but for now we'll stick to online-only for these extras)

      if (isOnline && createdSale?.id) {
        // Create linked finance income record
        if (theStore?.id && user?.id) {
          try {
            await addFinancialRecord.mutateAsync({
              store_id: theStore.id,
              user_id: user.id,
              type: 'income',
              reason: 'Sales of products',
              amount: totalAmount,
              date: saleData.created_date,
              sale_id: createdSale.id,
            });
          } catch (finError) {
            console.warn("Finance record creation failed (non-critical):", finError);
          }
        }

        // Update product quantities
        for (const item of cartItems) {
          try {
            await updateProductQuantity.mutateAsync({
              id: item.id,
              quantity: item.cartQuantity,
              storeId: theStore?.id,
            });
          } catch (qtyError) {
            console.warn("Quantity update failed:", qtyError);
          }
        }

        // Add notifications
        if (theStore?.id) {
          try {
            const productNames = cartItems.map((item) => item.name).join(", ");
            await addNotification.mutateAsync({
              user_id: user?.id || theStore?.owner_id,
              message: `New sale by Admin: ${productNames} for ₦${totalAmount.toFixed(2)}`,
              type: "sale",
              read: false,
              store_id: theStore.id,
            });

            pushNotification(
              `New sale by Admin: ${productNames} for ₦${totalAmount.toFixed(2)}`,
              "New Sale",
            ).catch(err => console.log("Push notification error:", err));

            // Check for low stock and send notifications
            for (const item of cartItems) {
              const updatedQuantity = (products?.find((p) => p.id === item.id)?.quantity || 0) - item.cartQuantity;
              const threshold = products?.find((p) => p.id === item.id)?.low_stock_threshold || 0;

              if (updatedQuantity <= threshold) {
                await addNotification.mutateAsync({
                  user_id: user?.id,
                  message: `Low stock alert: ${item.name} has ${updatedQuantity} units remaining`,
                  type: "low_stock_threshold",
                  read: false,
                  store_id: theStore.id,
                });

                pushNotification(
                  `${item.name} has ${updatedQuantity} units remaining`,
                  "Low stock Alert",
                ).catch(err => console.log("Push notification error:", err));
              }
            }
          } catch (notifError) {
            console.warn("Notification failed:", notifError);
          }
        }
      }

      toast.success(isOnline ? "Sale completed successfully!" : "Sale saved offline! It will sync when you're back online.");

      // Clear cart and close modals
      setCartItems([]);
      setCartModalOpen(false);
      setCartSlideOpen(false);
      setPaymentMode('cash');

      // Navigate to sales page
      navigate("/dashboard/sales");

    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error("Failed to complete sale: " + (error.message || "Unknown error"));
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Memoized ProductCard component to prevent unnecessary re-renders
  const ProductCard = React.memo(({ product }: { product: Product }) => {
    const [quantity, setQuantity] = useState(1);
    const [priceOption, setPriceOption] = useState<'retail' | 'wholesale' | 'custom'>('retail')
    const [customPrice, setCustomPrice] = useState<number | undefined>(undefined);
    const incrementQuantity = useCallback(() => {
      const newQuantity = quantity + 1;
      if (newQuantity <= product.quantity) {
        setQuantity(newQuantity);
      }
    }, [quantity, product.quantity]);

    const decrementQuantity = useCallback(() => {
      const newQuantity = quantity - 1;
      if (newQuantity >= 0.1) {
        setQuantity(newQuantity);
      }
    }, [quantity]);

    const handleQuantityChange = useCallback((value: string) => {
      const num = parseFloat(value);
      if (!isNaN(num) && num > 0 && num <= product.quantity) {
        setQuantity(num);
      }
    }, [product.quantity]);

    const handleAddClick = useCallback(() => {
      handleAddToCart(product, quantity, priceOption, customPrice);
    }, [product, quantity, priceOption, customPrice, handleAddToCart]);

    const handleToggleFavourite = useCallback(() => {
      toggleFavourite(product);
    }, [product, toggleFavourite]);

    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
        <div className="p-4 flex flex-col gap-3">
          {/* Header: name + favourite */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base leading-snug line-clamp-2">
              {product.name}
            </h3>
            <button
              type="button"
              onClick={handleToggleFavourite}
              className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
              aria-label="Toggle favourite"
              title="Toggle favourite"
            >
              <Star className={`h-4 w-4 ${product.favourite ? 'text-yellow-500' : 'text-gray-400'}`} />
            </button>
          </div>

          {/* Meta: price and stock */}
          <div className="flex items-center justify-between text-xs md:text-sm">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
              ₦{(product.unit_price || 0).toLocaleString()} <span className="hidden sm:inline">/ Unit</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
              In stock: {product.quantity}
            </span>
          </div>

          {/* Controls */}
          <div className="space-y-2 md:space-y-3">
            {/* Quantity */}
            <div className="flex items-center gap-2">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 0.1}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="0.1"
                max={product.quantity}
                step="0.1"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="flex-1 text-center text-xs md:text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={incrementQuantity}
                disabled={quantity >= product.quantity}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Price option and Add */}
            <div className="flex items-center gap-2">
              <Select value={priceOption} onValueChange={(value: 'retail' | 'wholesale' | 'custom') => setPriceOption(value)}>
                <SelectTrigger className="w-full h-8 text-xs md:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Unit Price</SelectItem>
                  <SelectItem value="custom">Custom price</SelectItem>
                </SelectContent>
              </Select>
              {priceOption === 'custom' && (
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Enter price"
                  value={customPrice === undefined ? '' : customPrice}
                  onChange={(e) => setCustomPrice(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                  className="w-28 text-xs md:text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 focus:outline-none"
                />
              )}
              <Button
                size="sm"
                onClick={handleAddClick}
                disabled={product.quantity <= 0}
                className="flex-1 h-8 text-xs md:text-sm bg-green-600 hover:bg-green-700 text-white"
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (
    !theStore ? (
      <NoStoreMessage
        title="Add Sales"
        description="Create your first store to start recording sales transactions and managing your business revenue."
      />
    ) : (
      <div className="min-h-screen bg-white dark:bg-[#18191A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-white"
              >
                <ArrowLeft className="h-4 w-4 text-gray-700 dark:text-white" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Sales</h1>
            </div>
          </div>

          {/* Search Section */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* Search Section */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-[#18191A]/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder={searchQuery.trim() ? "Searching all products..." : "Search to see all products..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10 bg-white dark:bg-gray-800 focus-visible:ring-2 focus-visible:ring-green-500"
                      />
                      {searchQuery.trim() && (
                        <button
                          type="button"
                          aria-label="Clear search"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {!searchQuery.trim() && (
                      <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/20">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>Showing favorites only</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="mt-6 space-y-6">
                {/* Status indicator */}
                {!searchQuery.trim() && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      <Star className="w-3 h-3 mr-1" />
                      Showing Favourites ({favouriteProducts.length})
                    </Badge>
                  </div>
                )}

                {searchQuery.trim() && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      Search Results ({filteredProducts.length})
                    </Badge>
                  </div>
                )}

                {productsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-grey-600 mx-auto" />
                    <p className="mt-4 text-gray-500">Loading products...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    {!searchQuery.trim() ? (
                      <>
                        <p className="text-lg">No favorite products</p>
                        <p className="text-sm">Add products to favorites or search to see all products</p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg">No products found</p>
                        <p className="text-sm">Try adjusting your search terms</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Cart Button - Always visible and on top for all screens */}
        {cartItems.length > 0 && !cartModalOpen && (
          <div className="fixed bottom-6 left-0 w-full z-[9999] flex justify-center pointer-events-none">
            <div className="pointer-events-auto w-full flex justify-center">
              <Button
                onClick={() => setCartModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white shadow-2xl px-6 py-4 rounded-full text-base font-semibold transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-white/20 w-[90vw] max-w-md"
                style={{
                  minWidth: 'fit-content',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                <span className="whitespace-nowrap">Confirm Sales ({cartItems.length})</span>
                <Badge variant="secondary" className="ml-2 bg-white text-green-600 font-semibold">
                  ₦{getTotalAmount.toLocaleString()}
                </Badge>
              </Button>
            </div>
          </div>
        )}

        {/* Cart Modal */}
        {cartModalOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-[9996] bg-black/50 transition-all duration-300 ease-out"
              onClick={() => setCartModalOpen(false)}
            />

            {/* Mobile Cart Modal - Bottom slide up */}
            <div className="fixed inset-x-0 bottom-0 z-[9997] transform transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] lg:hidden">
              <div className="bg-white dark:bg-[#18191A] rounded-t-2xl shadow-2xl border-t border-gray-200 dark:border-gray-700 max-h-[85vh] flex flex-col">
                {/* Drag Handle */}
                <div className="flex justify-center py-3">
                  <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors hover:bg-gray-400 dark:hover:bg-gray-500" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Confirm Sales ({cartItems.length})
                  </h2>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setCartModalOpen(false)}
                    className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Your cart is empty</p>
                    </div>
                  ) : (
                    cartItems.map((item) => (
                      <Card key={`${item.id}-${item.selectedPriceOption}`} className="p-3 border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-0">
                          <div className="flex items-start gap-3">

                            {/* Product Details */}
                            <div className="flex-1 space-y-2">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-sm leading-tight">{item.name}</h4>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-red-500 flex-shrink-0"
                                  onClick={() => removeFromCart(item.id, item.selectedPriceOption)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>

                              {/* Price Option Selector */}
                              <Select
                                value={item.selectedPriceOption}
                                onValueChange={(value: 'retail' | 'wholesale' | 'custom') =>
                                  updateCartItem(item.id, { selectedPriceOption: value })
                                }
                              >
                                <SelectTrigger className="w-full h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[9999]">
                                  <SelectItem value="retail">Retail - ₦{item.unit_price?.toLocaleString()}</SelectItem>
                                  <SelectItem value="custom">Custom Price - ₦{item.unit_price?.toLocaleString()}</SelectItem>
                                </SelectContent>
                              </Select>

                              {/* Quantity and Price Display */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => {
                                      const newQuantity = Math.max(0.1, Math.round((item.cartQuantity - 1) * 10) / 10);
                                      if (newQuantity >= 0.1) {
                                        updateCartItem(item.id, { cartQuantity: newQuantity });
                                      }
                                    }}
                                    disabled={item.cartQuantity <= 0.1}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <input
                                    type="number"
                                    min="0.1"
                                    max={item.quantity}
                                    step="0.1"
                                    value={item.cartQuantity}
                                    onChange={(e) => {
                                      const newQuantity = parseFloat(e.target.value);
                                      if (!isNaN(newQuantity) && newQuantity >= 0.1 && newQuantity <= item.quantity) {
                                        updateCartItem(item.id, { cartQuantity: newQuantity });
                                      }
                                    }}
                                    className="w-16 text-center text-xs border-0 focus:outline-none focus:ring-0 bg-transparent"
                                  />
                                  <button
                                    onClick={() => {
                                      const newQuantity = Math.round((item.cartQuantity + 1) * 10) / 10;
                                      if (newQuantity <= item.quantity) {
                                        updateCartItem(item.id, { cartQuantity: newQuantity });
                                      } else {
                                        toast.error("Maximum quantity reached");
                                      }
                                    }}
                                    disabled={item.cartQuantity >= item.quantity}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">₦{(item.unit_price * item.cartQuantity).toLocaleString()}</p>
                                  <p className="text-xs text-gray-500">₦{item.unit_price?.toLocaleString()} each</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {/* Footer with Total and Checkout */}
                {cartItems.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-lg font-bold text-green-600">₦{getTotalAmount.toLocaleString()}</span>
                    </div>

                    {/* Payment Mode Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Payment Method:</Label>
                      <Select
                        value={paymentMode}
                        onValueChange={(value: 'cash' | 'credit' | 'bank_transfer' | 'POS') => {
                          console.log('Payment mode changed to:', value);
                          setPaymentMode(value);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent className="z-[99999] bg-white dark:bg-[#18191A]">
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="POS">POS</SelectItem>
                          <SelectItem value="credit">Credit</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">Selected: {paymentMode}</p>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                    >
                      {isCheckingOut ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Complete Sale'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Cart Modal - Right slide out */}
            <div className="fixed inset-y-0 right-0 z-[9997] transform transition-all duration-500 ease-out hidden lg:block">
              <div className="bg-white dark:bg-[#18191A] w-96 h-full shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6" />
                    Confirm Sales ({cartItems.length})
                  </h2>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setCartModalOpen(false)}
                    className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Your cart is empty</p>
                      <p className="text-sm">Add some products to get started</p>
                    </div>
                  ) : (
                    cartItems.map((item) => (
                      <Card key={`${item.id}-${item.selectedPriceOption}`} className="p-4 border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-0">
                          <div className="space-y-3">
                            {/* Product Header */}
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-base leading-tight">{item.name}</h4>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-red-500 flex-shrink-0"
                                onClick={() => removeFromCart(item.id, item.selectedPriceOption)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>

                            {/* Price Option Selector */}
                            <Select
                              value={item.selectedPriceOption}
                              onValueChange={(value: 'retail' | 'wholesale' | 'custom') =>
                                updateCartItem(item.id, { selectedPriceOption: value })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="retail">Retail - ₦{item.unit_price?.toLocaleString()}</SelectItem>
                                <SelectItem value="custom">Custom Price - ₦{item.unit_price?.toLocaleString()}</SelectItem>
                              </SelectContent>
                            </Select>

                            {/* Quantity and Price Display */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Quantity:</Label>
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => {
                                      const newQuantity = Math.max(0.1, Math.round((item.cartQuantity - 1) * 10) / 10);
                                      if (newQuantity >= 0.1) {
                                        updateCartItem(item.id, { cartQuantity: newQuantity });
                                      }
                                    }}
                                    disabled={item.cartQuantity <= 0.1}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <input
                                    type="number"
                                    min="0.1"
                                    max={item.quantity}
                                    step="0.1"
                                    value={item.cartQuantity}
                                    onChange={(e) => {
                                      const newQuantity = parseFloat(e.target.value);
                                      if (!isNaN(newQuantity) && newQuantity >= 0.1 && newQuantity <= item.quantity) {
                                        updateCartItem(item.id, { cartQuantity: newQuantity });
                                      }
                                    }}
                                    className="w-20 text-center text-sm border-0 focus:outline-none focus:ring-0 bg-transparent"
                                  />
                                  <button
                                    onClick={() => {
                                      const newQuantity = Math.round((item.cartQuantity + 1) * 10) / 10;
                                      if (newQuantity <= item.quantity) {
                                        updateCartItem(item.id, { cartQuantity: newQuantity });
                                      } else {
                                        toast.error("Maximum quantity reached");
                                      }
                                    }}
                                    disabled={item.cartQuantity >= item.quantity}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-base font-medium">₦{(item.unit_price * item.cartQuantity).toLocaleString()}</p>
                                <p className="text-sm text-gray-500">₦{item.unit_price?.toLocaleString()} each</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {/* Footer with Total and Checkout */}
                {cartItems.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-semibold">Total:</span>
                      <span className="text-xl font-bold text-green-600">₦{getTotalAmount.toLocaleString()}</span>
                    </div>

                    {/* Payment Mode Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Payment Method:</Label>
                      <Select
                        value={paymentMode}
                        onValueChange={(value: 'cash' | 'credit' | 'bank_transfer' | 'POS') => {
                          console.log('Payment mode changed to:', value);
                          setPaymentMode(value);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent className="z-[99999] bg-white dark:bg-[#18191A]">
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="POS">POS</SelectItem>
                          <SelectItem value="credit">Credit</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">Selected: {paymentMode}</p>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base"
                    >
                      {isCheckingOut ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Complete Sale'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <EditProductModal
          open={modal}
          setOpen={(open) => setModal(open)}
          product={selectedProduct}
        />
      </div>
    )
  );
};

export default AddSales;
