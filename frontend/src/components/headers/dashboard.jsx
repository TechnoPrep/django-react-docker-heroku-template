import { useState } from "react";
import DashboardLogo from "../logo/DashboardLogo";
import { AiFillCaretDown, AiOutlineUser } from "react-icons/ai";
import { IoPerson } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { Dropdown, Space } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { User } from "../../utils/atom";
import Navbar from "../navbar/Navbar";

const DashboardHeader = () => {
  const navigate = useNavigate();

  const items = [
    {
      key: "0",
      label: <Link to="/profile">Profile</Link>,
      icon: <IoPerson />,
    },
    {
      type: "divider",
    },
    {
      key: "1",
      label: <div>Logout</div>,
      icon: <MdLogout />,
      onClick: () => {
        localStorage.removeItem("token");
        navigate("/auth/login");
      },
    },
  ];
  const user = useRecoilValue(User);
  return (
    <div className="sticky top-0 bg-white shadow-md z-50 w-full">
      <div className="flex items-center max-w-full mx-auto py-3 px-6 justify-between">
        <div className="flex items-center gap-5">
          <Navbar />
          <DashboardLogo />
        </div>
        <Dropdown menu={{ items }}>
          <div className="cursor-pointer">
            <Space>
              <AiOutlineUser />
              <div>{user.username}</div>
              <AiFillCaretDown size={20} />
            </Space>
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default DashboardHeader;
