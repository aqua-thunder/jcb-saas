import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useToast } from "../store/ToastContext";

import { useAuth } from "../store/auth";
import DeleteAccountModal from "../components/modals/DeleteAccountModal";
import ConfirmModal from "../components/ui/ConfirmModal";


import { Edit, Save, Trash2, X, Plus, AlertCircle, Check, Mail, Phone, MapPin, Globe, Building, FileText, CreditCard, Calendar, Hash } from "lucide-react";
import { formatDate as formatDateUtil } from "../utils/formatDate";
import { formatInvoiceNo } from "../utils/formatInvoiceNo";

const ViewTermDetailsModal = ({ isOpen, onClose, term }) => {
  if (!isOpen || !term) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <h3 className="text-xl font-bold text-[var(--text-secondary)] font-[family-name:var(--font-heading)] pr-8">
            {term.title || "Term Details"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors absolute right-4 top-4">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <textarea
            readOnly
            value={term.content}
            className="w-full h-[60vh] md:h-96 p-4 bg-gray-50 border border-gray-200 rounded-xl text-[var(--text-secondary)] leading-relaxed text-sm md:text-base resize-none focus:outline-none focus:border-gray-300 transition-colors custom-scrollbar"
          />
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-2xl">
          <Button onClick={onClose} className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const TermItem = ({ term, index, onView }) => {
  return (
    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-50 text-[var(--color-primary)] flex items-center justify-center font-bold text-lg border border-orange-100 shadow-sm font-[family-name:var(--font-heading)]">
        {index + 1}
      </div>
      <div className="bg-white p-5 rounded-2xl border border-gray-100 flex-1 shadow-sm transition-all hover:shadow-md hover:border-orange-100 group cursor-pointer flex justify-between items-center" onClick={() => onView(term)}>
        <div>
          <h3 className="font-bold text-[var(--text-secondary)] text-lg font-[family-name:var(--font-heading)] group-hover:text-[var(--color-primary)] transition-colors">
            {term.title || "Term & Condition"}
          </h3>
          <p className="text-[var(--text-muted)] text-xs mt-1 font-medium tracking-wide uppercase flex items-center gap-1 group-hover:text-[var(--color-primary)]/70">
            Click to view details <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </p>
        </div>
        <div className="bg-gray-50 p-2.5 rounded-xl text-gray-400 group-hover:text-[var(--color-primary)] group-hover:bg-orange-50 transition-colors">
          <FileText size={20} />
        </div>
      </div>
    </div>
  );
};

export default function Settings() {
  const [selectedTerm, setSelectedTerm] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchUser, token, settings, getSettings } = useAuth();

  const [user, setUser] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    profileImage: "",
  });
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: "", message: "", onConfirm: () => { } });


  useEffect(() => {
    setIsEditing(false);
  }, [activeTab]);

  const startEditing = () => {
    setIsEditing(true);
    if (activeTab === 'bank' && banks.length === 0) {
      setBanks([{ bankName: "", branch: "", accountNo: "", accountName: "", ifsc: "", upiId: "" }]);
    }
    if (activeTab === 'terms' && terms.length === 0) {
      setTerms([{ title: "", content: "" }]);
    }
  };

  // Company Profile States
  const [company, setCompany] = useState({
    businessName: "",
    address: "",
    fullName: "",
    phoneNumber: "",
    email: "",
    website: "",
    gstNumber: "",
    logo: ""
  });

  const [billing, setBilling] = useState({
    invoicePrefix: "",
    invoiceSuffix: "",
    quotationPrefix: "",
    quotationSuffix: "",
    paymentPrefix: "",
    paymentSuffix: "",
    dateFormat: "DD-MM-YYYY",
    creditDays: "0",
    hideCredit: false
  });

  const [banks, setBanks] = useState([]);

  const [terms, setTerms] = useState([]);


  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchSettings();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:7000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUser({
          fullName: data.fullName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
          profileImage: data.profileImage || "",
        });
      } else {
        toast.error(data.message || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Error fetching profile");
    } finally {
      setFetching(false);
    }
  };

  const fetchSettings = async () => {
    // This will now sync with global context
    getSettings();
  };

  useEffect(() => {
    if (settings) {
      if (settings.company) setCompany(settings.company);
      if (settings.billing) setBilling(settings.billing);
      if (settings.bankDetails) setBanks(settings.bankDetails);
      if (settings.terms) setTerms(settings.terms);
    }
  }, [settings]);

  const handleUserChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateStrength = (password) => {
    let score = 0;
    if (!password) return 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
    if (name === "newPassword") {
      setPasswordStrength(calculateStrength(value));
    }
  };

  // Company Profile Handlers
  const handleCompanyChange = (e) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompany({ ...company, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBillingChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setBilling({ ...billing, [e.target.name]: value });
  };

  const handleBankChange = (index, e) => {
    const { name, value } = e.target;
    const newBanks = [...banks];
    newBanks[index][name] = value;
    setBanks(newBanks);
  };

  const addBank = () => {
    setBanks([...banks, {
      bankName: "",
      branch: "",
      accountNo: "",
      accountName: "",
      ifsc: "",
      upiId: ""
    }]);
  };

  const removeBank = (index) => {
    setConfirmConfig({
      title: "Delete Bank Account",
      message: "Are you sure you want to delete this bank account? This change will only be saved when you click 'Save Bank Details'.",
      onConfirm: () => {
        const newBanks = banks.filter((_, i) => i !== index);
        setBanks(newBanks);
        toast.info("Bank removed from list. Remember to save your changes.");
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleTermChange = (index, name, value) => {
    const newTerms = [...terms];
    newTerms[index][name] = value;
    setTerms(newTerms);
  };

  const addTerm = () => {
    setTerms([...terms, { title: "", content: "" }]);
  };

  const removeTerm = (index) => {
    setConfirmConfig({
      title: "Delete Term",
      message: "Are you sure you want to delete this term? This change will only be saved when you click 'Save Terms'.",
      onConfirm: () => {
        const newTerms = terms.filter((_, i) => i !== index);
        setTerms(newTerms);
        toast.info("Term removed from list. Remember to save your changes.");
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  const getInvoicePreview = () => {
    return formatInvoiceNo(billing.invoicePrefix, billing.invoiceSuffix, "001");
  };

  const getQuotationPreview = () => {
    return formatInvoiceNo(billing.quotationPrefix, billing.quotationSuffix, "001");
  };

  const getPaymentPreview = () => {
    return formatInvoiceNo(billing.paymentPrefix, billing.paymentSuffix, "001");
  };

  const formatDate = (date, format) => {
    return formatDateUtil(date, format);
  };

  // Note: I actually want to remove the local formatDate entirely but let's see if it's used elsewhere.
  // Wait, I'll just remove the block I added earlier.


  const handleSaveCompany = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        company,
        billing,
        bankDetails: banks,
        terms
      };

      const res = await fetch("http://localhost:7000/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Settings saved successfully");
        await getSettings(); // Refresh global context settings immediately
      } else {
        toast.error(data.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error saving settings");
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:7000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Profile updated successfully");
        fetchUser(); // Sync the header
        // Update local storage user data
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...storedUser, ...data }));
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (passwords.newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(passwords.newPassword)) {
      return toast.error("Password must contain at least one uppercase letter");
    }
    if (!/[0-9]/.test(passwords.newPassword)) {
      return toast.error("Password must contain at least one number");
    }
    if (!/[^A-Za-z0-9]/.test(passwords.newPassword)) {
      return toast.error("Password must contain at least one special character");
    }

    setPassLoading(true);
    try {
      const res = await fetch("http://localhost:7000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated successfully");
        setPasswords({ newPassword: "", confirmPassword: "" });
      } else {
        toast.error(data.message || "Password update failed");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Error updating password");
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch("http://localhost:7000/api/auth/profile", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Account deleted successfully");
        // Clear local storage/session storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        toast.error(data.message || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Error deleting account");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fc8e00]"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto animate-in fade-in duration-500">


      <div className="flex flex-col gap-2 mb-6">
        <p className="text-[var(--text-muted)]">Manage your account settings and preferences.</p>
      </div>

      {/* Tabs - Mobile Dropdown */}
      <div className="md:hidden mb-6">
        <label htmlFor="settings-tabs" className="sr-only">Select Tab</label>
        <div className="relative">
          <select
            id="settings-tabs"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full px-4 py-3 rounded-xl outline-none transition text-[var(--color-black)] bg-[var(--bg-light)] border border-gray-200 focus:border-[var(--color-primary)] appearance-none cursor-pointer font-medium"
          >
            <option value="general">General Profile</option>
            <option value="company">Company Profile</option>
            <option value="billing">Billing Settings</option>
            <option value="bank">Bank Details</option>
            <option value="terms">Terms & Conditions</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tabs - Desktop Horizontal List */}
      <div className="hidden md:flex gap-6 mb-8 border-b border-gray-200 overflow-x-auto no-scrollbar">
        {[
          { id: 'general', label: 'General Profile' },
          { id: 'company', label: 'Company Profile' },
          { id: 'billing', label: 'Billing Settings' },
          { id: 'bank', label: 'Bank Details' },
          { id: 'terms', label: 'Terms & Conditions' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-1 font-medium text-sm transition-all relative whitespace-nowrap ${activeTab === tab.id
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Profile Section */}
          <div className="bg-[var(--bg-light)] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 mb-8 pb-8 border-b border-gray-100">
              <div className="relative group">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-[var(--color-primary)]/20 shadow-md" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#fc8e00] flex items-center justify-center text-white text-4xl font-bold uppercase transition-transform group-hover:scale-105 shadow-md">
                    {user.fullName ? user.fullName.charAt(0) : "?"}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-[var(--color-primary)] text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-[#e68200] transition-colors border-2 border-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                    <path d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z" />
                  </svg>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-[var(--text-secondary)] truncate">{user.fullName || "User Name"}</h2>
                <p className="text-[var(--text-muted)] truncate">{user.email || "user@email.com"}</p>
                <p className="text-[var(--text-muted)] text-sm mt-1">{user.phoneNumber || "No phone number added"}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="fullName"
                  value={user.fullName}
                  onChange={handleUserChange}
                  placeholder="Your Name"
                  required
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={user.email}
                  onChange={handleUserChange}
                  placeholder="your@email.com"
                  required
                  readOnly
                  disabled
                  className="bg-gray-100 cursor-not-allowed opacity-75"
                />
                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  value={user.phoneNumber}
                  onChange={handleUserChange}
                  placeholder="+91 00000 00000"
                />
                <Input
                  label="Address"
                  name="address"
                  value={user.address}
                  onChange={handleUserChange}
                  placeholder="Your full address"
                />
              </div>
              <div className="flex justify-center sm:justify-end pt-4 border-t border-gray-100">
                <Button type="primary" htmlType="submit" disabled={loading} className="w-full sm:w-auto px-8">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </span>
                  ) : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>

          {/* Password Change Section */}
          <div className="bg-[var(--bg-light)] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
            <div className="flex flex-col gap-1 mb-6">
              <h2 className="text-xl font-bold text-[var(--text-secondary)]">Change Password</h2>
              <p className="text-[var(--text-muted)] text-sm">Update your password to keep your account secure.</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  required
                />
                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Password Strength Meter */}
              {passwords.newPassword && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider">
                    <span className="text-gray-500">Security Strength</span>
                    <span className={
                      passwordStrength <= 1 ? "text-red-500" :
                        passwordStrength === 2 ? "text-yellow-600" :
                          "text-green-600"
                    }>
                      {passwordStrength <= 1 ? "Weak" :
                        passwordStrength === 2 ? "Medium" : "Strong"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 transition-all duration-500 ${passwordStrength >= 1 ? (passwordStrength <= 1 ? 'bg-red-500' : passwordStrength === 2 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200'}`}></div>
                    <div className={`h-full flex-1 transition-all duration-500 ${passwordStrength >= 2 ? (passwordStrength === 2 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200'}`}></div>
                    <div className={`h-full flex-1 transition-all duration-500 ${passwordStrength >= 3 ? (passwordStrength === 3 ? 'bg-green-500' : 'bg-green-500') : 'bg-gray-200'}`}></div>
                    <div className={`h-full flex-1 transition-all duration-500 ${passwordStrength >= 4 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                  </div>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
                    <li className={`text-[10px] flex items-center gap-1.5 ${passwords.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-1 h-1 rounded-full ${passwords.newPassword.length >= 8 ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                      Min 8 characters
                    </li>
                    <li className={`text-[10px] flex items-center gap-1.5 ${/[A-Z]/.test(passwords.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(passwords.newPassword) ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                      One Uppercase
                    </li>
                    <li className={`text-[10px] flex items-center gap-1.5 ${/[0-9]/.test(passwords.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-1 h-1 rounded-full ${/[0-9]/.test(passwords.newPassword) ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                      One Number
                    </li>
                    <li className={`text-[10px] flex items-center gap-1.5 ${/[^A-Za-z0-9]/.test(passwords.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-1 h-1 rounded-full ${/[^A-Za-z0-9]/.test(passwords.newPassword) ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                      One Symbol
                    </li>
                  </ul>
                </div>
              )}
              <div className="flex justify-center sm:justify-end pt-4 border-t border-gray-100">
                <Button type="primary" htmlType="submit" disabled={passLoading} className="w-full sm:w-auto px-8">
                  {passLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </span>
                  ) : "Update Password"}
                </Button>
              </div>
            </form>
          </div>

          <div className="bg-red-50 rounded-2xl p-6 md:p-8 border border-red-100">
            <div className="flex flex-col gap-1 mb-6">
              <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
              <p className="text-red-500 text-sm">Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            <div className="flex justify-center sm:justify-end">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete Account
              </button>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 md:p-8 border border-blue-100 mb-8">
            <div className="flex flex-col gap-1 mb-6">
              <h2 className="text-xl font-bold text-blue-600">Quick Guide</h2>
              <p className="text-blue-500 text-sm">Want to see all features again? Restart the guided system tour.</p>
            </div>
            <div className="flex justify-center sm:justify-end">
              <button
                onClick={() => {
                  localStorage.removeItem('tour_completed');
                  window.location.reload();
                }}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Restart System Tour
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === 'company' ? (
        <div className="animate-in fade-in duration-300 space-y-6">
          <div className="flex justify-between items-center bg-[var(--bg-light)] p-4 rounded-xl border border-gray-200 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-secondary)]">Business Profile</h2>
              <p className="text-[var(--text-muted)] text-sm">{isEditing ? "Update your company information." : "View your company details."}</p>
            </div>
            {!isEditing && (
              <Button onClick={startEditing} className="flex items-center gap-2 bg-blue-50 text-blue-600 border-none hover:bg-blue-100">
                <Edit size={16} /> Edit
              </Button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveCompany}>
              {/* 1. Business Profile Section */}
              <div className="bg-[var(--bg-light)] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 mb-6">

                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 mb-8">
                  <div className="relative group">
                    {company.logo ? (
                      <img src={company.logo} alt="Company Logo" className="w-24 h-24 rounded-lg object-contain border border-gray-200 bg-white p-2 shadow-sm" />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-dashed border-gray-300">
                        <span className="text-[10px] font-medium uppercase text-center px-1">Upload Logo</span>
                      </div>
                    )}
                    <label className="absolute -bottom-2 -right-2 bg-[var(--color-primary)] text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-[#e68200] transition-colors border-2 border-white">
                      <Edit size={12} />
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--text-muted)]">Upload your company logo. Start with a square image (png, jpg) for best results.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Business Name"
                    name="businessName"
                    value={company.businessName}
                    onChange={handleCompanyChange}
                    placeholder="e.g. JCB Earthmovers Ltd."
                  />
                  <Input
                    label="GST Number"
                    name="gstNumber"
                    value={company.gstNumber}
                    onChange={handleCompanyChange}
                    placeholder="e.g. 22AAAAA0000A1Z5"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <Input
                    label="Full Name (Owner/Admin)"
                    name="fullName"
                    value={company.fullName}
                    onChange={handleCompanyChange}
                    placeholder="e.g. John Doe"
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={company.email}
                    onChange={handleCompanyChange}
                    placeholder="company@example.com"
                  />
                  <Input
                    label="Phone Number"
                    name="phoneNumber"
                    value={company.phoneNumber}
                    onChange={handleCompanyChange}
                    placeholder="+91 00000 00000"
                  />
                  <Input
                    label="Website"
                    name="website"
                    value={company.website}
                    onChange={handleCompanyChange}
                    placeholder="https://www.example.com"
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={company.address}
                      onChange={handleCompanyChange}
                      placeholder="Complete office address"
                      className="w-full px-4 py-3 rounded-xl outline-none transition text-[var(--color-black)] bg-[var(--bg-light)] border border-[var(--color-primary)] focus:border-[var(--color-primary)] min-h-[100px] resize-y"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 mb-8">
                <Button type="button" onClick={() => { setIsEditing(false); fetchSettings(); }} className="bg-gray-100 text-gray-600 border-none">Cancel</Button>
                <Button type="primary" htmlType="submit" className="px-8 flex items-center justify-center gap-2">
                  <Check size={16} /> Save Changes
                </Button>
              </div>

            </form>
          ) : (
            <div className="bg-white rounded-[var(--border-radius)] border border-gray-100 overflow-hidden shadow-sm">
              <div className="h-32 bg-[var(--color-primary)] relative">
                <div className="absolute -bottom-10 left-8">
                  <div className="p-1 bg-white rounded-2xl shadow-lg inline-block">
                    {company.logo ? (
                      <img src={company.logo} alt="Logo" className="w-24 h-24 rounded-xl object-contain bg-white border border-gray-100" />
                    ) : (
                      <div className="w-24 h-24 bg-[var(--bg-light)] rounded-xl flex items-center justify-center text-gray-300">
                        <Building size={32} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-12 px-8 pb-8">
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b border-gray-100 pb-6 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--text-secondary)] font-[family-name:var(--font-heading)]">{company.businessName || "Company Name"}</h3>
                    <p className="text-[var(--text-muted)] mt-1">{company.fullName || "Owner Name"}</p>
                  </div>
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[var(--color-primary)] hover:underline font-medium bg-orange-50 px-3 py-1.5 rounded-lg transition-colors">
                      <Globe size={16} />
                      <span className="text-sm">Visit Website</span>
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Mail size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Contact Email</p>
                      <p className="text-[var(--text-secondary)] font-medium text-sm truncate">{company.email || "-"}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                      <Phone size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Phone Number</p>
                      <p className="text-[var(--text-secondary)] font-medium text-sm truncate">{company.phoneNumber || "-"}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                      <Hash size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">GST Number</p>
                      <p className="text-[var(--text-secondary)] font-medium text-sm truncate">{company.gstNumber || "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-[var(--bg-light)] rounded-2xl border border-gray-100">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Physical Address</p>
                      <p className="text-[var(--text-secondary)] font-medium text-sm leading-relaxed">{company.address || "Address not provided"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div >

      ) : activeTab === 'billing' ? (
        <div className="animate-in fade-in duration-300 space-y-6">
          <div className="flex justify-between items-center bg-[var(--bg-light)] p-4 rounded-xl border border-gray-200 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-secondary)]">Billing Settings</h2>
              <p className="text-[var(--text-muted)] text-sm">{isEditing ? "Configure your invoice settings." : "View your billing configuration."}</p>
            </div>
            {!isEditing && (
              <Button onClick={startEditing} className="flex items-center gap-2 bg-blue-50 text-blue-600 border-none hover:bg-blue-100">
                <Edit size={16} /> Edit
              </Button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveCompany}>
              <div className="bg-[var(--bg-light)] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 mb-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Number Formats */}
                  <div className="space-y-8">
                    <div>
                      <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Hash size={18} className="text-[var(--color-primary)]" />
                        Invoice Number Format
                      </h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <Input
                          label="Prefix"
                          name="invoicePrefix"
                          value={billing.invoicePrefix}
                          onChange={handleBillingChange}
                          placeholder="e.g. INV-"
                        />
                        <Input
                          label="Suffix"
                          name="invoiceSuffix"
                          value={billing.invoiceSuffix}
                          onChange={handleBillingChange}
                          placeholder="e.g. /{{xxxx}}"
                        />
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Preview:</span>
                        <span className="text-sm font-mono font-bold text-[var(--color-primary)]">{getInvoicePreview()}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-blue-500" />
                        Quotation Number Format
                      </h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <Input
                          label="Prefix"
                          name="quotationPrefix"
                          value={billing.quotationPrefix}
                          onChange={handleBillingChange}
                          placeholder="e.g. QT-"
                        />
                        <Input
                          label="Suffix"
                          name="quotationSuffix"
                          value={billing.quotationSuffix}
                          onChange={handleBillingChange}
                          placeholder="e.g. /{{xxxx}}"
                        />
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Preview:</span>
                        <span className="text-sm font-mono font-bold text-blue-600">{getQuotationPreview()}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <CreditCard size={18} className="text-green-500" />
                        Payment Receipt Format
                      </h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <Input
                          label="Prefix"
                          name="paymentPrefix"
                          value={billing.paymentPrefix}
                          onChange={handleBillingChange}
                          placeholder="e.g. PAY-"
                        />
                        <Input
                          label="Suffix"
                          name="paymentSuffix"
                          value={billing.paymentSuffix}
                          onChange={handleBillingChange}
                          placeholder="e.g. /{{xxxx}}"
                        />
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Preview:</span>
                        <span className="text-sm font-mono font-bold text-green-600">{getPaymentPreview()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: General Settings */}
                  <div className="space-y-8">
                    <div>
                      <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-purple-500" />
                        Display Settings
                      </h3>
                      <div className="space-y-6">
                        <div className="relative w-full">
                          <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                            Global Date Format
                          </label>
                          <div className="relative">
                            <select
                              name="dateFormat"
                              value={billing.dateFormat}
                              onChange={handleBillingChange}
                              className="w-full px-4 py-3 rounded-xl outline-none transition text-[var(--color-black)] bg-[var(--bg-light)] border border-gray-200 focus:border-[var(--color-primary)] appearance-none cursor-pointer"
                            >
                              <option value="DD-MM-YYYY">DD-MM-YYYY (09-02-2026)</option>
                              <option value="MM-DD-YYYY">MM-DD-YYYY (02-09-2026)</option>
                              <option value="YYYY-MM-DD">YYYY-MM-DD (2026-02-09)</option>
                              <option value="DD/MM/YYYY">DD/MM/YYYY (09/02/2026)</option>
                              <option value="MM/DD/YYYY">MM/DD/YYYY (02/09/2026)</option>
                            </select>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                          <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Advanced Configurations</h4>

                          <Input
                            label="Credit Period (Days)"
                            name="creditDays"
                            type="number"
                            value={billing.creditDays}
                            onChange={handleBillingChange}
                            placeholder="15"
                            min="0"
                          />

                          <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:border-[var(--color-primary)] transition-all">
                            <input
                              type="checkbox"
                              name="hideCredit"
                              checked={billing.hideCredit || false}
                              onChange={handleBillingChange}
                              className="w-5 h-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-700">Hide Due Date</span>
                              <span className="text-[10px] text-gray-400">Hide the "Due Date" field on printed invoices</span>
                            </div>
                          </label>
                        </div>

                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                          <p className="text-[10px] uppercase font-bold text-blue-600 mb-2 tracking-wider flex items-center gap-1">
                            <AlertCircle size={14} /> Available Variables
                          </p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                            <span className="flex items-center gap-1.5"><code className="bg-blue-100 text-blue-700 px-1 rounded">{"{{mm}}"}</code> Month (01)</span>
                            <span className="flex items-center gap-1.5"><code className="bg-blue-100 text-blue-700 px-1 rounded">{"{{mmm}}"}</code> Month (Jan)</span>
                            <span className="flex items-center gap-1.5"><code className="bg-blue-100 text-blue-700 px-1 rounded">{"{{xx}}"}</code> FY Start (25)</span>
                            <span className="flex items-center gap-1.5"><code className="bg-blue-100 text-blue-700 px-1 rounded">{"{{xxxx}}"}</code> FY Start (2025)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 mb-8">
                <Button type="button" onClick={() => { setIsEditing(false); fetchSettings(); }} className="bg-gray-100 text-gray-600 border-none">Cancel</Button>
                <Button type="primary" htmlType="submit" className="px-8 flex items-center justify-center gap-2">
                  <Check size={16} /> Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Next Invoice Card */}
              <div className="bg-white p-6 rounded-[var(--border-radius)] border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 text-gray-100 group-hover:text-[var(--color-primary)]/10 transition-colors">
                  <Hash size={48} />
                </div>
                <h3 className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest relative z-10">Next Invoice</h3>
                <div className="text-2xl font-mono font-bold text-[var(--text-secondary)] mb-2 relative z-10">{getInvoicePreview()}</div>
                <div className="flex gap-2 text-[10px] relative z-10 text-gray-400">
                  <span className="font-mono">P: {billing.invoicePrefix || "-"}</span>
                  <span className="font-mono">S: {billing.invoiceSuffix || "-"}</span>
                </div>
              </div>

              {/* Next Quotation Card */}
              <div className="bg-white p-6 rounded-[var(--border-radius)] border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 text-gray-100 group-hover:text-blue-500/10 transition-colors">
                  <FileText size={48} />
                </div>
                <h3 className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest relative z-10">Next Quotation</h3>
                <div className="text-2xl font-mono font-bold text-[var(--text-secondary)] mb-2 relative z-10">{getQuotationPreview()}</div>
                <div className="flex gap-2 text-[10px] relative z-10 text-gray-400">
                  <span className="font-mono">P: {billing.quotationPrefix || "-"}</span>
                  <span className="font-mono">S: {billing.quotationSuffix || "-"}</span>
                </div>
              </div>

              {/* Next Payment Card */}
              <div className="bg-white p-6 rounded-[var(--border-radius)] border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 text-gray-100 group-hover:text-green-500/10 transition-colors">
                  <CreditCard size={48} />
                </div>
                <h3 className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest relative z-10">Next Payment</h3>
                <div className="text-2xl font-mono font-bold text-[var(--text-secondary)] mb-2 relative z-10">{getPaymentPreview()}</div>
                <div className="flex gap-2 text-[10px] relative z-10 text-gray-400">
                  <span className="font-mono">P: {billing.paymentPrefix || "-"}</span>
                  <span className="font-mono">S: {billing.paymentSuffix || "-"}</span>
                </div>
              </div>

              {/* Date Format Card */}
              <div className="bg-white p-6 rounded-[var(--border-radius)] border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 text-gray-100 group-hover:text-purple-500/10 transition-colors">
                  <Calendar size={48} />
                </div>
                <h3 className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest relative z-10">Date Format</h3>
                <div className="text-xl font-bold text-[var(--text-secondary)] mb-2 relative z-10">{billing.dateFormat}</div>
                <p className="text-[10px] text-gray-400 relative z-10 font-bold uppercase tracking-tighter">Today: {formatDate(new Date(), billing.dateFormat)}</p>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'bank' ? (
        <div className="animate-in fade-in duration-300 space-y-6">
          <div className="flex justify-between items-center bg-[var(--bg-light)] p-4 rounded-xl border border-gray-200 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-secondary)]">Bank Details</h2>
              <p className="text-[var(--text-muted)] text-sm">{isEditing ? "Update your bank accounts." : "View saved bank accounts."}</p>
            </div>
            {!isEditing && (
              <Button onClick={startEditing} className="flex items-center gap-2 bg-blue-50 text-blue-600 border-none hover:bg-blue-100">
                <Edit size={16} /> Edit
              </Button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveCompany}>
              <div className="space-y-6 mb-6">
                {banks.map((bankItem, index) => (
                  <div key={index} className="bg-[var(--bg-light)] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 relative mb-6">
                    {banks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBank(index)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-2"
                        title="Remove Bank Details"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <h3 className="font-semibold text-gray-700 mb-4">Bank Account {index + 1}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Account Name"
                        name="accountName"
                        value={bankItem.accountName}
                        onChange={(e) => handleBankChange(index, e)}
                        placeholder="Account Holder Name"
                      />
                      <Input
                        label="Bank Name"
                        name="bankName"
                        value={bankItem.bankName}
                        onChange={(e) => handleBankChange(index, e)}
                        placeholder="e.g. HDFC Bank"
                      />
                      <Input
                        label="Account Number"
                        name="accountNo"
                        value={bankItem.accountNo}
                        onChange={(e) => handleBankChange(index, e)}
                        placeholder="Account Number"
                      />
                      <Input
                        label="IFSC Code"
                        name="ifsc"
                        value={bankItem.ifsc}
                        onChange={(e) => handleBankChange(index, e)}
                        placeholder="Bank IFSC"
                      />
                      <Input
                        label="Branch Name"
                        name="branch"
                        value={bankItem.branch}
                        onChange={(e) => handleBankChange(index, e)}
                        placeholder="Branch Location"
                      />
                      <Input
                        label="UPI ID"
                        name="upiId"
                        value={bankItem.upiId}
                        onChange={(e) => handleBankChange(index, e)}
                        placeholder="username@upi"
                      />
                    </div>
                  </div>
                ))}

                <div className="flex justify-start">
                  <Button
                    type="button"
                    onClick={addBank}
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 flex items-center gap-2"
                  >
                    <Plus size={16} /> Add Another Bank Account
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 mb-8">
                <Button type="button" onClick={() => { setIsEditing(false); fetchSettings(); }} className="bg-gray-100 text-gray-600 border-none">Cancel</Button>
                <Button type="primary" htmlType="submit" className="px-8 flex items-center justify-center gap-2">
                  <Check size={16} /> Save Bank Details
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!banks.some(b => b.bankName?.trim() || b.accountNo?.trim()) ? (
                <div className="col-span-1 md:col-span-2 text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-gray-50 text-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
                    <Building size={30} />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-secondary)] mb-2 font-[family-name:var(--font-heading)]">Enter the Details</h3>
                  <p className="text-[var(--text-muted)] text-sm max-w-xs mx-auto">Please enter your bank information to display them on invoices and quotations.</p>
                  <Button onClick={startEditing} className="mt-6 flex items-center gap-2 mx-auto">
                    <Edit size={16} /> Enter Bank Details
                  </Button>
                </div>
              ) : (
                banks.map((bankItem, index) => (
                  <div key={index} className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-main)] p-6 rounded-[var(--border-radius)] shadow-lg relative overflow-hidden group text-white">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Building size={120} />
                    </div>
                    <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[var(--color-primary)] rounded-full opacity-10 blur-2xl"></div>

                    <div className="relative z-10 flex flex-col h-full justify-between min-h-[180px]">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-white/90 truncate max-w-[200px] font-[family-name:var(--font-heading)]">{bankItem.bankName || "Bank Name"}</h3>
                          <p className="text-xs text-white/50 uppercase tracking-wider">{bankItem.branch || "Branch"}</p>
                        </div>
                        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                          <Building size={20} className="text-[var(--color-primary)]" />
                        </div>
                      </div>

                      <div className="space-y-4 mt-6">
                        <div>
                          <p className="text-[10px] uppercase text-white/40 font-bold tracking-wider mb-1">Account Number</p>
                          <p className="font-mono text-xl tracking-widest text-white">{bankItem.accountNo || "•••• •••• ••••"}</p>
                        </div>
                        <div className="flex justify-between items-end border-t border-white/10 pt-4">
                          <div>
                            <p className="text-[10px] uppercase text-white/40 font-bold tracking-wider mb-0.5">IFSC Code</p>
                            <p className="font-medium text-white/80">{bankItem.ifsc || "SBIN000XXXX"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase text-white/40 font-bold tracking-wider mb-0.5">Beneficiary</p>
                            <p className="font-medium text-white/80">{bankItem.accountName || "Name"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in duration-300 space-y-6">
          <div className="flex justify-between items-center bg-[var(--bg-light)] p-4 rounded-xl border border-gray-200 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-secondary)]">Terms & Conditions</h2>
              <p className="text-[var(--text-muted)] text-sm">{isEditing ? "Update your terms and conditions." : "View your terms."}</p>
            </div>
            {!isEditing && (
              <Button onClick={startEditing} className="flex items-center gap-2 bg-blue-50 text-blue-600 border-none hover:bg-blue-100">
                <Edit size={16} /> Edit
              </Button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveCompany}>
              <div className="bg-[var(--bg-light)] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 mb-6">
                <div className="space-y-6">
                  {terms.map((term, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-100 relative group">
                      <button
                        type="button"
                        onClick={() => removeTerm(index)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors p-2"
                        title="Remove Term"
                      >
                        <Trash2 size={20} />
                      </button>

                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <span className="text-[var(--color-primary)] font-bold text-lg hidden sm:inline flex-shrink-0">#{index + 1}</span>
                          <div className="w-full">
                            <Input
                              label={`Term Heading ${index + 1}`}
                              value={term.title}
                              onChange={(e) => handleTermChange(index, 'title', e.target.value)}
                              placeholder="e.g. Payment Terms, Warranty, etc."
                              className="mb-0 w-full"
                            />
                          </div>
                        </div>
                        <div className="w-full">
                          <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                            Description / Content
                          </label>
                          <textarea
                            value={term.content}
                            onChange={(e) => handleTermChange(index, 'content', e.target.value)}
                            placeholder="Enter the detailed terms and conditions here..."
                            className="w-full px-4 py-3 rounded-xl outline-none transition text-[var(--color-black)] bg-white border border-gray-200 focus:border-[var(--color-primary)] min-h-[250px] resize-y leading-relaxed text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Button
                    type="button"
                    onClick={addTerm}
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 flex items-center gap-2"
                  >
                    <Plus size={16} /> Add New Term
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 mb-8">
                <Button type="button" onClick={() => { setIsEditing(false); fetchSettings(); }} className="bg-gray-100 text-gray-600 border-none">Cancel</Button>
                <Button type="primary" htmlType="submit" className="px-8 flex items-center justify-center gap-2">
                  <Check size={16} /> Save Terms
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {!terms.some(t => t.title?.trim() || t.content?.trim()) ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-gray-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
                    <FileText size={30} />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-secondary)] mb-2 font-[family-name:var(--font-heading)]">Enter the Details</h3>
                  <p className="text-[var(--text-muted)] text-sm max-w-xs mx-auto">Please enter your terms and conditions to include them in your documents.</p>
                  <Button onClick={startEditing} className="mt-6 flex items-center gap-2 mx-auto">
                    <Edit size={16} /> Enter Terms & Conditions
                  </Button>
                </div>
              ) : (
                terms.map((term, index) => (
                  <TermItem key={index} term={term} index={index} onView={setSelectedTerm} />
                ))
              )}
            </div>
          )}
        </div>
      )}

      <ViewTermDetailsModal
        isOpen={!!selectedTerm}
        onClose={() => setSelectedTerm(null)}
        term={selectedTerm}
      />

      <DeleteAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteAccount}
        user={user}
        loading={deleteLoading}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText="Delete"
        type="danger"
      />
    </div >
  );
}