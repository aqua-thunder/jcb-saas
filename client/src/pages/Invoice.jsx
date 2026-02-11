import { CirclePlus, Plus, Save, Trash2, Search, ChevronDown, Check, Building, FileText, Wallet, Hash } from 'lucide-react';
import Input from "../components/ui/Input";
import { useState, useEffect, useRef } from "react";
import Button from "../components/ui/Button";
import machineData from "../assets/data/machine";
import { useAuth } from "../store/auth";
import { formatDate } from "../utils/formatDate";
import { formatInvoiceNo } from "../utils/formatInvoiceNo";

export default function Reports() {
    const { token, clients, machine: availableMachines } = useAuth(); // Renamed machine -> availableMachines

    // Form State
    const [invoice, setInvoice] = useState({
        clientName: "",
        phoneNumber: "",
        email: "",
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: "",
        paymentMode: "Credit",
        buildingName: "",
        area: "",
        city: "",
        state: "",
        pinCode: "",
        vehicle: "",
        machineHours: "",
        driver: "",
        driverHours: "",
        status: "Pending",
        remember: false,
        tcs: 0,
        tcsType: "Amount",
        discount: 0,
        discountType: "%",
        contactPerson: "",
        gstNumber: "",
    });

    // Settings State
    const [settings, setSettings] = useState({
        company: {},
        billing: {},
        bankDetails: [],
        terms: []
    });
    const [selectedBank, setSelectedBank] = useState(0);
    const [selectedTerms, setSelectedTerms] = useState([]);

    // Machines State
    const [machines, setMachines] = useState([
        { vehicle: '', machineHours: '', price: '' }
    ]);
    const [nextSequence, setNextSequence] = useState("001");

    // Client Search State
    const [clientSearch, setClientSearch] = useState("");
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [filteredClientsList, setFilteredClientsList] = useState([]);

    // Bank & Terms Search State
    const [bankSearch, setBankSearch] = useState("");
    const [showBankDropdown, setShowBankDropdown] = useState(false);
    const [termSearch, setTermSearch] = useState("");

    const [loading, setLoading] = useState(false);
    const clientDropdownRef = useRef(null);

    const [activeMachineDropdown, setActiveMachineDropdown] = useState(null);
    const bankDropdownRef = useRef(null);

    // Function to handle clicking outside dropdowns (Machines & Bank)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeMachineDropdown !== null && !event.target.closest('.machine-dropdown-container')) {
                setActiveMachineDropdown(null);
            }
            if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target)) {
                setShowBankDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeMachineDropdown]);

    const selectMachine = (index, selectedMachine) => {
        const updatedMachines = [...machines];
        updatedMachines[index].vehicle = selectedMachine.vehicleNumber || selectedMachine.name;

        if (selectedMachine.rentalRate) {
            updatedMachines[index].price = selectedMachine.rentalRate.toString();
        }

        setMachines(updatedMachines);
        setActiveMachineDropdown(null);
    };

    // Locked state for client info
    const [isExistingClient, setIsExistingClient] = useState(false);

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
                    // Select all terms by default
                    if (data.terms) {
                        setSelectedTerms(data.terms.map((_, i) => i));
                    }
                    // Auto-set billing defaults if available
                    if (data.billing) {
                        // You could set some defaults here if needed
                    }
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };

        const fetchNextSequence = async () => {
            if (!token) return;
            try {
                const res = await fetch("http://localhost:7000/api/invoice/next-sequence", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.nextSequence) setNextSequence(data.nextSequence);
                }
            } catch (error) {
                console.error("Error fetching sequence", error);
            }
        }

        fetchSettings();
        fetchNextSequence();
    }, [token]);

    // Calculate Due Date when Issue Date or Credit Days change
    useEffect(() => {
        if (invoice.issueDate) {
            const days = parseInt(settings.billing?.creditDays || 0);
            const date = new Date(invoice.issueDate);
            date.setDate(date.getDate() + days);
            const due = date.toISOString().split('T')[0];
            setInvoice(prev => ({ ...prev, dueDate: due }));
        }
    }, [invoice.issueDate, settings.billing?.creditDays]);

    // Filter Clients
    useEffect(() => {
        if (!isExistingClient) {
            if (clientSearch) {
                const filtered = clients.filter(c =>
                    c.clientName.toLowerCase().includes(clientSearch.toLowerCase()) ||
                    c.phoneNumber.includes(clientSearch)
                );
                setFilteredClientsList(filtered);
            } else {
                setFilteredClientsList(clients); // Show all clients if search is empty
            }
        } else {
            setFilteredClientsList([]);
        }
    }, [clientSearch, clients, isExistingClient]);

    // Handle Client Selection
    const selectClient = (client) => {
        setInvoice(prev => ({
            ...prev,
            clientName: client.clientName,
            phoneNumber: client.phoneNumber,
            email: client.email,
            contactPerson: client.contactPerson || "",
            gstNumber: client.gstNumber || "",
            buildingName: client.billingAddress || "", // Save full address to buildingName for now
            area: "",
            city: client.city,
            state: client.state,
            pinCode: client.pincode
        }));
        setClientSearch(client.clientName);
        setShowClientDropdown(false);
        setIsExistingClient(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInvoice(prev => ({ ...prev, [name]: value }));

        if (name === 'clientName') {
            setClientSearch(value);
            setShowClientDropdown(true);
            if (isExistingClient) {
                setIsExistingClient(false); // Unlock if user types in name manually
            }
        }
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target)) {
                setShowClientDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Removed duplicate handleChange function

    // unique company list (ONLY ONCE)
    const companyList = [
        ...new Set(machineData.map(item => item.company))
    ];



    const handleMachineChange = (index, e) => {
        const updated = [...machines];
        updated[index][e.target.name] = e.target.value;
        setMachines(updated);
    };

    const addMachine = () => {
        setMachines([...machines, { vehicle: "", machineHours: "", price: "" }]);
    };

    const removeMachine = (index) => {
        if (machines.length > 1) {
            const updated = machines.filter((_, i) => i !== index);
            setMachines(updated);
        } else {
            alert("At least one machine detail is required.");
        }
    };

    // Function to save invoice to database
    const saveInvoiceToDB = async () => {
        // Calculate total
        const subtotal = machines.reduce((sum, machine) => {
            const price = parseFloat(machine.price.replace(/[₹,]/g, '')) || 0;
            const hours = parseFloat(machine.machineHours) || 0;
            return sum + (price * hours);
        }, 0);

        const tcs = invoice.tcsType === "%"
            ? (subtotal * (parseFloat(invoice.tcs) || 0)) / 100
            : (parseFloat(invoice.tcs) || 0);

        const discountAmount = invoice.discountType === "%"
            ? (subtotal * (parseFloat(invoice.discount) || 0)) / 100
            : (parseFloat(invoice.discount) || 0);

        // GST Calculations (9% CGST + 9% SGST = 18% Total Tax)
        const cgst = (subtotal * 9) / 100;
        const sgst = (subtotal * 9) / 100;
        const totalTax = cgst + sgst;

        const grandTotal = subtotal + tcs - discountAmount + totalTax;

        // Prepare invoice data
        // Generate final invoice number using the editable sequence
        const finalInvoiceNo = formatInvoiceNo(
            settings.billing?.invoicePrefix,
            settings.billing?.invoiceSuffix,
            nextSequence,
            invoice.issueDate
        );

        const invoiceData = {
            ...invoice,
            vehicle: machines[0]?.vehicle || "",
            machineHours: machines[0]?.machineHours || "",
            machines: machines,
            totalAmount: subtotal,
            tcs: tcs,
            tcsType: invoice.tcsType,
            discount: discountAmount, // Store the calculated discount amount
            discountType: invoice.discountType,
            discountValue: parseFloat(invoice.discount) || 0,
            cgst: cgst,
            sgst: sgst,
            totalTax: totalTax,
            grandTotal: grandTotal,
            invoiceNo: finalInvoiceNo,
            sequence: nextSequence
        };

        try {
            setLoading(true);

            // Add at the top of your component file, outside the component
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

            // Then in your saveInvoiceToDB function:
            const response = await fetch(`${API_BASE_URL}/invoice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(invoiceData)
            });



            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            return {
                success: true,
                invoiceId: result.invoiceId || result.invoice?._id,
                invoiceNo: result.invoiceNo || result.invoice?.invoiceNo,
                total: grandTotal
            };
        } catch (error) {
            console.error('Error saving invoice:', error);
            return {
                success: false,
                error: error.message
            };
        } finally {
            setLoading(false);
        }
    };

    // Save Only handler
    const handleSaveOnly = async () => {
        // Validate required fields
        if (!invoice.clientName || !invoice.phoneNumber || !invoice.issueDate) {
            alert("Please fill required fields (Name, Phone, Date)");
            return;
        }

        // Check if at least one machine is filled
        const hasValidMachine = machines.some(machine =>
            machine.vehicle && machine.machineHours && machine.price
        );

        if (!hasValidMachine) {
            alert("Please add at least one machine with all details");
            return;
        }

        const result = await saveInvoiceToDB();
        if (result.success) {
            alert("Invoice saved successfully!");
            // Optional: Redirect or clear form
        } else {
            alert(`Failed to save invoice: ${result.error || "Unknown error"}`);
        }
    }

    // Updated download function matching InvoicePage.jsx format
    const handleDownloadInvoice = async () => {
        // Validate required fields
        if (!invoice.clientName || !invoice.phoneNumber || !invoice.issueDate) {
            alert("Please fill required fields (Name, Phone, Date)");
            return;
        }

        // Check if at least one machine is filled
        const hasValidMachine = machines.some(machine =>
            machine.vehicle && machine.machineHours && machine.price
        );

        if (!hasValidMachine) {
            alert("Please add at least one machine with all details");
            return;
        }

        // Save to database first
        let saveResult = { success: false };
        try {
            saveResult = await saveInvoiceToDB();
        } catch (e) { console.error(e); }

        if (!saveResult.success) {
            alert(`Failed to save invoice: ${saveResult.error || "Unknown error"}`);
            return;
        }

        // Calculate total
        const subtotal = machines.reduce((sum, machine) => {
            const price = parseFloat(machine.price.replace(/[₹,]/g, '')) || 0;
            const hours = parseFloat(machine.machineHours) || 0;
            return sum + (price * hours);
        }, 0);

        const tcs = invoice.tcsType === "%"
            ? (subtotal * (parseFloat(invoice.tcs) || 0)) / 100
            : (parseFloat(invoice.tcs) || 0);

        const discountAmount = invoice.discountType === "%"
            ? (subtotal * (parseFloat(invoice.discount) || 0)) / 100
            : (parseFloat(invoice.discount) || 0);

        // GST Calculations (9% CGST + 9% SGST = 18% Total Tax)
        const cgst = (subtotal * 9) / 100;
        const sgst = (subtotal * 9) / 100;
        const totalTax = cgst + sgst;

        const grandTotal = subtotal + tcs - discountAmount + totalTax;

        // Get settings data
        const company = settings.company || {};
        const bank = (settings.bankDetails && settings.bankDetails[selectedBank]) || {};
        const activeTerms = (settings.terms || []).filter((_, i) => selectedTerms.includes(i));

        // Format Invoice Number
        const invoiceNo = saveResult.invoiceNo || "INV-001";

        // Date Formatting
        const formattedDate = formatDate(invoice.issueDate, settings?.billing?.dateFormat);
        const dueDateRaw = invoice.dueDate || (() => {
            const days = parseInt(settings.billing?.creditDays || 0);
            const date = new Date(invoice.issueDate || new Date());
            date.setDate(date.getDate() + days);
            return date.toISOString().split('T')[0];
        })();
        const formattedDueDate = formatDate(dueDateRaw, settings?.billing?.dateFormat);

        // Create print window containing settings data
        const printWindow = window.open('', '', 'width=800,height=600');

        printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>Tax Invoice - ${invoice.clientName}</title>
    <style>
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 0; padding: 15px; font-size: 12px; }
        .invoice-container { width: 100%; max-width: 850px; margin: auto; border: 1px solid #1a5f7a; padding: 25px; background: #fff; }
        
        /* Header Section */
        .header-row { display: flex; justify-content: space-between; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #1a5f7a; }
        .logo-address { flex: 1; }
        .logo-placeholder { font-size: 28px; font-weight: 800; color: #1a5f7a; margin-bottom: 5px; }
        .contact-details-right { text-align: right; line-height: 1.6; color: #444; }
        
        /* Information Grid */
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .section-box { border: 1px solid #d1d9e0; border-radius: 4px; overflow: hidden; }
        .section-title { background: #1a5f7a; color: #fff; padding: 6px 12px; font-weight: 600; text-transform: uppercase; font-size: 11px; }
        .content-padding { padding: 10px; line-height: 1.5; }

        /* Items Table */
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f0f7ff; border: 1px solid #1a5f7a; padding: 8px; font-size: 11px; color: #1a5f7a; }
        td { border: 1px solid #d1d9e0; padding: 8px; text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }

        /* Footer Grid */
        .footer-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; }
        
        /* Bank Details with QR */
        .bank-qr-container { border: 1px solid #d1d9e0; border-radius: 4px; padding: 12px; display: flex; gap: 15px; background: #fafafa; }
        .bank-info { flex: 1; line-height: 1.6; }
        .qr-box { width: 90px; height: 90px; border: 1px solid #ccc; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 8px; }

        /* Totals */
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
                        return `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            `;
                    }
                    const price = parseFloat(item.price.replace(/[₹,]/g, '')) || 0;
                    const qty = parseFloat(item.machineHours) || 0;
                    const amt = price * qty;
                    return `
                            <tr>
                                <td>${i + 1}</td>
                                <td class="text-left">${item.vehicle}</td>
                                <td>${qty}</td>
                                <td>₹ ${price.toFixed(2)}</td>
                                <td class="text-right"><strong>₹ ${amt.toFixed(2)}</strong></td>
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
                    ${activeTerms.length > 0
                ? activeTerms.map(t => t.content).join(' ')
                : '1. Goods once sold will not be taken back. 2. Interest @18% p.a. will be charged if payment is delayed.'}
                </div>
            </div>

            <div class="totals-section">
                <table class="totals-table">
                    <tr><td class="text-left">Taxable Amount</td><td class="text-right">${subtotal.toFixed(2)}</td></tr>
                    <tr><td class="text-left">CGST (9%)</td><td class="text-right">${cgst.toFixed(2)}</td></tr>
                    <tr><td class="text-left">SGST (9%)</td><td class="text-right">${sgst.toFixed(2)}</td></tr>
                    <tr><td class="text-left">Total Tax (18%)</td><td class="text-right">${totalTax.toFixed(2)}</td></tr>
                    <tr><td class="text-left">TCS ${invoice.tcsType === "%" ? `(${invoice.tcs}%)` : ''}</td><td class="text-right">+ ₹ ${tcs.toFixed(2)}</td></tr>
                    <tr><td class="text-left">Discount ${invoice.discountType === "%" ? `(${invoice.discount}%)` : ''}</td><td class="text-right">- ₹ ${discountAmount.toFixed(2)}</td></tr>
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
        setTimeout(() => window.print(), 500);
    </script>
</body>
</html>
    `);

        printWindow.document.close();
        printWindow.focus();
    };

    const subtotal = machines.reduce((sum, machine) => {
        const price = parseFloat(machine.price.replace(/[₹,]/g, '')) || 0;
        const hours = parseFloat(machine.machineHours) || 0;
        return sum + (price * hours);
    }, 0);
    const cgst = (subtotal * 9) / 100;
    const sgst = (subtotal * 9) / 100;
    const totalTax = cgst + sgst;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            <div className="w-full flex justify-center">
                <div className="w-full max-w-7xl">
                    <div className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-white shadow-xl">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 border-b border-gray-100 pb-4 gap-4">
                            <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
                                Generate Invoice
                            </h1>
                        </div>

                        <form className="flex flex-col gap-8">

                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Section: Client Details (50%) */}
                                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm relative z-20 flex-1">
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 sm:mb-6 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
                                        Client Information
                                    </h2>

                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Searchable Client Name */}
                                        <div className="relative group">
                                            <label className="text-[var(--color-dark)] uppercase tracking-wider text-xs font-bold block mb-2 ml-1">Client Name</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="clientName"
                                                    value={clientSearch}
                                                    onChange={handleChange}
                                                    onFocus={() => setShowClientDropdown(true)}
                                                    onClick={() => setShowClientDropdown(true)}
                                                    placeholder="Search or select client..."
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                                                    autoComplete="off"
                                                />
                                                <Search className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4" />
                                                {loading && <div className="absolute right-3 top-3.5 w-4 h-4 border-2 border-gray-300 border-t-[var(--color-primary)] rounded-full animate-spin"></div>}
                                            </div>

                                            {/* Dropdown */}
                                            {showClientDropdown && filteredClientsList.length > 0 && (
                                                <div
                                                    ref={clientDropdownRef}
                                                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                                                >
                                                    {filteredClientsList.map(client => (
                                                        <div
                                                            key={client._id}
                                                            onClick={() => selectClient(client)}
                                                            className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-none group/item"
                                                        >
                                                            <div className="font-bold text-gray-800 group-hover/item:text-[var(--color-primary)]">{client.clientName}</div>
                                                            <div className="text-xs text-gray-500 flex justify-between">
                                                                <span>{client.phoneNumber}</span>
                                                                <span>{client.city}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4 pt-4">
                                            {/* Row 1: Phone & Email */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Phone Number</span>
                                                    <span className="font-bold text-gray-800 truncate">{invoice.phoneNumber || "---"}</span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Email Address</span>
                                                    <span className="font-bold text-gray-800 truncate">{invoice.email || "---"}</span>
                                                </div>
                                            </div>

                                            {/* Row 2: Contact Person & GST */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Contact Person</span>
                                                    <span className="font-bold text-gray-800 truncate">{invoice.contactPerson || "---"}</span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">GSTIN</span>
                                                    <span className="font-bold text-gray-800 truncate">{invoice.gstNumber || "---"}</span>
                                                </div>
                                            </div>

                                            {/* Row 3: Address */}
                                            <div className="flex flex-col gap-1 pt-2 border-t border-gray-50">
                                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Address</span>
                                                <span className="font-bold text-gray-700 leading-relaxed">
                                                    {invoice.buildingName ? invoice.buildingName : ""}
                                                    {invoice.city ? `, ${invoice.city}` : ""}
                                                    {invoice.state ? `, ${invoice.state}` : ""}
                                                    {invoice.pinCode ? ` - ${invoice.pinCode}` : ""}
                                                    {!invoice.buildingName && !invoice.city && !invoice.state && !invoice.pinCode && "---"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Invoice Details (50%) */}
                                <div className="flex-1 flex flex-col gap-6">
                                    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm z-10 flex-1">
                                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 sm:mb-6 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                            Invoice Details
                                        </h2>

                                        {/* Invoice Number Preview - MOVED HERE */}
                                        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="grid grid-cols-2 gap-4 items-end">

                                                {/* LEFT: Sequence Number */}
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                                                        Sequence No.
                                                    </label>

                                                    <Input
                                                        value={nextSequence}
                                                        onChange={(e) => setNextSequence(e.target.value)}
                                                        className="font-mono font-bold text-lg bg-white h-12 text-center"
                                                    />
                                                </div>

                                                {/* RIGHT: Preview */}
                                                <div className="text-center">
                                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                                        Preview
                                                    </div>

                                                    <div className="font-mono text-xl font-black text-gray-800 tracking-tight break-all bg-white h-12 flex items-center justify-center">
                                                        {formatInvoiceNo(
                                                            settings.billing?.invoicePrefix,
                                                            settings.billing?.invoiceSuffix,
                                                            nextSequence,
                                                            invoice.issueDate
                                                        )}
                                                    </div>
                                                </div>

                                            </div>
                                            {settings.company?.gstNumber && (
                                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
                                                    <span className="text-gray-400 font-bold uppercase tracking-widest">My GSTIN</span>
                                                    <span className="text-gray-800 font-black font-mono">{settings.company.gstNumber}</span>
                                                </div>
                                            )}
                                        </div>


                                        <div className="grid grid-cols-1 gap-6">
                                            {/* Sequence No. & Preview */}
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div className="grid grid-cols-2 gap-4 items-end">
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1 flex items-center gap-1.5">
                                                            <Hash size={10} /> Sequence No.
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                value={nextSequence}
                                                                onChange={(e) => setNextSequence(e.target.value)}
                                                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-mono font-black text-sm text-center focus:border-[var(--color-primary)] outline-none transition-all shadow-inner"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Preview</label>
                                                        <div className="py-2.5 px-2 bg-white rounded-xl border border-slate-200 font-mono text-[11px] font-black text-[var(--color-primary)] tracking-tighter truncate shadow-sm">
                                                            {formatInvoiceNo(
                                                                settings.billing?.invoicePrefix || "INV-",
                                                                settings.billing?.invoiceSuffix || "",
                                                                nextSequence,
                                                                invoice.issueDate
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <Input label="Issue Date" type="date" name="issueDate" value={invoice.issueDate} onChange={handleChange} required />
                                                {!settings?.billing?.hideCredit && (
                                                    <Input label="Due Date" type="date" name="dueDate" value={invoice.dueDate} onChange={handleChange} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Machine/Items (100% Width) */}
                            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm w-full">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        Service Items
                                    </h2>
                                    <Button type="button" onClick={addMachine} className="w-full sm:w-auto py-2 px-4 shadow-none bg-gray-100 text-gray-700 hover:bg-gray-200 border-none">
                                        <Plus size={16} className="mr-2" /> Add Item
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {machines.map((machine, index) => (
                                        <div key={index} className="flex flex-col gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100 transition-all hover:bg-white hover:shadow-md group">

                                            <div className="flex flex-col md:flex-row gap-4">
                                                {/* Item Name with Search */}
                                                <div className="flex-1 relative machine-dropdown-container">
                                                    <label className="text-gray-400 text-[10px] uppercase font-bold mb-1 block">Item / Machine</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            name="vehicle"
                                                            placeholder="Search Item..."
                                                            value={machine.vehicle}
                                                            onChange={(e) => {
                                                                handleMachineChange(index, e);
                                                                setActiveMachineDropdown(index);
                                                            }}
                                                            onFocus={() => setActiveMachineDropdown(index)}
                                                            className="w-full p-2 bg-transparent border-b border-gray-300 focus:border-[var(--color-primary)] outline-none font-medium text-sm sm:text-base"
                                                            autoComplete="off"
                                                        />
                                                        {/* Dropdown for Machines */}
                                                        {activeMachineDropdown === index && availableMachines && availableMachines.length > 0 && (
                                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 max-h-48 overflow-y-auto z-50">
                                                                {availableMachines
                                                                    .filter(m =>
                                                                        (m.vehicleNumber || '').toLowerCase().includes((machine.vehicle || '').toLowerCase())
                                                                    )
                                                                    .map((m, i) => (
                                                                        <div
                                                                            key={i}
                                                                            onClick={() => selectMachine(index, m)}
                                                                            className="px-4 py-2 hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-none text-sm"
                                                                        >
                                                                            <div className="font-bold text-gray-800">{m.vehicleNumber}</div>
                                                                            <div className="text-xs text-gray-500">{m.model} - ₹{m.rentalRate}/hr</div>
                                                                        </div>
                                                                    ))
                                                                }
                                                                {availableMachines.length === 0 && (
                                                                    <div className="px-4 py-2 text-xs text-gray-500 italic">No machines found</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 flex-none md:w-64">
                                                    {/* Hours/Qty */}
                                                    <div className="w-full">
                                                        <label className="text-gray-400 text-[10px] uppercase font-bold mb-1 block">Qty (Hrs)</label>
                                                        <input
                                                            type="number"
                                                            name="machineHours"
                                                            placeholder="0"
                                                            value={machine.machineHours}
                                                            min="0"
                                                            step="1"
                                                            onKeyDown={(e) => {
                                                                if (e.key === "-" || e.key === "e") {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                            onChange={(e) => handleMachineChange(index, e)}
                                                            className="w-full p-2 bg-transparent border-b border-gray-300 focus:border-[var(--color-primary)] outline-none font-medium text-center text-sm sm:text-base"
                                                        />
                                                    </div>

                                                    {/* Rate */}
                                                    <div className="w-full">
                                                        <label className="text-gray-400 text-[10px] uppercase font-bold mb-1 block">Rate</label>
                                                        <input
                                                            type="text"
                                                            name="price"
                                                            placeholder="₹ 0.00"
                                                            value={machine.price}
                                                            onChange={(e) => handleMachineChange(index, e)}
                                                            className="w-full p-2 bg-transparent border-b border-gray-300 focus:border-[var(--color-primary)] outline-none font-medium text-center text-sm sm:text-base"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Delete Button - Absolute positioned on larger screens, simple block on mobile */}
                                                <div className="flex items-center justify-end sm:pt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMachine(index)}
                                                        disabled={machines.length === 1}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-0 sm:opacity-0 sm:group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={16} />
                                                        <span className="text-xs font-bold uppercase sm:hidden">Remove</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section: Bottom Row Reorganized */}
                            <div className="flex flex-col md:flex-row gap-6">

                                {/* LEFT COLUMN: Bank + Terms (50%) */}
                                <div className="flex-1 flex flex-col gap-6">

                                    {/* Bank Selection */}
                                    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm relative" ref={bankDropdownRef}>
                                        <div className="flex items-center gap-2 mb-4 text-[var(--color-primary)]">
                                            <Wallet size={20} />
                                            <h3 className="font-bold text-base sm:text-lg">Bank Account</h3>
                                        </div>

                                        <div className="relative mb-4">
                                            <Input
                                                placeholder="Search Bank..."
                                                value={bankSearch}
                                                onChange={(e) => {
                                                    setBankSearch(e.target.value);
                                                    setShowBankDropdown(true);
                                                }}
                                                onFocus={() => setShowBankDropdown(true)}
                                                className="text-sm"
                                            />
                                            {showBankDropdown && settings.bankDetails && settings.bankDetails.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-50">
                                                    {settings.bankDetails
                                                        .filter(b => b.bankName.toLowerCase().includes(bankSearch.toLowerCase()))
                                                        .map((bank, index) => (
                                                            <div
                                                                key={index}
                                                                onClick={() => {
                                                                    const realIndex = settings.bankDetails.findIndex(b => b === bank);
                                                                    setSelectedBank(realIndex);
                                                                    setBankSearch(bank.bankName);
                                                                    setShowBankDropdown(false);
                                                                }}
                                                                className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-none"
                                                            >
                                                                <div className="font-bold text-gray-800 text-sm">{bank.bankName}</div>
                                                                <div className="text-xs text-gray-500">{bank.accountNo}</div>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            )}
                                        </div>

                                        {/* Selected Bank Display */}
                                        {settings.bankDetails && settings.bankDetails[selectedBank] && (
                                            <div className="p-4 rounded-xl border border-[var(--color-primary)] bg-orange-50/50">
                                                <div className="font-bold text-gray-800 text-sm">{settings.bankDetails[selectedBank].bankName}</div>
                                                <div className="text-xs text-gray-500 mt-1">{settings.bankDetails[selectedBank].accountNo} • {settings.bankDetails[selectedBank].ifsc}</div>
                                                <div className="flex items-center gap-1 text-[var(--color-primary)] text-xs font-bold mt-2">
                                                    <Check size={12} /> Selected
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Terms Selection */}
                                    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4 text-[var(--color-primary)]">
                                            <FileText size={20} />
                                            <h3 className="font-bold text-base sm:text-lg">Terms & Conditions</h3>
                                        </div>

                                        <div className="mb-3">
                                            <Input
                                                placeholder="Search Terms..."
                                                value={termSearch}
                                                onChange={(e) => setTermSearch(e.target.value)}
                                                className="text-sm h-9"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                                            {settings.terms && settings.terms.length > 0 ? (
                                                settings.terms
                                                    .map((term, i) => ({ ...term, originalIndex: i }))
                                                    .filter(item => (item.title || '').toLowerCase().includes(termSearch.toLowerCase()) || (item.content || '').toLowerCase().includes(termSearch.toLowerCase()))
                                                    .map((term) => {
                                                        const index = term.originalIndex;
                                                        return (
                                                            <label
                                                                key={index}
                                                                className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                                            >
                                                                <div className={`
                                                        w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors
                                                        ${selectedTerms.includes(index)
                                                                        ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                                                                        : "border-gray-300 bg-white"
                                                                    }
                                                    `}>
                                                                    {selectedTerms.includes(index) && <Check size={12} strokeWidth={3} />}
                                                                    <input
                                                                        type="checkbox"
                                                                        className="hidden"
                                                                        checked={selectedTerms.includes(index)}
                                                                        onChange={() => {
                                                                            if (selectedTerms.includes(index)) {
                                                                                setSelectedTerms(selectedTerms.filter(i => i !== index));
                                                                            } else {
                                                                                setSelectedTerms([...selectedTerms, index]);
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="text-sm text-gray-700">{term.title || term.content}</span>
                                                            </label>
                                                        )
                                                    })
                                            ) : (
                                                <div className="text-sm text-gray-500 italic p-2">No terms added in settings.</div>
                                            )}
                                        </div>
                                    </div>

                                </div>

                                {/* RIGHT COLUMN: Payment + Status (50%) */}
                                <div className="flex-1">
                                    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
                                        <div className="flex items-center gap-2 mb-6 text-[var(--color-primary)]">
                                            <Hash size={20} />
                                            <h3 className="font-bold text-base sm:text-lg">Payment & Status</h3>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            {/* Tax Details Row */}
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                    <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1">CGST (9%)</span>
                                                    <span className="font-bold text-gray-800 text-sm">₹ {cgst.toFixed(2)}</span>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                    <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1">SGST (9%)</span>
                                                    <span className="font-bold text-gray-800 text-sm">₹ {sgst.toFixed(2)}</span>
                                                </div>
                                                <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                                                    <span className="text-[9px] uppercase font-bold text-orange-400 block mb-1">Total Tax (18%)</span>
                                                    <span className="font-bold text-orange-600 text-sm">₹ {totalTax.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="flex justify-between items-center mb-2 ml-1">
                                                        <label className="text-[var(--color-dark)] uppercase tracking-wider text-[10px] font-bold">TCS (+)</label>
                                                        <div className="flex bg-gray-100 rounded-lg p-0.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setInvoice(prev => ({ ...prev, tcsType: "Amount" }))}
                                                                className={`px-2 py-0.5 text-[20px] font-bold rounded-md transition-all ${invoice.tcsType === "Amount" ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                                            >
                                                                ₹
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setInvoice(prev => ({ ...prev, tcsType: "%" }))}
                                                                className={`px-2 py-0.5 text-[20px] font-bold rounded-md transition-all ${invoice.tcsType === "%" ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                                            >
                                                                %
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <Input
                                                        type="number"
                                                        name="tcs"
                                                        value={invoice.tcs}
                                                        placeholder="0.00"
                                                        min="0"
                                                        step="0.01"
                                                        onKeyDown={(e) => {
                                                            if (e.key === "-" || e.key === "e") {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between items-center mb-2 ml-1">
                                                        <label className="text-[var(--color-dark)] uppercase tracking-wider text-[10px] font-bold">Discount (-)</label>
                                                        <div className="flex bg-gray-100 rounded-lg p-0.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setInvoice(prev => ({ ...prev, discountType: "Amount" }))}
                                                                className={`px-2 py-0.5 text-[20px] font-bold rounded-md transition-all ${invoice.discountType === "Amount" ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                                            >
                                                                ₹
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setInvoice(prev => ({ ...prev, discountType: "%" }))}
                                                                className={`px-2 py-0.5 text-[20px] font-bold rounded-md transition-all ${invoice.discountType === "%" ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                                            >
                                                                %
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <Input
                                                        type="number"
                                                        name="discount"
                                                        value={invoice.discount}
                                                        placeholder="0"
                                                        min="0"
                                                        step="0.01"
                                                        onKeyDown={(e) => {
                                                            if (e.key === "-" || e.key === "e") {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[var(--color-dark)] uppercase tracking-wider text-xs font-bold block mb-2 ml-1">Payment Mode</label>
                                                <div className="relative">
                                                    <select
                                                        name="paymentMode"
                                                        value={invoice.paymentMode}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full appearance-none px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[var(--color-primary)] outline-none transition-all font-medium cursor-pointer"
                                                    >
                                                        <option value="">Select Mode</option>
                                                        <option value="Credit">Credit</option>
                                                        <option value="Cash">Cash</option>
                                                        <option value="UPI">UPI</option>
                                                        <option value="Bank Transfer">Bank Transfer</option>
                                                        <option value="Cheque">Cheque</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-3.5 text-gray-400 w-4 h-4 pointer-events-none" />
                                                </div>
                                            </div>

                                            {/* Financial Summary Breakdown */}
                                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                                <div className="flex justify-between items-center text-sm px-1">
                                                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Taxable Amount</span>
                                                    <span className="text-gray-700 font-bold">₹ {subtotal.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm px-1">
                                                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Total Tax (18%)</span>
                                                    <span className="text-gray-700 font-bold">₹ {totalTax.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm px-1">
                                                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">TCS (+)</span>
                                                    <span className="font-bold text-gray-700">₹ {(() => {
                                                        return (invoice.tcsType === "%"
                                                            ? (subtotal * (parseFloat(invoice.tcs) || 0)) / 100
                                                            : (parseFloat(invoice.tcs) || 0)).toFixed(2);
                                                    })()}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm px-1">
                                                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Discount (-)</span>
                                                    <span className="font-bold text-gray-700">₹ {(() => {
                                                        return (invoice.discountType === "%"
                                                            ? (subtotal * (parseFloat(invoice.discount) || 0)) / 100
                                                            : (parseFloat(invoice.discount) || 0)).toFixed(2);
                                                    })()}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-4 bg-gray-900 rounded-xl mt-2">
                                                    <span className="text-white font-black uppercase tracking-widest text-[10px]">Grand Total</span>
                                                    <span className="text-white font-black text-lg">₹ {(() => {
                                                        const tcsAmount = invoice.tcsType === "%"
                                                            ? (subtotal * (parseFloat(invoice.tcs) || 0)) / 100
                                                            : (parseFloat(invoice.tcs) || 0);
                                                        const discAmount = invoice.discountType === "%"
                                                            ? (subtotal * (parseFloat(invoice.discount) || 0)) / 100
                                                            : (parseFloat(invoice.discount) || 0);
                                                        return (subtotal + tcsAmount - discAmount + totalTax).toFixed(2);
                                                    })()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Sticky Bottom Action Bar */}
                            <div className=" bottom-4 z-40 bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-5 mt-10">
                                <div className="flex flex-col items-center sm:items-start">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Grand Total</span>
                                    <div className="text-xl sm:text-2xl font-black text-gray-900">
                                        ₹ {(() => {
                                            const tcsAmount = invoice.tcsType === "%"
                                                ? (subtotal * (parseFloat(invoice.tcs) || 0)) / 100
                                                : (parseFloat(invoice.tcs) || 0);
                                            const discAmount = invoice.discountType === "%"
                                                ? (subtotal * (parseFloat(invoice.discount) || 0)) / 100
                                                : (parseFloat(invoice.discount) || 0);
                                            return (subtotal + tcsAmount - discAmount + totalTax).toFixed(2);
                                        })()}
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    <Button
                                        type="button"
                                        onClick={handleSaveOnly}
                                        disabled={loading}
                                        className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 order-2 sm:order-1"
                                    >
                                        {loading ? "..." : "Save Only"}
                                    </Button>
                                    <Button
                                        type="savebtn"
                                        onClick={handleDownloadInvoice}
                                        disabled={loading}
                                        className="w-full sm:w-auto px-8 py-3 shadow-lg shadow-orange-500/20 order-1 sm:order-2"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Saving...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2">
                                                <Save size={18} />
                                                <span>Save & Generate Invoice</span>
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}