import axios from "axios";
const googlesheetKey = import.meta.env.VITE_GOOGLE_SHEET_KEY;
const sheetId = import.meta.env.VITE_SHEET_ID
export const SheetClient = axios.create({
    baseURL: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
    // headers: {
    //     "Content-Type": "application/json",
    // }
})