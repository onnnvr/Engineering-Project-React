import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Axios } from "../../../Api/Axios";
import { TRADERS } from "../../../Api/Api";
import LoadingScreen from "../../../Components/Loading/Loading";
import { useNavigate } from "react-router-dom";

export default function AddTrader() {
    const { t } = useTranslation();
    const [name, setName] = useState("");
    const [number, setNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function submit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            await Axios.post(`${TRADERS}`, { data: { name: name, number: number } });
            navigate("/dashboard/traders");
        } catch (err) {
            setLoading(false);
            console.log(err);
        }
    }

    const isDisabled = name.length < 1;

    return (
        <>
            {loading && <LoadingScreen />}
            <div className="min-h-screen bg-gray-50/50">
                {/* TOP BAR */}
                <div className="bg-white border-b px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                    <h2 className="text-lg font-bold text-gray-800">{t('Add New Trader')}</h2>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/traders")}
                            className="px-4 py-2 text-sm font-bold rounded-xl border bg-white text-gray-600 hover:bg-gray-50 transition-all"
                        >
                            {t('Discard')}
                        </button>
                        <button
                            form="trader-form"
                            type="submit"
                            disabled={isDisabled}
                            className={`px-6 py-2 text-sm font-bold rounded-xl text-white shadow-lg transition-all
                            ${isDisabled ? "bg-blue-300 cursor-not-allowed shadow-none" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"}`}
                        >
                            {t('Save Trader')}
                        </button>
                    </div>
                </div>

                {/* CONTENT */}
                <form
                    id="trader-form"
                    onSubmit={submit}
                    className="max-w-4xl mx-auto px-4 md:px-6 py-8"
                >
                    <div className="space-y-6">
                        {/* Name Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                {t('Trader Full Name')}
                            </label>
                            <input
                                type="text"
                                placeholder={t('Enter trader name')}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            />
                        </div>

                        {/* Number Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                {t('Contact Number')}
                            </label>
                            <input
                                type="text"
                                placeholder={t('01xxxxxxxxx')}
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}