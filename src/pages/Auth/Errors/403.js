import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faShieldHalved } from "@fortawesome/free-solid-svg-icons";

export default function Err403({ role }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
            <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100 text-center max-w-xl">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 relative">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-3xl" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] border-4 border-white">
                        <FontAwesomeIcon icon={faLock} />
                    </div>
                </div>

                <h1 className="text-2xl font-black text-gray-800 mb-3 tracking-tight">Access Denied</h1>
                <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                    Sorry, but you don't have the necessary permissions to view this secure resource. 
                    If you believe this is an error, please contact your administrator.
                </p>

                <div className="p-4 bg-gray-50 rounded-2xl mb-8 flex items-center justify-center gap-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Status:</span>
                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-black uppercase">Unauthorized</span>
                </div>

                <Link
                    to={role === "1996" ? "/dashboard/writer" : "/"}
                    className="inline-block w-full px-8 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl shadow-gray-200 hover:bg-black hover:-translate-y-1 transition-all"
                >
                    {role === "1996" ? "Go To Writer Space" : "Return to Dashboard"}
                </Link>
            </div>
        </div>
    );
}