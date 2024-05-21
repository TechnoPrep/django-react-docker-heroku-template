import React, { useEffect } from "react";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import DashboardHeader from "../components/headers/dashboard";
import Notfound from "./Notfound";
import toast from "react-hot-toast";
import AuthService from "../services/auth.service";
import { useRecoilState } from "recoil";
import { User } from "../utils/atom";
import { Oval } from "react-loader-spinner";
import { Button, Tooltip } from "antd";
import ProjectsOverview from "../components/features/ProjectsOverview";
import ProjectView from "../components/features/ProjectView";

const Dashboard = () => {
  const [user, setUser] = useRecoilState(User);
  const navigate = useNavigate();

  useEffect(() => {
    toast.promise(AuthService.me(), {
      loading: "Loading...",
      success: (data) => {
        setUser(data);
        return "Loaded your account successfully";
      },
      error: (err) => {
        navigate("/auth/login");
        return (
          <div className="flex gap-2 p-1 flex-col">
            <div className="text-red-500 font-semibold test-sm">
              Error occured, While opening loading your account
            </div>
            <div>
              {err.name === "AxiosError" &&
              err.message === "Network Error" &&
              err.code === "ERR_NETWORK"
                ? "Server is not found."
                : "You'll have to log in again"}{" "}
            </div>
          </div>
        );
      },
    });
  }, []);

  document.title = "Dashboard | Ledgifier";

  return !user ? (
    <div className="w-full h-screen flex items-center justify-center">
      <Oval
        height={80}
        width={80}
        color="#4fa94d"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
        ariaLabel="oval-loading"
        secondaryColor="#4fa94d"
        strokeWidth={2}
        strokeWidthSecondary={2}
      />
    </div>
  ) : (
    <div>
      <DashboardHeader />
      <div className="max-w-[100rem] mx-auto px-5 mt-10">
        <Routes>
          <Route path="/projects" element={<ProjectsOverview />} />
          <Route path="/" element={<ProjectsOverview />} />
          <Route path="/projects/:project_id" element={<ProjectView />} />
          <Route path="*" element={<Notfound />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
