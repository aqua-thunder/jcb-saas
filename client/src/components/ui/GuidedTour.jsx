import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, ChevronLeft, Check } from 'lucide-react';

const steps = [
    {
        target: 'tour-sidebar-header',
        title: 'Welcome to Your Admin Panel',
        content: 'This is the heart of your business management system. We\'ve designed this tour to help you master every feature step-by-step.',
        placement: 'right'
    },
    {
        target: 'tour-menu-dashboard',
        title: 'Real-time Dashboard',
        content: 'Your central hub for business insights. Here you can see total machines, active rentals, and pending payments at a glance.',
        placement: 'right'
    },
    {
        target: 'tour-menu-rental',
        title: 'Rental Logistics',
        content: 'Manage all your ongoing and upcoming rentals. Track where your machines are and their current deployment status.',
        placement: 'right'
    },
    {
        target: 'tour-menu-client',
        title: 'Client Relationships',
        content: 'Keep a detailed database of all your clients. Store contact info, view their history, and manage specific requirements.',
        placement: 'right'
    },
    {
        target: 'tour-menu-quotation',
        title: 'Professional Quotations',
        content: 'Create and send professional-grade estimates to your clients. Convert them to active rentals or invoices with a single click.',
        placement: 'right'
    },
    {
        target: 'tour-menu-invoice',
        title: 'Billing & Invoicing',
        content: 'The financial core of your app. Generate GST-compliant invoices, track billing cycles, and manage your revenue stream.',
        placement: 'right'
    },
    {
        target: 'tour-menu-payment',
        title: 'Payment Tracking',
        content: 'Monitor your cash flow. Record incoming payments, track pending dues, and maintain a clear digital ledger of all transactions.',
        placement: 'right'
    },
    {
        target: 'tour-menu-machines',
        title: 'Fleet Management',
        content: 'Add and manage your fleet of JCBs and other machinery. Track vehicle numbers, models, and current condition.',
        placement: 'right'
    },
    {
        target: 'tour-menu-driver',
        title: 'Team Management',
        content: 'Manage your workforce. Keep records of your drivers, their licenses, contact details, and current assignments.',
        placement: 'right'
    },
    {
        target: 'tour-menu-service',
        title: 'Maintenance Alerts',
        content: 'Crucial for machine health! Set service limits and get notified when machines are due for maintenance based on usage hours.',
        placement: 'right'
    },
    {
        target: 'tour-menu-report',
        title: 'Business Analytics',
        content: 'Generate detailed reports of your performance. Analyze revenue, machine utilization, and growth trends over time.',
        placement: 'right'
    },
    {
        target: 'tour-menu-settings',
        title: 'System Preferences',
        content: 'Customize the app to your needs. Set up your company profile, bank details, and terms & conditions for all documents.',
        placement: 'right'
    },
    {
        target: 'tour-header-create',
        title: 'One-Tap Creation',
        content: 'The fastest way to work. From any page, use this button to quickly add a new Client, Machine, or Rental.',
        placement: 'bottom'
    },
    {
        target: 'tour-header-search',
        title: 'Global Search',
        content: 'Can\'t find something? Search across everything—machines, drivers, invoices, or clients—instantly.',
        placement: 'bottom'
    },
    {
        target: 'tour-header-notifications',
        title: 'Stay Notified',
        content: 'Alerts for maintenance, overdue payments, and system updates appear here to keep you on top of your game.',
        placement: 'bottom'
    },
    {
        target: 'tour-header-profile',
        title: 'Account & Security',
        content: 'Update your personal profile, change your photo, or logout securely from here.',
        placement: 'bottom'
    }
];

export default function GuidedTour() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 });
    const [isReady, setIsReady] = useState(false);
    const tooltipRef = useRef(null);
    const [tooltipStyle, setTooltipStyle] = useState({});

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('tour_completed');
        if (!hasSeenTour) {
            const timer = setTimeout(() => {
                setIsVisible(true);
                setIsReady(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const updateCoords = () => {
        const step = steps[currentStep];
        const element = document.getElementById(step.target);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            const rect = element.getBoundingClientRect();
            setCoords({
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
                height: rect.height,
                bottom: rect.bottom + window.scrollY,
                right: rect.right + window.scrollX
            });
        }
    };

    useEffect(() => {
        if (isVisible && isReady) {
            updateCoords();
            window.addEventListener('resize', updateCoords);
            window.addEventListener('scroll', updateCoords);
            return () => {
                window.removeEventListener('resize', updateCoords);
                window.removeEventListener('scroll', updateCoords);
            };
        }
    }, [currentStep, isVisible, isReady]);

    useEffect(() => {
        if (isVisible && isReady && tooltipRef.current) {
            const step = steps[currentStep];
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const margin = 24;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let top = 0;
            let left = 0;

            if (step.placement === 'right') {
                top = coords.top + (coords.height / 2) - (tooltipRect.height / 2);
                left = coords.right + margin;

                if (left + tooltipRect.width > viewportWidth - margin) {
                    left = coords.left - tooltipRect.width - margin;
                }
            } else if (step.placement === 'bottom') {
                top = coords.bottom + margin;
                left = coords.left + (coords.width / 2) - (tooltipRect.width / 2);

                if (top + tooltipRect.height > viewportHeight - margin) {
                    top = coords.top - tooltipRect.height - margin;
                }
            }

            left = Math.max(margin, Math.min(left, viewportWidth - tooltipRect.width - margin));
            top = Math.max(margin, Math.min(top, viewportHeight - tooltipRect.height - margin));

            setTooltipStyle({
                top: top,
                left: left,
                position: 'absolute'
            });
        }
    }, [coords, isVisible, isReady, currentStep]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = () => {
        setIsVisible(false);
        localStorage.setItem('tour_completed', 'true');
    };

    if (!isVisible || !isReady) return null;

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto" onClick={handleSkip} />

            <motion.div
                className="absolute bg-white/5 ring-[2000px] ring-black/70 rounded-xl"
                initial={false}
                animate={{
                    top: coords.top - 8,
                    left: coords.left - 8,
                    width: coords.width + 16,
                    height: coords.height + 16,
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    ref={tooltipRef}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    style={tooltipStyle}
                    className="w-[340px] bg-white rounded-3xl shadow-2xl pointer-events-auto border border-white/20 p-7 overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
                        <motion.div
                            className="h-full bg-[var(--color-primary)] shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-start mb-5 pt-2">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[var(--color-primary)]">
                                Step {currentStep + 1} of {steps.length}
                            </span>
                            <h3 className="text-2xl font-black text-slate-900 leading-tight">
                                {steps[currentStep].title}
                            </h3>
                        </div>
                        <button
                            onClick={handleSkip}
                            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed mb-10 font-medium">
                        {steps[currentStep].content}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                        <button
                            onClick={handleSkip}
                            className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                        >
                            Skip Tour
                        </button>

                        <div className="flex gap-2.5">
                            {currentStep > 0 && (
                                <button
                                    onClick={handleBack}
                                    className="p-3 border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all active:scale-90"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            )}

                            <button
                                onClick={handleNext}
                                className="flex items-center gap-3 px-8 py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 shadow-[var(--color-primary)]/30"
                            >
                                <span>{currentStep === steps.length - 1 ? "Finish" : "Continue"}</span>
                                {currentStep === steps.length - 1 ? <Check size={18} /> : <ChevronRight size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center gap-2 mt-8">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-[var(--color-primary)]' : 'w-1.5 bg-slate-200'}`}
                            />
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
