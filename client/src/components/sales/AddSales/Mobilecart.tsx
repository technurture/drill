import { CheckMark, Loader, Trolley } from "@/components/ui/Icons";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Minus, Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/database.types";
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import {
  useAddNotification,
  useGetDeviceToken,
} from "@/integrations/supabase/hooks/notifications";
import { StoreContext } from "@/contexts/StoreContext";
import { sendPushNotification } from "@/utils/pushNotification";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAddSale,
  useSalesPerDay,
} from "@/integrations/supabase/hooks/sales";
import {
  useProducts,
  useUpdateProductQuantity,
} from "@/integrations/supabase/hooks/products";
import { format } from "date-fns";
import { SubscriptionContext } from "@/contexts/SubscriptionContext";
import toast from "react-hot-toast";
import { checkSalesRestriction } from "@/utils/subscriptionHelpers/salesRestriction";
import { Card, CardContent } from "@/components/ui/card";
import { getProductAmount } from "@/utils/helpers";
import { useNavigate } from "react-router-dom";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

type cartType = {
  result: Product[];
  removeCart: (id: number) => void;
  addMore: Dispatch<SetStateAction<boolean>>;
};

const MobileCart = ({ result, removeCart, addMore }: cartType) => {
  const theStore = useContext(StoreContext);
  const { data: token } = useGetDeviceToken(theStore?.owner_id);
  const { user } = useAuth();
  const { data: products } = useProducts(theStore?.id || "");
  const { data: sales_per_day } = useSalesPerDay(
    theStore?.id,
    format(new Date(), "yyyy-MM-dd"),
  );
  const subscriptionData = useContext(SubscriptionContext);
  const addSale = useAddSale();
  const addNotification = useAddNotification();
  const [paymentMode, setPaymentMode] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateProductQuantity = useUpdateProductQuantity();
  const navigate = useNavigate();
  const { isOnline } = useOfflineStatus();

  const [cartItem, setCartItem] = useState<Product[]>([]);

  const paymentModes = [
    { key: "cash", value: "Cash" },
    { key: "POS", value: "POS" },
    { key: "credit", value: "Credit" },
    { key: "bank_transfer", value: "Bank Transfer" },
  ];

  const pushNotification = (message: string, title: string) => {
    if (token) {
      for (const device of token) {
        sendPushNotification(device?.token, message, title, "/dashboard/notes");
      }
    }
  };

  // Enhanced cart item initialization and update logic
  const initializeCartItems = (items: Product[]) => {
    return items.map((item) => {
      // Determine available price options
      const hasRetailPrice = item.unit_price !== undefined && item.unit_price !== null && item.unit_price > 0;
      const hasWholesalePrice = item.wholesale_price !== undefined && item.wholesale_price !== null && item.wholesale_price > 0;
      
      // Set default price option intelligently
      let defaultPriceOption = item.price_option;
      
      if (!defaultPriceOption) {
        if (hasRetailPrice && hasWholesalePrice) {
          defaultPriceOption = "retail"; // Default to retail when both available
        } else if (hasRetailPrice) {
          defaultPriceOption = "retail";
        } else if (hasWholesalePrice) {
          defaultPriceOption = "wholesale";
        } else {
          defaultPriceOption = "retail"; // Fallback
        }
      }
      
      // Ensure valid price option based on available prices
      if (defaultPriceOption === "retail" && !hasRetailPrice) {
        defaultPriceOption = hasWholesalePrice ? "wholesale" : "retail";
      }
      if (defaultPriceOption === "wholesale" && !hasWholesalePrice) {
        defaultPriceOption = hasRetailPrice ? "retail" : "wholesale";
      }
      
      return { 
        ...item, 
        price_option: defaultPriceOption,
        amount: item.amount || 1 // Ensure amount is set
      };
    });
  };

  // Check if cart result has changed
  const resultHasChanged = (newResult: Product[], currentState: Product[]) => {
    if (newResult?.length !== currentState?.length) return true;
    
    for (let i = 0; i < newResult?.length; i++) {
      if (newResult[i]?.id !== currentState[i]?.id) return true;
    }
    return false;
  };

  // Update cart items when result changes
  useEffect(() => {
    if (result && (cartItem?.length === 0 || resultHasChanged(result, cartItem))) {
      setCartItem(initializeCartItems(result));
    }
  }, [result]);

  // Calculate total amount
  const totalAmount = cartItem.reduce((sum, item) => {
    const price = item.price_option === "wholesale" 
      ? (item.wholesale_price || 0) 
      : (item.unit_price || 0);
    return sum + (price * (item.amount || 0));
  }, 0);

  // Enhanced handlers
  const handlePriceOption = (index: number, value: string) => {
    const updatedItems = [...cartItem];
    const item = updatedItems[index];
    
    // Validate that the selected option is available
    const hasRetailPrice = item.unit_price !== undefined && item.unit_price !== null && item.unit_price > 0;
    const hasWholesalePrice = item.wholesale_price !== undefined && item.wholesale_price !== null && item.wholesale_price > 0;
    
    if (value === "retail" && !hasRetailPrice) {
      toast.error("Retail price not available for this product");
      return;
    }
    
    if (value === "wholesale" && !hasWholesalePrice) {
      toast.error("Wholesale price not available for this product");
      return;
    }
    
    updatedItems[index] = { ...item, price_option: value };
    setCartItem(updatedItems);
  };

  const incrementQuantity = (index: number) => {
    const updatedItems = [...cartItem];
    const item = updatedItems[index];
    
    if ((item.amount || 0) >= item.quantity) {
      toast.error("Insufficient Stock");
      return;
    }
    
    updatedItems[index] = { ...item, amount: (item.amount || 0) + 1 };
      setCartItem(updatedItems);
  };

  const decrementQuantity = (index: number) => {
    const updatedItems = [...cartItem];
    const item = updatedItems[index];
    
    if ((item.amount || 0) <= 1) {
      return; // Don't allow less than 1
    }
    
    updatedItems[index] = { ...item, amount: (item.amount || 0) - 1 };
    setCartItem(updatedItems);
  };

  const handleAmountChange = (index: number, value: string) => {
    const updatedItems = [...cartItem];
    const item = updatedItems[index];
    const newAmount = parseInt(value) || 0;
    
    if (newAmount < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    
    if (newAmount > item.quantity) {
      toast.error("Insufficient Stock");
      return;
    }
    
    updatedItems[index] = { ...item, amount: newAmount };
    setCartItem(updatedItems);
  };

  const handleSubmit = async () => {
    if (!paymentMode) {
      toast.error("Please select a payment mode");
      return;
    }

    if (cartItem.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    // Validate all items have valid price options and amounts
    for (const item of cartItem) {
      if (!item.price_option) {
        toast.error(`Please select a price option for ${item.name}`);
        return;
      }
      if (!item.amount || item.amount < 1) {
        toast.error(`Invalid quantity for ${item.name}`);
        return;
      }
      if (item.amount > item.quantity) {
        toast.error(`Insufficient stock for ${item.name}`);
        return;
      }
    }

    const saleData = {
      total_price: totalAmount,
      payment_mode: paymentMode as "cash" | "credit" | "bank_transfer" | "POS",
      store_id: theStore?.id || "",
      sales_rep_name: "Admin",
      created_date: format(new Date(), "yyyy-MM-dd"),
      sales_type: cartItem.map((item) => ({ sales_type: item.price_option })),
      items: cartItem.map((item) => ({
        product_id: item.id,
        quantity: item.amount,
        unit_price: item.price_option === "wholesale" ? item.wholesale_price : item.unit_price,
      })),
    };

    setIsSubmitting(true);
    /* commented out subscription checker to make all features free for now */
    
    // const checkSalesPerDay = checkSalesRestriction(
    //   subscriptionData?.userSub?.userSub?.plan_type,
    //   sales_per_day?.length || 0,
    // );

    // if (checkSalesPerDay === "success") {
      try {
        await addSale.mutateAsync(saleData);
        
        // Only execute these operations when online
        if (theStore?.id && isOnline) {
          const productNames = cartItem.map((item) => item.name).join(", ");
          
          // Send notification (only when online)
          try {
            await addNotification.mutateAsync({
              user_id: user?.id || theStore?.owner_id,
              message: `New sale by Admin: ${productNames} for ₦${totalAmount.toFixed(2)}`,
              type: "sale",
              read: false,
              store_id: theStore.id,
            });
          } catch (notifError) {
            console.warn("Notification failed (non-critical):", notifError);
          }
          
          // Push notification (only when online)
          try {
            pushNotification(
              `New sale by Admin: ${productNames} for ₦${totalAmount.toFixed(2)}`,
              "New Sale",
            );
          } catch (pushError) {
            console.warn("Push notification failed (non-critical):", pushError);
          }

          // Update product quantities (only when online)
          try {
            await Promise.all(
              cartItem.map((item) =>
                updateProductQuantity.mutateAsync({
                  id: item.id,
                  quantity: item.amount,
                  storeId: theStore?.id,
                })
              )
            );
          } catch (qtyError) {
            console.warn("Product quantity update failed (non-critical):", qtyError);
          }

          // Check for low stock and send notifications (only when online)
          try {
            await Promise.all(
              cartItem.map(async (item) => {
                const product = products?.find((p) => p.id === item.id);
                if (product) {
                  const updatedQuantity = product.quantity - item.amount;
                  const threshold = product.low_stock_threshold || 0;
                  
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
                    );
                  }
                }
              })
            );
          } catch (lowStockError) {
            console.warn("Low stock notification failed (non-critical):", lowStockError);
          }
        }
        
        const successMessage = isOnline 
          ? "Sale completed successfully" 
          : "Sale saved offline and will sync when you're back online";
        toast.success(successMessage);
        navigate("/dashboard/sales");
      } catch (error) {
        console.error("Sale error:", error);
        toast.error("Failed to complete sale: " + (error.message || "Unknown error"));
      } finally {
        setIsSubmitting(false);
      }
    // } else {
    //   toast.error("Upgrade your plan to add more sales per day");
    //   setIsSubmitting(false);
    //   navigate("/dashboard/sales");
    // }
  };

  return (
    <div className="w-full p-4 transition-all duration-300 ease-in-out transform hover:translate-y-[-2px] hover:shadow-lg">
      <div className="w-full flex flex-col gap-y-4">
        <div className="flex w-full justify-between items-center transition-all duration-200">
          <span className="flex items-center gap-x-4">
            Cart <Trolley className="dark:fill-[#FFFFFF] transition-transform duration-200 hover:scale-110" />
          </span>
          <Button onClick={() => addMore(false)} variant="outline" className="transition-all duration-200 hover:scale-105">
            Add More to Cart
          </Button>
        </div>
        
        <div className="flex flex-col gap-y-4 w-full overflow-y-scroll h-[600px] transition-all duration-300">
          {cartItem.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Your cart is empty</p>
              <p className="text-sm">Add items to start making a sale</p>
            </div>
          ) : (
            cartItem.map((item, index) => {
              const hasRetailPrice = item.unit_price !== undefined && item.unit_price !== null && item.unit_price > 0;
              const hasWholesalePrice = item.wholesale_price !== undefined && item.wholesale_price !== null && item.wholesale_price > 0;

              return (
                <Card key={`${item.id}-${index}`} className="transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
              <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-6">
                  <div className="flex flex-col space-y-2">
                        <p className="text-[12px] font-medium text-muted-foreground">Name</p>
                        <p className="text-[12px] font-semibold">{item.name}</p>
                  </div>
                      
                  <div className="flex flex-col space-y-2">
                        <p className="text-[12px] font-medium text-muted-foreground">Price Option</p>
                    <Select
                          value={item.price_option || ""}
                          onValueChange={(value) => handlePriceOption(index, value)}
                >
                          <SelectTrigger className="bg-neutral-100 dark:bg-neutral-800">
                            <SelectValue placeholder="Select Option" />
                  </SelectTrigger>
                  <SelectContent>
                            {hasRetailPrice && (
                              <SelectItem value="retail">
                                Retail - ₦{item.unit_price?.toLocaleString()}
                        </SelectItem>
                            )}
                            {hasWholesalePrice && (
                              <SelectItem value="wholesale">
                                Wholesale - ₦{item.wholesale_price?.toLocaleString()}
                      </SelectItem>
                    )}
                            {!hasRetailPrice && !hasWholesalePrice && (
                              <SelectItem value="retail" disabled>
                                No price available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                  </div>
                      
                  <div className="flex flex-col space-y-2">
                        <p className="text-[12px] font-medium text-muted-foreground">Price</p>
                        <p className="text-[12px] font-semibold text-green-600 dark:text-green-400">
                          ₦{(item.price_option === "wholesale" && hasWholesalePrice 
                            ? item.wholesale_price 
                            : item.unit_price || 0
                          ).toLocaleString()}
                        </p>
                    </div>
                      
                  <div className="flex flex-col space-y-2">
                        <p className="text-[12px] font-medium text-muted-foreground">Quantity</p>
                        <div className="flex items-center justify-around p-[5px] border w-[120px] gap-x-[6px] bg-[#FFFFFF] dark:bg-[#000000] rounded-lg">
                      <button
                        onClick={() => decrementQuantity(index)}
                            className="border p-[5px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            disabled={(item.amount || 0) <= 1}
                      >
                        <Minus className="h-4 w-4"/>
                      </button>
                      <Input
                        type="number"
                            min="1"
                        max={item.quantity}
                            value={item.amount || 1}
                            onChange={(e) => handleAmountChange(index, e.target.value)}
                            className="w-10 h-[28px] text-center focus:outline-none border-0 bg-transparent"
                            onKeyDown={(e) => {
                              // Allow: backspace, delete, tab, escape, enter
                              if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                (e.keyCode === 65 && e.ctrlKey === true) ||
                                (e.keyCode === 67 && e.ctrlKey === true) ||
                                (e.keyCode === 86 && e.ctrlKey === true) ||
                                (e.keyCode === 88 && e.ctrlKey === true) ||
                                // Allow: home, end, left, right
                                (e.keyCode >= 35 && e.keyCode <= 39)) {
                                return;
                              }
                              // Ensure that it is a number and stop the keypress
                              if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                                e.preventDefault();
                              }
                            }}
                      />
                      <button
                            className="border p-[5px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        onClick={() => incrementQuantity(index)}
                            disabled={(item.amount || 0) >= item.quantity}
                      >
                            <Plus className="h-4 w-4"/>
                      </button>
                    </div>
                        <p className="text-xs text-gray-500">Stock: {item.quantity}</p>
                    </div>
                      
                  <div className="flex flex-col space-y-2 ml-6">
                        <p className="text-[12px] font-medium text-muted-foreground">Amount</p>
                        <p className="text-[12px] font-bold text-blue-600 dark:text-blue-400">
                          ₦{getProductAmount(
                            item.amount || 1,
                            item.price_option === "wholesale" && hasWholesalePrice 
                              ? item.wholesale_price 
                              : item.unit_price || 0
                          ).toLocaleString()}
                        </p>
                    </div>
                      
                  <Button
                    variant="ghost"
                    size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 justify-self-end"
                    onClick={() => removeCart(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
              );
            })
          )}
        </div>
        
        <div className="flex flex-col gap-y-4 border-t-[1px] border-gray-300 dark:border-gray-600 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-y-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Price:</span>
              <span className="font-bold text-xl text-green-600 dark:text-green-400">
                ₦{totalAmount.toLocaleString()}
              </span>
          </div>
          <div className="flex flex-col gap-y-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Payment Mode</span>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger className="w-[140px] text-[14px]">
                <SelectValue placeholder="Payment Mode" />
              </SelectTrigger>
              <SelectContent>
                {paymentModes.map((mode) => (
                  <SelectItem value={mode.key} key={mode.key}>
                    {mode.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
          
        <Button
            variant="default"
            className="w-full h-12 bg-[#000000] hover:bg-gray-800 text-[#FFFFFF] text-[16px] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            onClick={handleSubmit}
            disabled={!paymentMode || isSubmitting || cartItem.length === 0}
        >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              "Confirm Sale"
          )}
        </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileCart;
