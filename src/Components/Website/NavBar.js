import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

// استيراد الكومبوننتات الفرعية
import SearchModel from "./SearchModel"; 
import UserMenu from "./UserMenu";

export default function NavBar() {
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    
    const location = useLocation();
    const isHomePage = location.pathname === "/";

    // لوجيك تغيير لون الناف بار عند السكرول
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // غلق المنيو والسيرش عند الانتقال لصفحة جديدة
    useEffect(() => {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
    }, [location]);

    const isWhiteNav = !isHomePage || scrolled || isMenuOpen;

    const navLinks = [
        { to: "/", label: "الرئيسية" },
        { to: "/pages/electrical-tools", label: "أدوات كهربائية" },
        { to: "/pages/hand-tools", label: "أدوات يدوية" },
        { to: "/pages/accessories", label: "ملحقات" },
        { to: "/contact", label: "اتصل بنا" },
    ];

    return (
        <>
            <header className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-500 ${
                isWhiteNav ? "bg-white/95 backdrop-blur-md shadow-md py-3" : "bg-transparent py-6"
            }`}>
                <div className="container mx-auto flex justify-between items-center px-6 lg:px-10 relative">
                    
                    {/* 1. اللوجو (أقصى اليسار في الديسكتوب) */}
                    <Link to="/" className="relative flex items-center justify-center order-1 group">
                        {/* توهج خلف اللوجو في وضع الشفافية */}
                        <div className={`
                            absolute inset-[-15px] rounded-full 
                            bg-[radial-gradient(circle,_rgba(255,255,255,0.40)_0%,_transparent_70%)]
                            transition-all duration-1000 blur-sm
                            ${!isWhiteNav ? "opacity-100 scale-125" : "opacity-0 scale-50"}
                        `}></div>

                        <div className="relative z-10 w-20 md:w-28 transition-all duration-500 group-hover:scale-105">
                            <img 
                                src={require("../../Assets/logo.png")} 
                                alt="Logo" 
                                className="w-full h-auto object-contain" 
                            />
                        </div>
                    </Link>

                    {/* 2. المنيو الأساسية (تظهر في المنتصف في الديسكتوب) */}
                    <nav className="hidden lg:flex flex-1 justify-center items-center order-2">
                        <ul className="flex gap-2 list-none m-0 p-0" dir="rtl">
                            {navLinks.map((link) => (
                                <NavItem key={link.to} to={link.to} label={link.label} isWhiteNav={isWhiteNav} />
                            ))}
                        </ul>
                    </nav>

                    {/* 3. اليمين: البحث، البروفايل، والبرجر */}
                    <div className="flex items-center gap-4 lg:gap-6 order-2 lg:order-3">
                        
                        {/* زرار البحث */}
                        <button 
                            onClick={() => setIsSearchOpen(true)}
                            className={`hover:scale-110 transition-all text-lg ${isWhiteNav ? 'text-black' : 'text-white'} hover:text-red-600`}
                        >
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                        
                        {/* منيو البروفايل (أحمد) */}
                        <UserMenu isWhiteNav={isWhiteNav} userName="أحمد" />

                        {/* زرار الموبايل (Burger Icon) */}
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`lg:hidden text-2xl ml-2 transition-all ${isWhiteNav ? 'text-black' : 'text-white'}`}
                        >
                            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
                        </button>
                    </div>

                    {/* 4. قائمة الموبايل المنسدلة (تفتح تحت الهيدر) */}
                    <div className={`
                        fixed top-[70px] left-0 w-full bg-white shadow-xl transition-all duration-500 lg:hidden overflow-hidden z-[-1]
                        ${isMenuOpen ? "max-h-[500px] border-b border-gray-100 opacity-100" : "max-h-0 opacity-0"}
                    `}>
                        <ul className="flex flex-col items-center py-8 gap-4 list-none m-0" dir="rtl">
                            {navLinks.map((link) => (
                                <li key={link.to} className="w-full text-center">
                                    <NavLink 
                                        to={link.to}
                                        className={({isActive}) => `
                                            block py-3 text-lg font-black tracking-widest transition-all
                                            ${isActive ? 'text-red-600 scale-110' : 'text-black/80'}
                                        `}
                                    >
                                        {link.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </header>

            {/* مودال البحث - بيظهر فوق كل حاجة */}
            <SearchModel isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}

// كومبوننت فرعي للينكات المنيو عشان نحافظ على نظافة الكود
function NavItem({ to, label, isWhiteNav }) {
    return (
        <li>
            <NavLink to={to} className={({isActive}) => `
                relative px-5 py-2 text-[15px] font-black transition-all duration-500 block
                ${isActive ? 'text-red-600' : (isWhiteNav ? 'text-black/70' : 'text-white/80')}
                hover:text-red-600 group uppercase tracking-tighter
                after:content-[''] after:absolute after:bottom-0 after:left-1/2 
                after:-translate-x-1/2 after:h-[4px] after:w-[4px] after:rounded-full after:bg-red-600 
                after:transition-all after:duration-500 after:opacity-0
                ${isActive ? 'after:opacity-100 after:bottom-[-2px] after:scale-[2]' : 'group-hover:after:opacity-100 group-hover:after:bottom-[-2px]'}
            `}>
                {label}
            </NavLink>
        </li>
    );
}