import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CATEGORIES, CATEGORY, URL } from "../../../Api/Api";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare, faPlus, faSearch, faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { Axios } from "../../../Api/Axios";
import PaginatedItems from "../../../Components/Dashboard/Pagination";
import convertDate from "../../../Helpers/ConvertDate";

export default function Categories() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
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
        const searchFilter = search ? `&filters[title][$contains]=${search}` : "";
        const url = `${CATEGORIES}?pagination[page]=${page}&pagination[pageSize]=${limit}${searchFilter}`;
        const res = await Axios.get(url, {
          params: { populate: { products: true, image: true } }
        });
        setCategories(res.data.data);
        setTotalItems(res.data.meta.pagination.total);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    const delayDebounceFn = setTimeout(() => fetchData(), search ? 500 : 0);
    return () => clearTimeout(delayDebounceFn);
  }, [limit, page, search]);

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (window.confirm("Are you sure?")) {
      try {
        await Axios.delete(`${CATEGORIES}/${id}`);
        setPage(1);
        setSearch("");
      } catch (err) { console.log(err); }
    }
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">{t('Categories')}</h2>
          <p className="text-xs md:text-sm text-gray-500">{t('Manage your product hierarchy')}</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/category/add")}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
        >
          <FontAwesomeIcon icon={faPlus} /> {t('Add Category')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full flex-1">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder={t('Search categories...')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
          />
        </div>
        <select
          value={limit}
          onChange={(e) => { setLimit(e.target.value); setPage(1); }}
          className="w-full md:w-auto px-4 py-3 bg-gray-50 border-none rounded-xl outline-none font-bold text-gray-600 text-sm cursor-pointer"
        >
          <option value="5">{t('5 Per Page')}</option>
          <option value="10">{t('10 Per Page')}</option>
        </select>
      </div>

      {/* Table & Mobile Cards */}
      <div className="bg-white md:rounded-3xl md:border border-gray-100 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{t('Category')}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">{t('Products')}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{t('Date')}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!loading && categories.map((cat) => (
                <tr key={cat.id} onClick={() => navigate(`${cat.documentId}`)} className="hover:bg-blue-50/30 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center border group-hover:border-blue-200">
                        {cat.image ? <img src={`${cat.image.url}`} className="w-full h-full object-cover" /> : <FontAwesomeIcon icon={faLayerGroup} className="text-gray-400" />}
                      </div>
                      <span className="font-bold text-gray-700">{cat.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">{cat.products?.length || 0} {t('Items')}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">{convertDate(cat.createdAt)}</td>
                  <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <Link to={`${cat.documentId}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><FontAwesomeIcon icon={faPenToSquare} /></Link>
                      <button onClick={(e) => handleDelete(cat.documentId, e)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><FontAwesomeIcon icon={faTrash} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? <div className="p-10 text-center text-gray-400 italic">{t('Loading...')}</div> : 
            categories.map(cat => (
              <div key={cat.id} onClick={() => navigate(`${cat.documentId}`)} className="p-4 flex items-center justify-between active:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 border overflow-hidden">
                    {cat.image ? <img src={`${cat.image.url}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><FontAwesomeIcon icon={faLayerGroup} /></div>}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{cat.title}</h4>
                    <p className="text-[10px] text-gray-400">{cat.products?.length || 0} {t('Products')} • {convertDate(cat.createdAt)}</p>
                  </div>
                </div>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                   <button onClick={() => handleDelete(cat.documentId, {stopPropagation:()=>{}})} className="w-9 h-9 flex items-center justify-center text-red-400 bg-red-50 rounded-xl"><FontAwesomeIcon icon={faTrash} className="text-xs" /></button>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {!loading && categories.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <PaginatedItems itemsPerPage={Number(limit)} setPage={setPage} numberOfItems={totalItems} currentPage={page}/>
        </div>
      )}
    </div>
  );
}