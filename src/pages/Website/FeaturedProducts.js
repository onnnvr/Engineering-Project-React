import { Link } from "react-router-dom";

export default function FeaturedProducts({ products }) {
  // حماية في حالة إن الداتا لسه مجاتش من الـ API
  if (!products || products.length === 0) return null;

  // السر هنا: بنضاعف المصفوفة عشان الـ Animation ميفصلش أبداً
  const duplicatedProducts = [...products, ...products];

  return (
    <section className="bg-[#f6f6f6] py-20 overflow-hidden w-full" dir="rtl">
      <div className="container mx-auto px-6 mb-12 text-center">
        <h2 className="text-4xl font-black text-black opacity-80 mb-4 tracking-tight">
          أبرز المنتجات
        </h2>
        <div className="w-16 h-1.5 bg-red-600 mx-auto rounded-full"></div>
      </div>

      {/* الـ Container الخارجي */}
      <div className="relative overflow-hidden w-full pause-on-hover">
        <div className="scroll-wrapper flex gap-6 py-6">
          {duplicatedProducts.map((product, index) => (
            <Link
              key={index}
              to={`/products/${product.documentId}`}
              className="product-bounce-hover w-[280px] flex-shrink-0 bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center group decoration-none"
            >
              {/* صورة المنتج */}
              <div className="h-44 w-full flex items-center justify-center mb-6">
                <img
                  src={`${product.images?.[0]?.url}`}
                  alt={product.title}
                  className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* البراند */}
              <span className="text-[9px] font-black text-gray-400 tracking-[0.3em] mb-2 uppercase">
                {product.brand || "Professional Tools"}
              </span>

              {/* العنوان */}
              <h3 className="text-lg font-bold text-gray-800 text-center mb-4 h-14 line-clamp-title leading-snug">
                {product.title}
              </h3>

              {/* السعر */}
              <div className="mt-auto pt-4 border-t border-gray-50 w-full text-center">
                <span className="text-2xl font-black text-red-700">
                  {product.price} 
                  <span className="text-[10px] text-gray-400 mr-1 font-bold">EGP</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}