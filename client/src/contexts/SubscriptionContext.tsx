import { subscriptionType } from "@/types/database.types";
import { createContext, useReducer, ReactNode } from "react";

export const SubscriptionContext = createContext<subscriptionType>({
  userSub: {
    userSub: {
      amount: "",
      billing_cycle: "",
      created_at: "",
      end_date: "",
      id: "",
      is_trial: false,
      payment_reference: "",
      plan_type: "",
      start_date: "",
      status: "",
      user_id: "",
    },
  },
  dispatchSub: "",
});

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const initialData = {
    userSub: {
      amount: "",
      billing_cycle: "",
      created_at: "",
      end_date: "",
      id: "",
      is_trial: false,
      payment_reference: "",
      plan_type: "",
      start_date: "",
      status: "",
      user_id: "",
    },
  };
  
  const reducer = (state: any, action: any) => {
    switch (action?.type) {
      case "set-subscription":
        return action?.data;
      default:
        return state;
    }
  };

  const [subData, dispatch] = useReducer(reducer, initialData);

  return (
    <SubscriptionContext.Provider
      value={{ userSub: subData, dispatchSub: dispatch }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionProvider;
