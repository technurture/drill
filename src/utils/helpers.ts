import { format } from "date-fns";

export const oneMonthInMs = 30 * 24 * 60 * 60 * 1000;
export const twoMonthsInMs = 2 * oneMonthInMs;
export const threeMonthsInMs = 3 * oneMonthInMs;
const presentDate = new Date();
export const getProductAmount = (qty: number, price: number) => {
    return qty * price
}
export const getExpiryStyle = (expiry_date: string) => {
    const expDate = new Date(expiry_date);
    const diffMs = expDate.getTime() - presentDate.getTime();
    if(diffMs <= oneMonthInMs) {
       return "border border-[#FF7373] bg-[#FFE9E9] dark:text-[#000000]"
    } else if(diffMs <= twoMonthsInMs && diffMs > oneMonthInMs) {
        return "border border-[#FAB639] bg-[#FFFCE6] dark:text-[#000000]"
    } 
}
export const getExpiryStatus = (expiry_date: string) => {
    const expDate = new Date(expiry_date);
    const diffMs = expDate.getTime() - presentDate.getTime();
    if(presentDate > expDate) {
        return "Expired"
    } else if(diffMs <= oneMonthInMs) {
        return "Warning"
    } else if(diffMs <= twoMonthsInMs && diffMs > oneMonthInMs) {
        return "Warning"
    } else if(diffMs <= threeMonthsInMs && diffMs > twoMonthsInMs && diffMs > oneMonthInMs) {
        return "Warning"
    } else {
        return "Still Valid"
    }
}
export const getAgentReward = (amount: number) => {
    return amount * 0.2
}