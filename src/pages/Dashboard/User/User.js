import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Axios } from "../../../Api/Axios";
import { USERS } from "../../../Api/Api";
import { useNavigate, useParams } from "react-router-dom";
import LoadingScreen from "../../../Components/Loading/Loading";
import convertDate from "../../../Helpers/ConvertDate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faUserCircle, faReceipt } from "@fortawesome/free-solid-svg-icons";

export default function User() {
    const { t } = useTranslation();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        const fetchUser = Axios.get(`${USERS}/${id}?populate=role`);
        const fetchOrders = Axios.get(`/orders?filters[user][id][$eq]=${id}`);

        Promise.all([fetchUser, fetchOrders])
            .then(([userRes, ordersRes]) => {
                setUsername(userRes.data.username);
                setEmail(userRes.data.email);
                setRole(userRes.data.role?.id || "");
                setOrders(ordersRes.data.data || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                setLoading(false);
            });
    }, [id]);

    const isDisabled = username.length < 1 || email.length < 5 || role === "";

    async function submit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            await Axios.put(`${USERS}/${id}`, { username, email, role });
            navigate("/dashboard/users");
        } catch (err) {
            setLoading(false);
            console.log(err);
        }
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen pb-20">
            {loading && <LoadingScreen />}

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8 bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600 md:hidden">
                        <FontAwesomeIcon icon={faUserCircle} size="lg" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800">{t("userProfile")}</h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">{t("detailsOrderHistory")}</p>
                    </div>
                </div>
                <div className="flex gap-2 md:gap-3">
                    <button onClick={() => navigate("/dashboard/users")} className="flex-1 md:flex-none px-4 md:px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all border border-gray-100 md:border-transparent">
                        {t("back")}
                    </button>
                    <button 
                        form="update-form" 
                        type="submit" 
                        disabled={isDisabled}
                        className={`flex-[2] md:flex-none px-6 md:px-8 py-2.5 text-sm font-bold rounded-xl text-white shadow-lg transition-all ${isDisabled ? "bg-blue-200 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"}`}
                    >
                        {t("saveChanges")}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
                {/* ACCOUNT INFO FORM */}
                <form id="update-form" onSubmit={submit} className="grid grid-cols-12 gap-6 md:gap-8">
                    <div className="col-span-12 lg:col-span-8">
                        <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
                            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-5 md:mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-5 md:h-6 bg-blue-600 rounded-full"></span>
                                {t("accountDetails")}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                <div>
                                    <label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-2 ml-1">{t("username")}</label>
                                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl md:rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm md:text-base" />
                                </div>
                                <div>
                                    <label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-2 ml-1">{t("emailAddress")}</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl md:rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm md:text-base" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4">
                        <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm h-full">
                            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-5 md:mb-6">{t("roleSelection")}</h3>
                            <select value={role} onChange={(e) => setRole(Number(e.target.value))}
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl md:rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-blue-600 text-sm md:text-base cursor-pointer">
                                <option value="" disabled>{t("selectRole")}</option>
                                <option value="3">{t("customer")}</option>
                                <option value="4">{t("administrator")}</option>
                                <option value="5">{t("employee")}</option>
                            </select>
                        </div>
                    </div>
                </form>

                {/* ORDERS SECTION */}
                <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faHistory} className="text-gray-400 hidden md:block" />
                            <h3 className="text-base md:text-lg font-bold text-gray-800">{t("orderHistory")}</h3>
                        </div>
                        <span className="px-3 py-1 md:px-4 md:py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                            {t("ordersCount", { count: orders.length })}
                        </span>
                    </div>

                    {orders.length > 0 ? (
                        <>
                            {/* Desktop Table: Hidden on Mobile */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase">
                                        <tr>
                                            <th className="px-8 py-4">{t("orderId")}</th>
                                            <th className="px-8 py-4">{t("date")}</th>
                                            <th className="px-8 py-4 text-right">{t("amount")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {orders.map((order, index) => (
                                            <tr key={index} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                                                <td className="px-8 py-4 font-bold text-gray-700">#{order.id}</td>
                                                <td className="px-8 py-4 text-sm text-gray-500">
                                                    {convertDate(order.attributes?.createdAt || order.createdAt)}
                                                </td>
                                                <td className="px-8 py-4 text-right font-bold text-blue-600">
                                                    ${order.attributes?.totalAmount || order.totalAmount || '0.00'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards: Hidden on Desktop */}
                            <div className="md:hidden p-4 space-y-3">
                                {orders.map((order, index) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100 active:bg-blue-50 transition-colors">
                                        <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-gray-400">{t("orderId")}</span>
                                            <span className="text-sm font-bold text-gray-700">#{order.id}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-gray-400">{t("date")}</span>
                                            <span className="text-xs text-gray-500">
                                                {convertDate(order.attributes?.createdAt || order.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                            <span className="text-xs font-bold text-gray-400 uppercase">{t("total")}</span>
                                            <span className="text-sm font-black text-blue-600">
                                                ${order.attributes?.totalAmount || order.totalAmount || '0.00'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="p-12 md:p-16 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <FontAwesomeIcon icon={faReceipt} size="2x" />
                            </div>
                            <p className="text-gray-400 text-sm">{t("noOrdersForUser")}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}