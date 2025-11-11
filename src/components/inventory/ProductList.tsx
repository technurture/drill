import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, RefreshCw, AlertTriangle } from "lucide-react";

const ProductList = ({ products, onEdit, onRestock }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow> 
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>{product.name}</TableCell>
            <TableCell>₦{product.unit_price.toFixed(2)}</TableCell>
            <TableCell className="flex items-center">
              {product.quantity}
              {product.quantity <= product.low_stock_threshold && (
                <AlertTriangle className="ml-2 text-yellow-500" size={16} />
              )}
            </TableCell>
            <TableCell>
              <Button variant="ghost" onClick={() => onEdit(product)}>
                <Edit size={16} />
              </Button>
              <Button variant="ghost" onClick={() => onRestock(product)}>
                <RefreshCw size={16} />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProductList;
