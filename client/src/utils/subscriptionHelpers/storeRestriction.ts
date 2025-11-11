export const storeRestriction = (subscriptionType: string, stores: number) => {
  switch (subscriptionType) {
    case "":
      return freePlanRestriction(stores);
    case "Basic":
      return basicPlanRestriction(stores);
    case "Ultimate":
      return ultimatePlanRestriction(stores);
    case "Boss":
      return "success";
  }
};
export const freePlanRestriction = (number_of_store: number) => {
  if (number_of_store < 1) {
    return "success";
  } else {
    return "error";
  }
};
export const basicPlanRestriction = (number_of_store: number) => {
  if (number_of_store < 1) {
    return "success";
  } else {
    return "error";
  }
};
export const ultimatePlanRestriction = (number_of_store: number) => {
  if (number_of_store < 10) {
    return "success";
  } else {
    return "error";
  }
};
