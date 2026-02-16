import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function GoogleCallback() {
    const location = useLocation();

    useEffect(() => {
        // 1. استخراج الـ id_token أو الـ access_token من الرابط
        const params = new URLSearchParams(location.search);
        const accessToken = params.get("access_token");

        if (accessToken) {
            // 2. نكلم Strapi عشان نستبدل توكن جوجل بـ JWT بتاعنا
            // استخدمنا fetch العادي عشان نبعد عن مشاكل axios و Vite حالياً
            fetch(`http://localhost:1337/api/auth/google/callback${location.search}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.jwt) {
                        // 3. تخزين التوكن والتوجه للداشبورد
                        window.localStorage.setItem("e-commerce", data.jwt);
                        window.location.pathname = "/dashboard";
                    } else {
                        console.error("No JWT found in response");
                        window.location.pathname = "/login";
                    }
                })
                .catch((err) => {
                    console.error("Auth Error:", err);
                    window.location.pathname = "/login";
                });
        }
    }, [location]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
                <p className="font-bold animate-pulse">جاري التحقق من الحساب...</p>
            </div>
        </div>
    );
}