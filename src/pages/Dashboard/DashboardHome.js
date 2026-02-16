import { useEffect, useState } from "react";
import { USERS, PRODUCTS, ORDERS, PURCHASES } from "../../Api/Api";
import { Axios } from "../../Api/Axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faUsers, faBox, faCartShopping, faFileInvoiceDollar, 
    faExclamationTriangle, faPlus, faArrowRight 
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // 1. استيراد المكتبة

export default function DashboardHome() {
    const { t, i18n } = useTranslation(); // 2. تعريف الدالة t
    const [stats, setStats] = useState({
        usersCount: 0,
        productsCount: 0,
        ordersTotal: 0,
        purchasesCount: 0,
        outOfStock: 0,
        recentOrders: [],
        lowStockItems: []
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const isAr = i18n.language === "ar";

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const [users, products, orders, purchases] = await Promise.all([
                    Axios.get(USERS),
                    Axios.get(`${PRODUCTS}?populate=inventories`),
                    Axios.get(`${ORDERS}?pagination[pageSize]=5&sort=createdAt:desc&populate=*`),
                    Axios.get(PURCHASES)
                ]);

                const inventoryAlerts = products.data.data.filter(p => {
                    const stock = p.inventories?.reduce((acc, curr) => acc + (curr.quantity || 0), 0) || 0;
                    return stock <= 5;
                });

                setStats({
                    usersCount: users.data.length || 0,
                    productsCount: products.data.meta.pagination.total,
                    ordersTotal: orders.data.data.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0),
                    purchasesCount: purchases.data.meta.pagination.total,
                    outOfStock: inventoryAlerts.length,
                    recentOrders: orders.data.data,
                    lowStockItems: inventoryAlerts.slice(0, 5)
                });
                setLoading(false);
            } catch (err) {
                console.error("Home stats error:", err);
                setLoading(false);
            }
        }
        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className={`p-4 md:p-8 bg-gray-50/50 min-h-screen ${isAr ? 'text-right' : 'text-left'}`}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">{t("E-Commerce Overview")}</h2>
                    <p className="text-sm text-gray-500 font-medium">{t("Monitoring your business health and inventory.")}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate("/dashboard/product/add")} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm">
                        <FontAwesomeIcon icon={faPlus} className={`${isAr ? 'ml-2' : 'mr-2'} text-blue-600`} /> {t("New Product")}
                    </button>
                    <button onClick={() => navigate("/dashboard/order/add")} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                        <FontAwesomeIcon icon={faCartShopping} className={`${isAr ? 'ml-2' : 'mr-2'}`} /> {t("Create Order")}
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Revenue", val: `${stats.ordersTotal.toLocaleString()} ${isAr ? 'ج.م' : 'EGP'}`, icon: faFileInvoiceDollar, color: "blue" },
                    { label: "Active Users", val: stats.usersCount, icon: faUsers, color: "purple" },
                    { label: "Purchases", val: stats.purchasesCount, icon: faBox, color: "orange" },
                    { label: "Stock Alerts", val: stats.outOfStock, icon: faExclamationTriangle, color: "red" },
                ].map((item, i) => (
                    <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className={`w-12 h-12 bg-${item.color}-50 text-${item.color}-600 rounded-2xl flex items-center justify-center mb-4 text-lg`}>
                            <FontAwesomeIcon icon={item.icon} />
                        </div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{t(item.label)}</p>
                        <h3 className="text-xl font-black text-gray-800 mt-1">{item.val}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-black text-gray-800">{t("Recent Orders")}</h3>
                        <button onClick={() => navigate("/dashboard/orders")} className="text-blue-600 text-xs font-bold hover:underline">
                            {t("View All")} <FontAwesomeIcon icon={faArrowRight} className={`${isAr ? 'mr-1 rotate-180' : 'ml-1'}`} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className={`w-full ${isAr ? 'text-right' : 'text-left'}`}>
                            <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase">
                                <tr>
                                    <th className="px-6 py-3">{t("Order ID")}</th>
                                    <th className="px-6 py-3">{t("Customer")}</th>
                                    <th className="px-6 py-3">{t("Amount")}</th>
                                    <th className="px-6 py-3">{t("Status")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-gray-700">#{order.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{order.customer?.name || t("Guest")}</td>
                                        <td className="px-6 py-4 text-sm font-black text-blue-600">{order.totalAmount} {isAr ? 'ج.م' : 'EGP'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${order.paid ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                                {order.paid ? t("Paid") : t("Pending")}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-black text-gray-800 mb-6 flex items-center justify-between">
                        {t("Stock Alerts")}
                        <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full">{stats.outOfStock}</span>
                    </h3>
                    <div className="space-y-4">
                        {stats.lowStockItems.length > 0 ? stats.lowStockItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400">
                                    <FontAwesomeIcon icon={faBox} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-800 truncate">{item.title}</p>
                                    <p className="text-[10px] text-red-500 font-bold uppercase">
                                        {t("Only")} {item.inventories?.reduce((acc, curr) => acc + (curr.quantity || 0), 0)} {t("left")}
                                    </p>
                                </div>
                                <button onClick={() => navigate(`/dashboard/products/${item.documentId}`)} className="text-gray-400 hover:text-blue-600 transition-colors">
                                    <FontAwesomeIcon icon={faArrowRight} className={`${isAr ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <p className="text-xs text-gray-400 italic">{t("All products are in good stock! ✅")}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}