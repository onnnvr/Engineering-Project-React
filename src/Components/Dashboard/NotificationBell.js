import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCircle } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { Axios } from "../../Api/Axios";
import { baseUrl } from "../../Api/Api";

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            // بنجيب آخر 5 تنبيهات غير مقروءة
            const data = await Axios.get(`${baseUrl}/notifications?filters[isRead][$eq]=false&sort=createdAt:desc&pagination[limit]=5`);
            if (data.data) {
                setNotifications(data.data.data);
                setUnreadCount(data.data.data.length);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // تحديث كل 30 ثانية
        return () => clearInterval(interval);
    }, []);

    const getTypeColor = (type) => {
        switch (type) {
            case 'Success': return 'text-green-500';
            case 'Warning': return 'text-orange-500';
            case 'Danger': return 'text-red-500';
            default: return 'text-blue-500';
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors relative"
            >
                <FontAwesomeIcon icon={faBell} className="text-[18px]" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                        <span className="font-bold text-gray-800">التنبيهات</span>
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{unreadCount} جديدة</span>
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((n) => (
                                <div key={n.id} className="p-4 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                                    <div className="flex gap-3">
                                        <FontAwesomeIcon icon={faCircle} className={`mt-1 text-[8px] ${getTypeColor(n.type)}`} />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{n.title}</p>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400 text-sm">لا توجد تنبيهات جديدة</div>
                        )}
                    </div>

                    <Link 
                        to="/dashboard/notifications" 
                        onClick={() => setIsOpen(false)}
                        className="block p-3 text-center text-sm text-blue-600 font-medium hover:bg-gray-50 transition-colors"
                    >
                        عرض الكل
                    </Link>
                </div>
            )}
        </div>
    );
}