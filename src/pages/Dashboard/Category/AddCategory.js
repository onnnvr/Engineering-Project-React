import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Axios } from "../../../Api/Axios";
import { CATEGORIES, PRODUCTS } from "../../../Api/Api";
import LoadingScreen from "../../../Components/Loading/Loading";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faCloudUploadAlt, faSearch, faCheckCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function AddCategory() {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [imageId, setImageId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  console.log(allProducts)

  useEffect(() => {
    Axios.get(`${PRODUCTS}?filters[title][$contains]=${searchQuery}&pagination[pageSize]=100`).then(res => {setAllProducts(res.data.data || res.data); console.log(res.data.data)}).catch(err => console.log(err));
  }, [searchQuery]);

  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setUploading(true);
    const formData = new FormData();
    formData.append("files", file);
    try {
      const res = await Axios.post("/upload", formData);
      setImageId(res.data[0].id);
      setUploading(false);
    } catch (err) {
      setUploading(false);
      alert("Upload failed");
    }
  }

  const handleCheckboxChange = (id) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await Axios.post(`${CATEGORIES}`, { data: { title, products: selectedProducts, image: imageId } });
      nav("/dashboard/categories");
    } catch (err) { setLoading(false); }
  }

  return (
    <div className="bg-gray-50/50 min-h-screen pb-20">
      {loading && <LoadingScreen />}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b px-4 md:px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => nav(-1)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"><FontAwesomeIcon icon={faChevronLeft} /></button>
          <h2 className="text-lg font-bold text-gray-800">{t('Add Category')}</h2>
        </div>
        <button type="submit" form="add-cat-form" disabled={!title || uploading} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg disabled:bg-gray-300 transition-all active:scale-95 text-sm">
          {uploading ? t('Wait...') : t('Create')}
        </button>
      </div>

      <form id="add-cat-form" onSubmit={submit} className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">{t('General Info')}</label>
            <input type="text" placeholder={t('e.g. Winter Essentials')} value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/10 outline-none text-base font-medium" />
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 block">{t('Cover Media')}</label>
            <div className={`relative h-64 md:h-96 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${image ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200 bg-gray-50/50 hover:bg-blue-50/20'}`}>
              <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              {uploading ? <FontAwesomeIcon icon={faSpinner} className="text-3xl text-blue-600 animate-spin" /> : 
                image ? <div className="text-center px-4"><FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-blue-500 mb-2"/><p className="text-sm font-bold text-gray-700 truncate max-w-xs">{image.name}</p></div> :
                <div className="text-center"><FontAwesomeIcon icon={faCloudUploadAlt} className="text-4xl text-gray-300 mb-2"/><p className="text-sm font-bold text-gray-400">{t('Tap to upload category image')}</p></div>
              }
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm h-fit sticky top-24">
            <h4 className="text-sm font-bold text-gray-800 mb-4 flex justify-between">{t('Link Products')} <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg text-[10px]">{selectedProducts.length}</span></h4>
            <div className="relative mb-4">
               <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
               <input type="text" placeholder={t('Search...')} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 py-2.5 bg-gray-50 border-none rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500/10" />
            </div>
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
              {allProducts.map(prod => (
                <label key={prod.id} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer border transition-all ${selectedProducts.includes(prod.id) ? 'bg-blue-50 border-blue-100' : 'bg-white border-transparent'}`}>
                  <input type="checkbox" className="hidden" checked={selectedProducts.includes(prod.id)} onChange={() => handleCheckboxChange(prod.id)} />
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${selectedProducts.includes(prod.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                    {selectedProducts.includes(prod.id) && <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />}
                  </div>
                  <span className="text-xs font-medium text-gray-600">{prod.title || prod.attributes?.title}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}