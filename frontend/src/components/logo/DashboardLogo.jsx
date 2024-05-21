import React from "react";
import { Link } from "react-router-dom";
import LogoText from "./LogoText";
import logoImage from "../../assets/logo1.png";

const DashboardLogo = () => {
  return (
    <Link to="/" className="flex items-center gap-3">
      <img src={logoImage} className="w-[10rem]" />
      {/* <LogoText /> */}
    </Link>
  );
};

export default DashboardLogo;
