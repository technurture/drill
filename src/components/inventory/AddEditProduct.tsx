import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  purchased_price: z
    .union([
      z.number().min(0, "Purchased price must be non-negative"),
      z.string().transform((val) => (val === "" ? undefined : parseFloat(val))),
      z.undefined()
    ]),
  unit_price: z
    .union([
      z.number().min(0, "Unit price must be non-negative"),
      z.string().transform((val) => (val === "" ? undefined : parseFloat(val))),
      z.undefined()
    ]),
  quantity: z
    .union([
      z.number().int().min(0, "Quantity must be non-negative"),
      z.string().transform((val) => (val === "" ? undefined : parseFloat(val))),
      z.undefined()
    ]),
  low_stock_threshold: z
    .number()
    .int()
    .min(0, "Threshold must be non-negative"),
});

const AddEditProduct = ({ product, onSave }) => {
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: product || {
      name: "",
      purchased_price: undefined,
      unit_price: 0,
      quantity: 0,
      low_stock_threshold: 0,
    },
  });

  const onSubmit = (data) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="purchased_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchased Price (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter purchased price (optional)"
                  {...field}
                  value={field.value === undefined ? "" : field.value}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val === "" ? undefined : parseFloat(val));
                  }}
                />
              </FormControl>
              <FormDescription>Optional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unit_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Price (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter unit price (optional)"
                  {...field}
                  value={field.value === undefined ? "" : field.value}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val === "" ? undefined : parseFloat(val));
                  }}
                />
              </FormControl>
              <FormDescription>Optional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Stock (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="any"
                  placeholder="Enter quantity (optional)"
                  {...field}
                  value={field.value === undefined ? "" : field.value}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val === "" ? undefined : parseFloat(val));
                  }}
                />
              </FormControl>
              <FormDescription>Optional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="low_stock_threshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Low Stock Threshold</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Alert will be triggered when stock falls below this number
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save Product</Button>
      </form>
    </Form>
  );
};

export default AddEditProduct;
