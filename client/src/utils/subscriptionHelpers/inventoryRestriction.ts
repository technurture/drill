export const CheckinventoryRestriction = (
  subscriptionType: string,
  products: number,
) => {
  switch (subscriptionType) {
    case "":
      return freePlanRestriction(products);
    case "Basic":
      return basicPlanRestriction(products);
    case "Ultimate":
      return "success";
    case "Boss":
      return "success";
  }
};
export const freePlanRestriction = (number_of_producs: number) => {
  if (number_of_producs < 40) {
    return "success";
  } else {
    return "error";
  }
};
export const basicPlanRestriction = (number_of_producs: number) => {
  if (number_of_producs < 200) {
    return "success";
  } else {
    return "error";
  }
};
