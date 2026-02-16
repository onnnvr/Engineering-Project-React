import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Axios } from "../../../Api/Axios";
import { PURCHASES, PRODUCTS, PURCHASEITEMS, TRADERS } from "../../../Api/Api";
import LoadingScreen from "../../../Components/Loading/Loading";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faBoxOpen, faTrashAlt, faTimes, faStore, faChevronLeft, faInfoCircle, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";

const WAREHOUSES = "/warehouses";

export default function AddPurchase() {
    const { t } = useTranslation();
    const [trader, setTrader] = useState("");
    const [purchaseItems, setPurchaseItems] = useState([]);
    const [paid, setPaid] = useState(false);
    const [allTraders, setAllTraders] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [allWarehouses, setAllWarehouses] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [showModal, setShowModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [newProduct, setNewProduct] = useState({ title: "", price: "", description: "", barcode: "" });

    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const [tradersRes, productsRes, warehousesRes] = await Promise.all([
                Axios.get(`${TRADERS}`),
                Axios.get(`${PRODUCTS}`),
                Axios.get(`${WAREHOUSES}`)
            ]);
            setAllTraders(tradersRes.data.data);
            setAllProducts(productsRes.data.data || productsRes.data);
            setAllWarehouses(warehousesRes.data.data || warehousesRes.data);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const addProductToOrder = (productId) => {
        if (!productId) return;
        const product = allProducts.find(p => String(p.documentId) === String(productId));
        if (product && !purchaseItems.find(item => item.product === product.documentId)) {
            setPurchaseItems([...purchaseItems, {
                product: product.documentId,
                title: product.title,
                quantity: 1,
                price: product.price || 0,
                warehouse: "",
                totalAmount: product.price || 0
            }]);
        }
    };

    const handleQuickProductCreate = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        try {
            const res = await Axios.post(`${PRODUCTS}`, {
                data: {
                    title: newProduct.title,
                    price: parseFloat(newProduct.price),
                    description: newProduct.description,
                    barcode: newProduct.barcode,
                    showOnWebsite: false,
                    isTemporary: false,
                    productStatus: "published",
                    slug: newProduct.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')
                }
            });
            const createdProduct = res.data.data;
            setAllProducts(prev => [...prev, createdProduct]);
            setPurchaseItems(prev => [...prev, {
                product: createdProduct.documentId,
                title: createdProduct.title,
                quantity: 1,
                price: createdProduct.price || 0,
                warehouse: "",
                totalAmount: createdProduct.price || 0
            }]);
            setNewProduct({ title: "", price: "", description: "", barcode: "" });
            setShowModal(false);
        } catch (err) { console.error(err); } finally { setModalLoading(false); }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...purchaseItems];
        if (field === 'warehouse') {
            newItems[index][field] = value;
        } else {
            const val = parseFloat(value) || 0;
            newItems[index][field] = val;
            newItems[index].totalAmount = newItems[index].quantity * newItems[index].price;
        }
        setPurchaseItems(newItems);
    };

    const removeItem = (index) => setPurchaseItems(purchaseItems.filter((_, i) => i !== index));

    const isFormInvalid = !trader || purchaseItems.length === 0 || purchaseItems.some(item => !item.warehouse);

    async function submit(e) {
        e.preventDefault();
        if (isFormInvalid) return;
        setLoading(true);
        try {
            const createdItemsPromises = purchaseItems.map(async (item) => {
                const res = await Axios.post(`${PURCHASEITEMS}`, {
                    data: {
                        product: { connect: [{ documentId: item.product }] },
                        warehouse: { connect: [{ documentId: item.warehouse }] },
                        quantity: item.quantity,
                        price: item.price,
                    }
                });
                return res.data.data.documentId;
            });
            const itemsIds = await Promise.all(createdItemsPromises);
            await Axios.post(`${PURCHASES}`, {
                data: {
                    trader: { connect: [{ documentId: trader }] },
                    purchase_items: { connect: itemsIds.map(id => ({ documentId: id })) },
                    paid: paid,
                },
            });
            navigate("/dashboard/purchases");
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {loading && <LoadingScreen />}
            
            {/* Quick Product Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !modalLoading && setShowModal(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                            <h3 className="font-black tracking-tight">{t('Quick Product')}</h3>
                            <button onClick={() => setShowModal(false)}><FontAwesomeIcon icon={faTimes} /></button>
                        </div>
                        <form onSubmit={handleQuickProductCreate} className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">{t('Title')}</label>
                                <input required value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">{t('Cost')}</label>
                                    <input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">{t('Barcode')}</label>
                                    <input value={newProduct.barcode} onChange={e => setNewProduct({...newProduct, barcode: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none" />
                                </div>
                            </div>
                            <button type="submit" disabled={modalLoading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase">
                                {modalLoading ? t('Creating...') : t('Confirm & Add')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Top Bar */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b px-4 md:px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <button type="button" onClick={() => navigate("/dashboard/purchases")} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-600">
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <h2 className="text-lg font-bold text-gray-800">{t('New Purchase')}</h2>
                </div>
                <button form="purchase-form" type="submit" disabled={isFormInvalid || loading} className={`px-6 py-2.5 rounded-xl text-white font-bold text-sm ${isFormInvalid ? "bg-gray-300" : "bg-blue-600 shadow-lg shadow-blue-100"}`}>
                    {loading ? t('Saving...') : t('Save Purchase')}
                </button>
            </div>

            <form id="purchase-form" onSubmit={submit} className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-9 space-y-6">
                    {/* Trader Selector */}
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">{t('Select Trader')} <span className="text-red-500">*</span></label>
                        <select value={trader} onChange={(e) => setTrader(e.target.value)} className="w-full p-3.5 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none">
                            <option value="">{t('Choose a trader...')}</option>
                            {allTraders.map(u => <option key={u.documentId} value={u.documentId}>{u.name}</option>)}
                        </select>
                    </div>

                    {/* Items Section */}
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('Inventory Items')}</label>
                            <button type="button" onClick={() => setShowModal(true)} className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                <FontAwesomeIcon icon={faPlus} className="mr-1" /> {t('Quick Product')}
                            </button>
                        </div>
                        
                        <select value="" onChange={(e) => addProductToOrder(e.target.value)} className="w-full p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold text-sm mb-6 outline-none">
                            <option value="" disabled>{t('Search existing products...')}</option>
                            {allProducts.map(p => (
                                <option key={p.documentId} value={p.documentId}>{p.title} - ({p.price} EGP)</option>
                            ))}
                        </select>

                        <div className="space-y-4">
                            {purchaseItems.length === 0 ? (
                                <div className="py-12 text-center border-2 border-dashed border-gray-50 rounded-3xl">
                                    <FontAwesomeIcon icon={faBoxOpen} className="text-4xl text-gray-100 mb-2" />
                                    <p className="text-gray-300 font-medium">{t('No items added')}</p>
                                </div>
                            ) : (
                                purchaseItems.map((item, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-2xl relative group">
                                        <button type="button" onClick={() => removeItem(index)} className="absolute top-4 right-4 text-red-300 hover:text-red-500 transition-colors">
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>
                                        <h4 className="font-bold text-gray-800 mb-4 pr-8 text-sm">{item.title}</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">{t('Warehouse')}</label>
                                                <select value={item.warehouse} onChange={(e) => updateItem(index, 'warehouse', e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none">
                                                    <option value="">{t('Select...')}</option>
                                                    {allWarehouses.map(w => <option key={w.documentId} value={w.documentId}>{w.title}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">{t('Cost Price')}</label>
                                                <input type="number" value={item.price} onChange={(e) => updateItem(index, 'price', e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none" />
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">{t('Qty')}</label>
                                                    <input type="number" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none text-center" min="1" />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">{t('Total')}</label>
                                                    <div className="h-[38px] flex items-center justify-center font-black text-xs text-blue-600 bg-blue-50/50 rounded-xl">
                                                        {item.totalAmount.toFixed(0)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-3">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24 space-y-6">
                        <h3 className="font-black text-gray-800 text-sm">{t('Summary')}</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-bold border-b border-gray-50 pb-4">
                                <span className="text-gray-400">{t('Net Total')}</span>
                                <span className="text-gray-700">{purchaseItems.reduce((acc, curr) => acc + curr.totalAmount, 0).toFixed(2)} EGP</span>
                            </div>
                            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer">
                                <div>
                                    <p className="text-xs font-black text-gray-600">{t('PAID STATUS')}</p>
                                    <p className="text-[9px] text-gray-400">{t('Fully paid to trader')}</p>
                                </div>
                                <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="w-5 h-5 accent-green-600 rounded-md" />
                            </label>
                            <div className="pt-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('Grand Total')}</span>
                                <div className="text-3xl font-black text-blue-600 tracking-tighter">
                                    {purchaseItems.reduce((acc, curr) => acc + curr.totalAmount, 0).toFixed(2)}
                                    <span className="text-xs ml-1">EGP</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}