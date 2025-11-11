export const checkSalesRestriction = (
  subscriptionType: string,
  sales_per_day: number,
) => {
  switch (subscriptionType) {
    case "":
      return freePlanRestriction(sales_per_day);
    case "Basic":
      return basicPlanRestriction(sales_per_day);
    case "Ultimate":
      return "success";
    case "Boss":
      return "success";
  }
};
export const freePlanRestriction = (number_of_sales_per_day: number) => {
  if (number_of_sales_per_day < 100) {
    return "success";
  } else {
    return "error";
  }
};
export const basicPlanRestriction = (number_of_sales_per_day: number) => {
  if (number_of_sales_per_day < 500) {
    return "success";
  } else {
    return "error";
  }
};
