import { LOGOUT } from "../../../Api/Api";
import { Axios } from "../../../Api/Axios";

export default function Logout() {

    async function logout() {
        try {
            const res = await Axios.post(`${LOGOUT}`).then((data) => console.log(data));
            window.localStorage.removeItem("e-commerce")
            window.location.pathname = "/login"
        }catch(err){
            console.log(err)
        }
    }

    return <button className="cursor-pointer w-full" onClick={logout}>Log Out</button>
} 