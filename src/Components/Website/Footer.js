export default function Footer() {
  return (
    <footer className="bg-black text-white py-4 mt-auto w-full border-t border-gray-900" dir="ltr">
      <div className="container mx-auto px-4 text-center">
        {/* السطر الأول: الحقوق والاسم */}
        <p className="text-sm md:text-base mb-1">&copy; 2026 <span className="text-red-800 font-bold tracking-wider mx-1">ENGINEERING</span> All rights reserved.</p>
        
        {/* السطر الثاني: المصمم */}
        <p className="text-xs md:text-sm text-gray-400">Developed By<a 
            href="https://www.engineeringeg.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-red-800 font-bold hover:text-red-600 transition-colors mx-1"
          >
            Engineering
          </a>
        </p>
      </div>
    </footer>
  );
}