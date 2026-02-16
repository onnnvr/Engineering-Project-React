import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Axios } from "../../Api/Axios";
import { PRODUCTS } from "../../Api/Api";

export default function ProductPage() {
  const { id } = useParams(); // ده الـ documentId اللي جاي من الرابط
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await Axios.get(`${PRODUCTS}/${id}?populate=*`);
        setProduct(res.data.data);
      } catch (err) {
        console.error("Error fetching product details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

    const handleWhatsAppOrder = () => {
        const phoneNumber = "201006658220"; // <--- حط رقم تليفونك هنا بكود الدولة (2)
        const message = `أهلاً، أريد طلب هذا المنتج:\n${product.title}\n\nرابط المنتج:\n${window.location.href}`;
        
        // تحويل الرسالة لشكل يفهمه الرابط (Encoding)
        const encodedMessage = encodeURIComponent(message);
        
        // فتح الرابط في نافذة جديدة
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
    };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">المنتج غير موجود</h2>
        <button onClick={() => navigate(-1)} className="text-red-600 font-bold underline">العودة للخلف</button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen pb-12 pt-32" dir="rtl">
      {/* Breadcrumbs - مسار الصفحة */}
      <div className="bg-gray-50 py-4 mb-8">
        <div className="container mx-auto px-6 text-sm text-gray-500 flex gap-2">
          <span className="cursor-pointer hover:text-red-600" onClick={() => navigate("/")}>الرئيسية</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* قسم الصور - اليمين */}
          <div className="flex flex-col gap-4">
            <div className="bg-gray-50 rounded-3xl p-8 flex justify-center items-center border border-gray-100 overflow-hidden">
              {product.images?.[activeImage] ? (
                <img 
                  src={`http://192.168.1.12:1337${product.images[activeImage].url}`} 
                  alt={product.title} 
                  className="max-h-[400px] object-contain"
                />
              ) : (
                <div className="h-[400px] flex items-center justify-center text-gray-400">لا توجد صورة</div>
              )}
            </div>
            
            {/* الصور المصغرة لو فيه أكتر من صورة */}
            {product.images?.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`w-20 h-20 rounded-xl border-2 flex-shrink-0 p-1 transition-all ${
                      activeImage === index ? "border-red-600 bg-white" : "border-transparent bg-gray-50"
                    }`}
                  >
                    <img src={`http://192.168.1.12:1337${img.url}`} className="w-full h-full object-contain" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* قسم التفاصيل - اليسار */}
          <div className="flex flex-col text-right">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm font-bold mb-4 uppercase">
                {product.brand || "Made In China"}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-black text-red-600">{product.price} EGP</span>
                <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded">متوفر في المخزن</span>
              </div>
            </div>

            <div className="border-t border-b border-gray-100 py-6 mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-3">وصف المنتج:</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {product.description || "لا يوجد وصف متوفر لهذا المنتج حالياً. يمكنك التواصل معنا لمزيد من التفاصيل الفنية حول هذا المنتج."}
              </p>
            </div>

            {/* أزرار التفاعل */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <button onClick={handleWhatsAppOrder} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-700 transition-colors shadow-xl shadow-red-100 flex justify-center items-center gap-2">
                <span>اطلب الآن عبر واتساب</span>
              </button>
              {/* <button className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-colors flex justify-center items-center gap-2">
                <span>إضافة للسلة</span>
              </button> */}
            </div>

            {/* مميزات سريعة */}
            {/* <div className="grid grid-cols-3 gap-4 mt-10">
              <div className="text-center p-4 bg-gray-50 rounded-2xl">
                <div className="text-xl mb-1">🚚</div>
                <div className="text-[10px] font-bold text-gray-500">شحن سريع</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-2xl">
                <div className="text-xl mb-1">🛡️</div>
                <div className="text-[10px] font-bold text-gray-500">ضمان سنة</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-2xl">
                <div className="text-xl mb-1">🔄</div>
                <div className="text-[10px] font-bold text-gray-500">إرجاع سهل</div>
              </div>
            </div> */}
          </div>

        </div>
      </div>
    </div>
  );
}