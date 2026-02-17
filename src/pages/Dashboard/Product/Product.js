import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next";
import { Axios } from "../../../Api/Axios";
import { CATEGORIES, PRODUCTS } from "../../../Api/Api";
import LoadingScreen from "../../../Components/Loading/Loading";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faChevronLeft, faCloudUploadAlt, faWarehouse, faReceipt, faPlus, faMinus, faBarcode, faTags, faGlobe, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function Product() {
    const { t } = useTranslation();
    const [title, setTitle] = useState("")
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [barcode, setBarcode] = useState("")
    const [brand, setBrand] = useState("")
    const [showOnWebsite, setShowOnWebsite] = useState(false)
    
    const [imagesFromServer, setImagesFromServer] = useState([])
    const [loading, setLoading] = useState(false)
    const { id } = useParams() 
    const [numericId, setNumericId] = useState(); 
    
    const [inventories, setInventories] = useState([]);
    const [allWarehouses, setAllWarehouses] = useState([]);
    const [orders, setOrders] = useState([]);

    const [newImagesFiles, setNewImagesFiles] = useState([]); 
    const uploadImages = useRef(null);
    const progress = useRef([]);
    const nav = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [catsRes, warehousesRes, productRes] = await Promise.all([
                    Axios.get(`${CATEGORIES}`),
                    Axios.get('/warehouses'), 
                    Axios.get(`${PRODUCTS}/${id}`, {
                        params: {
                            populate: {
                                categories: true,
                                images: true,
                                inventories: { populate: ['warehouse'] },
                                order_items: { populate: ['order'] }
                            }
                        }
                    })
                ]);

                setCategories(catsRes.data.data);
                setAllWarehouses(warehousesRes.data.data);
                
                const d = productRes.data.data;
                setNumericId(d.id); 
                setTitle(d.title || "");
                if (d.categories) {
                    setSelectedCategories(d.categories.map(cat => cat.id));
                }
                setDescription(d.description || "");
                setPrice(d.price || "");
                setBarcode(d.barcode || "");
                setBrand(d.brand || "");
                setShowOnWebsite(d.showOnWebsite || false);
                setImagesFromServer(d.images || []);
                setInventories(d.inventories || []);
                setOrders(d.order_items || []);
            } catch (err) { console.log(err); }
            setLoading(false);
        };
        fetchData();
    }, [id]);

    const handleCategoryChange = (e) => {
        const catId = parseInt(e.target.value);
        if (!selectedCategories.includes(catId)) {
            setSelectedCategories([...selectedCategories, catId]);
        }
    };

    const removeCategory = (catId) => {
        setSelectedCategories(prev => prev.filter(id => id !== catId));
    };

    const getCategoryName = (catId) => {
        return categories.find(c => c.id === catId)?.title || "";
    };

    async function handleImagesUpload(e) {
        const files = Array.from(e.target.files);
        setNewImagesFiles(prev => [...prev, ...files]); 

        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append("files", files[i]);
            formData.append("ref", "api::product.product");
            formData.append("refId", numericId); 
            formData.append("field", "images");

            try {
                const res = await Axios.post(`/upload`, formData, {
                    onUploadProgress: (p) => {
                        let percent = Math.round((p.loaded / p.total) * 100);
                        if (progress.current[i]) progress.current[i].style.width = `${percent}%`;
                    }
                });
                setImagesFromServer(prev => [...prev, res.data[0]]);
            } catch (err) { console.log(err); }
        }
        setNewImagesFiles([]); 
    }

    async function updateStock(warehouseId, currentInventory, newQuantity) {
        const qty = parseInt(newQuantity);
        if (isNaN(qty) || qty < 0) return; // منع القيم السالبة أو غير الرقمية

        setLoading(true);
        try {
            if (currentInventory) {
                // تحديث مخزن موجود أصلاً
                await Axios.put(`/inventories/${currentInventory.documentId}`, { 
                    data: { quantity: qty } 
                });
            } else {
                // إنشاء سجل مخزن جديد لهذا المستودع
                await Axios.post(`/inventories`, { 
                    data: { 
                        quantity: qty, 
                        product: { connect: [id] }, 
                        warehouse: warehouseId 
                    } 
                });
            }
            // تحديث البيانات في الصفحة بعد النجاح
            const updated = await Axios.get(`${PRODUCTS}/${id}?populate[inventories][populate]=warehouse`);
            setInventories(updated.data.data.inventories);
            alert(t('Stock Updated Successfully')); // اختياري
        } catch (err) { 
            console.log(err); 
        }
        setLoading(false);
    }

    async function submit(e) {
        e.preventDefault();
        if (selectedCategories.length === 0) {
            alert("Please select at least one category");
            return;
        }
        setLoading(true);
        try {
            await Axios.put(`${PRODUCTS}/${id}`, { 
                data: { 
                    categories: selectedCategories,
                    title, description, price, barcode, brand, showOnWebsite,
                    images: imagesFromServer.map(img => img.id) 
                }
            });
            nav("/dashboard/products");
        } catch (err) {
            setLoading(false);
            console.log(err);
        }
    }

    const deleteImage = async (imgId) => {
        try {
            await Axios.delete(`/upload/files/${imgId}`);
            setImagesFromServer(prev => prev.filter(img => img.id !== imgId));
        } catch (err) { console.log("Error deleting image:", err); }
    }

    return (
        <div className="bg-gray-50/50 min-h-screen pb-24 text-left font-sans">
            {loading && <LoadingScreen />}
            
            {/* Responsive Sticky Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                <div className="flex items-center gap-3 self-start sm:self-center">
                    <button onClick={() => nav(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><FontAwesomeIcon icon={faChevronLeft} /></button>
                    <div>
                        <h2 className="text-lg md:text-xl font-black text-gray-800 tracking-tight">{t('Edit Product')}</h2>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">{brand || t('No Brand')} • #{numericId}</p>
                    </div>
                </div>
                <button form="update-form" type="submit" className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all text-sm">
                    {t('Save Changes')}
                </button>
            </div>

            <form id="update-form" onSubmit={submit} className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                
                {/* Left Column (Main Info & Tables) */}
                <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
                    
                    {/* General Info */}
                    <div className="bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-5">
                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t('General Information')}</label>
                        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('Product Title')} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-base font-bold" />
                        <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder={t('Product Description')} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm" />
                    </div>

                    {/* Inventory & Sales (Stacks on Mobile, Side-by-side on Desktop) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Inventory Control */}
                        <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-blue-600 font-black text-sm uppercase tracking-tight">
                                <FontAwesomeIcon icon={faWarehouse} />
                                <h3>{t('Stock Control')}</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-400 font-black uppercase text-[9px] tracking-widest">
                                        <tr>
                                            <th className="px-3 py-3 text-left">{t('Warehouse')}</th>
                                            <th className="px-3 py-3 text-center">{t('Qty')}</th>
                                            <th className="px-3 py-3 text-right">{t('Action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {allWarehouses.map((wh) => {
                                            const inv = inventories.find(i => i.warehouse?.id === wh.id);
                                            const qty = inv ? inv.quantity : 0;
                                            
                                            return (
                                                <tr key={wh.id}>
                                                    <td className="px-3 py-4 font-bold text-gray-700 text-xs">{wh.title}</td>
                                                    <td className="px-3 py-4 text-center">
                                                        <input 
                                                            type="number" 
                                                            defaultValue={qty} 
                                                            min="0"
                                                            id={`qty-${wh.id}`} // معرف فريد لكل مستودع
                                                            className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-center font-black text-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-4">
                                                        <div className="flex justify-end">
                                                            <button 
                                                                type="button" 
                                                                onClick={() => {
                                                                    const val = document.getElementById(`qty-${wh.id}`).value;
                                                                    updateStock(wh.id, inv, val);
                                                                }} 
                                                                className="px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all text-xs font-bold"
                                                            >
                                                                {t('Update')}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Sales Log */}
                        <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-green-600 font-black text-sm uppercase tracking-tight">
                                <FontAwesomeIcon icon={faReceipt} />
                                <h3>{t('Sales Log')}</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-400 font-black uppercase text-[9px] tracking-widest">
                                        <tr>
                                            <th className="px-3 py-3 text-left">{t('Order')}</th>
                                            <th className="px-3 py-3 text-center">{t('Qty')}</th>
                                            <th className="px-3 py-3 text-right">{t('Price')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {orders.map((item, i) => (
                                            <tr key={i} className="group">
                                                <td className="px-3 py-4">
                                                    <Link className="font-bold text-blue-600 hover:underline flex items-center gap-1" to={`/dashboard/orders/${item.order?.documentId}`}>
                                                        #{item.order?.id}
                                                        {(item.order?.orderStatus === "Returned" || item.order?.orderStatus === "refunded") && (
                                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                                                        )}
                                                    </Link>
                                                </td>
                                                <td className="px-3 py-4 text-center font-medium text-gray-600">{item.quantity}</td>
                                                <td className="px-3 py-4 text-right font-black text-green-600">${item.price || price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Gallery */}
                    <div className="bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6 block">{t('Product Gallery')}</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {imagesFromServer.map((img, index) => (
                                <div key={index} className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                                    <img src={`http://localhost:1337${img.url}`} className="w-full h-full object-cover" alt="" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button type="button" onClick={() => deleteImage(img.id)} className="bg-red-500 text-white p-2.5 rounded-xl hover:scale-110 transition-transform"><FontAwesomeIcon icon={faTrash} /></button>
                                    </div>
                                </div>
                            ))}
                            {newImagesFiles.map((img, i) => (
                                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-blue-100 bg-blue-50/20 flex items-center justify-center">
                                     <div className="w-full px-2">
                                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div ref={el => progress.current[i] = el} className="h-full bg-blue-600 w-0 transition-all" />
                                        </div>
                                     </div>
                                </div>
                            ))}
                            <div onClick={() => uploadImages.current.click()} className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                                <FontAwesomeIcon icon={faCloudUploadAlt} className="text-xl mb-1" />
                                <span className="text-[9px] font-black uppercase tracking-widest">{t('Add Image')}</span>
                                <input ref={uploadImages} hidden onChange={handleImagesUpload} type="file" multiple />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Sidebar Settings) */}
                <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
                    {/* Categories Box (Order 1 on Mobile) */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('Categories')}</label>
                        <select value="" onChange={handleCategoryChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-gray-800 focus:ring-2 focus:ring-blue-500/20">
                            <option value="" disabled>{t('Add Category...')}</option>
                            {categories.map((c, i) => <option value={c.id} key={i}>{c.title}</option>)}
                        </select>
                        <div className="flex flex-wrap gap-2">
                            {selectedCategories.map(catId => (
                                <div key={catId} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 border border-blue-100">
                                    {getCategoryName(catId)}
                                    <button type="button" onClick={() => removeCategory(catId)} className="hover:text-red-500 transition-colors">
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pricing & Metadata */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">{t('Brand')}</label>
                            <div className="relative">
                                <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder={t('Nike')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold" />
                                <FontAwesomeIcon icon={faTags} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">{t('Price ($)')}</label>
                            <input required value={price} onChange={(e) => setPrice(e.target.value)} type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-black text-blue-600 text-2xl" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">{t('Barcode')}</label>
                            <div className="relative">
                                <input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder={t('Scan...')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm" />
                                <FontAwesomeIcon icon={faBarcode} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                            </div>
                        </div>
                    </div>

                    {/* Visibility & Total */}
                    <div className="space-y-4">
                        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${showOnWebsite ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <FontAwesomeIcon icon={faGlobe} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-700">{t('Web Visibility')}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-black">{showOnWebsite ? t('Public') : t('Hidden')}</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={showOnWebsite} onChange={(e) => setShowOnWebsite(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all transition-colors"></div>
                            </label>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                            <FontAwesomeIcon icon={faWarehouse} className="absolute -right-4 -bottom-4 text-7xl opacity-10 rotate-12" />
                            <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest">{t('Total Inventory')}</p>
                            <h4 className="text-4xl font-black mt-1">
                                {inventories.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0)}
                            </h4>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}