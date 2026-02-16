import axios from "axios";
import { baseUrl } from "./Api";

// 1. إنشاء الـ Instance الأساسي بدون Headers ثابتة للتوكن
export const Axios = axios.create({
    baseURL: baseUrl,
});

// 2. استخدام Interceptor لحقن التوكن في كل طلب (Request) لحظة خروجه
Axios.interceptors.request.use(
    (config) => {
        // بنقرأ التوكن من الـ localStorage في كل مرة بنبعت فيها طلب
        const token = window.localStorage.getItem("e-commerce");
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. (إضافي) التعامل مع استجابة السيرفر لو التوكن منتهي
Axios.interceptors.response.use(
    (response) => response,
    (error) => {
        // لو السيرفر رد بـ 401 (Unauthorized) واليوزر كان معاه توكن قديم
        if (error.response && error.response.status === 401) {
            // ممكن هنا تمسح التوكن لو حابب
            // window.localStorage.removeItem("e-commerce");
        }
        return Promise.reject(error);
    }
);