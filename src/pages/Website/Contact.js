import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faLocationArrow, 
    faClock, 
    faEnvelope, 
    faPhone 
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsappSquare } from '@fortawesome/free-brands-svg-icons';

const Contact = () => {
    return (
        <section className="bg-[#f6f6f6] min-h-screen pt-32 pb-20 text-center" id="contact">
            <div className="container mx-auto px-4">
                
                {/* العنوان الرئيسي */}
                <h2 className="text-black text-[50px] md:text-[70px] font-bold m-0 opacity-80 tracking-[5px] mb-12">
                    : تواصل معنا
                </h2>

                {/* العناصر تحت بعضها (عمود واحد) */}
                <div className="flex flex-col items-center gap-12 py-10">
                    
                    {/* الموقع */}
                    <div className="flex flex-col items-center">
                        <FontAwesomeIcon icon={faLocationArrow} className="text-[#a30000] text-[30px] mb-2" />
                        <h3 className="font-extrabold text-[22px] my-[10px] text-black">العنوان</h3>
                        <p className="text-[#777] text-[16px] leading-[1.8] max-w-[400px]">
                            ٥ شارع المعلم غالي متفرع من شارع ابي الدرداء - المنشية الصغيرة - الاسكندرية - مصر
                        </p>
                    </div>

                    {/* المواعيد */}
                    <div className="flex flex-col items-center">
                        <FontAwesomeIcon icon={faClock} className="text-[#a30000] text-[30px] mb-2" />
                        <h3 className="font-extrabold text-[22px] my-[10px] text-black">مواعيد العمل</h3>
                        <p className="text-[#777] text-[16px] leading-[1.8]">
                            جميع ايام الاسبوع من 9ل9
                            <br /> ماعدا يوم الجمعة من 2ل9
                            <br /> ويوم الاحد مغلق.
                        </p>
                    </div>

                    {/* الايميل */}
                    <div className="flex flex-col items-center">
                        <FontAwesomeIcon icon={faEnvelope} className="text-[#a30000] text-[30px] mb-2" />
                        <h3 className="font-extrabold text-[22px] my-[10px] text-black">البريد الإلكتروني</h3>
                        <p className="text-[#777] text-[16px] leading-[1.8]">mohamed.omar478@gmail.com</p>
                    </div>

                    {/* التليفون */}
                    <div className="flex flex-col items-center">
                        <FontAwesomeIcon icon={faPhone} className="text-[#a30000] text-[30px] mb-2" />
                        <h3 className="font-extrabold text-[22px] my-[10px] text-black">رقم الهاتف</h3>
                        <p className="text-[#777] text-[16px] leading-[1.8]" dir="ltr">
                            03 481 0245
                            <br /> +20 100 6658220
                        </p>
                    </div>

                    {/* واتس اب */}
                    <div className="flex flex-col items-center">
                        <FontAwesomeIcon icon={faWhatsappSquare} className="text-[#a30000] text-[30px] mb-2" />
                        <h3 className="font-extrabold text-[22px] my-[10px] text-black">واتس اب</h3>
                        <p className="text-[#777] text-[16px] leading-[1.8]" dir="ltr">+20 100 6658220</p>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Contact;