import { faBars, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { Menu } from "../../Context/MenuContext";
import Dropdown from "./Dropdown";
import NotificationBell from "./NotificationBell";
import { useTranslation } from "react-i18next";

export default function TopBar() {
    const menu = useContext(Menu);
    const setIsOpen = menu.setIsOpen;
    const { i18n } = useTranslation(); // استدعاء i18n

    // وظيفة تبديل اللغة
    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="fixed top-0 left-0 w-full h-[70px] bg-white/80 backdrop-blur-md border-b border-gray-100 z-[50] flex items-center justify-between px-6">
            <div className="flex items-center gap-8">
                {/* Logo Section */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.pathname = "/dashboard"}>
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200 transition-transform active:scale-95">E</div>
                    <div className="hidden sm:block">
                        <h1 className="text-[18px] font-black text-gray-800 leading-none">E-PRO</h1>
                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-[1px]">Commerce Admin</span>
                    </div>
                </div>
                
                {/* Menu Toggle Button */}
                <button 
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 transition-all border border-transparent hover:border-gray-100"
                >
                    <FontAwesomeIcon icon={faBars} className="text-lg" />
                </button>
            </div>

            <div className="flex items-center gap-2">
                <button 
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100 group"
                >
                    <FontAwesomeIcon icon={faGlobe} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                        {i18n.language === 'en' ? 'العربية' : 'English'}
                    </span>
                </button>
                <NotificationBell /> 
                <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>
                <Dropdown />
            </div>
        </div>
    );
}