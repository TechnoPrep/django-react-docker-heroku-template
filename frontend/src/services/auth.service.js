import api from "../utils/axios";

const login = (values) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await api.post("/auth/login", {
        ...values,
      });
      resolve(response.data);
    } catch (error) {
      reject(error);
    }
  });
};

const register = (values) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await api.post("/auth/register", {
        ...values,
      });
      resolve(response.data);
    } catch (error) {
      reject(error);
    }
  });
};

const me = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      resolve(response.data);
    } catch (error) {
      reject(error);
    }
  });
};

const AuthService = {
  register,
  login,
  me,
};

export default AuthService;
