"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Calendar,
  Users,
  Activity,
  Stethoscope,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  Plus,
  Bell,
  CalendarDays,
  Check,
  UserPlus,
  FileText,
  Image as ImageIcon,
  X,
  Clock,
  CheckSquare,
  PlusCircle,
  HelpCircle,
  Phone,
  UserCheck,
  TrendingUp,
  Shield,
  Layers,
  Database,
  Trash2,
  DollarSign,
  Printer,
  Share2,
  Mail,
  Download,
  CalendarPlus,
  MessageSquare,
  MessageCircle,
  SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DentalLogo } from "@/components/dental-logo";

// Interfaces
interface FileAttachment {
  name: string;
  size: string;
  type: string;
}

interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: "Male" | "Female";
  address: string;
  visit: string;
  medicalNotes: string;
  balance: string;
  status: "Active" | "Inactive";
  dentalChart: Record<number, string>;
  prescriptions: string[];
  files: FileAttachment[];
  notes: string[];
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctor: string;
  treatment: string;
  time: string;
  date: string;
  status: "Scheduled" | "Checked In" | "Waiting" | "In Consultation" | "In Procedure" | "Completed" | "Cancelled" | "No Show";
  notes?: string;
  token?: string;
  avatarColor: string;
}

interface InvoiceItem {
  id: string;
  patientId: string;
  patientName: string;
  doctor: string;
  treatment: string;
  items: { description: string; amount: number }[];
  discount: number; // in percentage
  tax: number; // in percentage
  subtotal: number;
  total: number;
  paidAmount: number;
  status: "Paid" | "Partially Paid" | "Pending";
  paymentDate: string;
  paymentLogs: { method: string; amount: number; date: string }[];
}

interface Doctor {
  name: string;
  speciality: string;
  status: "Available" | "In Consultation" | "On Break" | "Finished Today";
}

interface TreatmentItem {
  id: string;
  name: string;
  patient: string;
  doctor: string;
  stage: "In Progress" | "Completed" | "Planned";
  notes: string;
  nextVisit: string;
  prescription: string;
}

interface ActivityItem {
  id: string;
  type: "Register" | "Appointment" | "Prescription" | "Chart" | "Treatment" | "Billing" | "Payment";
  msg: string;
  time: string;
}

// Predefined treatment base prices
const TREATMENT_PRICES: Record<string, number> = {
  "Consultation": 500,
  "Scaling": 1500,
  "Root Canal": 4500,
  "Extraction": 2000,
  "Filling": 1200,
  "Implant": 25000,
  "Crown": 5500,
  "Braces": 35000
};

// Module sub-tabs mapping
const menuItems = [
  { name: "Dashboard", icon: <Home className="h-5 w-5 shrink-0" />, badge: null },
  { name: "Appointments", icon: <Calendar className="h-5 w-5 shrink-0" />, badge: "4" },
  { name: "Patients", icon: <Users className="h-5 w-5 shrink-0" />, badge: null },
  { name: "Treatments", icon: <Stethoscope className="h-5 w-5 shrink-0" />, badge: null },
  { name: "Billing", icon: <Receipt className="h-5 w-5 shrink-0" />, badge: "2" },
  { name: "Reports", icon: <BarChart3 className="h-5 w-5 shrink-0" />, badge: null },
  { name: "Settings", icon: <Settings className="h-5 w-5 shrink-0" />, badge: null }
];

const moduleSubTabs: Record<string, string[]> = {
  Dashboard: ["Overview"],
  Appointments: ["Today", "Calendar", "Queue", "History"],
  Patients: ["All Patients", "Add Patient", "Dental Chart"],
  Treatments: ["Active Treatments", "Completed", "Treatment Plans"],
  Billing: ["Invoices", "Payments", "Insurance"],
  Reports: ["Revenue", "Patients", "Treatments", "Appointments"],
  Settings: ["Clinic", "Doctors", "Staff", "Users", "Preferences", "Integrations", "Backup"]
};

