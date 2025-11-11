import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/types/database.types";
import { ChevronDown, ChevronUp, ChevronRight, Minus, Plus } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Switch } from "@/components/ui/switch";

type resultType = {
  result: Product[];
  setCart: any;
  cart: Product[];
  showCart: Dispatch<SetStateAction<boolean>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setSelected: any;
  selected: any;
  favouriteCount?: number;
};
const MobileSearchResult = ({
  result,
  setCart,
  cart,
  showCart,
  setOpen,
  selected,
  setSelected,
  favouriteCount = 0
}: resultType) => {
  const cartOptions = [
    {
      key: "retail",
      label: "Unit",
    },
    {
      key: "wholesale",
      label: "WholeSales",
    },
  ];
  const [moreOption, setMoreOption] = useState({});
   const { canEditInventory } = usePermissions();
  const [cartItem, setCartItem] = useState<Product[]>(() =>
    result
      ? result.map((item) => ({ ...item, amount: 0, price_option: "retail" }))
      : [],
  );
  function resultHasChanged(newResult, currentState) {
    if (newResult.length !== currentState.length) {
      return true;
    }
    for (let i = 0; i < newResult.length; i++) {
      if (newResult[i].id !== currentState[i].id) {
        return true;
      }
    }
    return false;
  }
  useEffect(() => {
    if (
      result &&
      (cartItem.length === 0 || resultHasChanged(result, cartItem))
    ) {
      setCartItem(
        result.map((item) => ({ ...item, amount: 0, price_option: "retail" })),
      );
    }
  }, [result]);
  const incrementQuantity = (index) => {
    const updatedItems = [...cartItem];
    if (updatedItems[index].amount >= updatedItems[index].quantity) {
      toast.error("Insufficient Stock");
      return;
    }
      updatedItems[index].amount = updatedItems[index].amount + 1;
      setCartItem(updatedItems);
  };

  const decrementQuantity = (index) => {
    const updatedItems = [...cartItem];
    if (updatedItems[index].amount > 0) {
      updatedItems[index].amount = updatedItems[index].amount - 1;
      setCartItem(updatedItems);
    }
  };

  const handleAmountChange = (index, value) => {
    const updatedItems = [...cartItem];
    const requestedAmount = Number(value);
    
    if (requestedAmount > updatedItems[index].quantity) {
      toast.error("Insufficient Stock");
      return;
    }
    
    if (requestedAmount < 0) {
      toast.error("Quantity cannot be negative");
      return;
    }
    
    updatedItems[index].amount = requestedAmount;
    setCartItem(updatedItems);
  };
  const handlePriceOption = (index, value) => {
    const updatedItems = [...cartItem];
    updatedItems[index].price_option = value;
    setCartItem(updatedItems);
  };
  const toggleOption = (id: string) => {
    setMoreOption((prev) => {
      const newState = {};
      if (!prev[id]) {
        newState[id] = true;
      }
      return newState;
    });
  };
  const handleAddCart = (item) => {
    if (item?.quantity > 0 && item?.price_option !== "") {
      const toAdd: any = { ...item };
      if (item.price_option === 'custom' && item.custom_price) {
        toAdd.unit_price = item.custom_price;
      }
      setCart((prev) => [...prev, toAdd]);
      toast.success("product added to cart")
    } else {
      if (item?.quantity === 0) {
        toast.error("Specify a valid quantity");
      } else if (item?.price_option === "") {
        toast.error("Select a price option");
      }
    }
  };
  if (result.length === 0) {
    return (
      <div className="flex xl:hidden w-full text-[14px] justify-center">
        No Product match the searched item
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-y-4 py-4 h-[700px] overflow-y-scroll w-full xl:hidden">
      {cartItem &&
        cartItem.length > 0 &&
        result.map((item, index) => {
          const expanded = !!moreOption[item.id];
          return (
            <Card key={index} className="p-2">
              <CardContent className="flex flex-col gap-y-2 px-2 py-3">
                {/* Product name and Quantity label above controls, with chevron top right */}
                <div className="flex items-center justify-between w-full mb-1 relative">
                  <button
                    onClick={() => toggleOption(item.id)}
                    className="absolute right-0 top-0"
                    aria-label={expanded ? 'Collapse' : 'Expand'}
                  >
                    {expanded ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>
                {/* Row 1: Product name & quantity controls */}
                <div className="flex items-start justify-between w-full gap-x-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        ₦{item.unit_price.toLocaleString()}.00
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col w-1/2 justify-start items-start gap-y-1">
                    <span className="text-xs text-muted-foreground mb-1">Quantity</span>
                    <div className="flex items-center gap-x-3">
                      <button
                        onClick={() => decrementQuantity(index)}
                        className="border p-[5px] flex items-center justify-center rounded"
                        disabled={cartItem[index]?.amount < 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <Input
                        type="number"
                        pattern="\d*"
                        inputMode="numeric"
                        value={cartItem[index]?.amount || 0}
                        disabled={cartItem[index]?.amount === item?.quantity}
                        max={item.quantity}
                        onChange={(e) =>
                          Number(e.target.value) <= item?.quantity
                            ? handleAmountChange(index, e.target.value)
                            : toast.error(`The maximum amount of product you can add to cart is ${item.quantity}`)
                        }
                        step="0.01"
                        className="w-14 h-[28px] text-center focus:outline-none"
                      />
                      <button
                        className="border p-[5px] flex items-center justify-center rounded"
                        onClick={() => incrementQuantity(index)}
                        disabled={cartItem[index]?.amount === item?.quantity}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {/* Expanded section: covers price, stock, price option, and action buttons */}
                {expanded && (
                  <>
                    {/* Row 2: Price, Stock, Price Option */}
                    <div className="flex items-start justify-between w-full gap-x-2 mt-2">
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-muted-foreground">Price</span>
                        <span className="text-sm">₦{item.unit_price.toLocaleString()}.00</span>
                        {item.wholesale_price ? (
                          <span className="flex items-center text-[#818181] text-[10px]">
                            <img src="/Wholesale.svg" alt="wholesale" className="h-3 w-3 mr-1" />₦{item.wholesale_price.toLocaleString()}.00
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#818181]">No wholesale price</span>
                        )}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-muted-foreground">Stock</span>
                        <span className="text-sm">{item.quantity}</span>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-muted-foreground">Price Option</span>
                        <Select
                          value={cartItem[index]?.price_option || ""}
                          onValueChange={(e) => handlePriceOption(index, e)}
                        >
                          <SelectTrigger className="w-[110px] bg-neutral-100 dark:bg-neutral-800 text-left">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {item.unit_price && item?.wholesale_price !== 0 && cartOptions.map((option) => (
                              <SelectItem key={option.key} value={option.key}>{option.label}</SelectItem>
                            ))}
                            {item?.unit_price && !item?.wholesale_price && (
                              <SelectItem key={cartOptions[0].key} value={cartOptions[0].key}>{cartOptions[0].label}</SelectItem>
                            )}
                            {!item?.unit_price && item?.wholesale_price && (
                              <SelectItem key={cartOptions[1].key} value={cartOptions[1].key}>{cartOptions[1].label}</SelectItem>
                            )}
                            <SelectItem value="custom">Custom price</SelectItem>
                          </SelectContent>
                        </Select>
                        {cartItem[index]?.price_option === "custom" && (
                          <div className="mt-2 w-full">
                            <Input
                              type="number"
                              placeholder="Enter custom price"
                              value={cartItem[index]?.custom_price ?? ""}
                              onChange={(e) => {
                                const updated = [...cartItem];
                                const parsed = parseFloat(e.target.value);
                                updated[index].custom_price = isNaN(parsed) ? undefined : parsed;
                                setCartItem(updated);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Row 3: Edit product price & Add to cart */}
                    <div className="flex items-center justify-between w-full gap-x-2 mt-2">
                      {canEditInventory && (
                        <Button onClick={() => (setOpen(true), setSelected(item))} variant="ghost" className="text-xs px-2 py-1">
                          Edit Product Price <ChevronRight className="inline h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        onClick={() => handleAddCart(cartItem[index])}
                        disabled={!cartItem[index]?.amount || !cartItem[index]?.price_option}
                        variant="outline"
                        className="w-[120px] text-xs px-2 py-1"
                        size="icon"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
};
export default MobileSearchResult;
