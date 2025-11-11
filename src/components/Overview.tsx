import React, { useContext, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useSales } from "../integrations/supabase/hooks/sales";
import {
  startOfMonth,
  endOfMonth,
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  subYears,
  addDays,
} from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StoreContext } from "@/contexts/StoreContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string;
}

export function Overview() {
  const theStore = useContext(StoreContext);
  const location = useLocation();
  const { data: sales } = useSales(theStore?.id || "");
  const [timeRange, setTimeRange] = useState(() => {
    return localStorage.getItem("overviewTimeRange") || "monthly";
  });
  const navigate = useNavigate();
  const selectTimeRange = (range: string) => {
    setTimeRange(range);
    localStorage.setItem("overviewTimeRange", range);
    if (range === "monthly") {
      location.search = "?range=monthly";
      navigate("/dashboard/?range=monthly");
    } else if (range === "daily") {
      location.search = "?range=daily";
      navigate("/dashboard/?range=daily");
    } else if (range === "yearly") {
      location.search = "?range=yearly";
      navigate("/dashboard/?range=yearly");
    } else if (range === "weekly") {
      location.search = "?range=weekly";
      navigate("/dashboard/?range=weekly");
    }
  };
  useEffect(() => {
    if (location.search === "?range=daily") selectTimeRange("daily");
    if (location.search === "?range=monthly") selectTimeRange("monthly");
    if (location.search === "?range=weekly") selectTimeRange("weekly");
    if (location.search === "?range=yearly") selectTimeRange("yearly");
  }, [location.search]);

  const getData = React.useMemo(() => {
    if (!sales) return [];

    const now = new Date();
    let data = [];

    switch (timeRange) {
      case "daily":
        const startWeek = startOfWeek(now);
        data = Array.from({ length: 7 }, (_, i) => {
          const date = addDays(startWeek, i);
          const dayStart = new Date(date.setHours(0, 0, 0, 0));
          const dayEnd = new Date(date.setHours(23, 59, 59, 999));

          const daySales = sales.filter((sale) => {
            const saleDate = parseISO(sale.created_at);
            return saleDate >= dayStart && saleDate <= dayEnd;
          });

          const total = daySales.reduce((sum, sale) => {
            const saleTotal =
              sale.items?.reduce(
                (itemSum, item) =>
                  itemSum + (item.unit_price || 0) * (item.quantity || 0),
                0,
              ) || 0;
            return sum + saleTotal;
          }, 0);

          return {
            name: format(date, "EEE dd/MM"),
            total: total,
          };
        });
        break;

      case "weekly":
        const startMonth = startOfMonth(now);
        data = Array.from({ length: 4 }, (_, i) => {
          const startDate = addDays(startMonth, i * 7);
          const endDate = addDays(startDate, 6);
          return {
            start: startDate,
            end: endDate,
            name: `${format(startDate, "dd/MM")} - ${format(endDate, "dd/MM")}`,
          };
        });
        break;

      case "monthly":
        data = Array.from({ length: 12 }, (_, i) => {
          const date = new Date(now.getFullYear(), i, 1);
          return {
            start: startOfMonth(date),
            end: endOfMonth(date),
            name: format(date, "MMM"),
          };
        });
        break;

      case "yearly":
        data = Array.from({ length: 6 }, (_, i) => {
          const date = subYears(now, 5 - i);
          return {
            start: startOfYear(date),
            end: endOfYear(date),
            name: format(date, "yyyy"),
          };
        });
        break;
    }

    if (timeRange !== "daily") {
      return data.map((period) => {
        const periodSales = sales.filter((sale) => {
          const saleDate = parseISO(sale.created_at);
          return saleDate >= period.start && saleDate <= period.end;
        });

        const total = periodSales.reduce((sum, sale) => {
          const saleTotal =
            sale.items?.reduce(
              (itemSum, item) =>
                itemSum + (item.unit_price || 0) * (item.quantity || 0),
              0,
            ) || 0;
          return sum + saleTotal;
        }, 0);

        return {
          name: period.name,
          total: total,
        };
      });
    }

    return data;
  }, [sales, timeRange]);

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-2 rounded-lg shadow">
          <p className="font-medium">₦{payload[0].value.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Overview</h3>
        <Select
          value={timeRange}
          onValueChange={(selectedRange) => {
            selectTimeRange(selectedRange);
          }}
        >
          <SelectTrigger className="w-[180px] bg-transparent border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-black-500 dark:focus:border-black-400 transition-all duration-200 shadow-sm hover:shadow-md">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg">
            <SelectItem value="daily" className="hover:bg-black-50 dark:hover:bg-black-950/20 focus:bg-black-50 dark:focus:bg-black-950/20">Daily</SelectItem>
            <SelectItem value="weekly" className="hover:bg-black-50 dark:hover:bg-black-950/20 focus:bg-black-50 dark:focus:bg-black-950/20">Weekly</SelectItem>
            <SelectItem value="monthly" className="hover:bg-black-50 dark:hover:bg-black-950/20 focus:bg-black-50 dark:focus:bg-black-950/20">Monthly</SelectItem>
            <SelectItem value="yearly" className="hover:bg-black-50 dark:hover:bg-black-950/20 focus:bg-black-50 dark:focus:bg-black-950/20">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ResponsiveContainer width="100%" height={420}>
        <BarChart data={getData}>
          <CartesianGrid strokeDasharray="0 0" stroke="" />
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₦${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total" radius={[8, 8, 0, 0]}
            fill="#42a5f5"
            isAnimationActive={true}
            className="hover:opacity-70 transition-opacity duration-200"
            style={{
              cursor: 'pointer',
              transition: 'fill 0.2s ease-in-out'
            }}
            onMouseOver={(data, index) => {
              const event = data as any;
              if (event && event.target) {
                event.target.style.fill = 'rgba(33, 84, 165, 0)';
              }
            }}
            onMouseOut={(data, index) => {
              const event = data as any;
              if (event && event.target) {
                event.target.style.fill = '#000000';
              }
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
