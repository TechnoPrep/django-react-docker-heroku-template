import React, { useState, useEffect, useRef } from "react";
import ContractService from "../services/contract.service";
import DashboardHeader from "../components/headers/dashboard";
import { useRecoilState } from "recoil";
import { User } from "../utils/atom";
import { Oval } from "react-loader-spinner";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery } from "react-query";
import { Divider, Table, Card } from 'antd';
import { IoArrowBack } from "react-icons/io5";

const Check = () => {
  const [user, setUser] = useRecoilState(User);
  const navigate = useNavigate();
  const location = useLocation();
  const deployData = location.state?.deployData;
  console.log("deployData: ", deployData)

  // const searchParams = useParams();
  // const address = searchParams["address"];
  const address = deployData.deploy_address;
  
  function reduceAddress(address, startLength = 16, endLength = 12) {
    if (address.length > startLength + endLength) {
      return address.substring(0, startLength) + '...' + address.substring(address.length - endLength);
    }
    return address;
  }

  const columns = [
    {
      title: 'Transaction Hash',
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
      title: 'Block Number',
      dataIndex: 'block_number',
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
      title: 'Block Hash',
      dataIndex: 'block_hash',
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
      title: 'Address',
      dataIndex: 'address',
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
      title: 'From',
      dataIndex: 'from',
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
      title: 'Gas Used',
      dataIndex: 'gas_used',
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

  const data = [
    {
      key: '1',
      tx_hash: reduceAddress(deployData.tx_hash),
      block_number: deployData.block_number,
      block_hash: reduceAddress(deployData.block_hash),
      address: reduceAddress(address),
      from: reduceAddress(deployData.from_address),
      gas_used: deployData.gas_used,
    },
  ];

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
      {/* <div className="w-full flex flex-col h-screen"> */}
      <div className="flex flex-col h-screen bg-[#fafbfd]">
        <DashboardHeader />
        <div className="flex justify-center">
          <div className="w-3/4">
            <button
              onClick={() => navigate(-1)}
              className="mt-8 w-20 flex items-center gap-1 text-white px-3 py-2 rounded-md shadow"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgb(111, 137, 251) 0%, rgb(92, 110, 245) 29%, rgb(81, 81, 236) 100%)",
              }}
            >
              <IoArrowBack />
              <span>Back</span>
            </button>
            <div className="mt-10 flex flex-row justify-start">
              <img width={26} height={24} className="rounded-full" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAAXNSR0IArs4c6QAAA5hJREFUeF7t3cGNFEEQRNFZC9YAJKzAAa74gTgjsV4gccYRrtiEBSBcmNdSqNR/71mZE/k7Knunpvvl9e3d3wf8vf7+BNGPx5+Pvyj+9OC1fi8BsEUoAHIAIlAdNAcg+T04B8gBiKIcgOTbB+cAOQBRmAOQfPvgHCAHIApzAJJvH5wD5ABEYQ5A8u2Dc4AcgCjMAUi+fXAOkAMQhTkAybcPPt4BVEIVQPOv4/UK1vr520AtIAC2B2ICQAnG+BwAj5Sh/vPwAAiAKYRtAVP594diAyAA7Fi46tddQHcBytDR8Q2BDYFTgJsBpvI3BD6aAZoBxtfgNn0zQDPAlMBmgKn8zQDNAOMDMXMHGF+At08fADdHIAACYPtdwM31n3/8HGDegm0BAbDVf549AOYt2BYQAFv959kDYN6CbQEBsNV/nj0A5i3YFhAAW/3n2QNg3oJtAQGw1X+ePQDmLdgWEABb/efZX95/+EzvC9AzbXooVPNrB9b1a/4AQAK0AQqw5g+AAGgLEAb0CswB8Fi4CijN/x8bAHiqdS1gAHQXQAysAdb8DYHU/rYAfu+fEtwMYO9tzAFygG4DhYG1g2n+HEC6322g/7pVCW4GaAbAa9jC1wBr/rYA63//CVQLVoI1P/Y/AFRAbaACdPf6eQu4u4CnAxwASHAA3FzAAAgAUmA9w7QFUPv2/wjD8h8BgAq2BdxcwAAIAFKgGWB8ppC692gGUP3mJ4r0A7QFoIKnC3h6/d0F3BzgAAgAOxOI+jUD4C+jVP8cABU8fgZ4fbOHRf/8/hUlLFwU+PLth4Q/+AkhAUD6c3AAsIRnLxAAZ/ePqw8AlvDsBQLg7P5x9QHAEp69QACc3T+uPgBYwrMXCICz+8fVBwBLePYCAXB2/7j6AGAJz14gAM7uH1cfACzh2QsEwNn94+oZAH1fAH8CXEAPZGB6fkCE5tf4+Ykg/QABYAoGgOmXA6B+HJ4DmIQ5gOmXA6B+HJ4DmIQ5gOmXA6B+HJ4DmIQ5gOmXA6B+HJ4DmIQ5gOmXA6B+HJ4DmIQ5gOmXA6B+HJ4DmIQ5gOmXA6B+HJ4DmIRzB1g30OTz6J4TiM8J9BZsVwiAAJgS2BYwld/fPazlB4AqiPFtAW0BiJCF5wCmH0fnADkAQyQL5ACi3gWxOUAOcAFGzy+RAzyv3SWROUAOcAlIzy6SAzyr3EVxOUAOcBFKzy2TAzyn22VROUAOcBlMzyz0D9hd5Z/+BYiVAAAAAElFTkSuQmCC" />
              <span className="mx-2 text-xl font-bold">Contract</span>
              <span className="text-xl">{address}</span>
            </div>
            <div className="mt-10 flex flex-row justify-between space-x-2.5">
              <Card className="w-4/12" bordered={true}>
                <p style={{marginBottom:"12px"}}>Overview</p>
                <p style={{fontSize:"12px", color: "#6c757d"}}>BALANCE</p>
                <p>0 MATIC</p>
              </Card>
              <Card className="w-4/12" bordered={true}>
                <p style={{marginBottom:"12px"}}>More Info</p>
                <p style={{fontSize:"12px", color: "#6c757d"}}> CONTRACT CREATOR:</p>
                <div className="flex flex-row">
                  <p style={{color: "#7342dc", marginRight:"4px"}}>{reduceAddress(deployData.from_address, 10, 6)}</p>
                  <p>at txn</p>
                  <p style={{color: "#7342dc", marginLeft:"4px"}}>{reduceAddress(deployData.tx_hash)}</p>
                </div>
                <div>
                  <p style={{fontSize:"12px", color: "#6c757d", marginTop:"12px"}}>TOKEN TRACKER</p>
                  <a style={{color: "#7342dc"}} href={`https://mumbai.polygonscan.com/token/${address}`} target="_blank">MyToken (MTK)</a>
                </div>
              </Card>
              <Card className="w-4/12" bordered={true}>
                <p style={{marginBottom:"12px"}}>Multichain Info</p>
                <p>N/A</p>
              </Card>
            </div>
            <div>
              <button className="w-30 flex items-center gap-1 text-white px-2 py-1 mt-10 rounded-md shadow bg-[#7342dc]">
                <span style={{fontSize:"14px"}}>Transactions</span>
              </button>
              <Table className="mt-2" columns={columns} dataSource={data} size="middle" />
            </div>
            <span className="text-sm">
              A contract address hosts a smart contract, which is a set of code stored on the blockchain that runs when predetermined conditions are met. Learn more about addresses in our Knowledge Base.</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Check;
