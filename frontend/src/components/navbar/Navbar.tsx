import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AiOutlineMenu,
  AiOutlineDeploymentUnit,
  AiOutlineClose,
} from "react-icons/ai";
import { FaHome, FaFileContract } from "react-icons/fa";
import DashboardLogo from "../logo/DashboardLogo";

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const menuItems = [
    {
      icon: <FaHome size={25} className="mr-4" />,
      text: "Dashboard",
      link: "/",
    },
    {
      icon: <FaFileContract size={25} className="mr-4" />,
      text: "Contract Generator",
      link: "/generate",
    },
    {
      icon: <AiOutlineDeploymentUnit size={25} className="mr-4" />,
      text: "Deploy Contract",
      link: "/deploy",
    },
  ];

  return (
    <div className="max-w-[1640px] mx-auto flex justify-between items-center shadow-sm z-[10000]">
      <div className="flex items-center">
        <div onClick={() => setNav(!nav)} className="cursor-pointer">
          <AiOutlineMenu size={30} />
        </div>
      </div>

      {nav ? (
        <div className="bg-black/80 fixed w-full h-screen z-[10000] top-0 left-0"></div>
      ) : (
        ""
      )}

      <div
        className={
          nav
            ? "fixed top-0 left-0 w-[300px] h-screen bg-white z-[10000] duration-300"
            : "fixed top-0 left-[-100%] w-[300px] h-screen bg-white z-[10000] duration-300"
        }
      >
        <div className="flex justify-between items-center m-3">
          <DashboardLogo />
          <AiOutlineClose
            onClick={() => setNav(!nav)}
            size={30}
            className="cursor-pointer"
          />
        </div>
        <nav>
          <ul className="flex flex-col p-4 text-gray-800">
            {menuItems.map(({ icon, text, link }, index) => {
              return (
                <div key={index} className="py-4">
                  <li
                    onClick={() => setNav(!nav)}
                    className="text-sl flex cursor-pointer w-[90%] rounded-full mx-auto p-2 hover:text-white hover:bg-black"
                  >
                    <Link className="w-full flex" to={link}>
                      {icon} {text}
                    </Link>
                  </li>
                </div>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
