import { Mail, Phone, Users, FileText, Info, HelpCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function Contact() {
    const whatsappNumber = "+919484656464"; // WhatsApp number
    const emailAddress = "contact@trevitainfotech.com"; // Email address

    return (
        <section className="min-h-screen w-full bg-[var(--bg-light)] text-[var(--text-secondary)] py-5 flex flex-col relative">
            <div className="container mx-auto px-4 flex-1">

                {/* Page Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold mb-3 text-[var(--color-primary)]">
                        Contact & Support
                    </h1>
                    <p className="text-[var(--text-muted)] max-w-3xl mx-auto">
                        Trevita Infotech helps you manage JCB machines, drivers, invoices, and construction operations efficiently. Reach out to us anytime.
                    </p>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <ContactCard icon={<Mail size={20} />} title="Email" value={emailAddress} />
                    <ContactCard icon={<Phone size={20} />} title="Phone" value={whatsappNumber} />
                    <ContactCard icon={<Users size={20} />} title="Company" value="Trevita Infotech" />
                    <ContactCard icon={<Info size={20} />} title="Working Hours" value="Mon–Sat, 10 AM – 6 PM" />
                </div>

                {/* Notes Section */}
                <div className="space-y-6 mb-12">
                    <NoteBlock
                        icon={<Info size={20} />}
                        title="About Trevita Infotech"
                        text={
                            <>
                                Our SaaS platform is designed for construction companies and fleet owners managing JCBs and heavy machinery. Key features include:
                                <ul className="list-disc list-inside mt-2 text-[var(--text-primary)]">
                                    <li>Centralized machine and driver management</li>
                                    <li>Invoice generation and billing tracking</li>
                                    <li>Real-time operational insights</li>
                                    <li>Secure data storage and access control</li>
                                    <li>Customizable dashboards and reporting</li>
                                </ul>
                            </>
                        }
                    />

                    <NoteBlock
                        icon={<Users size={20} />}
                        title="Machine & Fleet Management"
                        text={
                            <>
                                Manage all machines including JCBs, excavators, and loaders. Benefits include:
                                <ul className="list-disc list-inside mt-2 text-[var(--text-primary)]">
                                    <li>Track site allocation and usage history</li>
                                    <li>Monitor maintenance schedules and downtime</li>
                                    <li>View operational status at a glance</li>
                                    <li>Organize machines by type or project</li>
                                    <li>Receive notifications for upcoming service needs</li>
                                </ul>
                            </>
                        }
                    />

                    <NoteBlock
                        icon={<Users size={20} />}
                        title="Driver Management"
                        text={
                            <>
                                Maintain complete driver records and assignments with features such as:
                                <ul className="list-disc list-inside mt-2 text-[var(--text-primary)]">
                                    <li>Driver profiles with documents and contact info</li>
                                    <li>Assignment tracking to specific machines or projects</li>
                                    <li>Attendance monitoring and work hours logging</li>
                                    <li>Operational accountability and performance tracking</li>
                                    <li>Quick alerts for missing documents or expired licenses</li>
                                </ul>
                            </>
                        }
                    />

                    <NoteBlock
                        icon={<FileText size={20} />}
                        title="Invoice & Billing"
                        text={
                            <>
                                Simplify your billing process with:
                                <ul className="list-disc list-inside mt-2 text-[var(--text-primary)]">
                                    <li>Professional invoice generation per machine/project</li>
                                    <li>Payment tracking and status updates</li>
                                    <li>Downloadable reports for accounting</li>
                                    <li>Customizable billing templates and formats</li>
                                    <li>Automated reminders for pending payments</li>
                                </ul>
                            </>
                        }
                    />

                    <NoteBlock
                        icon={<HelpCircle size={20} />}
                        title="Reports & Insights"
                        text={
                            <>
                                Gain full visibility of your operations:
                                <ul className="list-disc list-inside mt-2 text-[var(--text-primary)]">
                                    <li>Detailed machine usage and performance reports</li>
                                    <li>Driver performance and attendance summaries</li>
                                    <li>Invoice and payment history insights</li>
                                    <li>Identify cost-saving opportunities and efficiency gaps</li>
                                    <li>Export data for advanced analytics</li>
                                </ul>
                            </>
                        }
                    />

                    <NoteBlock
                        icon={<Info size={20} />}
                        title="Support Availability"
                        text={
                            <>
                                Our dedicated support team ensures smooth operations:
                                <ul className="list-disc list-inside mt-2 text-[var(--text-primary)]">
                                    <li>Assistance with machine and driver records</li>
                                    <li>Billing and invoice support</li>
                                    <li>Operational guidance and troubleshooting</li>
                                    <li>Fast response during working hours (Mon–Sat, 9 AM – 7 PM)</li>
                                    <li>Priority support for urgent issues</li>
                                </ul>
                            </>
                        }
                    />
                </div>

                {/* FAQ Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 text-[var(--color-primary)]">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        <FAQ icon={<HelpCircle size={18} />} q="Who can use this platform?" a="Construction contractors, JCB rental businesses, fleet owners, and companies managing heavy machinery." />
                        <FAQ icon={<HelpCircle size={18} />} q="Can I manage multiple machines and drivers?" a="Yes, the platform supports managing multiple machines and drivers with full history and assignments." />
                        <FAQ icon={<HelpCircle size={18} />} q="Does it support invoice generation?" a="Yes, you can generate, manage, and download invoices for machines or projects." />
                        <FAQ icon={<HelpCircle size={18} />} q="Is the platform suitable for rental businesses?" a="Yes, it is designed specifically for machine rental, usage tracking, and billing." />
                        <FAQ icon={<HelpCircle size={18} />} q="Is my data secure?" a="Yes, we follow industry-standard practices to ensure data security and controlled access." />
                        <FAQ icon={<HelpCircle size={18} />} q="How do I get support?" a="Support is available via phone or email during business hours for all operational assistance." />
                    </div>
                </div>

                {/* Terms & Conditions */}
                <div className="mb-14">
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--color-primary)]">
                        Terms & Conditions
                    </h2>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                        By using Trevita Infotech's platform, you agree to follow all operational guidelines, maintain the confidentiality of your account credentials, and comply with applicable laws for machine management and billing. Trevita Infotech is not liable for mismanagement or misuse of equipment by third parties.
                    </p>
                </div>

            </div>
            {/* Floating WhatsApp & Email Buttons */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
                <button
                    onClick={() => window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`, "_blank")}
                    className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
                    title="Chat on WhatsApp"
                >
                    <FaWhatsapp size={24} />
                </button>
                <button
                    onClick={() => window.location.href = `mailto:${emailAddress}`}
                    className="bg-[var(--color-primary)] hover:bg-orange-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
                    title="Send Email"
                >
                    <Mail size={24} />
                </button>
            </div>
        </section>
    );
}

/* ================= REUSABLE COMPONENTS ================= */
function ContactCard({ icon, title, value }) {
    return (
        <div className="bg-[var(--bg-card)] rounded-xl p-6 shadow-md flex items-center gap-3">
            <div className="text-[var(--color-primary)]">{icon}</div>
            <div>
                <h3 className="font-semibold mb-1 text-[var(--color-primary)]">{title}</h3>
                <p className="text-[var(--text-primary)]">{value}</p>
            </div>
        </div>
    );
}

function NoteBlock({ icon, title, text }) {
    return (
        <div className="bg-[var(--bg-card)] rounded-xl p-6 shadow-md flex gap-4 items-start">
            <div className="text-[var(--color-primary)] mt-1">{icon}</div>
            <div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-primary)]">{title}</h3>
                <p className="text-[var(--text-primary)] leading-relaxed">{text}</p>
            </div>
        </div>
    );
}

function FAQ({ icon, q, a }) {
    return (
        <div className="bg-[var(--bg-card)] rounded-xl p-5 shadow-md flex gap-3 items-start">
            <div className="text-[var(--color-primary)] mt-1">{icon}</div>
            <div>
                <h4 className="font-medium mb-1 text-[var(--color-primary)]">{q}</h4>
                <p className="text-[var(--text-primary)] text-sm leading-relaxed">{a}</p>
            </div>
        </div>
    );
}