export default function SaaSMainDashboard({ initialTab = "Dashboard" }: { initialTab?: string } = {}) {
  const router = useRouter();

  // Layout states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredItemTop, setHoveredItemTop] = useState<number>(0);
  
  // Navigation states
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeSubTab, setActiveSubTab] = useState(
    initialTab === "Dashboard" ? "Overview" : (moduleSubTabs[initialTab]?.[0] || "")
  );

  // Global Dialog triggers
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Workflow tracking states
  const [activeConsultationApptId, setActiveConsultationApptId] = useState<string | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceItem | null>(null);
  const [lastGeneratedReceipt, setLastGeneratedReceipt] = useState<InvoiceItem | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [profileSubTab, setProfileSubTab] = useState("Overview");

  // Form input states (Patient / Appt modals)
  const [newPatName, setNewPatName] = useState("");
  const [newPatPhone, setNewPatPhone] = useState("");
  const [newPatAge, setNewPatAge] = useState(30);
  const [newPatGender, setNewPatGender] = useState<"Male" | "Female">("Male");
  const [newPatAddress, setNewPatAddress] = useState("");
  const [newPatAllergies, setNewPatAllergies] = useState("None");
  
  const [apptPatientId, setApptPatientId] = useState("");
  const [apptDoctor, setApptDoctor] = useState("Dr. Deepa Kodali");
  const [apptTreatment, setApptTreatment] = useState("Consultation");
  const [apptTime, setApptTime] = useState("09:00 AM");
  const [apptDate, setApptDate] = useState("12 Aug 2026");
  const [apptNotes, setApptNotes] = useState("");

  // Consultation clinical workspace inputs
  const [consultNotes, setConsultNotes] = useState("");
  const [consultPrescription, setConsultPrescription] = useState("");
  const [consultSelectedTooth, setConsultSelectedTooth] = useState<number | null>(null);
  const [consultToothStatus, setConsultToothStatus] = useState("Decayed");
  const [consultChart, setConsultChart] = useState<Record<number, string>>({});
  const [consultUploadedXrays, setConsultUploadedXrays] = useState<FileAttachment[]>([]);

  // Billing collect payment splits
  const [payCash, setPayCash] = useState(0);
  const [payUpi, setPayUpi] = useState(0);
  const [payCard, setPayCard] = useState(0);
  const [payDiscountPercent, setPayDiscountPercent] = useState(0);
  const [payTaxPercent, setPayTaxPercent] = useState(18); // Default 18% GST
  const [payCustomItems, setPayCustomItems] = useState<{ description: string; amount: number }[]>([]);
  const [newCustomDesc, setNewCustomDesc] = useState("");
  const [newCustomAmt, setNewCustomAmt] = useState(0);

  // Timeframe filter for reports page
  const [reportsFilter, setReportsFilter] = useState<"Today" | "Week" | "Month" | "Year">("Today");

  // Redesigned dashboard state variables
  const [selectedCalendarDay, setSelectedCalendarDay] = useState("12 Aug 2026");
  const [blockedSlots, setBlockedSlots] = useState<Record<string, boolean>>({});
  
  // Add Patient quick panel inputs
  const [quickFirstName, setQuickFirstName] = useState("");
  const [quickLastName, setQuickLastName] = useState("");
  const [quickMobile, setQuickMobile] = useState("");
  const [quickGender, setQuickGender] = useState<"Male" | "Female">("Male");
  const [quickAge, setQuickAge] = useState(30);
  const [quickDOB, setQuickDOB] = useState("");
  const [quickLocation, setQuickLocation] = useState("Bengaluru");

  // Recently Added Patient list states
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [patientFilterGender, setPatientFilterGender] = useState("All");
  const [patientSortBy, setPatientSortBy] = useState("Name-ASC");
  const [patientVisibleCount, setPatientVisibleCount] = useState(5);

  // Redesigned Appointments Hub states
  const [apptView, setApptView] = useState<"Month" | "Week" | "Day">("Month");
  const [apptSearchQuery, setApptSearchQuery] = useState("");
  const [apptSelectedDoctor, setApptSelectedDoctor] = useState("All");
  const [apptSelectedLocation, setApptSelectedLocation] = useState("All");
  const [apptSelectedStatus, setApptSelectedStatus] = useState("All");
  const [apptSelectedTreatment, setApptSelectedTreatment] = useState("All");
  const [apptSelectedType, setApptSelectedType] = useState("All");
  const [apptCalendarDate, setApptCalendarDate] = useState<Date>(new Date(2026, 7, 12)); // default Aug 12, 2026

  // Calendar slot selection for detail modal
  const [selectedApptDetail, setSelectedApptDetail] = useState<Appointment | null>(null);
  const [selectedSlotData, setSelectedSlotData] = useState<{ date: string; time: string; appointment?: Appointment } | null>(null);
  
  // Slot booking form states
  const [slotPatientId, setSlotPatientId] = useState("");
  const [slotDoctor, setSlotDoctor] = useState("Dr. Deepa Kodali");
  const [slotTreatment, setSlotTreatment] = useState("Consultation");

  // --- MOCK DATABASE DATABASE STATES ---

  const [patients, setPatients] = useState<Patient[]>([
    { id: "DS-1001", name: "Aarav Mehta", phone: "+91 98112 09230", age: 28, gender: "Male", address: "MG Road, Bengaluru", visit: "12 Aug 2026", medicalNotes: "Penicillin Allergy", balance: "₹0", status: "Active", dentalChart: { 16: "Root Canal Completed", 30: "Missing" }, prescriptions: ["Amoxicillin 500mg - 3x daily"], files: [{ name: "panorex_xray_mehta.png", size: "4.2 MB", type: "image/png" }], notes: ["Patient experiences cold sensitivity in lower left molar."] },
    { id: "DS-1002", name: "Priya Patel", phone: "+91 99104 22091", age: 34, gender: "Female", address: "Indiranagar, Bengaluru", visit: "10 Aug 2026", medicalNotes: "None", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
    { id: "DS-1003", name: "Kabir Singh", phone: "+91 98765 43210", age: 45, gender: "Male", address: "Koramangala, Bengaluru", visit: "08 Aug 2026", medicalNotes: "Latex Allergy, Hypertension", balance: "₹0", status: "Active", dentalChart: { 12: "Decayed" }, prescriptions: ["Paracetamol 650mg - as needed"], files: [], notes: ["Hypertension controlled under clinical prescription."] },
    { id: "DS-1004", name: "Ananya Rao", phone: "+91 95400 12044", age: 19, gender: "Female", address: "Whitefield, Bengaluru", visit: "05 Aug 2026", medicalNotes: "None", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
    { id: "DS-1005", name: "Rohan Kumar", phone: "+91 98100 44028", age: 31, gender: "Male", address: "HSR Layout, Bengaluru", visit: "12 Aug 2026", medicalNotes: "Sulfa Drugs Allergy", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
    { id: "DS-1006", name: "Sneha Reddy", phone: "+91 95408 81229", age: 27, gender: "Female", address: "Jayanagar, Bengaluru", visit: "03 Aug 2026", medicalNotes: "None", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
    { id: "DS-1007", name: "Rahul Verma", phone: "+91 98110 22912", age: 40, gender: "Male", address: "Malleshwaram, Bengaluru", visit: "28 Jul 2026", medicalNotes: "None", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
    { id: "DS-1008", name: "Kavya Sharma", phone: "+91 99100 55109", age: 22, gender: "Female", address: "Hebbal, Bengaluru", visit: "25 Jul 2026", medicalNotes: "None", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
    { id: "DS-1009", name: "Arjun Nair", phone: "+91 98760 12345", age: 36, gender: "Male", address: "Bannerghatta, Bengaluru", visit: "20 Jul 2026", medicalNotes: "Aspirin Sensitivity", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
    { id: "DS-1010", name: "Neha Joshi", phone: "+91 95400 98765", age: 29, gender: "Female", address: "Sadashivanagar, Bengaluru", visit: "15 Jul 2026", medicalNotes: "None", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
    { id: "DS-1011", name: "Vikram Malhotra", phone: "+91 98112 34567", age: 50, gender: "Male", address: "Ulsoor, Bengaluru", visit: "10 Jul 2026", medicalNotes: "Diabetes type 2", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
    { id: "DS-1012", name: "Meera Nair", phone: "+91 99104 56789", age: 33, gender: "Female", address: "Cox Town, Bengaluru", visit: "05 Jul 2026", medicalNotes: "None", balance: "₹770", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
    { id: "DS-1013", name: "Siddharth Roy", phone: "+91 98765 89012", age: 42, gender: "Male", address: "Frazer Town, Bengaluru", visit: "01 Jul 2026", medicalNotes: "None", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
    { id: "DS-1014", name: "Aditi Rao", phone: "+91 95400 34567", age: 25, gender: "Female", address: "Kalyan Nagar, Bengaluru", visit: "25 Jun 2026", medicalNotes: "None", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
    { id: "DS-1015", name: "Rajesh Khanna", phone: "+91 98100 90123", age: 60, gender: "Male", address: "Richmond Town, Bengaluru", visit: "15 Jun 2026", medicalNotes: "Penicillin Allergy", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] }
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: "appt-1", patientId: "DS-1001", patientName: "Aarav Mehta", doctor: "Dr. Deepa Kodali", treatment: "Root Canal", time: "09:00 AM", date: "12 Aug 2026", status: "Scheduled", notes: "Lower left molar treatment.", avatarColor: "bg-blue-100 text-blue-600" },
    { id: "appt-2", patientId: "DS-1002", patientName: "Priya Patel", doctor: "Dr. Raghuram", treatment: "Scaling", time: "09:30 AM", date: "12 Aug 2026", status: "Scheduled", notes: "Routine scale and polish.", avatarColor: "bg-cyan-100 text-cyan-600" },
    { id: "appt-3", patientId: "DS-1003", patientName: "Kabir Singh", doctor: "Dr. Deepa Kodali", treatment: "Root Canal", time: "10:00 AM", date: "12 Aug 2026", status: "Scheduled", notes: "Penicillin allergy precaution.", avatarColor: "bg-purple-100 text-purple-600" },
    { id: "appt-4", patientId: "DS-1004", patientName: "Ananya Rao", doctor: "Dr. Srinivasa", treatment: "Implant", time: "10:30 AM", date: "12 Aug 2026", status: "Scheduled", notes: "Surgical post review.", avatarColor: "bg-emerald-100 text-emerald-600" },
    { id: "appt-5", patientId: "DS-1005", patientName: "Rohan Kumar", doctor: "Dr. Priyanka Mane Pado", treatment: "Crown", time: "11:00 AM", date: "12 Aug 2026", status: "Scheduled", notes: "Crown margins assessment.", avatarColor: "bg-indigo-100 text-indigo-600" }
  ]);

  const [invoices, setInvoices] = useState<InvoiceItem[]>([
    { id: "INV-1001", patientId: "DS-1011", patientName: "Vikram Malhotra", doctor: "Dr. Deepa Kodali", treatment: "Consultation", items: [{ description: "Consultation Fee", amount: 500 }, { description: "Pain Reliever pills", amount: 300 }], discount: 10, tax: 18, subtotal: 800, total: 850, paidAmount: 850, status: "Paid", paymentDate: "10 Aug 2026", paymentLogs: [{ method: "UPI GPay", amount: 850, date: "10 Aug 2026" }] },
    { id: "INV-1002", patientId: "DS-1012", patientName: "Meera Nair", doctor: "Dr. Raghuram", treatment: "Scaling", items: [{ description: "Scaling and Polishing", amount: 1500 }], discount: 0, tax: 18, subtotal: 1500, total: 1770, paidAmount: 1000, status: "Partially Paid", paymentDate: "05 Aug 2026", paymentLogs: [{ method: "Cash", amount: 1000, date: "05 Aug 2026" }] }
  ]);

  const [doctors, setDoctors] = useState<Doctor[]>([
    { name: "Dr. Deepa Kodali", speciality: "Endodontist", status: "Available" },
    { name: "Dr. Raghuram", speciality: "Orthodontist", status: "Available" },
    { name: "Dr. Srinivasa", speciality: "Periodontist", status: "Available" },
    { name: "Dr. Priyanka Mane Pado", speciality: "Pedodontist", status: "Available" },
    { name: "Dr. Krishna Teja", speciality: "Prosthodontist", status: "Available" }
  ]);

  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: "act-1", type: "Register", msg: "Apex Dental database initialized with 15 intake files.", time: "1 hour ago" },
    { id: "act-2", type: "Appointment", msg: "Aarav Mehta scheduled for Root Canal at 09:00 AM.", time: "45 mins ago" }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, msg: "Follow-up due tomorrow for Priya Patel.", unread: true },
    { id: 2, msg: "Stock Alert: Lidocaine cartridge stock is below 15%.", unread: false }
  ]);

  const [treatments, setTreatments] = useState<TreatmentItem[]>([
    { id: "tr-1", name: "Root Canal Therapy", patient: "Vikram Malhotra", doctor: "Dr. Sharma", stage: "Completed", notes: "Fully obturated.", nextVisit: "10 Sep 2026", prescription: "Ibuprofen 400mg" }
  ]);

  // --- HELPER DYNAMIC CALCULATIONS ---

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

  const getFilteredReportStats = () => {
    // Generate filtered revenue calculations based on reporting timeframe selector
    let revMultiplier = 1;
    let patientOffset = 0;
    if (reportsFilter === "Week") { revMultiplier = 5.2; patientOffset = 18; }
    else if (reportsFilter === "Month") { revMultiplier = 22; patientOffset = 76; }
    else if (reportsFilter === "Year") { revMultiplier = 240; patientOffset = 880; }

    const calculatedRevenue = Math.round(totalRevenue * revMultiplier);
    const calculatedPatients = patients.length + patientOffset;
    const calculatedTreatments = treatments.length + Math.round(patientOffset * 1.5);
    const calculatedAppts = appointments.length + Math.round(patientOffset * 1.8);

    return {
      revenue: calculatedRevenue,
      patients: calculatedPatients,
      treatments: calculatedTreatments,
      appointments: calculatedAppts
    };
  };

  const reportStats = getFilteredReportStats();

  const kpiCounts = {
    todayAppointments: appointments.filter(a => a.date === "12 Aug 2026" && a.status !== "Cancelled").length,
    walkins: appointments.filter(a => a.date === "12 Aug 2026" && (a.notes?.toLowerCase().includes("walk-in") || a.patientName?.toLowerCase().includes("walk-in"))).length,
    waiting: appointments.filter(a => a.date === "12 Aug 2026" && (a.status === "Waiting" || a.status === "Checked In")).length,
    inTreatment: appointments.filter(a => a.date === "12 Aug 2026" && (a.status === "In Procedure" || a.status === "In Consultation")).length,
    completedToday: appointments.filter(a => a.date === "12 Aug 2026" && a.status === "Completed").length,
    pendingBills: invoices.filter(i => i.status !== "Paid").length,
    revenueToday: invoices.reduce((sum, inv) => sum + inv.paymentLogs.filter(log => log.date === "12 Aug 2026").reduce((s, l) => s + l.amount, 0), 0)
  };

  const pushActivity = (type: ActivityItem["type"], msg: string) => {
    const newAct: ActivityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      msg,
      time: "Just now"
    };
    setActivities(prev => [newAct, ...prev]);
  };

  // --- WORKFLOW EVENT HANDLERS ---

  // 1. Patient Check-In
  const handleCheckIn = (apptId: string) => {
    const activeApptsCount = appointments.filter(a => a.status === "Waiting" || a.status === "In Consultation" || a.status === "Completed").length;
    const tokenStr = `T-0${activeApptsCount + 1}`;
    
    setAppointments(prev =>
      prev.map(app => (app.id === apptId ? { ...app, status: "Waiting", token: tokenStr } : app))
    );
    
    const appt = appointments.find(a => a.id === apptId);
    if (appt) {
      pushActivity("Appointment", `Patient ${appt.patientName} checked in. Token ${tokenStr} assigned.`);
      // Add notification
      const newNotif = {
        id: Date.now() + Math.floor(Math.random() * 100000),
        msg: `Token ${tokenStr} (${appt.patientName}) is waiting in the queue.`,
        unread: true
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  // 2. Start Consultation
  const handleStartConsultation = (apptId: string) => {
    setAppointments(prev =>
      prev.map(app => (app.id === apptId ? { ...app, status: "In Consultation" } : app))
    );
    
    const appt = appointments.find(a => a.id === apptId);
    if (appt) {
      setDoctors(prev =>
        prev.map(d => (d.name === appt.doctor ? { ...d, status: "In Consultation" } : d))
      );
      
      // Initialize active consultation workspace configurations
      setActiveConsultationApptId(apptId);
      setConsultNotes(appt.notes || "");
      setConsultPrescription("");
      setConsultSelectedTooth(null);
      
      // Get patient's existing dental chart
      const patientItem = patients.find(p => p.id === appt.patientId);
      if (patientItem) {
        setConsultChart(patientItem.dentalChart || {});
      } else {
        setConsultChart({});
      }
      setConsultUploadedXrays([]);
      
      pushActivity("Treatment", `Dr. started consultation with ${appt.patientName} for ${appt.treatment}.`);
    }
  };

  // 3. Complete Consultation and Auto-Generate Invoice
  const handleCompleteConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConsultationApptId) return;

    const appt = appointments.find(a => a.id === activeConsultationApptId);
    if (!appt) return;

    // Change status in appointment table
    setAppointments(prev =>
      prev.map(app => (app.id === activeConsultationApptId ? { ...app, status: "Completed" } : app))
    );

    // Free the doctor
    setDoctors(prev =>
      prev.map(d => (d.name === appt.doctor ? { ...d, status: "Available" } : d))
    );

    // Save treatment log into patient database
    const treatmentCost = TREATMENT_PRICES[appt.treatment] || 500;
    const medicineCost = consultPrescription ? 800 : 0; // Simulate medicine cost flat ₹800
    
    const newTreatmentLog: TreatmentItem = {
      id: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: appt.treatment,
      patient: appt.patientName,
      doctor: appt.doctor,
      stage: "Completed",
      notes: consultNotes,
      nextVisit: "10 Sep 2026",
      prescription: consultPrescription || "None"
    };

    setTreatments(prev => [newTreatmentLog, ...prev]);

    // Update patient record: notes, prescriptions, chart, attachments
    setPatients(prev =>
      prev.map(p => {
        if (p.id === appt.patientId) {
          const updatedChart = { ...p.dentalChart, ...consultChart };
          const updatedPrescriptions = consultPrescription ? [...p.prescriptions, consultPrescription] : p.prescriptions;
          const updatedFiles = [...p.files, ...consultUploadedXrays];
          const updatedNotes = consultNotes ? [...p.notes, consultNotes] : p.notes;
          return {
            ...p,
            dentalChart: updatedChart,
            prescriptions: updatedPrescriptions,
            files: updatedFiles,
            notes: updatedNotes,
            visit: "12 Aug 2026"
          };
        }
        return p;
      })
    );

    // Auto-generate invoice
    const invoiceNum = `INV-${1000 + invoices.length + 1}`;
    const invoiceItems = [{ description: `${appt.treatment} Fee`, amount: treatmentCost }];
    if (consultPrescription) {
      invoiceItems.push({ description: "Prescribed Medications", amount: medicineCost });
    }

    const sub = invoiceItems.reduce((acc, item) => acc + item.amount, 0);
    const taxValue = Math.round(sub * 0.18); // 18% tax
    const tot = sub + taxValue;

    const newInvoice: InvoiceItem = {
      id: invoiceNum,
      patientId: appt.patientId,
      patientName: appt.patientName,
      doctor: appt.doctor,
      treatment: appt.treatment,
      items: invoiceItems,
      discount: 0,
      tax: 18,
      subtotal: sub,
      total: tot,
      paidAmount: 0,
      status: "Pending",
      paymentDate: "12 Aug 2026",
      paymentLogs: []
    };

    setInvoices(prev => [newInvoice, ...prev]);
    pushActivity("Treatment", `Consultation completed for ${appt.patientName}. Invoice ${invoiceNum} generated.`);

    // Reset workspace and redirect receptionist to Billing module
    setActiveConsultationApptId(null);
    setActiveTab("Billing");
    setActiveSubTab("Invoices");
  };

  // 4. Collect SPLIT/FULL Payment
  const handleCollectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;

    const collectedTotal = payCash + payUpi + payCard;
    const finalInvoiceTotal = calculateInvoiceTotal();

    const paymentLogs = [...selectedInvoiceForPayment.paymentLogs];
    const logDate = "12 Aug 2026";
    if (payCash > 0) paymentLogs.push({ method: "Cash", amount: payCash, date: logDate });
    if (payUpi > 0) paymentLogs.push({ method: "UPI", amount: payUpi, date: logDate });
    if (payCard > 0) paymentLogs.push({ method: "Card", amount: payCard, date: logDate });

    const totalPaidAmount = selectedInvoiceForPayment.paidAmount + collectedTotal;
    let finalStatus: InvoiceItem["status"] = "Pending";
    if (totalPaidAmount >= finalInvoiceTotal) {
      finalStatus = "Paid";
    } else if (totalPaidAmount > 0) {
      finalStatus = "Partially Paid";
    }

    // Update in invoices state
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === selectedInvoiceForPayment.id) {
          return {
            ...inv,
            items: [...inv.items, ...payCustomItems],
            discount: payDiscountPercent,
            tax: payTaxPercent,
            subtotal: calculateInvoiceSubtotal(),
            total: finalInvoiceTotal,
            paidAmount: totalPaidAmount,
            status: finalStatus,
            paymentLogs: paymentLogs,
            paymentDate: logDate
          };
        }
        return inv;
      })
    );

    // Apply balance update to patient directory record
    const remainingBalance = Math.max(0, finalInvoiceTotal - totalPaidAmount);
    setPatients(prev =>
      prev.map(p => {
        if (p.id === selectedInvoiceForPayment.patientId) {
          return { ...p, balance: remainingBalance > 0 ? `₹${remainingBalance.toLocaleString()}` : "₹0" };
        }
        return p;
      })
    );

    pushActivity("Payment", `Collected ₹${collectedTotal.toLocaleString()} for Invoice ${selectedInvoiceForPayment.id}.`);

    // Launch Receipt dialog overlay
    const receiptSnapshot: InvoiceItem = {
      ...selectedInvoiceForPayment,
      items: [...selectedInvoiceForPayment.items, ...payCustomItems],
      discount: payDiscountPercent,
      tax: payTaxPercent,
      subtotal: calculateInvoiceSubtotal(),
      total: finalInvoiceTotal,
      paidAmount: totalPaidAmount,
      status: finalStatus,
      paymentLogs: paymentLogs,
      paymentDate: logDate
    };
    
    setLastGeneratedReceipt(receiptSnapshot);
    setSelectedInvoiceForPayment(null);
  };

  // Add customized item directly inside payment collections
  const addCustomBillingItem = () => {
    if (!newCustomDesc || newCustomAmt <= 0) return;
    setPayCustomItems(prev => [...prev, { description: newCustomDesc, amount: newCustomAmt }]);
    setNewCustomDesc("");
    setNewCustomAmt(0);
  };

  const removeCustomBillingItem = (idx: number) => {
    setPayCustomItems(prev => prev.filter((_, i) => i !== idx));
  };

  const calculateInvoiceSubtotal = () => {
    if (!selectedInvoiceForPayment) return 0;
    const baseSub = selectedInvoiceForPayment.items.reduce((sum, item) => sum + item.amount, 0);
    const customSub = payCustomItems.reduce((sum, item) => sum + item.amount, 0);
    return baseSub + customSub;
  };

  const calculateInvoiceTotal = () => {
    const sub = calculateInvoiceSubtotal();
    const discountAmt = Math.round(sub * (payDiscountPercent / 100));
    const taxAmt = Math.round((sub - discountAmt) * (payTaxPercent / 100));
    return sub - discountAmt + taxAmt;
  };

  // Quick register walk-in patient flow
  const handleRegisterWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatName) return;

    const patientId = `DS-${1000 + patients.length + 1}`;
    const newPatientRecord: Patient = {
      id: patientId,
      name: newPatName,
      phone: newPatPhone || "+91 99000 11000",
      age: newPatAge,
      gender: newPatGender,
      address: newPatAddress || "Bengaluru",
      visit: "12 Aug 2026",
      medicalNotes: newPatAllergies,
      balance: "₹0",
      status: "Active",
      dentalChart: {},
      prescriptions: [],
      files: [],
      notes: []
    };

    // Book and check in instantly
    const apptId = `appt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const tokenStr = `T-0${appointments.filter(a => a.status === "Waiting" || a.status === "In Consultation" || a.status === "Completed").length + 1}`;
    
    const walkinAppt: Appointment = {
      id: apptId,
      patientId: patientId,
      patientName: newPatName,
      doctor: "Dr. Sharma",
      treatment: "Consultation",
      time: "12:00 PM",
      date: "12 Aug 2026",
      status: "Waiting", // Instantly checked in waiting queue
      notes: "Walk-in patient check-in.",
      token: tokenStr,
      avatarColor: "bg-amber-100 text-amber-600"
    };

    setPatients(prev => [newPatientRecord, ...prev]);
    setAppointments(prev => [...prev, walkinAppt]);
    
    pushActivity("Register", `Walk-in patient ${newPatName} registered and checked in as Token ${tokenStr}.`);
    
    // Clear walk-in inputs
    setNewPatName("");
    setNewPatPhone("");
    setNewPatAddress("");
    setNewPatAllergies("None");
    setActiveModal(null);
  };

  const handleGlobalBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === apptPatientId);
    if (!pat) return;

    const newAppt: Appointment = {
      id: `appt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      patientId: pat.id,
      patientName: pat.name,
      doctor: apptDoctor,
      treatment: apptTreatment,
      time: apptTime,
      date: apptDate,
      status: "Scheduled",
      notes: apptNotes,
      avatarColor: "bg-indigo-100 text-indigo-600"
    };

    setAppointments(prev => [...prev, newAppt]);
    pushActivity("Appointment", `Appointment booked for ${pat.name} at ${apptTime}.`);
    setApptNotes("");
    setActiveModal(null);
  };

  // --- REDESIGNED DASHBOARD WORKFLOW HANDLERS ---
  const handleClearPatientForm = () => {
    setQuickFirstName("");
    setQuickLastName("");
    setQuickMobile("");
    setQuickGender("Male");
    setQuickAge(30);
    setQuickDOB("");
    setQuickLocation("Bengaluru");
  };

  const handleSavePatientQuick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickFirstName.trim() || !quickLastName.trim()) return;

    const patientId = `DS-${1000 + patients.length + 1}`;
    const fullName = `${quickFirstName.trim()} ${quickLastName.trim()}`;
    const newPat: Patient = {
      id: patientId,
      name: fullName,
      phone: quickMobile || "+91 99000 11000",
      age: quickAge,
      gender: quickGender,
      address: quickLocation || "Bengaluru",
      visit: "12 Aug 2026",
      medicalNotes: "None",
      balance: "₹0",
      status: "Active",
      dentalChart: {},
      prescriptions: [],
      files: [],
      notes: []
    };

    setPatients(prev => [newPat, ...prev]);
    pushActivity("Register", `Quick registered patient ${fullName} (${patientId}).`);

    // Add notification
    setNotifications(prev => [
      {
        id: Date.now() + Math.floor(Math.random() * 100000),
        msg: `New Patient ${fullName} registered successfully.`,
        unread: true
      },
      ...prev
    ]);

    handleClearPatientForm();
  };

  const handleSlotBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotData || !slotPatientId) return;

    const pat = patients.find(p => p.id === slotPatientId);
    if (!pat) return;

    const newAppt: Appointment = {
      id: `appt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      patientId: pat.id,
      patientName: pat.name,
      doctor: slotDoctor,
      treatment: slotTreatment,
      time: selectedSlotData.time,
      date: selectedSlotData.date,
      status: "Scheduled",
      avatarColor: "bg-indigo-100 text-indigo-600"
    };

    setAppointments(prev => [...prev, newAppt]);
    pushActivity("Appointment", `Booked appointment for ${pat.name} on ${selectedSlotData.date} at ${selectedSlotData.time}.`);
    
    // Clear and close
    setSlotPatientId("");
    setSelectedSlotData(null);
  };

  const handleBlockSlotToggle = (date: string, time: string) => {
    const key = `${date}_${time}`;
    setBlockedSlots(prev => {
      const copy = { ...prev };
      if (copy[key]) {
        delete copy[key];
        pushActivity("Appointment", `Unblocked slot on ${date} at ${time}.`);
      } else {
        copy[key] = true;
        pushActivity("Appointment", `Blocked slot on ${date} at ${time}.`);
      }
      return copy;
    });
    setSelectedSlotData(null);
  };

  // Today's appointments custom transitions
  const handleApptCheckIn = (apptId: string) => {
    const activeApptsCount = appointments.filter(a => a.status === "Waiting" || a.status === "Checked In" || a.status === "In Procedure" || a.status === "Completed").length;
    const tokenStr = `T-0${activeApptsCount + 1}`;
    setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: "Checked In", token: tokenStr } : a));
    
    const app = appointments.find(a => a.id === apptId);
    if (app) {
      pushActivity("Appointment", `${app.patientName} checked in. Token ${tokenStr} assigned.`);
      setNotifications(prev => [{ id: Date.now() + Math.floor(Math.random() * 100000), msg: `Token ${tokenStr} (${app.patientName}) arrived.`, unread: true }, ...prev]);
    }
    if (selectedSlotData && selectedSlotData.appointment?.id === apptId) {
      setSelectedSlotData(null);
    }
  };

  const handleApptStartProcedure = (apptId: string) => {
    setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: "In Procedure" } : a));
    const app = appointments.find(a => a.id === apptId);
    if (app) {
      setDoctors(prev => prev.map(d => d.name === app.doctor ? { ...d, status: "In Consultation" } : d));
      pushActivity("Treatment", `Procedure started for ${app.patientName} with ${app.doctor}.`);
    }
    if (selectedSlotData && selectedSlotData.appointment?.id === apptId) {
      setSelectedSlotData(null);
    }
  };

  const handleApptCompleteProcedure = (apptId: string) => {
    setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: "Completed" } : a));
    const app = appointments.find(a => a.id === apptId);
    if (app) {
      setDoctors(prev => prev.map(d => d.name === app.doctor ? { ...d, status: "Available" } : d));
      pushActivity("Treatment", `Procedure completed for ${app.patientName} for ${app.treatment}.`);
      
      // Auto-generate invoice
      const invoiceNum = `INV-${1000 + invoices.length + 1}`;
      const treatmentCost = TREATMENT_PRICES[app.treatment] || 500;
      const invoiceItems = [{ description: `${app.treatment} Fee`, amount: treatmentCost }];
      const sub = treatmentCost;
      const taxValue = Math.round(sub * 0.18);
      const tot = sub + taxValue;
      
      const newInvoice: InvoiceItem = {
        id: invoiceNum,
        patientId: app.patientId,
        patientName: app.patientName,
        doctor: app.doctor,
        treatment: app.treatment,
        items: invoiceItems,
        discount: 0,
        tax: 18,
        subtotal: sub,
        total: tot,
        paidAmount: 0,
        status: "Pending",
        paymentDate: "12 Aug 2026",
        paymentLogs: []
      };

      setInvoices(prev => [newInvoice, ...prev]);
      pushActivity("Billing", `Invoice ${invoiceNum} generated for ${app.patientName}.`);
    }
    if (selectedSlotData && selectedSlotData.appointment?.id === apptId) {
      setSelectedSlotData(null);
    }
  };

  const handleApptGenerateBill = (apptId: string) => {
    const app = appointments.find(a => a.id === apptId);
    if (app) {
      const inv = invoices.find(i => i.patientId === app.patientId && i.status === "Pending");
      if (inv) {
        setSelectedInvoiceForPayment(inv);
        setPayCash(0);
        setPayUpi(0);
        setPayCard(0);
        setPayDiscountPercent(inv.discount);
        setPayTaxPercent(inv.tax);
        setPayCustomItems([]);
      } else {
        // Create quick invoice if not already created
        const invoiceNum = `INV-${1000 + invoices.length + 1}`;
        const treatmentCost = TREATMENT_PRICES[app.treatment] || 500;
        const invoiceItems = [{ description: `${app.treatment} Fee`, amount: treatmentCost }];
        const sub = treatmentCost;
        const taxValue = Math.round(sub * 0.18);
        const tot = sub + taxValue;
        
        const newInvoice: InvoiceItem = {
          id: invoiceNum,
          patientId: app.patientId,
          patientName: app.patientName,
          doctor: app.doctor,
          treatment: app.treatment,
          items: invoiceItems,
          discount: 0,
          tax: 18,
          subtotal: sub,
          total: tot,
          paidAmount: 0,
          status: "Pending",
          paymentDate: "12 Aug 2026",
          paymentLogs: []
        };
        setInvoices(prev => [newInvoice, ...prev]);
        setSelectedInvoiceForPayment(newInvoice);
        setPayCash(0);
        setPayUpi(0);
        setPayCard(0);
        setPayDiscountPercent(0);
        setPayTaxPercent(18);
        setPayCustomItems([]);
      }
    }
    if (selectedSlotData && selectedSlotData.appointment?.id === apptId) {
      setSelectedSlotData(null);
    }
  };

  const selectTab = (tabName: string) => {
    setActiveTab(tabName);
    setActiveSubTab(moduleSubTabs[tabName]?.[0] || "");
    setSelectedPatientId(null);
  };

  // --- RENDER MODULE SCREENS ---

  const renderScheduleTimeline = () => (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <span className="font-bold text-sm text-slate-800 dark:text-white">Today's Timeline Schedule</span>
        <span className="text-[10px] bg-slate-100 text-slate-655 px-2 py-0.5 rounded-full font-bold">12 Aug 2026</span>
      </div>

      <div className="space-y-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
        {appointments.filter(a => a.date === "12 Aug 2026").map((app) => (
          <div key={app.id} className="flex gap-4 relative items-start group">
            <div className={`h-9 w-9 rounded-full shrink-0 flex items-center justify-center font-bold text-xs border-2 border-white dark:border-slate-955 shadow-xs z-10 ${
              app.status === "Completed" ? "bg-emerald-500 text-white" :
              app.status === "In Consultation" ? "bg-blue-600 text-white animate-pulse" :
              app.status === "Waiting" ? "bg-amber-500 text-white animate-pulse" :
              app.status === "Cancelled" ? "bg-slate-200 text-slate-500" : "bg-slate-400 text-white"
            }`}>
              {app.token ? app.token : "S"}
            </div>

            <div className="flex-grow rounded-xl border border-slate-100 bg-slate-50/40 p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/20 transition-all duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{app.patientName}</span>
                  <span className="text-[10px] text-slate-405">• {app.treatment}</span>
                </div>
                <div className="text-xs text-slate-500">
                  <span>Doctor: <strong className="font-bold text-slate-700 dark:text-slate-300">{app.doctor}</strong></span>
                  <span className="mx-2">•</span>
                  <span>Time Slot: <strong className="font-semibold text-slate-700">{app.time}</strong></span>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                {app.status === "Scheduled" && (
                  <button onClick={() => handleCheckIn(app.id)} className="h-8 px-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xs">Check In</button>
                )}
                {app.status === "Waiting" && (
                  <button onClick={() => handleStartConsultation(app.id)} className="h-8 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs">Start Consult</button>
                )}
                {app.status === "In Consultation" && (
                  <button onClick={() => handleStartConsultation(app.id)} className="h-8 px-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs">In Consult</button>
                )}
                {app.status !== "Completed" && app.status !== "Cancelled" && (
                  <button onClick={() => setAppointments(prev => prev.map(a => a.id === app.id ? { ...a, status: "Cancelled" } : a))} className="h-8 px-2.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold">Cancel</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWaitingRoom = () => (
    <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <span className="font-bold text-xs text-slate-400 uppercase tracking-wider block mb-3">Appointments Waiting Queue</span>
      <div className="space-y-3">
        {appointments.filter(a => a.status === "Waiting").length > 0 ? (
          appointments.filter(a => a.status === "Waiting").map((item) => (
            <div key={item.id} className="p-3 border rounded-xl bg-amber-50/20 border-amber-100 flex items-center justify-between text-xs font-semibold">
              <div>
                <span className="font-bold block">{item.patientName} ({item.token})</span>
                <p className="text-[10px] text-slate-500 mt-1">Doctor: {item.doctor} • {item.treatment}</p>
              </div>
              <button
                onClick={() => handleStartConsultation(item.id)}
                className="h-7 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-white font-bold text-[10px]"
              >
                Call In
              </button>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 py-3 text-center">No patients currently waiting.</p>
        )}
      </div>
    </div>
  );

  const renderDashboardModule = () => {
    const CALENDAR_DAYS = Array.from({ length: 31 }, (_, idx) => {
      const dayNum = idx + 1;
      const dateString = `${dayNum < 10 ? '0' + dayNum : dayNum} Aug 2026`;
      const dateObj = new Date(2026, 7, dayNum); // Month 7 is August (0-indexed)
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const fullDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const name = dayNames[dateObj.getDay()];
      const fullName = fullDayNames[dateObj.getDay()];
      return {
        name,
        fullName,
        date: dateString,
        isToday: dayNum === 12
      };
    });

    const MORNING_SLOTS = [
      "09:00 AM", "09:15 AM", "09:30 AM", "09:45 AM",
      "10:00 AM", "10:15 AM", "10:30 AM", "10:45 AM",
      "11:00 AM", "11:15 AM", "11:30 AM", "11:45 AM",
      "12:00 PM", "12:15 PM", "12:30 PM", "12:45 PM"
    ];

    const EVENING_SLOTS = [
      "04:00 PM", "04:15 PM", "04:30 PM", "04:45 PM",
      "05:00 PM", "05:15 PM", "05:30 PM", "05:45 PM",
      "06:00 PM", "06:15 PM", "06:30 PM", "06:45 PM",
      "07:00 PM", "07:15 PM", "07:30 PM", "07:45 PM",
      "08:00 PM"
    ];

    // Slot matcher helper
    const getApptForSlot = (date: string, timeSlot: string) => {
      const cleanT = (t: string) => t.trim().toLowerCase().replace(/^0/, "");
      return appointments.find(a => a.date === date && cleanT(a.time) === cleanT(timeSlot) && a.status !== "Cancelled");
    };

    // Counters mapping
    const counters = [
      { title: "Today's Appointments", count: kpiCounts.todayAppointments, desc: "Active today", color: "text-blue-600", bg: "bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30" },
      { title: "Walk-ins", count: kpiCounts.walkins, desc: "Walk-ins today", color: "text-cyan-600", bg: "bg-cyan-50/40 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/30" },
      { title: "Patients Waiting", count: kpiCounts.waiting, desc: "Waiting room", color: "text-amber-600 animate-pulse", bg: "bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30" },
      { title: "In Procedure", count: kpiCounts.inTreatment, desc: "Active chairs", color: "text-orange-600", bg: "bg-orange-50/40 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30" },
      { title: "Completed Today", count: kpiCounts.completedToday, desc: "Finished sessions", color: "text-emerald-600", bg: "bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30" },
      { title: "Pending Bills", count: kpiCounts.pendingBills, desc: "Unpaid checkouts", color: "text-red-600", bg: "bg-red-50/40 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30" },
      { title: "Revenue Today", count: `₹${kpiCounts.revenueToday.toLocaleString()}`, desc: "Collected", color: "text-indigo-600", bg: "bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30" }
    ];

    // Recently added filter & sort computations
    const filteredPatients = patients
      .filter(p => {
        if (!patientSearchQuery.trim()) return true;
        const q = patientSearchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.phone.includes(q);
      })
      .filter(p => {
        if (patientFilterGender === "All") return true;
        return p.gender === patientFilterGender;
      })
      .sort((a, b) => {
        if (patientSortBy === "Name-ASC") return a.name.localeCompare(b.name);
        if (patientSortBy === "Name-DESC") return b.name.localeCompare(a.name);
        if (patientSortBy === "ID-ASC") return a.id.localeCompare(b.id);
        if (patientSortBy === "ID-DESC") return b.id.localeCompare(a.id);
        return 0;
      });

    const displayedPatients = filteredPatients.slice(0, patientVisibleCount);

    // Get next scheduled appointment for alert strip
    const nextScheduled = appointments
      .filter(a => a.date === "12 Aug 2026" && a.status === "Scheduled")
      .sort((a, b) => a.time.localeCompare(b.time))[0];

    // Today's appointments filtered list
    const todayApptsList = appointments.filter(a => a.date === "12 Aug 2026" && a.status !== "Cancelled");

    // Dynamic Chair Status Helper
    const activeProcedures = appointments.filter(a => a.date === "12 Aug 2026" && a.status === "In Procedure");
    const chairMap = [
      { id: "Chair 1", doc: "Dr. Sharma", status: activeProcedures[0] ? `Occupied by ${activeProcedures[0].patientName}` : "Available", color: activeProcedures[0] ? "bg-orange-100 text-orange-700" : "bg-emerald-50 text-emerald-700" },
      { id: "Chair 2", doc: "Dr. Priya", status: activeProcedures[1] ? `Occupied by ${activeProcedures[1].patientName}` : "Available", color: activeProcedures[1] ? "bg-orange-100 text-orange-700" : "bg-emerald-50 text-emerald-700" },
      { id: "Chair 3", doc: "Dr. Rahul", status: activeProcedures[2] ? `Occupied by ${activeProcedures[2].patientName}` : "Available", color: activeProcedures[2] ? "bg-orange-100 text-orange-700" : "bg-emerald-50 text-emerald-700" }
    ];

    // Collections by method today
    const collectionsToday = invoices
      .flatMap(inv => inv.paymentLogs)
      .filter(log => log.date === "12 Aug 2026");
    const cashTotal = collectionsToday.filter(l => l.method === "Cash").reduce((s, l) => s + l.amount, 0);
    const upiTotal = collectionsToday.filter(l => l.method.includes("UPI") || l.method.includes("GPay")).reduce((s, l) => s + l.amount, 0);
    const cardTotal = collectionsToday.filter(l => l.method === "Card").reduce((s, l) => s + l.amount, 0);

    const handleQuickEditPatient = (pat: Patient) => {
      const newPhone = prompt(`Edit Mobile Number for ${pat.name}:`, pat.phone);
      if (newPhone !== null) {
        setPatients(prev => prev.map(p => p.id === pat.id ? { ...p, phone: newPhone } : p));
        pushActivity("Register", `Updated phone number for ${pat.name} to ${newPhone}.`);
      }
    };

    const handleQuickGenerateBill = (pat: Patient) => {
      const invoiceNum = `INV-${1000 + invoices.length + 1}`;
      const newInvoice: InvoiceItem = {
        id: invoiceNum,
        patientId: pat.id,
        patientName: pat.name,
        doctor: "Dr. Sharma",
        treatment: "Consultation",
        items: [{ description: "Consultation Fee", amount: 500 }],
        discount: 0,
        tax: 18,
        subtotal: 500,
        total: 590,
        paidAmount: 0,
        status: "Pending",
        paymentDate: "12 Aug 2026",
        paymentLogs: []
      };
      setInvoices(prev => [newInvoice, ...prev]);
      setSelectedInvoiceForPayment(newInvoice);
      setPayCash(0);
      setPayUpi(0);
      setPayCard(0);
      setPayDiscountPercent(0);
      setPayTaxPercent(18);
      setPayCustomItems([]);
      pushActivity("Billing", `Invoice ${invoiceNum} generated for ${pat.name}.`);
    };

    return (
      <div className="dashboard-container space-y-8 animate-fadeIn text-slate-700">
        {/* Notification Strip */}
        <div className="alerts-strip bg-blue-600/5 dark:bg-blue-955/20 border border-blue-500/15 rounded-xl px-4 py-2.5 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-blue-800 dark:text-blue-350 items-center">
          <span className="font-bold flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            Clinic Alerts Strip:
          </span>
          <span className="font-medium">
            • {nextScheduled ? `Next appointment (${nextScheduled.patientName} - ${nextScheduled.treatment}) at ${nextScheduled.time}` : "Next appointment: none scheduled"}
          </span>
          <span className="font-medium">• 2 pending follow-ups due tomorrow</span>
          <span className="font-medium">• {invoices.filter(i => i.status !== "Paid").length} unpaid invoices pending checkout</span>
        </div>

        {/* Live Counters Banner */}
        <section className="counter-section grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {counters.map((c, i) => (
            <div key={i} className={`counter-card rounded-xl p-4 flex flex-col justify-between shadow-xs ${c.bg}`}>
              <span className="counter-title uppercase tracking-wider block">{c.title}</span>
              <div className="mt-2">
                <span className={`counter-value tracking-tight ${c.color}`}>{c.count}</span>
                <p className="counter-desc mt-0.5">{c.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* SECTION 1 - Weekly Appointment Calendar (TOP CENTER) */}
        <div className="calendar-card bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 gap-3">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">Weekly Appointment Calendar</span>
              <p className="text-[10px] text-slate-400">Select day of week to manage slots & book patients</p>
            </div>
            <div className="text-xs font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg">
              August 2026
            </div>
          </div>

          {/* Day Selector */}
          <div className="flex overflow-x-auto gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {CALENDAR_DAYS.map((d) => {
              const isActive = selectedCalendarDay === d.date;
              const hasAppts = appointments.some(a => a.date === d.date && a.status !== "Cancelled");
              return (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => setSelectedCalendarDay(d.date)}
                  className={`day-btn flex flex-col items-center py-2.5 px-3 rounded-xl transition-all border outline-none shrink-0 min-w-[56px] sm:min-w-[64px] ${
                    isActive
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm scale-105"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                  }`}
                >
                  <span className="day-btn-name font-bold uppercase">{d.name}</span>
                  <span className="day-btn-num font-extrabold mt-0.5">{d.date.split(" ")[0]}</span>
                  {hasAppts && (
                    <span className={`h-1.5 w-1.5 rounded-full mt-1.5 ${isActive ? "bg-white" : "bg-blue-600 animate-pulse"}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Time Slots Grid (Morning vs Evening) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Morning Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-blue-650 font-extrabold uppercase text-[10px] tracking-wider border-b pb-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Morning Sessions (09:00 AM - 12:45 PM)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MORNING_SLOTS.map((time) => {
                  const appt = getApptForSlot(selectedCalendarDay, time);
                  const isBlocked = blockedSlots[`${selectedCalendarDay}_${time}`];
                  
                  let btnStyle = "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900";
                  let statusText = "Available";
                  let statusBadge = null;

                  if (isBlocked) {
                    btnStyle = "bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800";
                    statusText = "Blocked";
                  } else if (appt) {
                    statusText = appt.patientName;
                    const st = appt.status;
                    if (st === "Scheduled") statusBadge = "bg-blue-600 text-white";
                    else if (st === "Checked In" || st === "Waiting") statusBadge = "bg-emerald-600 text-white";
                    else if (st === "In Procedure") statusBadge = "bg-orange-500 text-white";
                    else if (st === "In Consultation") statusBadge = "bg-purple-600 text-white";
                    else if (st === "Completed") statusBadge = "bg-slate-500 text-white";
                    else if (st === "Cancelled") statusBadge = "bg-red-600 text-white";
                  }

                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        setSlotPatientId("");
                        setSelectedSlotData({ date: selectedCalendarDay, time, appointment: appt });
                      }}
                      className={`slot-btn p-2.5 rounded-xl border text-[10px] flex flex-col justify-between items-start text-left h-20 transition-all ${
                        appt ? "bg-white shadow-xs dark:bg-slate-955" : "bg-slate-50/50 border-dashed"
                      } ${btnStyle}`}
                    >
                      <span className="slot-time font-bold">{time.replace(" AM", "")}</span>
                      {statusBadge ? (
                        <div className="w-full mt-1">
                          <p className="slot-patient-name font-extrabold truncate text-slate-900 dark:text-white mb-1 leading-tight">{statusText}</p>
                          <span className={`slot-badge px-1.5 py-0.5 rounded text-[8px] font-bold inline-block uppercase tracking-wider ${statusBadge}`}>
                            {appt?.status === "In Consultation" ? "Consult" : appt?.status === "In Procedure" ? "Procedure" : appt?.status}
                          </span>
                        </div>
                      ) : (
                        <span className={`slot-open-label text-[9px] font-semibold flex items-center gap-1 mt-1 ${isBlocked ? "font-bold" : ""}`}>
                          {isBlocked ? "🔒 Blocked" : "+ Open Slot"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Evening Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-indigo-650 font-extrabold uppercase text-[10px] tracking-wider border-b pb-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Evening Sessions (04:00 PM - 08:00 PM)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {EVENING_SLOTS.map((time) => {
                  const appt = getApptForSlot(selectedCalendarDay, time);
                  const isBlocked = blockedSlots[`${selectedCalendarDay}_${time}`];
                  
                  let btnStyle = "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900";
                  let statusText = "Available";
                  let statusBadge = null;

                  if (isBlocked) {
                    btnStyle = "bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800";
                    statusText = "Blocked";
                  } else if (appt) {
                    statusText = appt.patientName;
                    const st = appt.status;
                    if (st === "Scheduled") statusBadge = "bg-blue-600 text-white";
                    else if (st === "Checked In" || st === "Waiting") statusBadge = "bg-emerald-600 text-white";
                    else if (st === "In Procedure") statusBadge = "bg-orange-500 text-white";
                    else if (st === "In Consultation") statusBadge = "bg-purple-600 text-white";
                    else if (st === "Completed") statusBadge = "bg-slate-500 text-white";
                    else if (st === "Cancelled") statusBadge = "bg-red-600 text-white";
                  }

                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        setSlotPatientId("");
                        setSelectedSlotData({ date: selectedCalendarDay, time, appointment: appt });
                      }}
                      className={`slot-btn p-2.5 rounded-xl border text-[10px] flex flex-col justify-between items-start text-left h-20 transition-all ${
                        appt ? "bg-white shadow-xs dark:bg-slate-955" : "bg-slate-50/50 border-dashed"
                      } ${btnStyle}`}
                    >
                      <span className="slot-time font-bold">{time.replace(" PM", "")}</span>
                      {statusBadge ? (
                        <div className="w-full mt-1">
                          <p className="slot-patient-name font-extrabold truncate text-slate-900 dark:text-white mb-1 leading-tight">{statusText}</p>
                          <span className={`slot-badge px-1.5 py-0.5 rounded text-[8px] font-bold inline-block uppercase tracking-wider ${statusBadge}`}>
                            {appt?.status === "In Consultation" ? "Consult" : appt?.status === "In Procedure" ? "Procedure" : appt?.status}
                          </span>
                        </div>
                      ) : (
                        <span className={`slot-open-label text-[9px] font-semibold flex items-center gap-1 mt-1 ${isBlocked ? "font-bold" : ""}`}>
                          {isBlocked ? "🔒 Blocked" : "+ Open Slot"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 3-Column Operational Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SECTION 2 - Add Patient Panel (LEFT) */}
          <div className="form-card lg:col-span-4 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <span className="font-bold text-sm block mb-1">Quick Patient Registration</span>
            <p className="text-[10px] text-slate-405 mb-4 uppercase tracking-wider font-extrabold">Generate and save intake file</p>
            
            <form onSubmit={handleSavePatientQuick} className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label htmlFor="qPatID" className="form-label-custom">Patient ID</Label>
                  <Input id="qPatID" value={`DS-${1000 + patients.length + 1}`} disabled className="form-field-custom bg-slate-50 dark:bg-slate-900 opacity-60 cursor-not-allowed font-bold" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="qMobile" className="form-label-custom">Mobile Number</Label>
                  <Input id="qMobile" placeholder="e.g. +91 99000 11000" value={quickMobile} onChange={e => setQuickMobile(e.target.value)} required className="form-field-custom" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label htmlFor="qFirstName" className="form-label-custom">First Name</Label>
                  <Input id="qFirstName" placeholder="e.g. Rahul" value={quickFirstName} onChange={e => setQuickFirstName(e.target.value)} required className="form-field-custom" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="qLastName" className="form-label-custom">Last Name</Label>
                  <Input id="qLastName" placeholder="e.g. Verma" value={quickLastName} onChange={e => setQuickLastName(e.target.value)} required className="form-field-custom" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label htmlFor="qAge" className="form-label-custom">Age</Label>
                  <Input id="qAge" type="number" min="0" value={quickAge || ""} onChange={e => setQuickAge(parseInt(e.target.value) || 30)} required className="form-field-custom" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="qGender" className="form-label-custom">Gender</Label>
                  <select
                    id="qGender"
                    className="form-field-custom flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs focus:outline-none dark:bg-slate-900 dark:border-slate-800"
                    value={quickGender}
                    onChange={e => setQuickGender(e.target.value as "Male" | "Female")}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label htmlFor="qDOB" className="form-label-custom">Date of Birth</Label>
                  <Input id="qDOB" type="date" value={quickDOB} onChange={e => setQuickDOB(e.target.value)} className="form-field-custom" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="qLocation" className="form-label-custom">Location</Label>
                  <Input id="qLocation" placeholder="e.g. Jayanagar" value={quickLocation} onChange={e => setQuickLocation(e.target.value)} className="form-field-custom" />
                </div>
              </div>
              
              <div className="flex gap-2 pt-3">
                <Button type="button" variant="outline" onClick={handleClearPatientForm} className="form-btn-custom flex-1 text-[11px] font-bold h-9">Clear</Button>
                <Button type="submit" className="form-btn-custom flex-1 text-[11px] font-bold h-9 bg-blue-600 hover:bg-blue-500 text-white shadow-xs">Save Patient</Button>
              </div>
            </form>
          </div>

          {/* SECTION 3 - Recently Added Patients (CENTER) */}
          <div className="list-card lg:col-span-4 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm block">Recently Added Patients</span>
                <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">{filteredPatients.length} Files</span>
              </div>
              
              {/* Search, Filter, Sort Inputs */}
              <div className="grid gap-2.5 grid-cols-3 mb-4">
                <div className="col-span-3 relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, ID..."
                    value={patientSearchQuery}
                    onChange={e => setPatientSearchQuery(e.target.value)}
                    className="h-8 pl-8 pr-2 w-full rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 dark:bg-slate-900 dark:border-slate-800"
                  />
                </div>
                <div>
                  <select
                    value={patientFilterGender}
                    onChange={e => setPatientFilterGender(e.target.value)}
                    className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[9px] font-bold focus:outline-none dark:bg-slate-900 dark:border-slate-800"
                  >
                    <option value="All">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <select
                    value={patientSortBy}
                    onChange={e => setPatientSortBy(e.target.value)}
                    className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[9px] font-bold focus:outline-none dark:bg-slate-900 dark:border-slate-800"
                  >
                    <option value="Name-ASC">Sort: Name (A-Z)</option>
                    <option value="Name-DESC">Sort: Name (Z-A)</option>
                    <option value="ID-ASC">Sort: ID (Asc)</option>
                    <option value="ID-DESC">Sort: ID (Desc)</option>
                  </select>
                </div>
              </div>

              {/* Patient List container with simulated Infinite Scroll */}
              <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                {displayedPatients.map((pat) => (
                  <div key={pat.id} className="patient-row p-3 border border-slate-100 hover:border-blue-300 dark:border-slate-800 dark:hover:border-blue-900/50 rounded-xl bg-slate-50/30 flex justify-between items-center transition-all group">
                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => { setSelectedPatientId(pat.id); setActiveTab("Patients"); }}>
                      <span className="patient-name-txt font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 block truncate">{pat.name}</span>
                      <p className="patient-sub-txt text-[9px] text-slate-400 mt-0.5">{pat.id} • {pat.phone}</p>
                    </div>
                    {/* Action Icons */}
                    <div className="flex gap-1.5 ml-2">
                      <button
                        title="Book Appointment"
                        onClick={() => {
                          setSlotPatientId(pat.id);
                          setSelectedSlotData({ date: selectedCalendarDay, time: "09:00 AM" });
                        }}
                        className="h-6 w-6 rounded-md bg-white border dark:bg-slate-900 dark:border-slate-800 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
                      </button>
                      <button
                        title="Dental Chart"
                        onClick={() => {
                          setSelectedPatientId(pat.id);
                          setProfileSubTab("Dental Chart");
                          setActiveTab("Patients");
                        }}
                        className="h-6 w-6 rounded-md bg-white border dark:bg-slate-900 dark:border-slate-800 flex items-center justify-center text-purple-600 hover:bg-purple-50"
                      >
                        <Activity className="h-3.5 w-3.5" />
                      </button>
                      <button
                        title="Generate Bill"
                        onClick={() => handleQuickGenerateBill(pat)}
                        className="h-6 w-6 rounded-md bg-white border dark:bg-slate-900 dark:border-slate-800 flex items-center justify-center text-emerald-600 hover:bg-emerald-50"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                      </button>
                      <button
                        title="Quick Edit"
                        onClick={() => handleQuickEditPatient(pat)}
                        className="h-6 w-6 rounded-md bg-white border dark:bg-slate-900 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-100"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {filteredPatients.length === 0 && (
                  <p className="text-[10px] text-slate-400 py-6 text-center">No patients found</p>
                )}
              </div>
            </div>

            {/* Load More Button */}
            {filteredPatients.length > patientVisibleCount && (
              <button
                type="button"
                onClick={() => setPatientVisibleCount(prev => prev + 5)}
                className="w-full h-8 mt-3 rounded-lg border border-dashed border-slate-300 text-slate-450 hover:bg-slate-50 text-[10px] font-bold"
              >
                Load More Patients
              </button>
            )}
          </div>

          {/* SECTION 4 - Today's Appointments (RIGHT) */}
          <div className="list-card lg:col-span-4 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <span className="font-bold text-sm block mb-1">Today's Appointment Queue</span>
            <p className="text-[10px] text-slate-405 mb-4 uppercase tracking-wider font-extrabold">Clinic Workflow Tracker</p>

            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
              {todayApptsList.map((app) => {
                let badgeStyle = "bg-blue-50 text-blue-700 border border-blue-100";
                if (app.status === "Checked In" || app.status === "Waiting") badgeStyle = "bg-emerald-50 text-emerald-700 border border-emerald-100";
                else if (app.status === "In Procedure") badgeStyle = "bg-orange-50 text-orange-700 border border-orange-100 animate-pulse";
                else if (app.status === "Completed") badgeStyle = "bg-slate-100 text-slate-600 border border-slate-200";

                const isPaid = invoices.find(i => i.patientId === app.patientId && i.treatment === app.treatment)?.status === "Paid";
                const isInvoicePending = invoices.find(i => i.patientId === app.patientId && i.treatment === app.treatment)?.status === "Pending";

                return (
                  <div key={app.id} className="queue-row p-3.5 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/20 hover:bg-slate-50/50 transition-colors space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                            {app.token || "T-NEW"}
                          </span>
                          <span className="queue-name-txt font-extrabold text-slate-900 dark:text-white">{app.patientName}</span>
                        </div>
                        <p className="queue-sub-txt text-[9px] text-slate-400 mt-1 font-bold">
                          {app.doctor} • {app.treatment} at {app.time}
                        </p>
                      </div>
                      <span className={`queue-badge px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0 ${badgeStyle}`}>
                        {app.status}
                      </span>
                    </div>

                    {/* Action buttons list */}
                    <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                      {app.status === "Scheduled" && (
                        <button
                          type="button"
                          onClick={() => handleApptCheckIn(app.id)}
                          className="h-6 px-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[9px] shadow-xs"
                        >
                          Check In
                        </button>
                      )}

                      {(app.status === "Checked In" || app.status === "Waiting") && (
                        <button
                          type="button"
                          onClick={() => handleApptStartProcedure(app.id)}
                          className="h-6 px-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[9px]"
                        >
                          Start Procedure
                        </button>
                      )}

                      {app.status === "In Procedure" && (
                        <button
                          type="button"
                          onClick={() => handleApptCompleteProcedure(app.id)}
                          className="h-6 px-2.5 rounded bg-orange-500 hover:bg-orange-450 text-white font-bold text-[9px] shadow-xs"
                        >
                          Complete
                        </button>
                      )}

                      {app.status === "Completed" && !isPaid && !isInvoicePending && (
                        <button
                          type="button"
                          onClick={() => handleApptGenerateBill(app.id)}
                          className="h-6 px-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px]"
                        >
                          Generate Bill
                        </button>
                      )}

                      {app.status === "Completed" && isInvoicePending && (
                        <button
                          type="button"
                          onClick={() => handleApptGenerateBill(app.id)}
                          className="h-6 px-2.5 rounded bg-amber-500 hover:bg-amber-400 text-white font-bold text-[9px]"
                        >
                          Collect Payment
                        </button>
                      )}

                      {(app.status === "Checked In" || app.status === "Waiting" || app.status === "Scheduled" || app.status === "Completed") && (
                        <button
                          type="button"
                          onClick={() => {
                            alert(`Mock Token Printed for ${app.patientName} (${app.token || "None"})`);
                          }}
                          className="h-6 px-2.5 rounded border border-slate-200 hover:bg-slate-100 text-slate-500 font-bold text-[9px]"
                        >
                          Print Token
                        </button>
                      )}

                      {app.status !== "Completed" && (
                        <button
                          type="button"
                          onClick={() => setAppointments(prev => prev.map(a => a.id === app.id ? { ...a, status: "Cancelled" } : a))}
                          className="h-6 px-2 text-red-600 hover:bg-red-50 rounded text-[9px] font-bold"
                        >
                          Cancel
                        </button>
                      )}

                      {app.status === "Completed" && isPaid && (
                        <>
                          <button
                            type="button"
                            onClick={() => alert(`Simulated SMS sent to patient ${app.patientName}: Your payment of is confirmed.`)}
                            className="h-6 px-2.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-[9px]"
                          >
                            Send SMS
                          </button>
                          <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1 pl-1">
                            ✓ Bill Paid
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {todayApptsList.length === 0 && (
                <p className="text-[10px] text-slate-400 py-8 text-center">No appointments tracked today</p>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM DASHBOARD */}
        <div className="bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-200 dark:border-slate-800 pt-6">
          <span className="font-bold text-xs text-slate-400 uppercase tracking-wider block mb-4">Clinic Operational Widgets</span>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Widget 1 - Walk-In Queue */}
            <div className="widget-card bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-3">Walk-In Queue</span>
              <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                {appointments
                  .filter(a => a.date === "12 Aug 2026" && (a.notes?.toLowerCase().includes("walk-in") || a.patientName?.toLowerCase().includes("walk-in")) && (a.status === "Waiting" || a.status === "Checked In"))
                  .map((item) => (
                    <div key={item.id} className="p-2 border rounded-lg bg-amber-50/15 border-amber-100 dark:border-amber-900/20 flex items-center justify-between text-[10px]">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.patientName}</span>
                        <p className="text-[8px] text-slate-400">Token: {item.token || "NEW"} • {item.treatment}</p>
                      </div>
                      <button
                        onClick={() => handleApptStartProcedure(item.id)}
                        className="h-5 px-2 rounded bg-amber-500 hover:bg-amber-400 text-white font-bold text-[8px]"
                      >
                        Call In
                      </button>
                    </div>
                  ))}
                {appointments.filter(a => a.date === "12 Aug 2026" && (a.notes?.toLowerCase().includes("walk-in") || a.patientName?.toLowerCase().includes("walk-in")) && (a.status === "Waiting" || a.status === "Checked In")).length === 0 && (
                  <p className="text-[9px] text-slate-400 py-6 text-center">No walk-ins waiting</p>
                )}
              </div>
            </div>

            {/* Widget 2 - Pending Bills */}
            <div className="widget-card bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-3">Pending Bills</span>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {invoices.filter(i => i.status !== "Paid").map((inv) => (
                  <div key={inv.id} className="p-2 border rounded-lg bg-red-50/15 border-red-100 dark:border-red-900/20 flex items-center justify-between text-[10px]">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{inv.patientName}</span>
                      <p className="text-[8px] text-red-505 font-bold">Unpaid: ₹{(inv.total - inv.paidAmount).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedInvoiceForPayment(inv);
                        setPayCash(0);
                        setPayUpi(0);
                        setPayCard(0);
                        setPayDiscountPercent(inv.discount);
                        setPayTaxPercent(inv.tax);
                        setPayCustomItems([]);
                      }}
                      className="h-5 px-2 rounded bg-red-650 hover:bg-red-500 text-white font-bold text-[8px]"
                    >
                      Pay
                    </button>
                  </div>
                ))}
                {invoices.filter(i => i.status !== "Paid").length === 0 && (
                  <p className="text-[9px] text-slate-400 py-6 text-center">No bills outstanding</p>
                )}
              </div>
            </div>

            {/* Widget 3 - Recent Activity */}
            <div className="widget-card bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-3">Recent Activity</span>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex gap-2 text-[9px] relative">
                    <div className="h-2 w-2 rounded-full mt-1.5 shrink-0 bg-blue-500" />
                    <div>
                      <p className="text-slate-700 dark:text-slate-350 font-bold leading-normal">{act.msg}</p>
                      <span className="text-[8px] text-slate-400 font-semibold">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAppointmentsModule = () => {
    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDayIndex = new Date(year, month, 1).getDay();
      const totalDays = new Date(year, month + 1, 0).getDate();
      const prevMonthTotalDays = new Date(year, month, 0).getDate();
      
      const days: { date: Date; isCurrentMonth: boolean }[] = [];
      let firstDayOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
      
      for (let i = firstDayOffset - 1; i >= 0; i--) {
        days.push({
          date: new Date(year, month - 1, prevMonthTotalDays - i),
          isCurrentMonth: false
        });
      }
      
      for (let i = 1; i <= totalDays; i++) {
        days.push({
          date: new Date(year, month, i),
          isCurrentMonth: true
        });
      }
      
      const remainingSlots = 42 - days.length;
      for (let i = 1; i <= remainingSlots; i++) {
        days.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false
        });
      }
      
      return days;
    };

    const getWeekDays = (baseDate: Date) => {
      const currentDay = baseDate.getDay(); 
      const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(baseDate);
      monday.setDate(baseDate.getDate() + distanceToMonday);
      
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
      });
    };

    const formatDateString = (d: Date) => {
      const day = d.getDate();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day < 10 ? '0' + day : day} ${month} ${year}`;
    };

    // Filter appointments dynamically
    const filteredAppts = appointments.filter(a => {
      if (apptSearchQuery.trim()) {
        const q = apptSearchQuery.toLowerCase();
        const matches = a.patientName?.toLowerCase().includes(q) || 
                        a.patientId?.toLowerCase().includes(q) || 
                        a.doctor?.toLowerCase().includes(q) ||
                        a.treatment?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (apptSelectedDoctor !== "All" && a.doctor !== apptSelectedDoctor) return false;
      if (apptSelectedStatus !== "All" && a.status !== apptSelectedStatus) return false;
      if (apptSelectedTreatment !== "All" && a.treatment !== apptSelectedTreatment) return false;
      if (apptSelectedLocation !== "All") {
        const pat = patients.find(p => p.id === a.patientId);
        if (pat && !pat.address?.toLowerCase().includes(apptSelectedLocation.toLowerCase())) return false;
      }
      if (apptSelectedType !== "All") {
        const isWalkin = a.notes?.toLowerCase().includes("walk-in") || a.patientName?.toLowerCase().includes("walk-in");
        if (apptSelectedType === "Walk-In" && !isWalkin) return false;
        if (apptSelectedType === "Scheduled" && isWalkin) return false;
      }
      return true;
    });

    return (
      <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs font-semibold text-slate-700">
        
        {/* LEFT SIDEBAR PANEL (25% - Col Span 3) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <Button 
              onClick={() => setActiveModal("addAppointment")} 
              className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs"
            >
              <CalendarPlus className="h-4.5 w-4.5" /> Book Appointment
            </Button>

            <Button 
              variant="outline"
              className="w-full h-11 border-slate-200 hover:bg-slate-50 dark:border-slate-800 text-blue-600 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              onClick={() => {
                const dateStr = prompt("Enter target date (YYYY-MM-DD):", "2026-08-12");
                if (dateStr) {
                  const parts = dateStr.split("-");
                  if (parts.length === 3) {
                    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    setApptCalendarDate(d);
                  }
                }
              }}
            >
              <Calendar className="h-4.5 w-4.5" /> Go to Date
            </Button>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Location Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Location</label>
              <select 
                value={apptSelectedLocation}
                onChange={(e) => setApptSelectedLocation(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none dark:bg-slate-900 dark:border-slate-800 text-slate-705"
              >
                <option value="All">All Locations</option>
                <option value="Bengaluru">Bengaluru Clinic</option>
                <option value="Jayanagar">Jayanagar Branch</option>
                <option value="Whitefield">Whitefield Center</option>
              </select>
            </div>
          </div>

          {/* All Doctors Section */}
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <span className="font-bold text-xs text-slate-400 uppercase tracking-wider block mb-3">All Doctors</span>
            <div className="space-y-2">
              <div 
                onClick={() => setApptSelectedDoctor("All")}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  apptSelectedDoctor === "All" 
                    ? "bg-blue-50/50 border-blue-500 dark:bg-blue-950/20" 
                    : "bg-slate-50/30 border-slate-100 hover:bg-slate-50 dark:bg-slate-900/10 dark:border-slate-800"
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">ALL</div>
                <div>
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Show All Doctors</span>
                  <p className="text-[9px] text-slate-400">View combined schedule</p>
                </div>
              </div>

              {doctors.map((doc, idx) => {
                const isActive = apptSelectedDoctor === doc.name;
                const initials = doc.name.replace("Dr. ", "").split(" ").map(n => n[0]).join("").toUpperCase();
                const colors = [
                  "bg-blue-100 text-blue-700",
                  "bg-purple-100 text-purple-700",
                  "bg-emerald-100 text-emerald-700",
                  "bg-indigo-100 text-indigo-700",
                  "bg-pink-100 text-pink-700"
                ];
                const avatarColor = colors[idx % colors.length];
                const todayCount = appointments.filter(a => a.doctor === doc.name && a.date === "12 Aug 2026" && a.status !== "Cancelled").length;

                return (
                  <div 
                    key={doc.name}
                    onClick={() => setApptSelectedDoctor(isActive ? "All" : doc.name)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isActive 
                        ? "bg-blue-50/50 border-blue-500 dark:bg-blue-955/20" 
                        : "bg-slate-50/30 border-slate-100 hover:bg-slate-50 dark:bg-slate-900/10 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full font-extrabold text-xs flex items-center justify-center ${avatarColor}`}>
                        {initials}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">{doc.name}</span>
                        <p className="text-[9px] text-slate-450">{doc.speciality}</p>
                      </div>
                    </div>
                    {todayCount > 0 && (
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-full font-bold text-slate-600 dark:text-slate-300">{todayCount} Today</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (75% - Col Span 9) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Top Toolbar */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            
            {/* Month Navigator */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  const prev = new Date(apptCalendarDate);
                  prev.setMonth(prev.getMonth() - 1);
                  setApptCalendarDate(prev);
                }}
                className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 dark:border-slate-800 dark:text-slate-400"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 min-w-[125px] text-center">
                {apptCalendarDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </span>
              <button 
                onClick={() => {
                  const next = new Date(apptCalendarDate);
                  next.setMonth(next.getMonth() + 1);
                  setApptCalendarDate(next);
                }}
                className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 dark:border-slate-800 dark:text-slate-400"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={apptSearchQuery}
                onChange={(e) => setApptSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-3 w-full rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none dark:bg-slate-900 dark:border-slate-800"
              />
            </div>

            {/* View Toggle */}
            <div className="bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl flex items-center">
              {(["Month", "Week", "Day"] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setApptView(view)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    apptView === view 
                      ? "bg-white text-blue-600 shadow-sm dark:bg-slate-950" 
                      : "text-slate-550 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Row */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-450 mr-1" />
              <span>Filters:</span>
            </div>

            <select 
              value={apptSelectedStatus}
              onChange={(e) => setApptSelectedStatus(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold focus:outline-none dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Waiting">Waiting</option>
              <option value="In Procedure">In Procedure</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select 
              value={apptSelectedTreatment}
              onChange={(e) => setApptSelectedTreatment(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold focus:outline-none dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Treatments</option>
              <option value="Root Canal">Root Canal</option>
              <option value="Scaling">Scaling</option>
              <option value="Implant">Implant</option>
              <option value="Crown">Crown</option>
              <option value="Consultation">Consultation</option>
            </select>

            <select 
              value={apptSelectedType}
              onChange={(e) => setApptSelectedType(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold focus:outline-none dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Types</option>
              <option value="Scheduled">Scheduled Only</option>
              <option value="Walk-In">Walk-Ins Only</option>
            </select>
          </div>

          {/* MONTH VIEW */}
          {apptView === "Month" && (
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-3 border-b pb-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth(apptCalendarDate).map((dayObj, index) => {
                  const dateStr = formatDateString(dayObj.date);
                  const dayAppts = filteredAppts.filter(a => a.date === dateStr);
                  const isToday = dayObj.date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div 
                      key={index} 
                      className={`min-h-[110px] p-2 border rounded-xl flex flex-col justify-between transition-colors ${
                        dayObj.isCurrentMonth 
                          ? "bg-white border-slate-200 dark:bg-slate-955 dark:border-slate-800" 
                          : "bg-slate-50/50 border-slate-100 text-slate-400 dark:bg-slate-900/10 dark:border-slate-900"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center ${
                          isToday ? "bg-blue-600 text-white shadow-xs" : "text-slate-800 dark:text-slate-200"
                        }`}>
                          {dayObj.date.getDate()}
                        </span>
                      </div>

                      <div className="space-y-1.5 flex-1 overflow-y-auto pr-0.5 max-h-[80px]">
                        {dayAppts.slice(0, 2).map(appt => {
                          let docBorderColor = "border-l-blue-500 bg-blue-50/20";
                          if (appt.doctor.includes("Raghuram")) docBorderColor = "border-l-cyan-500 bg-cyan-50/20";
                          else if (appt.doctor.includes("Srinivasa")) docBorderColor = "border-l-purple-500 bg-purple-50/20";
                          else if (appt.doctor.includes("Priyanka")) docBorderColor = "border-l-emerald-500 bg-emerald-50/20";
                          else if (appt.doctor.includes("Krishna")) docBorderColor = "border-l-indigo-500 bg-indigo-50/20";

                          return (
                            <div 
                              key={appt.id}
                              onClick={() => setSelectedApptDetail(appt)}
                              className={`p-1.5 border-l-2 rounded-md text-[9.5px] cursor-pointer hover:shadow-xs transition-shadow block leading-snug ${docBorderColor}`}
                            >
                              <p className="font-extrabold text-slate-900 dark:text-white truncate">{appt.patientName}</p>
                              <p className="text-slate-500 text-[8px] truncate">{appt.patientId}</p>
                              <p className="text-slate-450 text-[8px] truncate">{appt.doctor}</p>
                            </div>
                          );
                        })}
                        
                        {dayAppts.length > 2 && (
                          <button 
                            onClick={() => {
                              setSelectedSlotData({ date: dateStr, time: "Multiple" });
                            }}
                            className="w-full text-center py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 text-[9px] font-extrabold text-blue-600"
                          >
                            +{dayAppts.length - 2} More
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* WEEK VIEW */}
          {apptView === "Week" && (
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-8 gap-2 text-center text-xs font-bold text-slate-400 border-b pb-3 mb-2">
                  <div className="text-left py-1">Time</div>
                  {getWeekDays(apptCalendarDate).map((day, idx) => {
                    const daysName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                    return (
                      <div key={idx} className="py-1">
                        <span className="block text-[9.5px] uppercase">{daysName[day.getDay()]}</span>
                        <span className="block text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{day.getDate()}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-900">
                  {["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"].map((hourSlot) => (
                    <div key={hourSlot} className="grid grid-cols-8 gap-2 py-3 items-stretch min-h-[70px]">
                      <div className="text-[10px] text-slate-400 font-bold self-start mt-1">{hourSlot}</div>
                      
                      {getWeekDays(apptCalendarDate).map((day, idx) => {
                        const dateStr = formatDateString(day);
                        const slotAppts = filteredAppts.filter(a => {
                          if (a.date !== dateStr) return false;
                          const matchHour = a.time.split(":")[0];
                          const matchAmPm = a.time.split(" ")[1];
                          const slotHour = hourSlot.split(":")[0];
                          const slotAmPm = hourSlot.split(" ")[1];
                          return parseInt(matchHour) === parseInt(slotHour) && matchAmPm === slotAmPm;
                        });

                        return (
                          <div key={idx} className="rounded-lg bg-slate-50/20 border border-dashed border-slate-100 dark:border-slate-850 p-1.5 flex flex-col gap-1.5">
                            {slotAppts.map(appt => {
                              let docBorderColor = "border-l-blue-500 bg-blue-50/25";
                              if (appt.doctor.includes("Raghuram")) docBorderColor = "border-l-cyan-500 bg-cyan-50/25";
                              else if (appt.doctor.includes("Srinivasa")) docBorderColor = "border-l-purple-500 bg-purple-50/25";
                              else if (appt.doctor.includes("Priyanka")) docBorderColor = "border-l-emerald-500 bg-emerald-50/25";
                              else if (appt.doctor.includes("Krishna")) docBorderColor = "border-l-indigo-500 bg-indigo-50/25";

                              return (
                                <div 
                                  key={appt.id}
                                  onClick={() => setSelectedApptDetail(appt)}
                                  className={`p-2 border-l-2 rounded-lg text-[9.5px] cursor-pointer hover:shadow-xs transition-shadow block ${docBorderColor}`}
                                >
                                  <p className="font-extrabold text-slate-900 dark:text-white truncate">{appt.patientName}</p>
                                  <p className="text-[8px] text-slate-450 truncate">{appt.patientId}</p>
                                  <p className="text-[8px] text-slate-550 truncate">{appt.doctor}</p>
                                  <p className="text-[8px] font-bold text-slate-600 mt-1">{appt.time}</p>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DAY VIEW */}
          {apptView === "Day" && (
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <span className="font-bold text-sm block mb-1">Timeline Schedule for {formatDateString(apptCalendarDate)}</span>
              <p className="text-[10px] text-slate-400">15-minute time slots workflow tracker</p>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-900 max-h-[600px] overflow-y-auto pr-2">
                {Array.from({ length: 45 }, (_, idx) => {
                  const totalMinutes = 9 * 60 + idx * 15;
                  const hours = Math.floor(totalMinutes / 60);
                  const minutes = totalMinutes % 60;
                  const ampm = hours >= 12 ? "PM" : "AM";
                  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
                  const slotTimeStr = `${displayHours < 10 ? '0' + displayHours : displayHours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
                  
                  const slotAppt = filteredAppts.find(a => {
                    if (a.date !== formatDateString(apptCalendarDate)) return false;
                    const cleanT = (t: string) => t.trim().toLowerCase().replace(/^0/, "");
                    return cleanT(a.time) === cleanT(slotTimeStr);
                  });

                  return (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-4 text-xs font-semibold">
                      <span className="text-[10px] font-bold text-slate-400 w-16">{slotTimeStr}</span>
                      
                      {slotAppt ? (
                        (() => {
                          let docColor = "border-l-blue-500 bg-blue-50/15";
                          if (slotAppt.doctor.includes("Raghuram")) docColor = "border-l-cyan-500 bg-cyan-50/15";
                          else if (slotAppt.doctor.includes("Srinivasa")) docColor = "border-l-purple-500 bg-purple-50/15";
                          else if (slotAppt.doctor.includes("Priyanka")) docColor = "border-l-emerald-500 bg-emerald-50/15";
                          else if (slotAppt.doctor.includes("Krishna")) docColor = "border-l-indigo-500 bg-indigo-50/15";

                          return (
                            <div 
                              onClick={() => setSelectedApptDetail(slotAppt)}
                              className={`flex-1 p-3 border-l-3 rounded-xl flex items-center justify-between cursor-pointer hover:shadow-xs transition-shadow ${docColor}`}
                            >
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">{slotAppt.patientName}</span>
                                <p className="text-[10px] text-slate-450 mt-0.5">{slotAppt.patientId} • Doctor: {slotAppt.doctor}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold uppercase">{slotAppt.treatment}</span>
                                <p className="text-[9px] text-slate-400 mt-1">{slotAppt.status}</p>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <button 
                          onClick={() => {
                            setSelectedSlotData({ date: formatDateString(apptCalendarDate), time: slotTimeStr });
                          }}
                          className="flex-1 py-3 border border-dashed border-slate-100 hover:border-blue-300 rounded-xl text-[10px] text-slate-400 font-bold text-left px-4 hover:bg-slate-50/20"
                        >
                          + Block / Open Appointment Slot
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* SIDE DRAWER FOR DETAILS */}
        {selectedApptDetail && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end">
            <div className="w-full max-w-md bg-white dark:bg-slate-950 h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between animate-slideLeft">
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-900">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Appointment Details</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">{selectedApptDetail.patientName}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedApptDetail(null)}
                    className="h-8 w-8 rounded-full border hover:bg-slate-50 flex items-center justify-center text-slate-500"
                  >
                    <Plus className="h-4 w-4 rotate-45" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Patient ID</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedApptDetail.patientId}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Phone Number</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold">
                        {patients.find(p => p.id === selectedApptDetail.patientId)?.phone || "+91 99000 11000"}
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Assigned Doctor</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedApptDetail.doctor}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Date & Time</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedApptDetail.date} at {selectedApptDetail.time}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Treatment</span>
                      <span className="bg-blue-50 text-blue-700 dark:bg-blue-950/20 px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] inline-block mt-1">
                        {selectedApptDetail.treatment}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Status</span>
                      <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] inline-block mt-1">
                        {selectedApptDetail.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Notes</span>
                    <p className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl text-slate-700 dark:text-slate-350 mt-1 leading-normal font-medium">
                      {selectedApptDetail.notes || "No clinical notes configured for this appointment slot."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-900">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Workflow Actions</span>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => {
                      handleApptCheckIn(selectedApptDetail.id);
                      setSelectedApptDetail(null);
                    }}
                    disabled={selectedApptDetail.status !== "Scheduled"}
                    className="h-10 text-[11px] font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg"
                  >
                    Check In
                  </Button>
                  <Button 
                    onClick={() => {
                      handleApptStartProcedure(selectedApptDetail.id);
                      setSelectedApptDetail(null);
                    }}
                    disabled={selectedApptDetail.status !== "Checked In" && selectedApptDetail.status !== "Waiting"}
                    className="h-10 text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
                  >
                    Start Procedure
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const newDate = prompt("Enter new date (e.g. 15 Aug 2026):", selectedApptDetail.date);
                      const newTime = prompt("Enter new time (e.g. 11:30 AM):", selectedApptDetail.time);
                      if (newDate && newTime) {
                        setAppointments(prev => prev.map(a => a.id === selectedApptDetail.id ? { ...a, date: newDate, time: newTime } : a));
                        pushActivity("Appointment", `Rescheduled ${selectedApptDetail.patientName} to ${newDate} at ${newTime}.`);
                      }
                      setSelectedApptDetail(null);
                    }}
                    className="h-10 text-[11px] font-bold rounded-lg"
                  >
                    Reschedule
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedSlotData({ date: selectedApptDetail.date, time: selectedApptDetail.time, appointment: selectedApptDetail });
                      setSelectedApptDetail(null);
                    }}
                    className="h-10 text-[11px] font-bold rounded-lg"
                  >
                    Edit
                  </Button>
                  <Button 
                    onClick={() => {
                      setAppointments(prev => prev.map(a => a.id === selectedApptDetail.id ? { ...a, status: "Cancelled" } : a));
                      pushActivity("Appointment", `Cancelled appointment for ${selectedApptDetail.patientName}.`);
                      setSelectedApptDetail(null);
                    }}
                    disabled={selectedApptDetail.status === "Cancelled" || selectedApptDetail.status === "Completed"}
                    className="h-10 text-[11px] font-bold bg-red-650 hover:bg-red-500 text-white rounded-lg col-span-2"
                  >
                    Cancel Appointment
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button 
                    onClick={() => alert(`Token printed for ${selectedApptDetail.patientName}.`)}
                    className="py-2 text-[10px] font-bold border rounded-lg bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center gap-1 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                  >
                    <Printer className="h-3.5 w-3.5" /> Print Token
                  </button>
                  <button 
                    onClick={() => alert(`SMS reminder sent successfully to ${selectedApptDetail.patientName}.`)}
                    className="py-2 text-[10px] font-bold border rounded-lg bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center gap-1 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Send SMS
                  </button>
                  <button 
                    onClick={() => alert(`WhatsApp notification sent to ${selectedApptDetail.patientName}.`)}
                    className="py-2 text-[10px] font-bold border rounded-lg bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center gap-1 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPatientsModule = () => {
    if (selectedPatientId) {
      const patientItem = patients.find(p => p.id === selectedPatientId);
      if (!patientItem) return null;

      const pAppts = appointments.filter(a => a.patientId === patientItem.id);
      const pInvoices = invoices.filter(i => i.patientId === patientItem.id);

      return (
        <div className="space-y-6 animate-fadeIn">
          {/* Back button and profile header */}
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setSelectedPatientId(null); setProfileSubTab("Overview"); }}
                className="h-8 w-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div>
                <span className="text-xs text-slate-400 font-bold block">PATIENT FILE: {patientItem.id}</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">{patientItem.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 border-l sm:border-l-0 pl-4 sm:pl-0">
              <div>
                <span className="text-[10px] text-slate-405 block uppercase">Phone</span>
                <span className="text-slate-800 dark:text-slate-200">{patientItem.phone}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-405 block uppercase">Gender / Age</span>
                <span className="text-slate-800 dark:text-slate-200">{patientItem.gender} • {patientItem.age} Years</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-405 block uppercase">Status</span>
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[9px]">{patientItem.status}</span>
              </div>
            </div>
          </div>

          {/* Sub-tabs inside profile */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-slate-200 dark:border-slate-800 pb-1.5 shrink-0">
            {["Overview", "Treatments", "Dental Chart", "Appointments", "Invoices", "Prescriptions", "Files", "Notes"].map((t) => {
              const active = profileSubTab === t;
              return (
                <button
                  key={t}
                  onClick={() => setProfileSubTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    active ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-850 hover:bg-slate-100"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <div className="space-y-6">
            {profileSubTab === "Overview" && (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 text-xs font-semibold">
                  <span className="font-bold text-sm block mb-1">Personal Details</span>
                  <p className="text-slate-505">Address: <strong className="text-slate-800 dark:text-slate-200">{patientItem.address}</strong></p>
                  <p className="text-slate-550">Contact: <strong className="text-slate-800 dark:text-slate-200">{patientItem.phone}</strong></p>
                  <p className="text-slate-550">Outstanding Balance: <strong className="text-slate-800 text-red-600">{patientItem.balance}</strong></p>
                  <p className="text-slate-550">Last Visited: <strong className="text-slate-800">{patientItem.visit}</strong></p>
                </div>
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs">
                  <span className="font-bold text-sm block mb-3">Clinical Alert Profile</span>
                  {patientItem.medicalNotes && patientItem.medicalNotes !== "None" ? (
                    <div className="flex gap-2 p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl font-semibold">
                      <Shield className="h-4 w-4 shrink-0 text-red-650" />
                      <div>
                        <span className="font-bold block">Medical Warning Logs</span>
                        <p className="text-[10px] mt-0.5">{patientItem.medicalNotes}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 font-bold">No active clinical warning logs.</p>
                  )}
                </div>
              </div>
            )}

            {profileSubTab === "Treatments" && (
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs font-semibold space-y-4">
                <span className="font-bold text-sm block border-b pb-2 mb-2">Patient Treatments History</span>
                {treatments.filter(t => t.patient === patientItem.name).length > 0 ? (
                  treatments.filter(t => t.patient === patientItem.name).map((tr) => (
                    <div key={tr.id} className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-808 block">{tr.name}</span>
                        <p className="text-slate-500 mt-1">Doctor: {tr.doctor} • Stage: {tr.stage} • Notes: {tr.notes}</p>
                      </div>
                      <span className="font-bold text-slate-500">Next Visit: {tr.nextVisit}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 py-2">No treatments logged in historical database.</p>
                )}
              </div>
            )}

            {profileSubTab === "Dental Chart" && (
              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                <span className="font-bold text-sm block border-b pb-2 mb-2">Patient Dental Mapping</span>
                <div className="grid grid-cols-8 sm:grid-cols-16 gap-2 max-w-xl mx-auto">
                  {[...Array(32)].map((_, i) => {
                    const toothNum = i + 1;
                    const toothStatus = patientItem.dentalChart[toothNum];
                    return (
                      <button
                        key={i}
                        onClick={() => alert(`Tooth #${toothNum} status: ${toothStatus || "Healthy"}`)}
                        className={`h-8 w-8 rounded-lg font-bold text-[10px] flex flex-col items-center justify-center border transition-all ${
                          toothStatus ? "bg-red-500 text-white border-red-600 animate-pulse" : "bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white"
                        }`}
                        title={toothStatus ? `Tooth #${toothNum}: ${toothStatus}` : `Tooth #${toothNum}: Healthy`}
                      >
                        <span>{toothNum}</span>
                        {toothStatus && <span className="h-1 w-1 rounded-full bg-white mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {profileSubTab === "Appointments" && (
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs font-semibold">
                <span className="font-bold text-sm block mb-3">Appointments Log</span>
                <div className="divide-y">
                  {pAppts.length > 0 ? (
                    pAppts.map((app) => (
                      <div key={app.id} className="py-3 flex justify-between items-center">
                        <div>
                          <span className="font-bold">{app.time} on {app.date} • {app.treatment}</span>
                          <p className="text-slate-500 text-[10px]">Doctor: {app.doctor}</p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{app.status}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 py-2">No appointment slots logged.</p>
                  )}
                </div>
              </div>
            )}

            {profileSubTab === "Invoices" && (
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs">
                <span className="font-bold text-sm block mb-3">Billing Invoice Statements</span>
                <table className="w-full text-left border-collapse font-semibold">
                  <thead>
                    <tr className="border-b text-[10px] text-slate-400 uppercase">
                      <th className="pb-2">Invoice #</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pInvoices.length > 0 ? (
                      pInvoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className="py-2.5 font-bold">
                            <button onClick={() => setLastGeneratedReceipt(inv)} className="text-blue-600 hover:underline">{inv.id}</button>
                          </td>
                          <td className="py-2.5">₹{inv.total.toLocaleString()}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              inv.status === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                            }`}>{inv.status}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-4 text-slate-400 text-center">No billing statements generated.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {profileSubTab === "Prescriptions" && (
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs font-semibold space-y-4">
                <span className="font-bold text-sm block border-b pb-2 mb-2">Prescriptions Issued</span>
                {patientItem.prescriptions.length > 0 ? (
                  patientItem.prescriptions.map((pr, idx) => (
                    <div key={idx} className="p-3 border border-slate-100 bg-slate-50/20 rounded-xl">
                      <span className="font-bold block">{pr}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 py-2">No prescriptions logged.</p>
                )}
              </div>
            )}

            {profileSubTab === "Files" && (
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs font-semibold space-y-3">
                <span className="font-bold text-sm block mb-2">Patient Files Uploads</span>
                {patientItem.files.length > 0 ? (
                  patientItem.files.map((file, idx) => (
                    <div key={idx} className="p-3 border border-dashed border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <span className="font-bold block">{file.name}</span>
                          <p className="text-[10px] text-slate-400">{file.size} • PNG Scan File</p>
                        </div>
                      </div>
                      <button className="text-[10px] text-blue-650 hover:underline">Download</button>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 py-2">No attachments uploaded.</p>
                )}
              </div>
            )}

            {profileSubTab === "Notes" && (
              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs font-semibold space-y-4">
                <span className="font-bold text-sm block mb-2">Clinical Practitioner Notes</span>
                {patientItem.notes.map((note, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded-xl text-slate-700 leading-relaxed">
                    {note}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 max-w-xs w-full">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input placeholder="Filter directory by patient name..." className="w-full text-xs font-semibold outline-none bg-transparent" />
          </div>
          <div className="flex gap-3 shrink-0">
            <Button onClick={() => setActiveModal("addPatient")} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-9 rounded-lg px-4">
              <Plus className="h-4 w-4 mr-1.5" /> Register Patient
            </Button>
          </div>
        </div>

        {activeSubTab === "All Patients" && (
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b text-[10px] text-slate-450 uppercase tracking-wider">
                  <th className="pb-2.5">Patient Name</th>
                  <th className="pb-2.5">Phone</th>
                  <th className="pb-2.5">Age</th>
                  <th className="pb-2.5">Last Visit</th>
                  <th className="pb-2.5">Balance</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-705">
                {patients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      <button onClick={() => setSelectedPatientId(pat.id)} className="hover:underline text-left font-bold">
                        {pat.name}
                      </button>
                    </td>
                    <td className="py-3 text-slate-500">{pat.phone}</td>
                    <td className="py-3">{pat.age} Years ({pat.gender[0]})</td>
                    <td className="py-3 text-slate-450">{pat.visit}</td>
                    <td className="py-3 font-bold text-red-600">{pat.balance}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        pat.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>{pat.status}</span>
                    </td>
                    <td className="py-3 text-center">
                      <button onClick={() => setSelectedPatientId(pat.id)} className="text-blue-600 hover:underline font-bold text-[11px]">
                        Open Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSubTab === "Add Patient" && (
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs max-w-xl text-xs font-semibold">
            <span className="font-bold text-sm block mb-4">Patient Intake File Registration</span>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newPatName) return;
              const newPatId = `DS-${1000 + patients.length + 1}`;
              const newRecord: Patient = {
                id: newPatId,
                name: newPatName,
                phone: newPatPhone || "+91 99000 11000",
                age: newPatAge,
                gender: newPatGender,
                address: newPatAddress || "Bengaluru",
                visit: "12 Aug 2026",
                medicalNotes: newPatAllergies,
                balance: "₹0",
                status: "Active",
                dentalChart: {},
                prescriptions: [],
                files: [],
                notes: []
              };
              setPatients(prev => [newRecord, ...prev]);
              pushActivity("Register", `Patient ${newPatName} (${newPatId}) registered.`);
              setNewPatName("");
              setNewPatPhone("");
              setNewPatAddress("");
              setNewPatAllergies("None");
              setActiveSubTab("All Patients");
            }} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="newPatName">Patient Full Name</Label>
                <Input id="newPatName" placeholder="e.g. Aarav Mehta" value={newPatName} onChange={e => setNewPatName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="newPatPhone">Mobile Number</Label>
                  <Input id="newPatPhone" placeholder="e.g. +91 98112 09230" value={newPatPhone} onChange={e => setNewPatPhone(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPatAge">Age</Label>
                  <Input id="newPatAge" type="number" value={newPatAge} onChange={e => setNewPatAge(parseInt(e.target.value) || 30)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="newPatGender">Gender</Label>
                  <select id="newPatGender" className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none dark:bg-slate-950 dark:border-slate-800" value={newPatGender} onChange={e => setNewPatGender(e.target.value as "Male" | "Female")}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPatAllergies">Medical Warnings / Allergies</Label>
                  <Input id="newPatAllergies" placeholder="e.g. Penicillin Allergy" value={newPatAllergies} onChange={e => setNewPatAllergies(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPatAddress">Address</Label>
                <Input id="newPatAddress" placeholder="e.g. Indiranagar, Bengaluru" value={newPatAddress} onChange={e => setNewPatAddress(e.target.value)} />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-4 rounded-lg mt-2">
                Register Intake File
              </Button>
            </form>
          </div>
        )}

        {activeSubTab === "Dental Chart" && (
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs text-xs font-semibold">
            <span className="font-bold text-sm block mb-3">Global Tooth Chart Visualizer</span>
            <div className="grid grid-cols-8 sm:grid-cols-16 gap-2 max-w-xl mx-auto mb-4">
              {[...Array(32)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => alert(`Tooth #${i+1} status: Normal.`)}
                  className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTreatmentsModule = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-semibold">
          <thead>
            <tr className="border-b text-[10px] text-slate-400 uppercase tracking-wider">
              <th className="pb-2.5">Treatment Name</th>
              <th className="pb-2.5">Patient</th>
              <th className="pb-2.5">Doctor</th>
              <th className="pb-2.5">Stage</th>
              <th className="pb-2.5">Prescription</th>
              <th className="pb-2.5 text-right">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-705">
            {treatments
              .filter((t) => {
                if (activeSubTab === "Active Treatments") return t.stage === "In Progress";
                if (activeSubTab === "Completed") return t.stage === "Completed";
                if (activeSubTab === "Treatment Plans") return t.stage === "Planned";
                return true;
              })
              .map((tr) => (
                <tr key={tr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">{tr.name}</td>
                  <td className="py-3">{tr.patient}</td>
                  <td className="py-3">{tr.doctor}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      tr.stage === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                    }`}>{tr.stage}</span>
                  </td>
                  <td className="py-3 text-slate-450">{tr.prescription}</td>
                  <td className="py-3 text-right text-slate-500">{tr.notes}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBillingModule = () => (
    <div className="space-y-6 animate-fadeIn">
      {activeSubTab === "Invoices" && (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="border-b text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="pb-2.5">Invoice Number</th>
                <th className="pb-2.5">Patient</th>
                <th className="pb-2.5">Subtotal</th>
                <th className="pb-2.5">Tax / Discount</th>
                <th className="pb-2.5">Total Payable</th>
                <th className="pb-2.5">Paid Amount</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-705">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">
                    <button onClick={() => setLastGeneratedReceipt(inv)} className="text-blue-600 hover:underline">{inv.id}</button>
                  </td>
                  <td className="py-3">{inv.patientName}</td>
                  <td className="py-3">₹{inv.subtotal.toLocaleString()}</td>
                  <td className="py-3 text-slate-405">{inv.tax}% Tax / {inv.discount}% Disc</td>
                  <td className="py-3 font-black">₹{inv.total.toLocaleString()}</td>
                  <td className="py-3 text-emerald-600 font-extrabold">₹{inv.paidAmount.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      inv.status === "Paid" ? "bg-emerald-50 text-emerald-700" :
                      inv.status === "Partially Paid" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                    }`}>{inv.status}</span>
                  </td>
                  <td className="py-3 text-center">
                    {inv.status !== "Paid" ? (
                      <button
                        onClick={() => {
                          setSelectedInvoiceForPayment(inv);
                          setPayCash(0);
                          setPayUpi(0);
                          setPayCard(0);
                          setPayDiscountPercent(inv.discount);
                          setPayTaxPercent(inv.tax);
                          setPayCustomItems([]);
                        }}
                        className="h-7 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px]"
                      >
                        Collect Payment
                      </button>
                    ) : (
                      <button
                        onClick={() => setLastGeneratedReceipt(inv)}
                        className="text-slate-500 hover:underline text-[10px] font-bold"
                      >
                        View Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === "Payments" && (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs font-semibold space-y-4">
          <span className="font-bold text-sm block">Payments transaction logs</span>
          <div className="divide-y">
            {invoices.flatMap(inv => inv.paymentLogs.map((log, idx) => ({ ...log, patient: inv.patientName, invId: inv.id, doctor: inv.doctor, key: `${inv.id}-${idx}` }))).map((pay) => (
              <div key={pay.key} className="py-3.5 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-808 block">{pay.patient}</span>
                  <p className="text-slate-450 mt-0.5 text-[10px]">Method: {pay.method} • Invoice: {pay.invId} • Doctor: {pay.doctor} • Date: {pay.date}</p>
                </div>
                <span className="font-black text-slate-900">₹{pay.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === "Insurance" && (
        <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs font-semibold space-y-4">
          <span className="font-bold text-sm block">Insurance claims status</span>
          <div className="divide-y">
            {[
              { provider: "Max Life Dental", patient: "Aarav Mehta", amt: "₹5,000", status: "Approved" },
              { provider: "HDFC Ergo Oral", patient: "Kabir Singh", amt: "₹3,500", status: "Approved" }
            ].map((claim, i) => (
              <div key={i} className="py-3.5 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-808 block">{claim.patient}</span>
                  <p className="text-slate-450 mt-0.5 text-[10px]">Provider: {claim.provider} • Claim: {claim.amt}</p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[9px]">{claim.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderReportsModule = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Timeframe selector filters */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <TrendingUp className="h-4 w-4 text-blue-600 animate-pulse" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reports Timeframe:</span>
        {(["Today", "Week", "Month", "Year"] as const).map((tf) => {
          const active = reportsFilter === tf;
          return (
            <button
              key={tf}
              onClick={() => setReportsFilter(tf)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                active ? "bg-blue-600 text-white shadow-xs" : "text-slate-505 hover:bg-slate-50"
              }`}
            >
              {tf}
            </button>
          );
        })}
      </div>

      {/* Analytics KPI reporting grid */}
      <section className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { title: "Total Revenue", count: `₹${reportStats.revenue.toLocaleString()}`, desc: "Collected earnings", icon: <DollarSign className="h-4 w-4 text-blue-500" /> },
          { title: "Patient Directory", count: reportStats.patients, desc: "Active clinical files", icon: <Users className="h-4 w-4 text-cyan-500" /> },
          { title: "Treatments Completed", count: reportStats.treatments, desc: "Finished checkouts", icon: <Stethoscope className="h-4 w-4 text-purple-500" /> },
          { title: "Appointments logged", count: reportStats.appointments, desc: "Total scheduled units", icon: <Calendar className="h-4 w-4 text-amber-500" /> }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">{stat.title}</span>
              {stat.icon}
            </div>
            <div className="mt-4">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{stat.count}</span>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">{stat.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* SVG charts mock representation */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <span className="font-bold text-sm block">Revenue Performance Chart</span>
        <div className="h-48 w-full flex items-end justify-between gap-4 pt-8">
          {[
            { label: "Mon", val: "h-20" },
            { label: "Tue", val: "h-36" },
            { label: "Wed", val: "h-28" },
            { label: "Thu", val: "h-40" },
            { label: "Fri", val: "h-16" },
            { label: "Sat", val: "h-32" },
            { label: "Sun", val: "h-10" }
          ].map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className={`w-full rounded-t-lg bg-blue-600/80 hover:bg-blue-650 transition-all ${bar.val}`} />
              <span className="text-[10px] text-slate-400 font-bold">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettingsModule = () => (
    <div className="space-y-6 animate-fadeIn">
      {activeSubTab === "Clinic" && (
        <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs max-w-xl text-xs font-semibold">
          <span className="font-bold text-sm block mb-4">Clinic Profile Settings</span>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Clinic Name</Label>
                <Input defaultValue="Apex Dental Clinic" />
              </div>
              <div className="space-y-1.5">
                <Label>Receptionist User</Label>
                <Input defaultValue="Anjali" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input defaultValue="12, MG Road, Bengaluru" />
            </div>
            <Button type="button" onClick={() => alert("Clinic configurations saved.")} className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-4 rounded-lg">Save Settings</Button>
          </form>
        </div>
      )}

      {activeSubTab === "Doctors" && (
        <div className="max-w-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs font-semibold">
          <span className="font-bold text-sm block mb-4">Doctors Registry</span>
          <div className="space-y-3">
            {doctors.map(doc => (
              <div key={doc.name} className="flex justify-between items-center p-3 border rounded-xl bg-slate-50/50">
                <div>
                  <span className="font-bold text-slate-900 block">{doc.name}</span>
                  <p className="text-[10px] text-slate-450 mt-0.5">{doc.speciality}</p>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[9px]">{doc.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === "Staff" && (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs font-semibold max-w-2xl">
          <span className="font-bold text-sm block mb-3">Clinic Staff Directories</span>
          <div className="space-y-2">
            {[
              { name: "Sneha Rao", role: "Senior Nurse / Hygienist" },
              { name: "Amit Kumar", role: "Desk Operations" }
            ].map((st, i) => (
              <div key={i} className="p-3 border rounded-xl flex justify-between items-center bg-slate-50/50">
                <div>
                  <span className="font-bold text-slate-800 block">{st.name}</span>
                  <p className="text-[10px] text-slate-450 mt-0.5">{st.role}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-500">Active</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === "Users" && (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs font-semibold max-w-xl">
          <span className="font-bold text-sm block mb-3">System Login Accounts</span>
          <div className="p-3 border rounded-xl flex justify-between items-center bg-slate-50/20">
            <div>
              <span className="font-bold block">Dr. Sharma</span>
              <p className="text-[10px] text-slate-400">admin@healthos.com</p>
            </div>
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Admin</span>
          </div>
        </div>
      )}

      {activeSubTab === "Preferences" && (
        <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs font-semibold max-w-xl space-y-4">
          <span className="font-bold text-sm block">System Preferences</span>
          <div className="flex items-center justify-between py-2 border-b">
            <span>Currency Symbol</span>
            <span className="font-bold text-slate-700">INR (₹)</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span>SMS Alerts</span>
            <span className="font-bold text-emerald-600">Enabled</span>
          </div>
        </div>
      )}

      {activeSubTab === "Integrations" && (
        <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs font-semibold max-w-xl space-y-3">
          <span className="font-bold text-sm block mb-1">Integrations Portal</span>
          <div className="p-4 border border-dashed rounded-2xl flex items-center gap-3 bg-slate-50/50">
            <Layers className="h-6 w-6 text-slate-400 shrink-0" />
            <div>
              <span className="font-bold block">Apex Dental Lab API Sync</span>
              <p className="text-[10px] text-slate-400">Link surgical post scan results to patient profiles.</p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "Backup" && (
        <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs font-semibold max-w-xl space-y-4">
          <span className="font-bold text-sm block mb-1">Data Backup and Exports</span>
          <Button onClick={() => alert("Clinic database backup compiled.")} className="bg-blue-600 text-white font-bold h-10 px-4 rounded-lg flex items-center gap-2">
            <Database className="h-4 w-4" /> Trigger System Export
          </Button>
        </div>
      )}
    </div>
  );

  // Active Consultation Workspace page
  const renderActiveConsultationWorkspace = () => {
    const appt = appointments.find(a => a.id === activeConsultationApptId);
    if (!appt) return null;

    const patientItem = patients.find(p => p.id === appt.patientId);
    if (!patientItem) return null;

    return (
      <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {patientItem.name[0]}
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block">ACTIVE CONSULTATION WORKSPACE</span>
              <span className="text-base font-bold text-slate-900 dark:text-white block mt-0.5">{patientItem.name} ({appt.treatment})</span>
            </div>
          </div>
          <button
            onClick={() => setActiveConsultationApptId(null)}
            className="text-xs font-bold text-slate-500 hover:underline"
          >
            Cancel Consult
          </button>
        </div>

        {/*Penicillin Warning alert */}
        {patientItem.medicalNotes && patientItem.medicalNotes.toLowerCase().includes("penicillin") && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-xs text-red-800 font-semibold animate-pulse">
            <Shield className="h-5 w-5 text-red-650 shrink-0" />
            <div>
              <span className="font-extrabold block uppercase text-[10px]">CRITICAL ALLERGY ALERT</span>
              <p className="mt-1">This patient is allergic to penicillin derivatives. Avoid prescribing Amoxicillin or surgical antibiotics.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleCompleteConsultation} className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {/* Clinical logs fields */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 text-xs font-semibold">
              <span className="font-bold text-sm block">Treatment Diagnosis Notes</span>
              
              <div className="space-y-1.5">
                <Label>Clinical Notes</Label>
                <textarea
                  className="w-full min-h-24 border rounded-xl bg-transparent p-3 outline-none focus:border-blue-500"
                  placeholder="Describe treatment observations, tooth decay levels, fillings, crown placements..."
                  value={consultNotes}
                  onChange={e => setConsultNotes(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Prescribe Medication</Label>
                <textarea
                  className="w-full min-h-16 border rounded-xl bg-transparent p-3 outline-none focus:border-blue-500"
                  placeholder="e.g. Paracetamol 650mg - 2 times daily for 3 days"
                  value={consultPrescription}
                  onChange={e => setConsultPrescription(e.target.value)}
                />
              </div>
            </div>

            {/* Simulated X-Ray and files uploads */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs font-semibold space-y-3">
              <span className="font-bold text-sm block">Diagnostic File Uploads</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const newXray = { name: `xray_scan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.png`, size: "2.4 MB", type: "image/png" };
                    setConsultUploadedXrays(prev => [...prev, newXray]);
                    alert("Mock X-Ray scanner triggered and image attached.");
                  }}
                  className="flex-1 p-4 rounded-xl border border-dashed hover:bg-slate-50 flex flex-col items-center justify-center text-center gap-1.5 transition-colors"
                >
                  <ImageIcon className="h-6 w-6 text-amber-500" />
                  <span>Attach X-Ray Scan</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newFile = { name: `intraoral_photo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.png`, size: "1.8 MB", type: "image/png" };
                    setConsultUploadedXrays(prev => [...prev, newFile]);
                    alert("Intraoral camera snapshot captured and attached.");
                  }}
                  className="flex-1 p-4 rounded-xl border border-dashed hover:bg-slate-50 flex flex-col items-center justify-center text-center gap-1.5 transition-colors"
                >
                  <FileText className="h-6 w-6 text-blue-500" />
                  <span>Intraoral Photo</span>
                </button>
              </div>

              {consultUploadedXrays.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 block">ATTACHMENTS PENDING FILE SAVE</span>
                  {consultUploadedXrays.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg text-[10px]">
                      <span>{file.name} ({file.size})</span>
                      <button type="button" onClick={() => setConsultUploadedXrays(prev => prev.filter((_, i) => i !== idx))} className="text-red-500">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Tooth Grid panel */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs font-semibold space-y-4">
              <span className="font-bold text-sm block">Tooth Diagnostic Map</span>
              <p className="text-slate-405 text-[10px]">Select a tooth mapping index to log condition overrides:</p>
              
              <div className="grid grid-cols-8 gap-1.5 max-w-xs mx-auto">
                {[...Array(32)].map((_, i) => {
                  const toothNum = i + 1;
                  const toothStatus = consultChart[toothNum];
                  const isSelected = consultSelectedTooth === toothNum;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setConsultSelectedTooth(toothNum)}
                      className={`h-7 w-7 rounded-md font-bold text-[9px] flex items-center justify-center border transition-all ${
                        isSelected ? "bg-blue-600 text-white border-blue-700" :
                        toothStatus ? "bg-red-500 text-white border-red-600 animate-pulse" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      {toothNum}
                    </button>
                  );
                })}
              </div>

              {consultSelectedTooth !== null && (
                <div className="p-3 border rounded-xl bg-slate-50/50 space-y-2">
                  <span className="font-bold text-[10px] block">Override Tooth #{consultSelectedTooth} status:</span>
                  <select
                    className="w-full h-8 border rounded-lg bg-white px-2 focus:outline-none text-[11px]"
                    value={consultToothStatus}
                    onChange={e => setConsultToothStatus(e.target.value)}
                  >
                    <option value="Decayed">Decayed</option>
                    <option value="Filling Needed">Filling Needed</option>
                    <option value="Missing">Missing</option>
                    <option value="Healthy">Healthy</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setConsultChart(prev => ({ ...prev, [consultSelectedTooth]: consultToothStatus }));
                      setConsultSelectedTooth(null);
                    }}
                    className="w-full h-7 rounded-lg bg-blue-600 text-white font-bold text-[10px] mt-1"
                  >
                    Apply Tooth Status
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <span className="font-bold text-xs text-slate-400 uppercase tracking-wider block">Procedure Cost Summary</span>
              <div className="text-xs font-semibold space-y-2">
                <div className="flex justify-between border-b pb-2">
                  <span>Base treatment:</span>
                  <span>{appt.treatment} (₹{(TREATMENT_PRICES[appt.treatment] || 500).toLocaleString()})</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Meds subtotal:</span>
                  <span>₹{consultPrescription ? "800" : "0"}</span>
                </div>
                <div className="flex justify-between font-black text-sm">
                  <span>Subtotal:</span>
                  <span>₹{((TREATMENT_PRICES[appt.treatment] || 500) + (consultPrescription ? 800 : 0)).toLocaleString()}</span>
                </div>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 rounded-xl mt-3 flex items-center justify-center gap-1.5 shadow-md">
                <Check className="h-4 w-4" /> Complete Treatment
              </Button>
            </div>
          </div>
        </form>
      </div>
    );
  };

  // Helper search matching
  const getFilteredSearchResults = () => {
    if (!globalSearchQuery) return null;
    const q = globalSearchQuery.toLowerCase();
    
    return {
      patients: patients.filter(p => p.name.toLowerCase().includes(q) || p.phone.includes(q)),
      appointments: appointments.filter(a => a.patientName.toLowerCase().includes(q) || a.treatment.toLowerCase().includes(q)),
      treatments: treatments.filter(t => t.name.toLowerCase().includes(q) || t.patient.toLowerCase().includes(q)),
      invoices: invoices.filter(i => i.id.toLowerCase().includes(q) || i.patientName.toLowerCase().includes(q))
    };
  };

  const searchResults = getFilteredSearchResults();
  const hasSearchResults = searchResults && (
    searchResults.patients.length > 0 ||
    searchResults.appointments.length > 0 ||
    searchResults.treatments.length > 0 ||
    searchResults.invoices.length > 0
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-805 dark:bg-slate-900 dark:text-slate-100 flex font-sans antialiased overflow-hidden">
      
      {/* 1. Sidebar Left Navigation */}
      <aside
        className={`sticky top-0 left-0 h-screen bg-white dark:bg-slate-955 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col justify-between z-40 shrink-0 overflow-x-hidden transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-[72px]" : "w-[250px]"
        }`}
      >
        <div className={`border-b border-slate-200 dark:border-slate-800 flex items-center shrink-0 transition-all duration-300 ease-in-out overflow-hidden h-20 ${
          sidebarCollapsed
            ? "px-2 justify-center gap-1.5"
            : "px-6 py-5 justify-between"
        }`}>
          <div className={`flex items-center transition-all duration-300 ease-in-out overflow-hidden ${
            sidebarCollapsed ? "justify-center" : "justify-start min-w-0"
          }`}>
            <DentalLogo showText={!sidebarCollapsed} collapsed={sidebarCollapsed} />
          </div>
          
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`rounded-full flex items-center justify-center hover:bg-[#EFF6FF] hover:text-blue-600 text-slate-500 transition-all duration-250 ease-in-out shrink-0 active:scale-[0.97] ${
              sidebarCollapsed ? "h-6 w-6" : "h-9 w-9 ml-2"
            }`}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex flex-col flex-grow overflow-y-auto overflow-x-hidden">
          <nav className={`p-4.5 space-y-3 flex-grow mt-3 transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "px-2.5" : "px-4.5"
          }`}>
            {menuItems.map((item) => {
              const active = activeTab === item.name && !activeConsultationApptId;
              return (
                <div key={item.name} className="relative">
                  <button
                    onClick={() => selectTab(item.name)}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredItem(item.name);
                      setHoveredItemTop(rect.top + rect.height / 2);
                    }}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`h-[48px] flex items-center rounded-[12px] text-[15px] font-medium transition-all duration-300 ease-in-out group ${
                      sidebarCollapsed ? "w-12 justify-center px-0 mx-auto" : "w-full justify-between px-4"
                    } ${
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-[#334155] hover:bg-blue-50/50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center h-[22px] w-[22px] shrink-0">
                        <span className={active ? "text-white" : "text-slate-400 group-hover:text-blue-600 dark:group-hover:text-slate-205"}>
                          {React.cloneElement(item.icon, { className: "h-[22px] w-[22px]" })}
                        </span>
                        {item.badge && sidebarCollapsed && (
                          <span className="absolute -top-1.5 -right-1.5 text-[8px] font-bold h-4 min-w-4 px-1 rounded-full bg-red-600 text-white border-2 border-white dark:border-slate-950 flex items-center justify-center shadow-xs">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      
                      <span className={`transition-all duration-300 ease-in-out whitespace-nowrap text-left ${
                        sidebarCollapsed ? "opacity-0 w-0 scale-90 overflow-hidden pointer-events-none" : "opacity-100 w-auto"
                      }`}>
                        {item.name}
                      </span>
                    </div>

                    {item.badge && !sidebarCollapsed && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all duration-300 ${
                          active ? "bg-white/20 text-white" : "bg-red-100 text-red-600 dark:bg-red-955/40 dark:text-red-400"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </nav>
        </div>

        <div className={`border-t border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-955 shrink-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "px-2 py-6 flex flex-col items-center justify-center gap-4" : "p-5"
        }`}>
          {sidebarCollapsed ? (
            <div className="flex flex-col items-center gap-4 w-full">
              <button
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredItem("profile");
                  setHoveredItemTop(rect.top + rect.height / 2);
                }}
                onMouseLeave={() => setHoveredItem(null)}
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0 cursor-pointer mx-auto active:scale-95 transition-transform"
              >
                AC
              </button>
              
              <button
                onClick={() => router.push("/login")}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredItem("logout");
                  setHoveredItemTop(rect.top + rect.height / 2);
                }}
                onMouseLeave={() => setHoveredItem(null)}
                className="h-10 w-10 rounded-xl flex items-center justify-center text-red-650 hover:bg-red-50 hover:text-red-500 dark:text-red-405 dark:hover:bg-red-955/20 transition-colors mx-auto active:scale-[0.97]"
              >
                <LogOut className="h-[22px] w-[22px]" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                  AC
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-bold text-slate-900 dark:text-slate-202 truncate">Apex Clinic</span>
                  <span className="text-[12px] font-medium text-slate-505 truncate">Anjali (Receptionist)</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                <Link
                  href="/preview-hub"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-500 hover:underline transition-colors"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  Auth Preview
                </Link>
                <button
                  onClick={() => router.push("/login")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-655 hover:text-red-500 hover:underline transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto transition-all duration-300 ease-in-out">
        {/* Top Navbar */}
        <header className="h-20 bg-white dark:bg-slate-955 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 flex items-center justify-between px-6 shrink-0">
          
          <div className="flex items-center gap-3 flex-grow max-w-sm sm:max-w-md relative">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-slate-500 hover:text-slate-808 dark:text-slate-400 dark:hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Global Search input */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, appointments, invoice files..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                className="h-9 w-full pl-9 pr-4 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all dark:bg-slate-900 dark:border-slate-800"
              />
              
              {/* Global search dropdown */}
              {globalSearchQuery && (
                <div className="absolute top-10 left-0 w-full rounded-2xl border border-slate-200 bg-white shadow-xl dark:bg-slate-950 dark:border-slate-800 p-3 z-50 text-xs font-semibold max-h-80 overflow-y-auto">
                  <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <span className="text-[10px] text-slate-405 uppercase">Grouped Search Results</span>
                    <button onClick={() => setGlobalSearchQuery("")} className="text-slate-400 hover:text-slate-600 text-[10px]">Clear</button>
                  </div>
                  
                  {hasSearchResults ? (
                    <div className="space-y-3">
                      {searchResults.patients.length > 0 && (
                        <div>
                          <span className="text-[9px] text-blue-500 font-bold uppercase block mb-1">Patients</span>
                          {searchResults.patients.map(p => (
                            <button
                              key={p.id}
                              onClick={() => { setSelectedPatientId(p.id); setActiveTab("Patients"); setGlobalSearchQuery(""); }}
                              className="w-full text-left py-1 hover:bg-slate-50 px-2 rounded block"
                            >
                              {p.name} ({p.id}) • {p.phone}
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.appointments.length > 0 && (
                        <div>
                          <span className="text-[9px] text-cyan-500 font-bold uppercase block mb-1">Appointments</span>
                          {searchResults.appointments.map(a => (
                            <button
                              key={a.id}
                              onClick={() => { setActiveTab("Appointments"); setActiveSubTab("Today"); setGlobalSearchQuery(""); }}
                              className="w-full text-left py-1 hover:bg-slate-50 px-2 rounded block"
                            >
                              {a.patientName} • {a.treatment} ({a.status})
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.treatments.length > 0 && (
                        <div>
                          <span className="text-[9px] text-purple-500 font-bold uppercase block mb-1">Treatments</span>
                          {searchResults.treatments.map(t => (
                            <button
                              key={t.id}
                              onClick={() => { setActiveTab("Treatments"); setActiveSubTab("Active Treatments"); setGlobalSearchQuery(""); }}
                              className="w-full text-left py-1 hover:bg-slate-50 px-2 rounded block"
                            >
                              {t.name} for {t.patient} ({t.stage})
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.invoices.length > 0 && (
                        <div>
                          <span className="text-[9px] text-red-500 font-bold uppercase block mb-1">Invoices</span>
                          {searchResults.invoices.map(i => (
                            <button
                              key={i.id}
                              onClick={() => { setLastGeneratedReceipt(i); setGlobalSearchQuery(""); }}
                              className="w-full text-left py-1 hover:bg-slate-50 px-2 rounded block"
                            >
                              {i.id} • {i.patientName} • {i.total.toLocaleString()} ({i.status})
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-400 py-4 text-center">No matching records found.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* + Quick Add Dropdown */}
            <div className="relative">
              <button
                onClick={() => setQuickAddOpen(!quickAddOpen)}
                className="h-9 flex items-center gap-1 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Quick Add</span>
              </button>
              
              {quickAddOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-xl dark:bg-slate-950 dark:border-slate-800 p-1.5 z-50 text-xs font-semibold text-left">
                  <button
                    onClick={() => { setActiveModal("addPatient"); setQuickAddOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-705 hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <UserPlus className="h-4 w-4 text-blue-500" /> New Patient
                  </button>
                  <button
                    onClick={() => {
                      if (patients.length > 0) {
                        setApptPatientId(patients[0].id);
                      }
                      setActiveModal("addAppointment");
                      setQuickAddOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-705 hover:bg-slate-50"
                  >
                    <CalendarDays className="h-4 w-4 text-cyan-500" /> New Appointment
                  </button>
                  <button
                    onClick={() => { setActiveModal("addWalkIn"); setQuickAddOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-705 hover:bg-slate-50"
                  >
                    <UserCheck className="h-4 w-4 text-amber-500" /> Walk-in Patient
                  </button>
                  <button
                    onClick={() => { selectTab("Billing"); setActiveSubTab("Invoices"); setQuickAddOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-705 hover:bg-slate-50"
                  >
                    <FileText className="h-4 w-4 text-red-500" /> Invoice list
                  </button>
                  <button
                    onClick={() => { selectTab("Billing"); setActiveSubTab("Payments"); setQuickAddOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-705 hover:bg-slate-50"
                  >
                    <Receipt className="h-4 w-4 text-emerald-500" /> Payment logs
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Alert Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-505 hover:text-slate-808 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 relative"
              >
                <Bell className="h-4 w-4" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-650 border border-white animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl dark:bg-slate-955 dark:border-slate-800 p-2 z-50 text-xs">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-2">
                    <span className="font-bold">Clinic Notifications</span>
                    <button
                      onClick={() => setNotifications(n => n.map(item => ({ ...item, unread: false })))}
                      className="text-[10px] text-blue-605 hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-1 max-h-60 overflow-y-auto font-semibold">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-lg flex items-start gap-2.5 text-[11px] transition-colors ${
                          item.unread ? "bg-blue-50/50 dark:bg-blue-955/20" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="h-2 w-2 rounded-full mt-1.5 shrink-0 bg-blue-500" />
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{item.msg}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Clinic Status & Date */}
            <div className="hidden lg:flex flex-col text-right text-[11px] border-r pr-3 border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-200">Wednesday, 12 Aug 2026</span>
              <span className="text-[9px] text-emerald-600 font-semibold flex items-center justify-end gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Clinic Status: Active
              </span>
            </div>

            {/* Profile Avatar */}
            <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold border-2 border-slate-100 shadow-sm shrink-0">
              AN
            </div>
          </div>
        </header>

        {/* Dynamic Inner Sub-tabs Bar (hidden if in active consultation mode) */}
        {!activeConsultationApptId && !selectedPatientId && activeTab !== "Dashboard" && (
          <div className="bg-white dark:bg-slate-955 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none sticky top-20 z-20 shrink-0">
            {moduleSubTabs[activeTab]?.map((subTab) => {
              const active = activeSubTab === subTab;
              return (
                <button
                  key={subTab}
                  onClick={() => setActiveSubTab(subTab)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    active
                      ? "bg-blue-50 text-blue-705 dark:bg-blue-955/40 dark:text-blue-400"
                      : "text-slate-505 hover:text-slate-850 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900"
                  }`}
                >
                  {subTab}
                </button>
              );
            })}
          </div>
        )}

        {/* Dashboard inner panels switcher */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto flex-grow">
          {activeConsultationApptId ? (
            renderActiveConsultationWorkspace()
          ) : (
            <>
              {activeTab === "Dashboard" && renderDashboardModule()}
              {activeTab === "Appointments" && renderAppointmentsModule()}
              {activeTab === "Patients" && renderPatientsModule()}
              {activeTab === "Treatments" && renderTreatmentsModule()}
              {activeTab === "Billing" && renderBillingModule()}
              {activeTab === "Reports" && renderReportsModule()}
              {activeTab === "Settings" && renderSettingsModule()}
            </>
          )}
        </main>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            className="w-64 bg-white dark:bg-slate-955 h-full p-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <DentalLogo showText={true} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-md dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {menuItems.map((item) => {
                  const active = activeTab === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        selectTab(item.name);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        active
                          ? "bg-blue-600 text-white"
                          : "text-slate-655 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.name}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-col gap-2.5">
              <Link
                href="/preview-hub"
                className="text-xs font-semibold text-blue-650 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HelpCircle className="h-4 w-4" /> Auth Preview Hub
              </Link>
              <button
                onClick={() => router.push("/login")}
                className="text-xs font-semibold text-red-655 flex items-center gap-2 text-left"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </motion.div>
          <div className="flex-grow" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Global Collapsed Sidebar Tooltip */}
      <AnimatePresence>
        {sidebarCollapsed && hoveredItem && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed bg-slate-900 dark:bg-slate-800 text-white rounded-lg shadow-md whitespace-nowrap p-3 z-55 -translate-y-1/2 text-left pointer-events-none"
            style={{
              left: "88px",
              top: hoveredItemTop,
            }}
          >
            {hoveredItem === "profile" ? (
              <div className="flex flex-col gap-0.5 text-xs font-semibold">
                <span className="font-bold text-[13px] text-white">Apex Clinic</span>
                <span className="text-slate-300 font-normal">Dr. Sharma</span>
                <span className="text-[10px] text-blue-405 font-bold uppercase tracking-wider mt-1 block">Owner</span>
              </div>
            ) : hoveredItem === "logout" ? (
              <span className="text-xs font-semibold px-1 py-0.5 block">Logout</span>
            ) : (
              <span className="text-xs font-semibold px-1 py-0.5 block">{hoveredItem}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DIALOG MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/50 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden text-xs font-semibold"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-base text-slate-900 dark:text-white">
                {activeModal === "addPatient" && "Register New Patient File"}
                {activeModal === "addAppointment" && "Book Clinic Appointment"}
                {activeModal === "addWalkIn" && "Walk-in Patient Immediate Check-In"}
              </span>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-650">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              {/* Register Patient Modal */}
              {activeModal === "addPatient" && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!newPatName) return;
                  const newPatId = `DS-${1000 + patients.length + 1}`;
                  const newRecord: Patient = {
                    id: newPatId,
                    name: newPatName,
                    phone: newPatPhone || "+91 99000 11000",
                    age: newPatAge,
                    gender: newPatGender,
                    address: newPatAddress || "Bengaluru",
                    visit: "12 Aug 2026",
                    medicalNotes: newPatAllergies,
                    balance: "₹0",
                    status: "Active",
                    dentalChart: {},
                    prescriptions: [],
                    files: [],
                    notes: []
                  };
                  setPatients(prev => [newRecord, ...prev]);
                  pushActivity("Register", `Patient ${newPatName} (${newPatId}) registered.`);
                  setNewPatName("");
                  setNewPatPhone("");
                  setNewPatAddress("");
                  setNewPatAllergies("None");
                  setActiveModal(null);
                }} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="newPatName">Patient Full Name</Label>
                    <Input id="newPatName" placeholder="e.g. Aarav Mehta" value={newPatName} onChange={e => setNewPatName(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="newPatPhone">Mobile Number</Label>
                      <Input id="newPatPhone" placeholder="e.g. +91 98112 09230" value={newPatPhone} onChange={e => setNewPatPhone(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="newPatAge">Age</Label>
                      <Input id="newPatAge" type="number" value={newPatAge} onChange={e => setNewPatAge(parseInt(e.target.value) || 30)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="newPatGender">Gender</Label>
                      <select id="newPatGender" className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-808 focus:outline-none dark:bg-slate-950 dark:border-slate-800" value={newPatGender} onChange={e => setNewPatGender(e.target.value as "Male" | "Female")}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="newPatAllergies">Medical Warnings</Label>
                      <Input id="newPatAllergies" placeholder="e.g. Penicillin Allergy" value={newPatAllergies} onChange={e => setNewPatAllergies(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="newPatAddress">Address</Label>
                    <Input id="newPatAddress" placeholder="e.g. Indiranagar, Bengaluru" value={newPatAddress} onChange={e => setNewPatAddress(e.target.value)} />
                  </div>
                  <div className="flex gap-3 justify-end pt-2">
                    <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold">Register Patient</Button>
                  </div>
                </form>
              )}

              {/* Book Appointment Modal */}
              {activeModal === "addAppointment" && (
                <form onSubmit={handleGlobalBookAppointment} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="apptPatientId">Select Patient</Label>
                    <select
                      id="apptPatientId"
                      className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-808 focus:outline-none dark:bg-slate-955 dark:border-slate-800"
                      value={apptPatientId}
                      onChange={e => setApptPatientId(e.target.value)}
                      required
                    >
                      <option value="">-- Pick Patient Record --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="apptDoctor">Doctor</Label>
                      <select id="apptDoctor" className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-808 focus:outline-none dark:bg-slate-950 dark:border-slate-800" value={apptDoctor} onChange={e => setApptDoctor(e.target.value)}>
                        {doctors.map(d => (
                          <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="apptTime">Time Block</Label>
                      <Input id="apptTime" placeholder="e.g. 02:30 PM" value={apptTime} onChange={e => setApptTime(e.target.value)} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="apptTreatment">Treatment Category</Label>
                      <select id="apptTreatment" className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-808 focus:outline-none dark:bg-slate-955 dark:border-slate-800" value={apptTreatment} onChange={e => setApptTreatment(e.target.value)}>
                        {Object.keys(TREATMENT_PRICES).map(t => (
                          <option key={t} value={t}>{t} (₹{TREATMENT_PRICES[t]})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="apptDate">Date</Label>
                      <Input id="apptDate" placeholder="12 Aug 2026" value={apptDate} onChange={e => setApptDate(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="apptNotes">Notes</Label>
                    <Input id="apptNotes" placeholder="e.g. Needs consultation review" value={apptNotes} onChange={e => setApptNotes(e.target.value)} />
                  </div>
                  <div className="flex gap-3 justify-end pt-2">
                    <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold">Book Slot</Button>
                  </div>
                </form>
              )}

              {/* Immediate Walk-In Check-In Modal */}
              {activeModal === "addWalkIn" && (
                <form onSubmit={handleRegisterWalkIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="walkinName">Patient Name</Label>
                    <Input id="walkinName" placeholder="e.g. Sneha Reddy" value={newPatName} onChange={e => setNewPatName(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="walkinPhone">Mobile Number</Label>
                      <Input id="walkinPhone" placeholder="e.g. +91 95408 81229" value={newPatPhone} onChange={e => setNewPatPhone(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="walkinAge">Age</Label>
                      <Input id="walkinAge" type="number" value={newPatAge} onChange={e => setNewPatAge(parseInt(e.target.value) || 30)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="walkinGender">Gender</Label>
                      <select id="walkinGender" className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-808 focus:outline-none dark:bg-slate-950 dark:border-slate-800" value={newPatGender} onChange={e => setNewPatGender(e.target.value as "Male" | "Female")}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="walkinAllergies">Medical Warnings / Allergies</Label>
                      <Input id="walkinAllergies" placeholder="e.g. Penicillin Allergy" value={newPatAllergies} onChange={e => setNewPatAllergies(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold">Checked In Waiting</Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Collect Payment Modal (Discount, Tax, Split billing logs) */}
      {selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/50 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden text-xs font-semibold"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <span className="font-bold text-base text-slate-900">
                Collect Split Payment: Invoice {selectedInvoiceForPayment.id}
              </span>
              <button onClick={() => setSelectedInvoiceForPayment(null)} className="text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCollectPayment} className="p-5 grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-3">
                <span className="font-bold block uppercase text-[10px] text-slate-400">Invoice Items Summary</span>
                
                {/* Pre-existing base items */}
                <div className="border rounded-xl p-3 bg-slate-50/50 space-y-2">
                  {selectedInvoiceForPayment.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px]">
                      <span>{item.description}</span>
                      <span className="font-bold">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  
                  {payCustomItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px] text-blue-605">
                      <span className="flex items-center gap-1">
                        <button type="button" onClick={() => removeCustomBillingItem(idx)} className="text-red-500"><Trash2 className="h-3 w-3" /></button>
                        {item.description}
                      </span>
                      <span className="font-bold">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Add Customized item inside modal */}
                <div className="p-3 border rounded-xl bg-slate-50/10 space-y-2">
                  <span className="font-bold text-[10px] block">Add Custom Item Line</span>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Item Description" value={newCustomDesc} onChange={e => setNewCustomDesc(e.target.value)} />
                    <Input type="number" placeholder="Cost" value={newCustomAmt || ""} onChange={e => setNewCustomAmt(parseInt(e.target.value) || 0)} />
                  </div>
                  <button type="button" onClick={addCustomBillingItem} className="w-full h-8 rounded-lg border border-dashed border-blue-500 text-blue-600 font-bold">
                    Add custom item
                  </button>
                </div>
              </div>

              {/* Billing computations & Payment split */}
              <div className="space-y-4">
                <span className="font-bold block uppercase text-[10px] text-slate-400">Total Calculation & Splits</span>
                
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="space-y-1">
                    <Label>Discount (%)</Label>
                    <Input type="number" value={payDiscountPercent || ""} onChange={e => setPayDiscountPercent(parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Tax / GST (%)</Label>
                    <Input type="number" value={payTaxPercent || ""} onChange={e => setPayTaxPercent(parseInt(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="p-3 border rounded-xl bg-blue-50/30 text-xs space-y-1 font-bold">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{calculateInvoiceSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span>- ₹{Math.round(calculateInvoiceSubtotal() * (payDiscountPercent / 100)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax:</span>
                    <span>+ ₹{Math.round((calculateInvoiceSubtotal() - Math.round(calculateInvoiceSubtotal() * (payDiscountPercent / 100))) * (payTaxPercent / 100)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black pt-1 border-t">
                    <span>Total:</span>
                    <span>₹{calculateInvoiceTotal().toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-[10px] block">Splitted Payment allocations</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label>Cash Amount</Label>
                      <Input type="number" value={payCash || ""} onChange={e => setPayCash(parseInt(e.target.value) || 0)} />
                    </div>
                    <div className="space-y-1">
                      <Label>UPI Amount</Label>
                      <Input type="number" value={payUpi || ""} onChange={e => setPayUpi(parseInt(e.target.value) || 0)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Card Amount</Label>
                      <Input type="number" value={payCard || ""} onChange={e => setPayCard(parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 rounded-xl mt-2 flex items-center justify-center gap-1.5 shadow-md">
                  Collect ₹{(payCash + payUpi + payCard).toLocaleString()}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Receipt Modal (Design printer-friendly print logs) */}
      {lastGeneratedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/50 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden text-xs font-semibold"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <span className="font-bold text-sm">Clinical Receipt</span>
              <button onClick={() => setLastGeneratedReceipt(null)} className="text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center border-b pb-4">
                <span className="text-base font-black text-blue-600 block">APEX DENTAL CLINIC</span>
                <p className="text-[9px] text-slate-450 mt-1 uppercase tracking-widest font-bold">Clinical payment receipt statement</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 border-b pb-3">
                <p>Invoice ID: <strong className="text-slate-800">{lastGeneratedReceipt.id}</strong></p>
                <p>Date: <strong className="text-slate-800">{lastGeneratedReceipt.paymentDate}</strong></p>
                <p>Patient Name: <strong className="text-slate-800">{lastGeneratedReceipt.patientName}</strong></p>
                <p>Doctor: <strong className="text-slate-800">{lastGeneratedReceipt.doctor}</strong></p>
              </div>

              {/* Items table */}
              <div className="space-y-1.5 border-b pb-3 text-[11px]">
                {lastGeneratedReceipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.description}</span>
                    <span>₹{item.amount.toLocaleString()}</span>
                  </div>
                ))}
                {lastGeneratedReceipt.discount > 0 && (
                  <div className="flex justify-between text-red-650">
                    <span>Discount ({lastGeneratedReceipt.discount}%):</span>
                    <span>- ₹{Math.round(lastGeneratedReceipt.subtotal * (lastGeneratedReceipt.discount / 100)).toLocaleString()}</span>
                  </div>
                )}
                {lastGeneratedReceipt.tax > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Tax ({lastGeneratedReceipt.tax}%):</span>
                    <span>+ ₹{Math.round((lastGeneratedReceipt.subtotal - Math.round(lastGeneratedReceipt.subtotal * (lastGeneratedReceipt.discount / 100))) * (lastGeneratedReceipt.tax / 100)).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-xs font-black border-b pb-3">
                <span>Total Amount:</span>
                <span>₹{lastGeneratedReceipt.total.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-xs text-emerald-600 font-extrabold border-b pb-3">
                <span>Paid Amount:</span>
                <span>₹{lastGeneratedReceipt.paidAmount.toLocaleString()}</span>
              </div>

              {lastGeneratedReceipt.total - lastGeneratedReceipt.paidAmount > 0 && (
                <div className="flex justify-between items-center text-xs text-red-600 font-extrabold border-b pb-3">
                  <span>Balance Outstanding:</span>
                  <span>₹{(lastGeneratedReceipt.total - lastGeneratedReceipt.paidAmount).toLocaleString()}</span>
                </div>
              )}

              <div className="space-y-1.5 text-[10px] text-slate-500 border-b pb-3">
                <span className="font-bold uppercase tracking-wider block text-[8px] text-slate-400">Transactions logs</span>
                {lastGeneratedReceipt.paymentLogs.map((log, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{log.method} Method</span>
                    <span>₹{log.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    alert("Triggering device print queue...");
                    window.print();
                  }}
                  className="h-9 rounded-lg border flex items-center justify-center gap-1.5 font-bold hover:bg-slate-50"
                >
                  <Printer className="h-4 w-4" /> Print
                </button>
                <button
                  onClick={() => alert("PDF downloaded successfully to device.")}
                  className="h-9 rounded-lg border flex items-center justify-center gap-1.5 font-bold hover:bg-slate-50"
                >
                  <Download className="h-4 w-4" /> Download PDF
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => alert("Receipt shared via email channels.")}
                  className="h-9 rounded-lg border flex items-center justify-center gap-1.5 font-bold hover:bg-slate-50"
                >
                  <Mail className="h-4 w-4" /> Email Receipt
                </button>
                <button
                  onClick={() => setLastGeneratedReceipt(null)}
                  className="h-9 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 font-bold shadow-xs"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      {/* Calendar Slot Details / Action Modal */}
      {selectedSlotData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/50 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden text-xs font-semibold"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Slot Management: {selectedSlotData.date} at {selectedSlotData.time}
              </span>
              <button onClick={() => setSelectedSlotData(null)} className="text-slate-405 hover:text-slate-650">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {selectedSlotData.appointment ? (
                // Booked Slot
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50/50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30 rounded-xl space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Appointment Details</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <p>Patient: <strong className="text-slate-800 dark:text-slate-200">{selectedSlotData.appointment.patientName}</strong></p>
                      <p>Doctor: <strong className="text-slate-800 dark:text-slate-200">{selectedSlotData.appointment.doctor}</strong></p>
                      <p>Treatment: <strong className="text-slate-800 dark:text-slate-200">{selectedSlotData.appointment.treatment}</strong></p>
                      <p>Status: <strong className="text-blue-600 dark:text-blue-400 uppercase">{selectedSlotData.appointment.status}</strong></p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end">
                    {selectedSlotData.appointment.status === "Scheduled" && (
                      <button
                        type="button"
                        onClick={() => handleApptCheckIn(selectedSlotData.appointment!.id)}
                        className="h-8 px-3 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                      >
                        Check In
                      </button>
                    )}
                    {(selectedSlotData.appointment.status === "Checked In" || selectedSlotData.appointment.status === "Waiting") && (
                      <button
                        type="button"
                        onClick={() => handleApptStartProcedure(selectedSlotData.appointment!.id)}
                        className="h-8 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold"
                      >
                        Start Procedure
                      </button>
                    )}
                    {selectedSlotData.appointment.status === "In Procedure" && (
                      <button
                        type="button"
                        onClick={() => handleApptCompleteProcedure(selectedSlotData.appointment!.id)}
                        className="h-8 px-3 rounded bg-orange-500 hover:bg-orange-450 text-white font-bold"
                      >
                        Complete Procedure
                      </button>
                    )}
                    {selectedSlotData.appointment.status === "Completed" && (
                      <button
                        type="button"
                        onClick={() => handleApptGenerateBill(selectedSlotData.appointment!.id)}
                        className="h-8 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                      >
                        Generate Bill / Collect Payment
                      </button>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => {
                        setBlockedSlots(prev => {
                          const copy = { ...prev };
                          const key = `${selectedSlotData.date}_${selectedSlotData.time}`;
                          copy[key] = true;
                          return copy;
                        });
                        setAppointments(prev => prev.map(a => a.id === selectedSlotData.appointment!.id ? { ...a, status: "Cancelled" } : a));
                        setSelectedSlotData(null);
                      }}
                      className="h-8 px-3 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-bold"
                    >
                      Block Slot
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAppointments(prev => prev.map(a => a.id === selectedSlotData.appointment!.id ? { ...a, status: "Cancelled" } : a));
                        setSelectedSlotData(null);
                      }}
                      className="h-8 px-3 rounded bg-red-50 hover:bg-red-100 text-red-650 font-bold"
                    >
                      Cancel Appointment
                    </button>
                  </div>
                </div>
              ) : blockedSlots[`${selectedSlotData.date}_${selectedSlotData.time}`] ? (
                // Blocked Slot
                <div className="space-y-4 text-center py-3">
                  <p className="text-slate-500 font-medium">This slot is currently blocked for clinical maintenance.</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => handleBlockSlotToggle(selectedSlotData.date, selectedSlotData.time)}
                      className="h-9 px-4 rounded bg-emerald-650 hover:bg-emerald-500 text-white font-bold"
                    >
                      Unblock Slot
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSlotData(null)}
                      className="h-9 px-4 rounded border font-bold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                // Empty Slot - Allow Booking or Blocking
                <form onSubmit={handleSlotBookingSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Select Patient Record</Label>
                    <select
                      className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                      value={slotPatientId}
                      onChange={e => setSlotPatientId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Patient --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Assign Doctor</Label>
                      <select
                        className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                        value={slotDoctor}
                        onChange={e => setSlotDoctor(e.target.value)}
                      >
                        {doctors.map(d => (
                          <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Treatment Category</Label>
                      <select
                        className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                        value={slotTreatment}
                        onChange={e => setSlotTreatment(e.target.value)}
                      >
                        {Object.keys(TREATMENT_PRICES).map(t => (
                          <option key={t} value={t}>{t} (₹{TREATMENT_PRICES[t]})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => handleBlockSlotToggle(selectedSlotData.date, selectedSlotData.time)}
                      className="h-9 px-3 rounded border text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Block Slot
                    </button>
                    <div className="flex-1 flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedSlotData(null)}
                        className="h-9 px-3 rounded border font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="h-9 px-4 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold"
                      >
                        Save Appointment
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
