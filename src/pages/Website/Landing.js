export default function Hero() {
  return (
    /* h-[calc(100vh-80px)] هي السر هنا - افترضنا الهيدر 80 بكسل */
    <section className="landing-bg relative bg-black text-white overflow-hidden h-[calc(100vh)] md:h-[calc(100vh)] flex items-center justify-center" dir="rtl">
      
      {/* Gradients خلفية */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-900/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          
          <div className="flex justify-center">
            <span className="inline-block px-4 py-1 border border-white/10 bg-white/5 backdrop-blur-sm text-red-500 text-[9px] font-bold uppercase tracking-[0.4em] rounded-full">
              Engineering Excellence
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            قوة <span className="text-red-600">الأداء</span> في كل معدة.
          </h1>

          <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto leading-relaxed opacity-80">
            نوفر لك أقوى المعدات الأصلية بضمان حقيقي وأسعار منافسة. 
            نختار لك الأفضل لأننا نفهم لغة المهندسين المحترفين.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <button className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20 text-sm">
              تسوق الآن
            </button>
            <button className="px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all text-sm">
              تواصل معنا
            </button>
          </div>

        </div>
      </div>

      {/* مؤشر السكرول - خليته أصغر عشان المساحة الجديدة */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50">
         <div className="w-[1px] h-6 bg-gradient-to-b from-red-600 to-transparent"></div>
         <span className="text-[7px] text-gray-500 tracking-[0.3em] uppercase">Scroll</span>
      </div>
    </section>
  );
}