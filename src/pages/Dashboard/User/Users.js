import { useEffect, useState } from "react";
import { MYUSER, USER, USERS } from "../../../Api/Api";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDeleteLeft, faPenToSquare, faPlus, faSearch, faUserCircle, faEnvelope, faShieldAlt } from "@fortawesome/free-solid-svg-icons";
import { Axios } from "../../../Api/Axios";
import PaginatedItems from "../../../Components/Dashboard/Pagination";
import { useTranslation } from "react-i18next";

export default function Users() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [dataCame, setDataCame] = useState(false);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const navigate = useNavigate();
  const dataToShow = searchResults.length > 0 ? searchResults : users;


  // جلب بيانات المستخدم الحالي
  useEffect(() => {
    Axios.get(`${MYUSER}?populate=role`).then((data) => setCurrentUser(data.data));
  }, []);

  // جلب المستخدمين مع تفعيل الـ Pagination الفعلي
  useEffect(() => {
    setDataCame(false); // لإظهار الـ Loading عند كل نقلة صفحة
    // ملاحظة: تم إضافة page و limit في الطلب ليعمل الـ Pagination برمجياً وليس شكلياً فقط
    Axios.get(`${USERS}?populate=*`)
      .then((res) => {
        setUsers(res.data);
        // تأكد أن الـ API يرسل إجمالي العناصر، إذا لم يتوفر نستخدم طول المصفوفة
      })
      .then(() => setDataCame(true))
      .catch((err) => console.log(err));
  }, []); // إعادة الطلب عند تغيير الصفحة أو العدد

  async function handleDelete(id, e) {
    e.stopPropagation();
    try {
      await Axios.delete(`${USER}/${id}`);
      // يفضل تحديث الـ State بدلاً من عمل Refresh كامل للصفحة
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.log(err);
    }
  }

  async function getSearchedData() {
    try {
      const res = await Axios.post(`${USER}/search?name=${search}`);
      setSearchResults(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    const delay = setTimeout(() => {
      search.length > 0 ? getSearchedData() : setSearchResults([]);
    }, 500);
    return () => clearTimeout(delay);
  }, [search]);


  const getRoleBadge = (roleName) => {
    const roles = {
      Admin: "bg-red-50 text-red-600 border-red-100",
      Employee: "bg-blue-50 text-blue-600 border-blue-100",
      User: "bg-green-50 text-green-600 border-green-100",
      Writer: "bg-purple-50 text-purple-600 border-purple-100",
    };
    return roles[roleName] || "bg-gray-50 text-gray-600 border-gray-100";
  };

  // --- Mobile Cards View ---
  const mobileCards = dataToShow.map((user, index) => (
    <div 
      key={index} 
      onClick={() => navigate(`/dashboard/users/${user.id}`)}
      className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-3 block xl:hidden active:bg-gray-50 transition-colors"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">
              {user.username === currentUser.username ? `${user.name} (${t("you")})` : user.name}
            </h4>
            <p className="text-xs text-gray-400">@{user.username}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-md border text-[10px] font-bold uppercase ${getRoleBadge(user.role?.name)}`}>
          {t(user.role?.name?.toLowerCase() || "user")}
        </span>
      </div>
      
      <div className="space-y-2 border-t pt-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <FontAwesomeIcon icon={faEnvelope} className="w-3" />
          {user.email}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => navigate(`/dashboard/users/${user.id}`)} className="text-blue-600 text-sm font-medium">{t("edit")}</button>
        {user.id !== currentUser.id && (
          <button onClick={(e) => handleDelete(user.id, e)} className="text-red-500 text-sm font-medium">{t("delete")}</button>
        )}
      </div>
    </div>
  ));


  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 xl:p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl xl:text-2xl font-bold text-gray-800">{t("users")}</h2>
          <p className="text-xs xl:text-sm text-gray-500">{t("manageTeamMembers")}</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/user/add")}
          className="p-3 xl:px-6 xl:py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <FontAwesomeIcon icon={faPlus} className="xl:mr-2" />
          <span className="hidden xl:inline">{t("addUser")}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder={t("searchByName")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm"
        />
      </div>

      {/* Desktop Table View */}
      <div className="hidden xl:block bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100 font-bold text-gray-400 text-[12px] uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">{t("fullName")}</th>
              <th className="px-6 py-4">{t("username")}</th>
              <th className="px-6 py-4">{t("email")}</th>
              <th className="px-6 py-4">{t("role")}</th>
              <th className="px-6 py-4 text-right">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {dataToShow.map((user, index) => (
              <tr key={index} onClick={() => navigate(`/dashboard/users/${user.id}`)} className="hover:bg-blue-50/30 cursor-pointer transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{user.name?.charAt(0)}</div>
                  <span className="text-sm font-semibold text-gray-700">{user.username === currentUser.username ? `${user.name} (${t("you")})` : user.name}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">@{user.username}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase ${getRoleBadge(user.role?.name)}`}>{t(user.role?.name?.toLowerCase() || "user")}</span>
                </td>
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => navigate(`/dashboard/users/${user.id}`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2"><FontAwesomeIcon icon={faPenToSquare} /></button>
                  {user.id !== currentUser.id && (
                    <button onClick={(e) => handleDelete(user.id, e)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><FontAwesomeIcon icon={faDeleteLeft} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="xl:hidden">
        {!dataCame ? (
          <div className="text-center py-10 text-gray-400 text-sm">{t("loadingUsers")}</div>
        ) : dataToShow.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">{t("noUsersFound")}</div>
        ) : mobileCards}
      </div>
    </div>
  );
}