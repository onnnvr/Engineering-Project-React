import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next";
import { Axios } from "../../../Api/Axios";
import { CATEGORIES, PRODUCTS, URL } from "../../../Api/Api";
import { useNavigate, useParams } from "react-router-dom";
import LoadingScreen from "../../../Components/Loading/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faCloudUploadAlt, faSearch, faCheckCircle, faBox, faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function Category() {
    const { t } = useTranslation();
    const [title, setTitle] = useState("")
    const [preview, setPreview] = useState(null)
    const [imageId, setImageId] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [selectedProducts, setSelectedProducts] = useState([]); 
    const [allProducts, setAllProducts] = useState([]); 
    const [searchQuery, setSearchQuery] = useState(""); 
    const [loading, setLoading] = useState(false)
    const nav = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        setLoading(true);
        const fetchCategory = Axios.get(`${CATEGORIES}/${id}?populate=*`);
        const fetchAllProducts = Axios.get(`${PRODUCTS}`);

        Promise.all([fetchCategory, fetchAllProducts]).then(([catData, prodsData]) => {
            const category = catData.data.data;
            setTitle(category.title);
            if (category.image) {
                setPreview(`${URL}${category.image.url}`);
                setImageId(category.image.id);
            }
            if (category.products) setSelectedProducts(category.products.map(p => p.id));
            setAllProducts(prodsData.data.data || prodsData.data);
            setLoading(false);
        }).catch(() => nav("/dashboard/404"));
    }, [id, nav])

    async function handleImageChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        setUploading(true);
        const formData = new FormData();
        formData.append("files", file);
        try {
            const res = await Axios.post("/upload", formData);
            setImageId(res.data[0].id);
            setUploading(false);
        } catch (err) { setUploading(false); }
    }

    async function submit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            await Axios.put(`${CATEGORIES}/${id}`, { data: { title, products: selectedProducts, image: imageId } });
            nav("/dashboard/categories");
        } catch (err) { setLoading(false); }
    }

    return (
        <div className="bg-gray-50/50 min-h-screen pb-20">
            {loading && <LoadingScreen />}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b px-4 md:px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => nav(-1)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"><FontAwesomeIcon icon={faChevronLeft} /></button>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 leading-none">{t('Edit Category')}</h2>
                        <span className="text-[10px] text-blue-500 font-bold tracking-tighter uppercase">{t('ID')}: {id}</span>
                    </div>
                </div>
                <button form="cat-form" type="submit" disabled={uploading} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-sm">
                    {uploading ? t('Uploading...') : t('Save Changes')}
                </button>
            </div>

            <form id="cat-form" onSubmit={submit} className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <label className="text-xs font-black text-gray-400 uppercase mb-3 block">{t('Category Title')}</label>
                        <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/10 outline-none text-base font-medium" />
                    </div>
                    
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <label className="text-xs font-black text-gray-400 uppercase mb-4 block">{t('Cover Image')}</label>
                        <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden border border-gray-100 group">
                            <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 z-20 cursor-pointer" />
                            {preview ? (
                                <div className="w-full h-full relative">
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                        <FontAwesomeIcon icon={faCloudUploadAlt} className="text-3xl mb-2" />
                                        <p className="font-bold text-xs uppercase">{t('Tap to Replace')}</p>
                                    </div>
                                    {uploading && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center"><FontAwesomeIcon icon={faSpinner} className="text-3xl text-blue-600 animate-spin" /></div>}
                                </div>
                            ) : (
                                <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center">
                                    <FontAwesomeIcon icon={faCloudUploadAlt} className="text-4xl text-gray-200 mb-2" />
                                    <p className="text-xs font-bold text-gray-400">{t('No Image - Click to upload')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-gray-800 text-sm mb-4 flex items-center justify-between">{t('Linked Products')} <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-[10px]">{selectedProducts.length}</span></h4>
                        <div className="relative mb-4">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <input type="text" placeholder={t('Filter list...')} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 py-2.5 bg-gray-50 border-none rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500/10" />
                        </div>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                            {allProducts.filter(p => (p.title || p.attributes?.title)?.toLowerCase().includes(searchQuery.toLowerCase())).map((prod) => (
                                <label key={prod.id} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer border transition-all ${selectedProducts.includes(prod.id) ? 'bg-blue-50 border-blue-100' : 'bg-white border-transparent'}`}>
                                    <input type="checkbox" className="hidden" checked={selectedProducts.includes(prod.id)} onChange={() => setSelectedProducts(prev => prev.includes(prod.id) ? prev.filter(i => i !== prod.id) : [...prev, prod.id])} />
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${selectedProducts.includes(prod.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                                        {selectedProducts.includes(prod.id) && <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />}
                                    </div>
                                    <span className="text-xs font-medium text-gray-600 truncate">{prod.title || prod.attributes?.title}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}