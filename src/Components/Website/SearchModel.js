import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { PRODUCTS } from "../../Api/Api";
import { Axios } from "../../Api/Axios";

export default function SearchModel({ isOpen, onClose }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // لوجيك البحث والـ Debounce
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setResults([]);
            return;
        }

        const delayDebounce = setTimeout(() => {
            fetchProducts(searchTerm);
        }, 600); // ينتظر 600ms بعد التوقف عن الكتابة

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const fetchProducts = async (query) => {
        setLoading(true);
        try {
            // استعلام Strapi باستخدام عامل الاحتواء غير الحساس لحالة الأحرف
            const response = await Axios.get(`${PRODUCTS}?filters[title][$containsi]=${query}&populate=*`);
            setResults(response.data.data); 
        } catch (error) {
            console.error("Strapi Search Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // غلق المودال عند الضغط على زر Escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex justify-center items-start pt-10 md:pt-20 transition-all duration-300 px-4"
            onClick={onClose}
        >
            {/* الحاوية الرئيسية للمودال */}
            <div 
                className="w-full max-w-2xl bg-[#121212] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()} 
                dir="rtl"
            >
                {/* منطقة الإدخال (Header) */}
                <div className="relative flex items-center px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                    <FontAwesomeIcon icon={faSearch} className="text-red-600 text-xl ml-4" />
                    <input 
                        autoFocus
                        type="text"
                        placeholder="عن ماذا تبحث اليوم؟"
                        className="flex-1 bg-transparent text-white text-xl outline-none placeholder:text-gray-600 font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button 
                        onClick={onClose}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-all bg-white/5 px-3 py-1 rounded-lg border border-white/5"
                    >
                        <span className="text-[10px] font-bold hidden sm:block">ESC</span>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {/* منطقة عرض النتائج */}
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-[#121212]">
                    {loading && (
                        <div className="p-12 text-center">
                            <div className="inline-block w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-400 mt-4 font-medium animate-pulse">جارٍ تفتيش الرفوف...</p>
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <div className="p-3">
                            <div className="px-4 py-2 flex justify-between items-center">
                                <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">نتائج البحث ({results.length})</span>
                                <div className="h-[1px] flex-1 bg-white/5 mr-4"></div>
                            </div>

                            {results.map((product) => (
                                <Link 
                                    key={product.id} 
                                    to={`/products/${product.documentId}`}
                                    onClick={onClose}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5 mb-1"
                                >
                                    {/* صورة المنتج */}
                                    <div className="w-16 h-16 bg-white/5 rounded-xl flex-shrink-0 p-2 border border-white/5">
                                        {product.images?.[0] ? (
                                            <img 
                                                src={`http://localhost:1337${product.images[0].url}`} 
                                                alt={product.title} 
                                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                <FontAwesomeIcon icon={faSearch} />
                                            </div>
                                        )}
                                    </div>

                                    {/* تفاصيل المنتج */}
                                    <div className="flex-1">
                                        <h4 className="text-white font-bold text-base group-hover:text-red-500 transition-colors line-clamp-1">
                                            {product.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-red-600 font-black text-lg">
                                                {product.price} <span className="text-[10px] mr-1">ج.م</span>
                                            </span>
                                            {/* منشن صغير للتصنيف لو موجود */}
                                            {product.category && (
                                                <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded">
                                                    {product.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* سهم جانبي يظهر عند الهوفر */}
                                    <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-[-10px] transition-all text-red-600">
                                        <FontAwesomeIcon icon={faArrowLeft} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* حالة عدم وجود نتائج */}
                    {!loading && searchTerm && results.length === 0 && (
                        <div className="p-20 text-center">
                            <div className="text-5xl mb-4 opacity-20">🔍</div>
                            <p className="text-gray-400 text-lg">لم نعثر على أي منتج يطابق "<span className="text-white font-bold">{searchTerm}</span>"</p>
                            <p className="text-gray-600 text-sm mt-2">تأكد من كتابة الاسم بشكل صحيح أو جرب كلمات أخرى</p>
                        </div>
                    )}
                </div>

                {/* تلميح صغير في الأسفل */}
                {!loading && (
                    <div className="px-6 py-3 bg-white/[0.02] border-t border-white/5 text-center">
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                            استخدم كلمات دقيقة للحصول على نتائج أفضل
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}