import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Cart = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Cart Items</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your cart is currently empty.</p>
          {/* TODO: Implement cart functionality */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Cart;
