import { useState, useRef, useEffect } from "react";
import { Axios } from "../../Api/Axios";
import { MYUSER } from "../../Api/Api";
import { useNavigate, Link } from "react-router-dom";
import Logout from "../../pages/Auth/AuthOperations/Logout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle, faGear, faSignOutAlt, faChevronDown } from "@fortawesome/free-solid-svg-icons";

function Dropdown() {
    const [user, setUser] = useState({ username: "", email: "" });
    const [open, setOpen] = useState(false);
    const ref = useRef();
    const navigate = useNavigate();

    // جلب بيانات المستخدم
    useEffect(() => {
        Axios.get(`${MYUSER}?populate=role`)
            .then((res) => {
                setUser({
                    username: res.data.username,
                    email: res.data.email
                });
            })
            .catch((err) => console.log(err));
    }, []);

    // إغلاق الدروب داون عند الضغط خارجها
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function logout() {
        localStorage.removeItem("e-commerce");
        window.location.pathname = "/"
    }

    return (
        <div ref={ref} className="relative">
            {/* زر المستخدم (Trigger) */}
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
            >
                {/* صورة وهمية أو أول حرف من الاسم */}
                <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-black text-sm border border-blue-200">
                    {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                </div>
                
                <div className="hidden md:block text-left">
                    <p className="text-sm font-bold text-gray-800 leading-none mb-1">{user.username || "Loading..."}</p>
                    <p className="text-[10px] text-gray-400 font-medium">Administrator</p>
                </div>

                <FontAwesomeIcon 
                    icon={faChevronDown} 
                    className={`text-[10px] text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
                />
            </button>

            {/* القائمة المنسدلة (Menu) */}
            {open && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 py-2 z-50 animate-in fade-in zoom-in duration-150">
                    <div className="px-4 py-3 border-b border-gray-50 mb-2">
                        <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-gray-700 truncate">{user.email}</p>
                    </div>

                    {/* <Link 
                        to="/dashboard/profile" 
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setOpen(false)}
                    >
                        <FontAwesomeIcon icon={faUserCircle} className="w-4" />
                        My Profile
                    </Link>

                    <Link 
                        to="/dashboard/settings" 
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setOpen(false)}
                    >
                        <FontAwesomeIcon icon={faGear} className="w-4" />
                        Settings
                    </Link> */}

                    <div className="h-[1px] bg-gray-50 my-2"></div>

                    {/* زر الخروج بتعديل بسيط عشان ياخد نفس الستايل */}
                    <div className="px-2">
                        <div className="text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <button 
                                onClick={() => {
                                    logout();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-all font-bold mt-1 border-t border-white/5"
                            >
                                <FontAwesomeIcon icon={faSignOutAlt} />
                                <span>تسجيل الخروج</span>
                            </button> 
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dropdown;