import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Axios } from "../../../Api/Axios"; 
import { baseUrl, REGISTER } from "../../../Api/Api";
import formImage from "../../../form.jpg"; 
import LoadingScreen from "../../../Components/Loading/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUser, faArrowRight, faIdCard } from "@fortawesome/free-solid-svg-icons";



export default function SignUp() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);



    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };
    
    console.log(formData)
    
    async function Submit(e) {
        e.preventDefault();
        setErr('');

        if (formData.password !== formData.confirmPassword) {
            setErr('كلمات السر غير متطابقة!');
            return;
        }

        setLoading(true);
        try {
            const res = await Axios.post(REGISTER, {
                username: `${formData.username}:::${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                password: formData.password,
            });

            const token = res.data.jwt;
            window.localStorage.setItem("e-commerce", token);
            window.location.pathname = "/";
        } catch (error) {
            setLoading(false);
            console.log(error)
            if (error.response?.data?.error?.message) {
                setErr(error.response.data.error.message);
            } else {
                setErr('حدث خطأ في الاتصال بالسيرفر');
            }
        }
    }

    return (
        <>
            {loading && <LoadingScreen />}
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-2 sm:p-4">
                <div className="w-full max-w-[1000px] bg-[#121212] rounded-3xl overflow-hidden shadow-2xl border border-white/5 flex flex-col md:flex-row shadow-red-900/10 transition-all duration-500">
                    
                    {/* الصورة الجانبية - مخفية في الموبايل لتقليل المساحة */}
                    <div className="hidden md:block md:w-1/2 relative">
                        <img src={formImage} alt="Tools" className="w-full h-full object-cover opacity-40" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-transparent to-transparent"></div>
                    </div>

                    {/* الفورم */}
                    <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-center" dir="rtl">
                        <div className="mb-6 sm:mb-8 text-right">
                            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">إنشاء حساب</h1>
                            <p className="text-gray-500 text-xs sm:text-sm font-medium">ابدأ رحلتك معنا واحصل على عروض حصرية</p>
                        </div>

                        <form onSubmit={Submit} className="space-y-3 sm:space-y-4">
                            {/* الاسم الأول والثاني في صف واحد */}
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className="relative group">
                                    <FontAwesomeIcon icon={faIdCard} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm group-focus-within:text-red-600 transition-colors" />
                                    <input type="text" id="firstName" placeholder="الأول" className="input-field-custom" value={formData.firstName} onChange={handleChange} required />
                                </div>
                                <div className="relative group">
                                    <FontAwesomeIcon icon={faIdCard} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm group-focus-within:text-red-600 transition-colors" />
                                    <input type="text" id="lastName" placeholder="الأخير" className="input-field-custom" value={formData.lastName} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="relative group">
                                <FontAwesomeIcon icon={faUser} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm group-focus-within:text-red-600 transition-colors" />
                                <input type="text" id="username" placeholder="اسم المستخدم" className="input-field-custom" value={formData.username} onChange={handleChange} required />
                            </div>

                            <div className="relative group">
                                <FontAwesomeIcon icon={faEnvelope} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm group-focus-within:text-red-600 transition-colors" />
                                <input type="email" id="email" placeholder="البريد الإلكتروني" className="input-field-custom" value={formData.email} onChange={handleChange} required />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="relative group">
                                    <FontAwesomeIcon icon={faLock} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm group-focus-within:text-red-600 transition-colors" />
                                    <input type="password" id="password" placeholder="كلمة السر" className="input-field-custom" value={formData.password} onChange={handleChange} required minLength="8" />
                                </div>
                                <div className="relative group">
                                    <FontAwesomeIcon icon={faLock} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm group-focus-within:text-red-600 transition-colors" />
                                    <input type="password" id="confirmPassword" placeholder="تأكيد السر" className="input-field-custom" value={formData.confirmPassword} onChange={handleChange} required />
                                </div>
                            </div>

                            {err && <div className="text-red-500 text-[10px] sm:text-xs font-bold px-2">{err}</div>}

                            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 sm:py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] text-sm sm:text-base mt-2">
                                إنشاء حساب جديد
                            </button>

                            {/* تسجيل جوجل المحدث */}
                            <div className="relative py-2 sm:py-4">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#121212] px-2 text-gray-500 font-bold tracking-widest">أو بواسطة</span></div>
                            </div>

                            <a href="http://localhost:1337/api/connect/google?callback=http://localhost:3000/connect/google/redirect" className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-5 h-5" alt="google" />
                                <span className="text-xs sm:text-sm">سجل دخولك بجوجل</span>
                            </a>

                            <p className="text-center text-gray-500 text-[10px] sm:text-xs mt-4">
                                لديك حساب بالفعل؟ 
                                <Link to="/login" className="text-red-600 font-black hover:underline mr-1">دخول</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>

            {/* CSS مخصص للـ Inputs لتقليل التكرار */}
            <style dangerouslySetInnerHTML={{ __html: `
                .input-field-custom {
                    width: 100%;
                    background-color: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.75rem;
                    padding: 0.75rem 2.75rem 0.75rem 1rem;
                    color: white;
                    outline: none;
                    font-size: 0.875rem;
                    transition: all 0.3s;
                }
                .input-field-custom:focus {
                    border-color: rgba(220, 38, 38, 0.5);
                    background-color: rgba(255, 255, 255, 0.08);
                }
                @media (min-width: 640px) {
                    .input-field-custom {
                        padding: 1rem 3rem 1rem 1rem;
                        font-size: 1rem;
                    }
                }
            `}} />
        </>
    );
}