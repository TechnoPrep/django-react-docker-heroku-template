import React, { useState, useEffect, useRef } from "react";
import ContractService from "../services/contract.service";
import DashboardHeader from "../components/headers/dashboard";
import { useRecoilState } from "recoil";
import { User } from "../utils/atom";
import { Oval } from "react-loader-spinner";
import toast from "react-hot-toast";
import Icon from '@ant-design/icons';
import { DeleteFilled , EditFilled, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Modal } from 'antd';
import { Link, useNavigate } from "react-router-dom";

const Deploy = () => {
    const navigate = useNavigate();
    const [user, setUser] = useRecoilState(User);
    const [code, setCode] = useState('');
    const [chats, setChats] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [deployAddress, setDeployAddress] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [title, setTitle] = useState('');
    const [parameters, setParameters] = useState([]);
    const [parameterValues, setParameterValues] = useState([]);
    const [showParameterModal, setShowParameterModal] = useState(false);
    const [deployData, setDeployData] = useState();


    function compareCreatedBy(a, b) {
      if (a.created_at < b.created_at) {
        return -1;
      }
      if (a.created_at > b.created_at) {
        return 1;
      }
      return 0;
    }

    useEffect(() => {
      const getContract = async () => {
        const contracts = await ContractService.getContracts();
        const sortedContracts = contracts.contracts.sort(compareCreatedBy);
        setChats(sortedContracts);
        handleClickItem(sortedContracts[0]);
      }
      getContract();
    }, [])

    const truncateString = (str, num) => {
        if (str.length > num) {
          return str.slice(0, num) + "..."; 
        } else {
          return str;
        }
    };

    const handleClickItem = (chat) => {
      setSelectedItem(chat); 
      setCode(chat.code);
      setDeployAddress(chat.deploy_address);
      setDeployData(chat);
    };

    const handleDeploy = () => {    
      const constructorRegex = /constructor\((.*?)\)/s;
      const matches = code.match(constructorRegex);
      
      if (matches && matches[1]) {
        const parametersString = matches[1].replace(/\s+/g, ' ').trim();
        const parametersArray = parametersString.split(',').map(param => param.trim());
        
        const parameters = parametersArray.map(item => {
          const parts = item.split(" ");
          return { type: parts[0], name: parts[parts.length - 1] };
        });        
        setParameters(parameters);
        setParameterValues([]);
        setShowParameterModal(true);
      } 
      else {
        toast.promise(ContractService.deployContract(code, selectedItem.uid), {
          loading: "Deploying...",
          success: (data) => {
            setDeployAddress(data.address);
            setChats(chats => chats.map(chat =>
              chat.uid === selectedItem.uid
                ? { ...chat, deploy_address: data.address }
                : chat
            ));
            setShowParameterModal(false);
            setDeployData(data);
            return "Deployed your contract successfully";
          },
          error: (err) => {
            console.log("err: ", err.response.data.error)
            return (
              <div className="flex gap-2 p-1 flex-col">
                <div className="text-red-500 font-semibold test-sm">
                  Error occured, While deploying your contract.
                </div>
              </div>
            );
          },
        });
      }
    }

    const handleEdit = (chat) => {
      setTitle(chat.title);
      setSelectedItem(chat); 
      setShowModal(true);
    }

    const handleDelete = (chat) => {
      setShowDeleteModal(true);
    }

    const handleEditSave = async () => {
      const res = await ContractService.editTitle(title, selectedItem.uid);
      if(res.result === "success") {
        setShowModal(false);
      }
      else {
        toast.error("Something went wrong.")
      }
      setChats(chats => chats.map(chat =>
        chat.uid === selectedItem.uid
          ? { ...chat, title: title }
          : chat
      ));
    }

    const handleDeleteSave = async () => {
      const res = await ContractService.deleteContract(selectedItem.uid);
      if(res.result === "success") {
        setShowDeleteModal(false);
      }
      else {
        toast.error("Something went wrong.")
      }
      setChats(chats => chats.filter(chat => chat.uid !== selectedItem.uid));
    }

    const handleSaveContract = async () => {
      toast.promise(ContractService.saveContract(selectedItem.uid, code), {
        loading: "Saving...",
        success: (data) => {
          setChats(chats => chats.map(chat =>
            chat.uid === selectedItem.uid
              ? { ...chat, code: code }
              : chat
          ));
          return "Saved your contract successfully";
        },
        error: (err) => {
          console.log("err: ", err.response.data.error)
          return (
            <div className="flex gap-2 p-1 flex-col">
              <div className="text-red-500 font-semibold test-sm">
                Error occured, While Saving your contract.
              </div>
            </div>
          );
        },
      });
    }

    const handleParameterDeploy = async () => {
      setParameterValues([]);
      toast.promise(ContractService.deployContract(code, selectedItem.uid, parameterValues), {
        loading: "Deploying...",
        success: (data) => {
          setDeployAddress(data.address);
          setChats(chats => chats.map(chat =>
            chat.uid === selectedItem.uid
              ? { ...chat, deploy_address: data.address }
              : chat
          ));
          setShowParameterModal(false);
          setDeployData(data);
          return "Deployed your contract successfully";
        },
        error: (err) => {
          console.log("err: ", err.response.data.error)
          return (
            <div className="flex gap-2 p-1 flex-col">
              <div className="text-red-500 font-semibold test-sm">
                Error occured, While deploying your contract.
              </div>
            </div>
          );
        },
      });
    }

    const handleNavigation = () => {
      navigate(`/check/${deployAddress}`, { state: { deployData: deployData } });
    }
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
      <>
        <div className="w-full flex flex-col h-screen">
          <DashboardHeader />
          <div className="flex flex-row w-full h-full">
            <div className="w-2/12 bg-neutral-100 h-full p-4 overflow-auto">
                {chats.map((chat, index) => (
                  <div key={index} onClick={() => handleClickItem(chat)}
                    className={`rounded-md p-2 ${selectedItem.uid === chat.uid ? 'bg-blue-500 text-white' : 'bg-neutral-100 text-black'} 
                      cursor-pointer flex flex-row justify-between hover:bg-gray-300 relative`}>
                    <span>
                      {truncateString(chat.title, 20)}
                    </span>
                    <div className="flex flex-row justify-between">
                      <EditOutlined className="mr-2" onClick={() => handleEdit(chat)} />
                      <DeleteOutlined onClick={() => handleDelete(chat)} />
                    </div>
                  </div>
                ))}
            </div>
            <div className="w-10/12 flex flex-col h-full p-4">
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="peer h-full min-h-[100px] w-full p-2"
                    placeholder=""
                ></textarea>
                <div className="flex flex-row justify-between">
                  {deployAddress!==''?(
                  <span className="flex items-center">Deployed address: 
                  <button
                    onClick={handleNavigation}
                    className="text-[rgb(0,123,173)] font-bold"
                  >
                  {deployAddress}
                  </button>
                  </span>):(<span></span>)}
                  <div className="flex flex-row">
                    <button
                      onClick={() => handleDeploy()}
                      className="w-24 flex justify-center gap-1 text-white px-3 py-2 m-2 rounded-md shadow"
                      style={{
                        backgroundImage:
                          "linear-gradient(90deg, rgb(111, 137, 251) 0%, rgb(92, 110, 245) 29%, rgb(81, 81, 236) 100%)",
                      }}
                    >
                      <span>Submit</span>
                    </button>
                    <button
                      onClick={() => handleSaveContract()}
                      className="w-24 flex justify-center gap-1 text-white px-3 py-2 m-2 rounded-md shadow"
                      style={{
                        backgroundImage:
                          "linear-gradient(90deg, rgb(111, 137, 251) 0%, rgb(92, 110, 245) 29%, rgb(81, 81, 236) 100%)",
                      }}
                    >
                      <span>Save</span>
                    </button>
                  </div>
                </div>
            </div>
          </div>
        </div>
        

        {showModal ? (
        <>
          <div
            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
          >
            <div className="relative w-1/4 my-6 mx-auto max-w-3xl">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                  <h3 className="text-1xl font-semibold">
                    Edit Title
                  </h3>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                  <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                    ×
                  </span>
                  </button>
                </div>
                <div className="relative p-4 flex-auto">
                  <input className="w-full p-2" value={title} onChange={(e) => setTitle(e.target.value)}></input>
                </div>
                <div className="flex items-center justify-end p-1 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={handleEditSave}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
        ) : null}


        {showDeleteModal ? (
        <>
          <div
            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
          >
            <div className="relative w-1/4 my-6 mx-auto max-w-3xl">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                <div className="relative p-4 flex-auto">
                  <span>Are you sure you want to delete this contract?</span>
                </div>
                <div className="flex items-center justify-end p-1 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={handleDeleteSave}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
        ) : null}


        {showParameterModal ? (
        <>
          <div
            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
          >
            <div className="relative w-4/12 my-6 mx-auto max-w-3xl">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                  <h3 className="text-1xl font-semibold">
                    Set Parameters
                  </h3>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowParameterModal(false)}
                  >
                  <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                    ×
                  </span>
                  </button>
                </div>
                <div className="relative p-4 flex-auto">
                  {parameters.map((p, index) => (
                    <div className="flex flex-row items-center w-full my-1">
                      <span className="w-1/4">{p.name}</span>
                      <input key={index} className="peer w-3/4 ml-4 px-3 py-2 border-2 border-indigo-500/50 rounded-lg" placeholder={p.type} value={parameterValues[index]} onChange={(e) => 
                      {
                        const newDataArray = [...parameterValues];
                        newDataArray[index] = e.target.value;
                        setParameterValues(newDataArray);
                      }}/>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-end p-1 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowParameterModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={handleParameterDeploy}
                  >
                    Deploy
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
        ) : null}

      </>
        
    );
};

export default Deploy;
