import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faTrash, 
    faCheckDouble, 
    faInfoCircle, 
    faExclamationTriangle, 
    faCheckCircle, 
    faTimesCircle,
    faClock,
    faEye,
    faShieldAlt
} from "@fortawesome/free-solid-svg-icons";
import { Axios } from "../../../Api/Axios";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('alerts'); // 'alerts' or 'logs'

    const fetchAllNotifications = async () => {
        try {
            setLoading(true);
            const response = await Axios.get('/notifications?sort=createdAt:desc&populate=user');
            if (response.data.data) {
                setNotifications(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllNotifications();
    }, []);

    // فصل البيانات: التنبيهات المهمة مقابل سجلات الزيارة
    const alerts = notifications.filter(n => n.title !== "استعراض بيانات (زيارة)");
    const logs = notifications.filter(n => n.title === "استعراض بيانات (زيارة)");

    const markAsRead = async (id) => {
        try {
            await Axios.put(`/notifications/${id}`, { data: { isRead: true } });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error("Error updating notification:", err);
        }
    };

    const deleteNotification = async (id) => {
        if (!window.confirm("هل أنت متأكد من مسح هذا السجل؟")) return;
        try {
            await Axios.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error("Error deleting notification:", err);
        }
    };

    const getStatusConfig = (type, title) => {
        if (title === "استعراض بيانات (زيارة)") return { icon: faEye, color: 'text-gray-400', bg: 'bg-gray-50' };
        switch (type) {
            case 'Success': return { icon: faCheckCircle, color: 'text-green-500', bg: 'bg-green-50' };
            case 'Warning': return { icon: faExclamationTriangle, color: 'text-orange-500', bg: 'bg-orange-50' };
            case 'Danger': return { icon: faTimesCircle, color: 'text-red-500', bg: 'bg-red-50' };
            default: return { icon: faInfoCircle, color: 'text-blue-500', bg: 'bg-blue-50' };
        }
    };

    const currentData = activeTab === 'alerts' ? alerts : logs;

    return (
        <div className="p-6 mt-[70px] min-h-screen bg-gray-50/50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FontAwesomeIcon icon={faShieldAlt} className="text-blue-600" />
                        مركز التحكم والنشاط
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">راقب تحركات الموظفين والعمليات الحساسة في نظامك</p>
                </div>
                <button 
                    onClick={fetchAllNotifications}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                >
                    تحديث البيانات
                </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl w-fit border border-gray-100 shadow-sm">
                <button 
                    onClick={() => setActiveTab('alerts')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'alerts' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    العمليات الهامة
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'alerts' ? 'bg-white text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        {alerts.length}
                    </span>
                </button>
                <button 
                    onClick={() => setActiveTab('logs')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'logs' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <FontAwesomeIcon icon={faEye} />
                    سجل الزيارات
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'logs' ? 'bg-white text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        {logs.length}
                    </span>
                </button>
            </div>

            {/* Content List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all">
                {loading ? (
                    <div className="p-32 text-center">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-gray-400 font-medium">جاري مزامنة السجلات...</p>
                    </div>
                ) : currentData.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {currentData.map((n) => {
                            const config = getStatusConfig(n.type, n.title);
                            return (
                                <div key={n.id} className={`p-5 flex items-start gap-5 transition-all ${!n.isRead && activeTab === 'alerts' ? 'bg-blue-50/40' : 'hover:bg-gray-50/80'}`}>
                                    <div className={`p-3.5 rounded-2xl shrink-0 ${config.bg} ${config.color}`}>
                                        <FontAwesomeIcon icon={config.icon} className="text-xl" />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="font-bold text-gray-800 truncate">{n.title}</h3>
                                            <div className="flex items-center gap-2 text-gray-400 text-[11px] whitespace-nowrap bg-gray-50 px-2 py-1 rounded-lg">
                                                <FontAwesomeIcon icon={faClock} />
                                                <span>{new Date(n.createdAt).toLocaleString('ar-EG')}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1 leading-relaxed break-words">{n.message}</p>
                                        
                                        <div className="flex flex-wrap items-center gap-4 mt-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                                                    {n.user?.username?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <span className="text-xs font-semibold text-gray-500">
                                                    {n.user?.username || 'نظام آلي'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3 mr-auto">
                                                {!n.isRead && activeTab === 'alerts' && (
                                                    <button 
                                                        onClick={() => markAsRead(n.documentId)}
                                                        className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                                                    >
                                                        <FontAwesomeIcon icon={faCheckDouble} className="ml-1" /> تم الاطلاع
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => deleteNotification(n.documentId)}
                                                    className="text-xs font-bold text-red-400 hover:text-red-600 p-1.5 transition-colors"
                                                    title="حذف السجل"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-32 text-center">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FontAwesomeIcon icon={activeTab === 'alerts' ? faCheckCircle : faEye} className="text-3xl text-gray-200" />
                        </div>
                        <p className="text-gray-400 font-medium">
                            {activeTab === 'alerts' ? 'لا توجد عمليات هامة حالياً' : 'سجل الزيارات فارغ'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}