import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const googlesheetKey = process.env.VITE_GOOGLE_SHEET_KEY;
const sheetId = process.env.VITE_SHEET_ID
export const SheetClient = axios.create({
    baseURL: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
    // headers: {
    //     "Content-Type": "application/json",
    // }
})