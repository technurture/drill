import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useGetProduct, useUpdateProduct } from "@/integrations/supabase/hooks/products";
import { useStore } from "@/contexts/StoreContext";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const EditProductPage = () => {
  const { id } = useParams();
  const theStore = useStore();
  const navigate = useNavigate();
  const { data: product } = useGetProduct(id);
  const updateProduct = useUpdateProduct();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product?.id || !theStore?.id) {
      toast.error("Missing product or store information");
      return;
    }
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const purchased_price_raw = String(formData.get("purchased_price") || "");
    const unit_price_raw = String(formData.get("unit_price") || "");
    const quantity_raw = String(formData.get("quantity") || "");
    const low_stock_threshold_raw = String(formData.get("low_stock_threshold") || "");

    const payload: any = {
      id: product.id,
      store_id: theStore.id,
      name,
      purchased_price: purchased_price_raw !== "" ? parseFloat(purchased_price_raw) : undefined,
      unit_price: unit_price_raw !== "" ? parseFloat(unit_price_raw) : undefined,
      quantity: quantity_raw !== "" ? parseFloat(quantity_raw) : undefined,
      low_stock_threshold: low_stock_threshold_raw !== "" ? parseFloat(low_stock_threshold_raw) : undefined,
    };

    setIsLoading(true);
    try {
      await updateProduct.mutateAsync(payload);
      toast.success("Product updated successfully");
      navigate("/dashboard/inventory");
    } catch (error) {
      console.error("Update product error:", error);
      toast.error("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (product) {
      // No image handling, just set values
      // setValue("name", product.name);
      // setValue("purchased_price", product.purchased_price);
      // setValue("unit_price", product.unit_price);
      // setValue("quantity", product.quantity);
      // setValue("wholesale_price", product.wholesale_price);
      // setValue("low_stock_threshold", product.low_stock_threshold);
    }
  }, [product]);

  return (
    <div className="flex items-start overflow-y-hidden justify-center">
      <div className="w-11/12 py-6 flex flex-col items-center justify-start">
        <h1 className="text-left w-full mb-4 font-bold flex items-center justify-start gap-x-2">
          <ArrowLeft onClick={() => navigate("/dashboard/inventory")}/>
          Edit Product Details
        </h1>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Edit Product</CardTitle>
            <CardDescription>Update product details here.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" name="name" defaultValue={product?.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchased_price">Purchased Price</Label>
                  <Input
                    type="number"
                    id="purchased_price"
                    name="purchased_price"
                    defaultValue={product?.purchased_price}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit_price">Unit Price</Label>
                  <Input
                    type="number"
                    id="unit_price"
                    name="unit_price"
                    defaultValue={product?.unit_price}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    type="number"
                    id="quantity"
                    name="quantity"
                    defaultValue={product?.quantity}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                  <Input
                    type="number"
                    id="low_stock_threshold"
                    name="low_stock_threshold"
                    defaultValue={product?.low_stock_threshold}
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Product...
                  </>
                ) : (
                  'Save Product'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default EditProductPage;
