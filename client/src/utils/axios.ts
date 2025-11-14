import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const paystackApiKey = process.env.VITE_PAYSTACK_API_KEY;
export const AxiosClient = axios.create({
    baseURL: `https://api.paystack.co`, 
    headers: {
        Authorization: `Bearer ${paystackApiKey}`,
        "Content-Type": "application/json",
    }
})