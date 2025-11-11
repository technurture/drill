import {
  addDays,
  isWithinInterval,
  parseISO,
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from "date-fns";

export const filterSalesByDateRange = (sales, dateRange, view) => {
  if (!dateRange || !dateRange.from || !dateRange.to) {
    return [];
  }

  const filteredSales = sales.filter((sale) => {
    const saleDate = parseISO(sale.created_at);
    return isWithinInterval(saleDate, {
      start: dateRange.from,
      end: dateRange.to,
    });
  });

  if (view === "daily") {
    // Get all days in the interval
    const days = eachDayOfInterval({
      start: dateRange.from,
      end: dateRange.to,
    });

    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayAmount = filteredSales
        .filter(
          (sale) => format(parseISO(sale.created_at), "yyyy-MM-dd") === dayStr,
        )
        .reduce((sum, sale) => sum + (sale.total_price || 0), 0);

      return {
        date: format(day, "EEE, MMM dd"), // e.g., "Sun, Jan 01"
        amount: dayAmount,
      };
    });
  }

  if (view === "weekly") {
    // Get all weeks in the interval
    const weeks = eachWeekOfInterval({
      start: dateRange.from,
      end: dateRange.to,
    });

    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart);
      const weekAmount = filteredSales
        .filter((sale) => {
          const saleDate = parseISO(sale.created_at);
          return isWithinInterval(saleDate, { start: weekStart, end: weekEnd });
        })
        .reduce((sum, sale) => sum + (sale.total_price || 0), 0);

      return {
        date: `${format(weekStart, "MMM dd")} - ${format(weekEnd, "MMM dd")}`,
        amount: weekAmount,
      };
    });
  }

  // Monthly view
  const months = eachMonthOfInterval({
    start: dateRange.from,
    end: dateRange.to,
  });

  return months.map((month) => {
    const monthEnd = endOfMonth(month);
    const monthAmount = filteredSales
      .filter((sale) => {
        const saleDate = parseISO(sale.created_at);
        return isWithinInterval(saleDate, { start: month, end: monthEnd });
      })
      .reduce((sum, sale) => sum + (sale.total_price || 0), 0);

    return {
      date: format(month, "MMMM yyyy"), // e.g., "January 2024"
      amount: monthAmount,
    };
  });
};
