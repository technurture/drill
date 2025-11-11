 import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, CalendarIcon, Package, TrendingUp, Plus, AlertCircle, Sparkles, Box } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateCalendar } from "../ui/DateCalender";
import { PopoverClose } from "@radix-ui/react-popover";
import { CancleIcon } from "../ui/Icons";
import { Card, CardContent } from "@/components/ui/card";

const RestockModal = ({ isOpen, setOpen, onRestock, product }) => {
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: { quantity: "" },
  });
  const [date, setDate] = useState<Date | undefined>()
  const quantity = watch("quantity")
  
  const onSubmit = (data) => {
    onRestock(product.id, parseFloat(data.quantity));
    reset();
    setOpen();
  };

  if (!product) return null;

  const newTotal = product.quantity + (parseFloat(quantity) || 0);
  const isLowStock = product.quantity <= product.low_stock_threshold;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-md mx-auto rounded-3xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-2xl">
        {/* Header */}
        <DialogHeader className="relative overflow-hidden">
          <div className="absolute inset-0 bg-green-500/10 dark:bg-green-400/10" />
          <div className="relative flex items-center space-x-3 p-2">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-green-600 dark:text-green-400">
            Restock Product
          </DialogTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add inventory to <span className="font-medium">{product.name}</span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="xl:hidden rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1">
          {/* Current Stock Card */}
          <Card className="border-0 bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isLowStock 
                      ? 'bg-red-100 dark:bg-red-900/30' 
                      : 'bg-green-100 dark:bg-green-900/30'
                  }`}>
                    <Box className={`w-5 h-5 ${
                      isLowStock 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Stock
              </Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {product.quantity}
                      </span>
                      {isLowStock && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
                          <AlertCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                          <span className="text-xs font-medium text-red-600 dark:text-red-400">Low Stock</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            </div>
            </CardContent>
          </Card>

          {/* Restock Amount */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-blue-500" />
              <span>Restock Amount</span>
              </Label>
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                placeholder="Enter quantity to add"
                className="text-lg h-14 pl-4 pr-16 rounded-2xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                {...register("quantity", { required: true, min: 0.1, setValueAs: v => v === '' ? 0 : parseFloat(v) })}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">units</span>
                </div>
              </div>
            </div>
          </div>

          {/* New Total Preview */}
          {quantity && parseFloat(quantity) > 0 && (
            <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-green-700 dark:text-green-300">
                        New Total Stock
                      </Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-green-800 dark:text-green-200">
                          {newTotal}
                        </span>
                        <span className="text-sm text-green-600 dark:text-green-400">
                          (+{parseFloat(quantity)})
                        </span>
                      </div>
                    </div>
                  </div>
                  <Sparkles className="w-5 h-5 text-green-500 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <DialogFooter className="pt-4">
            <Button 
              type="submit" 
              disabled={!quantity || parseFloat(quantity) <= 0}
              className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Package className="w-5 h-5 mr-2" />
              Restock Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RestockModal;
