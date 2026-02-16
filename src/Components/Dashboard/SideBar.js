import { 
    faHome, faUsers, faBoxOpen, faLayerGroup, 
    faTruckLoading, faFileInvoiceDollar, 
    faCirclePlus, faUserShield, faHandHoldingDollar 
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu } from "../../Context/MenuContext";
import { useContext, useEffect, useState } from "react";
import { WindowSize } from "../../Context/WindowContext";
import { Axios } from "../../Api/Axios";
import { MYUSER } from "../../Api/Api";
import { useTranslation } from "react-i18next"; // استدعاء الترجمة

export default function SideBar() {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === "ar";
    
    const menu = useContext(Menu);
    const isOpen = menu.isOpen;
    const windowSize = useContext(WindowSize);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        Axios.get(`${MYUSER}?populate=role`)
            .then((data) => setUser(data.data))
            .catch(() => navigate("/login", { replace: true }));
    }, [navigate]);

    const userRole = user ? Number(user.role.id) : 0;

    const SidebarLink = ({ to, icon, title, badge }) => (
        <NavLink 
            to={to} 
            end={to === "/dashboard"}
            className={({ isActive }) => 
                `flex items-center justify-between py-3 px-4 mx-3 my-1 rounded-xl transition-all duration-200 group ${
                    isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                    : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                }`
            }
        >
            <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={icon} className={`text-[17px] ${isOpen ? '' : 'mx-auto w-full text-center'}`} />
                {isOpen && <span className="font-bold text-[13.5px] whitespace-nowrap">{t(title)}</span>}
            </div>
            {isOpen && badge && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold">{badge}</span>}
        </NavLink>
    );

    // حساب الـ Position بناءً على اتجاه اللغة
    const sidebarStyles = {
        width: isOpen ? "260px" : "85px", 
        position: windowSize.windowSize < "768" ? "fixed" : "sticky",
        height: "calc(100vh - 70px)",
        top: "70px",
    };

    // تبديل الاتجاه في حالة الموبايل
    if (windowSize.windowSize < '768') {
        if (isAr) {
            sidebarStyles.right = isOpen ? 0 : "-100%";
        } else {
            sidebarStyles.left = isOpen ? 0 : "-100%";
        }
    } else {
        // في الـ Desktop الاتجاه يتبع dir الصفحة تلقائياً ولكن نضمن الـ borders
        isAr ? sidebarStyles.right = 0 : sidebarStyles.left = 0;
    }

    return (
        <>
            <div 
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[40]" 
                style={{ display: windowSize.windowSize < "768" && isOpen ? "block" : "none" }}
                onClick={() => menu.setIsOpen(false)}
            ></div>

            <div 
                className={`bg-white z-[41] shadow-2xl transition-all duration-300 flex flex-col ${isAr ? 'border-l' : 'border-r'} border-gray-50`} 
                style={sidebarStyles}
            >
                <div className="flex flex-col py-6 overflow-y-auto no-scrollbar h-full">
                    
                    <div className={`px-7 mb-2 text-[10px] font-black text-gray-300 uppercase tracking-[2px] ${!isOpen && 'invisible'}`}>{t("Main")}</div>
                    <SidebarLink to="/dashboard" icon={faHome} title="Overview" />

                    <div className={`px-7 mt-6 mb-2 text-[10px] font-black text-gray-300 uppercase tracking-[2px] ${!isOpen && 'invisible'}`}>{t("Inventory")}</div>
                    <SidebarLink to="products" icon={faBoxOpen} title="All Products" />
                    <SidebarLink to="categories" icon={faLayerGroup} title="Categories" />

                    <div className={`px-7 mt-6 mb-2 text-[10px] font-black text-gray-300 uppercase tracking-[2px] ${!isOpen && 'invisible'}`}>{t("Finance")}</div>
                    <SidebarLink to="orders" icon={faFileInvoiceDollar} title="Sales Orders" />
                    <SidebarLink to="purchases" icon={faTruckLoading} title="Purchases" />
                    <SidebarLink to="customers" icon={faUsers} title="Customers" />
                    <SidebarLink to="traders" icon={faHandHoldingDollar} title="Traders" />

                    {(userRole >= 1 && userRole <= 5) && (
                        <>
                            <div className={`px-7 mt-6 mb-2 text-[10px] font-black text-gray-300 uppercase tracking-[2px] ${!isOpen && 'invisible'}`}>{t("System")}</div>
                            <SidebarLink to="users" icon={faUserShield} title="Staff Members" />
                        </>
                    )}

                    <div className="mt-auto px-4 py-4">
                        <div className={`mb-4 h-[1px] bg-gray-50 ${!isOpen && 'hidden'}`}></div>
                        <SidebarLink to="product/add" icon={faCirclePlus} title="Quick Add" />
                    </div>
                </div>
            </div>
        </>
    );
}