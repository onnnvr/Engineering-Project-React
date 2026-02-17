import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Axios } from "../../Api/Axios";
import { CATEGORIES, PRODUCTS } from "../../Api/Api";

export default function MainPage() {
  const { pageName } = useParams(); 
  const [categories, setCategories] = useState([]); 
  const [products, setProducts] = useState([]); 
  const [activeSub, setActiveSub] = useState(null); 
  const [loading, setLoading] = useState(true);

  // 1. جلب القائمة الجانبية وتصفير الداتا عند تغيير القسم الرئيسي
  useEffect(() => {
    const fetchSideMenu = async () => {
      try {
        setProducts([]); 
        setActiveSub(null); 

        const res = await Axios.get(`${CATEGORIES}?filters[pages][name][$eq]=${pageName}&pagination[pageSize]=100`, {
          params: {
            populate: {
              products: { populate: { images: true } },
              pages: true
            }
          }
        });
        
        const categoriesResponse = res.data.data;
        setCategories(categoriesResponse);

        if (categoriesResponse.length > 0) {
          setActiveSub(categoriesResponse[0].documentId);
        }
      } catch (err) {
        console.error("Error fetching side menu", err);
      }
    };
    fetchSideMenu();
  }, [pageName]);

  // 2. جلب المنتجات بناءً على التصنيف النشط
  useEffect(() => {
    if (!activeSub) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await Axios.get(`${PRODUCTS}?populate=*&filters[categories][documentId][$eq]=${activeSub}&pagination[pageSize]=100`);
        setProducts(res.data.data);
        console.log(res.data.data);
      } catch (err) {
        console.error("Error fetching products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeSub]);

  return (
    <div className="w-full bg-[#fcfcfc] min-h-screen pt-32" dir="rtl">
      <div className="container mx-auto flex flex-col md:flex-row gap-6 p-6">
        
        {/* السايد بار - ديسكتوب (ثابت على اليمين في الـ RTL) */}
        <aside className="hidden md:block w-[280px] shrink-0 sticky top-[100px] h-fit max-h-[calc(100vh-120px)] overflow-y-auto border-l border-gray-100 pl-4">
          <h2 className="text-xl font-extrabold text-gray-900 mb-6 pb-3 border-b-4 border-red-600 w-fit">
            الأقسام
          </h2>
          <ul className="flex flex-col gap-2">
            {categories.map((category) => (
              <li key={category.documentId}>
                <button
                  onClick={() => setActiveSub(category.documentId)}
                  className={`w-full text-right block py-3 px-4 text-[15px] font-semibold rounded-lg transition-all duration-200 ${
                    activeSub === category.documentId 
                    ? "bg-red-600 text-white shadow-lg shadow-red-100" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  {category.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* الموبايل - دروب داون */}
        <details className="md:hidden w-full mb-4 border border-gray-200 rounded-xl overflow-hidden bg-white">
          <summary className="p-4 bg-gray-50 font-bold cursor-pointer list-none flex justify-between items-center">
            <span>اختر القسم</span>
            <span className="text-xs">▼</span>
          </summary>
          <ul className="divide-y divide-gray-100">
            {categories.map((category) => (
              <li key={category.documentId}>
                <button
                  onClick={() => setActiveSub(category.documentId)}
                  className={`w-full text-right py-4 px-6 text-[15px] font-bold ${
                    activeSub === category.documentId ? "bg-red-600 text-white" : "text-gray-700"
                  }`}
                >
                  {category.title}
                </button>
              </li>
            ))}
          </ul>
        </details>

        {/* منطقة المنتجات الرئيسية */}
        <main className="flex-1">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
               <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-gray-500 font-medium">جاري تحميل المنتجات...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((item) => (
                <Link
                  key={item.id} 
                  to={`/products/${item.documentId}`} 
                  className="group flex flex-col bg-white border border-gray-100 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:border-red-100 relative overflow-hidden"
                >
                  {/* حاوية الصورة */}
                  <div className="h-52 flex items-center justify-center mb-4 bg-gray-50/50 rounded-xl p-2">
                    {item.images?.[0] ? (
                      <img 
                        src={`${item.images[0].url}`} 
                        alt={item.title} 
                        className="max-h-full max-w-full object-contain" // شلنا الـ scale-110
                      />
                    ) : (
                      <div className="text-gray-300 text-sm">لا توجد صورة</div>
                    )}
                  </div>

                  {/* معلومات المنتج */}
                  <div className="flex flex-col flex-1 text-right">
                    <span className="text-[10px] font-bold text-red-600 mb-1 px-2 py-0.5 bg-red-50 w-fit rounded-md uppercase">
                      {item.brand || 'Made In China'}
                    </span>
                    
                    <h3 className="text-[15px] font-bold text-gray-800 mb-3 h-12 line-clamp-2 leading-relaxed group-hover:text-red-600 transition-colors">
                      {item.title}
                    </h3>

                    <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-medium italic">السعر الحالي</span>
                        <p className="text-lg font-black text-gray-900">
                          {item.price} <span className="text-xs font-normal text-gray-500">EGP</span>
                        </p>
                      </div>
                      
                      {/* سهم صغير كدليل بصري بدلاً من "عرض التفاصيل" */}
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                        <span className="text-sm">←</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <p className="text-gray-400 text-lg">لم يتم العثور على منتجات في هذا القسم.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}