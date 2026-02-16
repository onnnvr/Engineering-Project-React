import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ORDERS } from "../../../Api/Api"; 
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare, faPlus, faSearch, faEye, faReceipt, faUser, faCalendarAlt, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";
import { Axios } from "../../../Api/Axios";
import PaginatedItems from "../../../Components/Dashboard/Pagination";
import convertDate from "../../../Helpers/ConvertDate";

export default function Orders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
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
        const url = `${ORDERS}?pagination[page]=${page}&pagination[pageSize]=${limit}&populate=*${searchFilter}`;
        const res = await Axios.get(url);
        setOrders(res.data.data);
        setTotalItems(res.data.meta.pagination.total);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setLoading(false);
      }
    }
    const delayDebounceFn = setTimeout(() => fetchData(), search ? 500 : 0);
    return () => clearTimeout(delayDebounceFn);
  }, [limit, page, search]);

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await Axios.delete(`${ORDERS}/${id}`);
        setPage(1); 
        setSearch("");
      } catch (err) { console.log(err); }
    }
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">{t('Orders Management')}</h2>
          <p className="text-xs md:text-sm text-gray-500">{t('Track and manage customer purchases')}</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/order/add")}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} /> {t('Create New Order')}
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full flex-1">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder={t('Search by Order ID...')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
          />
        </div>
        <select
          value={limit}
          onChange={(e) => { setLimit(e.target.value); setPage(1); }}
          className="w-full md:w-auto px-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-gray-600 text-sm cursor-pointer outline-none"
        >
          <option value="5">{t('5 Rows')}</option>
          <option value="10">{t('10 Rows')}</option>
          <option value="50">{t('50 Rows')}</option>
        </select>
      </div>

      {/* Orders View */}
      <div className="bg-white md:rounded-3xl md:border border-gray-100 shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{t('Order Ref')}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{t('Customer')}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">{t('Total')}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">{t('Status')}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!loading && orders.map((order) => (
                <tr key={order.id} onClick={() => navigate(`/dashboard/orders/${order.documentId}`)} className="hover:bg-blue-50/30 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <FontAwesomeIcon icon={faReceipt} className="text-xs" />
                      </div>
                      <div className="text-sm font-bold text-gray-700">#{order.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-700">{order.customer?.name || t('Guest')}</div>
                    <div className="text-[10px] text-gray-400">{convertDate(order.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-black text-gray-800 text-sm">{order.totalAmount?.toFixed(2)} EGP</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${order.paid ? "bg-green-50 text-green-600 border-green-100" : "bg-orange-50 text-orange-600 border-orange-100"}`}>
                      {order.paid ? t('Paid') : t('Pending')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <Link to={`${order.documentId}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><FontAwesomeIcon icon={faPenToSquare} /></Link>
                      <button onClick={(e) => handleDelete(order.documentId, e)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><FontAwesomeIcon icon={faTrash} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile App-Style Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? <div className="p-10 text-center text-gray-400 italic">{t('Loading...')}</div> : 
            orders.map(order => (
              <div key={order.id} onClick={() => navigate(`/dashboard/orders/${order.documentId}`)} className="p-4 active:bg-gray-50 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><FontAwesomeIcon icon={faReceipt} /></div>
                    <div>
                      <h4 className="font-black text-gray-800">#{order.id}</h4>
                      <p className="text-[10px] text-gray-400">{convertDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border ${order.paid ? "bg-green-50 text-green-600 border-green-100" : "bg-orange-50 text-orange-600 border-orange-100"}`}>
                    {order.paid ? "Paid" : "Pending"}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                   <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faUser} className="text-gray-400 text-[10px]" />
                      <span className="text-xs font-bold text-gray-600">{order.customer?.name || t('Guest')}</span>
                   </div>
                   <span className="font-black text-blue-700 text-sm">{order.totalAmount?.toFixed(2)} <span className="text-[10px]">EGP</span></span>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Pagination */}
      {!loading && orders.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <PaginatedItems itemsPerPage={Number(limit)} setPage={setPage} numberOfItems={totalItems} currentPage={page} />
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('Total')} {totalItems} {t('Orders')}</p>
        </div>
      )}
    </div>
  );
}