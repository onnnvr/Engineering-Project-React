import { useState } from "react";
import { Link } from "react-router-dom";
import { Axios } from "../../../Api/Axios"; 
import { baseUrl, LOGIN } from "../../../Api/Api";
import formImage from "../../../form.jpg"; 
import LoadingScreen from "../../../Components/Loading/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faArrowRight, faRightToBracket } from "@fortawesome/free-solid-svg-icons";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);

    async function Submit(e) {
        e.preventDefault();
        setErr('');
        setLoading(true);
        try {
            let res = await Axios.post(LOGIN, {
                identifier: email, // Strapi يستقبل الإيميل أو اليوزر نيم هنا
                password: password,
            });

            const token = res.data.jwt;
            window.localStorage.setItem("e-commerce", token);
            
            // التوجه للوحة التحكم
            window.location.pathname = "/dashboard";
        } catch (err) {
            setLoading(false);
            if (err.response?.status === 401 || err.response?.status === 400) {
                setErr('البريد الإلكتروني أو كلمة المرور غير صحيحة');
            } else {
                setErr('حدث خطأ في الخادم، حاول لاحقاً');
            }
        }
    }

    return (
        <>
            {loading && <LoadingScreen />}
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-2 sm:p-4">
                <div className="w-full max-w-[900px] bg-[#121212] rounded-3xl overflow-hidden shadow-2xl border border-white/5 flex flex-col md:flex-row shadow-red-900/10">
                    
                    {/* الصورة الجانبية */}
                    <div className="hidden md:block md:w-1/2 relative">
                        <img src={formImage} alt="Login" className="w-full h-full object-cover opacity-40" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-transparent to-transparent"></div>
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-8">
                            <FontAwesomeIcon icon={faRightToBracket} className="text-6xl text-red-600 mb-6 opacity-80" />
                            <h2 className="text-3xl font-black mb-2">مرحباً بعودتك!</h2>
                            <p className="text-gray-400 text-center">سجل دخولك لتكمل رحلتك في عالم المعدات الاحترافية</p>
                        </div>
                    </div>

                    {/* الفورم */}
                    <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-[#121212]" dir="rtl">
                        <div className="mb-10 text-right">
                            <h1 className="text-3xl font-black text-white mb-2">تسجيل الدخول</h1>
                            <p className="text-gray-500 text-sm font-medium">أدخل بياناتك للوصول إلى حسابك</p>
                        </div>

                        <form onSubmit={Submit} className="space-y-5">
                            {/* حقل الإيميل */}
                            <div className="relative group">
                                <FontAwesomeIcon icon={faEnvelope} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-red-600 transition-colors" />
                                <input 
                                    type="email" 
                                    placeholder="البريد الإلكتروني" 
                                    className="input-field-custom" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                />
                            </div>

                            {/* حقل الباسورد */}
                            <div className="relative group">
                                <FontAwesomeIcon icon={faLock} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-red-600 transition-colors" />
                                <input 
                                    type="password" 
                                    placeholder="كلمة السر" 
                                    className="input-field-custom" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    minLength="8"
                                />
                            </div>

                            {err && <div className="text-red-500 text-xs font-bold px-2 animate-pulse">{err}</div>}

                            <button 
                                type="submit" 
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-lg shadow-red-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                <span>دخول</span>
                                <FontAwesomeIcon icon={faArrowRight} className="rotate-180 text-sm" />
                            </button>

                            {/* Google Sign In */}
                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                                <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[#121212] px-2 text-gray-600 tracking-widest font-bold">أو الدخول بواسطة</span></div>
                            </div>

                            <a href={`${baseUrl}/connect/google`} className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-5 h-5" alt="google" />
                                <span className="text-sm">جوجل</span>
                            </a>

                            <p className="text-center text-gray-500 text-sm mt-8">
                                ليس لديك حساب؟ 
                                <Link to="/register" className="text-red-600 font-black hover:underline mr-1 transition-all">أنشئ حساباً الآن</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>

            {/* نفس الستايل الموحد للـ Inputs لضمان التناسق */}
            <style dangerouslySetInnerHTML={{ __html: `
                .input-field-custom {
                    width: 100%;
                    background-color: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 1rem;
                    padding: 1rem 3rem 1rem 1rem;
                    color: white;
                    outline: none;
                    font-size: 1rem;
                    transition: all 0.3s;
                }
                .input-field-custom:focus {
                    border-color: rgba(220, 38, 38, 0.5);
                    background-color: rgba(255, 255, 255, 0.08);
                    box-shadow: 0 0 20px rgba(220, 38, 38, 0.05);
                }
                .input-field-custom::placeholder {
                    color: #4b5563;
                }
            `}} />
        </>
    );
}