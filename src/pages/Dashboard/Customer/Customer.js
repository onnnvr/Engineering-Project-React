import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Axios } from "../../../Api/Axios";
import LoadingScreen from "../../../Components/Loading/Loading";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faChevronLeft, faUser, faPhone, faMapMarkerAlt, 
    faFileInvoiceDollar, faHistory, faPlus, faMoneyBillWave, 
    faUserTie, faBuilding, faUserAlt, faCalendarDay, faCheckCircle, faClock
} from "@fortawesome/free-solid-svg-icons";

export default function Customer() {
    const { t } = useTranslation();
    const { id } = useParams();
    const nav = useNavigate();
    const [loading, setLoading] = useState(false);
    const [customer, setCustomer] = useState(null);
    
    // حالات إضافة دفعة جديدة
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(""); // اختياري لربط الدفعة بأوردر معين

    console.log(customer);

    const fetchCustomer = async () => {
        setLoading(true);
        try {
            const res = await Axios.get(`/customers/${id}`, {
                params: {
                    populate: {
                        orders: { 
                            sort: ['createdAt:desc'],
                            // تم إزالة فلتر paid: false ليظهر كل الأوردرات
                        },
                        payments: { sort: ['createdAt:desc'] }
                    }
                }
            });
            setCustomer(res.data.data);
        } catch (err) { console.log(err); }
        setLoading(false);
    };

    useEffect(() => { fetchCustomer(); }, [id]);

    const handleAddPayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const paymentData = {
                amount: parseFloat(paymentAmount),
                customer: { connect: [id] }
            };
            if (selectedOrder) {
                paymentData.order = { connect: [selectedOrder] };
            }

            await Axios.post('/payments', { data: paymentData });
            setShowPaymentModal(false);
            setPaymentAmount("");
            setSelectedOrder("");
            await fetchCustomer(); // تحديث المديونية والسجلات
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    if (!customer && !loading) return <div className="p-10 text-center">{t('Customer not found')}</div>;

    // ... (الـ imports والـ logic كما هم تماماً)

    return (
        <div className="bg-gray-50/50 min-h-screen pb-20 text-left">
            {loading && <LoadingScreen />}

            {/* Header - Fixed & Responsive */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button onClick={() => nav(-1)} className="p-2.5 hover:bg-gray-100 rounded-full transition-colors shrink-0">
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <div className="min-w-0">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800 truncate">{customer?.name}</h2>
                        <div className="flex items-center gap-2 text-[10px] text-blue-600 font-bold uppercase tracking-tight">
                            <FontAwesomeIcon icon={customer?.type === 'company' ? faBuilding : faUserAlt} />
                            <span>{customer?.type ? t(customer.type) : ''}</span>
                            <span className="text-gray-300">•</span>
                            <span className="truncate">{t('ID')}: #{customer?.id}</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                    <FontAwesomeIcon icon={faPlus} /> {t('Receive Payment')}
                </button>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                
                {/* Statistics Column */}
                <div className="md:col-span-4 space-y-6">
                    {/* Debt Card */}
                    <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 md:p-8 rounded-3xl text-white shadow-xl shadow-red-100 relative overflow-hidden">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="absolute -right-4 -bottom-4 text-7xl md:text-8xl opacity-10 rotate-12" />
                        <p className="text-red-100 text-[10px] font-bold uppercase tracking-widest mb-1">{t('Current Debt')}</p>
                        <h4 className="text-3xl md:text-4xl font-black">
                            {Number(customer?.totalDebt || 0).toLocaleString()} <span className="text-sm font-normal opacity-80">{t('egp')}</span>
                        </h4>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{t('Contact Information')}</h3>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                                <FontAwesomeIcon icon={faPhone} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{t('Phone Number')}</p>
                                <p className="text-sm font-bold text-gray-800 truncate">{customer?.number || t('No Number')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Column */}
                <div className="md:col-span-8 space-y-6">
                    
                    {/* Orders History Table */}
                    <div className="bg-white p-4 md:p-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                                <FontAwesomeIcon icon={faFileInvoiceDollar} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{t('Orders History')}</h3>
                        </div>
                        <div className="overflow-x-auto rounded-2xl border border-gray-50">
                            <table className="w-full text-sm min-w-[500px]">
                                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[9px] tracking-widest text-center">
                                    <tr>
                                        <th className="px-4 py-4 text-left">{t('Order')}</th>
                                        <th className="px-4 py-4">{t('Total')}</th>
                                        <th className="px-4 py-4">{t('Remaining')}</th>
                                        <th className="px-4 py-4 text-right">{t('Action')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {customer?.orders?.map((ord) => (
                                        <tr key={ord.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col">
                                                    <Link to={`/dashboard/orders/${ord.documentId}`} className="font-bold text-blue-600 hover:underline">#{ord.id}</Link>
                                                    <span className="text-[10px] text-gray-400">{new Date(ord.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center font-medium">{ord.totalAmount} <span className="text-[10px] text-gray-400">EGP</span></td>
                                            <td className={`px-4 py-4 text-center font-bold ${ord.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {ord.remainingAmount} <span className="text-[10px] opacity-60">EGP</span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Link to={`/dashboard/orders/${ord.documentId}`} className="text-gray-300 hover:text-blue-600 p-2"><FontAwesomeIcon icon={faChevronLeft} /></Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payment History List */}
                    <div className="bg-white p-4 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                                <FontAwesomeIcon icon={faHistory} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{t('Payment History')}</h3>
                        </div>
                        <div className="space-y-4">
                            {customer?.payments?.map((pay) => (
                                <div key={pay.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm shrink-0">
                                            <FontAwesomeIcon icon={faCheckCircle} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-800 text-sm md:text-base">{t('Payment Received')}</p>
                                            <p className="text-[10px] text-gray-400 truncate">{new Date(pay.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-base md:text-lg font-black text-green-600">+{pay.amount} <span className="text-[10px]">EGP</span></p>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase">{t('ID')} #{pay.id}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal - Full Responsive */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}></div>
                    <form onSubmit={handleAddPayment} className="relative bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
                        <div className="p-6 md:p-8">
                            <h3 className="text-xl md:text-2xl font-black text-gray-800 mb-2">{t('New Payment')}</h3>
                            <p className="text-gray-400 text-sm mb-6">{t('Settling debt for')} <strong>{customer.name}</strong></p>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">{t('Amount to Pay')}</label>
                                    <div className="relative">
                                        <input required type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder={t('0.00')} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:bg-white focus:border-green-500 transition-all font-bold text-2xl text-green-600" />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-gray-300">EGP</span>
                                    </div>
                                </div>
                                {/* ... Select Order dropdown with same responsive styling ... */}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 flex gap-3">
                            <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 py-4 font-bold text-gray-500 rounded-2xl hover:bg-gray-100">{t('Cancel')}</button>
                            <button type="submit" className="flex-1 py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all">{t('Confirm')}</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}