import axios from "axios";
const paystackApiKey = import.meta.env.VITE_PAYSTACK_API_KEY;
export const AxiosClient = axios.create({
    baseURL: `https://api.paystack.co`, 
    headers: {
        Authorization: `Bearer ${paystackApiKey}`,
        "Content-Type": "application/json",
    }
})