import { CancleIcon, CartIcon } from "@/components/ui/Icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Minus, MoreHorizontal, MoreVertical, Plus } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/database.types";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type resultType = {
  result: Product[];
  setCart: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setSelected: any;
  selected: any;
  favouriteCount?: number;
};
const SearchResult = ({ result, setCart, setOpen, setSelected, selected, favouriteCount = 0 }: resultType) => {
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
  const [cartItem, setCartItem] = useState<Product[]>(() =>
    result
      ? result.map((item) => ({ ...item, amount: 0, price_option: "retail", showOption: false }))
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
  const { canEditInventory } = usePermissions();
  useEffect(() => {
    if (
      result 
      //&&  (cartItem.length === 0 || resultHasChanged(result, cartItem))
    ) {
      console.log(10)
      setCartItem(
        result.map((item) => ({ ...item, amount: 0, price_option: "retail", showOption: false })),
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
  const handleCustomPriceChange = (index, value) => {
    const updatedItems = [...cartItem];
    const parsed = parseFloat(value);
    updatedItems[index].custom_price = isNaN(parsed) ? undefined : parsed;
    setCartItem(updatedItems);
  };
  const [isOption, showOption] = useState<{id: number, state: boolean}>()
  const handleAddCart = (item) => {
    if (item?.quantity > 0 && item?.price_option !== "") {
      const toAdd = { ...item } as any;
      if (item.price_option === "custom" && item.custom_price) {
        toAdd.unit_price = item.custom_price;
      }
      setCart((prev) => [...prev, toAdd]);
    } else {
      if (item?.quantity === 0) {
        toast.error("Specify a valid quantity");
      } else if (item?.price_option === "") {
        toast.error("Select a price option");
      }
    }
  }
  const handleOption = (id: number) => {
    showOption({id: id, state: true})
  }
  if(result && result.length === 0) {
    return (
      <div className="xl:flex hidden w-full text-[14px] justify-center">
        No Product match the searched item
      </div>
    );
  }
  return (
    <Table className="oveflow-y-scroll h-[600px] hidden xl:block">
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Unit Price</TableHead>
          <TableHead>Wholesale Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Favourite</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cartItem.map((item, index) => (
          <TableRow key={index}>
            <TableCell className="py-4">
              <div className="flex items-center space-x-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    ₦{item.unit_price.toLocaleString()}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              ₦{item.unit_price.toLocaleString()}
              {item?.wholesale_price &&
              <div className="flex items-center gap-x-[3px] text-[12px]">
                <img src="/Wholesale.svg" alt="wholesale" />
                  {`₦${item.wholesale_price.toLocaleString()}`}
              </div>}
            </TableCell>
            <TableCell>
              ₦{item.wholesale_price?.toLocaleString() || 'N/A'}
            </TableCell>
            <TableCell>
              {
                item.quantity < item.low_stock_threshold && "Out of Stock"
              }
              {
                item.quantity > item.low_stock_threshold && item.quantity
              }
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-center">
                {item.favourite ? (
                  <span className="text-yellow-500 text-sm">⭐</span>
                ) : (
                  <span className="text-gray-300 text-sm">☆</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center border p-[4px] gap-x-[6px] bg-[#FFFFFF] dark:bg-[#000000]">
                <button
                  onClick={() => decrementQuantity(index)}
                  className="border p-[5px] flex items-center justify-center"
                  disabled={cartItem[index]?.amount < 1}
                >
                  <Minus className="h-4 w-4"/>
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
                      : toast.error(
                          `The maximum amount of product you can add to cart is ${item.quantity}`,
                        )
                  }
                  step="0.01"
                  className="w-20 h-[28px] text-center focus:outline-none"
                />
                <button
                  className="border p-[5px] flex items-center justify-center"
                  onClick={() => incrementQuantity(index)}
                  disabled={cartItem[index]?.amount === item?.quantity}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </TableCell>
            <TableCell>
              <Select
                value={cartItem[index]?.price_option || ""}
                defaultValue="retail"
                onValueChange={(e) => handlePriceOption(index, e)}
              >
                <SelectTrigger className="w-[130px] bg-neutral-100 dark:bg-neutral-800">
                  <SelectValue placeholder="Select Price Option" />
                </SelectTrigger>
                <SelectContent>
                  {item?.unit_price &&
                    item?.wholesale_price !== 0 &&
                    cartOptions.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  {item?.unit_price && !item?.wholesale_price && 
                    item?.wholesale_price === 0 && (
                    <SelectItem
                      key={cartOptions[0].key}
                      value={cartOptions[0].key}
                    >
                      {cartOptions[0].label}
                    </SelectItem>
                  )}
                  {!item?.unit_price && item?.wholesale_price && (
                    <SelectItem
                      key={cartOptions[1].key}
                      value={cartOptions[1].key}
                    >
                      {cartOptions[1].label}
                    </SelectItem>
                  )}
                  <SelectItem value="custom">Custom price</SelectItem>
                </SelectContent>
              </Select>
              {cartItem[index]?.price_option === "custom" && (
                <div className="mt-2">
                  <Input
                    type="number"
                    placeholder="Enter custom price"
                    value={cartItem[index]?.custom_price ?? ""}
                    onChange={(e) => handleCustomPriceChange(index, e.target.value)}
                  />
                </div>
              )}
            </TableCell>
            <TableCell>
              <button
                onClick={() => handleAddCart(cartItem[index])}
                className="bg-transparent hover:bg-tranparent"
                disabled={
                  !cartItem[index]?.price_option || !cartItem[index]?.amount
                }
              >
                <CartIcon
                  fill={cartItem[index]?.price_option && cartItem[index]?.amount ? "#56B36F" : "#BCBCBC"}
                />
              </button>
            </TableCell>
            {
              canEditInventory && 
              <TableCell className="flex items-center">
              <Button onClick={() => (isOption?.id === index && isOption?.state ? showOption(undefined): handleOption(index))} className="bg-transparent hover:bg-transparent focus:bg-transparent dark:text-[#ffffff] text-[#000000]">
                  {isOption?.id === index && isOption?.state ? <CancleIcon /> :  <MoreVertical className="h-4 w-4"/>}
                </Button>
              </TableCell>
            }
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default SearchResult;