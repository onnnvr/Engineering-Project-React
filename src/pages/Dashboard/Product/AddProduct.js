import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Axios } from "../../../Api/Axios";
import { CATEGORIES, PRODUCTS } from "../../../Api/Api";
import LoadingScreen from "../../../Components/Loading/Loading";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt, faChevronLeft, faTrashAlt, faBarcode, faTags, faGlobe, faWarehouse, faPlus, faMinus, faTimes } from "@fortawesome/free-solid-svg-icons";
import Papa from "papaparse";

export default function AddProduct() {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [barcode, setBarcode] = useState("");
  const [brand, setBrand] = useState("");
  const [showOnWebsite, setShowOnWebsite] = useState(true);
  
  const [images, setImages] = useState([]);
  const [uploadedImageIds, setUploadedImageIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSent, setHasSent] = useState(false);
  const [id, setId] = useState();
  const [documentId, setDocumentId] = useState();

  const [allWarehouses, setAllWarehouses] = useState([]);
  const [initialStock, setInitialStock] = useState({});

  const nav = useNavigate();
  const uploadImages = useRef(null);
  const progress = useRef([]);
  const j = useRef(-1);

  useEffect(() => {
    Axios.get(`${CATEGORIES}?pagination[pageSize]=100`).then((res) => setCategories(res.data.data)).catch(console.log);
    Axios.get('/warehouses').then((res) => setAllWarehouses(res.data.data)).catch(console.log);
  }, []);

  async function sendDummyForm(initialCatId) {
    try {
      let res = await Axios.post(`${PRODUCTS}`, {
        data: { 
          title: "Draft Product", 
          categories: [initialCatId],
          description: "Pending...", 
          price: 0, 
          slug: `draft-${Date.now()}`,
          productStatus: "draft",
          isTemporary: true 
        },
      });
      setId(res.data.data.id); 
      setDocumentId(res.data.data.documentId);
      setHasSent(true);
    } catch (err) { console.log(err); }
  }

  function handleCategoryChange(e) {
    const catId = e.target.value;
    if (!selectedCategories.includes(catId)) {
        const updatedCats = [...selectedCategories, catId];
        setSelectedCategories(updatedCats);
        if (!hasSent) {
            sendDummyForm(catId);
        }
    }
  }

  const removeCategory = (catId) => {
    setSelectedCategories(prev => prev.filter(id => id !== catId));
  };

  const adjustLocalStock = (whId, amount) => {
    if (!hasSent) return;
    setInitialStock(prev => ({
      ...prev,
      [whId]: Math.max(0, (prev[whId] || 0) + amount)
    }));
  };

  async function HandleImagesChange(e) {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    for (let file of files) {
      j.current++;
      const currentIndex = j.current;
      const formData = new FormData();
      formData.append("files", file);
      formData.append("ref", "api::product.product");
      formData.append("refId", id);
      formData.append("field", "images");
      try {
        let res = await Axios.post(`/upload`, formData, {
          onUploadProgress: (p) => {
            let percent = Math.round((p.loaded / p.total) * 100);
            if(progress.current[currentIndex]) progress.current[currentIndex].style.width = `${percent}%`;
          },
        });
        const newImageId = res.data[0].id;
        setUploadedImageIds(prev => [...prev, newImageId]);
      } catch (err) { console.log(err); }
    }
  }

  async function handleImageDelete(index, image) {
    const imageId = uploadedImageIds[index];
    try {
      await Axios.delete(`/upload/files/${imageId}`);
      setImages((prev) => prev.filter((img) => img !== image));
      setUploadedImageIds((prev) => prev.filter((id) => id !== imageId));
      j.current--;
    } catch (err) { console.log(err); }
  }

  async function submit(e) {
    e.preventDefault();
    if (selectedCategories.length === 0) { alert("Please select at least one category"); return; }
    setLoading(true);
    try {
      await Axios.put(`${PRODUCTS}/${documentId}`, {
        data: {
          categories: selectedCategories,
          title, description, price, barcode, brand, showOnWebsite,
          images: uploadedImageIds,
          slug: title.replace(/\s+/g, '-').toLowerCase(),
          productStatus: "published",
          isTemporary: false,
        },
      });
      const inventoryPromises = Object.entries(initialStock).map(([whId, qty]) => {
        if (qty > 0) {
          return Axios.post(`/inventories`, {
            data: { quantity: qty, product: {connect : [{documentId: documentId}]}, warehouse: whId }
          });
        }
        return null;
      });
      await Promise.all(inventoryPromises.filter(p => p !== null));
      nav("/dashboard/products");
    } catch (err) { setLoading(false); console.log(err); }
  }

  const getCategoryName = (catId) => {
    return categories.find(c => c.id.toString() === catId.toString())?.title || "";
  };

  async function handleShopifyImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        for (const item of results.data) {
          try {
            let resDraft = await Axios.post(`${PRODUCTS}`, {
              data: { title: item.Title || "Shopify Product", productStatus: "draft", isTemporary: true },
            });
            await Axios.put(`${PRODUCTS}/${resDraft.data.data.documentId}`, {
              data: {
                title: item.Title, description: item["Body (HTML)"],
                price: item["Variant Price"] ? parseFloat(item["Variant Price"]) : 0,
                barcode: item["Variant Barcode"],
                slug: (item.Title || "").replace(/\s+/g, '-').toLowerCase() + "-" + Date.now(),
                productStatus: "published", isTemporary: false,
              },
            });
          } catch (err) { console.error(err); }
        }
        setLoading(false); nav("/dashboard/products");
      },
    });
  }

  return (
    <div className="bg-gray-50/50 min-h-screen pb-24 text-left font-sans">
      {loading && <LoadingScreen />}
      
      {/* Responsive Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3 self-start sm:self-center">
            <button onClick={() => nav(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><FontAwesomeIcon icon={faChevronLeft} /></button>
            <h2 className="text-xl font-black text-gray-800 tracking-tight">{t('New Product')}</h2>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="flex-1 sm:flex-none text-center cursor-pointer px-4 py-2.5 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all text-xs">
            <FontAwesomeIcon icon={faCloudUploadAlt} className="mr-2" />
            {t('Import CSV')}
            <input type="file" accept=".csv" hidden onChange={handleShopifyImport} />
          </label>
          <button
            form="product-form"
            type="submit"
            disabled={!title || !hasSent || selectedCategories.length === 0}
            className="flex-1 sm:flex-none px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:bg-gray-300 transition-all text-xs"
          >
            {t('Publish')}
          </button>
        </div>
      </div>

      <form id="product-form" onSubmit={submit} className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 order-2 lg:order-1 space-y-6">
          {/* Main Info Box */}
          <div className="bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t('General Information')}</label>
            <input
                disabled={!hasSent} value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder={hasSent ? t('Product Title') : t('Select a category to enable form...')}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-lg font-bold disabled:opacity-50"
            />
            <textarea
                disabled={!hasSent} value={description} onChange={(e) => setDescription(e.target.value)}
                rows={5} placeholder={t('Describe your product...')}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm disabled:opacity-50"
            />
          </div>

          {/* Stock Levels Box */}
          <div className={`bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-sm transition-opacity ${!hasSent ? "opacity-40 grayscale" : "opacity-100"}`}>
            <div className="flex items-center gap-2 mb-6">
                <FontAwesomeIcon icon={faWarehouse} className="text-blue-600" />
                <h3 className="font-bold text-gray-800 tracking-tight">{t('Stock Levels')}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allWarehouses.map(wh => (
                    <div key={wh.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <span className="font-bold text-gray-600 text-sm">{wh.title}</span>
                        <div className="flex items-center gap-3">
                            <button disabled={!hasSent} type="button" onClick={() => adjustLocalStock(wh.id, -1)} className="w-8 h-8 bg-white shadow-sm rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all"><FontAwesomeIcon icon={faMinus} size="xs"/></button>
                            <span className="w-6 text-center font-black text-blue-600">{initialStock[wh.id] || 0}</span>
                            <button disabled={!hasSent} type="button" onClick={() => adjustLocalStock(wh.id, 1)} className="w-8 h-8 bg-white shadow-sm rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><FontAwesomeIcon icon={faPlus} size="xs"/></button>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* Image Upload Box */}
          <div className="bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black text-blue-600 mb-6 uppercase tracking-widest">{t('Gallery')}</h3>
            <input hidden disabled={!hasSent} ref={uploadImages} onChange={HandleImagesChange} type="file" multiple />
            <div onClick={() => hasSent && uploadImages.current.click()} className={`group border-2 border-dashed rounded-3xl p-8 md:p-12 text-center transition-all ${hasSent ? "border-blue-200 bg-blue-50/20 cursor-pointer hover:border-blue-400" : "border-gray-200 opacity-30 cursor-not-allowed"}`}>
                <FontAwesomeIcon icon={faCloudUploadAlt} className="text-blue-600 text-3xl mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-gray-700 font-bold">{t('Upload Product Images')}</p>
                <p className="text-gray-400 text-[10px] mt-1 uppercase tracking-tighter">{t('Category selection required first')}</p>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((img, i) => (
                    <div key={i} className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <img src={URL.createObjectURL(img)} className="w-14 h-14 rounded-xl object-cover shadow-sm" alt="" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate text-gray-700">{img.name}</p>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                                <div ref={(el) => (progress.current[i] = el)} className="h-full bg-blue-600 w-0 transition-all duration-500" />
                            </div>
                        </div>
                        <button type="button" onClick={() => handleImageDelete(i, img)} className="text-red-300 hover:text-red-500 transition-colors px-2"><FontAwesomeIcon icon={faTrashAlt} /></button>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Sidebar Settings (Orders first on mobile) */}
        <div className="lg:col-span-4 order-1 lg:order-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-blue-200 shadow-lg shadow-blue-50 space-y-4">
            <label className="text-[10px] font-black text-blue-600 mb-2 block uppercase tracking-widest italic">{t('Step 1: Select Category')}</label>
            <select onChange={handleCategoryChange} value="" className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl outline-none font-bold text-gray-800 focus:ring-2 focus:ring-blue-500/20">
              <option value="" disabled>{t('Choose...')}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <div className="flex flex-wrap gap-2">
                {selectedCategories.map(catId => (
                    <div key={catId} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 border border-blue-100">
                        {getCategoryName(catId)}
                        <button type="button" onClick={() => removeCategory(catId)} className="hover:text-red-500 transition-colors"><FontAwesomeIcon icon={faTimes} /></button>
                    </div>
                ))}
            </div>
          </div>

          <div className={`bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 transition-opacity ${!hasSent ? "opacity-40 grayscale" : "opacity-100"}`}>
            <div>
                <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">{t('Brand')}</label>
                <div className="relative">
                    <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder={t('Nike')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold" />
                    <FontAwesomeIcon icon={faTags} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
            </div>
            <div>
                <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">{t('Pricing ($)')}</label>
                <input disabled={!hasSent} type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={t('0.00')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-black text-blue-600 text-2xl" />
            </div>
            <div>
                <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">{t('Barcode')}</label>
                <div className="relative">
                    <input disabled={!hasSent} value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder={t('SKU-...')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm" />
                    <FontAwesomeIcon icon={faBarcode} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-sm font-bold text-gray-700">{t('Live on Site')}</span>
                <label className={`relative inline-flex items-center ${hasSent ? "cursor-pointer" : "cursor-not-allowed"}`}>
                    <input disabled={!hasSent} type="checkbox" checked={showOnWebsite} onChange={(e) => setShowOnWebsite(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}