import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PURCHASES } from "../../../Api/Api"; 
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare, faPlus, faSearch, faEye, faReceipt, faUser, faCalendarAlt, faStore } from "@fortawesome/free-solid-svg-icons";
import { Axios } from "../../../Api/Axios";
import PaginatedItems from "../../../Components/Dashboard/Pagination";
import convertDate from "../../../Helpers/ConvertDate";

export default function Purchases() {
  const { t } = useTranslation();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const searchFilter = search ? `&filters[id][$eq]=${search}` : "";
        const url = `${PURCHASES}?pagination[page]=${page}&pagination[pageSize]=${limit}&populate=*${searchFilter}`;
        const res = await Axios.get(url);
        setPurchases(res.data.data);
        setTotalItems(res.data.meta.pagination.total);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching purchases:", err);
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
    if (window.confirm("Are you sure you want to delete this purchase?")) {
      try {
        await Axios.delete(`${PURCHASES}/${id}`);
        setPage(1); 
        setSearch("");
      } catch (err) {
        console.log(err);
      }
    }
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen text-left">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">{t('Purchases')}</h2>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">{t('Inventory Inflow Tracking')}</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/purchase/add")}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} />
          {t('New Purchase')}
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder={t('Search by Purchase ID...')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/10 outline-none transition-all text-sm"
          />
        </div>
        <select
          value={limit}
          onChange={(e) => { setLimit(e.target.value); setPage(1); }}
          className="w-full md:w-48 px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 font-bold text-gray-600 text-sm cursor-pointer"
        >
          <option value="5">{t('5 Per Page')}</option>
          <option value="10">{t('10 Per Page')}</option>
          <option value="50">{t('50 Per Page')}</option>
        </select>
      </div>

      {/* Responsive Table/Cards Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('Reference')}</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('Trader')}</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{t('Total')}</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{t('Status')}</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right pr-10">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400 font-medium">{t('Loading...')}</td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400 font-medium">{t('No purchases found')}</td></tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase.id} onClick={() => navigate(`/dashboard/purchases/${purchase.documentId}`)} className="hover:bg-blue-50/30 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <FontAwesomeIcon icon={faReceipt} />
                        </div>
                        <div>
                          <span className="font-bold text-gray-700 block text-sm">#{purchase.documentId.slice(-6)}</span>
                          <span className="text-[10px] text-gray-400 font-bold">{convertDate(purchase.createdAt)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-600">
                      <FontAwesomeIcon icon={faStore} className="mr-2 text-blue-200" />
                      {purchase.trader?.name || t('N/A')}
                    </td>
                    <td className="px-6 py-4 text-center font-black text-blue-600 text-sm">
                      {purchase.totalAmount?.toFixed(2)} <span className="text-[10px]">EGP</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${purchase.paid ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                        {purchase.paid ? t('Paid') : t('Pending')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right pr-10">
                      <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <Link to={`${purchase.documentId}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><FontAwesomeIcon icon={faPenToSquare} /></Link>
                        <button onClick={(e) => handleDelete(purchase.documentId, e)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"><FontAwesomeIcon icon={faTrash} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {purchases.map((purchase) => (
            <div key={purchase.id} onClick={() => navigate(`/dashboard/purchases/${purchase.documentId}`)} className="p-4 active:bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><FontAwesomeIcon icon={faReceipt} /></div>
                  <div>
                    <h4 className="font-black text-gray-800 text-sm">#{purchase.documentId.slice(-6)}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{convertDate(purchase.createdAt)}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${purchase.paid ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                  {purchase.paid ? "Paid" : "Pending"}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                   <p className="text-[10px] font-black text-gray-300 uppercase mb-1">{t('Trader')}</p>
                   <p className="text-sm font-bold text-gray-600">{purchase.trader?.name || t('N/A')}</p>
                </div>
                <div className="text-right">
                   <p className="text-lg font-black text-blue-600">{purchase.totalAmount?.toFixed(2)} <span className="text-[10px]">EGP</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Container */}
      {!loading && purchases.length > 0 && (
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
           <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest order-2 md:order-1">
             {t('Total')}: {totalItems} {t('Purchases')}
           </p>
           <div className="order-1 md:order-2">
            <PaginatedItems itemsPerPage={Number(limit)} setPage={setPage} numberOfItems={totalItems} currentPage={page} />
           </div>
        </div>
      )}
    </div>
  );
}