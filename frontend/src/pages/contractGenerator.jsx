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

const ContractGenerator = () => {
  const [user, setUser] = useRecoilState(User);
  const navigate = useNavigate();
  const [contract, setContract] = useState('');
  const [code, setCode] = useState('');
  const [spin, setSpin] = useState(false);
  const [title, setTitle] = useState('');
  // const [innerPercent, setInnerPercent] = useState(0);
  const [firstProgress, setFirstProgress] = useState(0);
  const [secondProgress, setSecondProgress] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  
  document.title = "Contract Generator | Ledgifier";

  const [accordions, setAccordion] = useState([
    {
      key: 1,
      title: "Initial GPT Review",
      data: ``,
      isOpen: false,
    },
    {
      key: 2,
      title: "Gemini Review of GPT Review",
      data: ``,
      isOpen: false,
    },
    {
      key: 3,
      title: "Final GPT Review",
      data: ``,
      isOpen: false,
    },
    {
      key: 4,
      title: "Human Review",
      data: ``,
      isOpen: false,
    },
  ]);

  const toggleAccordion = (accordionkey) => {
    const updatedAccordions = accordions.map((accord) => {
      if (accord.key === accordionkey) {
        return { ...accord, isOpen: !accord.isOpen };
      } else {
        return { ...accord, isOpen: false };
      }
    });

    setAccordion(updatedAccordions);
  };

  
  const startSecondProgress = () => {
    const id = setInterval(() => {
      setSecondProgress((prev) => {
        if (prev < 100) {
          return prev + 1;
        } else {
          clearInterval(id); // Second progress bar complete
          return prev;
        }
      });
    }, 1000); // Adjust timing as necessary
    setIntervalId(id); // Save interval ID for potential cleanup
  };

  const codeGenerate = async (e) => {
    if (title !== "" && contract !== "") {
      setSpin(true);
      setCode('');
  
      const id = setInterval(() => {
        setFirstProgress((prev) => {
          if (prev < 100) {
            return prev + 1;
          } else {
            // First progress bar is complete, start second one
            clearInterval(id); // Clear the interval of the first progress bar
            startSecondProgress(); // Start second progress bar
            return prev; // Return previous state to avoid additional rendering
          }
        });
      }, 1000); // Adjust timing as necessary
      setIntervalId(id); // Save interval ID for potential cleanup
  
      const result = await ContractService.generateContract(title, contract);
      setCode(result.code);
      setSpin(false);
      setFirstProgress(0);
      setSecondProgress(0);
    }
    else {
      toast.error("Contract title and contents are required.")
    }
  }
  
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
              <input className="peer min-h-[10px] w-full px-3 py-2 border-2 border-indigo-500/50 rounded-lg" placeholder="Write title" value={title} onChange={(e) => setTitle(e.target.value)} required></input>
              <span className="p-3 text-blue-600">Contract : </span>
              <textarea
                value={contract}
                onChange={(e) => setContract(e.target.value)}
                className="peer h-full min-h-[100px] w-full p-3 border-2 border-indigo-500/50 rounded-lg"
                placeholder="Write your contract here in English"
              ></textarea>
              <div className="flex flex-row justify-end">
                <button
                  onClick={(e) => codeGenerate(e.target.value)}
                  className="w-24 flex justify-center gap-1 text-white px-3 py-2 m-2 rounded-md shadow"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, rgb(111, 137, 251) 0%, rgb(92, 110, 245) 29%, rgb(81, 81, 236) 100%)",
                  }}
                >
                  <span>Run</span>
                </button>
              </div>
            </div>
          </div>
          <div className="py-5 px-2 w-8/12 h-full">
            <div className="peer h-full min-h-[100px] w-full shadow-2xl flex flex-col overflow-scroll p-3">
              <p className="text-xl p-1">Generated Solidity Code:</p>
              <CopyBlock
                text={code}
              />
            </div>
          </div>
        </div>
      </div>
      </>}
    
    </div>
  );
};

export default ContractGenerator;
