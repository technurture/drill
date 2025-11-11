import { supabase } from "../integrations/supabase/supabase";
import { addDays, isWithinInterval } from "date-fns";

export const checkSubscriptionNotifications = async () => {
  // Get all active subscriptions
  const { data: subscriptions, error } = await supabase
    .from("upgrades")
    .select("*")
    .eq("status", "active");

  if (error) throw error;

  const today = new Date();

  for (const subscription of subscriptions) {
    const endDate = new Date(subscription.end_date);
    const oneWeekBefore = addDays(endDate, -7);
    const oneDayBefore = addDays(endDate, -1);

    // Check if today is within notification periods
    if (
      isWithinInterval(today, {
        start: oneWeekBefore,
        end: addDays(oneWeekBefore, 1),
      })
    ) {
      await supabase.from("notifications").insert([
        {
          user_id: subscription.user_id,
          message:
            "Your subscription will expire in 1 week. Please renew to continue using all features.",
          type: "subscription_notification", // Updated to match the exact enum value in the database
          read: false,
        },
      ]);
    }

    if (
      isWithinInterval(today, {
        start: oneDayBefore,
        end: addDays(oneDayBefore, 1),
      })
    ) {
      await supabase.from("notifications").insert([
        {
          user_id: subscription.user_id,
          message:
            "Your subscription will expire tomorrow. Please renew to continue using all features.",
          type: "subscription_notification",
          read: false,
        },
      ]);
    }

    if (isWithinInterval(today, { start: endDate, end: addDays(endDate, 1) })) {
      await supabase.from("notifications").insert([
        {
          user_id: subscription.user_id,
          message:
            "Your subscription expires today. Please renew to continue using all features.",
          type: "subscription_notification",
          read: false,
        },
      ]);
    }
  }
};
