import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./pages/auth";
import Notfound from "./pages/Notfound";
import Dashboard from "./pages/dashboard";
import ContractGenerator from "./pages/contractGenerator";
import { QueryClient, QueryClientProvider } from "react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import { RecoilRoot } from "recoil";
import TimerProvider from "./contexts/timerContext";
import Deploy from "./pages/deploy";
import Check from "./pages/check";
import ContractDetail from "./pages/contractDetail";

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")).render(
  <RecoilRoot>
    <GoogleOAuthProvider clientId="744685161545-em893prk331fejvl1q7hfal6cpnek7gt.apps.googleusercontent.com">
      <QueryClientProvider client={queryClient}>
        <TimerProvider>
          <Router>
            <Routes>
              <Route path="/auth/*" element={<Auth />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/generate" element={<ContractGenerator />} />
              <Route path="/deploy" element={<Deploy />} />
              <Route path="/check/:address" element={<Check />} />
              <Route path="/contract/:contractId" element={<ContractDetail />} />
              <Route path="*" element={<Notfound />} />
            </Routes>
          </Router>
        </TimerProvider>
        <Toaster position="bottom-right" />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </RecoilRoot>
);
