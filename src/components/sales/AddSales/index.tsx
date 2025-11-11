import { ArrowBack } from "@/components/ui/Icons";
import { Input } from "@/components/ui/input";
import SearchResult from "./SearchResult";
import Cart from "./Cart";
import { StoreContext } from "@/contexts/StoreContext";
import { Dispatch, SetStateAction, useContext, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/integrations/supabase/hooks/products";
import { Product } from "@/types/database.types";
import MobileSearchResult from "./SearchResultMobile";
import MobileCart from "./Mobilecart";
type requireProps = {
  setIsAdding: Dispatch<SetStateAction<boolean>>;
};
const AddSales = ({ setIsAdding }: requireProps) => {
  const theStore = useContext(StoreContext);
  const [cart, setCart] = useState<Product[]>([]);
  const [isCart, showCart] = useState(false);
  const { data: products } = useProducts(theStore?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const filteredProducts =
    products?.filter(
      (product) =>
        product &&
        product.name &&
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.id && product.id.toString().includes(searchTerm))),
    ) || [];
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };
  return (
    <div className="flex items-start w-full justify-between h-screen">
      {/* {!isCart && (
        <div className="flex flex-col w-full xl:w-[650px] xl:h-full gap-y-4">
          <button onClick={() => setIsAdding(false)}>
            <ArrowBack className="dark:fill-[#FFFFFF]" />
          </button>
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full xl:w-7/12"
          />
          {searchTerm && (
            <SearchResult result={filteredProducts} setCart={setCart} />
          )}
          {searchTerm && (
            <MobileSearchResult
              showCart={showCart}
              cart={cart}
              result={filteredProducts}
              setCart={setCart}
            />
          )}
        </div>
      )}*/}
    </div> 
  );
};
export default AddSales;
