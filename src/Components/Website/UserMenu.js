import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt, faBoxOpen, faDashboard, faSignInAlt, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../Context/AuthContext"; // تأكد من مسار ملف الكونتكست عندك

export default function UserMenu({ isWhiteNav }) {
    const { user, loading, logout } = useAuth(); // سحب بيانات المستخدم من الكونتكست
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // غلق القائمة عند الضغط خارجها
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // لو لسه بيحمل الداتا، ممكن تظهر سبينر صغير أو تسيبه فاضي
    if (loading) return <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>;

    // 1. حالة المستخدم غير مسجل دخول
    if (!user) {
        return (
            <div className="flex items-center gap-3">
                <Link 
                    to="/login" 
                    className={`text-[12px] font-black uppercase tracking-widest transition-all ${isWhiteNav ? 'text-black' : 'text-white'} hover:text-red-600`}
                >
                    <FontAwesomeIcon icon={faSignInAlt} className="ml-2" />
                    دخول
                </Link>
                <span className={isWhiteNav ? 'text-gray-300' : 'text-white/20'}>|</span>
                <Link 
                    to="/signup" 
                    className={`text-[12px] font-black uppercase tracking-widest transition-all ${isWhiteNav ? 'text-black' : 'text-white'} hover:text-red-600`}
                >
                    حساب جديد
                </Link>
            </div>
        );
    }

    // 2. حالة المستخدم مسجل دخول
    const isAdminOrEmployee = user.role?.name === "Admin" || user.role?.name === "Employee";

    return (
        <div className="relative" ref={menuRef}>
            {/* الزرار الرئيسي (بيظهر اسم المستخدم) */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 font-black text-[14px] cursor-pointer transition-all ${
                    isOpen || isWhiteNav ? 'text-black' : 'text-white'
                } hover:text-red-600`}
            >
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                    {user.username.substring(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline uppercase tracking-widest text-[12px]">{user.username}</span>
            </div>

            {/* القائمة المنسدلة - تم تعديلها لتفتح ناحية اليسار (right-0) */}
            <div className={`
                absolute right-0 mt-4 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 z-[1100]
                ${isOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 translate-y-2 invisible"}
            `} dir="rtl">
                <div className="py-2">
                    <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                        <p className="text-white font-bold text-sm truncate">{user.email}</p>
                        <p className="text-[10px] text-red-500 font-black uppercase mt-1 tracking-widest">
                            {user.role?.name || "Member"}
                        </p>
                    </div>
                    
                    {/* <MenuLink to="/profile" icon={faUser} label="حسابي الشخصي" onClick={() => setIsOpen(false)} /> */}
                    
                    {/* لوحة التحكم تظهر فقط للأدمن أو الموظف */}
                    {isAdminOrEmployee && (
                        <MenuLink to="/dashboard" icon={faDashboard} label="لوحة التحكم (Admin)" onClick={() => setIsOpen(false)} />
                    )}
                    
                    {/* <MenuLink to="/orders" icon={faBoxOpen} label="طلباتي الأخيرة" onClick={() => setIsOpen(false)} /> */}
                    
                    <button 
                        onClick={() => {
                            logout();
                            setIsOpen(false); // نقفل المنيو
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-all font-bold mt-1 border-t border-white/5"
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// كومبوننت اللينك الصغير
function MenuLink({ to, icon, label, onClick }) {
    return (
        <Link 
            to={to} 
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all font-medium"
        >
            <FontAwesomeIcon icon={icon} className="text-gray-500 w-4" />
            <span>{label}</span>
        </Link>
    );
}