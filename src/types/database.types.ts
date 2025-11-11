import { Dispatch, SetStateAction } from "react";

export interface Product {
  id: string;
  name: string;
  unit_price: number;
  wholesale_price: number;
  quantity: number;
  low_stock_threshold: number;
  store_id: string;
  expiring_date: string;
  amount?: number;
  price_option?: string;
  purchased_price?: number; // Added for profit calculation
  favourite?: boolean; // Added for favourite toggle
  product_image?: string; // Added for product images
  custom_price?: number; // Added for custom pricing in sales
}

export interface ProductWithSales extends Product {
  totalSold: number;
}

export interface Sale {
  id: string;
  total_price: number;
  payment_mode: "cash" | "credit" | "bank_transfer" | "POS";
  sales_rep_id?: string;
  sales_rep_name?: string; // Added this field
  note?: string;
  store_id: string;
  created_at: string;
  created_date?: string;
  items?: SaleItem[];
  confirmed_by?: string; // Added for confirmation tracking
  sales_type: string[];
  quantity_sold?: number;
  product_id?: string;
}

export interface SaleItem {
  [x: string]: any;
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  purchased_price?: number; // Added for profit calculation
}

export interface User {
  id: string;
  phone_number: string;
  email?: string | null;
  created_store: boolean;
  gender?: string;
  age_range?: string;
  is_agent?: boolean;
  name?: string;
  registered_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Location {
  id: string;
  name: string;
  created_at: string;
}

export interface Market {
  id: string;
  name: string;
  location_id: string;
  created_at: string;
}

export interface Store {
  id: string;
  store_name: string;
  location_id?: string;
  market_id?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface StoreSalesRep {
  id: string;
  store_id: string;
  email: string;
  sales_rep_name?: string;
  name?: string;
  can_view_inventory: boolean;
  can_edit_inventory: boolean;
  can_add_sales: boolean;
  can_edit_sales: boolean;
  created_at: string;
}

export interface CustomerTransaction {
  id: string;
  store_id: string;
  total: number;
  items: any[];
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_mode?: string;
  confirmed_by?: string;
  customer_cookies?: string;
  created_at: string;
  updated_at?: string;
  sales_rep_name?: string; // Added for self-checkout identification
}
export type subscriptionType = {
  userSub: {
    userSub: {
      amount: string;
      billing_cycle: string;
      created_at: string;
      end_date: string;
      id: string;
      is_trial: boolean;
      payment_reference: string;
      plan_type: string;
      start_date: string;
      status: string;
      user_id: string;
    };
  };
  dispatchSub: any;
};
export type earningType = {
  user_id: string;
  total_earnings: number;
  available_balance: number;
};

export type withdrawalType = {
  user_id: string;
  amount: number;
  status: string;
  user_email: string;
  account_number: string;
  account_name: string;
  bank_name: string;
};

export type marketerTableType = {
  email: string,
  location: string,
  store_name: string,
  payment_status: string,
  amount_paid: string,
  reward: string
}

export type Database = {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, "id">;
        Update: Partial<Product>;
      };
      sales: {
        Row: Sale;
        Insert: Omit<Sale, "id" | "created_at">;
        Update: Partial<Sale>;
      };
      sale_items: {
        Row: SaleItem;
        Insert: Omit<SaleItem, "id">;
        Update: Partial<SaleItem>;
      };
      users: {
        Row: User;
        Insert: Omit<User, "id">;
        Update: Partial<User>;
      };
      stores: {
        Row: Store;
        Insert: Omit<Store, "id">;
        Update: Partial<Store>;
      };
      store_sales_reps: {
        Row: StoreSalesRep;
        Insert: Omit<StoreSalesRep, "id" | "created_at">;
        Update: Partial<StoreSalesRep>;
      };
    };
  };
};
export type storeDataType = {
  id: string,
  name: string,
  location: string,
  store_footnote: string,
  products: [
    {
      id: string,
      name: string,
      quantity: number,
      store_id: string,
      favourite: boolean,
      created_at: string,
      unit_price: string,
      updated_at: string,
      expiring_date: string,
      purchased_price: number,
      wholesale_price: number,
      low_stock_threshold: number
    }
  ],
  sales: [
    {
      id: string,
      note: string,
      store_id: string,
      created_at: string,
      total_price: number,
      payment_mode: string,
      sales_rep_name: string
    }
  ],
  store_sales_reps: [
    {
      id: string,
      email: string,
      store_id: string,
      can_add_sales: boolean,
      can_edit_sales: boolean,
      sales_rep_name: string,
      can_edit_inventory: boolean,
      can_view_inventory: boolean
    }
  ],
  expiring_dates: [
    {
      id: string,
      store_id: string,
      created_at: string,
      product_id: string,
      expiring_date: string,
      quantity_restocked: number
    }
  ]
}
export type dataType = {
  data: storeDataType,
  setData: Dispatch<SetStateAction<storeDataType>>
}
