import { Outlet } from "react-router-dom";
import SideBar from "../../Components/Dashboard/SideBar";
import TopBar from "../../Components/Dashboard/TopBar";

export default function Dashboard() {
    return (
        <div className="flex flex-col h-screen overflow-hidden relative">
            {/* الشريط العلوي ثابت */}
            <TopBar />
            
            <div className="flex flex-1 mt-[70px] overflow-hidden">
                {/* الشريط الجانبي */}
                <SideBar />
                
                {/* محتوى الصفحة المتغير */}
                <main className="flex-1 bg-[#f4f7fe] overflow-y-auto p-4 md:p-8">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}