import React, { useState, useEffect } from "react";
import { useAuth } from "../store/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CirclePlus, Database, Eye, Trash2, Download, X, IndianRupee } from "lucide-react";
import Button from "../components/ui/Button";
import SearchBar from "../components/ui/SearchBar";
import { useToast } from "../store/ToastContext";

import { formatDate } from "../utils/formatDate";
import { formatInvoiceNo } from "../utils/formatInvoiceNo";
import ConfirmModal from "../components/ui/ConfirmModal";


export default function InvoicePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token, clients } = useAuth();


  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [openViewInvoice, setOpenViewInvoice] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [settings, setSettings] = useState({
    company: {},
    billing: {},
    bankDetails: [],
    terms: []
  });
  /* ================= SEARCH STATE ================= */
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const itemsPerPage = 8;


  useEffect(() => {
    const query = searchParams.get("search");
    if (query) setSearchTerm(query);
  }, [searchParams]);

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.phoneNumber?.includes(searchTerm)
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on search
  }, [searchTerm]);

  const handleCreateNew = () => {
    navigate("/invoice");
  };

  // ✅ FETCH ALL INVOICES
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch("http://localhost:7000/api/invoice", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (data.success) {
          setInvoices(data.invoices);
        }
      } catch (error) {
        console.error("Failed to fetch invoices", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Fetch Settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) return;
      try {
        const response = await fetch("http://localhost:7000/api/settings", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, [token]);

  // 🔴 DELETE HANDLER
  const handleDeleteInvoice = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`http://localhost:7000/api/invoice/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setInvoices(invoices.filter((invoice) => invoice._id !== deleteId));
      } else {
        const errorText = await response.text();
        console.error("Delete failed:", errorText);
        toast.error(`Failed to delete invoice: ${response.status} ${response.statusText}`);

      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting invoice. Check console for details.");

    }
  };


  // ✅ STATUS UPDATE HANDLER
  const handleStatusChange = async (id, newStatus) => {
    const currentInvoice = invoices.find(inv => inv._id === id);
    if (currentInvoice?.status === "Success") {
      toast.warning("Success invoices are locked and cannot be changed");

      return;
    }

    try {
      const response = await fetch(`http://localhost:7000/api/invoice/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setInvoices(invoices.map(inv =>
          inv._id === id ? { ...inv, status: newStatus } : inv
        ));
      } else {
        toast.error("Failed to update status");

      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Error updating status");

    }
  };

  // ✅ PAYMENT SUBMIT HANDLER
  const handlePaymentSubmit = async (id, paymentData) => {
    try {
      const response = await fetch(`http://localhost:7000/api/invoice/${id}/payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        const result = await response.json();
        setInvoices(invoices.map(inv =>
          inv._id === id ? result.invoice : inv
        ));
        setOpenPaymentModal(false);
        toast.success("Payment recorded successfully");

      } else {
        toast.error("Failed to record payment");

      }
    } catch (error) {
      console.error("Payment submission error:", error);
      toast.error("Error recording payment");

    }
  };

  // 🖨️ DOWNLOAD/PRINT HANDLER
  const handleDownloadInvoice = (invoice) => {
    const printWindow = window.open('', '', 'width=800,height=600');

    const subtotal = invoice.totalAmount || 0;
    const tcs = invoice.tcs || 0;
    const discount = invoice.discount || 0;

    // Calculate or retrieve GST (9% CGST + 9% SGST = 18% Total Tax)
    const cgst = invoice.cgst !== undefined ? invoice.cgst : (subtotal * 9) / 100;
    const sgst = invoice.sgst !== undefined ? invoice.sgst : (subtotal * 9) / 100;
    const totalTax = invoice.totalTax !== undefined ? invoice.totalTax : (cgst + sgst);

    const grandTotal = invoice.grandTotal || (subtotal + tcs - discount + totalTax);
    const machines = invoice.machines || [];

    const company = settings.company || {};
    const bank = (settings.bankDetails && settings.bankDetails.length > 0) ? settings.bankDetails[0] : {};

    const invoiceNo = invoice.invoiceNo || (() => {
      const uniqueSeq = invoice._id ? invoice._id.slice(-4).toUpperCase() : "0000";
      const prefix = settings.billing?.invoicePrefix || "";
      const suffix = settings.billing?.invoiceSuffix || "";
      return `${prefix}${uniqueSeq}${suffix}`;
    })();

    const formattedDate = formatDate(invoice.issueDate, settings?.billing?.dateFormat);

    // Fallback for dueDate if not saved in older invoices
    const dueDate = invoice.dueDate || (() => {
      const days = parseInt(settings.billing?.creditDays || 0);
      const date = new Date(invoice.issueDate || new Date());
      date.setDate(date.getDate() + days);
      return date.toISOString().split('T')[0];
    })();
    const formattedDueDate = formatDate(dueDate, settings?.billing?.dateFormat);

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>Tax Invoice - ${invoice.clientName}</title>
    <style>
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 0; padding: 15px; font-size: 12px; }
        .invoice-container { width: 100%; max-width: 850px; margin: auto; border: 1px solid #1a5f7a; padding: 25px; background: #fff; }
        
        .header-row { display: flex; justify-content: space-between; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #1a5f7a; }
        .logo-address { flex: 1; }
        .logo-placeholder { font-size: 28px; font-weight: 800; color: #1a5f7a; margin-bottom: 5px; }
        .contact-details-right { text-align: right; line-height: 1.6; color: #444; }
        
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .section-box { border: 1px solid #d1d9e0; border-radius: 4px; overflow: hidden; }
        .section-title { background: #1a5f7a; color: #fff; padding: 6px 12px; font-weight: 600; text-transform: uppercase; font-size: 11px; }
        .content-padding { padding: 10px; line-height: 1.5; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f0f7ff; border: 1px solid #1a5f7a; padding: 8px; font-size: 11px; color: #1a5f7a; }
        td { border: 1px solid #d1d9e0; padding: 8px; text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }

        .footer-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; }
        
        .bank-qr-container { border: 1px solid #d1d9e0; border-radius: 4px; padding: 12px; display: flex; gap: 15px; background: #fafafa; }
        .bank-info { flex: 1; line-height: 1.6; }
        .qr-box { width: 90px; height: 90px; border: 1px solid #ccc; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 8px; }

        .totals-table { width: 100%; border: none; }
        .totals-table td { border: none; border-bottom: 1px solid #eee; padding: 5px; }
        .grand-total { background: #1a5f7a !important; color: #fff; font-weight: bold; font-size: 14px; }
        
        .signature-area { margin-top: 30px; text-align: right; }
        .auth-line { margin-top: 40px; border-top: 1px solid #000; display: inline-block; width: 180px; text-align: center; padding-top: 5px; }

        @media print {
            .no-print { display: none; }
            .invoice-container { border: none; padding: 0; }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div style="text-align: center; font-weight: bold; color: #1a5f7a; margin-bottom: 15px;">TAX INVOICE</div>
        
        <div class="header-row">
            <div class="logo-address">
                <div class="logo-placeholder">
                     ${company.logo ? `<img src="${company.logo}" style="max-height: 60px; object-fit: contain;">` : (company.businessName || 'JCB SAAS')}
                </div>
                <div style="font-weight: bold; font-size: 16px;">${company.businessName || '[MY COMPANY NAME]'}</div>
                <div>${company.address || '[Address Line 1]'}</div>
                <div>${company.city || ''} ${company.state || ''} ${company.pincode || ''}</div>
                ${company.gstNumber ? `<div>GSTIN: ${company.gstNumber}</div>` : ''}
            </div>
            
            <div class="contact-details-right">
                <strong>Name:</strong> ${company.fullName || '[My Contact Person]'}<br>
                <strong>Phone:</strong> ${company.phoneNumber || '[+91 XXXXX XXXXX]'}<br>
                <strong>Email:</strong> ${company.email || '[email@example.com]'}<br>
                <strong>Website:</strong> ${company.website || '[www.website.com]'}
            </div>
        </div>

        <div class="details-grid">
            <div class="section-box">
                <div class="section-title">Customer Detail</div>
                <div class="content-padding">
                    <strong>M/S ${invoice.clientName}</strong><br>
                        ${invoice.buildingName ? invoice.buildingName + ', ' : ''}
                        ${invoice.area ? invoice.area + '<br>' : ''}
                        ${invoice.city ? invoice.city + ', ' : ''}
                        ${invoice.state ? invoice.state : ''}
                        ${invoice.pinCode ? '- ' + invoice.pinCode : ''}<br>
                    Phone: ${invoice.phoneNumber}<br>
                    Email: ${invoice.email}<br>
                    ${invoice.contactPerson ? `Contact Person: ${invoice.contactPerson}<br>` : ''}
                    ${(invoice.gstNumber || (clients?.find(c => c.clientName === invoice.clientName)?.gstNumber)) ? `GSTIN: ${invoice.gstNumber || clients?.find(c => c.clientName === invoice.clientName)?.gstNumber}` : ''}
                </div>
            </div>
            
            <div class="section-box">
                <div class="section-title">Invoice Detail</div>
                <div class="content-padding">
                    <div style="display: flex; justify-content: space-between;"><span>Invoice No:</span> <strong>${invoiceNo}</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Date:</span> <strong>${formattedDate}</strong></div>
                    ${company.gstNumber ? `<div style="display: flex; justify-content: space-between;"><span>GSTIN:</span> <strong>${company.gstNumber}</strong></div>` : ''}
                    ${!settings?.billing?.hideCredit ? `<div style="display: flex; justify-content: space-between;"><span>Due Date:</span> <strong>${formattedDueDate}</strong></div>` : ''}
                    <div style="display: flex; justify-content: space-between;"><span>Place of Supply:</span> <strong>${invoice.state || ''}</strong></div>
                </div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Sr.</th>
                    <th>Product/Service</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${(() => {
        const minRows = 8;
        const rows = [...machines];
        while (rows.length < minRows) {
          rows.push(null);
        }

        return rows.map((item, i) => {
          if (!item) {
            return `<tr><td>${i + 1}</td><td></td><td></td><td></td><td></td></tr>`;
          }
          const price = parseFloat(item.price?.toString().replace(/[₹,]/g, '')) || 0;
          const hours = parseFloat(item.machineHours) || 0;
          const amount = price * hours;
          return `
                        <tr>
                            <td>${i + 1}</td>
                            <td class="text-left">${item.vehicle}</td>
                            <td>${hours}</td>
                            <td class="text-right">₹ ${price.toFixed(2)}</td>
                            <td class="text-right"><strong>₹ ${amount.toFixed(2)}</strong></td>
                        </tr>`;
        }).join('');
      })()}
            </tbody>
        </table>

        <div class="footer-grid">
            <div>
                <div class="bank-qr-container">
                    <div class="bank-info">
                        <strong style="color: #1a5f7a;">Bank Details</strong><br>
                        Bank: ${bank.bankName || '[BANK NAME]'}<br>
                        A/c Name: ${bank.accountName || '[ACCOUNT HOLDER]'}<br>
                        A/c No: ${bank.accountNo || '[ACCOUNT NUMBER]'}<br>
                        IFSC: ${bank.ifsc || '[IFSC CODE]'}<br>
                        UPI: ${bank.upiId || '[UPI ID]'}
                    </div>
                    <div class="qr-box">
                        ${bank.upiId ? `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${bank.upiId}&pn=${encodeURIComponent(company.businessName || '')}&am=${grandTotal.toFixed(2)}&tr=${invoiceNo}&tn=Invoice%20Payment&cu=INR" style="width:100%;" />` : '<span style="text-align:center;">No UPI</span>'}
                    </div>
                </div>
                <div style="font-size: 10px; margin-top: 10px; color: #666;">
                    <strong>Terms:</strong> 
                    ${settings.terms && settings.terms.length > 0
        ? settings.terms.map(t => t.content).join(' ')
        : '1. Goods once sold will not be taken back. 2. Interest @18% p.a. will be charged if payment is delayed.'}
                </div>
            </div>

            <div class="totals-section">
                <table class="totals-table">
                    <tr><td class="text-left">Taxable Amount</td><td class="text-right">${subtotal.toFixed(2)}</td></tr>
                    <tr><td class="text-left">CGST (9%)</td><td class="text-right">${cgst.toFixed(2)}</td></tr>
                    <tr><td class="text-left">SGST (9%)</td><td class="text-right">${sgst.toFixed(2)}</td></tr>
                    <tr><td class="text-left">Total Tax (18%)</td><td class="text-right">${totalTax.toFixed(2)}</td></tr>
                    <tr><td class="text-left">TCS</td><td class="text-right">+ ₹ ${tcs.toFixed(2)}</td></tr>
                    <tr><td class="text-left">Discount</td><td class="text-right">- ₹ ${discount.toFixed(2)}</td></tr>
                    <tr class="grand-total"><td class="text-left">Grand Total</td><td class="text-right">₹ ${grandTotal.toFixed(2)}</td></tr>
                </table>
                <div style="font-size: 10px; text-align: right; margin-top: 5px; font-weight: bold;">
                    (Inclusive of all taxes)
                </div>
                
                <div class="signature-area">
                    <div style="font-size: 11px;">For ${company.businessName || '[MY COMPANY NAME]'}</div>
                    <div class="auth-line">Authorised Signatory</div>
                </div>
            </div>
        </div>
    </div>
    <script>
        setTimeout(() => {
            window.print();
        }, 500);
    </script>
</body>
</html>
    `);
    printWindow.document.close();
    printWindow.focus();
  };

  return (
    <>
      <div className='flex justify-between mb-3'>
        <SearchBar
          placeholder="Search Invoice"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-40 sm:w-64 lg:min-w-96"
        />
        <Button type="addbtn" onClick={handleCreateNew} className="shadow-lg shadow-[var(--color-primary)]/10">
          <CirclePlus className="w-4 h-4" /> <span className="hidden sm:inline">Create New Invoice</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-[var(--bg-card)] rounded-2xl border border-white/10 shadow-xl">
          <div className="w-10 h-10 border-4 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
          <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[10px]">Loading Records...</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-[var(--bg-card)] rounded-2xl border border-white/10 shadow-xl">
          <div className="p-4 bg-white/5 rounded-full mb-4">
            <Database className="w-10 h-10 text-[var(--text-muted)] opacity-50" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Invoices Found</h2>
          <p className="text-sm text-[var(--text-muted)] max-w-xs text-center">
            There are no invoice records available. Start by creating a new invoice.
          </p>
        </div>
      ) : (
        <>
          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden md:block w-full overflow-x-auto bg-[var(--bg-card)] rounded-xl border border-white/10 shadow-lg">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-white/5 text-[var(--text-muted)] uppercase text-[10px] font-black tracking-widest">
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left">Invoice No.</th>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Total</th>
                  <th className="px-6 py-4 text-left">Payment Type</th>
                  <th className="px-6 py-4 text-left">Outstanding</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentInvoices.map((invoice, index) => {
                  const absoluteIndex = indexOfFirstItem + index + 1;
                  const totalPaid = (invoice.payments || []).reduce((sum, p) => sum + p.amount, 0);
                  const totalTax = invoice.totalTax !== undefined ? invoice.totalTax : ((invoice.totalAmount || 0) * 0.18);
                  const totalAmount = invoice.grandTotal || ((invoice.totalAmount || 0) + (invoice.tcs || 0) - (invoice.discount || 0) + totalTax);
                  const outstanding = totalAmount - totalPaid;
                  const lastPaymentMethod = invoice.payments && invoice.payments.length > 0
                    ? invoice.payments[invoice.payments.length - 1].method
                    : invoice.paymentMode;

                  return (
                    <tr
                      key={invoice._id}
                      className={`border-b border-white/5 text-white hover:bg-white/5 transition
                      ${index % 2 === 0 ? "bg-[var(--bg-card)]" : "bg-[var(--bg-main)]"}`}
                    >
                      <td className="px-6 py-4 font-mono font-bold text-[var(--color-primary)]">
                        {invoice.invoiceNo || formatInvoiceNo(
                          settings.billing?.invoicePrefix || "INV-",
                          settings.billing?.invoiceSuffix || "",
                          invoice.sequence || String(absoluteIndex).padStart(3, '0'),
                          invoice.issueDate
                        )}
                      </td>
                      <td className="px-6 py-4">{invoice.clientName}</td>
                      <td className="px-6 py-4">{formatDate(invoice.issueDate, settings?.billing?.dateFormat)}</td>
                      <td className="px-6 py-4 font-bold text-white">
                        ₹ {totalAmount.toFixed(2)}
                      </td>
                      <td
                        className="px-6 py-4 cursor-help group relative"
                        title={`Last Payment: ${lastPaymentMethod || 'None'}\nOutstanding: ₹${outstanding.toFixed(2)}\nPayment Type: ${invoice.paymentMode}`}
                      >
                        {outstanding > 0 ? (
                          <button
                            onClick={() => { setSelectedInvoice(invoice); setOpenPaymentModal(true); }}
                            className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors uppercase tracking-wider"
                          >
                            Credit
                          </button>
                        ) : (
                          <span className="text-green-400 font-medium">{lastPaymentMethod || "Paid"}</span>
                        )}
                      </td>
                      <td className={`px-6 py-4 font-bold ${outstanding > 0 ? "text-red-400" : "text-green-400"}`}>
                        ₹ {outstanding.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 flex gap-3">
                        <button
                          onClick={() => { setSelectedInvoice(invoice); setOpenViewInvoice(true); }}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl text-blue-400 hover:text-blue-300 transition-all"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoice._id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 hover:text-red-300 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ================= MOBILE VIEW ================= */}
          <div className="md:hidden w-full space-y-4">
            {currentInvoices.map((invoice) => {
              const totalPaid = (invoice.payments || []).reduce((sum, p) => sum + p.amount, 0);
              const totalTax = invoice.totalTax !== undefined ? invoice.totalTax : ((invoice.totalAmount || 0) * 0.18);
              const totalAmount = invoice.grandTotal || ((invoice.totalAmount || 0) + (invoice.tcs || 0) - (invoice.discount || 0) + totalTax);
              const outstanding = totalAmount - totalPaid;
              const lastPaymentMethod = invoice.payments && invoice.payments.length > 0
                ? invoice.payments[invoice.payments.length - 1].method
                : invoice.paymentMode;

              return (
                <div key={invoice._id} className="bg-[var(--bg-card)] p-4 rounded-xl border border-white/10 shadow-sm transition hover:border-orange-500/30">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-bold">{invoice.clientName}</h4>
                        <span className="text-[10px] font-mono font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-1.5 py-0.5 rounded">
                          {invoice.invoiceNo || formatInvoiceNo(
                            settings.billing?.invoicePrefix || "INV-",
                            settings.billing?.invoiceSuffix || "",
                            invoice.sequence || "000",
                            invoice.issueDate
                          )}
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] tracking-wider uppercase">{formatDate(invoice.issueDate, settings?.billing?.dateFormat)}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-[var(--color-primary)] font-bold">₹ {totalAmount.toFixed(2)}</div>
                      <div className={`text-[10px] font-bold uppercase tracking-tighter ${outstanding > 0 ? "text-red-400" : "text-green-400"}`}>
                        O/S: ₹ {outstanding.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3 border-y border-white/5 my-3">
                    <div
                      className="text-xs cursor-help"
                      title={`Last Payment: ${lastPaymentMethod || 'None'}\nOutstanding: ₹${outstanding.toFixed(2)}\nPayment Type: ${invoice.paymentMode}`}
                    >
                      <span className="text-[var(--text-muted)] mr-2 uppercase text-[10px] font-bold">Type:</span>
                      {outstanding > 0 ? (
                        <button
                          onClick={() => { setSelectedInvoice(invoice); setOpenPaymentModal(true); }}
                          className="px-2.5 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider"
                        >
                          Credit
                        </button>
                      ) : (
                        <span className="text-green-400 font-bold uppercase text-[10px]">{lastPaymentMethod || "Paid"}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedInvoice(invoice); setOpenViewInvoice(true); }}
                        className="p-2 bg-white/5 rounded-lg text-slate-400"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(invoice)}
                        className="p-2 bg-blue-500/10 rounded-lg text-blue-400"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(invoice._id)}
                        className="p-2 bg-red-500/10 rounded-lg text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= PAGINATION CONTROLS ================= */}
          {totalPages > 1 && (
            <div className="flex justify-end items-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-[var(--bg-card)] border border-white/10 rounded-lg text-[var(--text-muted)] disabled:opacity-50 hover:bg-white/5 transition"
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 rounded-lg transition ${currentPage === i + 1
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--bg-card)] border border-white/10 text-[var(--text-muted)] hover:bg-white/5"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-[var(--bg-card)] border border-white/10 rounded-lg text-[var(--text-muted)] disabled:opacity-50 hover:bg-white/5 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {openPaymentModal && selectedInvoice && (
        <PaymentModal
          invoice={selectedInvoice}
          onClose={() => setOpenPaymentModal(false)}
          onSubmit={handlePaymentSubmit}
        />
      )}

      {openViewInvoice && selectedInvoice && (
        <ViewModal
          invoice={selectedInvoice}
          onClose={() => setOpenViewInvoice(false)}
          settings={settings}
          clients={clients}
          handleStatusChange={handleStatusChange}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </>
  );
}

function PaymentModal({ invoice, onClose, onSubmit }) {
  const [paymentData, setPaymentData] = useState({
    date: new Date().toISOString().split('T')[0],
    method: "Cash",
    amount: "",
    note: ""
  });

  const totalPaid = (invoice.payments || []).reduce((sum, p) => sum + p.amount, 0);
  const totalTax = invoice.totalTax !== undefined ? invoice.totalTax : ((invoice.totalAmount || 0) * 0.18);
  const totalAmount = invoice.grandTotal || ((invoice.totalAmount || 0) + (invoice.tcs || 0) - (invoice.discount || 0) + totalTax);
  const outstanding = totalAmount - totalPaid;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!paymentData.amount || paymentData.amount <= 0) {
      toast.warning("Please enter a valid amount");

      return;
    }
    onSubmit(invoice._id, { ...paymentData, amount: parseFloat(paymentData.amount) });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h3 className="text-slate-900 font-black text-lg uppercase tracking-wider">Record Payment</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Settling Invoice: {invoice.invoiceNo}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-900">
              <span className="text-[10px] uppercase font-black text-slate-500 block mb-1 tracking-widest">Total Bill</span>
              <span className="font-black text-lg font-mono">₹ {totalAmount.toFixed(2)}</span>
            </div>
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
              <span className="text-[10px] uppercase font-black text-red-500/60 block mb-1 tracking-widest">Outstanding</span>
              <span className="text-red-600 font-black text-lg font-mono">₹ {outstanding.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Date</label>
                <input
                  type="date"
                  required
                  value={paymentData.date}
                  onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-[var(--color-primary)] outline-none transition-all font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-[var(--color-primary)] outline-none transition-all cursor-pointer font-bold appearance-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount to Pay</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-900 font-black text-lg">₹</span>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  max={outstanding}
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full pl-10 pr-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-[var(--color-primary)] outline-none transition-all font-black text-xl placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Note (Optional)</label>
              <textarea
                placeholder="Ref no, Received by..."
                value={paymentData.note}
                onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-[var(--color-primary)] outline-none transition-all h-24 resize-none text-sm placeholder:text-slate-400 shadow-inner"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all border border-slate-200 uppercase tracking-widest text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-3 px-4 py-4 rounded-2xl bg-[var(--color-primary)] text-black font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[var(--color-primary)]/20 uppercase tracking-widest text-xs"
            >
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewModal({ invoice, onClose, settings, handleStatusChange, clients }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-card)] w-full sm:max-w-md rounded-2xl border border-white/10 shadow-xl">
        <div className="px-5 py-4 border-b border-white/10 text-[var(--text-primary)] font-black text-lg flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold">Invoice Details</span>
            <span className="text-[var(--color-primary)] font-mono tracking-tighter">
              {invoice.invoiceNo || formatInvoiceNo(
                settings.billing?.invoicePrefix || "INV-",
                settings.billing?.invoiceSuffix || "",
                invoice.sequence || "---",
                invoice.issueDate
              )}
            </span>
          </div>
          <select
            value={invoice.status || "Pending"}
            onChange={(e) => {
              handleStatusChange(invoice._id, e.target.value);
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-0 outline-none transition-all
                    ${invoice.status === "Success"
                ? "bg-green-500 text-black cursor-not-allowed pointer-events-none"
                : "bg-yellow-500 text-black cursor-pointer"}`}
          >
            <option value="Pending">Pending</option>
            <option value="Success">Success</option>
          </select>
        </div>
        <div className="px-5 py-4 space-y-4 text-[var(--text-primary)] text-sm max-h-[70vh] overflow-y-auto">
          <DetailRow label="Client Name">{invoice.clientName}</DetailRow>
          <DetailRow label="Phone">{invoice.phoneNumber}</DetailRow>
          <DetailRow label="Email">{invoice.email}</DetailRow>
          <DetailRow label="GSTIN">{invoice.gstNumber || (clients?.find(c => c.clientName === invoice.clientName)?.gstNumber) || "---"}</DetailRow>
          <DetailRow label="Date">{formatDate(invoice.issueDate, settings?.billing?.dateFormat)}</DetailRow>
          {!settings?.billing?.hideCredit && (
            <DetailRow label="Due Date">{formatDate(invoice.dueDate || (() => {
              const days = parseInt(settings.billing?.creditDays || 0);
              const date = new Date(invoice.issueDate || new Date());
              date.setDate(date.getDate() + days);
              return date.toISOString().split('T')[0];
            })(), settings?.billing?.dateFormat)}</DetailRow>
          )}
          <DetailRow label="Payment Mode">{invoice.paymentMode}</DetailRow>

          <div className="pt-2 border-t border-white/10 space-y-2">
            {settings.company?.gstNumber && <DetailRow label="My GSTIN">{settings.company.gstNumber}</DetailRow>}
            <DetailRow label="Taxable Amount">₹ {(invoice.totalAmount || 0).toFixed(2)}</DetailRow>
            <DetailRow label="TCS (+)">₹ {(invoice.tcs || 0).toFixed(2)}</DetailRow>
            <DetailRow label={invoice.discountPercent ? `Discount (- ${invoice.discountPercent}%)` : "Discount (-)"}>₹ {(invoice.discount || 0).toFixed(2)}</DetailRow>

            {/* Added GST Breakdown */}
            <DetailRow label="CGST (9%)">₹ {(invoice.cgst !== undefined ? invoice.cgst : (invoice.totalAmount * 0.09)).toFixed(2)}</DetailRow>
            <DetailRow label="SGST (9%)">₹ {(invoice.sgst !== undefined ? invoice.sgst : (invoice.totalAmount * 0.09)).toFixed(2)}</DetailRow>
            <DetailRow label="Total Tax (18%)">₹ {(invoice.totalTax !== undefined ? invoice.totalTax : (invoice.totalAmount * 0.18)).toFixed(2)}</DetailRow>

            <DetailRow label="Grand Total">
              <span className="text-[var(--color-primary)] text-lg">₹ {(invoice.grandTotal || (invoice.totalAmount + (invoice.tcs || 0) - (invoice.discount || 0) + (invoice.totalAmount * 0.18))).toFixed(2)}</span>
            </DetailRow>
          </div>

          {invoice.payments && invoice.payments.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-widest">Payment History</h4>
              <div className="space-y-3">
                {invoice.payments.map((p, i) => (
                  <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                    <div>
                      <div className="text-white font-bold">{p.method}</div>
                      <div className="text-[10px] text-slate-400">{formatDate(p.date, settings?.billing?.dateFormat)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">₹ {p.amount.toFixed(2)}</div>
                      {p.note && <div className="text-[9px] text-slate-500 italic truncate max-w-[100px]">{p.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-center px-1">
                <span className="text-xs text-slate-400 uppercase font-bold">Total Paid</span>
                <span className="text-green-400 font-bold">₹ {invoice.payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center px-1 mt-1">
                <span className="text-xs text-slate-400 uppercase font-bold">Outstanding</span>
                <span className="text-orange-400 font-bold">
                  ₹ {((invoice.grandTotal || (invoice.totalAmount + (invoice.tcs || 0) - (invoice.discount || 0))) - invoice.payments.reduce((sum, p) => sum + p.amount, 0)).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-white/10 flex justify-end">
          <Button onClick={onClose} type="addbtn">Close</Button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase text-[var(--text-muted)] tracking-wider">
        {label}
      </span>
      <span className="font-medium text-white">{children}</span>
    </div>
  );
}
