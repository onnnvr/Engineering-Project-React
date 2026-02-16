import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRADERS } from "../../../Api/Api";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare, faPlus, faSearch, faUserCircle, faPhoneAlt } from "@fortawesome/free-solid-svg-icons";
import { Axios } from "../../../Api/Axios";
import PaginatedItems from "../../../Components/Dashboard/Pagination";
import convertDate from "../../../Helpers/ConvertDate";

export default function Traders() {
    const { t } = useTranslation();
    const [traders, setTraders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(5);
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const searchFilter = search ? `&filters[name][$contains]=${search}` : "";
                const url = `${TRADERS}?pagination[page]=${page}&pagination[pageSize]=${limit}&populate=*${searchFilter}`;
                const res = await Axios.get(url);
                setTraders(res.data.data);
                setTotalItems(res.data.meta.pagination.total);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching traders:", err);
                setLoading(false);
            }
        }
        const delayDebounceFn = setTimeout(() => {
            fetchData();
        }, search ? 500 : 0);
        return () => clearTimeout(delayDebounceFn);
    }, [limit, page, search]);

    async function handleDelete(id, e) {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this trader?")) {
            try {
                await Axios.delete(`${TRADERS}/${id}`);
                setPage(1);
                setSearch("");
            } catch (err) {
                console.log("Delete error:", err);
            }
        }
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen text-left">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold text-gray-800">{t("tradersDirectory")}</h2>
                    <p className="text-sm text-gray-500">{t("maintainManageTraders")}</p>
                </div>
                <button
                    onClick={() => navigate("/dashboard/trader/add")}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    {t("addNewTrader")}
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-3 md:p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full flex-1">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="search"
                        placeholder={t("searchByTraderName")}
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
                <select
                    value={limit}
                    onChange={(e) => { setLimit(e.target.value); setPage(1); }}
                    className="w-full md:w-auto px-4 py-2.5 bg-gray-50 border-transparent rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-gray-600 cursor-pointer"
                >
                    <option value="5">{t("fivePerPage")}</option>
                    <option value="10">{t("tenPerPage")}</option>
                    <option value="50">{t("fiftyPerPage")}</option>
                </select>
            </div>

            {/* Table / Cards Container */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{t("traderDetails")}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{t("contactNumber")}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">{t("type")}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">{t("joinedDate")}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right pr-10">{t("actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400">{t("loadingTraders")}</td></tr>
                            ) : traders.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400">{t("noTradersFound")}</td></tr>
                            ) : (
                                traders.map((trader) => (
                                    <tr key={trader.id} onClick={() => navigate(`/dashboard/traders/${trader.documentId}`)} className="hover:bg-blue-50/30 transition-colors cursor-pointer group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <FontAwesomeIcon icon={faUserCircle} className="text-lg" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors block leading-tight">{trader.name}</span>
                                                    <span className="text-[10px] text-gray-400 uppercase font-medium">ID: {trader.documentId.slice(0, 8)}...</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faPhoneAlt} className="text-[10px] text-gray-300" />
                                                <span className="font-medium">{trader.number}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${trader.type === 'Wholesale' ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-orange-50 text-orange-600 border-orange-100"}`}>
                                                {trader.type || "Retail"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-xs text-gray-500 font-medium">
                                            {convertDate(trader.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right pr-10">
                                            <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                                                <Link to={`${trader.documentId}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <FontAwesomeIcon icon={faPenToSquare} />
                                                </Link>
                                                <button onClick={(e) => handleDelete(trader.documentId, e)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-10 text-center text-gray-400">{t("loading")}</div>
                    ) : traders.map((trader) => (
                        <div key={trader.id} onClick={() => navigate(`/dashboard/traders/${trader.documentId}`)} className="p-4 active:bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                    <FontAwesomeIcon icon={faUserCircle} className="text-xl" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">{trader.name}</h4>
                                    <p className="text-xs text-gray-500">{t("contactNumber")}: {trader.number}</p>
                                </div>
                            </div>
                            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                <Link to={`${trader.documentId}`} className="w-9 h-9 flex items-center justify-center text-blue-500 bg-blue-50 rounded-xl">
                                    <FontAwesomeIcon icon={faPenToSquare} />
                                </Link>
                                <button onClick={(e) => handleDelete(trader.documentId, e)} className="w-9 h-9 flex items-center justify-center text-red-500 bg-red-50 rounded-xl">
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination */}
            {!loading && traders.length > 0 && (
                <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-medium order-2 md:order-1">
                        {t("showingTraders", { count: traders.length, total: totalItems })}
                    </p>
                    <div className="order-1 md:order-2 w-full md:w-auto overflow-x-auto flex justify-center">
                        <PaginatedItems itemsPerPage={Number(limit)} setPage={setPage} numberOfItems={totalItems} currentPage={page} />
                    </div>
                </div>
            )}
        </div>
    );
}