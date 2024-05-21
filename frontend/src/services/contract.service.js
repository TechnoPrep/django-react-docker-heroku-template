import api from "../utils/axios";

const generateContract = (title, contract) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await api.post(
        "/contracts/generate",
        {
          "title": title,
          "contract": contract,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      resolve(response.data);
    } catch (error) {
      reject(error);
    }
  });
};

const getContracts = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await api.get(`/contracts/contracts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      resolve(response.data);
    } catch (error) {
      reject(error);
    }
  });
};

const getContractDetail = (contractId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await api.post(
        "/contracts/detail",
        {
          "contractId": contractId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      resolve(response.data);
    } catch (error) {
      reject(error);
    }
  });
};

const deployContract = (contract, uid, params = []) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await api.post(
        "/contracts/deploy",
        {
          "uid": uid,
          "contract": contract,
          "params": params
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      resolve(response.data);
    } catch (error) {
      reject(error);
    }
  });
};

const editTitle = (title, uid) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await api.put(
        "/contracts/edit_title",
        {
          "title": title,
          "uid": uid,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      resolve(response.data);
    } catch (error) {
      reject(error);
    }
  });
};

const deleteContract = (uid) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await api.post(
        "/contracts/remove",
        {
          "uid": uid,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      resolve(response.data);
    } catch (error) {
      reject(error);
    }
  });
};

const saveContract = (uid, code) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await api.put(
        "/contracts/save",
        {
          "uid": uid,
          "code": code,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      resolve(response.data);
    } catch (error) {
      reject(error);
    }
  });
};

const ContractService = {
  generateContract,
  getContracts,
  getContractDetail,
  deployContract,
  editTitle,
  deleteContract,
  saveContract,
};

export default ContractService;
