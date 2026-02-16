import { Outlet } from "react-router-dom";
import NavBar from "../../Components/Website/NavBar";
import Footer from "../../Components/Website/Footer";

export default function Website() {
    return (
        <>
            <NavBar />
            <Outlet />
            <Footer />
        </>
    )
}