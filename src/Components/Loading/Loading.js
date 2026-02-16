export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-50"></div>
            
            <div className="relative flex flex-col items-center">
                {/* Logo Icon */}
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-200 animate-bounce">
                    E
                </div>

                {/* Spinner */}
                <div className="mt-8 relative flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-[3px] border-gray-100 border-t-blue-600 animate-spin"></div>
                    <div className="absolute w-12 h-12 bg-blue-400/20 rounded-full animate-ping"></div>
                </div>

                <p className="mt-6 text-xs font-black text-gray-400 uppercase tracking-[3px] animate-pulse">
                    Loading Assets
                </p>
            </div>
        </div>
    );
}