import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Axios } from "../../../Api/Axios";
import { USERS } from "../../../Api/Api";
import LoadingScreen from "../../../Components/Loading/Loading";
import { useNavigate } from "react-router-dom";

export default function AddUser() {
    const { t } = useTranslation();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const navigate = useNavigate();

    async function submit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            await Axios.post(`${USERS}`, { 
                username: username, 
                email: email, 
                password: password, 
                role: role, 
                name: firstName + " " + lastName 
            });
            navigate("/dashboard/users");
        } catch (err) {
            setLoading(false);
            console.log(err);
        }
    }

    const isDisabled = username.length < 1 || email.length < 5 || password.length < 8 || role === "" || firstName.length < 1 || lastName.length < 1;

    return (
        <div className="min-h-full">
            {loading && <LoadingScreen />}

            {/* HEADER AREA */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{t("createNewUser")}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t("fillInfoAddUser")}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate("/dashboard/users")} className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
                        {t("discard")}
                    </button>
                    <button 
                        form="user-form" 
                        type="submit" 
                        disabled={isDisabled}
                        className={`px-8 py-2.5 text-sm font-semibold rounded-xl text-white shadow-lg transition-all ${isDisabled ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"}`}
                    >
                        {t("saveUser")}
                    </button>
                </div>
            </div>

            {/* MAIN FORM */}
            <form id="user-form" onSubmit={submit} className="grid grid-cols-12 gap-6">
                {/* LEFT: Personal Info */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-4">{t("personalInformation")}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">{t("firstName")}</label>
                                <input type="text" placeholder={t("firstNamePlaceholder")}
                                    value={firstName} onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">{t("lastName")}</label>
                                <input type="text" placeholder={t("lastNamePlaceholder")}
                                    value={lastName} onChange={(e) => setLastName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-4">{t("loginCredentials")}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">{t("username")}</label>
                                <input type="text" placeholder={t("usernamePlaceholder")}
                                    value={username} onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">{t("emailAddress")}</label>
                                <input type="email" placeholder={t("emailPlaceholder")}
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">{t("password")}</label>
                                <input type="password" placeholder={t("passwordPlaceholder")}
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Permissions */}
                <div className="col-span-12 lg:col-span-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-4">{t("roleAccess")}</h3>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t("assignRole")}</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                            <option value="" disabled>{t("selectRole")}</option>
                            <option value="3">{t("user")}</option>
                            <option value="4">{t("admin")}</option>
                            <option value="5">{t("employee")}</option>
                        </select>
                        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                            <p className="text-xs text-blue-700 leading-relaxed">
                                <strong>{t("note")}</strong> {t("adminNote")}
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}