import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/Website/HomePage";
import Login from "./pages/Auth/AuthOperations/Login";
import SignUp from "./pages/Auth/AuthOperations/SignUp";
import Users from "./pages/Dashboard/User/Users";
import GoogleCallBack from "./pages/Auth/AuthOperations/GoogleCallBack";
import Dashboard from "./pages/Dashboard/Dahboard";
import RequireAuth from "./pages/Auth/Protecting/RequireAuth";
import User from "./pages/Dashboard/User/User";
import AddUser from "./pages/Dashboard/User/AddUser";
import Err404 from "./pages/Auth/Errors/404";
import RequireBack from "./pages/Auth/Protecting/RequireBack";
import Categories from "./pages/Dashboard/Category/Categories";
import AddCategory from "./pages/Dashboard/Category/AddCategory";
import Category from "./pages/Dashboard/Category/Category";
import Products from "./pages/Dashboard/Product/Products";
import AddProduct from "./pages/Dashboard/Product/AddProduct";
import Product from "./pages/Dashboard/Product/Product";
import Website from "./pages/Website/Website";
import ProductPage from "./pages/Website/ProductPage";
import Customers from "./pages/Dashboard/Customer/Customers";
import Customer from "./pages/Dashboard/Customer/Customer";
import AddCustomer from "./pages/Dashboard/Customer/AddCustomer";
import Orders from "./pages/Dashboard/Order/Orders";
import Order from "./pages/Dashboard/Order/Order";
import AddOrder from "./pages/Dashboard/Order/AddOrder";
import AddPurchase from "./pages/Dashboard/Purchase/AddPurchase";
import Purchases from "./pages/Dashboard/Purchase/Purchases";
import Purchase from "./pages/Dashboard/Purchase/Purchase";
import Traders from "./pages/Dashboard/Trader/Traders";
import AddTrader from "./pages/Dashboard/Trader/AddTrader";
import Trader from "./pages/Dashboard/Trader/Trader";
import Notifications from "./pages/Dashboard/Notification/Notifications";
import MainPage from "./pages/Website/MainPage";
import Contact from "./pages/Website/Contact";
import DashboardHome from "./pages/Dashboard/DashboardHome";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";


export default function App() {

  const { i18n } = useTranslation();

  useEffect(() => {
    // تحديث اتجاه الصفحة في الـ HTML Tag أوتوماتيكياً
    const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="app">
      <Routes>
        <Route element={<Website />}>
          <Route path="/" element={<HomePage />}></Route>
          <Route path="/products/:id" element={<ProductPage />}></Route>
          <Route path="/pages/:pageName" element={<MainPage />}></Route>
          <Route path="/contact" element={<Contact />}></Route>
        </Route>
        <Route element={<RequireBack />} >
          <Route path="/login" element={<Login />}></Route>
          <Route path="/signup" element={<SignUp />}></Route>
        </Route>
        <Route path="/connect/google/redirect" element={<GoogleCallBack />}></Route>
        <Route path="/*" element={<Err404 />} ></Route>
        <Route element={<RequireAuth allowedRole={[1995, 1996, 1999, 1, 2, 3, 4, 5]} />} >
          <Route path="/dashboard" element={<Dashboard />}>
            <Route element={<RequireAuth allowedRole={[1995, 1, 2, 3, 4, 5]} />} >
              <Route path="" element={<DashboardHome />}></Route>
              <Route path="users" element={<Users />}></Route>
              <Route path="users/:id" element={<User />}></Route>
              <Route path="user/add" element={<AddUser />}></Route>
              <Route path="customers" element={<Customers />}></Route>
              <Route path="customers/:id" element={<Customer />}></Route>
              <Route path="customer/add" element={<AddCustomer />}></Route>
              <Route path="traders" element={<Traders />}></Route>
              <Route path="traders/:id" element={<Trader />}></Route>
              <Route path="trader/add" element={<AddTrader />}></Route>
              <Route path="orders" element={<Orders />}></Route>
              <Route path="orders/:id" element={<Order />}></Route>
              <Route path="order/add" element={<AddOrder />}></Route>
              <Route path="purchases" element={<Purchases />}></Route>
              <Route path="purchases/:id" element={<Purchase />}></Route>
              <Route path="purchase/add" element={<AddPurchase />}></Route>
              <Route path="notifications" element={<Notifications />}></Route>
            </Route>
            <Route element={<RequireAuth allowedRole={[1995,1999, 1, 2, 3, 4, 5]} />} >
              <Route path="categories" element={<Categories />}></Route>
              <Route path="categories/:id" element={<Category />}></Route>
              <Route path="category/add" element={<AddCategory />}></Route>
              <Route path="products" element={<Products />}></Route>
              <Route path="products/:id" element={<Product />}></Route>
              <Route path="product/add" element={<AddProduct />}></Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </div>
  )
}
