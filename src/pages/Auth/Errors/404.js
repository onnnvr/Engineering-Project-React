import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCircleQuestion } from "@fortawesome/free-solid-svg-icons";

export default function Err404() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-5">
            <div className="text-center max-w-lg">
                <div className="relative inline-block mb-8">
                    <h1 className="text-[120px] font-black text-gray-100 leading-none">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FontAwesomeIcon icon={faCircleQuestion} className="text-5xl text-blue-600 animate-bounce" />
                    </div>
                </div>
                
                <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Lost in the Clouds?</h2>
                <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                    The page you're looking for doesn't exist or has been moved. 
                    Don't worry, even the best explorers get lost sometimes.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link 
                        to="/" 
                        className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all"
                    >
                        Go to Homepage
                    </Link>
                    <button 
                        onClick={() => window.history.back()} 
                        className="w-full sm:w-auto px-8 py-3 bg-gray-50 text-gray-600 rounded-2xl font-black hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} /> Back
                    </button>
                </div>
            </div>
        </div>
    );
}