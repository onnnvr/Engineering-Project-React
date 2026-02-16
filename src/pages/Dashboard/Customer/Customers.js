import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CUSTOMERS } from "../../../Api/Api";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare, faPlus, faSearch, faUserCircle, faPhoneAlt } from "@fortawesome/free-solid-svg-icons";
import { Axios } from "../../../Api/Axios";
import PaginatedItems from "../../../Components/Dashboard/Pagination";
import convertDate from "../../../Helpers/ConvertDate";

export default function Customers() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState([]);
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
        const url = `${CUSTOMERS}?pagination[page]=${page}&pagination[pageSize]=${limit}&populate=*${searchFilter}`;
        const res = await Axios.get(url);
        setCustomers(res.data.data);
        setTotalItems(res.data.meta.pagination.total);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching customers:", err);
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
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await Axios.delete(`${CUSTOMERS}/${id}`);
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">{t('Customer Directory')}</h2>
          <p className="text-xs md:text-sm text-gray-500">{t('Maintain and manage your client relationships')}</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/customer/add")}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} />
          {t('Add New Customer')}
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 md:p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full flex-1">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder={t('Search by customer name...')}
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
          <option value="5">{t('5 Per Page')}</option>
          <option value="10">{t('10 Per Page')}</option>
          <option value="50">{t('50 Per Page')}</option>
        </select>
      </div>

      {/* Desktop Table - Hidden on Mobile */}
      <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{t('Customer Details')}</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{t('Contact')}</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">{t('Type')}</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">{t('Joined')}</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right pr-10">{t('Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400">{t('Loading customers...')}</td></tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} onClick={() => navigate(`/dashboard/customers/${customer.documentId}`)} className="hover:bg-blue-50/30 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <FontAwesomeIcon icon={faUserCircle} className="text-lg" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-700 group-hover:text-blue-600 block leading-tight">{customer.name}</span>
                        <span className="text-[10px] text-gray-400 uppercase">{t('ID')}: {customer.documentId.slice(0,8)}...</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">{customer.number}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${customer.type === 'Wholesale' ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-orange-50 text-orange-600 border-orange-100"}`}>
                      {customer.type ? t(customer.type) : t('Retail')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-xs text-gray-500">{convertDate(customer.createdAt)}</td>
                  <td className="px-6 py-4 text-right pr-10">
                    <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <Link to={`${customer.documentId}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><FontAwesomeIcon icon={faPenToSquare} /></Link>
                      <button onClick={(e) => handleDelete(customer.documentId, e)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><FontAwesomeIcon icon={faTrash} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards - Hidden on Desktop */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {loading ? (
            <div className="text-center py-10 text-gray-400">{t('Loading...')}</div>
        ) : (
            customers.map((customer) => (
                <div key={customer.id} onClick={() => navigate(`/dashboard/customers/${customer.documentId}`)} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-transform">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <FontAwesomeIcon icon={faUserCircle} className="text-xl" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">{customer.name}</h4>
                                <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{t('ID')}: {customer.documentId.slice(0,12)}</p>
                            </div>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase border ${customer.type === 'Wholesale' ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-orange-50 text-orange-600 border-orange-100"}`}>
                          {customer.type ? t(customer.type) : t('Retail')}
                        </span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2 text-gray-600">
                            <FontAwesomeIcon icon={faPhoneAlt} className="text-xs text-gray-300" />
                            <span className="text-sm font-bold">{customer.number}</span>
                        </div>
                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                            <Link to={`${customer.documentId}`} className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg"><FontAwesomeIcon icon={faPenToSquare} size="sm" /></Link>
                            <button onClick={(e) => handleDelete(customer.documentId, e)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-400 rounded-lg"><FontAwesomeIcon icon={faTrash} size="sm" /></button>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>

      {/* Pagination */}
      {!loading && customers.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <PaginatedItems itemsPerPage={Number(limit)} setPage={setPage} numberOfItems={totalItems} currentPage={page} />
           <p className="text-xs text-gray-400 font-medium">
             {t('Showing')} <span className="text-gray-700 font-bold">{customers.length}</span> {t('clients from total')} <span className="text-gray-700 font-bold">{totalItems}</span>
           </p>
        </div>
      )}
    </div>
  );
}