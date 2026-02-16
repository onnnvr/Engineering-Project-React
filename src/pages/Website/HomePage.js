import { Link } from "react-router-dom";
import NavBar from "../../Components/Website/NavBar";
import Landing from "./Landing"
import FeaturedProducts from "./FeaturedProducts";
import { useEffect, useState } from "react";
import { Axios } from "../../Api/Axios";
import { PRODUCTS } from "../../Api/Api";

export default function HomePage() {
    const [products, setProducts] = useState([])

    useEffect(() => {
        Axios.get(`/pages?filters[name][$eq]=featured-products&pagination[pageSize]=100`, {
            params: {
                populate: {
                    products: {
                        populate: {
                            images: true
                        }
                    }
                }
            }
        }).then((res) => {
            setProducts(res.data.data[0].products)
        })
    }, [])

    return (
        <div>
            {/* Hero Section
            <section className="custom-bg flex items-center">
                <div className="container mx-auto px-4">
                    <div className="max-w-xl text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                            Welcome to the E-Commerce Website
                        </h1>

                        <p className="mt-4 text-lg text-gray-700">
                            Explore our products and enjoy shopping!
                        </p>

                        <Link
                            to="/pages/electrical-tools"
                            className="inline-block mt-6 px-8 py-3 bg-[#8b0000] text-white rounded-full text-lg hover:bg-red-900 transition"
                        >
                            Shop Now
                        </Link>
                    </div>
                </div>
            </section> */}
            <Landing /> 
            <FeaturedProducts products={products} />
        </div>
    );
}