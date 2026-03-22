import { Link } from "react-router-dom";
import logo from "../assets/logo.ico"

const Footer = () => {
    return (

        <div className="bg-yellow-500 border-t-2 border-t-yellow-500 py-4 mt-10">
            <div className="container mx-auto flex flex-col md:flex-row justify-between text-center md:text-left items-center gap-4">
            <Link to="/"><span className="text-2xl text-white font-bold tracking-tight"><img src={logo}/><Link to="/" /></span></Link>
            <span className="text-white fornt-bold tracking-tight flex gap-4">
                
            </span>
            <div className="container mx-auto text-center text-sm text-gray-700">
                &copy; 2024 DB Project. All rights reserved.
            </div>
        </div>
        </div>
    );
}


export default Footer;