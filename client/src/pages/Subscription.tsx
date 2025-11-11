import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { SubscriptionContext } from "@/contexts/SubscriptionContext";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase";
import {
  useAddEarnings,
  useUpdateEarnings,
} from "@/integrations/supabase/hooks/earning";
import { useUser } from "@/integrations/supabase/hooks/users";
import CancelSubScriptionModal from "@/components/ui/modals/CancelsubscriptionModal";
import { AxiosClient } from "@/utils/axios";
import { getAgentReward } from "@/utils/helpers";
import { useGetMarketerUsers, useUpdateFinancialInclusion } from "@/integrations/supabase/hooks/marketers";

const loadPaystackScript = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

const Subscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: activeUser } = useUser(user?.id);
  const { data: fromMarketer } = useGetMarketerUsers(user?.email)
  const subscription = useContext(SubscriptionContext);

  return (
    <div className="container mx-auto py-8 px-1 md:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Subscription Plans</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Subscription functionality has been removed from this application.
        </p>
      </div>
    </div>
  );
};

export default Subscription;
