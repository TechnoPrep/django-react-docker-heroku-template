import React, { useEffect, useState, Fragment, useCallback, useRef } from "react";
import { IoAdd } from "react-icons/io5";
import { IconButton, TextField } from "@mui/material";
import NewContractForm from "../forms/dashboard/NewContractForm";
import { MdDelete, MdEdit } from "react-icons/md";
import { BsCheckCircleFill } from "react-icons/bs";
import { PiWarningFill } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import ProjectService from "../../services/project.service";
import toast from "react-hot-toast";
import { useRecoilState } from "recoil";
import { User } from "../../utils/atom";
import ContractService from "../../services/contract.service";
import { Divider, Table, Card } from 'antd';
import { createRoot } from "react-dom/client";
import { AgChartsReact } from "ag-charts-react";
import { AgCharts } from "ag-charts-enterprise";
import "ag-charts-enterprise";

const ProjectsOverview = () => {
  const [user, setUser] = useRecoilState(User);
  const navigate = useNavigate();
  const [initialContractDate, setInitialContractDate] = useState('');
  const [deployedContracts, setDeployedContracts] = useState([]);
  const [undeployedContracts, setUndeployedContracts] = useState([]);
  const chartRef = useRef(null);
  const gasChartRef = useRef(null);
  const [options, setOptions] = useState({});
  const [gasOptions, setGasOptions] = useState({});
  const [allContractsData, setAllContractsData] = useState([]);
  const [allDeploymentsData, setAllDeploymentsData] = useState([]);

  function reduceAddress(address, startLength = 16, endLength = 12) {
    if (address.length > startLength + endLength) {
      return address.substring(0, startLength) + '...' + address.substring(address.length - endLength);
    }
    return address;
  }

  useEffect(() => {
    let seed = 1;
    const day = 1000 * 60 * 60 * 24;
    
    const getContract = async () => {
      const contracts = await ContractService.getContracts();
      const sortedContracts = contracts.contracts.sort(compareCreatedBy);
      console.log("sortedContracts: ", sortedContracts)
      setInitialContractDate(sortedContracts[0].created_at)
          
      const allContracts = [];
      const allDeployments = [];
      
      const deployed = [];
      const undeployed = [];
      for (let i = 0; i < sortedContracts.length; i++) {
        if(sortedContracts[i].deploy_address === "") {
          undeployed.push(sortedContracts[i]);
          allContracts.push({
            key: sortedContracts[i].uid,
            contract_title: sortedContracts[i].title,
            creation_date: sortedContracts[i].created_at.split('T')[0] + ' ' + sortedContracts[i].created_at.split('T')[1].split('.')[0],
            status: "Undeployed",
          })
        }
        else {
          deployed.push(sortedContracts[i]);
          allContracts.push({
            key: sortedContracts[i].uid,
            contract_title: sortedContracts[i].title,
            creation_date: sortedContracts[i].created_at.split('T')[0] + ' ' + sortedContracts[i].created_at.split('T')[1].split('.')[0],
            status: "Deployed",
          })
          allDeployments.push({
            key: sortedContracts[i].uid,
            contract_address: reduceAddress(sortedContracts[i].deploy_address),
            tx_hash: reduceAddress(sortedContracts[i].tx_hash),
            timestamp: sortedContracts[i].created_at.split('T')[0] + ' ' + sortedContracts[i].created_at.split('T')[1].split('.')[0]
          })
        }
      }

      setAllContractsData(allContracts.reverse());
      setAllDeploymentsData(allDeployments.reverse())
      setDeployedContracts(deployed);
      setUndeployedContracts(undeployed);

      const getData = () => {
        const data = [];
        seed = 1;
        sortedContracts.forEach(contract => {
          const time = new Date(contract.created_at.split('T')[0]).getTime();
          // console.log('time: ', time);
          let item = data.find(item => item.time === time);
          if (item) {
            item.price += 1;
            // console.log('item: ', item);
          } else {
            data.push({time: time, price: 1})
          }
        });

        return data;
      }
      
      const data = {
        zoom: {
          enabled: true,
          rangeX: {
            start: new Date(sortedContracts[0].created_at.split('T')[0].toString()), 
            end: new Date(Date()),
          },
        },
        tooltip: {
          enabled: false,
        },
        axes: [
          {
            type: "number",
            position: "left",
            title: {
              text: "Contracts generated",
            },
          },
          {
            type: "time",
            position: "bottom",
            nice: false,
            label: {
              autoRotate: false,
            },
            tick: {
              minSpacing: 50,
              maxSpacing: 200,
            },
          },
        ],
        data: getData(),
        series: [
          {
            type: "line",
            xKey: "time",
            yKey: "price",
          },
        ],
      };
      setOptions(data);
      
      const getGasData = () => {
        const data = [];
        seed = 1;
        deployed.forEach(contract => {
          const time = new Date(contract.created_at.split('T')[0]).getTime();
          let item = data.find(item => item.time === time);
          if (item) {
            item.price += Number(contract.gas_used) / 1000000000;
          } else {
            data.push({time: time, price: Number(contract.gas_used) / 1000000000})
          }
        });

        return data;
      };

      const gasData = {
        zoom: {
          enabled: true,
          rangeX: {
            start: new Date(sortedContracts[0].created_at.split('T')[0].toString()), 
            end: new Date(Date()),
          },
        },
        tooltip: {
          enabled: false,
        },
        axes: [
          {
            type: "number",
            position: "left",
            title: {
              text: "Gas used (MATIC)",
            },
          },
          {
            type: "time",
            position: "bottom",
            nice: false,
            label: {
              autoRotate: false,
            },
            tick: {
              minSpacing: 50,
              maxSpacing: 200,
            },
          },
        ],
        data: getGasData(),
        series: [
          {
            type: "line",
            xKey: "time",
            yKey: "price",
          },
        ],
      };

      setGasOptions(gasData);

    }

    getContract();

  }, [])
  

  const changeRangeAll = useCallback(() => {
    const clone = { ...options };

    clone.zoom.rangeX = {};

    setOptions(clone);
  }, [options]);


  function compareCreatedBy(a, b) {
    if (a.created_at < b.created_at) {
      return -1;
    }
    if (a.created_at > b.created_at) {
      return 1;
    }
    return 0;
  }

  const contractColumns = [
    {
      title: 'Name',
      dataIndex: 'contract_title',
      render(text, record) {
        return {
          props: {
            style: { color: "#7342dc" }
          },
          children: <div>{text}</div>
        };
      }
    },
    {
      title: 'Creation Date',
      dataIndex: 'creation_date',
      render(text, record) {
        return {
          props: {
            style: { color: "#7342dc" }
          },
          children: <div>{text}</div>
        };
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render(text, record) {
        return {
          props: {
            style: { color: "#7342dc" }
          },
          children: <div>{text}</div>
        };
      }
    },
  ];

  const deploymentColumns = [
    {
      title: 'Contract Address',
      dataIndex: 'contract_address',
      render(text, record) {
        return {
          props: {
            style: { color: "#7342dc" }
          },
          children: <div>{text}</div>
        };
      }
    },
    {
      title: 'Tx Hash',
      dataIndex: 'tx_hash',
      render(text, record) {
        return {
          props: {
            style: { color: "#7342dc" }
          },
          children: <div>{text}</div>
        };
      }
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      render(text, record) {
        return {
          props: {
            style: { color: "#7342dc" }
          },
          children: <div>{text}</div>
        };
      }
    },
  ];

  const handleContractDetail = (record) => {
    navigate(`/contract/${record.key}`);
  }

  const handleDeploymentDetail = async (record) => {
      const contract = await ContractService.getContractDetail(record.key);
      navigate(`/check/${contract.contract.deploy_address}`, { state: { deployData: contract.contract } });
  }

  return (
    <div>
      <div className="flex-col items-center">
        <div className="text-2xl text-gray-900 font-medium">Welcome, {user.username.charAt(0).toUpperCase() + user.username.slice(1)}!</div>
        <div className="mt-4 text-ml text-gray-900 font-medium">Quick Stats: {deployedContracts.length + undeployedContracts.length} Contracts, {deployedContracts.length} Deployments</div>
      </div>


      <div className="mt-4 flex flex-row justify-between space-x-2.5">
        <Card className="w-6/12" bordered={true} bodyStyle={{padding: "0px"}}>
          <p className="text-ml font-medium" style={{marginTop:"12px", marginLeft: "8px"}}>Recent Contracts</p>
          <Table className="mt-2" columns={contractColumns} dataSource={allContractsData} size="middle" rowClassName={"cursor-pointer"}
            onRow={(record, rowIndex) => {
              return {
                onClick: event => {handleContractDetail(record)}
              }
            }}
          />
        </Card>
        <Card className="w-6/12" bordered={true} bodyStyle={{padding: "0px"}}>
          <p className="text-ml font-medium" style={{marginTop:"12px", marginLeft: "8px"}}>Recent Deployment</p>
          <Table className="mt-2" columns={deploymentColumns} dataSource={allDeploymentsData} size="middle" rowClassName={"cursor-pointer"}
            onRow={(record, rowIndex) => {
              return {
                onClick: event => {handleDeploymentDetail(record)}
              }
            }}
          />
        </Card>
      </div>
      
      <div className="flex flex-row justify-between space-x-4">
        <div className="w-6/12 flex flex-col mt-10">
          <span className="flex justify-center">Activity Over Time</span>
          <AgChartsReact ref={chartRef} options={options} />
        </div>
        <div className="w-6/12 flex flex-col mt-10">
          <span className="flex justify-center">Gas Usage</span>
          <AgChartsReact ref={gasChartRef} options={gasOptions} />
        </div>
      </div>

    </div>
  );
};

export default ProjectsOverview;
