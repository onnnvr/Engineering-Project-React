import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Axios } from "../../../Api/Axios";
import LoadingScreen from "../../../Components/Loading/Loading";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faChevronLeft, faPhone, faFileInvoiceDollar, faHistory, faPlus, 
    faMoneyBillWave, faUserTie, faBuilding, faUserAlt, faCheckCircle 
} from "@fortawesome/free-solid-svg-icons";
import { TRADERS } from "../../../Api/Api";

export default function Trader() {
    const { t } = useTranslation();
    const { id } = useParams();
    const nav = useNavigate();
    const [loading, setLoading] = useState(false);
    const [trader, setTrader] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [selectedPurchase, setSelectedPurchase] = useState("");

    const fetchTrader = async () => {
        setLoading(true);
        try {
            const res = await Axios.get(`${TRADERS}/${id}`, {
                params: {
                    populate: {
                        purchases: { sort: ['createdAt:desc'] },
                        purchase_payments: { sort: ['createdAt:desc'] }
                    }
                }
            });
            setTrader(res.data.data);
        } catch (err) { console.log(err); }
        setLoading(false);
    };

    useEffect(() => { fetchTrader(); }, [id]);

    const handleAddPayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const paymentData = {
                amount: parseFloat(paymentAmount),
                trader: { connect: [id] }
            };
            if (selectedPurchase) {
                paymentData.purchase = { connect: [selectedPurchase] };
            }
            await Axios.post('/purchase-payments', { data: paymentData });
            setShowPaymentModal(false);
            setPaymentAmount("");
            setSelectedPurchase("");
            await fetchTrader();
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    if (!trader && !loading) return <div className="p-10 text-center">{t("traderNotFound")}</div>;

    return (
        <div className="bg-gray-50/50 min-h-screen pb-20 text-left">
            {loading && <LoadingScreen />}

            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button onClick={() => nav(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{trader?.name}</h2>
                        <div className="flex items-center gap-2 text-xs text-blue-600 font-bold uppercase tracking-tighter">
                            <FontAwesomeIcon icon={trader?.type === 'company' ? faBuilding : (trader?.type === 'person' ? faUserAlt : faUserTie)} />
                            <span>{trader?.type ? t(trader?.type) : t("trader")}</span>
                            <span>• {t("id")}: #{trader?.id}</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2 text-sm"
                >
                    <FontAwesomeIcon icon={faPlus} /> {t("recordOutgoingPayment")}
                </button>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Stats */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gradient-to-br from-red-500 to-red-600 p-8 rounded-[2rem] text-white shadow-xl shadow-red-100 relative overflow-hidden">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12" />
                        <p className="text-red-100 text-xs font-bold uppercase tracking-widest">{t("totalDebtToTrader")}</p>
                        <h4 className="text-4xl font-black mt-2">
                            {Number(trader?.totalDebt || 0).toLocaleString()} <span className="text-sm font-normal">{t("egp")}</span>
                        </h4>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{t("contactInfo")}</h3>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm text-lg">
                                <FontAwesomeIcon icon={faPhone} />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{t("phone")}</p>
                                <p className="text-sm font-bold text-gray-800">{trader?.number || t("nA")}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Tables */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Purchases Table */}
                    <div className="bg-white p-4 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                <FontAwesomeIcon icon={faFileInvoiceDollar} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{t("purchasesHistory")}</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-widest text-center">
                                    <tr>
                                        <th className="px-4 py-4 text-left whitespace-nowrap">{t("id")}</th>
                                        <th className="px-4 py-4">{t("total")}</th>
                                        <th className="px-4 py-4">{t("remaining")}</th>
                                        <th className="px-4 py-4 text-right">{t("action")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {trader?.purchases?.map((purchase) => (
                                        <tr key={purchase.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-4 py-4">
                                                <Link to={`/dashboard/purchases/${purchase.documentId}`} className="font-bold text-blue-600">#{purchase.id}</Link>
                                                <p className="text-[10px] text-gray-400">{new Date(purchase.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-4 py-4 text-center font-medium text-gray-600">{purchase.totalAmount}</td>
                                            <td className={`px-4 py-4 text-center font-bold ${purchase.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {purchase.remainingAmount}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Link to={`/dashboard/purchases/${purchase.documentId}`} className="text-gray-300 hover:text-blue-600"><FontAwesomeIcon icon={faChevronLeft} /></Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payment History */}
                    <div className="bg-white p-4 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-lg">
                                <FontAwesomeIcon icon={faHistory} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{t("paymentHistory")}</h3>
                        </div>
                        <div className="space-y-3">
                            {trader?.purchase_payments?.map((pay) => (
                                <div key={pay.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-[1.5rem]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm">
                                            <FontAwesomeIcon icon={faCheckCircle} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{t("paidToTrader")}</p>
                                            <p className="text-[10px] text-gray-400">{new Date(pay.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-md font-black text-green-600">-{pay.amount}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center px-0 md:px-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}></div>
                    <form onSubmit={handleAddPayment} className="relative bg-white w-full max-w-md rounded-t-[2rem] md:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                        <div className="p-8">
                            <h3 className="text-2xl font-black text-gray-800 mb-2">{t("newPayment")}</h3>
                            <p className="text-gray-400 text-sm mb-6">{t("payMoneyTo", { name: trader.name })}</p>
                            <div className="space-y-5">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">{t("amountToPay")}</label>
                                    <div className="relative">
                                        <input required type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder={t("zeroAmountPlaceholder")}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-2xl text-green-600" />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-gray-300">{t("egp")}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">{t("selectPurchaseOptional")}</label>
                                    <select value={selectedPurchase} onChange={(e) => setSelectedPurchase(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-medium text-sm">
                                        <option value="">{t("autoAllocateOldestFirst")}</option>
                                        {trader?.purchases?.filter(o => !o.paid).map(o => (
                                            <option key={o.id} value={o.documentId}>{t("purchaseIdRem", { id: o.id, rem: o.remainingAmount })}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 flex gap-3">
                            <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all">{t("cancel")}</button>
                            <button type="submit" className="flex-1 py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-200 hover:bg-green-700 transition-all">{t("confirmPayment")}</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}