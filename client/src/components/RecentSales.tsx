import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSales } from "../integrations/supabase/hooks/sales";
import { format, parseISO } from "date-fns";
import { useContext, useMemo, useState } from "react";
import { StoreContext } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";
import {
  TableBody,
  TableHeader,
  TableRow,
  Table,
  TableHead,
  TableCell,
} from "./ui/table";
import EditProductModal from "@/components/ui/modals/EditProductModal";
import { useProducts } from "../integrations/supabase/hooks/products";

export function RecentSales({ selectedDate }: { selectedDate: Date }) {
  const theStore = useContext(StoreContext);


  // Wait for store context to be ready
  if (!theStore || !theStore.id) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  const { data: sales } = useSales(theStore.id);
  const { data: products, refetch } = useProducts(theStore.id);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [eod, setEod] = useState<
    { name: string; qty: number; price: number; profit: number | null; purchased_price?: number; product_id?: string }[]
  >([]);
  const productSold = useMemo(() => {
    if (!Array.isArray(sales)) return [];
    let product_sold = sales;
    const day = selectedDate
      ? format(selectedDate, "MMM dd, yyyy")
      : format(Date(), "MMM dd, yyyy");
    product_sold = product_sold.filter(
      (sale) => format(sale?.created_at, "MMM dd, yyyy") === day,
    );
    const aggregateEod = [];
    for (const sold of product_sold) {
      sold.items.forEach((item) => {
        const existingItem = aggregateEod.find(
          (e) => e.name === item.product.name,
        );
        const purchasedPrice = item.product?.purchased_price;
        const profit =
          typeof purchasedPrice === "number"
            ? (item.unit_price - purchasedPrice) * item.quantity
            : null;
        if (existingItem) {
          existingItem.qty += item.quantity;
          existingItem.price += item.quantity * item?.unit_price;
          if (typeof profit === "number") {
            existingItem.profit = (existingItem.profit || 0) + profit;
          }
        } else {
          aggregateEod.push({
            name: item.product.name,
            qty: item.quantity,
            price: item.quantity * item.unit_price,
            profit: profit,
            purchased_price: purchasedPrice,
            product_id: item.product?.id,
          });
        }
      });
    }
    setEod(aggregateEod);
    product_sold = aggregateEod;
    return product_sold;
  }, [sales, selectedDate]);
  const handleExport = () => {
    const csvHeader = ["name", "qty", "price", "profit"];
    const rows = eod.map((sale) => {
      return {
        name: sale.name,
        qty: sale.qty,
        price: sale.price,
        profit: sale.profit ?? "",
      };
    });
    const csvContent = [
      csvHeader.join(","),
      ...rows.map((row) =>
        csvHeader
          .map((header) => JSON.stringify(row[header.toLowerCase()] || ""))
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${theStore.store_name} EOD sales.csv`);
  };
  if (eod?.length <= 0) {
    return <div className="text-sm text-muted-foreground">No sales today</div>;
  }
  // Calculate total profit for admin only
      const totalProfit = eod.reduce((sum, item) => sum + (item.profit || 0), 0);
  return (
    <>
      <div className="flex flex-col h-[420px] overflow-y-auto px-2 py-4">
        <div className="divide-y divide-muted flex-1 overflow-y-auto">
          {eod.map((product, index) => (
            <div key={index} className="flex items-center py-3 gap-4">
              <div className="flex-1 min-w-0 ml-0">
                <div className="text-sm text-foreground break-words whitespace-pre-line" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{product.name}</div>
                <div className="text-xs text-muted-foreground">
                  {selectedDate
                    ? format(selectedDate, "MMM dd, yyyy")
                    : format(new Date(), "MMM dd, yyyy")}
                </div>
              </div>
              <div className="flex flex-col items-end min-w-[110px]">
                <span className="text-base text-primary">₦{product.price.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">{product.qty} units</span>
                {typeof product.profit === "number" ? (
                  <span className="text-xs text-green-600 dark:text-green-400 font-semibold">Profit: ₦{product.profit.toLocaleString()}</span>
                ) : (
                  <button
                    className="text-xs text-blue-600 underline mt-1"
                    onClick={() => {
                      const prod = products?.find((p) => p.id === product.product_id);
                      setSelectedProduct(prod);
                      setShowEditModal(true);
                    }}
                  >
                    Add Purchased Price to get profit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-4 border-t border-muted flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total Price</span>
            <span className="text-3xl font-extrabold text-primary">
              ₦{eod.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
            </span>
            <span className="text-base font-bold text-green-600 dark:text-green-400">Total Profit: ₦{totalProfit.toLocaleString()}</span>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-200
              bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md
              dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700
              border border-transparent hover:border-blue-500"
          >
            <Download className="w-4 h-4" />
            Export Sales
          </button>
        </div>
      </div>
      <EditProductModal
        open={showEditModal}
        setOpen={setShowEditModal}
        product={selectedProduct}
      />
    </>
  );
}
