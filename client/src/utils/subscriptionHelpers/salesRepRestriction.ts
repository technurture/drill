export const checkSalesRepRestriction = (
  subscriptionType: string,
  sales_rep: number,
) => {
  switch (subscriptionType) {
    case "":
      return "error";
    case "Basic":
      return basicPlanRestriction(sales_rep);
    case "Ultimate":
      return ultimatePlanRestriction(sales_rep);
    case "Boss":
      return "success";
  }
};

export const basicPlanRestriction = (number_of_sales_rep: number) => {
  if (number_of_sales_rep < 1) {
    return "success";
  } else {
    return "error";
  }
};
export const ultimatePlanRestriction = (number_of_sales_rep: number) => {
  if (number_of_sales_rep < 10) {
    return "success";
  } else {
    return "error";
  }
};
