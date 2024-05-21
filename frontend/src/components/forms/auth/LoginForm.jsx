import { useState } from "react";
import smallLogoImage from "../../../assets/logo_small.png";
import logoImage from "../../../assets/logo.png";
import AuthImage from "../../../assets/auth.png";
import LineImage from "../../../assets/line.png";
import {
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
} from "@mui/material";
import { BsFillEyeSlashFill, BsFillEyeFill } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import AuthService from "../../../services/auth.service";
import Validations from "../../../utils//validation";

const LoginForm = () => {
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const [showPassword, setShowPassword] = useState(false);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Validations.loginValidation,
    onSubmit: (values) => {
      toast.promise(AuthService.login(values), {
        loading: "Logging in...",
        success: (data) => {
          localStorage.setItem("token", data.token);
          navigate("/");
          return "Logged in";
        },
        error: (err) => {
          return (
            <div className="flex gap-2 p-1 flex-col">
              <div className="text-red-500 font-semibold test-sm">
                Error occured, While logging in
              </div>
              <div>{err.response.data.error}</div>
            </div>
          );
        },
      });
    },
  });

  document.title = "Login | Ledgifier";
  return (
    <div className="flex flex-row w-screen static bg-[#58595B]">
      {/* <img src={AuthImage} className="absolute top-0 buttom-0 w-screen h-screen brightness-50" /> */}
      <div className="bg-[white] flex justify-center w-4/12 z-[1000]">
        <form
          onSubmit={formik.handleSubmit}
          // className="shadow-xl rounded-lg gap-7 p-10 flex flex-col items-center bg-white"
          className="w-10/12 flex flex-col items-start h-screen py-10"
        >
          <img src={smallLogoImage} className="object-contain w-[4rem]" />
          <div className="mt-4 p-10 w-full">
            <div className="border-l-4 border-[#3EB489] rounded px-6 flex flex-col py-2">
              <span className="text-xl font-medium">Sign in to <br/> Ledgifier</span>
              <span className="pt-4">Welcome Back. Let's get started.</span>
            </div>
            <div className="flex flex-col gap-4 w-full mt-20">
              <TextField
                id="outlined-basic"
                label="Email address"
                className="w-full"
                variant="outlined"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
              />
              <FormControl className="w-full mt-10" variant="outlined">
                <InputLabel
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  htmlFor="outlined-adornment-password"
                >
                  Password
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? (
                          <BsFillEyeSlashFill />
                        ) : (
                          <BsFillEyeFill />
                        )}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                />
                <FormHelperText
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  disabled={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                >
                  {formik.touched.password && formik.errors.password}
                </FormHelperText>
              </FormControl>
              <div className="flex justify-end mt-1 w-full">
                <Link
                  to="/forgot"
                  className="text-sm text-[rgb(0,123,173)] font-bold"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-4 w-full mt-8">
              <button
                type="submit"
                className="rounded bg-[#3EB489] text-white rounded-sm w-full py-4"
              >
                Sign In
              </button>
              <div className="flex text-sm justify-end gap-2">
                <div>Don't have an account?</div>
                <Link
                  to="/auth/register"
                  className="text-[rgb(0,123,173)] font-bold"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div className="w-8/12 z-[1000]">
        <div className="h-screen grid content-between py-6">
          <div className="text-white flex flex-col px-32 py-52">
            <span className="text-4xl">Smart Contract Lifecycle 
              <br/> 
              Management (SCLM)
            </span>
            <span className="text-xl mt-4">
              Leverage a Proprietary Model to Convert 
              <br/>
              English Contracts into Solidity Smart 
              <br/>
              Contracts, Broadcast to Blockchain, Deploy, 
              <br/>
              Monitor Performance
              <br/>
            </span>
            <img src={LineImage} className="w-40 mt-10" />
            <button className="border-2 border-[white] w-fit mt-10 px-4 py-2">
              DISCOVER HOW
            </button>
          </div>
          <div>
            <ul className="flex flex-row items-center justify-between px-32">
              <li className="text-white">Ledgifier.com</li>
              <li className="text-white">About Ledgifier</li>
              <li className="text-white">Privacy</li>
              <li className="text-white">Terms & Conditions</li>
              <li className="text-white">@Ledgifier 2024</li>
              <img src={logoImage} className="object-contain w-[8rem]" />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
