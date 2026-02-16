import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Axios } from "../../../Api/Axios";
import { CUSTOMERS, USERS } from "../../../Api/Api";
import LoadingScreen from "../../../Components/Loading/Loading";
import { useNavigate } from "react-router-dom";

export default function AddCustomer() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();


  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await Axios.post(`${CUSTOMERS}`, { data: { name: name, type: type, number: number }});
      navigate("/dashboard/customers");
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  }

  const isDisabled =
    name.length < 1 || type === "" ;

  return (
    <>
      {loading && <LoadingScreen />}
      <div className="min-h-screen bg-gray-50/50">
        {/* TOP BAR */}
        <div className="bg-white border-b px-4 md:px-6 py-4 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-800 self-start md:self-center">{t('Add New Customer')}</h2>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => navigate("/dashboard/customers")}
              className="flex-1 md:px-6 py-2.5 text-sm font-bold rounded-xl border bg-white hover:bg-gray-50 transition-colors"
            >
              {t('Discard')}
            </button>
            <button
              form="customer-form"
              type="submit"
              disabled={isDisabled}
              className={`flex-1 md:px-8 py-2.5 text-sm font-bold rounded-xl text-white shadow-lg transition-all
              ${isDisabled ? "bg-blue-300 shadow-none cursor-not-allowed" : "bg-blue-600 shadow-blue-100 hover:bg-blue-700 active:scale-95"}`}
            >
              {t('Save Customer')}
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <form
          id="customer-form"
          onSubmit={submit}
          className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          {/* LEFT COLUMN - Main Info */}
          <div className="md:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <label className="block text-xs font-black text-gray-400 uppercase mb-3">{t('Customer Full Name')}</label>
              <input
                type="text"
                placeholder={t('Ex: John Doe')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <label className="block text-xs font-black text-gray-400 uppercase mb-3">{t('Phone Number')}</label>
              <input
                type="text"
                placeholder={t('01xxxxxxxxx')}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* RIGHT COLUMN - Categorization */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <label className="block text-xs font-black text-gray-400 uppercase mb-3">{t('Customer Type')}</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-gray-700 appearance-none"
              >
                <option value="" disabled>{t('Select Type')}</option>
                <option value="person">{t('Person')}</option>
                <option value="company">{t('Company')}</option>
                <option value="trader">{t('Trader')}</option>
              </select>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
