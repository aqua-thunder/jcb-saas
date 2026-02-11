import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import SignInPage from "./auth/SignInPage";
import SignUpPage from "./auth/SignUpPage";

import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./store/ProtectedRoute";
import PublicRoute from "./store/PublicRoute";

import Dashboard from "./pages/Dashboard";
import Machine from "./pages/Machine";
import Driver from "./pages/Driver";
import Rental from "./pages/Rental";
import Invoice from "./pages/Invoice";
import Client from "./pages/Client";
import InvoicePage from './pages/InvoicePage';
import Service from "./pages/Service";
import Settings from "./pages/Settings";
import Contact from "./pages/Contact";
import Report from "./pages/Report";
import QuotationPage from "./pages/QuotationPage";
import Payment from "./pages/Payment";



function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Public Routes (blocked after login) */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/machine" element={<Machine />} />
            <Route path="/driver" element={<Driver />} />
            <Route path="/rental" element={<Rental />} />
            <Route path="/client" element={<Client />} />
            <Route path="/invoice" element={<Invoice />} />
            <Route path="/invoicePage" element={<InvoicePage />} />
            <Route path="/service" element={<Service />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/report" element={<Report />} />
            <Route path="/quotation" element={<QuotationPage />} />
            <Route path="/payment" element={<Payment />} />

          </Route>
        </Route>

      </Routes>


    </BrowserRouter>
  );
}

export default App;
