import React, { useEffect, useState } from "react";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import DashboardHeader from "../components/headers/dashboard";
import Notfound from "./Notfound";
import toast from "react-hot-toast";
import AuthService from "../services/auth.service";
import { useRecoilState } from "recoil";
import { User } from "../utils/atom";
import { Oval } from "react-loader-spinner";
import { Button, Tooltip, message } from "antd";
import ProjectsOverview from "../components/features/ProjectsOverview";
import ProjectView from "../components/features/ProjectView";
import { CopyBlock, dracula } from "react-code-blocks";
import Accordion from "../components/accordion/Accordion";
import ContractService from "../services/contract.service";
import { Progress } from "antd";
import { IoArrowBack } from "react-icons/io5";

const ContractDetail = () => {
  const [user, setUser] = useRecoilState(User);
  const navigate = useNavigate();
  const [contract, setContract] = useState('');
  const [code, setCode] = useState('');
  const [spin, setSpin] = useState(false);
  const [title, setTitle] = useState('');
  const [firstProgress, setFirstProgress] = useState(0);
  const [secondProgress, setSecondProgress] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  
  const searchParams = useParams();
  const contractId = searchParams["contractId"];
  
  document.title = "Contract Detail | Ledgifier";

  useEffect(() => {
    const getContract = async () => {
      const contract = await ContractService.getContractDetail(contractId);
      console.log('contract: ', contract);
      setContract(contract.contract);
    }
    getContract();
  }, []);

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  return !user ? (
    <div className="w-full h-screen flex items-center justify-center">
      <Oval
        height={80}
        width={80}
        color="#4fa94d"
        wrapperStyle={{}}
        wrapperClassName=""
        visible={true}
        ariaLabel="oval-loading"
        secondaryColor="#4fa94d"
        strokeWidth={2}
        strokeWidthSecondary={2}
      />
    </div>
  ) : (
    <div className="flex flex-col h-screen">
      <DashboardHeader />

      <button
        onClick={() => navigate(-1)}
        className="mt-8 ml-2 w-20 flex items-center gap-1 text-white px-3 py-2 rounded-md shadow"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgb(111, 137, 251) 0%, rgb(92, 110, 245) 29%, rgb(81, 81, 236) 100%)",
        }}
      >
        <IoArrowBack />
        <span>Back</span>
      </button>

      {spin?(
      <>
        <div className="w-full h-screen flex items-center justify-center">
          {firstProgress!==100?(
            <div>
              <Progress className="" status="active" percent={firstProgress} />
              <span className="mt-2 pl-4">Processing with Ledgifier Model...</span>
            </div>
          ):(
            <div className="flex flex-col items-center justify-center">
              {/* <Progress type="circle" percent={secondProgress} /> */}
              <Oval
                height={100}
                width={100}
                color="#1677ff"
                wrapperStyle={{}}
                wrapperClassName=""
                visible={true}
                ariaLabel="oval-loading"
                secondaryColor="rgba(0, 0, 0, 0.06)"
                strokeWidth={2}
                strokeWidthSecondary={2}
              />
              <span className="mt-2">Refining with Ledgifier AI Carousel...</span>
            </div>
          )}
        </div>
      </>
      ):<>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-row w-full h-full">
          <div className="py-5 px-2 w-4/12 h-full">
            <div className="peer h-full min-h-[100px] w-full shadow-2xl flex flex-col">
              <span className="px-3 py-2 text-blue-600">Title : </span>
              <input className="peer min-h-[10px] w-full px-3 py-2 border-2 border-indigo-500/50 rounded-lg" value={contract.title}></input>
              <span className="p-3 text-blue-600">Contract : </span>
              <textarea
                value={contract.contract}
                className="peer h-full min-h-[100px] w-full p-3 border-2 border-indigo-500/50 rounded-lg"
              ></textarea>
            </div>
          </div>
          <div className="py-5 px-2 w-8/12 h-full">
            <div className="peer h-full min-h-[100px] w-full shadow-2xl flex flex-col overflow-scroll p-3">
              <p className="text-xl p-1">Generated Solidity Code:</p>
              <CopyBlock
                text={contract.code}
              />
            </div>
          </div>
        </div>
      </div>
      </>}
    
    </div>
  );
};

export default ContractDetail;
