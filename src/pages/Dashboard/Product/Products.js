import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PRODUCTS, URL } from "../../../Api/Api";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare, faPlus, faSearch, faBoxOpen, faLayerGroup, faWarehouse } from "@fortawesome/free-solid-svg-icons";
import { Axios } from "../../../Api/Axios";
import PaginatedItems from "../../../Components/Dashboard/Pagination";
import convertDate from "../../../Helpers/ConvertDate";

export default function Products() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
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
        const url = `${PRODUCTS}?pagination[page]=${page}&pagination[pageSize]=${limit}&populate=categories&populate=images&populate=inventories${searchFilter}`;
        const res = await Axios.get(url);
        setProducts(res.data.data);
        setTotalItems(res.data.meta.pagination.total);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
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
    if (window.confirm(t("Are you sure you want to delete this product?"))) {
      try {
        await Axios.delete(`${PRODUCTS}/${id}`);
        setPage(1); 
        setSearch("");
      } catch (err) {
        console.log(err);
      }
    }
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen text-left pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">{t("Products Inventory")}</h2>
          <p className="text-xs md:text-sm text-gray-500 font-medium tracking-tight">{t("Manage your catalog and stock levels")}</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/product/add")}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} />
          {t("Add New Product")}
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 md:p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full flex-1">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder={t("Search products...")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
          />
        </div>
        <select
          value={limit}
          onChange={(e) => { setLimit(e.target.value); setPage(1); }}
          className="w-full sm:w-auto px-4 py-3 bg-gray-50 border-transparent rounded-xl outline-none font-bold text-gray-600 cursor-pointer text-sm"
        >
          <option value="5">{t("5 Per Page")}</option>
          <option value="10">{t("10 Per Page")}</option>
          <option value="50">{t("50 Per Page")}</option>
        </select>
      </div>

      {/* Main Container for Table/Cards */}
      <div className="bg-white md:rounded-3xl rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Desktop Table View (Hidden on Mobile) */}
        <table className="w-full text-left border-collapse hidden md:table">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{t("Product Info")}</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">{t("Categories")}</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">{t("Price")}</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">{t("Total Stock")}</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right pr-10">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400">{t("Loading inventory...")}</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400">{t("No products found")}</td></tr>
            ) : (
              products.map((product) => {
                const totalStock = product.inventories?.reduce((acc, curr) => acc + (curr.quantity || 0), 0) || 0;
                return (
                  <tr key={product.id} onClick={() => navigate(`/dashboard/products/${product.documentId}`)} className="hover:bg-blue-50/30 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                          {product.images?.[0] ? (
                             <img src={`${URL}${product.images[0].url}`} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg"><FontAwesomeIcon icon={faBoxOpen} /></div>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors block leading-tight">{product.title}</span>
                          <span className="text-[10px] text-gray-400 uppercase font-medium">{convertDate(product.createdAt)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-wrap justify-center gap-1 max-w-[200px] mx-auto">
                        {product.categories?.map((cat, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-bold border border-blue-100">
                            {t(cat.title)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-800 text-sm">{product.price} {t('egp')}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-black ${totalStock > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {totalStock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right pr-10">
                      <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <Link to={`${product.documentId}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><FontAwesomeIcon icon={faPenToSquare} /></Link>
                        <button onClick={(e) => handleDelete(product.id, e)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><FontAwesomeIcon icon={faTrash} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Mobile View (Cards) - (Visible only on Mobile) */}
        <div className="md:hidden divide-y divide-gray-100">
          {!loading && products.map((product) => {
             const totalStock = product.inventories?.reduce((acc, curr) => acc + (curr.quantity || 0), 0) || 0;
             return (
               <div key={product.id} onClick={() => navigate(`/dashboard/products/${product.documentId}`)} className="p-4 active:bg-gray-50 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                    {product.images?.[0] ? <img src={`${URL}${product.images[0].url}`} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><FontAwesomeIcon icon={faBoxOpen} size="lg"/></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate text-sm mb-1">{product.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-blue-600 font-black text-sm">${product.price}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${totalStock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {totalStock > 0 ? t("Stock:") + ` ${totalStock}` : t("Out")}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                    <Link to={`${product.documentId}`} className="p-2.5 text-blue-500 bg-blue-50 rounded-xl text-center"><FontAwesomeIcon icon={faPenToSquare}/></Link>
                    <button onClick={(e) => handleDelete(product.id, e)} className="p-2.5 text-red-400 bg-red-50 rounded-xl"><FontAwesomeIcon icon={faTrash}/></button>
                  </div>
               </div>
             )
          })}
        </div>
      </div>

      {/* Pagination Container */}
      {!loading && products.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
           <div className="w-full flex justify-center overflow-hidden">
            <PaginatedItems itemsPerPage={Number(limit)} setPage={setPage} numberOfItems={totalItems} currentPage={page}/>
           </div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic text-center">
              {t("Total")} {totalItems} {t("Products found")}
            </p>
        </div>
      )}
    </div>
  );
}