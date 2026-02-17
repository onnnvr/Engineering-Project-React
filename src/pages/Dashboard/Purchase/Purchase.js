import { useTranslation } from "react-i18next";

import { useEffect, useState } from "react";
import { Axios } from "../../../Api/Axios";
import LoadingScreen from "../../../Components/Loading/Loading";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faChevronLeft, faReceipt, faUser, faCalendarAlt, 
    faCreditCard, faTruck, faBoxOpen, faHashtag, 
    faCheckCircle, faClock, faMoneyBillWave, faUserShield,
    faUndoAlt
} from "@fortawesome/free-solid-svg-icons";
import { PURCHASES, URL } from "../../../Api/Api";

export default function Purchase() {
    const { t } = useTranslation();
    const { id } = useParams();
    const nav = useNavigate();
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false); 
    const [purchase, setPurchase] = useState(null);

    const fetchPurchase = async () => {
        setLoading(true);
        try {
            const res = await Axios.get(`${PURCHASES}/${id}`, {
                params: {
                    populate: {
                        user: true,
                        purchase_items: {
                            populate: {
                                product: { populate: ['images'] }
                            }
                        },
                        trader: true
                    }
                }
            });
            setPurchase(res.data.data);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPurchase();
    }, [id]);

    const handleUpdatePayment = async () => {
        setUpdating(true);
        try {
            await Axios.put(`${PURCHASES}/${id}`, {
                data: { paid: true }
            });
            await fetchPurchase();
        } catch (err) {
            console.error("Error updating payment status:", err);
            alert("Failed to update payment status");
        }
        setUpdating(false);
    };

    const handleFullReturn = async () => {
        const confirmReturn = window.confirm(
            "Are you sure you want to return the FULL order?\n\nThis will:\n1. Update order status to 'Returned'\n2. Return all items to stock\n3. Clear the trader's debt for this order."
        );

        if (!confirmReturn) return;

        setUpdating(true);
        try {
            await Axios.put(`${PURCHASES}/${id}`, {
                data: { purchaseStatus: 'Returned' }
            });
            await fetchPurchase();
            alert("Order has been returned successfully.");
        } catch (err) {
            console.error("Return Error:", err);
            alert("Error processing return.");
        }
        setUpdating(false);
    };

    if (!purchase && !loading) return <div className="p-10 text-center">Purchase not found</div>;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Returned': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-green-100 text-green-700 border-green-200';
        }
    };

    return (
        <div className="bg-gray-50/50 min-h-screen pb-20 text-left">
            {loading && <LoadingScreen />}

            {/* Header - Optimized for Mobile */}
            <div className="relative bg-white border-b px-4 md:px-6 py-4 flex flex-wrap gap-4 justify-between items-center shadow-sm top-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => nav(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">{t('Purchase Details')}</h2>
                        <p className="text-[10px] md:text-xs text-blue-600 font-medium uppercase truncate max-w-[150px] md:max-w-none">
                            <FontAwesomeIcon icon={faHashtag} className="mr-1" />
                            {purchase?.documentId}
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {purchase?.purchaseStatus !== 'Returned' && (
                        <button 
                            onClick={handleFullReturn} 
                            disabled={updating}
                            className="flex-1 md:flex-none bg-white hover:bg-red-50 text-red-600 px-3 py-2 rounded-xl text-xs font-bold border border-red-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={faUndoAlt} />
                            {updating ? "..." : t('Return')}
                        </button>
                    )}

                    <span className={`flex-1 md:flex-none text-center px-3 py-2 rounded-xl text-xs font-bold border ${getStatusStyles(purchase?.purchaseStatus)}`}>
                        {purchase?.purchaseStatus ? t(purchase.purchaseStatus) : t('Delivered')}
                    </span>

                    {!purchase?.paid && purchase?.purchaseStatus !== 'Returned' && (
                        <button 
                            onClick={handleUpdatePayment}
                            disabled={updating}
                            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={faCreditCard} />
                            {updating ? "..." : t('Pay')}
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                <div className="md:col-span-8 space-y-6">
                    {/* Purchase Items */}
                    <div className="bg-white p-4 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 text-gray-800">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <FontAwesomeIcon icon={faBoxOpen} />
                            </div>
                            <h3 className="text-lg font-bold">{t('Items')} ({purchase?.purchase_items?.length})</h3>
                        </div>

                        {/* Mobile View Items (Cards) */}
                        <div className="block md:hidden space-y-4">
                            {purchase?.purchase_items?.map((item, idx) => (
                                <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border flex-shrink-0">
                                            {item.product?.images?.[0] && (
                                                <img src={`${item.product.images[0].url}`} className="w-full h-full object-cover" alt="" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link to={`/dashboard/products/${item.product?.documentId}`} className="font-bold text-gray-800 text-sm line-clamp-2 leading-snug">
                                                {item.product?.title || t('Unknown Product')}
                                            </Link>
                                            <p className="text-[10px] text-gray-400 mt-1">{t('SKU')}: {item.product?.barcode || t('N/A')}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200/50">
                                        <span className="text-xs text-gray-500">{item.quantity} x ${item.price}</span>
                                        <span className="font-bold text-blue-600">${item.totalAmount}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View Items (Table) */}
                        <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-50">
                            <table className="w-full">
                                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Product</th>
                                        <th className="px-6 py-4 text-center">Price</th>
                                        <th className="px-6 py-4 text-center">Qty</th>
                                        <th className="px-6 py-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {purchase?.purchase_items?.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                                                        {item.product?.images?.[0] && (
                                                            <img src={`${item.product.images[0].url}`} className="w-full h-full object-cover" alt="" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Link to={`/dashboard/products/${item.product?.documentId}`} className="font-bold text-gray-800 hover:text-blue-600 transition-colors line-clamp-1">
                                                            {item.product?.title || t('Unknown Product')}
                                                        </Link>
                                                        <p className="text-xs text-gray-400">{t('SKU')}: {item.product?.barcode || t('N/A')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium text-gray-600">${item.price}</td>
                                            <td className="px-6 py-4 text-center font-bold text-gray-800">x{item.quantity}</td>
                                            <td className="px-6 py-4 text-right font-bold text-blue-600">${item.totalAmount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                                {t('Status History')}
                            </h3>
                        <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                            <div className="relative pl-10">
                                <div className="absolute left-0 w-9 h-9 bg-green-100 text-green-600 rounded-full flex items-center justify-center border-4 border-white z-10">
                                    <FontAwesomeIcon icon={faCheckCircle} size="xs" />
                                </div>
                                <p className="font-bold text-gray-800 text-sm md:text-base">{t('Purchase Placed')}</p>
                                <p className="text-[10px] md:text-xs text-gray-400">{formatDate(purchase?.createdAt)}</p>
                            </div>
                            {/* ... بقية الـ timeline تبقى كما هي مع تعديل أحجام الخطوط للسحب الصغير ... */}
                            {purchase?.purchaseStatus === 'Returned' && (
                                <div className="relative pl-10">
                                    <div className="absolute left-0 w-9 h-9 bg-red-100 text-red-600 rounded-full flex items-center justify-center border-4 border-white z-10">
                                        <FontAwesomeIcon icon={faUndoAlt} size="xs" />
                                    </div>
                                    <p className="font-bold text-red-600 text-sm">{t('Purchase Returned')}</p>
                                    <p className="text-[10px] text-gray-400">{t('Inventory adjusted')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="md:col-span-4 space-y-6">
                    {/* User & Trader Info */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-1">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 text-purple-600 font-bold mb-4">
                                <FontAwesomeIcon icon={faUserShield} />
                                <h3 className="uppercase tracking-widest text-[10px]">{t('Staff')}</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                                    {purchase?.user?.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-gray-800 text-sm truncate">{purchase?.user?.username}</h4>
                                    <p className="text-[10px] text-gray-400 truncate">{purchase?.user?.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 text-blue-600 font-bold mb-4">
                                <FontAwesomeIcon icon={faUser} />
                                <h3 className="uppercase tracking-widest text-[10px]">{t('Trader')}</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                    {purchase?.trader?.name?.charAt(0).toUpperCase()}
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm truncate">{purchase?.trader?.name}</h4>
                            </div>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm sticky bottom-6 md:relative md:bottom-0">
                         <div className="flex items-center gap-3 text-green-600 font-bold mb-6">
                            <FontAwesomeIcon icon={faReceipt} />
                            <h3 className="uppercase tracking-widest text-xs">{t('Summary')}</h3>
                        </div>
                        
                        <div className="space-y-4 border-b border-gray-50 pb-6 text-sm">
                            <div className="flex justify-between items-center text-gray-500">
                                <span>{t('Subtotal')}</span>
                                <span className="text-gray-800 font-bold">${purchase?.subtotal}</span>
                            </div>
                            {!purchase?.paid && (
                                <div className="flex justify-between items-center text-red-500 font-bold bg-red-50 p-2 rounded-lg">
                                    <span className="text-[10px] uppercase">{t('Remaining')}</span>
                                    <span>${purchase?.remainingAmount}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center pt-6">
                            <span className="font-black text-gray-800 text-xs uppercase">{t('Total Amount')}</span>
                            <span className="text-2xl font-black text-blue-600">${purchase?.totalAmount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}