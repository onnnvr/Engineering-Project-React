import { useTranslation } from "react-i18next";

import { useEffect, useState } from "react";
import { Axios } from "../../../Api/Axios";
import { ORDERS, PRODUCTS, ORDERITEMS, CUSTOMERS } from "../../../Api/Api";
import LoadingScreen from "../../../Components/Loading/Loading";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faUser, faBoxOpen, faShoppingCart, faTrashAlt, faMoneyBillWave, faStore } from "@fortawesome/free-solid-svg-icons";

const WAREHOUSES = "/warehouses"; 

export default function AddOrder() {
  const { t } = useTranslation();
  const [customer, setCustomer] = useState("");
  const [recipient, setRecipient] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [addTaxes, setAddTaxes] = useState(true);
  const [paid, setPaid] = useState(false);
  
  const [allCustomers, setAllCustomers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allWarehouses, setAllWarehouses] = useState([]); 
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, productsRes, warehousesRes] = await Promise.all([
          Axios.get(`${CUSTOMERS}`),
          Axios.get(`${PRODUCTS}`),
          Axios.get(`${WAREHOUSES}`) 
        ]);
        setAllCustomers(customersRes.data.data);
        setAllProducts(productsRes.data.data || productsRes.data); 
        setAllWarehouses(warehousesRes.data.data || warehousesRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const addProductToOrder = (productId) => {
    if (!productId) return;
    const product = allProducts.find(p => String(p.documentId) === String(productId));
    
    if (product && !orderItems.find(item => item.product === product.documentId)) {
      setOrderItems([...orderItems, {
        product: product.documentId,
        title: product.title,
        quantity: 1,
        price: product.price || 0,
        warehouse: "", 
        totalAmount: product.price || 0
      }]);
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...orderItems];
    if (field === 'warehouse') {
        newItems[index][field] = value;
    } else {
        const val = parseFloat(value) || 0;
        newItems[index][field] = val;
        newItems[index].totalAmount = newItems[index].quantity * newItems[index].price;
    }
    setOrderItems(newItems);
  };

  const removeItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const isFormInvalid = !customer || !recipient.trim() || orderItems.length === 0 || orderItems.some(item => !item.warehouse);

  async function submit(e) {
    e.preventDefault();
    if (isFormInvalid) return;

    setLoading(true);
    try {
      const createdItemsPromises = orderItems.map(async (item) => {
        const res = await Axios.post(`${ORDERITEMS}`, {
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

      await Axios.post(`${ORDERS}`, {
        data: {
          customer: { connect: [{ documentId: customer }] },
          recipient: recipient,
          order_items: { connect: itemsIds.map(id => ({ documentId: id })) },
          addTaxes: addTaxes,
          paid: paid,
        },
      });

      navigate("/dashboard/orders");
    } catch (err) {
      console.error("Submission Error:", err);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {loading && <LoadingScreen />}
      
      {/* Header Sticky Bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b px-4 md:px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate("/dashboard/orders")} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-gray-600">
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <h2 className="text-lg font-bold text-gray-800">{t('Create Order')}</h2>
        </div>
        <button form="order-form" type="submit" disabled={isFormInvalid || loading} className={`px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all active:scale-95 ${isFormInvalid ? "bg-gray-300 shadow-none" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"}`}>
          {loading ? t('Saving...') : t('Save Order')}
        </button>
      </div>

      <form id="order-form" onSubmit={submit} className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 grid grid-cols-12 gap-6">
        
        {/* Left Side: Order Info & Items */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          
          {/* Customer & Recipient Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">{t('Customer')} <span className="text-red-500">*</span></label>
              <select value={customer} onChange={(e) => setCustomer(e.target.value)} className="w-full p-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/10 font-medium text-sm">
                <option value="">{t('Select Customer...')}</option>
                {allCustomers.map(u => <option key={u.documentId} value={u.documentId}>{u.name || u.username}</option>)}
              </select>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">{t('Recipient Name')} <span className="text-red-500">*</span></label>
              <input type="text" placeholder={t('Enter recipient name')} value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full p-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/10 font-medium text-sm" required />
            </div>
          </div>

          {/* Product Selection & List Card */}
          <div className="bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 block">{t('Add Items to Order')}</label>
            <select value="" onChange={(e) => addProductToOrder(e.target.value)} className="w-full p-4 bg-blue-50/50 border-2 border-dashed border-blue-100 rounded-2xl outline-none focus:border-blue-300 font-bold text-blue-600 text-sm mb-6 cursor-pointer">
              <option value="" disabled>{t('+ Tap to search and select a product...')}</option>
              {allProducts.map(p => (
                <option key={p.documentId} value={p.documentId}>{p.title} - ({p.price} EGP)</option>
              ))}
            </select>

            {/* Items List (Responsive Card-style for Mobile) */}
            <div className="space-y-4">
              {orderItems.length === 0 ? (
                 <div className="py-12 text-center border-2 border-dashed border-gray-50 rounded-3xl">
                   <FontAwesomeIcon icon={faBoxOpen} className="text-4xl text-gray-100 mb-2" />
                   <p className="text-gray-300 font-medium">{t('No products added yet')}</p>
                 </div>
              ) : (
                orderItems.map((item, index) => (
                  <div key={index} className="bg-gray-50/50 border border-gray-100 p-4 md:p-5 rounded-2xl relative group">
                    <button type="button" onClick={() => removeItem(index)} className="absolute top-4 right-4 text-red-300 hover:text-red-500 transition-colors">
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                    
                    <h4 className="font-bold text-gray-800 mb-4 pr-8 text-sm md:text-base">{item.title}</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Warehouse Selector */}
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5 block">{t('Warehouse')}</label>
                        <select 
                          value={item.warehouse} 
                          onChange={(e) => updateItem(index, 'warehouse', e.target.value)}
                          className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-400"
                        >
                          <option value="">{t('Select Warehouse')}</option>
                          {allWarehouses.map(w => <option key={w.documentId} value={w.documentId}>{w.title}</option>)}
                        </select>
                      </div>

                      {/* Price Input (أهيه رجعت يا غالي) */}
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5 block text-blue-500">{t('Unit Price')}</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={item.price} 
                            onChange={(e) => updateItem(index, 'price', e.target.value)} 
                            className="w-full p-2.5 pl-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-400" 
                          />
                        </div>
                      </div>

                      {/* Quantity & Item Total */}
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5 block">{t('Quantity')}</label>
                          <input 
                            type="number" 
                            value={item.quantity} 
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)} 
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-400 text-center" 
                            min="1" 
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5 block">{t('Total')}</label>
                          <div className="h-[38px] flex items-center justify-center font-black text-xs text-gray-800 bg-gray-100 rounded-xl">
                            {item.totalAmount.toFixed(0)} <span className="ml-1 text-[8px]">EGP</span>
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

        {/* Right Side: Summary Sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24 space-y-6">
            <h3 className="font-black text-gray-800 text-sm flex items-center justify-between">
              Order Summary <FontAwesomeIcon icon={faShoppingCart} className="text-gray-200" />
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-400">{t('Subtotal')}</span>
                <span className="text-gray-700">{orderItems.reduce((acc, curr) => acc + curr.totalAmount, 0).toFixed(2)} EGP</span>
              </div>
              
              <label className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="text-xs font-bold text-gray-600">{t('Add Taxes (14%)')}</span>
                <input type="checkbox" checked={addTaxes} onChange={(e) => setAddTaxes(e.target.checked)} className="w-5 h-5 accent-blue-600 rounded-md" />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="text-xs font-bold text-gray-600">{t('Mark as Paid')}</span>
                <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="w-5 h-5 accent-green-600 rounded-md" />
              </label>
              
              <div className="pt-6 border-t border-dashed border-gray-100 flex flex-col gap-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('Grand Total')}</span>
                <div className="text-3xl font-black text-blue-600 tracking-tighter">
                  {(orderItems.reduce((acc, curr) => acc + curr.totalAmount, 0) * (addTaxes ? 1.14 : 1)).toFixed(2)}
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