"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  Menu,
  Search,
  Plus,
  Bell,
  CalendarDays,
  Check,
  UserPlus,
  FileText,
  CreditCard,
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
  Pencil,
  Share2,
  Mail,
  Download,
  CalendarPlus,
  MessageSquare,
  MessageCircle,
  SlidersHorizontal,
  Sun,
  Moon,
  Upload,
  Play,
  Pause,
  Camera,
  Mic,
  Video,
  Square,
  Circle,
  RotateCcw,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DentalLogo } from "@/components/dental-logo";
import { createClient } from "@/lib/supabase/client";

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
  email?: string;
  bloodGroup?: string;
  patientType?: "New" | "Returning";
  firstName?: string;
  lastName?: string;
  dob?: string;
  occupation?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  pincode?: string;
  allergies?: string;
  medicalConditions?: string;
  currentMedications?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  firstVisit?: string;
  preferredDentist?: string;
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
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  tax: number; // in percentage
  subtotal: number;
  total: number;
  paidAmount: number;
  status: "Paid" | "Partially Paid" | "Unpaid" | "Pending";
  paymentDate: string;
  paymentLogs: { method: string; amount: number; date: string }[];
}

interface Doctor {
  name: string;
  speciality: string;
  status: "Available" | "In Consultation" | "On Break" | "Finished Today";
  avatar?: string;
  phone?: string;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  status: "Active" | "Inactive" | "On Leave";
}

interface BackupHistoryItem {
  id: string;
  date: string;
  time: string;
  size: string;
  status: string;
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
  tooth?: number;
  cost?: number;
  diagnosis?: string;
  date?: string;
  treatmentPlan?: string;
  completedVisits?: number;
  totalVisits?: number;
}

interface ActivityItem {
  id: string;
  type: "Register" | "Appointment" | "Prescription" | "Chart" | "Treatment" | "Billing" | "Payment";
  msg: string;
  time: string;
}

// Odontogram Component Type Definitions & Config
interface ToothConfig {
  index: number;
  fdi: number;
  x: number;
  y: number;
  rotation: number;
  type: 'molar' | 'premolar' | 'incisor';
  labelX: number;
  labelY: number;
}

const ALL_TEETH: ToothConfig[] = [
  // Upper Right (Quadrant 1)
  { index: 1, fdi: 18, x: 83, y: 226, rotation: -90, type: 'molar', labelX: 51, labelY: 230 },
  { index: 2, fdi: 17, x: 81, y: 192, rotation: -75, type: 'molar', labelX: 51, labelY: 188 },
  { index: 3, fdi: 16, x: 84, y: 158, rotation: -60, type: 'molar', labelX: 56, labelY: 148 },
  { index: 4, fdi: 15, x: 94, y: 128, rotation: -45, type: 'premolar', labelX: 71, labelY: 113 },
  { index: 5, fdi: 14, x: 111, y: 104, rotation: -35, type: 'premolar', labelX: 93, labelY: 85 },
  { index: 6, fdi: 13, x: 133, y: 86, rotation: -25, type: 'incisor', labelX: 120, labelY: 62 },
  { index: 7, fdi: 12, x: 158, y: 74, rotation: -15, type: 'incisor', labelX: 153, labelY: 49 },
  { index: 8, fdi: 11, x: 185, y: 70, rotation: -5, type: 'incisor', labelX: 185, labelY: 45 },

  // Upper Left (Quadrant 2)
  { index: 9, fdi: 21, x: 215, y: 70, rotation: 5, type: 'incisor', labelX: 215, labelY: 45 },
  { index: 10, fdi: 22, x: 242, y: 74, rotation: 15, type: 'incisor', labelX: 247, labelY: 49 },
  { index: 11, fdi: 23, x: 267, y: 86, rotation: 25, type: 'incisor', labelX: 280, labelY: 62 },
  { index: 12, fdi: 24, x: 289, y: 104, rotation: 35, type: 'premolar', labelX: 307, labelY: 85 },
  { index: 13, fdi: 25, x: 306, y: 128, rotation: 45, type: 'premolar', labelX: 329, labelY: 113 },
  { index: 14, fdi: 26, x: 316, y: 158, rotation: 60, type: 'molar', labelX: 344, labelY: 148 },
  { index: 15, fdi: 27, x: 319, y: 192, rotation: 75, type: 'molar', labelX: 349, labelY: 188 },
  { index: 16, fdi: 28, x: 317, y: 226, rotation: 90, type: 'molar', labelX: 349, labelY: 230 },

  // Lower Left (Quadrant 3)
  { index: 24, fdi: 31, x: 215, y: 430, rotation: -5, type: 'incisor', labelX: 215, labelY: 455 },
  { index: 23, fdi: 32, x: 242, y: 426, rotation: -15, type: 'incisor', labelX: 247, labelY: 451 },
  { index: 22, fdi: 33, x: 267, y: 414, rotation: -25, type: 'incisor', labelX: 280, labelY: 438 },
  { index: 21, fdi: 34, x: 289, y: 396, rotation: -35, type: 'premolar', labelX: 307, labelY: 415 },
  { index: 20, fdi: 35, x: 306, y: 372, rotation: -45, type: 'premolar', labelX: 329, labelY: 387 },
  { index: 19, fdi: 36, x: 316, y: 342, rotation: -60, type: 'molar', labelX: 344, labelY: 352 },
  { index: 18, fdi: 37, x: 319, y: 308, rotation: -75, type: 'molar', labelX: 349, labelY: 312 },
  { index: 17, fdi: 38, x: 317, y: 274, rotation: -90, type: 'molar', labelX: 349, labelY: 270 },

  // Lower Right (Quadrant 4)
  { index: 25, fdi: 41, x: 185, y: 430, rotation: 5, type: 'incisor', labelX: 185, labelY: 455 },
  { index: 26, fdi: 42, x: 158, y: 426, rotation: 15, type: 'incisor', labelX: 153, labelY: 451 },
  { index: 27, fdi: 43, x: 133, y: 414, rotation: 25, type: 'incisor', labelX: 120, labelY: 438 },
  { index: 28, fdi: 44, x: 111, y: 396, rotation: 35, type: 'premolar', labelX: 93, labelY: 415 },
  { index: 29, fdi: 45, x: 94, y: 372, rotation: 45, type: 'premolar', labelX: 71, labelY: 387 },
  { index: 30, fdi: 46, x: 84, y: 342, rotation: 60, type: 'molar', labelX: 56, labelY: 352 },
  { index: 31, fdi: 47, x: 81, y: 308, rotation: 75, type: 'molar', labelX: 51, labelY: 312 },
  { index: 32, fdi: 48, x: 83, y: 274, rotation: 90, type: 'molar', labelX: 51, labelY: 270 }
];

interface OdontogramProps {
  chartData: Record<number, string>;
  selectedTooth?: number | null;
  onSelectTooth?: (toothNum: number) => void;
  isReadOnly?: boolean;
}

const Odontogram: React.FC<OdontogramProps> = ({
  chartData,
  selectedTooth = null,
  onSelectTooth,
  isReadOnly = false
}) => {
  const getToothPath = (type: 'molar' | 'premolar' | 'incisor') => {
    if (type === 'incisor') {
      return "M -7,-12 C -7,-12 -4,-15 0,-15 C 4,-15 7,-12 7,-12 C 8.5,-6 8.5,4 6.5,9 C 5.5,11.5 3.5,13 0,13 C -3.5,13 -5.5,11.5 -6.5,9 C -8.5,4 -8.5,-6 -7,-12 Z";
    } else if (type === 'premolar') {
      return "M -7,-9 C -7,-11 -4,-11.5 0,-11.5 C 4,-11.5 7,-9 7,-9 C 9.5,-5 9.5,5 7,9 C 7,11 4,11.5 0,11.5 C -4,11.5 -7,11 -7,9 C -9.5,5 -9.5,-5 -7,-9 Z";
    } else {
      return "M -10,-10 C -10,-13 -7,-13.5 0,-13.5 C 7,-13.5 10,-13 10,-10 C 12.5,-5 12.5,5 10,10 C 10,13 7,13.5 0,13.5 C -7,13.5 -10,13 -10,10 C -12.5,5 -12.5,-5 -10,-10 Z";
    }
  };

  const getToothFissures = (type: 'molar' | 'premolar' | 'incisor') => {
    if (type === 'molar') {
      return <path d="M -5,0 L 5,0 M 0,-7 L 0,7 M -3,-4 L 0,0 L -3,4 M 3,-4 L 0,0 L 3,4" className="stroke-slate-200 dark:stroke-slate-800 fill-none stroke-[0.8] transition-colors duration-200" />;
    } else if (type === 'premolar') {
      return <path d="M -3,0 L 3,0 M 0,-4 L 0,4" className="stroke-slate-200 dark:stroke-slate-800 fill-none stroke-[0.8] transition-colors duration-200" />;
    }
    return null;
  };

  return (
    <div className="w-full flex justify-center select-none">
      <div className="relative w-full max-w-[425px] aspect-[4/5] mx-auto">
        <svg viewBox="0 0 400 500" className="w-full h-full">
          {/* Central Guideline Crosshair */}
          <line x1="200" y1="50" x2="200" y2="450" className="stroke-slate-200/60 dark:stroke-slate-800/60 stroke-[1]" strokeDasharray="4 4" />
          <line x1="50" y1="250" x2="350" y2="250" className="stroke-slate-200/60 dark:stroke-slate-800/60 stroke-[1]" strokeDasharray="4 4" />

          {ALL_TEETH.map((tooth) => {
            const status = chartData[tooth.index];
            const isSelected = selectedTooth === tooth.index;
            const hasStatus = !!status && status !== "Healthy";
            const isHighlighted = isSelected || hasStatus;

            return (
              <g
                key={tooth.fdi}
                className={`cursor-pointer transition-all duration-200 group ${isReadOnly ? 'pointer-events-none' : ''}`}
                onClick={() => onSelectTooth && onSelectTooth(tooth.index)}
              >
                {/* Tooth outline */}
                <g transform={`translate(${tooth.x}, ${tooth.y}) rotate(${tooth.rotation})`}>
                  <path
                    d={getToothPath(tooth.type)}
                    className={`transition-colors duration-200 ${
                      isHighlighted 
                        ? 'fill-blue-100/70 dark:fill-blue-900/30 stroke-blue-500 stroke-[1.2]' 
                        : 'fill-white dark:fill-slate-900 hover:fill-blue-50/50 dark:hover:fill-blue-955/40 stroke-slate-300 dark:stroke-slate-700 hover:stroke-blue-400 stroke-[1]'
                    }`}
                  />
                  {getToothFissures(tooth.type)}
                </g>

                {/* FDI Label */}
                <text
                  x={tooth.labelX}
                  y={tooth.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-[12px] font-semibold transition-colors duration-200 ${
                    isHighlighted
                      ? 'fill-blue-600 dark:fill-blue-400 font-bold'
                      : 'fill-slate-400 dark:fill-slate-500 group-hover:fill-blue-500'
                  }`}
                >
                  {tooth.fdi}
                </text>

                <title>{`Tooth #${tooth.fdi}${status ? `: ${status}` : ': Healthy'}`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

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

const menuItems = [
  { name: "Dashboard", icon: <Home className="h-[22px] w-[22px] shrink-0" strokeWidth={2} />, badge: null },
  { name: "Appointments", icon: <Calendar className="h-[22px] w-[22px] shrink-0" strokeWidth={2} />, badge: null },
  { name: "Patients", icon: <Users className="h-[22px] w-[22px] shrink-0" strokeWidth={2} />, badge: null },
  { name: "Treatments", icon: <Stethoscope className="h-[22px] w-[22px] shrink-0" strokeWidth={2} />, badge: null },
  { name: "Billing", icon: <Receipt className="h-[22px] w-[22px] shrink-0" strokeWidth={2} />, badge: null },
  { name: "Reports", icon: <BarChart3 className="h-[22px] w-[22px] shrink-0" strokeWidth={2} />, badge: null },
  { name: "Settings", icon: <Settings className="h-[22px] w-[22px] shrink-0" strokeWidth={2} />, badge: null }
];

const moduleSubTabs: Record<string, string[]> = {
  Dashboard: ["Overview"],
  Appointments: ["Today", "Queue", "History"],
  Patients: ["All Patients", "Add Patient", "Dental Chart"],
  Treatments: ["Active Treatments", "Completed", "Treatment Plans"],
  Billing: ["Invoices", "Payments"],
  Reports: ["Revenue", "Patients", "Treatments", "Appointments"],
  Settings: ["Clinic", "Doctors", "Staff", "Integrations", "Backup"]
};

interface ClinicalMedia {
  id: string;
  patientId: string;
  name: string;
  type: string;
  category: "Clinical Photos" | "Consent Video Recordings";
  url: string;
  uploadDate: string;
  uploadedBy: string;
  toothNumber?: string;
  treatment?: string;
  appointment?: string;
  prescription?: string;
}

const parseClinicalNote = (noteStr: string) => {
  if (noteStr.startsWith("Title: ")) {
    const parts = noteStr.split(" | ");
    const title = parts[0]?.replace("Title: ", "") || "";
    const category = parts[1]?.replace("Category: ", "") || "General";
    const author = parts[2]?.replace("Author: ", "") || "Doctor";
    const content = parts[3]?.replace("Content: ", "") || "";
    const date = parts[4]?.replace("Date: ", "") || "12 Aug 2026";
    return { title, category, author, content, date };
  }
  return {
    title: "Clinical Practitioner Note",
    category: "General",
    author: "Practitioner",
    content: noteStr,
    date: "12 Aug 2026"
  };
};

export default function SaaSMainDashboard({ initialTab = "Dashboard" }: { initialTab?: string } = {}) {
  const router = useRouter();
  const [loadingSession, setLoadingSession] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setLoadingSession(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      } else {
        setLoadingSession(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

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
  const quickAddRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (quickAddRef.current && !quickAddRef.current.contains(event.target as Node)) {
        setQuickAddOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const [showNotifications, setShowNotifications] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
  const [payDiscountType, setPayDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [payDiscountValue, setPayDiscountValue] = useState(0);
  const [paymentCollectAmt, setPaymentCollectAmt] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [payTaxPercent, setPayTaxPercent] = useState(0);
  const [payCustomItems, setPayCustomItems] = useState<{ description: string; amount: number }[]>([]);
  const [newCustomDesc, setNewCustomDesc] = useState("");
  const [newCustomAmt, setNewCustomAmt] = useState(0);

  // Timeframe filter for reports page
  const [reportsFilter, setReportsFilter] = useState<string>("Today");
  const [customRangeModalOpen, setCustomRangeModalOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("2026-08-01");
  const [customEndDate, setCustomEndDate] = useState("2026-08-14");
  const [appliedCustomLabel, setAppliedCustomLabel] = useState<string | null>(null);
  const [patientsPeriod, setPatientsPeriod] = useState<"Today" | "This Week" | "This Month" | "Last Month" | "This Year" | "Custom Range">("This Month");

  // Redesigned dashboard state variables
  const [selectedCalendarDay, setSelectedCalendarDay] = useState("12 Aug 2026");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date(2026, 7, 10)); // Mon Aug 10, 2026
  const [blockedSlots, setBlockedSlots] = useState<Record<string, boolean>>({});
  
  // Add Patient quick panel inputs
  const [quickFirstName, setQuickFirstName] = useState("");
  const [quickLastName, setQuickLastName] = useState("");
  const [quickMobile, setQuickMobile] = useState("");
  const [quickGender, setQuickGender] = useState<"Male" | "Female">("Male");
  const [quickAge, setQuickAge] = useState(30);
  const [quickDOB, setQuickDOB] = useState("");
  const [quickLocation, setQuickLocation] = useState("Bengaluru");
  const [quickEmail, setQuickEmail] = useState("");
  const [quickAddress, setQuickAddress] = useState("");
  const [quickBloodGroup, setQuickBloodGroup] = useState("A+");
  const [quickPatientType, setQuickPatientType] = useState<"New" | "Returning">("New");
  const [quickNotes, setQuickNotes] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Recently Added Patient list states
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [patientFilterGender, setPatientFilterGender] = useState("All");
  const [patientSortBy, setPatientSortBy] = useState("Name-ASC");
  const [patientVisibleCount, setPatientVisibleCount] = useState(7);

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
  const [slotPatientDropdownOpen, setSlotPatientDropdownOpen] = useState(false);
  const [slotPatientSearchQuery, setSlotPatientSearchQuery] = useState("");
  const slotPatientDropdownRef = useRef<HTMLDivElement | null>(null);
  const [slotDoctor, setSlotDoctor] = useState("Dr. Deepa Kodali");
  const [slotTreatment, setSlotTreatment] = useState("Consultation");

  // Hover states for Month View cell popover
  const [hoveredApptDay, setHoveredApptDay] = useState<{
    dateStr: string;
    rect: { top: number; left: number; width: number; height: number };
    appointments: Appointment[];
  } | null>(null);
  const hoverTimeoutRef = useRef<any>(null);

  // Clinical Notes form states (integrated into Prescriptions)
  const [noteTitle, setNoteTitle] = useState("");
  const [noteCategory, setNoteCategory] = useState("General");
  const [noteContent, setNoteContent] = useState("");
  const [noteAuthor, setNoteAuthor] = useState("Dr. Deepa Kodali");

  // Media Gallery states
  const [patientMedia, setPatientMedia] = useState<ClinicalMedia[]>([
    {
      id: "media-1",
      patientId: "DS-1001",
      name: "intraoral_photo_mehta.png",
      type: "image/png",
      category: "Clinical Photos",
      url: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=600&auto=format&fit=crop",
      uploadDate: "12 Aug 2026",
      uploadedBy: "Dr. Deepa Kodali",
      toothNumber: "16",
      treatment: "Root Canal Therapy",
      appointment: "12 Aug 2026 at 09:00 AM",
      prescription: "Amoxicillin 500mg"
    },
    {
      id: "media-2",
      patientId: "DS-1001",
      name: "patient_consent_recording.mp4",
      type: "video/mp4",
      category: "Consent Video Recordings",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
      uploadDate: "10 Aug 2026",
      uploadedBy: "Dr. Deepa Kodali",
      treatment: "Consultation",
      appointment: "10 Aug 2026"
    }
  ]);
  const [mediaFilter, setMediaFilter] = useState("All");
  const [selectedMediaForPreview, setSelectedMediaForPreview] = useState<ClinicalMedia | null>(null);
  const [mediaToEdit, setMediaToEdit] = useState<ClinicalMedia | null>(null);
  const [selectedTreatmentDetail, setSelectedTreatmentDetail] = useState<TreatmentItem | null>(null);

  // Consent Video Recorder states
  const [recorderState, setRecorderState] = useState<"idle" | "recording" | "paused" | "review">("idle");
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWebcam = async (deviceId?: string) => {
    try {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(track => track.stop());
      }
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: true
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      webcamStreamRef.current = stream;
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setMicActive(true);

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(d => d.kind === "videoinput");
      setAvailableCameras(videoInputs);
      if (!selectedCameraId && videoInputs.length > 0) {
        setSelectedCameraId(videoInputs[0].deviceId);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraActive(false);
      setMicActive(false);
    }
  };

  const stopWebcam = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach(track => track.stop());
      webcamStreamRef.current = null;
    }
    setCameraActive(false);
    setMicActive(false);
  };

  const handleStartRecording = async () => {
    if (!webcamStreamRef.current) {
      await startWebcam(selectedCameraId);
    }
    if (!webcamStreamRef.current) {
      showToast("Camera or microphone permission denied.", "error");
      return;
    }

    recordedChunksRef.current = [];
    try {
      const recorder = new MediaRecorder(webcamStreamRef.current, { mimeType: "video/webm" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedVideoBlob(blob);
        setRecordedVideoUrl(url);
        setRecorderState("review");
        stopWebcam();
      };

      recorder.start(1000);
      setRecorderState("recording");
      setRecordingSeconds(0);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 89) {
            handleStopRecording();
            return 90;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("MediaRecorder start error:", err);
      showToast("Could not start video recorder in browser.", "error");
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setRecorderState("paused");
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setRecorderState("recording");
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 89) {
            handleStopRecording();
            return 90;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleStopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && (mediaRecorderRef.current.state === "recording" || mediaRecorderRef.current.state === "paused")) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleRetakeRecording = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedVideoBlob(null);
    setRecordedVideoUrl(null);
    setRecordingSeconds(0);
    setRecorderState("idle");
    startWebcam(selectedCameraId);
  };

  const handleSaveConsentRecording = () => {
    if (recordingSeconds < 20) {
      showToast("Please record at least 20 seconds of patient consent.", "error");
      return;
    }
    const currentPat = patients.find(p => p.id === selectedPatientId);
    const docName = prescDoctor || (doctors[0]?.name || "Dr. Deepa Kodali");
    const durationStr = formatTimer(recordingSeconds);

    const newMedia: ClinicalMedia = {
      id: `media-consent-${Date.now()}`,
      patientId: selectedPatientId || "",
      name: `Consent_Video_${currentPat?.name.replace(/\s+/g, '_') || 'Patient'}_${durationStr.replace(':', 'm')}s.webm`,
      type: "video/webm",
      category: "Consent Video Recordings",
      url: recordedVideoUrl || "https://www.w3schools.com/html/mov_bbb.mp4",
      uploadDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      uploadedBy: docName,
      prescription: `Duration: ${durationStr}`
    };

    setPatientMedia(prev => [newMedia, ...prev]);
    showToast(`Patient consent video (${durationStr}) saved to clinical records.`, "success");
    setRecorderState("idle");
    setRecordedVideoBlob(null);
    setRecordedVideoUrl(null);
    setRecordingSeconds(0);
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Edit/Rename media form fields
  const [editMediaName, setEditMediaName] = useState("");
  const [editMediaCategory, setEditMediaCategory] = useState("Clinical Photos");
  const [editMediaTooth, setEditMediaTooth] = useState("");
  const [editMediaTreatment, setEditMediaTreatment] = useState("");
  const [editMediaAppointment, setEditMediaAppointment] = useState("");
  const [editMediaPrescription, setEditMediaPrescription] = useState("");
  const [editMediaUploadedBy, setEditMediaUploadedBy] = useState("Dr. Deepa Kodali");

  useEffect(() => {
    if (mediaToEdit) {
      setEditMediaName(mediaToEdit.name);
      setEditMediaCategory(mediaToEdit.category);
      setEditMediaTooth(mediaToEdit.toothNumber || "");
      setEditMediaTreatment(mediaToEdit.treatment || "");
      setEditMediaAppointment(mediaToEdit.appointment || "");
      setEditMediaPrescription(mediaToEdit.prescription || "");
      setEditMediaUploadedBy(mediaToEdit.uploadedBy);
    }
  }, [mediaToEdit]);

  const handleSaveMediaMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaToEdit) return;
    if (!editMediaName.trim()) {
      showToast("File name cannot be empty.", "error");
      return;
    }
    setPatientMedia(prev => prev.map(m => {
      if (m.id === mediaToEdit.id) {
        return {
          ...m,
          name: editMediaName.trim(),
          category: editMediaCategory as any,
          toothNumber: editMediaTooth.trim() || undefined,
          treatment: editMediaTreatment.trim() || undefined,
          appointment: editMediaAppointment.trim() || undefined,
          prescription: editMediaPrescription.trim() || undefined,
          uploadedBy: editMediaUploadedBy
        };
      }
      return m;
    }));
    setMediaToEdit(null);
    showToast("Clinical media file updated.", "success");
  };

  const handleMockMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    
    const newMediaItems: ClinicalMedia[] = filesArray.map((file, idx) => {
      const isVideo = file.type.startsWith("video/") || file.name.endsWith(".mp4") || file.name.endsWith(".mov") || file.name.endsWith(".avi");
      const cat: "Clinical Photos" | "Consent Video Recordings" = isVideo ? "Consent Video Recordings" : "Clinical Photos";
      
      return {
        id: `media-${Date.now()}-${idx}`,
        patientId: selectedPatientId || "",
        name: file.name,
        type: isVideo ? (file.type || "video/mp4") : (file.type || "image/png"),
        category: cat,
        url: isVideo
          ? "https://www.w3schools.com/html/mov_bbb.mp4"
          : "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=600&auto=format&fit=crop",
        uploadDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        uploadedBy: prescDoctor || (doctors[0]?.name || "Dr. Deepa Kodali")
      };
    });
    
    setPatientMedia(prev => [...newMediaItems, ...prev]);
    showToast(`${filesArray.length} clinical media files uploaded.`, "success");
  };

  useEffect(() => {
    function handleDropdownClickOutside(event: MouseEvent) {
      if (
        slotPatientDropdownRef.current &&
        !slotPatientDropdownRef.current.contains(event.target as Node)
      ) {
        setSlotPatientDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleDropdownClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleDropdownClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedSlotData) {
      setSlotPatientSearchQuery("");
      setSlotPatientDropdownOpen(false);
    }
  }, [selectedSlotData]);

  const handleCellMouseEnter = (rect: DOMRect, dateStr: string, appointments: Appointment[]) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredApptDay({
      dateStr,
      rect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      },
      appointments
    });
  };

  const handleCellMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredApptDay(null);
    }, 200);
  };

  const handlePopoverMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handlePopoverMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredApptDay(null);
    }, 200);
  };

  // --- BOOKED CALENDAR SLOT HOVER POPOVER STATE ---
  interface HoveredSlotPopover {
    appointment: Appointment;
    rect: { top: number; left: number; width: number; height: number };
  }

  const [hoveredSlotPopover, setHoveredSlotPopover] = useState<HoveredSlotPopover | null>(null);
  const slotHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSlotMouseEnter = (rect: DOMRect, appt: Appointment) => {
    if (slotHoverTimeoutRef.current) {
      clearTimeout(slotHoverTimeoutRef.current);
      slotHoverTimeoutRef.current = null;
    }
    setHoveredSlotPopover({
      appointment: appt,
      rect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      }
    });
  };

  const handleSlotMouseLeave = () => {
    if (slotHoverTimeoutRef.current) clearTimeout(slotHoverTimeoutRef.current);
    slotHoverTimeoutRef.current = setTimeout(() => {
      setHoveredSlotPopover(null);
    }, 200);
  };

  // Custom toast notifications and directory queries
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [patientsDirectoryQuery, setPatientsDirectoryQuery] = useState("");

  // --- PATIENT PROFILE FORM EDIT STATES ---
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editAge, setEditAge] = useState(0);
  const [editGender, setEditGender] = useState<"Male" | "Female">("Male");
  const [editBloodGroup, setEditBloodGroup] = useState("");
  const [editOccupation, setEditOccupation] = useState("");
  const [editAddressLine, setEditAddressLine] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editPincode, setEditPincode] = useState("");
  const [editAllergies, setEditAllergies] = useState("");
  const [editMedicalConditions, setEditMedicalConditions] = useState("");
  const [editCurrentMedications, setEditCurrentMedications] = useState("");
  const [editEmergencyContactName, setEditEmergencyContactName] = useState("");
  const [editEmergencyContactPhone, setEditEmergencyContactPhone] = useState("");
  const [editFirstVisit, setEditFirstVisit] = useState("");
  const [editLastVisit, setEditLastVisit] = useState("");
  const [editPreferredDentist, setEditPreferredDentist] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // --- TOOTH TREATMENT FORM STATE ---
  const [chartSelectedTooth, setChartSelectedTooth] = useState<number | null>(null);
  const [chartTreatmentName, setChartTreatmentName] = useState("");
  const [chartDiagnosis, setChartDiagnosis] = useState("");
  const [chartStatus, setChartStatus] = useState<"Planned" | "In Progress" | "Completed">("Planned");
  const [chartDoctor, setChartDoctor] = useState("");
  const [chartDate, setChartDate] = useState("");
  const [chartCost, setChartCost] = useState("");
  const [chartNotes, setChartNotes] = useState("");

  // --- TREATMENTS FORM STATE ---
  const [showAddTreatmentModal, setShowAddTreatmentModal] = useState(false);
  const [newTrName, setNewTrName] = useState("");
  const [newTrTooth, setNewTrTooth] = useState("");
  const [newTrDoctor, setNewTrDoctor] = useState("");
  const [newTrCost, setNewTrCost] = useState("");
  const [newTrDiagnosis, setNewTrDiagnosis] = useState("");
  const [newTrNotes, setNewTrNotes] = useState("");
  const [newTrStatus, setNewTrStatus] = useState<"Planned" | "In Progress" | "Completed">("Planned");
  const [newTrApptLink, setNewTrApptLink] = useState("");

  // --- APPOINTMENTS FORM STATES ---
  const [showAddApptForm, setShowAddApptForm] = useState(false);
  const [patApptDoctor, setPatApptDoctor] = useState("");
  const [patApptTreatment, setPatApptTreatment] = useState("");
  const [patApptDate, setPatApptDate] = useState("");
  const [patApptTime, setPatApptTime] = useState("");
  const [patApptNotes, setPatApptNotes] = useState("");

  const [reschedulingApptId, setReschedulingApptId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  // --- PRESCRIPTION BUILDER STATES ---
  const [prescDoctor, setPrescDoctor] = useState("");
  const [prescDate, setPrescDate] = useState("");
  const [prescDiagnosis, setPrescDiagnosis] = useState("");
  const [prescAdvice, setPrescAdvice] = useState("");
  const [prescMeds, setPrescMeds] = useState<{ name: string; dosage: string; freq: string; duration: string; instructions: string }[]>([
    { name: "", dosage: "", freq: "", duration: "", instructions: "" }
  ]);

  // --- INVOICE FORM STATES ---
  const [invProcedure, setInvProcedure] = useState("");
  const [invAmount, setInvAmount] = useState("");
  const [invDiscount, setInvDiscount] = useState("0");
  const [invTax, setInvTax] = useState("0");
  const [invPaid, setInvPaid] = useState("0");
  const [invMode, setInvMode] = useState("UPI GPay");

  // --- FILES UPLOAD FORM STATE ---
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState("X-Ray Scan");
  const [newFileUploadedBy, setNewFileUploadedBy] = useState("");



  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

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
    { id: "DS-1012", name: "Meera Nair", phone: "+91 99104 56789", age: 33, gender: "Female", address: "Cox Town, Bengaluru", visit: "05 Jul 2026", medicalNotes: "None", balance: "₹500", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
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
    { id: "INV-1001", patientId: "DS-1011", patientName: "Vikram Malhotra", doctor: "Dr. Deepa Kodali", treatment: "Consultation", items: [{ description: "Consultation Fee", amount: 500 }, { description: "Pain Reliever pills", amount: 300 }], discount: 10, tax: 0, subtotal: 800, total: 720, paidAmount: 720, status: "Paid", paymentDate: "10 Aug 2026", paymentLogs: [{ method: "UPI GPay", amount: 720, date: "10 Aug 2026" }] },
    { id: "INV-1002", patientId: "DS-1012", patientName: "Meera Nair", doctor: "Dr. Raghuram", treatment: "Scaling", items: [{ description: "Scaling and Polishing", amount: 1500 }], discount: 0, tax: 0, subtotal: 1500, total: 1500, paidAmount: 1000, status: "Partially Paid", paymentDate: "05 Aug 2026", paymentLogs: [{ method: "Cash", amount: 1000, date: "05 Aug 2026" }] }
  ]);

  const [doctors, setDoctors] = useState<Doctor[]>([
    { name: "Dr. Deepa Kodali", speciality: "Endodontist", status: "Available", phone: "+91 98112 33445" },
    { name: "Dr. Raghuram", speciality: "Orthodontist", status: "Available", phone: "+91 98765 43210" },
    { name: "Dr. Srinivasa", speciality: "Periodontist", status: "Available", phone: "+91 98123 45678" },
    { name: "Dr. Priyanka Mane Pado", speciality: "Pedodontist", status: "Available", phone: "+91 98234 56789" },
    { name: "Dr. Krishna Teja", speciality: "Prosthodontist", status: "Available", phone: "+91 98345 67890" }
  ]);

  const [staffList, setStaffList] = useState<Staff[]>([
    { id: "st-1", name: "Sneha Rao", role: "Senior Nurse / Hygienist", phone: "+91 98765 11223", status: "Active" },
    { id: "st-2", name: "Amit Kumar", role: "Desk Operations & Billing", phone: "+91 98765 44556", status: "Active" }
  ]);

  const [integrationsState, setIntegrationsState] = useState({
    whatsapp: true,
    email: true,
    googleCalendar: false,
    dentalLab: true
  });

  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("Daily");
  const [backupHistory, setBackupHistory] = useState<BackupHistoryItem[]>([
    { id: "bk-1", date: "13 Aug 2026", time: "03:00 AM", size: "24.8 MB", status: "Completed" },
    { id: "bk-2", date: "12 Aug 2026", time: "03:00 AM", size: "24.2 MB", status: "Completed" },
    { id: "bk-3", date: "11 Aug 2026", time: "03:00 AM", size: "23.9 MB", status: "Completed" }
  ]);

  // Doctor & Staff Modal states
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deleteDoctorConfirm, setDeleteDoctorConfirm] = useState<Doctor | null>(null);

  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deleteStaffConfirm, setDeleteStaffConfirm] = useState<Staff | null>(null);

  const [restoreBackupConfirm, setRestoreBackupConfirm] = useState<BackupHistoryItem | null>(null);

  // Form states for adding/editing doctor
  const [docFormName, setDocFormName] = useState("");
  const [docFormSpeciality, setDocFormSpeciality] = useState("General Dentist");
  const [docFormPhone, setDocFormPhone] = useState("");
  const [docFormStatus, setDocFormStatus] = useState<"Available" | "In Consultation" | "On Break" | "Finished Today">("Available");

  // Form states for adding/editing staff
  const [staffFormName, setStaffFormName] = useState("");
  const [staffFormRole, setStaffFormRole] = useState("Desk Operations");
  const [staffFormPhone, setStaffFormPhone] = useState("");
  const [staffFormStatus, setStaffFormStatus] = useState<"Active" | "Inactive" | "On Leave">("Active");

  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: "act-1", type: "Register", msg: "Apex Dental database initialized with 15 intake files.", time: "1 hour ago" },
    { id: "act-2", type: "Appointment", msg: "Aarav Mehta scheduled for Root Canal at 09:00 AM.", time: "45 mins ago" }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, msg: "Follow-up due tomorrow for Priya Patel.", unread: true },
    { id: 2, msg: "Stock Alert: Lidocaine cartridge stock is below 15%.", unread: false }
  ]);

  const [treatments, setTreatments] = useState<TreatmentItem[]>([
    {
      id: "tr-1",
      name: "Root Canal Therapy",
      patient: "Aarav Mehta",
      doctor: "Dr. Deepa Kodali",
      treatmentPlan: "Root Canal Treatment",
      stage: "In Progress",
      completedVisits: 2,
      totalVisits: 3,
      cost: 8500,
      prescription: "Amoxicillin 500mg, Ibuprofen 400mg",
      notes: "Canal obturated, temp crown placed.",
      nextVisit: "10 Aug 2026"
    },
    {
      id: "tr-2",
      name: "Orthodontic Aligners",
      patient: "Meera Nair",
      doctor: "Dr. Raghuram",
      treatmentPlan: "Orthodontic Treatment",
      stage: "In Progress",
      completedVisits: 4,
      totalVisits: 12,
      cost: 45000,
      prescription: "Orthodontic Wax",
      notes: "Tray 4 delivered, tracking well.",
      nextVisit: "25 Aug 2026"
    },
    {
      id: "tr-3",
      name: "Dental Implant #16",
      patient: "Siddharth Rao",
      doctor: "Dr. Srinivasa",
      treatmentPlan: "Dental Implant",
      stage: "In Progress",
      completedVisits: 1,
      totalVisits: 4,
      cost: 35000,
      prescription: "Augmentin 625mg, Chlorhexidine Mouthwash",
      notes: "Fixture placed, osseointegration period.",
      nextVisit: "15 Sep 2026"
    },
    {
      id: "tr-4",
      name: "Full Mouth Scaling",
      patient: "Priya Patel",
      doctor: "Dr. Deepa Kodali",
      treatmentPlan: "Scaling & Polishing",
      stage: "Completed",
      completedVisits: 2,
      totalVisits: 2,
      cost: 2500,
      prescription: "Metrogyl Denta Gel",
      notes: "Deep scaling & polishing completed.",
      nextVisit: "Finished"
    },
    {
      id: "tr-5",
      name: "Zirconia Crown #24",
      patient: "Vikram Malhotra",
      doctor: "Dr. Priyanka Mane Pado",
      treatmentPlan: "Crown Placement",
      stage: "Planned",
      completedVisits: 0,
      totalVisits: 2,
      cost: 12000,
      prescription: "None",
      notes: "Impression scheduled for next visit.",
      nextVisit: "12 Aug 2026"
    },
    {
      id: "tr-6",
      name: "Molar Extraction #38",
      patient: "Kavita Sharma",
      doctor: "Dr. Krishna Teja",
      treatmentPlan: "Extraction",
      stage: "Completed",
      completedVisits: 1,
      totalVisits: 1,
      cost: 3500,
      prescription: "Ketorol DT",
      notes: "Impacted third molar extraction.",
      nextVisit: "Finished"
    }
  ]);

  // --- PATIENT PROFILE FORM SYNC & HANDLERS ---
  useEffect(() => {
    if (selectedPatientId) {
      const p = patients.find(pat => pat.id === selectedPatientId);
      if (p) {
        const names = p.name.split(" ");
        setEditFirstName(p.firstName || names[0] || "");
        setEditLastName(p.lastName || names.slice(1).join(" ") || "");
        setEditMobile(p.phone || "");
        setEditEmail(p.email || "");
        setEditDob(p.dob || "");
        setEditAge(p.age || 0);
        setEditGender(p.gender || "Male");
        setEditBloodGroup(p.bloodGroup || "");
        setEditOccupation(p.occupation || "");
        
        const addrParts = p.address ? p.address.split(",") : [];
        setEditAddressLine(p.addressLine || addrParts[0]?.trim() || p.address || "");
        setEditCity(p.city || addrParts[1]?.trim() || "");
        setEditState(p.state || addrParts[2]?.split("-")[0]?.trim() || "");
        setEditPincode(p.pincode || addrParts[2]?.split("-")[1]?.trim() || "");
        
        setEditAllergies(p.allergies || "");
        setEditMedicalConditions(p.medicalConditions || "");
        setEditCurrentMedications(p.currentMedications || "");
        setEditEmergencyContactName(p.emergencyContactName || "");
        setEditEmergencyContactPhone(p.emergencyContactPhone || "");
        setEditFirstVisit(p.firstVisit || p.visit || "");
        setEditLastVisit(p.visit || "");
        setEditPreferredDentist(p.preferredDentist || "");
        setEditNotes(p.notes?.join("\n") || "");
      }
    }
  }, [selectedPatientId, patients]);

  const handleDobChange = (dobStr: string) => {
    setEditDob(dobStr);
    if (dobStr) {
      const birthDate = new Date(dobStr);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setEditAge(calculatedAge >= 0 ? calculatedAge : 0);
    }
  };

  const handleSavePatientProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFirstName.trim() || !editMobile.trim()) {
      showToast("First name and mobile number are required.", "error");
      return;
    }
    
    const fullName = `${editFirstName.trim()} ${editLastName.trim()}`.trim();
    const fullAddress = `${editAddressLine.trim()}${editCity ? ', ' + editCity.trim() : ''}${editState ? ', ' + editState.trim() : ''}${editPincode ? ' - ' + editPincode.trim() : ''}`;
    const mergedMedicalNotes = [
      editAllergies ? `Allergies: ${editAllergies}` : "",
      editMedicalConditions ? `Conditions: ${editMedicalConditions}` : "",
      editCurrentMedications ? `Meds: ${editCurrentMedications}` : ""
    ].filter(Boolean).join(" | ") || "None";

    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          name: fullName,
          firstName: editFirstName.trim(),
          lastName: editLastName.trim(),
          phone: editMobile.trim(),
          email: editEmail.trim(),
          dob: editDob,
          age: editAge,
          gender: editGender,
          bloodGroup: editBloodGroup.trim(),
          occupation: editOccupation.trim(),
          address: fullAddress,
          addressLine: editAddressLine.trim(),
          city: editCity.trim(),
          state: editState.trim(),
          pincode: editPincode.trim(),
          allergies: editAllergies.trim(),
          medicalConditions: editMedicalConditions.trim(),
          currentMedications: editCurrentMedications.trim(),
          emergencyContactName: editEmergencyContactName.trim(),
          emergencyContactPhone: editEmergencyContactPhone.trim(),
          firstVisit: editFirstVisit,
          visit: editLastVisit || p.visit,
          preferredDentist: editPreferredDentist,
          medicalNotes: mergedMedicalNotes,
          notes: editNotes ? editNotes.split("\n").filter(Boolean) : p.notes
        };
      }
      return p;
    }));

    // Update patient name in appointments, invoices, treatments, etc.
    const oldPatientItem = patients.find(p => p.id === selectedPatientId);
    if (oldPatientItem && oldPatientItem.name !== fullName) {
      setAppointments(prev => prev.map(a => a.patientId === selectedPatientId ? { ...a, patientName: fullName } : a));
      setInvoices(prev => prev.map(inv => inv.patientId === selectedPatientId ? { ...inv, patientName: fullName } : inv));
      setTreatments(prev => prev.map(tr => tr.patient === oldPatientItem.name ? { ...tr, patient: fullName } : tr));
    }

    showToast("Patient profile updated successfully.", "success");
  };

  const handleChartToothSelect = (toothIndex: number) => {
    setChartSelectedTooth(toothIndex);
    if (!chartDoctor && doctors.length > 0) {
      setChartDoctor(doctors[0].name);
    }
    if (!chartDate) {
      setChartDate(new Date().toISOString().split("T")[0]);
    }
  };

  const handleSaveToothTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chartTreatmentName.trim()) {
      showToast("Treatment name is required.", "error");
      return;
    }
    if (!chartSelectedTooth) return;

    const patientItem = patients.find(p => p.id === selectedPatientId);
    if (!patientItem) return;

    const toothObj = ALL_TEETH.find(t => t.index === chartSelectedTooth);
    const toothDisplay = toothObj ? `#${toothObj.fdi}` : `#${chartSelectedTooth}`;

    const newTreatmentId = `tr-${Date.now()}`;
    const newTreatment: TreatmentItem = {
      id: newTreatmentId,
      name: chartTreatmentName.trim(),
      patient: patientItem.name,
      doctor: chartDoctor,
      stage: chartStatus,
      notes: chartNotes.trim(),
      nextVisit: "",
      prescription: "",
      tooth: chartSelectedTooth,
      cost: Number(chartCost) || 0,
      diagnosis: chartDiagnosis.trim(),
      date: chartDate
    };

    setTreatments(prev => [...prev, newTreatment]);

    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          dentalChart: {
            ...p.dentalChart,
            [chartSelectedTooth]: `${chartTreatmentName.trim()} (${chartStatus})`
          }
        };
      }
      return p;
    }));

    const newActId = `act-${Date.now()}`;
    const newAct: ActivityItem = {
      id: newActId,
      type: "Chart",
      msg: `Tooth ${toothDisplay} treatment "${chartTreatmentName.trim()}" saved for ${patientItem.name} (${chartStatus}).`,
      time: "Just now"
    };
    setActivities(prev => [newAct, ...prev]);

    if (chartStatus === "Completed") {
      const newInvId = `INV-${Date.now().toString().slice(-4)}`;
      const costAmount = Number(chartCost) || 0;
      const subtotal = costAmount;
      const total = subtotal;
      
      const newInvoice: InvoiceItem = {
        id: newInvId,
        patientId: patientItem.id,
        patientName: patientItem.name,
        doctor: chartDoctor,
        treatment: chartTreatmentName.trim(),
        items: [{ description: `${chartTreatmentName.trim()} on Tooth ${toothDisplay}`, amount: costAmount }],
        discount: 0,
        tax: 0,
        subtotal,
        total,
        paidAmount: 0,
        status: "Pending",
        paymentDate: "",
        paymentLogs: []
      };
      setInvoices(prev => [...prev, newInvoice]);
    }

    setChartSelectedTooth(null);
    setChartTreatmentName("");
    setChartDiagnosis("");
    setChartStatus("Planned");
    setChartNotes("");
    setChartCost("");

    showToast("Tooth treatment override saved.", "success");
  };

  const handleSaveCustomTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrName.trim()) {
      showToast("Treatment name is required.", "error");
      return;
    }
    const patientItem = patients.find(p => p.id === selectedPatientId);
    if (!patientItem) return;

    const newTrId = `tr-${Date.now()}`;
    const toothNum = Number(newTrTooth) || undefined;
    const costAmt = Number(newTrCost) || 0;

    const newTreatment: TreatmentItem = {
      id: newTrId,
      name: newTrName.trim(),
      patient: patientItem.name,
      doctor: newTrDoctor || (doctors[0]?.name || ""),
      stage: newTrStatus,
      notes: newTrNotes.trim(),
      nextVisit: "",
      prescription: "",
      tooth: toothNum,
      cost: costAmt,
      diagnosis: newTrDiagnosis.trim(),
      date: new Date().toISOString().split("T")[0]
    };

    setTreatments(prev => [...prev, newTreatment]);

    if (toothNum) {
      setPatients(prev => prev.map(p => {
        if (p.id === selectedPatientId) {
          return {
            ...p,
            dentalChart: {
              ...p.dentalChart,
              [toothNum]: `${newTrName.trim()} (${newTrStatus})`
            }
          };
        }
        return p;
      }));
    }

    if (newTrStatus === "Completed") {
      const newInvId = `INV-${Date.now().toString().slice(-4)}`;
      const subtotal = costAmt;
      const total = subtotal;
      
      const newInvoice: InvoiceItem = {
        id: newInvId,
        patientId: patientItem.id,
        patientName: patientItem.name,
        doctor: newTrDoctor || (doctors[0]?.name || ""),
        treatment: newTrName.trim(),
        items: [{ description: `${newTrName.trim()}${toothNum ? ' on Tooth #' + toothNum : ''}`, amount: costAmt }],
        discount: 0,
        tax: 0,
        subtotal,
        total,
        paidAmount: 0,
        status: "Pending",
        paymentDate: "",
        paymentLogs: []
      };
      setInvoices(prev => [...prev, newInvoice]);
    }

    setActivities(prev => [{
      id: `act-${Date.now()}`,
      type: "Treatment",
      msg: `New treatment "${newTrName.trim()}" logged for ${patientItem.name}.`,
      time: "Just now"
    }, ...prev]);

    setShowAddTreatmentModal(false);
    setNewTrName("");
    setNewTrTooth("");
    setNewTrCost("");
    setNewTrDiagnosis("");
    setNewTrNotes("");
    setNewTrStatus("Planned");
    setNewTrApptLink("");

    showToast("Treatment added successfully.", "success");
  };

  const handleSavePatientAppt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patApptTreatment.trim() || !patApptDate || !patApptTime) {
      showToast("Treatment, date, and time are required.", "error");
      return;
    }
    const patientItem = patients.find(p => p.id === selectedPatientId);
    if (!patientItem) return;

    const newApptId = `appt-${Date.now()}`;
    const newAppt: Appointment = {
      id: newApptId,
      patientId: patientItem.id,
      patientName: patientItem.name,
      doctor: patApptDoctor || (doctors[0]?.name || ""),
      treatment: patApptTreatment,
      time: patApptTime,
      date: patApptDate,
      status: "Scheduled",
      notes: patApptNotes.trim(),
      avatarColor: "bg-blue-100 text-blue-600"
    };

    setAppointments(prev => [...prev, newAppt]);
    
    setActivities(prev => [{
      id: `act-${Date.now()}`,
      type: "Appointment",
      msg: `New appointment scheduled for ${patientItem.name} with ${newAppt.doctor}.`,
      time: "Just now"
    }, ...prev]);

    setShowAddApptForm(false);
    setPatApptTreatment("");
    setPatApptDate("");
    setPatApptTime("");
    setPatApptNotes("");

    showToast("Appointment scheduled successfully.", "success");
  };

  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (prescMeds.some(m => !m.name.trim())) {
      showToast("All medicines must have a name.", "error");
      return;
    }
    const patientItem = patients.find(p => p.id === selectedPatientId);
    if (!patientItem) return;

    const formattedList = prescMeds.map(m => 
      `${m.name} (${m.dosage}) - ${m.freq} for ${m.duration} [${m.instructions}]`
    );

    let updatedNotes = [...(patientItem.notes || [])];
    if (noteTitle.trim() && noteContent.trim()) {
      const dateStr = prescDate ? new Date(prescDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      const formattedNote = `Title: ${noteTitle.trim()} | Category: ${noteCategory} | Author: ${noteAuthor} | Content: ${noteContent.trim()} | Date: ${dateStr}`;
      updatedNotes = [...updatedNotes, formattedNote];
    }

    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          prescriptions: [...(p.prescriptions || []), ...formattedList],
          notes: updatedNotes
        };
      }
      return p;
    }));

    const docName = prescDoctor || (doctors[0]?.name || "");
    
    const newFile = {
      name: `prescription_${new Date(prescDate || Date.now()).toISOString().slice(0,10)}.pdf`,
      size: "1.5 KB",
      type: "application/pdf"
    };

    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          files: [...(p.files || []), newFile]
        };
      }
      return p;
    }));

    setPrescMeds([{ name: "", dosage: "", freq: "", duration: "", instructions: "" }]);
    setPrescAdvice("");
    setPrescDiagnosis("");
    
    setNoteTitle("");
    setNoteContent("");
    setNoteCategory("General");

    showToast("Prescription generated and saved.", "success");
  };

  const handleSaveClinicalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) {
      showToast("Note title and content are required.", "error");
      return;
    }
    const patientItem = patients.find(p => p.id === selectedPatientId);
    if (!patientItem) return;

    const dateStr = prescDate ? new Date(prescDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const formattedNote = `Title: ${noteTitle.trim()} | Category: ${noteCategory} | Author: ${noteAuthor} | Content: ${noteContent.trim()} | Date: ${dateStr}`;

    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          notes: [...(p.notes || []), formattedNote]
        };
      }
      return p;
    }));

    setNoteTitle("");
    setNoteContent("");
    setNoteCategory("General");
    showToast("Clinical note saved successfully.", "success");
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invProcedure.trim() || !invAmount) {
      showToast("Procedure and Amount are required.", "error");
      return;
    }
    const patientItem = patients.find(p => p.id === selectedPatientId);
    if (!patientItem) return;

    const amt = Number(invAmount) || 0;
    const disc = Number(invDiscount) || 0;
    const paid = Number(invPaid) || 0;

    const discountAmount = amt * (disc / 100);
    const subtotal = amt - discountAmount;
    const total = subtotal;
    const pending = Math.max(0, total - paid);

    const newInvId = `INV-${Date.now().toString().slice(-4)}`;
    const newInvoice: InvoiceItem = {
      id: newInvId,
      patientId: patientItem.id,
      patientName: patientItem.name,
      doctor: doctors[0]?.name || "Dr. Deepa Kodali",
      treatment: invProcedure.trim(),
      items: [{ description: invProcedure.trim(), amount: amt }],
      discount: disc,
      tax: 0,
      subtotal,
      total,
      paidAmount: paid,
      status: pending === 0 ? "Paid" : paid > 0 ? "Partially Paid" : "Pending",
      paymentDate: paid > 0 ? new Date().toISOString().split("T")[0] : "",
      paymentLogs: paid > 0 ? [{ method: invMode, amount: paid, date: new Date().toISOString().split("T")[0] }] : []
    };

    setInvoices(prev => [...prev, newInvoice]);

    setActivities(prev => [{
      id: `act-${Date.now()}`,
      type: "Billing",
      msg: `Invoice ${newInvId} generated for ${patientItem.name} (${newInvoice.status}).`,
      time: "Just now"
    }, ...prev]);

    setInvProcedure("");
    setInvAmount("");
    setInvDiscount("0");
    setInvTax("0");
    setInvPaid("0");

    showToast("Invoice saved successfully.", "success");
  };

  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) {
      showToast("File name is required.", "error");
      return;
    }
    const patientItem = patients.find(p => p.id === selectedPatientId);
    if (!patientItem) return;

    const newFile = {
      name: newFileName.trim(),
      size: "2.4 MB",
      type: newFileType
    };

    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          files: [...(p.files || []), newFile]
        };
      }
      return p;
    }));

    setNewFileName("");
    showToast("File uploaded and linked successfully.", "success");
  };



  // --- HELPER DYNAMIC CALCULATIONS ---

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

  const getFilteredReportStats = () => {
    // Generate filtered revenue calculations based on reporting timeframe selector
    let revMultiplier = 1;
    let patientOffset = 0;
    if (reportsFilter === "Week") { revMultiplier = 5.2; patientOffset = 18; }
    else if (reportsFilter === "Month") { revMultiplier = 22; patientOffset = 76; }
    else if (reportsFilter === "Year") { revMultiplier = 240; patientOffset = 880; }
    else if (reportsFilter === "Custom") {
      const startMs = customStartDate ? new Date(customStartDate).getTime() : Date.now();
      const endMs = customEndDate ? new Date(customEndDate).getTime() : Date.now();
      const days = Math.max(1, Math.round(Math.abs((endMs - startMs) / (1000 * 60 * 60 * 24))));
      revMultiplier = Math.max(0.5, days * 0.75);
      patientOffset = Math.round(days * 2.8);
    }

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
    const tot = sub;

    const newInvoice: InvoiceItem = {
      id: invoiceNum,
      patientId: appt.patientId,
      patientName: appt.patientName,
      doctor: appt.doctor,
      treatment: appt.treatment,
      items: invoiceItems,
      discount: 0,
      tax: 0,
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

    const collectedTotal = paymentCollectAmt;
    const finalInvoiceTotal = calculateInvoiceTotal();

    const paymentLogs = [...selectedInvoiceForPayment.paymentLogs];
    const logDate = "12 Aug 2026";
    if (paymentCollectAmt > 0) {
      paymentLogs.push({ method: paymentMethod, amount: paymentCollectAmt, date: logDate });
    }

    const totalPaidAmount = selectedInvoiceForPayment.paidAmount + collectedTotal;
    let finalStatus: InvoiceItem["status"] = "Unpaid";
    if (totalPaidAmount >= finalInvoiceTotal) {
      finalStatus = "Paid";
    } else if (totalPaidAmount > 0) {
      finalStatus = "Partially Paid";
    }

    const calculatedDiscountAmt = calculateInvoiceDiscountAmount();
    const calculatedSubtotal = calculateInvoiceSubtotal();
    const calculatedDiscountPct = calculatedSubtotal > 0 ? Math.round((calculatedDiscountAmt / calculatedSubtotal) * 100) : 0;

    // Update in invoices state
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === selectedInvoiceForPayment.id) {
          return {
            ...inv,
            items: [...inv.items, ...payCustomItems],
            discount: calculatedDiscountPct,
            discountType: payDiscountType,
            discountValue: payDiscountValue,
            tax: 0,
            subtotal: calculatedSubtotal,
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
      discount: calculatedDiscountPct,
      discountType: payDiscountType,
      discountValue: payDiscountValue,
      tax: 0,
      subtotal: calculatedSubtotal,
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

  const calculateInvoiceDiscountAmount = () => {
    const sub = calculateInvoiceSubtotal();
    if (payDiscountType === "percentage") {
      return Math.round(sub * (payDiscountValue / 100));
    }
    return Math.min(sub, payDiscountValue);
  };

  const calculateInvoiceSubtotal = () => {
    if (!selectedInvoiceForPayment) return 0;
    const baseSub = selectedInvoiceForPayment.items.reduce((sum, item) => sum + item.amount, 0);
    const customSub = payCustomItems.reduce((sum, item) => sum + item.amount, 0);
    return baseSub + customSub;
  };

  const calculateInvoiceTotal = () => {
    const sub = calculateInvoiceSubtotal();
    const discountAmt = calculateInvoiceDiscountAmount();
    return sub - discountAmt;
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
    setQuickEmail("");
    setQuickAddress("");
    setQuickBloodGroup("A+");
    setQuickPatientType("New");
    setQuickNotes("");
  };

  const registerPatient = (patientData: {
    name: string;
    phone: string;
    age: number;
    gender: "Male" | "Female";
    address: string;
    medicalNotes: string;
    email?: string;
    bloodGroup?: string;
    patientType?: "New" | "Returning";
    notes?: string[];
  }) => {
    const trimmedName = patientData.name.trim();
    const trimmedPhone = patientData.phone.trim();

    // 1. Validation
    if (!trimmedName) {
      showToast("Patient name is required.", "error");
      return false;
    }
    if (!trimmedPhone) {
      showToast("Mobile number is required.", "error");
      return false;
    }

    // Generate unique Patient ID automatically
    const patientId = `DS-${1000 + patients.length + 1}`;

    // 2. Check for duplicate mobile number
    const duplicatePhone = patients.some(p => p.phone.trim() === trimmedPhone);
    if (duplicatePhone) {
      showToast(`A patient with mobile number ${trimmedPhone} is already registered.`, "error");
      return false;
    }

    // 3. Check for duplicate Patient ID
    const duplicateId = patients.some(p => p.id === patientId);
    if (duplicateId) {
      showToast(`Patient ID ${patientId} already exists.`, "error");
      return false;
    }

    const newPat: Patient = {
      id: patientId,
      name: trimmedName,
      phone: trimmedPhone,
      age: patientData.age,
      gender: patientData.gender,
      address: patientData.address || "Bengaluru",
      visit: "12 Aug 2026",
      medicalNotes: patientData.medicalNotes || "None",
      balance: "₹0",
      status: "Active",
      dentalChart: {},
      prescriptions: [],
      files: [],
      notes: patientData.notes || [],
      email: patientData.email,
      bloodGroup: patientData.bloodGroup,
      patientType: patientData.patientType
    };

    setPatients(prev => [newPat, ...prev]);
    pushActivity("Register", `Registered patient ${trimmedName} (${patientId}).`);

    // Add notification
    setNotifications(prev => [
      {
        id: Date.now() + Math.floor(Math.random() * 100000),
        msg: `New Patient ${trimmedName} registered successfully.`,
        unread: true
      },
      ...prev
    ]);

    showToast("Patient registered successfully.", "success");
    return true;
  };

  const handleSavePatientQuick = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${quickFirstName.trim()} ${quickLastName.trim()}`;
    const saved = registerPatient({
      name: fullName,
      phone: quickMobile,
      age: quickAge,
      gender: quickGender,
      address: quickAddress.trim() || quickLocation,
      medicalNotes: "None",
      email: quickEmail.trim() || undefined,
      bloodGroup: quickBloodGroup,
      patientType: quickPatientType,
      notes: quickNotes.trim() ? [quickNotes.trim()] : []
    });
    if (saved) {
      handleClearPatientForm();
      // Keep focus on first field for next registration
      setTimeout(() => {
        const firstField = document.getElementById("qMobile");
        if (firstField) firstField.focus();
      }, 50);
    }
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
      const tot = sub;
      
      const newInvoice: InvoiceItem = {
        id: invoiceNum,
        patientId: app.patientId,
        patientName: app.patientName,
        doctor: app.doctor,
        treatment: app.treatment,
        items: invoiceItems,
        discount: 0,
        tax: 0,
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
        setPayTaxPercent(0);
        setPayCustomItems([]);
      } else {
        // Create quick invoice if not already created
        const invoiceNum = `INV-${1000 + invoices.length + 1}`;
        const treatmentCost = TREATMENT_PRICES[app.treatment] || 500;
        const invoiceItems = [{ description: `${app.treatment} Fee`, amount: treatmentCost }];
        const sub = treatmentCost;
        const tot = sub;
        
        const newInvoice: InvoiceItem = {
          id: invoiceNum,
          patientId: app.patientId,
          patientName: app.patientName,
          doctor: app.doctor,
          treatment: app.treatment,
          items: invoiceItems,
          discount: 0,
          tax: 0,
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
        setPayTaxPercent(0);
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
    <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <span className="font-semibold text-[18px] text-slate-800 dark:text-white">Today's Schedule</span>
        <span className="text-[12px] bg-slate-100 text-slate-655 px-2 py-0.5 rounded-full font-normal">12 Aug 2026</span>
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

            <div className="flex-grow py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100/50 dark:border-slate-900/40 last:border-0 hover:bg-slate-50/10 transition-all duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-semibold text-slate-900 dark:text-white">{app.patientName}</span>
                  <span className="text-[14px] font-normal text-slate-450">• {app.treatment}</span>
                </div>
                {(() => {
                  const patPhone = patients.find(p => p.id === app.patientId)?.phone || "";
                  return (
                    <div className="text-[14px] font-normal text-slate-500 dark:text-slate-400">
                      <span>Doctor: <span className="font-normal text-slate-700 dark:text-slate-350">{app.doctor}</span></span>
                      <span className="mx-2">•</span>
                      <span>Time: <span className="text-[16px] font-medium text-slate-700 dark:text-slate-305">{app.time}</span></span>
                      {patPhone && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Phone: <span className="font-normal text-slate-655">{patPhone}</span></span>
                        </>
                      )}
                    </div>
                  );
                })()}
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
            <div key={item.id} className="py-2.5 flex items-center justify-between text-xs font-semibold border-b border-slate-100/50 dark:border-slate-900/40 last:border-0">
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
    const CALENDAR_DAYS = Array.from({ length: 7 }, (_, idx) => {
      const dateObj = new Date(currentWeekStart.getTime());
      dateObj.setDate(currentWeekStart.getDate() + idx);
      
      const dayNum = dateObj.getDate();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthStr = monthNames[dateObj.getMonth()];
      const yearStr = dateObj.getFullYear();
      
      const dateString = `${dayNum < 10 ? '0' + dayNum : dayNum} ${monthStr} ${yearStr}`;
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const fullDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const name = dayNames[dateObj.getDay()];
      const fullName = fullDayNames[dateObj.getDay()];
      return {
        name,
        fullName,
        date: dateString,
        isToday: dateString === "12 Aug 2026"
      };
    });

    const firstDay = new Date(currentWeekStart.getTime());
    const lastDay = new Date(currentWeekStart.getTime());
    lastDay.setDate(firstDay.getDate() + 6);
    
    const firstMonthStr = firstDay.toLocaleDateString("en-US", { month: "short" });
    const lastMonthStr = lastDay.toLocaleDateString("en-US", { month: "short" });
    const firstYear = firstDay.getFullYear();
    const lastYear = lastDay.getFullYear();
    
    let monthYearDisplay = "";
    if (firstMonthStr === lastMonthStr && firstYear === lastYear) {
      const fullMonth = firstDay.toLocaleDateString("en-US", { month: "long" });
      monthYearDisplay = `${fullMonth} ${firstYear}`;
    } else if (firstYear === lastYear) {
      monthYearDisplay = `${firstMonthStr} / ${lastMonthStr} ${firstYear}`;
    } else {
      monthYearDisplay = `${firstMonthStr} ${firstYear} / ${lastMonthStr} ${lastYear}`;
    }

    const handlePrevWeek = () => {
      const newStart = new Date(currentWeekStart.getTime());
      newStart.setDate(currentWeekStart.getDate() - 7);
      setCurrentWeekStart(newStart);
    };

    const handleNextWeek = () => {
      const newStart = new Date(currentWeekStart.getTime());
      newStart.setDate(currentWeekStart.getDate() + 7);
      setCurrentWeekStart(newStart);
    };

    const MORNING_SLOTS = [
      "09:00 AM", "09:15 AM", "09:30 AM", "09:45 AM",
      "10:00 AM", "10:15 AM", "10:30 AM", "10:45 AM",
      "11:00 AM", "11:15 AM", "11:30 AM", "11:45 AM",
      "12:00 PM", "12:15 PM", "12:30 PM", "12:45 PM"
    ];

    const EVENING_SLOTS = [
      "04:30 PM", "04:45 PM",
      "05:00 PM", "05:15 PM", "05:30 PM", "05:45 PM",
      "06:00 PM", "06:15 PM", "06:30 PM", "06:45 PM",
      "07:00 PM", "07:15 PM", "07:30 PM", "07:45 PM",
      "08:00 PM", "08:15 PM"
    ];

    const formatTo24h = (timeStr: string) => {
      const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
      if (!match) return timeStr;
      let [_, h, m, p] = match;
      let hr = parseInt(h, 10);
      if (p.toUpperCase() === "PM" && hr < 12) hr += 12;
      if (p.toUpperCase() === "AM" && hr === 12) hr = 0;
      return `${String(hr).padStart(2, '0')}:${m}`;
    };

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

    // 15-Day Performance Tracker Data
    const performanceData = [
      { date: "29 Jul", fullDate: "Jul 29, 2026", consultations: 12, appointments: 8, newPatients: 2 },
      { date: "30 Jul", fullDate: "Jul 30, 2026", consultations: 15, appointments: 10, newPatients: 3 },
      { date: "31 Jul", fullDate: "Jul 31, 2026", consultations: 18, appointments: 12, newPatients: 4 },
      { date: "1 Aug", fullDate: "Aug 1, 2026", consultations: 14, appointments: 11, newPatients: 3 },
      { date: "2 Aug", fullDate: "Aug 2, 2026", consultations: 8, appointments: 6, newPatients: 1 },
      { date: "3 Aug", fullDate: "Aug 3, 2026", consultations: 10, appointments: 8, newPatients: 2 },
      { date: "4 Aug", fullDate: "Aug 4, 2026", consultations: 16, appointments: 11, newPatients: 4 },
      { date: "5 Aug", fullDate: "Aug 5, 2026", consultations: 20, appointments: 14, newPatients: 5 },
      { date: "6 Aug", fullDate: "Aug 6, 2026", consultations: 15, appointments: 12, newPatients: 3 },
      { date: "7 Aug", fullDate: "Aug 7, 2026", consultations: 12, appointments: 9, newPatients: 2 },
      { date: "8 Aug", fullDate: "Aug 8, 2026", consultations: 9, appointments: 7, newPatients: 1 },
      { date: "9 Aug", fullDate: "Aug 9, 2026", consultations: 14, appointments: 10, newPatients: 3 },
      { date: "10 Aug", fullDate: "Aug 10, 2026", consultations: 18, appointments: 13, newPatients: 4 },
      { date: "11 Aug", fullDate: "Aug 11, 2026", consultations: 22, appointments: 16, newPatients: 6 },
      { date: "12 Aug", fullDate: "Aug 12, 2026", consultations: 19, appointments: 14, newPatients: 5 }
    ];

    const consultationsPoints = performanceData.map((d, i) => ({ x: 40 + i * 67.14, y: 210 - d.consultations * 7.6 }));
    const appointmentsPoints = performanceData.map((d, i) => ({ x: 40 + i * 67.14, y: 210 - d.appointments * 7.6 }));
    const newPatientsPoints = performanceData.map((d, i) => ({ x: 40 + i * 67.14, y: 210 - d.newPatients * 7.6 }));

    const getBezierPath = (pts: { x: number; y: number }[]) => {
      if (pts.length === 0) return "";
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const cpX1 = p0.x + (p1.x - p0.x) / 3;
        const cpY1 = p0.y;
        const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
        const cpY2 = p1.y;
        d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
      }
      return d;
    };

    const bezierConsultations = getBezierPath(consultationsPoints);
    const bezierAppointments = getBezierPath(appointmentsPoints);
    const bezierNewPatients = getBezierPath(newPatientsPoints);

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
        tax: 0,
        subtotal: 500,
        total: 500,
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
      setPayTaxPercent(0);
      setPayCustomItems([]);
      pushActivity("Billing", `Invoice ${invoiceNum} generated for ${pat.name}.`);
    };

    return (
      <div className="dashboard-container space-y-4 animate-fadeIn text-slate-700">
        {/* TOP ROW: Weekly Appointment Calendar (LEFT) + Today's Schedule (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* SECTION 1 - Weekly Appointment Calendar */}
          <div className="calendar-card lg:col-span-8 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3 gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-semibold text-[18px] text-slate-900 dark:text-white">Weekly Appointment Calendar</span>
                <span className="bg-blue-50 text-blue-755 dark:bg-blue-955/40 dark:text-blue-400 px-2.5 py-0.5 rounded-full text-[13px] font-semibold">
                  Total Appointments Today: {kpiCounts.todayAppointments}
                </span>
              </div>
              <div className="text-xs font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg">
                {monthYearDisplay}
              </div>
            </div>
   
            {/* Day Selector Navigation Row */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <button
                type="button"
                onClick={handlePrevWeek}
                className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-455 flex items-center justify-center transition-all cursor-pointer select-none active:scale-90 shrink-0"
                title="Previous Week"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex-1 grid grid-cols-7 gap-2">
                {CALENDAR_DAYS.map((d) => {
                  const isActive = selectedCalendarDay === d.date;
                  const hasAppts = appointments.some(a => a.date === d.date && a.status !== "Cancelled");
                  return (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => setSelectedCalendarDay(d.date)}
                      className={`day-btn flex flex-col items-center justify-center py-2.5 rounded-xl transition-all border outline-none cursor-pointer ${
                        isActive
                          ? "bg-blue-600 border-blue-600 text-white shadow-sm scale-105"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                      }`}
                    >
                      <span className="text-[12px] font-normal uppercase tracking-wider opacity-70 mb-0.5">{d.name}</span>
                      <span className="text-[14px] font-medium flex items-center gap-1 leading-none">
                        {parseInt(d.date.split(" ")[0])}
                      </span>
                      {hasAppts && (
                        <span className={`h-1.5 w-1.5 rounded-full mt-1.5 ${isActive ? "bg-white" : "bg-blue-600"}`} />
                      )}
                    </button>
                  );
                })}
              </div>
              
              <button
                type="button"
                onClick={handleNextWeek}
                className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-455 flex items-center justify-center transition-all cursor-pointer select-none active:scale-90 shrink-0"
                title="Next Week"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Split Sessions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 relative">
              {/* Vertical Column Separator Line */}
              <div className="hidden md:block absolute left-1/2 top-1 bottom-1 w-px bg-slate-100 dark:bg-slate-800/80 -translate-x-1/2 pointer-events-none" />

              {/* MORNING SLOTS */}
              <div className="space-y-3 md:pr-2">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Sun className="h-4 w-4 text-slate-700 dark:text-slate-300 shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white text-sm">Morning Sessions</span>
                  <span className="text-[11px] text-slate-400 font-medium ml-auto">09:00 AM - 01:00 PM</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MORNING_SLOTS.map((time) => {
                    const appt = getApptForSlot(selectedCalendarDay, time);
                    const isBlocked = blockedSlots[`${selectedCalendarDay}_${time}`];
                    
                    let statusText = "Open Slot";
                    let statusBadge = "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400";
                    let btnStyle = "border-slate-200 hover:border-blue-300 dark:border-slate-800 hover:bg-blue-50/20";

                    if (appt) {
                      statusText = appt.patientName;
                      if (appt.status === "Scheduled") {
                        statusBadge = "bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-bold";
                        btnStyle = "border-blue-300 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/20";
                      } else if (appt.status === "Checked In" || appt.status === "Waiting") {
                        statusBadge = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300";
                        btnStyle = "border-emerald-300 bg-emerald-50/30 dark:border-emerald-900 dark:bg-emerald-955/20";
                      } else if (appt.status === "In Procedure") {
                        statusBadge = "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300";
                        btnStyle = "border-orange-300 bg-orange-50/30 dark:border-orange-900 dark:bg-orange-955/20";
                      } else if (appt.status === "Completed") {
                        statusBadge = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
                        btnStyle = "border-slate-200 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/30";
                      }
                    } else if (isBlocked) {
                      statusText = "Blocked";
                      statusBadge = "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
                      btnStyle = "border-slate-200 bg-slate-100/50 dark:border-slate-800 dark:bg-slate-900/50 opacity-60";
                    }

                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          setHoveredSlotPopover(null);
                          setSlotPatientId("");
                          setSelectedSlotData({ date: selectedCalendarDay, time, appointment: appt });
                        }}
                        onMouseEnter={(e) => {
                          if (appt) {
                            handleSlotMouseEnter(e.currentTarget.getBoundingClientRect(), appt);
                          }
                        }}
                        onMouseLeave={() => {
                          if (appt) {
                            handleSlotMouseLeave();
                          }
                        }}
                        className={`slot-btn ${!appt && !isBlocked ? "slot-btn-empty" : ""} p-2.5 rounded-xl border text-[10px] transition-all ${
                          appt 
                            ? "bg-white shadow-xs border-slate-200/80 dark:bg-slate-955 dark:border-slate-800 flex flex-col justify-between items-start text-left" 
                            : isBlocked
                              ? "bg-slate-100/30 dark:bg-slate-900/20 border-slate-100 dark:border-slate-900 flex flex-col justify-between items-start text-left"
                              : "bg-slate-50/20 border-dashed border-slate-200/60 dark:bg-slate-900/10 dark:border-slate-800/40 opacity-75 flex items-center justify-center text-center"
                        } h-20 ${btnStyle}`}
                      >
                        {appt ? (
                          <>
                            <span className="slot-time font-bold">{time.replace(" AM", "")}</span>
                            <div className="w-full mt-1">
                              <span className={`slot-badge px-1.5 py-0.5 rounded text-[8px] font-bold inline-block uppercase tracking-wider ${statusBadge}`}>
                                {appt?.status === "In Consultation" ? "Consult" : appt?.status === "In Procedure" ? "Procedure" : appt?.status}
                              </span>
                            </div>
                          </>
                        ) : isBlocked ? (
                          <>
                            <span className="slot-time font-bold">{time.replace(" AM", "")}</span>
                            <span className="slot-open-label text-[9px] font-bold flex items-center gap-1 mt-1 text-slate-400">
                              🔒 Blocked
                            </span>
                          </>
                        ) : (
                          <span className="slot-time">{formatTo24h(time)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* EVENING SLOTS */}
              <div className="space-y-3 md:pl-2">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300 shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white text-sm">Evening Sessions</span>
                  <span className="text-[11px] text-slate-400 font-medium ml-auto">04:30 PM - 08:30 PM</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {EVENING_SLOTS.map((time) => {
                    const appt = getApptForSlot(selectedCalendarDay, time);
                    const isBlocked = blockedSlots[`${selectedCalendarDay}_${time}`];
                    
                    let statusText = "Open Slot";
                    let statusBadge = "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400";
                    let btnStyle = "border-slate-200 hover:border-blue-300 dark:border-slate-800 hover:bg-blue-50/20";

                    if (appt) {
                      statusText = appt.patientName;
                      if (appt.status === "Scheduled") {
                        statusBadge = "bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-bold";
                        btnStyle = "border-blue-300 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-955/20";
                      } else if (appt.status === "Checked In" || appt.status === "Waiting") {
                        statusBadge = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300";
                        btnStyle = "border-emerald-300 bg-emerald-50/30 dark:border-emerald-900 dark:bg-emerald-955/20";
                      } else if (appt.status === "In Procedure") {
                        statusBadge = "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300";
                        btnStyle = "border-orange-300 bg-orange-50/30 dark:border-orange-900 dark:bg-orange-955/20";
                      } else if (appt.status === "Completed") {
                        statusBadge = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
                        btnStyle = "border-slate-200 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/30";
                      }
                    } else if (isBlocked) {
                      statusText = "Blocked";
                      statusBadge = "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
                      btnStyle = "border-slate-200 bg-slate-100/50 dark:border-slate-800 dark:bg-slate-900/50 opacity-60";
                    }

                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          setHoveredSlotPopover(null);
                          setSlotPatientId("");
                          setSelectedSlotData({ date: selectedCalendarDay, time, appointment: appt });
                        }}
                        onMouseEnter={(e) => {
                          if (appt) {
                            handleSlotMouseEnter(e.currentTarget.getBoundingClientRect(), appt);
                          }
                        }}
                        onMouseLeave={() => {
                          if (appt) {
                            handleSlotMouseLeave();
                          }
                        }}
                        className={`slot-btn ${!appt && !isBlocked ? "slot-btn-empty" : ""} p-2.5 rounded-xl border text-[10px] transition-all ${
                          appt 
                            ? "bg-white shadow-xs border-slate-200/80 dark:bg-slate-955 dark:border-slate-800 flex flex-col justify-between items-start text-left" 
                            : isBlocked
                              ? "bg-slate-100/30 dark:bg-slate-900/20 border-slate-100 dark:border-slate-900 flex flex-col justify-between items-start text-left"
                              : "bg-slate-50/20 border-dashed border-slate-200/60 dark:bg-slate-900/10 dark:border-slate-800/40 opacity-75 flex items-center justify-center text-center"
                        } h-20 ${btnStyle}`}
                      >
                        {appt ? (
                          <>
                            <span className="slot-time font-bold">{time.replace(" PM", "")}</span>
                            <div className="w-full mt-1">
                              <span className={`slot-badge px-1.5 py-0.5 rounded text-[8px] font-bold inline-block uppercase tracking-wider ${statusBadge}`}>
                                {appt?.status === "In Consultation" ? "Consult" : appt?.status === "In Procedure" ? "Procedure" : appt?.status}
                              </span>
                            </div>
                          </>
                        ) : isBlocked ? (
                          <>
                            <span className="slot-time font-bold">{time.replace(" PM", "")}</span>
                            <span className="slot-open-label text-[9px] font-bold flex items-center gap-1 mt-1 text-slate-400">
                              🔒 Blocked
                            </span>
                          </>
                        ) : (
                          <span className="slot-time">{formatTo24h(time)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4 - Today's Schedule (RIGHT) */}
          <div className="list-card lg:col-span-4 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col h-[530px]">
            <div className="flex justify-between items-center mb-3 shrink-0">
              <span className="font-semibold text-[18px] block">Today's Schedule</span>
              <span className="text-[12px] bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full font-bold">
                {todayApptsList.length} {todayApptsList.length === 1 ? "Appointment" : "Appointments"}
              </span>
            </div>

            <div className="flex-grow overflow-y-auto pr-1 scrollbar-thin flex flex-col">
              {todayApptsList.length > 0 ? (
                <div className="space-y-3 flex-grow">
                  {todayApptsList.map((app) => {
                    const patientPhone = patients.find((p) => p.id === app.patientId)?.phone || "+91 99000 11000";

                    return (
                      <div
                        key={app.id}
                        className="p-3.5 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/20 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-all shadow-2xs space-y-2 flex flex-col justify-between"
                      >
                        {/* First Line: Patient Name & Appt Time */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center min-w-0 pr-2">
                            {/* Status Indicator Dot */}
                            {app.status === "Scheduled" && <span className="h-2 w-2 rounded-full bg-blue-500 mr-2 shrink-0" title="Scheduled" />}
                            {(app.status === "Checked In" || app.status === "Waiting") && <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 shrink-0" title="Checked In" />}
                            {app.status === "In Procedure" && <span className="h-2 w-2 rounded-full bg-orange-500 mr-2 shrink-0 animate-pulse" title="In Procedure" />}
                            {app.status === "Completed" && <span className="h-2 w-2 rounded-full bg-slate-400 mr-2 shrink-0" title="Completed" />}
                            <span className="font-semibold text-[16px] text-slate-800 dark:text-slate-200 truncate leading-none">{app.patientName}</span>
                          </div>
                          <span className="text-[13px] font-semibold text-slate-650 dark:text-slate-400 shrink-0 leading-none">{app.time}</span>
                        </div>

                        {/* Second Line: Doctor Name */}
                        <p className="text-[12px] text-slate-455 dark:text-slate-400 font-normal leading-none pl-4">
                          {app.doctor}
                        </p>

                        {/* Third Line: Treatment */}
                        <p className="text-[12px] text-slate-455 dark:text-slate-400 font-normal leading-none pl-4">
                          {app.treatment}
                        </p>

                        {/* Fourth Line: Phone Number */}
                        <p className="text-[12px] text-slate-455 dark:text-slate-400 font-normal leading-none pl-4">
                          {patientPhone}
                        </p>

                        {/* Bottom Row: Actions */}
                        <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100/60 dark:border-slate-800/65">
                          {/* ✓ Check In / Action Button */}
                          {app.status === "Scheduled" ? (
                            <button
                              type="button"
                              onClick={() => handleApptCheckIn(app.id)}
                              className="flex-grow h-[34px] rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11.5px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              ✓ Check In
                            </button>
                          ) : app.status === "Checked In" || app.status === "Waiting" ? (
                            <button
                              type="button"
                              onClick={() => handleApptStartProcedure(app.id)}
                              className="flex-grow h-[34px] rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11.5px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              ✓ Start
                            </button>
                          ) : app.status === "In Procedure" ? (
                            <button
                              type="button"
                              onClick={() => handleApptCompleteProcedure(app.id)}
                              className="flex-grow h-[34px] rounded-lg bg-orange-500 hover:bg-orange-455 text-white font-medium text-[11.5px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              ✓ Complete
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="flex-grow h-[34px] rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-400 font-medium text-[11.5px] flex items-center justify-center gap-1 cursor-not-allowed"
                            >
                              ✓ Completed
                            </button>
                          )}

                          {/* Reschedule Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const newDate = prompt("Enter new date (e.g. 12 Aug 2026):", app.date);
                              const newTime = prompt("Enter new time (e.g. 09:30 AM):", app.time);
                              if (newDate && newTime) {
                                setAppointments(prev => prev.map(a => a.id === app.id ? { ...a, date: newDate, time: newTime } : a));
                                pushActivity("Appointment", `Rescheduled ${app.patientName} to ${newDate} at ${newTime}.`);
                                showToast("Appointment rescheduled.", "success");
                              }
                            }}
                            className="px-3.5 h-[34px] rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-900 font-medium text-[11.5px] transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
                          >
                            Reschedule
                          </button>

                          {/* Billing Icon Button */}
                          <button
                            type="button"
                            onClick={() => handleApptGenerateBill(app.id)}
                            className="h-[34px] w-[34px] rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-center transition-colors shrink-0 cursor-pointer duration-200"
                            title="Generate Bill"
                          >
                            <Receipt className="h-[18px] w-[18px]" />
                          </button>

                          {/* WhatsApp Communication Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const whatsappNumber = "918639778188";
                              const message = `Hello ${app.patientName},

This is a reminder from Apex Clinic regarding your dental appointment.

🦷 Treatment: ${app.treatment}
📅 Date: ${app.date}
🕒 Time: ${app.time}

Please arrive 10 minutes before your scheduled appointment.

If you need to reschedule, please reply to this message.

Thank you,
Apex Clinic`;
                              const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
                              window.open(whatsappUrl, "_blank", "noopener,noreferrer");
                            }}
                            className="h-[34px] w-[34px] rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-355 hover:bg-[#25D366]/10 hover:text-[#25D366] hover:border-[#25D366]/20 flex items-center justify-center transition-colors shrink-0 cursor-pointer duration-200"
                            title="WhatsApp Communication"
                          >
                            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" xmlns="http://www.w3.org/2000/svg">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.426-.003 9.84-4.42 9.843-9.848.002-2.63-1.02-5.101-2.879-6.963-1.859-1.862-4.332-2.887-6.965-2.888-5.432 0-9.85 4.417-9.853 9.848-.001 1.554.385 3.078 1.121 4.426l-.995 3.636 3.728-.977zm11.391-7.054c-.302-.152-1.792-.884-2.07-.984-.277-.101-.48-.152-.68.152-.2.302-.777.983-.952 1.185-.176.202-.351.227-.653.076-.302-.152-1.275-.47-2.428-1.499-.896-.8-1.5-.189-1.782-.416-.282-.227-.302-.352-.453-.503-.151-.152-.227-.253-.34-.48-.113-.227-.057-.428.028-.58.085-.152.68-.783.82-.983.14-.202.188-.34.283-.567.094-.227.047-.428-.028-.58-.076-.152-.68-1.638-.932-2.247-.246-.59-.496-.51-.68-.518-.176-.008-.377-.01-.58-.01-.202 0-.53.076-.807.38-.277.302-1.057 1.033-1.057 2.52 0 1.488 1.082 2.923 1.232 3.125.151.202 2.13 3.253 5.16 4.561.72.311 1.282.497 1.72.637.723.23 1.381.197 1.901.12.58-.087 1.792-.733 2.046-1.439.253-.706.253-1.312.176-1.439-.076-.126-.277-.202-.58-.352z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xs text-slate-400 py-8 text-center">No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Patient Registration (LEFT) + Recently Added Patients (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SECTION 2 - Add Patient Panel (LEFT) */}
          <div className="form-card lg:col-span-8 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col h-[530px]">
            <span className="font-semibold text-[18px] block mb-[22px] shrink-0">Patient Registration</span>
            
            <form onSubmit={handleSavePatientQuick} className="flex-grow flex flex-col justify-between overflow-hidden">
              {/* Form Content Wrapper */}
              <div className="flex-1 overflow-y-auto pr-1.5 scrollbar-thin space-y-4 pb-2.5">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="qPatID" className="form-label-custom">Patient ID</Label>
                    <Input id="qPatID" value={`DS-${1000 + patients.length + 1}`} disabled className="form-field-custom bg-slate-50 dark:bg-slate-900 opacity-60 cursor-not-allowed font-bold" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="qMobile" className="form-label-custom">Mobile Number</Label>
                    <Input id="qMobile" placeholder="e.g. +91 99000 11000" value={quickMobile} onChange={e => setQuickMobile(e.target.value)} required className="form-field-custom" />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="qFirstName" className="form-label-custom">First Name</Label>
                    <Input id="qFirstName" placeholder="e.g. Rahul" value={quickFirstName} onChange={e => setQuickFirstName(e.target.value)} required className="form-field-custom" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="qLastName" className="form-label-custom">Last Name</Label>
                    <Input id="qLastName" placeholder="e.g. Verma" value={quickLastName} onChange={e => setQuickLastName(e.target.value)} required className="form-field-custom" />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-2 gap-4">
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

                {/* Row 4 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="qLocation" className="form-label-custom">Location</Label>
                    <Input id="qLocation" placeholder="e.g. Jayanagar" value={quickLocation} onChange={e => setQuickLocation(e.target.value)} className="form-field-custom" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="qBloodGroup" className="form-label-custom">Blood Group (Optional)</Label>
                    <select
                      id="qBloodGroup"
                      className="form-field-custom flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs focus:outline-none dark:bg-slate-900 dark:border-slate-800"
                      value={quickBloodGroup}
                      onChange={e => setQuickBloodGroup(e.target.value)}
                    >
                      <option value="">-- Choose Blood Group --</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                {/* Row 5 - Full Width Email */}
                <div className="space-y-1">
                  <Label htmlFor="qEmail" className="form-label-custom">Email (Optional)</Label>
                  <Input id="qEmail" type="email" placeholder="e.g. patient@example.com" value={quickEmail} onChange={e => setQuickEmail(e.target.value)} className="form-field-custom" />
                </div>

                {/* Row 6 - Full Width Multiline Notes */}
                <div className="space-y-1">
                  <Label htmlFor="qNotes" className="form-label-custom">Notes / Remarks (Optional)</Label>
                  <textarea
                    id="qNotes"
                    rows={2}
                    placeholder="Add clinical observations, allergies, or reception notes..."
                    value={quickNotes}
                    onChange={e => setQuickNotes(e.target.value)}
                    className="form-field-custom flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-slate-200 resize-none"
                  />
                </div>
              </div>

              {/* Fixed Bottom Actions Footer */}
              <div className="flex gap-2.5 pt-3 mt-1 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <Button type="submit" className="flex-1 h-9 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-[13px] shadow-xs cursor-pointer">
                  Save & Register
                </Button>
                <Button 
                  type="button" 
                  onClick={() => {
                    setQuickFirstName("");
                    setQuickLastName("");
                    setQuickMobile("");
                    setQuickAge(30);
                    setQuickGender("Male");
                    setQuickLocation("");
                    setQuickEmail("");
                    setQuickBloodGroup("");
                    setQuickNotes("");
                  }} 
                  className="h-9 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[13px] transition-colors cursor-pointer"
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </div>

          {/* SECTION 3 - Recently Added Patients (RIGHT) */}
          <div className="list-card lg:col-span-4 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col h-[530px]">
            {/* Title Row */}
            <div className="flex justify-between items-center mb-3 shrink-0">
              <span className="font-semibold text-[18px] block">Recently Added Patients</span>
              <span className="text-[12px] bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full font-bold">
                Total: {patients.length}
              </span>
            </div>

            {/* Filter & Sort Control Toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-3.5 shrink-0">
              {/* Search Field */}
              <div className="sm:col-span-4 relative">
                <Input
                  type="text"
                  placeholder="Search"
                  value={patientSearchQuery}
                  onChange={e => setPatientSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-2 text-[13px] font-medium border-slate-100 bg-white dark:bg-slate-900 dark:border-slate-900/60"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Gender Filter */}
              <div className="sm:col-span-4 relative">
                <select
                  value={patientFilterGender}
                  onChange={e => setPatientFilterGender(e.target.value)}
                  className="h-8 w-full appearance-none rounded-lg border border-slate-100 bg-white pl-2.5 pr-7 text-[13px] font-medium focus:outline-none dark:bg-slate-900 dark:border-slate-900/60 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <option value="All">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none text-slate-400" />
              </div>

              {/* Sort By */}
              <div className="sm:col-span-4 relative">
                <select
                  value={patientSortBy}
                  onChange={e => setPatientSortBy(e.target.value)}
                  className="h-8 w-full appearance-none rounded-lg border border-slate-100 bg-white pl-2.5 pr-7 text-[13px] font-medium focus:outline-none dark:bg-slate-900 dark:border-slate-900/60 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <option value="Name-ASC">Name (A-Z)</option>
                  <option value="Name-DESC">Name (Z-A)</option>
                  <option value="ID-DESC">ID (Desc)</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none text-slate-400" />
              </div>
            </div>

            {/* Patient List container */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col">
              {displayedPatients.length > 0 ? (
                <div className="space-y-2.5 flex-1">
                  {displayedPatients.map((pat) => (
                    <div key={pat.id} className="patient-row py-2.5 flex justify-between items-center transition-all group border-b border-slate-100/50 dark:border-slate-900/40 last:border-0">
                      <div className="min-w-0 flex-1 cursor-pointer" onClick={() => { setSelectedPatientId(pat.id); setActiveTab("Patients"); }}>
                        <span className="patient-name-txt text-[16px] font-semibold text-slate-808 dark:text-slate-200 hover:text-blue-600 block truncate">{pat.name}</span>
                        <p className="patient-sub-txt text-[12px] font-normal text-slate-455 mt-0.5">{pat.id} • {pat.phone}</p>
                      </div>
                      {/* Action Icons */}
                      <div className="flex gap-1.5 ml-2">
                        <button
                          type="button"
                          title="Book Appointment"
                          onClick={() => {
                            setSlotPatientId(pat.id);
                            setSelectedSlotData({ date: selectedCalendarDay, time: "09:00 AM" });
                          }}
                          className="h-6 w-6 rounded-md bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-blue-650 hover:bg-blue-50/50 dark:hover:bg-blue-955/30 transition-colors"
                        >
                          <CalendarDays className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Dental Chart"
                          onClick={() => {
                            setSelectedPatientId(pat.id);
                            setProfileSubTab("Dental Chart");
                            setActiveTab("Patients");
                          }}
                          className="h-6 w-6 rounded-md bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-purple-605 hover:bg-purple-50/50 dark:hover:bg-purple-955/30"
                        >
                          <Activity className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Generate Bill"
                          onClick={() => handleQuickGenerateBill(pat)}
                          className="h-6 w-6 rounded-md bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-emerald-605 hover:bg-emerald-50/50 dark:hover:bg-emerald-955/30"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xs text-slate-400 py-6 text-center">No patients found</p>
                </div>
              )}
            </div>

            {/* Load More Button */}
            {filteredPatients.length > patientVisibleCount && (
              <button
                type="button"
                onClick={() => setPatientVisibleCount(prev => prev + 5)}
                className="w-full h-8 mt-3 rounded-lg border border-dashed border-slate-300 text-slate-455 hover:bg-slate-50 text-[14px] font-bold shrink-0"
              >
                Load More Patients
              </button>
            )}
          </div>
        </div>

        {/* 15-DAY PERFORMANCE TRACKER */}
        <div className="mt-4">
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col h-[340px] relative">
            {/* Header */}
            <div className="flex justify-between items-start mb-3 shrink-0">
              <div>
                <span className="font-semibold text-[18px] block">15-Day Performance Tracker</span>
                <span className="text-[12px] text-slate-400 dark:text-slate-550 mt-0.5 block">Clinic activity over the last 15 days</span>
              </div>
              <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Last 15 Days
              </span>
            </div>

            {/* Statistics Row */}
            <div className="flex flex-wrap gap-2.5 mb-3.5 shrink-0">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 px-3 py-1 rounded-full text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="text-slate-455">Total Consultations:</span>
                <span className="font-bold text-slate-808 dark:text-slate-200">228</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 px-3 py-1 rounded-full text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-slate-455">Total Appointments:</span>
                <span className="font-bold text-slate-808 dark:text-slate-200">169</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 px-3 py-1 rounded-full text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                <span className="text-slate-455">New Patients:</span>
                <span className="font-bold text-slate-808 dark:text-slate-200">57</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 px-3 py-1 rounded-full text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Appointment Growth:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">+14.8%</span>
              </div>
            </div>

            {/* Chart Container */}
            <div className="flex-1 min-h-0 flex flex-col justify-between relative">
              {/* Inline Legend */}
              <div className="flex justify-end gap-4 text-[11px] mb-2 shrink-0 pr-2">
                <div className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="text-slate-455 dark:text-slate-350 font-medium">Consultations</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-455 dark:text-slate-350 font-medium">Appointments</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  <span className="text-slate-455 dark:text-slate-350 font-medium">New Patients</span>
                </div>
              </div>

              {/* Chart SVG wrapper */}
              <div className="flex-1 min-h-0 relative">
                <svg className="w-full h-full" viewBox="0 0 1000 240" preserveAspectRatio="none">
                  {/* Style for animation */}
                  <style>{`
                    @keyframes lineDraw {
                      to { stroke-dashoffset: 0; }
                    }
                    .chart-path-anim {
                      stroke-dasharray: 1500;
                      stroke-dashoffset: 1500;
                      animation: lineDraw 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                    }
                  `}</style>

                  {/* Horizontal grid lines */}
                  {[0, 5, 10, 15, 20, 25].map((yVal, idx) => {
                    const y = 210 - yVal * 7.6;
                    return (
                      <g key={idx}>
                        <line x1="40" y1={y} x2="980" y2={y} stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />
                        <text x="30" y={y + 3} textAnchor="end" className="text-[9px] font-medium fill-slate-400 dark:fill-slate-500">{yVal}</text>
                      </g>
                    );
                  })}

                  {/* Bezier paths for metrics */}
                  <path
                    d={bezierConsultations}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="chart-path-anim"
                  />
                  <path
                    d={bezierAppointments}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="chart-path-anim"
                  />
                  <path
                    d={bezierNewPatients}
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="chart-path-anim"
                  />

                  {/* Data Point Circles */}
                  {performanceData.map((d, i) => {
                    const x = 40 + i * 67.14;
                    const yC = 210 - d.consultations * 7.6;
                    const yA = 210 - d.appointments * 7.6;
                    const yN = 210 - d.newPatients * 7.6;
                    const isHovered = hoveredIndex === i;

                    return (
                      <g key={i}>
                        {/* Consultation Circle */}
                        <circle
                          cx={x}
                          cy={yC}
                          r={isHovered ? 5.5 : 3.5}
                          fill={isHovered ? "#3B82F6" : "#ffffff"}
                          stroke="#3B82F6"
                          strokeWidth={isHovered ? 2.5 : 1.5}
                          className="transition-all duration-100"
                        />
                        {/* Appointment Circle */}
                        <circle
                          cx={x}
                          cy={yA}
                          r={isHovered ? 5.5 : 3.5}
                          fill={isHovered ? "#10B981" : "#ffffff"}
                          stroke="#10B981"
                          strokeWidth={isHovered ? 2.5 : 1.5}
                          className="transition-all duration-100"
                        />
                        {/* New Patient Circle */}
                        <circle
                          cx={x}
                          cy={yN}
                          r={isHovered ? 5.5 : 3.5}
                          fill={isHovered ? "#6366F1" : "#ffffff"}
                          stroke="#6366F1"
                          strokeWidth={isHovered ? 2.5 : 1.5}
                          className="transition-all duration-100"
                        />
                      </g>
                    );
                  })}

                  {/* X Axis Day ticks and labels */}
                  {performanceData.map((d, i) => {
                    const x = 40 + i * 67.14;
                    // Render alternate labels to prevent overlap
                    const showLabel = i % 2 === 0;

                    return (
                      <g key={i}>
                        <line x1={x} y1="210" x2={x} y2="214" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1" />
                        {showLabel && (
                          <text x={x} y="228" textAnchor="middle" className="text-[9.5px] font-medium fill-slate-400 dark:fill-slate-500">
                            {d.date}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Vertical Hover Line Guide */}
                  {hoveredIndex !== null && (
                    <line
                      x1={40 + hoveredIndex * 67.14}
                      y1="20"
                      x2={40 + hoveredIndex * 67.14}
                      y2="210"
                      stroke="rgba(99, 102, 241, 0.2)"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />
                  )}

                  {/* Interactive Transparent Hover rect areas */}
                  {performanceData.map((d, i) => {
                    const x = 40 + i * 67.14;
                    return (
                      <rect
                        key={i}
                        x={x - 33.5}
                        y={0}
                        width={67}
                        height={240}
                        fill="transparent"
                        className="cursor-crosshair"
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    );
                  })}
                </svg>

                {/* Floating Interactive Tooltip */}
                {hoveredIndex !== null && (
                  <div
                    className="absolute bg-slate-900/95 dark:bg-slate-955/95 text-white p-3 rounded-lg shadow-xl border border-slate-800 dark:border-slate-800 text-[11px] pointer-events-none z-10 space-y-1 transition-all duration-100"
                    style={{
                      left: `${((40 + hoveredIndex * 67.14) / 1000) * 100}%`,
                      transform: 'translateX(-50%)',
                      top: '20px'
                    }}
                  >
                    <p className="font-bold text-slate-300 dark:text-slate-300 border-b border-slate-800 pb-0.5 mb-1">{performanceData[hoveredIndex].fullDate}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>Consultations: <span className="font-bold">{performanceData[hoveredIndex].consultations}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>Appointments: <span className="font-bold">{performanceData[hoveredIndex].appointments}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                      <span>New Patients: <span className="font-bold">{performanceData[hoveredIndex].newPatients}</span></span>
                    </div>
                  </div>
                )}
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

    // Filter appointments dynamically (removed location filter check)
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
      if (apptSelectedType !== "All") {
        const isWalkin = a.notes?.toLowerCase().includes("walk-in") || a.patientName?.toLowerCase().includes("walk-in");
        if (apptSelectedType === "Walk-In" && !isWalkin) return false;
        if (apptSelectedType === "Scheduled" && isWalkin) return false;
      }
      return true;
    });

    const handlePrevDate = () => {
      const prev = new Date(apptCalendarDate);
      if (activeSubTab === "Queue") {
        prev.setDate(prev.getDate() - 1);
      } else if (activeSubTab === "History") {
        prev.setMonth(prev.getMonth() - 1);
      } else { // activeSubTab === "Today"
        if (apptView === "Month") {
          prev.setMonth(prev.getMonth() - 1);
        } else if (apptView === "Week") {
          prev.setDate(prev.getDate() - 7);
        } else if (apptView === "Day") {
          prev.setDate(prev.getDate() - 1);
        }
      }
      setApptCalendarDate(prev);
    };

    const handleNextDate = () => {
      const next = new Date(apptCalendarDate);
      if (activeSubTab === "Queue") {
        next.setDate(next.getDate() + 1);
      } else if (activeSubTab === "History") {
        next.setMonth(next.getMonth() + 1);
      } else { // activeSubTab === "Today"
        if (apptView === "Month") {
          next.setMonth(next.getMonth() + 1);
        } else if (apptView === "Week") {
          next.setDate(next.getDate() + 7);
        } else if (apptView === "Day") {
          next.setDate(next.getDate() + 1);
        }
      }
      setApptCalendarDate(next);
    };

    const dateStr = formatDateString(apptCalendarDate);

    // Queue Filtered List (for selected date)
    const queueAppts = filteredAppts.filter(a => a.date === dateStr && a.status !== "Completed" && a.status !== "Cancelled");

    // History Filtered List (by selected month/year of apptCalendarDate)
    const historyAppts = filteredAppts.filter(a => {
      const apptDateObj = new Date(a.date);
      return apptDateObj.getMonth() === apptCalendarDate.getMonth() && 
             apptDateObj.getFullYear() === apptCalendarDate.getFullYear() &&
             (a.status === "Completed" || a.status === "Cancelled");
    });

    return (
      <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs font-semibold text-slate-700">
        
        {/* LEFT SIDEBAR PANEL (col-span-2 ~16.6%) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
            <Button 
              onClick={() => setActiveModal("addAppointment")} 
              className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs"
            >
              <CalendarPlus className="h-4 w-4" /> Book Appointment
            </Button>

            <Button 
              variant="outline"
              className="w-full h-10 border-slate-200 hover:bg-slate-50 dark:border-slate-800 text-blue-600 font-semibold text-xs rounded-xl flex items-center justify-center gap-2"
              onClick={() => {
                const dateStrInput = prompt("Enter target date (YYYY-MM-DD):", "2026-08-12");
                if (dateStrInput) {
                  const parts = dateStrInput.split("-");
                  if (parts.length === 3) {
                    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    setApptCalendarDate(d);
                  }
                }
              }}
            >
              <Calendar className="h-4 w-4" /> Go to Date
            </Button>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Doctor Filter Header */}
            <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Doctors Directory</span>

            {/* Vertical Doctor List (No internal scrollbar) */}
            <div className="space-y-1.5 pt-0.5">
              {/* All Doctors Pinned Row */}
              <div
                onClick={() => setApptSelectedDoctor("All")}
                className={`h-[48px] px-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  apptSelectedDoctor === "All"
                    ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                    : "bg-slate-50/60 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 border-slate-100 dark:border-slate-800/70 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className={`h-9 w-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                  apptSelectedDoctor === "All"
                    ? "bg-white/20 text-white"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                }`}>
                  <Users className="h-4 w-4" />
                </div>
                <span className={`font-bold text-[13px] truncate leading-none ${apptSelectedDoctor === "All" ? "text-white" : "text-slate-900 dark:text-white"}`}>
                  All Doctors
                </span>
              </div>

              {/* Doctor Directory Rows */}
              {doctors.map((doc, idx) => {
                const isActive = apptSelectedDoctor === doc.name;
                const firstName = doc.name.replace(/^Dr\.\s*/i, "").split(" ")[0];
                const initials = doc.name.replace(/^Dr\.\s*/i, "").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                const colors = [
                  "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300",
                  "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300",
                  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
                  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300",
                  "bg-pink-100 text-pink-700 dark:bg-pink-900/60 dark:text-pink-300"
                ];
                const avatarColor = colors[idx % colors.length];

                return (
                  <div
                    key={doc.name}
                    onClick={() => setApptSelectedDoctor(isActive ? "All" : doc.name)}
                    className={`h-[48px] px-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      isActive
                        ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                        : "bg-slate-50/60 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 border-slate-100 dark:border-slate-800/70 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {doc.avatar ? (
                      <img src={doc.avatar} alt={doc.name} className="h-9 w-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className={`h-9 w-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                        isActive ? "bg-white/20 text-white" : avatarColor
                      }`}>
                        {initials}
                      </div>
                    )}
                    
                    <span className={`font-bold text-[13px] truncate leading-none ${isActive ? "text-white" : "text-slate-900 dark:text-white"}`}>
                      {firstName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (col-span-10 ~83.3%) */}
        <div className="lg:col-span-10 space-y-4">
          
          {/* Filters Row */}
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-605">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Filters:</span>
            </div>

            <select 
              value={apptSelectedStatus}
              onChange={(e) => setApptSelectedStatus(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[12px] font-medium focus:outline-none dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300"
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
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[12px] font-medium focus:outline-none dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300"
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
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[12px] font-medium focus:outline-none dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Types</option>
              <option value="Scheduled">Scheduled Only</option>
              <option value="Walk-In">Walk-Ins Only</option>
            </select>
          </div>

          {/* Unified Calendar/Queue/History Card */}
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            
            {/* Redesigned 3-Column Top Navigation Layout */}
            <div className="flex items-center justify-between border-b border-slate-105 dark:border-slate-800 pb-3 mb-1">
              
              {/* Left Section: Compact Arrows together */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrevDate}
                  className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleNextDate}
                  className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Center Section: Month/Year title */}
              <span className="font-semibold text-[18px] text-slate-800 dark:text-white text-center">
                {activeSubTab === "Queue" 
                  ? `Queue for ${dateStr}`
                  : activeSubTab === "History"
                  ? `History for ${apptCalendarDate.toLocaleString("default", { month: "long", year: "numeric" })}`
                  : apptCalendarDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </span>

              {/* Right Section: View Switcher (Only visible in Today view) */}
              <div>
                {activeSubTab === "Today" ? (
                  <div className="bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg flex items-center">
                    {(["Month", "Week", "Day"] as const).map((view) => (
                      <button
                        key={view}
                        onClick={() => setApptView(view)}
                        className={`px-3 py-1.5 rounded-md text-[12px] font-bold transition-all ${
                          apptView === view 
                            ? "bg-white text-blue-600 shadow-sm dark:bg-slate-955" 
                            : "text-slate-550 hover:text-slate-888 dark:text-slate-400"
                        }`}
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {activeSubTab}
                  </div>
                )}
              </div>
            </div>

            {/* TODAY - MONTH VIEW */}
            {activeSubTab === "Today" && apptView === "Month" && (
              <div>
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-3 border-b pb-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                    <div key={d} className="py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {getDaysInMonth(apptCalendarDate).map((dayObj, index) => {
                    const dayDateStr = formatDateString(dayObj.date);
                    const dayAppts = filteredAppts.filter(a => a.date === dayDateStr);
                    const isToday = dayObj.date.toDateString() === new Date().toDateString();
                    
                    return (
                      <div 
                        key={index} 
                        className={`min-h-[110px] p-2 border rounded-xl flex flex-col justify-between transition-colors overflow-hidden relative cursor-pointer ${
                          dayObj.isCurrentMonth 
                            ? "bg-white border-slate-200 dark:bg-slate-955 dark:border-slate-800" 
                            : "bg-slate-50/50 border-slate-100 text-slate-400 dark:bg-slate-900/10 dark:border-slate-900"
                        }`}
                        onMouseEnter={(e) => {
                          if (dayAppts.length > 0) {
                            handleCellMouseEnter(e.currentTarget.getBoundingClientRect(), dayDateStr, dayAppts);
                          }
                        }}
                        onMouseLeave={handleCellMouseLeave}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-[10px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center ${
                            isToday ? "bg-blue-600 text-white shadow-xs" : "text-slate-808 dark:text-slate-202"
                          }`}>
                            {dayObj.date.getDate()}
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center flex-1 h-full pb-2">
                          {dayAppts.length > 0 && (
                            <div 
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50/70 border border-blue-100 text-blue-700 dark:bg-blue-955/20 dark:border-blue-900/30 dark:text-blue-400 text-[10px] font-extrabold text-center flex items-center justify-center whitespace-nowrap transition-all hover:scale-105"
                            >
                              {dayAppts.length} {dayAppts.length === 1 ? "Appointment" : "Appointments"}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TODAY - WEEK VIEW */}
            {activeSubTab === "Today" && apptView === "Week" && (
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-8 gap-2 text-center text-[12px] font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                    <div className="text-left py-1">Time</div>
                    {getWeekDays(apptCalendarDate).map((day, idx) => {
                      const daysName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                      const isToday = day.toDateString() === new Date().toDateString();
                      return (
                        <div key={idx} className="py-1">
                          <span className="block text-[10px] uppercase">{daysName[day.getDay()]}</span>
                          <span className={`block text-[13px] font-bold mt-0.5 ${isToday ? "text-blue-600" : "text-slate-808 dark:text-slate-202"}`}>{day.getDate()}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-900">
                    {["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"].map((hourSlot) => (
                      <div key={hourSlot} className="grid grid-cols-8 gap-2 py-3 items-stretch min-h-[70px]">
                        <div className="text-[10px] text-slate-400 font-bold self-start mt-1">{hourSlot}</div>
                        
                        {getWeekDays(apptCalendarDate).map((day, idx) => {
                          const dayDateStr = formatDateString(day);
                          const slotAppts = filteredAppts.filter(a => {
                            if (a.date !== dayDateStr) return false;
                            const matchHour = a.time.split(":")[0];
                            const matchAmPm = a.time.split(" ")[1];
                            const slotHour = hourSlot.split(":")[0];
                            const slotAmPm = hourSlot.split(" ")[1];
                            return parseInt(matchHour) === parseInt(slotHour) && matchAmPm === slotAmPm;
                          });

                          return (
                            <div key={idx} className="rounded-lg bg-slate-50/20 border border-dashed border-slate-105 dark:border-slate-850 p-1.5 flex flex-col gap-1.5 overflow-hidden">
                              {slotAppts.map(appt => {
                                let docBorderColor = "border-l-blue-500 bg-blue-50/25";
                                if (appt.doctor.includes("Raghuram")) docBorderColor = "border-l-cyan-500 bg-cyan-50/25";
                                else if (appt.doctor.includes("Srinivasa")) docBorderColor = "border-l-purple-500 bg-purple-50/25";
                                else if (appt.doctor.includes("Priyanka")) docBorderColor = "border-l-emerald-505 bg-emerald-55/25";
                                else if (appt.doctor.includes("Krishna")) docBorderColor = "border-l-indigo-500 bg-indigo-55/25";

                                return (
                                  <div 
                                    key={appt.id}
                                    onClick={() => setSelectedApptDetail(appt)}
                                    className={`p-1 border-l-2 rounded text-[9px] cursor-pointer hover:shadow-xs transition-shadow flex flex-col gap-0.5 leading-tight ${docBorderColor}`}
                                  >
                                    <span className="font-bold text-slate-550 dark:text-slate-400 text-[7.5px]">{appt.time}</span>
                                    <span className="font-extrabold text-slate-900 dark:text-white truncate">{appt.patientName}</span>
                                    <span className="text-slate-505 text-[8px] truncate">{appt.patientId}</span>
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

            {/* TODAY - DAY VIEW */}
            {activeSubTab === "Today" && apptView === "Day" && (
              <div className="space-y-4">
                <div className="divide-y divide-slate-100 dark:divide-slate-900 max-h-[600px] overflow-y-auto pr-2">
                  {Array.from({ length: 45 }, (_, idx) => {
                    const totalMinutes = 9 * 60 + idx * 15;
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    const ampm = hours >= 12 ? "PM" : "AM";
                    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
                    const slotTimeStr = `${displayHours < 10 ? '0' + displayHours : displayHours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
                    
                    const slotAppt = filteredAppts.find(a => {
                      if (a.date !== dateStr) return false;
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
                                  <span className="font-bold text-slate-850 dark:text-slate-202 block">{slotAppt.patientName}</span>
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
                              setSelectedSlotData({ date: dateStr, time: slotTimeStr });
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

            {/* QUEUE MODULE VIEW */}
            {activeSubTab === "Queue" && (
              <div className="space-y-4">
                {queueAppts.length > 0 ? (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs font-semibold">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-400">
                          <th className="p-3">Time</th>
                          <th className="p-3">Patient</th>
                          <th className="p-3">Doctor</th>
                          <th className="p-3">Treatment</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-700 dark:text-slate-300">
                        {queueAppts.map(appt => {
                          const docInitials = appt.doctor.replace("Dr. ", "").split(" ").map(n => n[0]).join("").toUpperCase();
                          return (
                            <tr key={appt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                              <td className="p-3 font-bold text-slate-808 dark:text-white">{appt.time}</td>
                              <td className="p-3">
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block">{appt.patientName}</span>
                                  <span className="text-[10px] text-slate-400 block">{appt.patientId}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-755 font-bold text-[10px] flex items-center justify-center shrink-0">
                                    {docInitials}
                                  </div>
                                  <span className="font-semibold text-slate-755 dark:text-slate-250">{appt.doctor}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="bg-blue-50 text-blue-700 dark:bg-blue-955/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                  {appt.treatment}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  appt.status === "Waiting" || appt.status === "Checked In"
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-955/20"
                                    : appt.status === "In Procedure"
                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-955/20"
                                    : "bg-slate-50 text-slate-500"
                                }`}>
                                  {appt.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex justify-end gap-1.5">
                                  {appt.status === "Scheduled" && (
                                    <button 
                                      onClick={() => handleApptCheckIn(appt.id)}
                                      className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px]"
                                    >
                                      Check In
                                    </button>
                                  )}
                                  {(appt.status === "Waiting" || appt.status === "Checked In") && (
                                    <button 
                                      onClick={() => handleApptStartProcedure(appt.id)}
                                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px]"
                                    >
                                      Start
                                    </button>
                                  )}
                                  {appt.status === "In Procedure" && (
                                    <button 
                                      onClick={() => {
                                        setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: "Completed" } : a));
                                        pushActivity("Treatment", `Completed ${appt.treatment} for ${appt.patientName}.`);
                                      }}
                                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                                    >
                                      Complete
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => setSelectedApptDetail(appt)}
                                    className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-500 text-[10px]"
                                  >
                                    Details
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center bg-slate-50/20 border border-dashed rounded-xl border-slate-200">
                    <p className="text-slate-400 text-xs">No active queue patients for this date.</p>
                  </div>
                )}
              </div>
            )}

            {/* HISTORY MODULE VIEW */}
            {activeSubTab === "History" && (
              <div className="space-y-4">
                {historyAppts.length > 0 ? (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs font-semibold">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-400">
                          <th className="p-3">Date & Time</th>
                          <th className="p-3">Patient</th>
                          <th className="p-3">Doctor</th>
                          <th className="p-3">Treatment</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Clinical Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-700 dark:text-slate-300">
                        {historyAppts.map(appt => {
                          const docInitials = appt.doctor.replace("Dr. ", "").split(" ").map(n => n[0]).join("").toUpperCase();
                          return (
                            <tr key={appt.id} onClick={() => setSelectedApptDetail(appt)} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 cursor-pointer">
                              <td className="p-3">
                                <div>
                                  <span className="font-bold text-slate-808 dark:text-white block">{appt.date}</span>
                                  <span className="text-[10px] text-slate-400 block">{appt.time}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block">{appt.patientName}</span>
                                  <span className="text-[10px] text-slate-405 block">{appt.patientId}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-blue-105 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                    {docInitials}
                                  </div>
                                  <span className="font-semibold text-slate-750 dark:text-slate-250">{appt.doctor}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="bg-blue-50 text-blue-700 dark:bg-blue-955/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                  {appt.treatment}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  appt.status === "Completed"
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-955/20"
                                    : "bg-red-50 text-red-700 dark:bg-red-955/20"
                                }`}>
                                  {appt.status}
                                </span>
                              </td>
                              <td className="p-3 text-slate-500 font-medium max-w-[200px] truncate">
                                {appt.notes || "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center bg-slate-50/20 border border-dashed rounded-xl border-slate-200">
                    <p className="text-slate-400 text-xs">No completed or cancelled appointments for this month.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* SIDE DRAWER FOR DETAILS */}
        {selectedApptDetail && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end">
            <div className="w-full max-w-md bg-white dark:bg-slate-955 h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between animate-slideLeft">
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-105 dark:border-slate-900">
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
                      <strong className="text-slate-808 dark:text-slate-202 font-bold">{selectedApptDetail.patientId}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Phone Number</span>
                      <strong className="text-slate-808 dark:text-slate-202 font-bold">
                        {patients.find(p => p.id === selectedApptDetail.patientId)?.phone || "+91 99000 11000"}
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Assigned Doctor</span>
                      <strong className="text-slate-808 dark:text-slate-202 font-bold">{selectedApptDetail.doctor}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Date & Time</span>
                      <strong className="text-slate-888 dark:text-slate-202 font-bold">{selectedApptDetail.date} at {selectedApptDetail.time}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Treatment</span>
                      <span className="bg-blue-50 text-blue-700 dark:bg-blue-955/20 px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] inline-block mt-1">
                        {selectedApptDetail.treatment}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Status</span>
                      <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-955/20 px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] inline-block mt-1">
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
              <div className="space-y-3 pt-6 border-t border-slate-105 dark:border-slate-900">
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
                    onClick={() => {
                      const whatsappNumber = "918639778188";
                      const message = `Hello ${selectedApptDetail.patientName},

This is a reminder from Apex Clinic regarding your dental appointment.

🦷 Treatment: ${selectedApptDetail.treatment}
📅 Date: ${selectedApptDetail.date}
🕒 Time: ${selectedApptDetail.time}

Please arrive 10 minutes before your scheduled appointment.

If you need to reschedule, please reply to this message.

Thank you,
Apex Clinic`;
                      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
                    }}
                    className="py-2 text-[10px] font-bold border rounded-lg bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center gap-1 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-355"
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
            {["Overview", "Treatments", "Dental Chart", "Appointments", "Invoices", "Prescriptions", "Files", "Media"].map((t) => {
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
              <div className="space-y-6">
                {/* Patient Summary Cards */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 animate-fadeIn">
                  <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3 text-xs font-semibold">
                    <span className="font-bold text-sm block mb-1">Personal Details</span>
                    <p className="text-slate-505">Address: <strong className="text-slate-800 dark:text-slate-200">{patientItem.address}</strong></p>
                    <p className="text-slate-550">Contact: <strong className="text-slate-800 dark:text-slate-200">{patientItem.phone}</strong></p>
                    <p className="text-slate-550">Outstanding Balance: <strong className="text-slate-800 text-red-650">{patientItem.balance}</strong></p>
                    <p className="text-slate-550">Last Visited: <strong className="text-slate-800">{patientItem.visit}</strong></p>
                  </div>
                  <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-xs">
                    <span className="font-bold text-sm block mb-3">Clinical Alert Profile</span>
                    {patientItem.medicalNotes && patientItem.medicalNotes !== "None" ? (
                      <div className="flex gap-2 p-3 bg-red-50 text-red-705 border border-red-100 rounded-xl font-semibold">
                        <Shield className="h-4 w-4 shrink-0 text-red-650" />
                        <div>
                          <span className="font-bold block text-red-800">Medical Warning Logs</span>
                          <p className="text-[10px] mt-0.5">{patientItem.medicalNotes}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 font-bold">No active clinical warning logs.</p>
                    )}
                  </div>
                </div>

                {/* Editable Profile Form */}
                <form onSubmit={handleSavePatientProfile} className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-6 text-xs animate-fadeIn">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b pb-2 mb-4">Edit Patient Profile</h3>
                    
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-xs text-blue-600 dark:text-blue-400">Basic Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <Label>Patient ID</Label>
                          <Input value={patientItem.id} disabled className="bg-slate-50 dark:bg-slate-900 border-slate-200" />
                        </div>
                        <div>
                          <Label>First Name</Label>
                          <Input value={editFirstName} onChange={e => setEditFirstName(e.target.value)} required />
                        </div>
                        <div>
                          <Label>Last Name</Label>
                          <Input value={editLastName} onChange={e => setEditLastName(e.target.value)} />
                        </div>
                        <div>
                          <Label>Mobile Number</Label>
                          <Input value={editMobile} onChange={e => setEditMobile(e.target.value)} required />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                        </div>
                        <div>
                          <Label>Date of Birth</Label>
                          <Input type="date" value={editDob} onChange={e => handleDobChange(e.target.value)} />
                        </div>
                        <div>
                          <Label>Age (Auto-calculated)</Label>
                          <Input type="number" value={editAge} disabled className="bg-slate-50 dark:bg-slate-900 border-slate-200" />
                        </div>
                        <div>
                          <Label>Gender</Label>
                          <select 
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                            value={editGender} 
                            onChange={e => setEditGender(e.target.value as "Male" | "Female")}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                        <div>
                          <Label>Blood Group</Label>
                          <select 
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                            value={editBloodGroup} 
                            onChange={e => setEditBloodGroup(e.target.value)}
                          >
                            <option value="">-- Choose --</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        </div>
                        <div>
                          <Label>Occupation</Label>
                          <Input value={editOccupation} onChange={e => setEditOccupation(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-4 mt-6">
                      <h4 className="font-bold text-xs text-blue-600 dark:text-blue-400">Address Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="sm:col-span-2">
                          <Label>Address Line</Label>
                          <Input value={editAddressLine} onChange={e => setEditAddressLine(e.target.value)} />
                        </div>
                        <div>
                          <Label>City</Label>
                          <Input value={editCity} onChange={e => setEditCity(e.target.value)} />
                        </div>
                        <div>
                          <Label>State</Label>
                          <Input value={editState} onChange={e => setEditState(e.target.value)} />
                        </div>
                        <div>
                          <Label>Pincode</Label>
                          <Input value={editPincode} onChange={e => setEditPincode(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    {/* Medical Section */}
                    <div className="space-y-4 mt-6">
                      <h4 className="font-bold text-xs text-blue-600 dark:text-blue-400">Medical History & Emergency Contact</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <Label>Allergies</Label>
                          <Input value={editAllergies} onChange={e => setEditAllergies(e.target.value)} placeholder="e.g. Penicillin, Latex" />
                        </div>
                        <div>
                          <Label>Medical Conditions</Label>
                          <Input value={editMedicalConditions} onChange={e => setEditMedicalConditions(e.target.value)} placeholder="e.g. Hypertension, Diabetes" />
                        </div>
                        <div>
                          <Label>Current Medications</Label>
                          <Input value={editCurrentMedications} onChange={e => setEditCurrentMedications(e.target.value)} placeholder="e.g. Metformin, Lisinopril" />
                        </div>
                        <div>
                          <Label>Emergency Contact Person</Label>
                          <Input value={editEmergencyContactName} onChange={e => setEditEmergencyContactName(e.target.value)} />
                        </div>
                        <div>
                          <Label>Emergency Contact Phone</Label>
                          <Input value={editEmergencyContactPhone} onChange={e => setEditEmergencyContactPhone(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    {/* Dental Info */}
                    <div className="space-y-4 mt-6">
                      <h4 className="font-bold text-xs text-blue-600 dark:text-blue-400">Dental Preferences</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <Label>First Visit Date</Label>
                          <Input type="date" value={editFirstVisit} onChange={e => setEditFirstVisit(e.target.value)} />
                        </div>
                        <div>
                          <Label>Last Visit Date</Label>
                          <Input type="date" value={editLastVisit} onChange={e => setEditLastVisit(e.target.value)} />
                        </div>
                        <div>
                          <Label>Preferred Dentist</Label>
                          <select 
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                            value={editPreferredDentist} 
                            onChange={e => setEditPreferredDentist(e.target.value)}
                          >
                            <option value="">-- Choose Dentist --</option>
                            {doctors.map(d => (
                              <option key={d.name} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button type="button" onClick={() => setSelectedPatientId(null)} className="h-9 px-4 rounded border font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
                      Cancel
                    </Button>
                    <Button type="submit" className="h-9 px-4 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {profileSubTab === "Treatments" && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-xs font-semibold space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <span className="font-bold text-sm">Patient Treatment History Log</span>
                    <Button 
                      onClick={() => {
                        setShowAddTreatmentModal(true);
                        setNewTrDoctor(doctors[0]?.name || "");
                      }} 
                      className="h-8 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px]"
                    >
                      Add Treatment
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b text-[10px] text-slate-405 uppercase tracking-wider">
                          <th className="pb-2.5">Date</th>
                          <th className="pb-2.5">Tooth</th>
                          <th className="pb-2.5">Treatment</th>
                          <th className="pb-2.5">Doctor</th>
                          <th className="pb-2.5">Status</th>
                          <th className="pb-2.5">Cost</th>
                          <th className="pb-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-700 dark:text-slate-300">
                        {treatments.filter(t => t.patient === patientItem.name).length > 0 ? (
                          treatments.filter(t => t.patient === patientItem.name).map((tr) => (
                            <tr key={tr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                              <td className="py-3 font-semibold">{tr.date || patientItem.visit}</td>
                              <td className="py-3 font-bold text-blue-600 dark:text-blue-400">{tr.tooth ? `Tooth #${ALL_TEETH.find(t => t.index === tr.tooth)?.fdi || tr.tooth}` : "General"}</td>
                              <td className="py-3 font-bold text-slate-900 dark:text-white">{tr.name}</td>
                              <td className="py-3">{tr.doctor}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  tr.stage === "Completed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40" :
                                  tr.stage === "In Progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-955/40" :
                                  "bg-slate-100 text-slate-800 dark:bg-slate-900/40"
                                }`}>
                                  {tr.stage}
                                </span>
                              </td>
                              <td className="py-3 font-bold">₹{(tr.cost || 0).toLocaleString()}</td>
                              <td className="py-3 text-right">
                                <button 
                                  onClick={() => {
                                    setTreatments(prev => prev.filter(t => t.id !== tr.id));
                                    showToast("Treatment history log removed.", "success");
                                  }} 
                                  className="text-red-500 hover:text-red-750 font-bold"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-4 text-slate-400 text-center">No treatment history logged.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add Treatment Modal */}
                {showAddTreatmentModal && (
                  <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden text-xs font-semibold">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-[14px]">Add New Patient Treatment Log</span>
                        <button onClick={() => setShowAddTreatmentModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
                      </div>
                      <form onSubmit={handleSaveCustomTreatment} className="p-5 space-y-4">
                        <div>
                          <Label>Treatment Name</Label>
                          <select 
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                            value={newTrName}
                            onChange={e => {
                              setNewTrName(e.target.value);
                              if (TREATMENT_PRICES[e.target.value]) {
                                setNewTrCost(String(TREATMENT_PRICES[e.target.value]));
                              }
                            }}
                            required
                          >
                            <option value="">-- Choose Procedure --</option>
                            {Object.keys(TREATMENT_PRICES).map(t => (
                              <option key={t} value={t}>{t} (₹{TREATMENT_PRICES[t]})</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Tooth Index (Optional)</Label>
                            <select 
                              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                              value={newTrTooth}
                              onChange={e => setNewTrTooth(e.target.value)}
                            >
                              <option value="">-- General / None --</option>
                              {ALL_TEETH.map(t => (
                                <option key={t.fdi} value={t.index}>Tooth #{t.fdi}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label>Doctor Assigned</Label>
                            <select 
                              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                              value={newTrDoctor}
                              onChange={e => setNewTrDoctor(e.target.value)}
                            >
                              {doctors.map(d => (
                                <option key={d.name} value={d.name}>{d.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Procedure Cost (₹)</Label>
                            <Input type="number" value={newTrCost} onChange={e => setNewTrCost(e.target.value)} />
                          </div>
                          <div>
                            <Label>Treatment Status</Label>
                            <select 
                              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                              value={newTrStatus}
                              onChange={e => setNewTrStatus(e.target.value as any)}
                            >
                              <option value="Planned">Planned</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <Label>Diagnosis Notes</Label>
                          <Input value={newTrDiagnosis} onChange={e => setNewTrDiagnosis(e.target.value)} placeholder="e.g. Tooth sensitivity" />
                        </div>
                        <div>
                          <Label>Procedure Notes</Label>
                          <Input value={newTrNotes} onChange={e => setNewTrNotes(e.target.value)} placeholder="Procedure steps..." />
                        </div>
                        <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                          <Button type="button" onClick={() => setShowAddTreatmentModal(false)} className="h-9 px-4 rounded border font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
                            Cancel
                          </Button>
                          <Button type="submit" className="h-9 px-4 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                            Save
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {profileSubTab === "Dental Chart" && (
              <div className="animate-fadeIn w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Left Panel: Dental Chart (Width 42% on Desktop, top on Tablet/Mobile) */}
                  <div className="lg:col-span-5 flex flex-col bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
                    <div className="border-b pb-3 mb-4 shrink-0">
                      <span className="text-[18px] font-semibold text-slate-900 dark:text-white">Dental Chart</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center py-2">
                      <div className="w-full">
                        <Odontogram 
                          chartData={patientItem.dentalChart || {}} 
                          selectedTooth={chartSelectedTooth}
                          onSelectTooth={handleChartToothSelect}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Panel: Treatment Details (Width 58% on Desktop, bottom on Tablet/Mobile) */}
                  <div className="lg:col-span-7 flex flex-col bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-xs font-semibold">
                    {chartSelectedTooth !== null ? (
                      <form onSubmit={handleSaveToothTreatment} className="flex-grow flex flex-col justify-between h-full">
                        <div className="space-y-5">
                          <div className="flex justify-between items-start border-b pb-3">
                            <div className="flex flex-col">
                              <span className="text-[18px] font-semibold text-slate-900 dark:text-white">
                                Treatment Details
                              </span>
                              <span className="text-[16px] font-medium text-blue-605 dark:text-blue-400 mt-0.5">
                                Tooth #{ALL_TEETH.find(t => t.index === chartSelectedTooth)?.fdi || chartSelectedTooth}
                              </span>
                            </div>
                            <button type="button" onClick={() => setChartSelectedTooth(null)} className="text-slate-400 hover:text-slate-700 font-medium text-lg leading-none">×</button>
                          </div>

                          <div className="space-y-4">
                            {/* Row 1 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[14px] font-medium text-slate-700 dark:text-slate-300 block mb-1">Treatment Procedure</label>
                                <select 
                                  className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-[13px] focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                  value={chartTreatmentName}
                                  onChange={e => {
                                    setChartTreatmentName(e.target.value);
                                    if (TREATMENT_PRICES[e.target.value]) {
                                      setChartCost(String(TREATMENT_PRICES[e.target.value]));
                                    }
                                  }}
                                  required
                                >
                                  <option value="">-- Choose Procedure --</option>
                                  {Object.keys(TREATMENT_PRICES).map(t => (
                                    <option key={t} value={t}>{t} (₹{TREATMENT_PRICES[t]})</option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[14px] font-medium text-slate-700 dark:text-slate-300 block mb-1">Treatment Status</label>
                                <select 
                                  className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-[13px] focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                  value={chartStatus} 
                                  onChange={e => setChartStatus(e.target.value as any)}
                                >
                                  <option value="Planned">Planned</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              </div>
                            </div>

                            {/* Row 2 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[14px] font-medium text-slate-700 dark:text-slate-300 block mb-1">Doctor Assigned</label>
                                <select 
                                  className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-[13px] focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                  value={chartDoctor} 
                                  onChange={e => setChartDoctor(e.target.value)}
                                >
                                  {doctors.map(d => (
                                    <option key={d.name} value={d.name}>{d.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[14px] font-medium text-slate-700 dark:text-slate-300 block mb-1">Treatment Date</label>
                                <Input type="date" value={chartDate} onChange={e => setChartDate(e.target.value)} className="text-[13px]" />
                              </div>
                            </div>

                            {/* Row 3 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[14px] font-medium text-slate-700 dark:text-slate-300 block mb-1">Estimated Procedure Cost (₹)</label>
                                <Input type="number" value={chartCost} onChange={e => setChartCost(e.target.value)} className="text-[13px]" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[14px] font-medium text-slate-700 dark:text-slate-300 block mb-1">Diagnosis Notes</label>
                                <Input value={chartDiagnosis} onChange={e => setChartDiagnosis(e.target.value)} placeholder="e.g. Deep cavity, pulpal involvement" className="text-[13px]" />
                              </div>
                            </div>

                            {/* Row 4 */}
                            <div className="space-y-1">
                              <label className="text-[14px] font-medium text-slate-700 dark:text-slate-300 block mb-1">Procedure / Consultation Notes</label>
                              <Input value={chartNotes} onChange={e => setChartNotes(e.target.value)} placeholder="Enter details..." className="text-[13px]" />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 justify-end pt-4 border-t border-slate-105 dark:border-slate-800 mt-auto">
                          <Button type="button" onClick={() => setChartSelectedTooth(null)} className="h-9 px-4 rounded border font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
                            Cancel
                          </Button>
                          <Button type="submit" className="h-9 px-4 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                            Save Treatment
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex-grow flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-550 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl h-full min-h-[300px] -translate-y-2">
                        <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-full mb-2 text-slate-400 dark:text-slate-500 shrink-0">
                          <Activity className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs mb-0.5">Select a Tooth</span>
                        <p className="max-w-[200px] text-[10px] font-medium leading-normal text-slate-450 dark:text-slate-400">
                          Select a tooth from the dental chart to view or update its clinical information.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {profileSubTab === "Appointments" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-xs font-semibold space-y-4">
                  <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <span className="font-bold text-sm">Appointments Log & Intake schedule</span>
                    <Button 
                      onClick={() => {
                        setShowAddApptForm(prev => !prev);
                        setApptDoctor(doctors[0]?.name || "");
                      }} 
                      className="h-8 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px]"
                    >
                      {showAddApptForm ? "Close Form" : "Book Appointment"}
                    </Button>
                  </div>

                  {showAddApptForm && (
                    <form onSubmit={handleSavePatientAppt} className="p-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                      <span className="font-bold block text-blue-605">Schedule New Slot</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <Label>Doctor</Label>
                          <select 
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                            value={patApptDoctor} 
                            onChange={e => setPatApptDoctor(e.target.value)}
                          >
                            {doctors.map(d => (
                              <option key={d.name} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Treatment</Label>
                          <select 
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                            value={patApptTreatment}
                            onChange={e => setPatApptTreatment(e.target.value)}
                            required
                          >
                            <option value="">-- Select --</option>
                            {Object.keys(TREATMENT_PRICES).map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Date</Label>
                          <Input type="date" value={patApptDate} onChange={e => setPatApptDate(e.target.value)} required />
                        </div>
                        <div>
                          <Label>Time Slot</Label>
                          <Input value={patApptTime} onChange={e => setPatApptTime(e.target.value)} placeholder="e.g. 09:30 AM" required />
                        </div>
                      </div>
                      <div>
                        <Label>Reason / Notes</Label>
                        <Input value={patApptNotes} onChange={e => setPatApptNotes(e.target.value)} placeholder="Intake reason..." />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button type="button" onClick={() => setShowAddApptForm(false)} className="h-8 px-3 rounded border text-[11px]">Cancel</Button>
                        <Button type="submit" className="h-8 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px]">Book Slot</Button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-4">
                    {/* Log tables partitioned by state status */}
                    {["Scheduled", "Checked In", "Waiting", "Completed", "Cancelled"].map(group => {
                      const list = pAppts.filter(a => {
                        if (group === "Scheduled") return a.status === "Scheduled";
                        if (group === "Checked In") return a.status === "Checked In" || a.status === "Waiting";
                        if (group === "Completed") return a.status === "Completed";
                        return a.status === "Cancelled";
                      });

                      if (list.length === 0) return null;

                      return (
                        <div key={group} className="space-y-2">
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-400 block border-b pb-1 mt-2">{group} appointments</span>
                          <div className="divide-y divide-slate-100 dark:divide-slate-900">
                            {list.map(app => (
                              <div key={app.id} className="py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                <div>
                                  <span className="font-bold text-[13px] text-slate-900 dark:text-white">{app.time} on {app.date} • {app.treatment}</span>
                                  <p className="text-slate-500 text-[11px] mt-0.5">Doctor: {app.doctor} {app.notes ? `• Notes: ${app.notes}` : ''}</p>
                                </div>
                                
                                <div className="flex items-center gap-2 shrink-0">
                                  {reschedulingApptId === app.id ? (
                                    <div className="flex gap-1.5 items-center">
                                      <Input type="date" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} className="h-7 w-28 text-[10px] p-1" />
                                      <Input value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} placeholder="09:00 AM" className="h-7 w-20 text-[10px] p-1" />
                                      <button 
                                        onClick={() => {
                                          if (!rescheduleDate || !rescheduleTime) return;
                                          setAppointments(prev => prev.map(a => a.id === app.id ? { ...a, date: rescheduleDate, time: rescheduleTime } : a));
                                          setReschedulingApptId(null);
                                          showToast("Appointment rescheduled.", "success");
                                        }}
                                        className="h-7 px-2 bg-emerald-600 text-white rounded text-[10px] font-bold"
                                      >
                                        Save
                                      </button>
                                      <button onClick={() => setReschedulingApptId(null)} className="text-slate-400 font-bold px-1">×</button>
                                    </div>
                                  ) : (
                                    <>
                                      {app.status === "Scheduled" && (
                                        <>
                                          <button 
                                            onClick={() => {
                                              setAppointments(prev => prev.map(a => a.id === app.id ? { ...a, status: "Checked In" } : a));
                                              showToast("Patient checked in.", "success");
                                            }}
                                            className="h-7 px-2.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[10px] transition-colors"
                                          >
                                            Check In
                                          </button>
                                          <button 
                                            onClick={() => {
                                              setReschedulingApptId(app.id);
                                              setRescheduleDate(app.date);
                                              setRescheduleTime(app.time);
                                            }}
                                            className="h-7 px-2.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[10px]"
                                          >
                                            Reschedule
                                          </button>
                                        </>
                                      )}
                                      
                                      {(app.status === "Checked In" || app.status === "Waiting") && (
                                        <button 
                                          onClick={() => {
                                            setAppointments(prev => prev.map(a => a.id === app.id ? { ...a, status: "Completed" } : a));
                                            showToast("Appointment completed.", "success");
                                          }}
                                          className="h-7 px-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px]"
                                        >
                                          Complete
                                        </button>
                                      )}

                                      {app.status !== "Cancelled" && app.status !== "Completed" && (
                                        <button 
                                          onClick={() => {
                                            setAppointments(prev => prev.map(a => a.id === app.id ? { ...a, status: "Cancelled" } : a));
                                            showToast("Appointment cancelled.", "success");
                                          }}
                                          className="h-7 px-2.5 rounded border border-red-200 text-red-650 hover:bg-red-50 font-semibold text-[10px]"
                                        >
                                          Cancel
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {pAppts.length === 0 && (
                      <p className="text-slate-400 py-4 text-center">No appointment logs for this patient file.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {profileSubTab === "Invoices" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Billing invoice creation form */}
                <form onSubmit={handleSaveInvoice} className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 text-xs">
                  <span className="font-bold text-sm block border-b pb-2 mb-2">Create New Billing Invoice</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Procedure / Item</Label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                        value={invProcedure}
                        onChange={e => {
                          setInvProcedure(e.target.value);
                          if (TREATMENT_PRICES[e.target.value]) {
                            setInvAmount(String(TREATMENT_PRICES[e.target.value]));
                          }
                        }}
                        required
                      >
                        <option value="">-- Choose Procedure --</option>
                        {Object.keys(TREATMENT_PRICES).map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Procedure Amount (₹)</Label>
                      <Input type="number" value={invAmount} onChange={e => setInvAmount(e.target.value)} required />
                    </div>
                    <div>
                      <Label>Discount (%)</Label>
                      <Input type="number" min="0" max="100" value={invDiscount} onChange={e => setInvDiscount(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Paid Amount (₹)</Label>
                      <Input type="number" min="0" value={invPaid} onChange={e => setInvPaid(e.target.value)} />
                    </div>
                    <div>
                      <Label>Payment Mode</Label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                        value={invMode} 
                        onChange={e => setInvMode(e.target.value)}
                      >
                        <option value="UPI GPay">UPI / GPay</option>
                        <option value="Cash">Cash</option>
                        <option value="Card Swipe">Card</option>
                        <option value="Bank Transfer">Net Banking</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="submit" className="h-9 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded">Save Invoice</Button>
                  </div>
                </form>

                {/* Invoices List */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-xs">
                  <span className="font-bold text-sm block mb-3 border-b pb-2">Billing Statements</span>
                  <table className="w-full text-left border-collapse font-semibold">
                    <thead>
                      <tr className="border-b text-[10px] text-slate-405 uppercase">
                        <th className="pb-2">Invoice #</th>
                        <th className="pb-2">Procedure</th>
                        <th className="pb-2">Total Amount</th>
                        <th className="pb-2">Paid Amount</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pInvoices.length > 0 ? (
                        pInvoices.map((inv) => (
                          <tr key={inv.id} className="border-b last:border-b-0">
                            <td className="py-2.5 font-bold">
                              <button type="button" onClick={() => setLastGeneratedReceipt(inv)} className="text-blue-600 hover:underline">{inv.id}</button>
                            </td>
                            <td className="py-2.5">{inv.treatment}</td>
                            <td className="py-2.5 font-bold">₹{inv.total.toLocaleString()}</td>
                            <td className="py-2.5 text-slate-500">₹{inv.paidAmount.toLocaleString()}</td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                inv.status === "Paid" ? "bg-emerald-55 text-emerald-800" :
                                inv.status === "Partially Paid" ? "bg-yellow-50 text-yellow-800" :
                                "bg-red-50 text-red-700"
                              }`}>{inv.status}</span>
                            </td>
                            <td className="py-2.5 text-right space-x-2">
                              {inv.status !== "Paid" && (
                                <button 
                                  onClick={() => {
                                    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: "Paid", paidAmount: i.total } : i));
                                    showToast("Invoice marked as Paid.", "success");
                                  }} 
                                  className="text-emerald-600 hover:underline font-bold"
                                >
                                  Mark Paid
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  alert(`Print layout prepared for receipt ${inv.id}.`);
                                  setLastGeneratedReceipt(inv);
                                }} 
                                className="text-blue-600 hover:underline font-bold"
                              >
                                Print
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-4 text-slate-400 text-center">No billing statements generated.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {profileSubTab === "Prescriptions" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Prescription Builder */}
                <form onSubmit={handleSavePrescription} className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 text-xs">
                  <span className="font-bold text-sm block border-b pb-2 mb-2">Prescription Builder</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label>Practitioner / Doctor</Label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                        value={prescDoctor} 
                        onChange={e => setPrescDoctor(e.target.value)}
                      >
                        {doctors.map(d => (
                          <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Prescription Date</Label>
                      <Input type="date" value={prescDate} onChange={e => setPrescDate(e.target.value)} />
                    </div>
                    <div>
                      <Label>Diagnosis Notes</Label>
                      <Input value={prescDiagnosis} onChange={e => setPrescDiagnosis(e.target.value)} placeholder="e.g. Acute apical periodontitis" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="font-bold text-[11px] text-blue-605 block">Medicines Directory</span>
                    {prescMeds.map((med, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end border-b pb-2 sm:border-b-0 sm:pb-0">
                        <div className="sm:col-span-2">
                          <Label>Medicine Name</Label>
                          <Input 
                            value={med.name} 
                            onChange={e => {
                              const copy = [...prescMeds];
                              copy[idx].name = e.target.value;
                              setPrescMeds(copy);
                            }} 
                            placeholder="Amoxicillin 500mg, Ibuprofen 400mg..."
                            required
                          />
                        </div>
                        <div>
                          <Label>Dosage / Freq</Label>
                          <Input 
                            value={med.dosage} 
                            onChange={e => {
                              const copy = [...prescMeds];
                              copy[idx].dosage = e.target.value;
                              setPrescMeds(copy);
                            }} 
                            placeholder="3x daily, after meals..."
                          />
                        </div>
                        <div>
                          <Label>Duration</Label>
                          <Input 
                            value={med.duration} 
                            onChange={e => {
                              const copy = [...prescMeds];
                              copy[idx].duration = e.target.value;
                              setPrescMeds(copy);
                            }} 
                            placeholder="5 days, 1 week..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <Input 
                            value={med.instructions} 
                            onChange={e => {
                              const copy = [...prescMeds];
                              copy[idx].instructions = e.target.value;
                              setPrescMeds(copy);
                            }} 
                            placeholder="Special advice..." 
                            className="flex-1"
                          />
                          {prescMeds.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => setPrescMeds(prev => prev.filter((_, i) => i !== idx))} 
                              className="h-9 px-2 text-red-500 hover:text-red-750 font-bold border border-slate-200 rounded"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button 
                      type="button" 
                      onClick={() => prescMeds.length < 10 && setPrescMeds(prev => [...prev, { name: "", dosage: "", freq: "", duration: "", instructions: "" }])} 
                      className="text-xs text-blue-650 hover:underline font-bold mt-1 inline-block"
                    >
                      + Add Medicine Row
                    </button>
                  </div>

                  <div>
                    <Label>Doctor Advice / Instructions</Label>
                    <Input value={prescAdvice} onChange={e => setPrescAdvice(e.target.value)} placeholder="Follow-up warnings..." />
                  </div>

                  <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                      type="button" 
                      onClick={() => {
                        alert("PDF format initialized. Prescription downloaded successfully.");
                      }} 
                      className="h-9 px-4 rounded border font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Generate PDF
                    </Button>
                    <Button type="submit" className="h-9 px-4 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                      Save Prescription
                    </Button>
                  </div>
                </form>

                {/* Integrated Clinical Notes Section */}
                <form onSubmit={handleSaveClinicalNote} className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 text-xs">
                  <span className="font-bold text-sm block border-b pb-2 mb-2 text-slate-800 dark:text-white">Clinical Notes</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label>Note Title</Label>
                      <Input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="e.g. Follow-up observations" required />
                    </div>
                    
                    <div>
                      <Label>Note Category</Label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-805 dark:bg-slate-900"
                        value={noteCategory} 
                        onChange={e => setNoteCategory(e.target.value)}
                      >
                        <option value="General">General</option>
                        <option value="Clinical">Clinical</option>
                        <option value="Treatment Progress">Treatment Progress</option>
                        <option value="X-Ray Analysis">X-Ray Analysis</option>
                        <option value="Intake Assessment">Intake Assessment</option>
                      </select>
                    </div>

                    <div>
                      <Label>Author (Doctor/Staff)</Label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-805 dark:bg-slate-900"
                        value={noteAuthor} 
                        onChange={e => setNoteAuthor(e.target.value)}
                      >
                        {doctors.map(d => (
                          <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label>Rich Text / Multiline Notes field</Label>
                    <textarea 
                      rows={4}
                      className="flex w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      value={noteContent} 
                      onChange={e => setNoteContent(e.target.value)} 
                      placeholder="Write clinical practitioner observations, treatment logs, or notes here..." 
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button type="submit" className="h-9 px-4 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                      Save Clinical Note
                    </Button>
                  </div>
                </form>

                {/* Clinical Notes History list */}
                <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-xs font-semibold space-y-4">
                  <span className="font-bold text-sm block border-b pb-2 mb-2 text-slate-800 dark:text-white">Clinical Notes History</span>
                  {patientItem.notes.length > 0 ? (
                    <div className="space-y-3">
                      {patientItem.notes.slice().reverse().map((noteStr, idx) => {
                        const noteIndex = patientItem.notes.length - 1 - idx;
                        const parsed = parseClinicalNote(noteStr);
                        return (
                          <div key={idx} className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl flex flex-col gap-2">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-900 dark:text-white text-xs">{parsed.title}</span>
                                  <span className="px-2 py-0.5 rounded-[4px] bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-extrabold uppercase tracking-wide">
                                    {parsed.category}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                  Logged by <strong className="text-slate-600 dark:text-slate-400">{parsed.author}</strong> on {parsed.date}
                                </span>
                              </div>
                              <button 
                                type="button"
                                onClick={() => {
                                  setPatients(prev => prev.map(p => p.id === selectedPatientId ? { ...p, notes: p.notes.filter((_, i) => i !== noteIndex) } : p));
                                  showToast("Clinical note deleted.", "success");
                                }}
                                className="text-red-500 hover:underline text-[11px]"
                              >
                                Delete
                              </button>
                            </div>
                            
                            <p className="text-slate-700 dark:text-slate-300 text-xs font-normal leading-relaxed whitespace-pre-wrap">
                              {parsed.content}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-405 text-center py-2">No clinical practitioner notes logged.</p>
                  )}
                </div>

                {/* Prescriptions History list */}
                <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-xs font-semibold space-y-4">
                  <span className="font-bold text-sm block border-b pb-2 mb-2 text-slate-800 dark:text-white">Prescriptions Issued</span>
                  {patientItem.prescriptions.length > 0 ? (
                    patientItem.prescriptions.map((pr, idx) => (
                      <div key={idx} className="p-3 border border-slate-100 bg-slate-50/20 rounded-xl flex justify-between items-center">
                        <span className="font-semibold">{pr}</span>
                        <button 
                          onClick={() => {
                            setPatients(prev => prev.map(p => p.id === selectedPatientId ? { ...p, prescriptions: p.prescriptions.filter((_, i) => i !== idx) } : p));
                            showToast("Prescription deleted.", "success");
                          }}
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 py-2 text-center">No prescriptions logged.</p>
                  )}
                </div>
              </div>
            )}

            {profileSubTab === "Files" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Mock Upload Form */}
                <form onSubmit={handleUploadFile} className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 text-xs">
                  <span className="font-bold text-sm block border-b pb-2 mb-2">Attach Patient Scanning File</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label>File Name</Label>
                      <Input value={newFileName} onChange={e => setNewFileName(e.target.value)} placeholder="e.g. panorex_xray_final.png" required />
                    </div>
                    <div>
                      <Label>File Type Category</Label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                        value={newFileType} 
                        onChange={e => setNewFileType(e.target.value)}
                      >
                        <option value="X-Ray Scan">X-Ray Scan</option>
                        <option value="Intraoral Photo">Intraoral Photo</option>
                        <option value="Prescription PDF">Prescription PDF</option>
                        <option value="Clinical PDF">Clinical Report</option>
                        <option value="Billing Statement">Billing Statement</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button type="submit" className="h-9 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded">
                        Upload Scan
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Uploaded Files Table list */}
                <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-xs font-semibold space-y-3">
                  <span className="font-bold text-sm block mb-2 border-b pb-2">Patient Files Uploads</span>
                  {patientItem.files.length > 0 ? (
                    patientItem.files.map((file, idx) => (
                      <div key={idx} className="p-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <span className="font-bold block text-slate-850 dark:text-slate-100">{file.name}</span>
                            <p className="text-[10px] text-slate-400">{file.size || "1.8 MB"} • {file.type || "PNG Scan File"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => alert(`Downloading file: ${file.name}`)} className="text-[10px] text-blue-650 hover:underline font-bold">Download</button>
                          <button 
                            onClick={() => {
                              setPatients(prev => prev.map(p => p.id === selectedPatientId ? { ...p, files: p.files.filter((_, i) => i !== idx) } : p));
                              showToast("File deleted.", "success");
                            }}
                            className="text-[10px] text-red-500 hover:underline font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 py-2 text-center">No attachments uploaded.</p>
                  )}
                </div>
              </div>
            )}

            {profileSubTab === "Media" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Header Title */}
                <div className="flex justify-between items-center border-b pb-3 mb-4 shrink-0">
                  <span className="text-[18px] font-semibold text-slate-900 dark:text-white">Patient Media Gallery</span>
                </div>

                {/* Patient Consent Video Recorder Card */}
                <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
                  {/* Card Header & Title */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-blue-600" />
                      <span className="font-bold text-slate-900 dark:text-white text-sm">Patient Consent Video</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${cameraActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}></span>
                        {cameraActive ? "Camera Ready" : "Camera Off"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Mic className={`h-3.5 w-3.5 ${micActive ? "text-emerald-500" : "text-slate-400"}`} />
                        {micActive ? "Mic Active" : "Mic Muted"}
                      </span>
                      {availableCameras.length > 1 && (
                        <select
                          value={selectedCameraId}
                          onChange={(e) => {
                            setSelectedCameraId(e.target.value);
                            startWebcam(e.target.value);
                          }}
                          className="h-7 px-2 rounded-lg border border-slate-200 bg-white text-[10px] font-medium focus:outline-none dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {availableCameras.map((cam, i) => (
                            <option key={cam.deviceId || i} value={cam.deviceId}>
                              {cam.label || `Camera ${i + 1}`}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Patient Metadata Info Header */}
                  {(() => {
                    const activePat = patients.find(p => p.id === selectedPatientId);
                    const docName = prescDoctor || (doctors[0]?.name || "Dr. Deepa Kodali");
                    const todayDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

                    return (
                      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Patient Name</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate block mt-0.5">{activePat?.name || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Patient ID</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate block mt-0.5">{activePat?.id || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Doctor Name</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate block mt-0.5">{docName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Current Date</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate block mt-0.5">{todayDate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Current Time</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate block mt-0.5">{timeStr}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Live Timer</span>
                          <span className={`font-extrabold text-sm truncate block mt-0.5 ${recorderState === "recording" ? "text-red-600 animate-pulse" : "text-blue-600 dark:text-blue-400"}`}>
                            {formatTimer(recordingSeconds)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Live Webcam Preview Container or Review Video Player */}
                  <div className="relative aspect-video max-h-[360px] w-full bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
                    {recorderState === "review" && recordedVideoUrl ? (
                      <video
                        ref={previewVideoRef}
                        src={recordedVideoUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <video
                        ref={webcamVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${!cameraActive ? "hidden" : ""}`}
                      />
                    )}

                    {/* Video Overlay Badge Indicators */}
                    {!cameraActive && recorderState !== "review" && (
                      <div className="flex flex-col items-center gap-3 text-slate-400 p-6 text-center">
                        <Camera className="h-12 w-12 text-slate-500" />
                        <span className="text-xs font-semibold">Camera is currently inactive</span>
                        <Button
                          onClick={() => startWebcam(selectedCameraId)}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-8 px-4 rounded-lg cursor-pointer"
                        >
                          Enable Camera & Mic
                        </Button>
                      </div>
                    )}

                    {recorderState === "recording" && (
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-600/90 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs flex items-center gap-2 shadow-md">
                        <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
                        REC • {formatTimer(recordingSeconds)} / 01:30
                      </div>
                    )}

                    {recorderState === "paused" && (
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-600/90 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs flex items-center gap-2 shadow-md">
                        PAUSED • {formatTimer(recordingSeconds)}
                      </div>
                    )}

                    {recorderState === "review" && (
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs flex items-center gap-2 shadow-md">
                        ✓ REVIEW PREVIEW ({formatTimer(recordingSeconds)})
                      </div>
                    )}
                  </div>

                  {/* Rules & Helper Message Banner */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {recordingSeconds < 20
                        ? "Please record at least 20 seconds of patient consent."
                        : recordingSeconds >= 90
                        ? "Maximum recording time (90 seconds) reached."
                        : "Minimum consent duration reached. You may review and save your recording."}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 shrink-0">
                      Min 20s • Max 90s
                    </span>
                  </div>

                  {/* Control Buttons Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {recorderState === "idle" && (
                        <Button
                          onClick={handleStartRecording}
                          className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs h-9 rounded-lg px-4 flex items-center gap-2 shadow-xs cursor-pointer"
                        >
                          <Circle className="h-3 w-3 fill-current text-white animate-pulse" /> Start Recording
                        </Button>
                      )}

                      {recorderState === "recording" && (
                        <>
                          <Button
                            onClick={handlePauseRecording}
                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs h-9 rounded-lg px-4 flex items-center gap-2 shadow-xs cursor-pointer"
                          >
                            <Pause className="h-4 w-4" /> Pause
                          </Button>
                          <Button
                            onClick={handleStopRecording}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs h-9 rounded-lg px-4 flex items-center gap-2 shadow-xs cursor-pointer"
                          >
                            <Square className="h-4 w-4" /> Stop
                          </Button>
                        </>
                      )}

                      {recorderState === "paused" && (
                        <>
                          <Button
                            onClick={handleResumeRecording}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 rounded-lg px-4 flex items-center gap-2 shadow-xs cursor-pointer"
                          >
                            <Play className="h-4 w-4" /> Resume
                          </Button>
                          <Button
                            onClick={handleStopRecording}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs h-9 rounded-lg px-4 flex items-center gap-2 shadow-xs cursor-pointer"
                          >
                            <Square className="h-4 w-4" /> Stop
                          </Button>
                        </>
                      )}

                      {recorderState === "review" && (
                        <Button
                          onClick={handleRetakeRecording}
                          variant="outline"
                          className="h-9 px-4 rounded-lg font-semibold text-xs border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center gap-2 cursor-pointer"
                        >
                          <RotateCcw className="h-4 w-4" /> Retake
                        </Button>
                      )}
                    </div>

                    {recorderState === "review" && (
                      <Button
                        onClick={handleSaveConsentRecording}
                        disabled={recordingSeconds < 20}
                        className={`h-9 px-5 rounded-lg font-bold text-xs flex items-center gap-2 cursor-pointer ${
                          recordingSeconds >= 20
                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        <Check className="h-4 w-4" /> Save Recording
                      </Button>
                    )}
                  </div>
                </div>

                {/* Media Filter Tabs & Photo Upload */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 shrink-0">
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-semibold">
                    {["All", "Clinical Photos", "Consent Video Recordings"].map((cat) => {
                      const active = mediaFilter === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setMediaFilter(cat)}
                          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                            active 
                              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" 
                              : "text-slate-500 hover:text-slate-805 hover:bg-slate-100 dark:hover:bg-slate-900"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                  <div>
                    <input 
                      type="file" 
                      id="photo-upload-input" 
                      accept="image/*" 
                      multiple 
                      className="hidden" 
                      onChange={handleMockMediaUpload} 
                    />
                    <Button 
                      onClick={() => document.getElementById("photo-upload-input")?.click()}
                      variant="outline"
                      className="h-8 px-3 text-[11px] font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-blue-600 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" /> Upload Photo
                    </Button>
                  </div>
                </div>

                {/* Media Cards Grid or Empty State */}
                {patientMedia.filter(m => m.patientId === selectedPatientId && (mediaFilter === "All" || m.category === mediaFilter)).length === 0 ? (
                  <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-10 shadow-xs flex flex-col items-center justify-center text-center">
                    <div className="text-3xl mb-3">🦷</div>
                    <span className="font-bold text-slate-850 dark:text-white text-sm block mb-1">No Clinical Media Available</span>
                    <p className="max-w-md text-xs text-slate-400 dark:text-slate-550 mb-4 leading-normal font-medium">
                      Record a patient consent video or add clinical photographs.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {patientMedia
                      .filter(m => m.patientId === selectedPatientId && (mediaFilter === "All" || m.category === mediaFilter))
                      .slice()
                      .reverse()
                      .map((media) => (
                        <div key={media.id} className="group bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                          {/* Thumbnail Area */}
                          <div 
                            onClick={() => setSelectedMediaForPreview(media)}
                            className="relative aspect-video bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-850 flex items-center justify-center overflow-hidden cursor-pointer"
                          >
                            {media.type.startsWith("image/") ? (
                              <img src={media.url} alt={media.name} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                            ) : (
                              <div className="flex flex-col items-center gap-1.5 text-slate-400">
                                <Play className="h-8 w-8 text-blue-500 animate-pulse" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider">Consent Video</span>
                              </div>
                            )}

                            {/* Category Badge Overlay */}
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-[4px] bg-slate-900/80 text-white text-[8.5px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                              {media.category}
                            </span>
                          </div>

                          {/* Info Area */}
                          <div className="p-4 flex-1 flex flex-col justify-between gap-3 text-xs font-semibold">
                            <div className="space-y-1">
                              <span 
                                onClick={() => setSelectedMediaForPreview(media)}
                                className="font-bold text-slate-855 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer block truncate text-xs"
                                title={media.name}
                              >
                                {media.name}
                              </span>
                              <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                <span>{media.uploadDate}</span>
                                <span>By {media.uploadedBy}</span>
                              </div>
                            </div>

                            {/* Linked Associations Tags */}
                            {(media.toothNumber || media.treatment || media.appointment || media.prescription) && (
                              <div className="pt-2.5 border-t border-slate-50 dark:border-slate-905 flex flex-wrap gap-1">
                                {media.toothNumber && (
                                  <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-705 dark:bg-blue-955/30 dark:text-blue-400 text-[9px] font-extrabold">
                                    Tooth #{media.toothNumber}
                                  </span>
                                )}
                                {media.treatment && (
                                  <span className="px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-705 dark:bg-cyan-955/30 dark:text-cyan-400 text-[9px] font-extrabold truncate max-w-[120px]" title={media.treatment}>
                                    {media.treatment}
                                  </span>
                                )}
                                {media.appointment && (
                                  <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-705 dark:bg-purple-955/30 dark:text-purple-400 text-[9px] font-extrabold truncate max-w-[120px]" title={media.appointment}>
                                    {media.appointment}
                                  </span>
                                )}
                                {media.prescription && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-705 dark:bg-emerald-955/30 dark:text-emerald-400 text-[9px] font-extrabold truncate max-w-[120px]" title={media.prescription}>
                                    {media.prescription}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Actions Footer */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                              <button 
                                onClick={() => setSelectedMediaForPreview(media)}
                                className="hover:text-slate-800 dark:hover:text-white"
                              >
                                View
                              </button>
                              <a 
                                href={media.url}
                                download={media.name}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-slate-800 dark:hover:text-white"
                              >
                                Download
                              </a>
                              <button 
                                onClick={() => setMediaToEdit(media)}
                                className="hover:text-slate-800 dark:hover:text-white"
                              >
                                Rename
                              </button>
                              <button 
                                onClick={() => {
                                  setPatientMedia(prev => prev.filter(m => m.id !== media.id));
                                  showToast("Clinical media file deleted.", "success");
                                }}
                                className="text-red-505 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Media Preview Modal */}
                {selectedMediaForPreview && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
                      {/* Modal Header */}
                      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-850 shrink-0">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-855 dark:text-white text-sm">{selectedMediaForPreview.name}</span>
                          <span className="text-[10px] text-slate-405 dark:text-slate-500 font-medium">
                            Uploaded on {selectedMediaForPreview.uploadDate} by {selectedMediaForPreview.uploadedBy}
                          </span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setSelectedMediaForPreview(null)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-lg font-bold"
                        >
                          ×
                        </button>
                      </div>

                      {/* Modal Content */}
                      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/40 flex justify-center items-center">
                        {selectedMediaForPreview.type.startsWith("image/") ? (
                          <img src={selectedMediaForPreview.url} alt={selectedMediaForPreview.name} className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-sm" />
                        ) : (
                          <video src={selectedMediaForPreview.url} controls className="max-w-full max-h-[60vh] rounded-lg shadow-sm" autoPlay />
                        )}
                      </div>

                      {/* Modal Metadata / Footer */}
                      <div className="px-6 py-4 border-t border-slate-105 dark:border-slate-850 bg-white dark:bg-slate-955 flex justify-between items-center shrink-0 flex-wrap gap-3">
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                          {selectedMediaForPreview.toothNumber && (
                            <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-955/40 dark:text-blue-405">
                              Tooth #{selectedMediaForPreview.toothNumber}
                            </span>
                          )}
                          {selectedMediaForPreview.treatment && (
                            <span className="px-2 py-1 rounded bg-cyan-50 text-cyan-700 dark:bg-cyan-955/40 dark:text-cyan-405">
                              {selectedMediaForPreview.treatment}
                            </span>
                          )}
                          {selectedMediaForPreview.appointment && (
                            <span className="px-2 py-1 rounded bg-purple-50 text-purple-700 dark:bg-purple-955/40 dark:text-purple-405">
                              Appt: {selectedMediaForPreview.appointment}
                            </span>
                          )}
                          {selectedMediaForPreview.prescription && (
                            <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-705 dark:bg-emerald-955/40 dark:text-emerald-405">
                              Rx: {selectedMediaForPreview.prescription}
                            </span>
                          )}
                        </div>
                        <Button 
                          onClick={() => setSelectedMediaForPreview(null)}
                          className="h-9 px-4 rounded bg-slate-905 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold"
                        >
                          Close Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Media Rename / Association Edit Modal */}
                {mediaToEdit && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <form 
                      onSubmit={handleSaveMediaMetadata}
                      className="bg-white dark:bg-slate-955 border border-slate-205 dark:border-slate-850 rounded-2xl w-full max-w-md overflow-hidden shadow-xl flex flex-col p-6 space-y-4 text-xs font-semibold"
                    >
                      <div className="flex justify-between items-center border-b pb-3 mb-2 shrink-0">
                        <span className="font-bold text-slate-850 dark:text-white text-sm">Edit Media Details</span>
                        <button 
                          type="button" 
                          onClick={() => setMediaToEdit(null)}
                          className="text-slate-405 hover:text-slate-700 dark:hover:text-white text-lg font-bold"
                        >
                          ×
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label>File Name</Label>
                          <Input value={editMediaName} onChange={e => setEditMediaName(e.target.value)} required />
                        </div>

                        <div>
                          <Label>Category</Label>
                          <select 
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                            value={editMediaCategory} 
                            onChange={e => setEditMediaCategory(e.target.value as any)}
                          >
                            <option value="Clinical Photos">Clinical Photos</option>
                            <option value="Consent Video Recordings">Consent Video Recordings</option>
                          </select>
                        </div>

                        <div>
                          <Label>Link Tooth Number (Optional)</Label>
                          <Input value={editMediaTooth} onChange={e => setEditMediaTooth(e.target.value)} placeholder="e.g. 16, 28" />
                        </div>

                        <div>
                          <Label>Link Treatment (Optional)</Label>
                          <Input value={editMediaTreatment} onChange={e => setEditMediaTreatment(e.target.value)} placeholder="e.g. Root Canal Therapy" />
                        </div>

                        <div>
                          <Label>Link Appointment Date (Optional)</Label>
                          <Input value={editMediaAppointment} onChange={e => setEditMediaAppointment(e.target.value)} placeholder="e.g. 12 Aug 2026" />
                        </div>

                        <div>
                          <Label>Link Prescription (Optional)</Label>
                          <Input value={editMediaPrescription} onChange={e => setEditMediaPrescription(e.target.value)} placeholder="e.g. Amoxicillin 500mg" />
                        </div>

                        <div>
                          <Label>Uploaded By</Label>
                          <select 
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                            value={editMediaUploadedBy} 
                            onChange={e => setEditMediaUploadedBy(e.target.value)}
                          >
                            {doctors.map(d => (
                              <option key={d.name} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 dark:border-slate-850">
                        <Button 
                          type="button" 
                          onClick={() => setMediaToEdit(null)}
                          className="h-9 px-4 rounded border font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="h-9 px-4 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fadeIn">
        {activeSubTab === "All Patients" && (
          <>
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 max-w-xs w-full">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input 
                  placeholder="Filter directory by name, ID, or mobile number..." 
                  value={patientsDirectoryQuery}
                  onChange={(e) => setPatientsDirectoryQuery(e.target.value)}
                  className="w-full text-xs font-semibold outline-none bg-transparent dark:text-slate-200" 
                />
              </div>
              <div className="flex gap-3 shrink-0">
                <Button onClick={() => setActiveSubTab("Add Patient")} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-9 rounded-lg px-4">
                  <Plus className="h-4 w-4 mr-1.5" /> Register Patient
                </Button>
              </div>
            </div>
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
                {patients
                  .filter(pat => {
                    if (!patientsDirectoryQuery.trim()) return true;
                    const q = patientsDirectoryQuery.toLowerCase();
                    return pat.name.toLowerCase().includes(q) || pat.id.toLowerCase().includes(q) || pat.phone.includes(q);
                  })
                  .map((pat) => (
                    <tr key={pat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">
                        <button onClick={() => setSelectedPatientId(pat.id)} className="hover:underline text-left text-[16px] font-semibold">
                          {pat.name}
                        </button>
                      </td>
                      <td className="py-3 text-[14px] font-normal text-slate-500">{pat.phone}</td>
                      <td className="py-3 text-[14px] font-normal">{pat.age} Years ({pat.gender[0]})</td>
                      <td className="py-3 text-[12px] font-normal text-slate-455">{pat.visit}</td>
                      <td className="py-3 text-[14px] font-semibold text-red-600">{pat.balance}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[12px] font-normal ${
                          pat.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>{pat.status}</span>
                      </td>
                      <td className="py-3 text-center">
                        <button onClick={() => setSelectedPatientId(pat.id)} className="text-blue-605 hover:underline text-[14px] font-semibold">
                          Open Profile
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          </>
        )}

        {activeSubTab === "Add Patient" && (
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs max-w-xl text-xs font-semibold">
            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                onClick={() => setActiveSubTab("All Patients")}
                className="h-8 w-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-bold text-sm">Patient Intake File Registration</span>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const saved = registerPatient({
                name: newPatName,
                phone: newPatPhone,
                age: newPatAge,
                gender: newPatGender,
                address: newPatAddress,
                medicalNotes: newPatAllergies
              });
              if (saved) {
                setNewPatName("");
                setNewPatPhone("");
                setNewPatAddress("");
                setNewPatAllergies("None");
                setActiveSubTab("All Patients");
              }
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
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-xs font-semibold">
            <span className="font-bold text-sm block mb-3">Global Tooth Chart Visualizer</span>
            <Odontogram 
              chartData={{}}
              onSelectTooth={(toothNum) => {
                const tooth = ALL_TEETH.find(t => t.index === toothNum);
                alert(`Tooth #${tooth?.fdi || toothNum} status: Healthy / Normal.`);
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderTreatmentDetailsSection = (tr: TreatmentItem, onBack?: () => void) => {
    const pat = patients.find(p => p.name === tr.patient || p.id === tr.patient);
    const patName = tr.patient || "Patient";
    const patId = pat?.id || "DS-1001";
    const cost = tr.cost || (tr.name.includes("Implant") ? 35000 : tr.name.includes("Crown") ? 12000 : tr.name.includes("Orthodontic") ? 45000 : tr.name.includes("Scaling") ? 2500 : tr.name.includes("Extraction") ? 3500 : 8500);
    const paid = tr.stage === "Completed" ? cost : Math.round(cost * 0.6);
    const remaining = cost - paid;
    const invId = `INV-${tr.id.replace(/\D/g, '') || '1001'}`;

    const totalVisits = tr.totalVisits || (tr.stage === "Completed" ? 1 : 6);
    const completedVisits = tr.completedVisits !== undefined ? tr.completedVisits : (tr.stage === "Completed" ? totalVisits : (tr.stage === "Planned" ? 0 : 2));
    const progressPct = Math.min(100, Math.round((completedVisits / totalVisits) * 100));

    const timelineNodes = [
      { num: 1, title: "Consultation", date: "05 Aug 2026", isCompleted: completedVisits >= 1, isCurrent: completedVisits === 0 },
      { num: 2, title: "X-Ray & Prep", date: "08 Aug 2026", isCompleted: completedVisits >= 2, isCurrent: completedVisits === 1 },
      { num: 3, title: tr.name.includes("Root") ? "Obturation" : "Procedure", date: tr.nextVisit || "10 Sep 2026", isCompleted: completedVisits >= 3, isCurrent: completedVisits === 2 },
      { num: 4, title: "Follow-up", date: "Scheduled", isCompleted: completedVisits >= 4, isCurrent: completedVisits === 3 },
      { num: 5, title: "Restoration", date: "Upcoming", isCompleted: completedVisits >= 5, isCurrent: completedVisits === 4 },
      { num: 6, title: "Crown Fit", date: "Final Visit", isCompleted: completedVisits >= 6, isCurrent: completedVisits === 5 }
    ].slice(0, Math.max(totalVisits, 4));

    return (
      <div className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-200">
        {/* Top Back Navigation Bar */}
        {onBack && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-[12px] font-normal text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Active Treatments
            </button>
          </div>
        )}

        {/* 1. Compact Patient Header Card */}
        <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex justify-between items-center">
          <div>
            <h1 className="text-base font-semibold leading-6 text-slate-900 dark:text-white tracking-tight">
              {tr.name}
            </h1>
            <p className="text-[12px] font-normal text-slate-400 dark:text-slate-500 mt-1">
              Patient: <span className="text-[14px] font-medium text-slate-800 dark:text-slate-200">{patName}</span>
              <span className="mx-2 text-slate-300 dark:text-slate-700">•</span>
              ID: <span className="text-[14px] font-medium text-slate-800 dark:text-slate-200">{patId}</span>
            </p>
          </div>
          {onBack && (
            <button 
              type="button" 
              onClick={onBack} 
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xl font-light leading-none cursor-pointer p-1"
            >
              ×
            </button>
          )}
        </div>

        {/* 2. Horizontal Treatment Progress Timeline Card */}
        <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-base font-semibold leading-6 text-slate-900 dark:text-white tracking-tight">Treatment Progress</h2>
              <p className="text-[14px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {completedVisits} of {totalVisits} Visits Completed
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-50/80 dark:bg-slate-900/50 p-2.5 px-4 rounded-xl border border-slate-100 dark:border-slate-800/80 shrink-0">
              <div className="text-right">
                <span className="text-[12px] font-medium uppercase tracking-wider text-slate-400 block">Overall</span>
                <span className="text-[14px] font-medium text-blue-600 dark:text-blue-400">{progressPct}% Complete</span>
              </div>
              <div className="w-24 bg-slate-200/80 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[12px] font-normal text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span> ✓ Completed</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-600 inline-block"></span> ● Current Visit</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700 inline-block"></span> ○ Upcoming</span>
          </div>

          {/* Horizontal Nodes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
            {timelineNodes.map((node, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-xl border transition-all ${
                  node.isCurrent 
                    ? "bg-blue-50/70 dark:bg-blue-955/40 border-blue-100 dark:border-blue-900/40 text-blue-700 dark:text-blue-300"
                    : node.isCompleted 
                    ? "bg-slate-50/60 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/80 text-slate-800 dark:text-slate-200"
                    : "bg-slate-50/30 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800/40 opacity-60 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Visit {node.num}
                  </span>
                  {node.isCompleted && <span className="h-4 w-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">✓</span>}
                  {node.isCurrent && <span className="h-4 w-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-blue-200 dark:ring-blue-900">●</span>}
                  {!node.isCompleted && !node.isCurrent && <span className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[9px] text-slate-400">○</span>}
                </div>
                <span className="text-[14px] font-medium block truncate">{node.title}</span>
                <span className="text-[12px] font-normal text-slate-400 dark:text-slate-500 block mt-0.5 truncate">{node.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Two Main Cards Side-by-Side (Treatment Plan & Cost Summary) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Card 1: Treatment Plan (Left) */}
          <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full space-y-6">
            <div className="space-y-6">
              <h2 className="text-base font-semibold leading-6 text-slate-900 dark:text-white tracking-tight">Treatment Plan</h2>

              {/* Vertical Timeline / Checklist */}
              <div className="relative pl-7 space-y-5 text-sm before:absolute before:left-3 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-slate-200/80 dark:before:bg-slate-800">
                <div className="relative">
                  <span className="absolute -left-7 top-0.5 h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">✓</span>
                  <div className="space-y-0.5">
                    <span className="text-[14px] font-medium text-slate-900 dark:text-white block">Consultation & Assessment</span>
                    <span className="text-[12px] font-normal text-slate-400 dark:text-slate-500 block">Completed 05 Aug 2026</span>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute -left-7 top-0.5 h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">✓</span>
                  <div className="space-y-0.5">
                    <span className="text-[14px] font-medium text-slate-900 dark:text-white block">Dental X-Ray & Imaging</span>
                    <span className="text-[12px] font-normal text-slate-400 dark:text-slate-500 block">Completed 08 Aug 2026</span>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute -left-7 top-0.5 h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">✓</span>
                  <div className="space-y-0.5">
                    <span className="text-[14px] font-medium text-slate-900 dark:text-white block">Prophylaxis Cleaning</span>
                    <span className="text-[12px] font-normal text-slate-400 dark:text-slate-500 block">Completed 10 Aug 2026</span>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute -left-7 top-0.5 h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-4 ring-blue-100 dark:ring-blue-955">●</span>
                  <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-955/40 border border-blue-100 dark:border-blue-900/40 space-y-0.5">
                    <span className="text-[14px] font-semibold text-blue-700 dark:text-blue-300 block">{tr.name} – Visit 2 (Current)</span>
                    <span className="text-[12px] font-normal text-blue-600 dark:text-blue-400 block">Active Procedure Session</span>
                  </div>
                </div>

                <div className="relative opacity-60">
                  <span className="absolute -left-7 top-0.5 h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 flex items-center justify-center text-xs font-medium">○</span>
                  <div className="space-y-0.5">
                    <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300 block">Procedure Completion</span>
                    <span className="text-[12px] font-normal text-slate-400 block">Upcoming Visit</span>
                  </div>
                </div>

                <div className="relative opacity-60">
                  <span className="absolute -left-7 top-0.5 h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 flex items-center justify-center text-xs font-medium">○</span>
                  <div className="space-y-0.5">
                    <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300 block">Crown Placement</span>
                    <span className="text-[12px] font-normal text-slate-400 block">Final Step</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
              <div className="flex justify-between items-center text-[12px] font-medium text-slate-400 dark:text-slate-500">
                <span>Total Planned Visits:</span>
                <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">{totalVisits} Visits</span>
              </div>

              <Button 
                onClick={() => setActiveModal("addAppointment")}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-11 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <CalendarPlus className="h-4 w-4" /> Schedule Next Visit
              </Button>
            </div>
          </div>

          {/* Card 2: Cost Summary (Right) */}
          <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full space-y-6">
            <div className="space-y-6">
              <h2 className="text-base font-semibold leading-6 text-slate-900 dark:text-white tracking-tight">Cost Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[12px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Estimated Cost</span>
                  <span className="text-[14px] font-medium text-slate-900 dark:text-white">₹{cost.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-955/20 border border-emerald-100/60 dark:border-emerald-900/30">
                  <span className="text-[12px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Paid Amount</span>
                  <span className="text-[14px] font-medium text-emerald-700 dark:text-emerald-400">₹{paid.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-955/20 border border-amber-100/60 dark:border-amber-900/30">
                  <span className="text-[12px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400">Remaining Balance</span>
                  <span className="text-[14px] font-medium text-amber-700 dark:text-amber-400">₹{remaining.toLocaleString()}</span>
                </div>

                <div className="pt-3 space-y-2.5">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="font-medium text-slate-400 dark:text-slate-500">Last Payment</span>
                    <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">₹2,500 on 12 Aug 2026 (Cash)</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="font-medium text-slate-400 dark:text-slate-500">Payment Status</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
                      remaining === 0 
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-955/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40" 
                        : "bg-amber-50 text-amber-700 dark:bg-amber-955/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40"
                    }`}>
                      {remaining === 0 ? "Paid" : "Partially Paid"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="font-medium text-slate-400 dark:text-slate-500">Invoice Number</span>
                    <span className="text-[14px] font-medium text-blue-600 dark:text-blue-400">{invId}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <Button 
                onClick={() => {
                  const inv: InvoiceItem = {
                    id: `INV-${Date.now().toString().slice(-4)}`,
                    patientId: tr.patient,
                    patientName: tr.patient,
                    doctor: tr.doctor,
                    treatment: tr.name,
                    items: [{ description: tr.name, amount: cost }],
                    discount: 0,
                    tax: 0,
                    subtotal: cost,
                    total: cost,
                    paidAmount: paid,
                    status: remaining === 0 ? "Paid" : "Partially Paid",
                    paymentDate: "12 Aug 2026",
                    paymentLogs: []
                  };
                  setSelectedInvoiceForPayment(inv);
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-11 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Receipt className="h-4 w-4" /> Generate Invoice
              </Button>
            </div>
          </div>

        </div>
      </div>
    );
  };

  const renderTreatmentsModule = () => {
    if (selectedTreatmentDetail) {
      return renderTreatmentDetailsSection(selectedTreatmentDetail, () => setSelectedTreatmentDetail(null));
    }

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs overflow-x-auto">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
            <span className="text-[13px] font-bold text-slate-900 dark:text-white">Active Treatment Directory</span>
          </div>
          <table className="w-full text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="border-b text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="pb-2.5 w-1/6">Treatment Name</th>
                <th className="pb-2.5 w-1/6">Patient</th>
                <th className="pb-2.5 w-1/6">Doctor</th>
                <th className="pb-2.5 w-1/6">Visits</th>
                <th className="pb-2.5 w-1/6">Status</th>
                <th className="pb-2.5 w-1/6 text-right">Estimated Cost (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-705">
              {treatments.map((tr) => {
                  const total = tr.totalVisits || (tr.stage === "Completed" ? 1 : 3);
                  const completed = tr.completedVisits !== undefined ? tr.completedVisits : (tr.stage === "Completed" ? total : (tr.stage === "Planned" ? 0 : 1));
                  const planName = tr.treatmentPlan || tr.name;
                  const costVal = tr.cost !== undefined && tr.cost > 0 ? tr.cost : (planName.includes("Implant") ? 35000 : planName.includes("Crown") ? 12000 : planName.includes("Orthodontic") ? 45000 : planName.includes("Scaling") ? 2500 : planName.includes("Extraction") ? 3500 : 8500);
                  const isCompleted = tr.stage === "Completed";

                  return (
                    <tr 
                      key={tr.id} 
                      onClick={() => setSelectedTreatmentDetail(tr)}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-900/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap group-hover:text-blue-600 dark:group-hover:text-blue-400">{tr.name}</td>
                      <td className="py-3 whitespace-nowrap">{tr.patient}</td>
                      <td className="py-3 whitespace-nowrap">{tr.doctor}</td>
                      <td className="py-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {completed} / {total} Visits
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        {isCompleted ? (
                          <span className="h-[22px] px-2.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                            <span className="text-[9px]">⚪</span> Completed
                          </span>
                        ) : (
                          <span className="h-[22px] px-2.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                            <span className="text-[9px]">🟢</span> Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        ₹{costVal.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

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
                  <td className="py-3 font-black">₹{inv.total.toLocaleString()}</td>
                  <td className="py-3 text-emerald-600 font-extrabold">₹{inv.paidAmount.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      inv.status === "Paid" ? "bg-emerald-50 text-emerald-700" :
                      inv.status === "Partially Paid" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                    }`}>{inv.status}</span>
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        title="Generate Invoice"
                        onClick={() => setLastGeneratedReceipt(inv)}
                        className="h-9 w-9 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-955/40 dark:text-blue-400 dark:hover:bg-blue-900/60 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Print"
                        onClick={() => {
                          setLastGeneratedReceipt(inv);
                          setTimeout(() => {
                            window.print();
                          }, 150);
                        }}
                        className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      {inv.status !== "Paid" && (
                        <button
                          type="button"
                          title="Collect Payment"
                          onClick={() => {
                            setSelectedInvoiceForPayment(inv);
                            setPaymentCollectAmt(inv.total - inv.paidAmount);
                            setPaymentMethod("Cash");
                            setPayDiscountType(inv.discountType || "percentage");
                            setPayDiscountValue(inv.discountValue || inv.discount);
                            setPayDiscountPercent(inv.discount);
                            setPayTaxPercent(inv.tax);
                            setPayCustomItems([]);
                          }}
                          className="h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                        >
                          <CreditCard className="h-4 w-4" />
                        </button>
                      )}
                    </div>
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
                  <span className="font-bold text-slate-800 block">{pay.patient}</span>
                  <p className="text-slate-450 mt-0.5 text-[10px]">Method: {pay.method} • Invoice: {pay.invId} • Doctor: {pay.doctor} • Date: {pay.date}</p>
                </div>
                <span className="font-black text-slate-900">₹{pay.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderReportsModule = () => {
    // Current active sub-tab inside Reports (defaults to Revenue if invalid)
    const currentSubTab = ["Revenue", "Patients", "Treatments", "Appointments"].includes(activeSubTab)
      ? activeSubTab
      : "Revenue";

    // Helper calculation for Reports -> Patients Analytics
    const getPatientAnalyticsData = () => {
      let newCount = 12;
      let returningCount = 24;
      let newRev = 46200;
      let returningRev = 92400;
      let newGrowth = "+14.2%";
      let returningGrowth = "+18.6%";

      if (reportsFilter === "Today") {
        newCount = 3;
        returningCount = 6;
        newRev = 11500;
        returningRev = 23000;
        newGrowth = "+5.0%";
        returningGrowth = "+12.0%";
      } else if (reportsFilter === "Week") {
        newCount = 8;
        returningCount = 16;
        newRev = 30800;
        returningRev = 61600;
        newGrowth = "+8.5%";
        returningGrowth = "+15.2%";
      } else if (reportsFilter === "Month") {
        newCount = 22;
        returningCount = 45;
        newRev = 84700;
        returningRev = 173250;
        newGrowth = "+12.4%";
        returningGrowth = "+21.0%";
      } else if (reportsFilter === "Year" || reportsFilter === "Custom") {
        newCount = 98;
        returningCount = 184;
        newRev = 377300;
        returningRev = 708400;
        newGrowth = "+22.1%";
        returningGrowth = "+28.4%";
      }

      const totalRev = newRev + returningRev;
      const totalPts = newCount + returningCount;
      const avgRevPerPt = totalPts > 0 ? Math.round(totalRev / totalPts) : 0;
      const returningRate = totalPts > 0 ? ((returningCount / totalPts) * 100).toFixed(1) + "%" : "0%";
      const avgRevPerNew = newCount > 0 ? Math.round(newRev / newCount) : 0;
      const avgRevPerReturning = returningCount > 0 ? Math.round(returningRev / returningCount) : 0;

      const monthlyPatientTrends = [
        { month: "Jan", newPts: 12, returningPts: 18, newRev: 46200, returningRev: 69300 },
        { month: "Feb", newPts: 15, returningPts: 21, newRev: 57750, returningRev: 80850 },
        { month: "Mar", newPts: 19, returningPts: 25, newRev: 73150, returningRev: 96250 },
        { month: "Apr", newPts: 14, returningPts: 22, newRev: 53900, returningRev: 84700 },
        { month: "May", newPts: 16, returningPts: 24, newRev: 61600, returningRev: 92400 },
        { month: "Jun", newPts: 18, returningPts: 28, newRev: 69300, returningRev: 107800 }
      ];

      return {
        newCount,
        returningCount,
        totalPts,
        newRev,
        returningRev,
        totalRev,
        avgRevPerPt,
        returningRate,
        avgRevPerNew,
        avgRevPerReturning,
        newGrowth,
        returningGrowth,
        highestRevMonth: "March (₹1,69,400)",
        highestAcquisitionMonth: "March (19 New Patients)",
        monthlyPatientTrends
      };
    };

    // Helper calculation for Reports -> Treatments Analytics
    const getTreatmentAnalyticsData = () => {
      let totalTr = 42;
      let activeTr = 12;
      let completedTr = 30;
      let totalRev = 285000;

      if (reportsFilter === "Today") {
        totalTr = 5;
        activeTr = 2;
        completedTr = 3;
        totalRev = 18500;
      } else if (reportsFilter === "Week") {
        totalTr = 18;
        activeTr = 5;
        completedTr = 13;
        totalRev = 95000;
      } else if (reportsFilter === "Month") {
        totalTr = 42;
        activeTr = 12;
        completedTr = 30;
        totalRev = 285000;
      } else if (reportsFilter === "Year") {
        totalTr = 184;
        activeTr = 28;
        completedTr = 156;
        totalRev = 1240000;
      } else if (reportsFilter === "Custom") {
        const startMs = new Date(customStartDate).getTime();
        const endMs = new Date(customEndDate).getTime();
        const days = Math.max(1, Math.round(Math.abs((endMs - startMs) / (1000 * 60 * 60 * 24))));
        
        totalTr = Math.max(3, Math.round(days * 1.8));
        activeTr = Math.max(1, Math.round(totalTr * 0.3));
        completedTr = Math.max(1, totalTr - activeTr);
        totalRev = totalTr * 6200;
      }

      const completionRate = totalTr > 0 ? ((completedTr / totalTr) * 100).toFixed(1) + "%" : "0%";

      const monthlyPerformance = [
        { month: "Jan", started: Math.round(totalTr * 0.33), completed: Math.round(completedTr * 0.33) },
        { month: "Feb", started: Math.round(totalTr * 0.42), completed: Math.round(completedTr * 0.45) },
        { month: "Mar", started: Math.round(totalTr * 0.52), completed: Math.round(completedTr * 0.55) },
        { month: "Apr", started: Math.round(totalTr * 0.38), completed: Math.round(completedTr * 0.40) },
        { month: "May", started: Math.round(totalTr * 0.45), completed: Math.round(completedTr * 0.48) },
        { month: "Jun", started: Math.round(totalTr * 0.50), completed: Math.round(completedTr * 0.52) }
      ];

      const mostPerformed = [
        { name: "Root Canal Therapy", count: Math.round(totalTr * 0.35), pct: 90 },
        { name: "Scaling & Polishing", count: Math.round(totalTr * 0.28), pct: 75 },
        { name: "Dental Implant", count: Math.round(totalTr * 0.20), pct: 58 },
        { name: "Orthodontic Aligners", count: Math.round(totalTr * 0.12), pct: 42 },
        { name: "Surgical Extraction", count: Math.round(totalTr * 0.08), pct: 32 }
      ];

      const revenueByTreatment = [
        { name: "Dental Implant", rev: Math.round(totalRev * 0.38) },
        { name: "Orthodontic Aligners", rev: Math.round(totalRev * 0.28) },
        { name: "Root Canal Therapy", rev: Math.round(totalRev * 0.22) },
        { name: "Scaling & Polishing", rev: Math.round(totalRev * 0.08) },
        { name: "Surgical Extraction", rev: Math.round(totalRev * 0.04) }
      ];

      return {
        totalTr,
        activeTr,
        completedTr,
        completionRate,
        totalRev,
        monthlyPerformance,
        mostPerformed,
        revenueByTreatment
      };
    };

    // Helper calculation for Reports -> Appointments Analytics
    const getAppointmentAnalyticsData = () => {
      let totalAppts = 56;
      let completedAppts = 38;
      let upcomingAppts = 12;
      let cancelledAppts = 4;
      let noshowAppts = 2;

      if (reportsFilter === "Today") {
        totalAppts = 8;
        completedAppts = 5;
        upcomingAppts = 2;
        cancelledAppts = 1;
        noshowAppts = 0;
      } else if (reportsFilter === "Week") {
        totalAppts = 26;
        completedAppts = 18;
        upcomingAppts = 5;
        cancelledAppts = 2;
        noshowAppts = 1;
      } else if (reportsFilter === "Month") {
        totalAppts = 56;
        completedAppts = 38;
        upcomingAppts = 12;
        cancelledAppts = 4;
        noshowAppts = 2;
      } else if (reportsFilter === "Year") {
        totalAppts = 240;
        completedAppts = 182;
        upcomingAppts = 32;
        cancelledAppts = 18;
        noshowAppts = 8;
      } else if (reportsFilter === "Custom") {
        const startMs = new Date(customStartDate).getTime();
        const endMs = new Date(customEndDate).getTime();
        const days = Math.max(1, Math.round(Math.abs((endMs - startMs) / (1000 * 60 * 60 * 24))));

        totalAppts = Math.max(3, Math.round(days * 2.5));
        completedAppts = Math.max(1, Math.round(totalAppts * 0.65));
        upcomingAppts = Math.max(1, Math.round(totalAppts * 0.20));
        cancelledAppts = Math.max(0, Math.round(totalAppts * 0.10));
        noshowAppts = Math.max(0, totalAppts - completedAppts - upcomingAppts - cancelledAppts);
      }

      const cancellationRate = totalAppts > 0 ? ((cancelledAppts / totalAppts) * 100).toFixed(1) + "%" : "0%";

      // Appointment Performance over time
      let performanceBars = [
        { label: "Jan", scheduled: 38, completed: 28, cancelled: 4 },
        { label: "Feb", scheduled: 44, completed: 32, cancelled: 5 },
        { label: "Mar", scheduled: 52, completed: 40, cancelled: 6 },
        { label: "Apr", scheduled: 41, completed: 30, cancelled: 3 },
        { label: "May", scheduled: 46, completed: 35, cancelled: 4 },
        { label: "Jun", scheduled: 50, completed: 38, cancelled: 4 }
      ];

      if (reportsFilter === "Today") {
        performanceBars = [
          { label: "09:00 AM", scheduled: 2, completed: 2, cancelled: 0 },
          { label: "11:00 AM", scheduled: 3, completed: 2, cancelled: 1 },
          { label: "02:00 PM", scheduled: 2, completed: 1, cancelled: 0 },
          { label: "04:00 PM", scheduled: 2, completed: 0, cancelled: 0 },
          { label: "06:00 PM", scheduled: 1, completed: 0, cancelled: 0 }
        ];
      } else if (reportsFilter === "Week") {
        performanceBars = [
          { label: "Mon", scheduled: 5, completed: 4, cancelled: 1 },
          { label: "Tue", scheduled: 6, completed: 5, cancelled: 0 },
          { label: "Wed", scheduled: 8, completed: 6, cancelled: 1 },
          { label: "Thu", scheduled: 5, completed: 4, cancelled: 0 },
          { label: "Fri", scheduled: 7, completed: 5, cancelled: 1 },
          { label: "Sat", scheduled: 4, completed: 3, cancelled: 0 }
        ];
      } else if (reportsFilter === "Custom") {
        performanceBars = [
          { label: "P1", scheduled: Math.round(totalAppts * 0.2), completed: Math.round(completedAppts * 0.2), cancelled: 1 },
          { label: "P2", scheduled: Math.round(totalAppts * 0.3), completed: Math.round(completedAppts * 0.3), cancelled: 1 },
          { label: "P3", scheduled: Math.round(totalAppts * 0.3), completed: Math.round(completedAppts * 0.3), cancelled: 1 },
          { label: "P4", scheduled: Math.round(totalAppts * 0.2), completed: Math.round(completedAppts * 0.2), cancelled: 0 }
        ];
      }

      // Appointment Status Distribution
      const statusDistribution = [
        { name: "Completed", count: completedAppts, pct: Math.round((completedAppts / Math.max(1, totalAppts)) * 100), color: "bg-emerald-500", text: "text-emerald-600" },
        { name: "Scheduled / Upcoming", count: upcomingAppts, pct: Math.round((upcomingAppts / Math.max(1, totalAppts)) * 100), color: "bg-blue-600", text: "text-blue-600" },
        { name: "Cancelled", count: cancelledAppts, pct: Math.round((cancelledAppts / Math.max(1, totalAppts)) * 100), color: "bg-rose-500", text: "text-rose-600" },
        { name: "No-show", count: noshowAppts, pct: Math.round((noshowAppts / Math.max(1, totalAppts)) * 100), color: "bg-amber-500", text: "text-amber-600" }
      ];

      // Schedule Utilization
      const totalSlots = Math.round(totalAppts * 1.35);
      const bookedSlots = totalAppts;
      const availableSlots = totalSlots - bookedSlots;
      const utilizationRate = totalSlots > 0 ? ((bookedSlots / totalSlots) * 100).toFixed(1) + "%" : "0%";

      const scheduleUtilization = {
        busiestDay: "Wednesday (8 Booked Slots)",
        busiestSlot: "11:00 AM – 12:00 PM (100% Booked)",
        totalSlots,
        availableSlots,
        utilizationRate
      };

      // Doctor Appointment Performance
      const doctorPerformance = [
        { doctor: "Dr. Deepa Kodali", total: Math.round(totalAppts * 0.45), completed: Math.round(completedAppts * 0.45), cancelled: 2, noshow: 1 },
        { doctor: "Dr. Sharma", total: Math.round(totalAppts * 0.35), completed: Math.round(completedAppts * 0.35), cancelled: 1, noshow: 1 },
        { doctor: "Dr. Raghuram", total: Math.round(totalAppts * 0.20), completed: Math.round(completedAppts * 0.20), cancelled: 1, noshow: 0 }
      ];

      // Appointments by Type
      const appointmentsByType = [
        { type: "Consultation", count: Math.round(totalAppts * 0.38), pct: 90 },
        { type: "Treatment", count: Math.round(totalAppts * 0.32), pct: 75 },
        { type: "Follow-up", count: Math.round(totalAppts * 0.18), pct: 45 },
        { type: "Review", count: Math.round(totalAppts * 0.08), pct: 25 },
        { type: "Emergency", count: Math.round(totalAppts * 0.04), pct: 12 }
      ];

      return {
        totalAppts,
        completedAppts,
        upcomingAppts,
        cancellationRate,
        performanceBars,
        statusDistribution,
        scheduleUtilization,
        doctorPerformance,
        appointmentsByType
      };
    };

    const patientStats = getPatientAnalyticsData();
    const trStats = getTreatmentAnalyticsData();
    const apptStats = getAppointmentAnalyticsData();

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* SUB-TAB 1: REVENUE */}
        {currentSubTab === "Revenue" && (
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
                    onClick={() => {
                      setReportsFilter(tf);
                      setAppliedCustomLabel(null);
                    }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      active ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    {tf}
                  </button>
                );
              })}
              <button
                onClick={() => setCustomRangeModalOpen(true)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  reportsFilter === "Custom" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                {reportsFilter === "Custom" && appliedCustomLabel ? appliedCustomLabel : "Custom"}
              </button>
            </div>

            {/* Analytics KPI reporting grid */}
            <section className="grid gap-4 grid-cols-2 md:grid-cols-4">
              {[
                { title: "Total Revenue", count: `₹${reportStats.revenue.toLocaleString()}`, desc: "Collected earnings", icon: <span className="font-extrabold text-blue-500 text-sm">₹</span> },
                { title: "Patient Directory", count: reportStats.patients, desc: "Active clinical files", icon: <Users className="h-4 w-4 text-cyan-500" /> },
                { title: "Treatments Completed", count: reportStats.treatments, desc: "Finished checkouts", icon: <Stethoscope className="h-4 w-4 text-purple-500" /> },
                { title: "Appointments logged", count: reportStats.appointments, desc: "Total scheduled units", icon: <Calendar className="h-4 w-4 text-amber-500" /> }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
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

            {/* Existing Revenue Performance Chart */}
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <span className="font-bold text-sm block text-slate-900 dark:text-white">Revenue Performance Chart</span>
              <div className="h-48 w-full flex items-end justify-between gap-4 pt-8">
                {[
                  { label: "Mon", val: "h-20" },
                  { label: "Tue", val: "h-36" },
                  { label: "Wed", val: "h-28" },
                  { label: "Thu", val: "h-40" },
                  { label: "Fri", val: "h-16" },
                  { label: "Sat", val: "h-32" },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className={`w-full rounded-t-lg bg-blue-600/80 hover:bg-blue-650 transition-all ${bar.val}`} />
                    <span className="text-[10px] text-slate-400 font-bold">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: PATIENTS (DEDICATED PATIENT ANALYTICS DASHBOARD) */}
        {currentSubTab === "Patients" && (
          <div className="space-y-6 animate-fadeIn">
            {/* 2. TOP FILTER */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <TrendingUp className="h-4 w-4 text-blue-600 animate-pulse" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timeframe:</span>
              {(["Today", "Week", "Month", "Year", "Custom"] as const).map((tf) => {
                const active = reportsFilter === tf;
                return (
                  <button
                    key={tf}
                    onClick={() => setReportsFilter(tf as any)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      active ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    {tf}
                  </button>
                );
              })}
            </div>

            {/* 3. SUMMARY CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">NEW PATIENTS</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">{patientStats.newCount}</span>
                <span className="text-[11px] text-slate-400 font-medium block">New patients</span>
              </div>

              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">RETURNING PATIENTS</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block">{patientStats.returningCount}</span>
                <span className="text-[11px] text-slate-400 font-medium block">Returning patients</span>
              </div>

              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">AVERAGE REVENUE / PATIENT</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white block">₹{patientStats.avgRevPerPt.toLocaleString()}</span>
                <span className="text-[11px] text-slate-400 font-medium block">Average revenue</span>
              </div>

              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">RETURNING PATIENT RATE</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">{patientStats.returningRate}</span>
                <span className="text-[11px] text-slate-400 font-medium block">Repeat patient ratio</span>
              </div>
            </div>

            {/* 4. NEW VS RETURNING PATIENTS CHART */}
            <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">
                    New vs Returning Patients
                  </h2>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Compare patient visits and revenue generated by new and returning patients.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[12px] font-medium shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-blue-600 inline-block" />
                    <span className="text-slate-700 dark:text-slate-300">New Patients</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-indigo-600 inline-block" />
                    <span className="text-slate-700 dark:text-slate-300">Returning Patients</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">PATIENT VISITS COMPARISON</span>
                  <div className="flex justify-between items-baseline pt-1 text-sm font-semibold">
                    <span className="text-blue-600">New: {patientStats.newCount}</span>
                    <span className="text-indigo-600">Returning: {patientStats.returningCount}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 flex overflow-hidden">
                    <div style={{ width: `${(patientStats.newCount / Math.max(1, patientStats.totalPts)) * 100}%` }} className="bg-blue-600" />
                    <div style={{ width: `${(patientStats.returningCount / Math.max(1, patientStats.totalPts)) * 100}%` }} className="bg-indigo-600" />
                  </div>
                </div>

                <div className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">PATIENT SHARE RATIO</span>
                  <div className="flex justify-between items-baseline pt-1 text-sm font-semibold">
                    <span className="text-blue-600">New Share: {((patientStats.newCount / Math.max(1, patientStats.totalPts)) * 100).toFixed(1)}%</span>
                    <span className="text-indigo-600">Returning Share: {patientStats.returningRate}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 flex overflow-hidden">
                    <div style={{ width: `${(patientStats.newCount / Math.max(1, patientStats.totalPts)) * 100}%` }} className="bg-blue-600" />
                    <div style={{ width: `${(patientStats.returningCount / Math.max(1, patientStats.totalPts)) * 100}%` }} className="bg-indigo-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* 5. REVENUE COMPARISON */}
            <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">
                  Revenue by Patient Type
                </h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Detailed earnings breakdown and average spend comparison.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                <div className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-blue-50/30 dark:bg-slate-900/40 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">NEW PATIENT REVENUE</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400 block">₹{patientStats.newRev.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-500 font-normal">From {patientStats.newCount} new registrations</span>
                </div>

                <div className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-indigo-50/30 dark:bg-slate-900/40 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">RETURNING PATIENT REVENUE</span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 block">₹{patientStats.returningRev.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-500 font-normal">From {patientStats.returningCount} repeat visits</span>
                </div>

                <div className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">AVG REVENUE / NEW PATIENT</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400 block">₹{patientStats.avgRevPerNew.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-500 font-normal">Average spend per new patient</span>
                </div>

                <div className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">AVG REVENUE / RETURNING</span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 block">₹{patientStats.avgRevPerReturning.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-500 font-normal">Average spend per returnee</span>
                </div>
              </div>
            </div>

            {/* 6. MONTHLY PATIENT TREND */}
            <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div>
                  <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">
                    Monthly Patient Trends
                  </h2>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Month-by-month new vs returning patient volume.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[12px] font-medium shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-blue-600 inline-block" />
                    <span className="text-slate-700 dark:text-slate-300">New Patients</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-indigo-600 inline-block" />
                    <span className="text-slate-700 dark:text-slate-300">Returning Patients</span>
                  </div>
                </div>
              </div>

              {/* Grouped Bar Chart */}
              <div className="pt-2">
                <div className="h-56 w-full flex items-end justify-between gap-3 sm:gap-6 pt-8 px-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  {patientStats.monthlyPatientTrends.map((m, i) => {
                    const maxCount = Math.max(...patientStats.monthlyPatientTrends.map(b => Math.max(b.newPts, b.returningPts))) || 1;
                    const newPct = Math.round((m.newPts / maxCount) * 100);
                    const returnPct = Math.round((m.returningPts / maxCount) * 100);

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        {/* Tooltip */}
                        <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center pointer-events-none transition-all duration-150">
                          <div className="bg-slate-900 text-white text-[11px] py-1.5 px-3 rounded-lg shadow-lg font-medium whitespace-nowrap space-y-0.5">
                            <span className="font-semibold block text-slate-300 border-b border-slate-800 pb-0.5 mb-0.5">{m.month} Patients</span>
                            <span className="text-blue-300 block">New: {m.newPts} Patients</span>
                            <span className="text-indigo-300 block">Returning: {m.returningPts} Patients</span>
                          </div>
                          <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                        </div>

                        <div className="w-full flex items-end justify-center gap-1.5 h-full">
                          <div style={{ height: `${Math.max(newPct, 12)}%` }} className="w-1/2 max-w-[24px] sm:max-w-[28px] bg-blue-600 hover:bg-blue-500 rounded-t-md transition-all duration-300" />
                          <div style={{ height: `${Math.max(returnPct, 12)}%` }} className="w-1/2 max-w-[24px] sm:max-w-[28px] bg-indigo-600 hover:bg-indigo-500 rounded-t-md transition-all duration-300" />
                        </div>

                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2.5 text-center">
                          {m.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 3: TREATMENTS (REFINED TREATMENT ANALYTICS DASHBOARD) */}
        {currentSubTab === "Treatments" && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. TIMEFRAME FILTER */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <TrendingUp className="h-4 w-4 text-blue-600 animate-pulse" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timeframe:</span>
              {(["Today", "Week", "Month", "Year"] as const).map((tf) => {
                const active = reportsFilter === tf;
                return (
                  <button
                    key={tf}
                    onClick={() => {
                      setReportsFilter(tf);
                      setAppliedCustomLabel(null);
                    }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      active ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    {tf}
                  </button>
                );
              })}
              <button
                onClick={() => setCustomRangeModalOpen(true)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  reportsFilter === "Custom" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                {reportsFilter === "Custom" && appliedCustomLabel ? appliedCustomLabel : "Custom"}
              </button>
            </div>

            {/* 2. SUMMARY CARDS (ONLY 4) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">TOTAL TREATMENTS</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white block">{trStats.totalTr}</span>
                <span className="text-[11px] text-slate-400 font-medium block">All logged procedures</span>
              </div>

              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">ACTIVE TREATMENTS</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">{trStats.activeTr}</span>
                <span className="text-[11px] text-slate-400 font-medium block">In progress</span>
              </div>

              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">COMPLETED TREATMENTS</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">{trStats.completedTr}</span>
                <span className="text-[11px] text-slate-400 font-medium block">Finished procedures</span>
              </div>

              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">COMPLETION RATE</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block">{trStats.completionRate}</span>
                <span className="text-[11px] text-slate-400 font-medium block">Completion ratio</span>
              </div>
            </div>

            {/* 3. TREATMENT PERFORMANCE */}
            <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">
                    Treatment Performance
                  </h2>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Monthly comparison between treatments started and completed.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[12px] font-medium shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-blue-600 inline-block" />
                    <span className="text-slate-700 dark:text-slate-300">Started</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-slate-700 dark:text-slate-300">Completed</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="h-56 w-full flex items-end justify-between gap-3 sm:gap-6 pt-8 px-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  {trStats.monthlyPerformance.map((m, i) => {
                    const maxVal = Math.max(...trStats.monthlyPerformance.map(b => Math.max(b.started, b.completed))) || 1;
                    const startedPct = Math.round((m.started / maxVal) * 100);
                    const completedPct = Math.round((m.completed / maxVal) * 100);

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center pointer-events-none transition-all duration-150">
                          <div className="bg-slate-900 text-white text-[11px] py-1.5 px-3 rounded-lg shadow-lg font-medium whitespace-nowrap space-y-0.5">
                            <span className="font-semibold block text-slate-300 border-b border-slate-800 pb-0.5 mb-0.5">{m.month} Procedures</span>
                            <span className="text-blue-300 block">Started: {m.started}</span>
                            <span className="text-emerald-300 block">Completed: {m.completed}</span>
                          </div>
                          <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                        </div>

                        <div className="w-full flex items-end justify-center gap-1.5 h-full">
                          <div style={{ height: `${Math.max(startedPct, 12)}%` }} className="w-1/2 max-w-[24px] sm:max-w-[28px] bg-blue-600 hover:bg-blue-500 rounded-t-md transition-all duration-300" />
                          <div style={{ height: `${Math.max(completedPct, 12)}%` }} className="w-1/2 max-w-[24px] sm:max-w-[28px] bg-emerald-500 hover:bg-emerald-400 rounded-t-md transition-all duration-300" />
                        </div>

                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2.5 text-center">
                          {m.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. MOST PERFORMED TREATMENTS & REVENUE BY TREATMENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MOST PERFORMED TREATMENTS */}
              <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">
                    Most Performed Treatments
                  </h2>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Ranked by frequency of clinical records.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {trStats.mostPerformed.map((item, idx) => (
                    <div key={idx} className="space-y-1 text-xs font-semibold">
                      <div className="flex justify-between items-center text-slate-800 dark:text-slate-200">
                        <span>{idx + 1}. {item.name}</span>
                        <span className="font-mono text-slate-500">{item.count} records</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div style={{ width: `${item.pct}%` }} className="bg-blue-600 h-full rounded-full transition-all duration-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* REVENUE BY TREATMENT */}
              <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">
                    Revenue by Treatment
                  </h2>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Financial generation by procedure type.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {trStats.revenueByTreatment.map((item, idx) => {
                    const maxRev = Math.max(...trStats.revenueByTreatment.map(r => r.rev)) || 1;
                    const pct = Math.round((item.rev / maxRev) * 100);
                    return (
                      <div key={idx} className="space-y-1 text-xs font-semibold">
                        <div className="flex justify-between items-center text-slate-800 dark:text-slate-200">
                          <span>{item.name}</span>
                          <span className="font-mono text-blue-600 dark:text-blue-400">₹{item.rev.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div style={{ width: `${pct}%` }} className="bg-indigo-600 h-full rounded-full transition-all duration-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CUSTOM DATE RANGE MODAL */}
            {customRangeModalOpen && (
              <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl max-w-md w-full space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Select Custom Date Range</h3>
                    </div>
                    <button
                      onClick={() => setCustomRangeModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1.5">
                      <label className="text-slate-500 dark:text-slate-400 block">Start Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-500 dark:text-slate-400 block">End Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCustomRangeModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (customStartDate && customEndDate) {
                          const startFmt = new Date(customStartDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                          const endFmt = new Date(customEndDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                          setAppliedCustomLabel(`${startFmt} – ${endFmt}`);
                          setReportsFilter("Custom");
                          setCustomRangeModalOpen(false);
                        }
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs cursor-pointer transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 4: APPOINTMENTS (DEDICATED APPOINTMENT ANALYTICS DASHBOARD) */}
        {currentSubTab === "Appointments" && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. TIMEFRAME FILTER */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <TrendingUp className="h-4 w-4 text-blue-600 animate-pulse" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timeframe:</span>
              {(["Today", "Week", "Month", "Year"] as const).map((tf) => {
                const active = reportsFilter === tf;
                return (
                  <button
                    key={tf}
                    onClick={() => {
                      setReportsFilter(tf);
                      setAppliedCustomLabel(null);
                    }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      active ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    {tf}
                  </button>
                );
              })}
              <button
                onClick={() => setCustomRangeModalOpen(true)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  reportsFilter === "Custom" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                {reportsFilter === "Custom" && appliedCustomLabel ? appliedCustomLabel : "Custom"}
              </button>
            </div>

            {/* 2. SUMMARY CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">TOTAL APPOINTMENTS</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white block">{apptStats.totalAppts}</span>
                <span className="text-[11px] text-slate-400 font-medium block">Total in selected period</span>
              </div>

              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">COMPLETED</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">{apptStats.completedAppts}</span>
                <span className="text-[11px] text-slate-400 font-medium block">Successfully completed</span>
              </div>

              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">UPCOMING</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">{apptStats.upcomingAppts}</span>
                <span className="text-[11px] text-slate-400 font-medium block">Scheduled future bookings</span>
              </div>

              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">CANCELLATION RATE</span>
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400 block">{apptStats.cancellationRate}</span>
                <span className="text-[11px] text-slate-400 font-medium block">Cancelled ratio</span>
              </div>
            </div>

            {/* 3. APPOINTMENT STATUS */}
            <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">
                  Appointment Status
                </h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Distribution across appointment lifecycle states.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {apptStats.statusDistribution.map((st, idx) => (
                  <div key={idx} className="space-y-1 text-xs font-semibold">
                    <div className="flex justify-between items-center text-slate-800 dark:text-slate-200">
                      <span>{st.name}</span>
                      <span className={`font-mono ${st.text}`}>{st.count} ({st.pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div style={{ width: `${st.pct}%` }} className={`${st.color} h-full rounded-full transition-all duration-500`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSettingsModule = () => {
    const settingsTabs = ["Clinic", "Doctors", "Staff", "Integrations", "Backup"];
    const currentTab = settingsTabs.includes(activeSubTab) ? activeSubTab : "Clinic";

    // Helper handlers for Doctor Add/Edit/Delete
    const handleOpenAddDoctor = () => {
      setEditingDoctor(null);
      setDocFormName("");
      setDocFormSpeciality("General Dentist");
      setDocFormPhone("");
      setDocFormStatus("Available");
      setDoctorModalOpen(true);
    };

    const handleOpenEditDoctor = (doc: Doctor) => {
      setEditingDoctor(doc);
      setDocFormName(doc.name);
      setDocFormSpeciality(doc.speciality);
      setDocFormPhone(doc.phone || "+91 98765 43210");
      setDocFormStatus(doc.status);
      setDoctorModalOpen(true);
    };

    const handleSaveDoctor = (e: React.FormEvent) => {
      e.preventDefault();
      if (!docFormName.trim()) return;

      if (editingDoctor) {
        setDoctors(prev =>
          prev.map(d =>
            d.name === editingDoctor.name
              ? { ...d, name: docFormName.trim(), speciality: docFormSpeciality, phone: docFormPhone.trim(), status: docFormStatus }
              : d
          )
        );
        showToast("Doctor details updated successfully.", "success");
      } else {
        const newDoc: Doctor = {
          name: docFormName.startsWith("Dr.") ? docFormName.trim() : `Dr. ${docFormName.trim()}`,
          speciality: docFormSpeciality,
          phone: docFormPhone.trim() || "+91 98765 43210",
          status: docFormStatus
        };
        setDoctors(prev => [...prev, newDoc]);
        showToast("New doctor registered successfully.", "success");
      }
      setDoctorModalOpen(false);
    };

    const handleDeleteDoctor = () => {
      if (!deleteDoctorConfirm) return;
      setDoctors(prev => prev.filter(d => d.name !== deleteDoctorConfirm.name));
      showToast(`${deleteDoctorConfirm.name} removed from clinic records.`, "success");
      setDeleteDoctorConfirm(null);
    };

    // Helper handlers for Staff Add/Edit/Delete
    const handleOpenAddStaff = () => {
      setEditingStaff(null);
      setStaffFormName("");
      setStaffFormRole("Desk Operations");
      setStaffFormPhone("");
      setStaffFormStatus("Active");
      setStaffModalOpen(true);
    };

    const handleOpenEditStaff = (st: Staff) => {
      setEditingStaff(st);
      setStaffFormName(st.name);
      setStaffFormRole(st.role);
      setStaffFormPhone(st.phone);
      setStaffFormStatus(st.status);
      setStaffModalOpen(true);
    };

    const handleSaveStaff = (e: React.FormEvent) => {
      e.preventDefault();
      if (!staffFormName.trim()) return;

      if (editingStaff) {
        setStaffList(prev =>
          prev.map(s =>
            s.id === editingStaff.id
              ? { ...s, name: staffFormName.trim(), role: staffFormRole.trim(), phone: staffFormPhone.trim(), status: staffFormStatus }
              : s
          )
        );
        showToast("Staff member updated successfully.", "success");
      } else {
        const newStaff: Staff = {
          id: `st-${Date.now()}`,
          name: staffFormName.trim(),
          role: staffFormRole.trim(),
          phone: staffFormPhone.trim() || "+91 98765 00000",
          status: staffFormStatus
        };
        setStaffList(prev => [...prev, newStaff]);
        showToast("New staff member added successfully.", "success");
      }
      setStaffModalOpen(false);
    };

    const handleDeleteStaff = () => {
      if (!deleteStaffConfirm) return;
      setStaffList(prev => prev.filter(s => s.id !== deleteStaffConfirm.id));
      showToast(`${deleteStaffConfirm.name} removed from staff records.`, "success");
      setDeleteStaffConfirm(null);
    };

    // Backup Action
    const handleBackupNow = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newEntry: BackupHistoryItem = {
        id: `bk-${Date.now()}`,
        date: "Today",
        time: timeStr,
        size: "25.1 MB",
        status: "Completed"
      };
      setBackupHistory(prev => [newEntry, ...prev]);
      showToast("Clinic database backup compiled & secured.", "success");
    };

    const handleRestoreBackup = () => {
      if (!restoreBackupConfirm) return;
      showToast(`Database snapshot from ${restoreBackupConfirm.date} (${restoreBackupConfirm.time}) restored successfully.`, "success");
      setRestoreBackupConfirm(null);
    };

    return (
      <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto text-slate-800 dark:text-slate-200">
        {/* NO DUPLICATE SETTINGS HEADING - Begins directly with Settings Container Box */}
        <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[560px] overflow-hidden">
          
          {/* Left Settings Navigation Column (5 options: Clinic, Doctors, Staff, Integrations, Backup) */}
          <div className="md:col-span-3 lg:col-span-3 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/80 p-4 space-y-1.5 bg-slate-50/30 dark:bg-slate-950/20">
            {settingsTabs.map((tab) => {
              const isActive = currentTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveSubTab(tab)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-[14px] transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-955/50 dark:text-blue-400 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white font-medium"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Right Settings Content Column */}
          <div className="md:col-span-9 lg:col-span-9 p-6 sm:p-8 space-y-6">
            
            {/* 1. CLINIC */}
            {currentTab === "Clinic" && (
              <div className="space-y-6 max-w-xl">
                <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">Clinic Profile Settings</h2>

                <form className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Clinic Name</Label>
                      <Input defaultValue="Apex Dental Clinic" className="h-10 rounded-xl border-slate-200 dark:border-slate-800 text-[14px]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Receptionist User</Label>
                      <Input defaultValue="Anjali" className="h-10 rounded-xl border-slate-200 dark:border-slate-800 text-[14px]" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Address</Label>
                    <Input defaultValue="12, MG Road, Bengaluru" className="h-10 rounded-xl border-slate-200 dark:border-slate-800 text-[14px]" />
                  </div>

                  <div className="pt-2">
                    <Button 
                      type="button" 
                      onClick={() => showToast("Clinic configurations saved.", "success")} 
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-5 rounded-xl text-xs cursor-pointer shadow-xs"
                    >
                      Save Settings
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. DOCTORS */}
            {currentTab === "Doctors" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <div>
                    <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">Doctors</h2>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Manage practitioner profiles, specialties, and active statuses.</p>
                  </div>
                  <Button
                    onClick={handleOpenAddDoctor}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold h-10 px-4 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
                  >
                    <Plus className="h-4 w-4" /> Add Doctor
                  </Button>
                </div>

                <div className="space-y-3">
                  {doctors.map(doc => (
                    <div key={doc.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-sm flex items-center justify-center shrink-0">
                          {doc.name.replace("Dr. ", "")[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-semibold text-slate-900 dark:text-white">{doc.name}</span>
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-955/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 rounded-full font-medium text-[11px]">
                              {doc.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                            <span>Specialty: <strong className="font-medium text-slate-700 dark:text-slate-300">{doc.speciality}</strong></span>
                            <span>Phone: <strong className="font-medium text-slate-700 dark:text-slate-300">{doc.phone || "+91 98765 43210"}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          variant="outline"
                          onClick={() => handleOpenEditDoctor(doc)}
                          className="h-8 px-3 text-[12px] font-medium rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setDeleteDoctorConfirm(doc)}
                          className="h-8 px-3 text-[12px] font-medium rounded-lg border-slate-200 dark:border-slate-700 text-red-600 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-955/30 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-600" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. STAFF */}
            {currentTab === "Staff" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <div>
                    <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">Staff</h2>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Manage clinic nurses, hygienists, desk operations, and support staff.</p>
                  </div>
                  <Button
                    onClick={handleOpenAddStaff}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold h-10 px-4 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
                  >
                    <Plus className="h-4 w-4" /> Add Staff
                  </Button>
                </div>

                <div className="space-y-3">
                  {staffList.map(st => (
                    <div key={st.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm flex items-center justify-center shrink-0">
                          {st.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-semibold text-slate-900 dark:text-white">{st.name}</span>
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full font-medium text-[11px]">
                              {st.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                            <span>Role: <strong className="font-medium text-slate-700 dark:text-slate-300">{st.role}</strong></span>
                            <span>Phone: <strong className="font-medium text-slate-700 dark:text-slate-300">{st.phone}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          variant="outline"
                          onClick={() => handleOpenEditStaff(st)}
                          className="h-8 px-3 text-[12px] font-medium rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setDeleteStaffConfirm(st)}
                          className="h-8 px-3 text-[12px] font-medium rounded-lg border-slate-200 dark:border-slate-700 text-red-600 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-955/30 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-600" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. INTEGRATIONS */}
            {currentTab === "Integrations" && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">Integrations</h2>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Manage the communication and external services.</p>
                </div>

                <div className="space-y-4">
                  {/* WhatsApp */}
                  <div className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-955/40 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[14px] font-semibold text-slate-900 dark:text-white block">WhatsApp</span>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Send appointment confirmations, reminders and patient communication through WhatsApp.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${
                        integrationsState.whatsapp
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-955/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                      }`}>
                        {integrationsState.whatsapp ? "Enabled" : "Disabled"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIntegrationsState(prev => ({ ...prev, whatsapp: !prev.whatsapp }))}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          integrationsState.whatsapp ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          integrationsState.whatsapp ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-955/40 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[14px] font-semibold text-slate-900 dark:text-white block">Email</span>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Send appointment confirmations, reminders and notifications through email.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${
                        integrationsState.email
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-955/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                      }`}>
                        {integrationsState.email ? "Enabled" : "Disabled"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIntegrationsState(prev => ({ ...prev, email: !prev.email }))}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          integrationsState.email ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          integrationsState.email ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Google Calendar */}
                  <div className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-955/40 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/40">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[14px] font-semibold text-slate-900 dark:text-white block">Google Calendar</span>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Sync appointments with Google Calendar.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${
                        integrationsState.googleCalendar
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-955/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                      }`}>
                        {integrationsState.googleCalendar ? "Enabled" : "Disabled"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIntegrationsState(prev => ({ ...prev, googleCalendar: !prev.googleCalendar }))}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          integrationsState.googleCalendar ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          integrationsState.googleCalendar ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Apex Dental Lab API */}
                  <div className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-955/40 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/40">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[14px] font-semibold text-slate-900 dark:text-white block">Apex Dental Lab API</span>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Link surgical post scan results to patient clinical profiles.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${
                        integrationsState.dentalLab
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-955/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                      }`}>
                        {integrationsState.dentalLab ? "Enabled" : "Disabled"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIntegrationsState(prev => ({ ...prev, dentalLab: !prev.dentalLab }))}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          integrationsState.dentalLab ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          integrationsState.dentalLab ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. BACKUP */}
            {currentTab === "Backup" && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">Backup</h2>
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-955/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 rounded-full font-medium text-[11px]">
                        Up to date
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Protect your clinic data with secure backups and restore options.</p>
                  </div>

                  {/* Primary Action Button */}
                  <Button
                    onClick={handleBackupNow}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold h-10 px-5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
                  >
                    <Database className="h-4 w-4" /> Backup Now
                  </Button>
                </div>

                {/* Backup Settings Grid (Auto Backup & Frequency) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-[14px] font-semibold text-slate-900 dark:text-white block">Automatic Backups</span>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">Automatically compile system snapshots.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        autoBackupEnabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        autoBackupEnabled ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>

                  <div className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-[14px] font-semibold text-slate-900 dark:text-white block">Backup Frequency</span>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">Set automated cloud schedule.</p>
                    </div>
                    <select
                      value={backupFrequency}
                      onChange={(e) => setBackupFrequency(e.target.value)}
                      className="h-9 px-3 text-[13px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                {/* Backup Information Stats */}
                <div className="space-y-2">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Backup Information</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block">Last Backup</span>
                      <span className="text-[14px] font-semibold text-slate-900 dark:text-white block mt-1">{backupHistory[0]?.date || "13 Aug 2026"}</span>
                    </div>
                    <div className="p-3.5 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block">Next Scheduled</span>
                      <span className="text-[14px] font-semibold text-slate-900 dark:text-white block mt-1">Tomorrow, 03:00 AM</span>
                    </div>
                    <div className="p-3.5 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block">Backup Size</span>
                      <span className="text-[14px] font-semibold text-slate-900 dark:text-white block mt-1">{backupHistory[0]?.size || "24.8 MB"}</span>
                    </div>
                    <div className="p-3.5 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block">Backup Status</span>
                      <span className="text-[14px] font-semibold text-emerald-600 dark:text-emerald-400 block mt-1">Encrypted</span>
                    </div>
                  </div>
                </div>

                {/* Backup History Table */}
                <div className="space-y-3 pt-2">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Backup History</span>
                  <div className="border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-[13px]">
                      <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-medium">
                        <tr>
                          <th className="py-2.5 px-4">Date & Time</th>
                          <th className="py-2.5 px-4">Backup Size</th>
                          <th className="py-2.5 px-4">Status</th>
                          <th className="py-2.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {backupHistory.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                            <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                              {item.date} • {item.time}
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{item.size}</td>
                            <td className="py-3 px-4">
                              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-955/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 rounded-full text-[11px] font-medium">
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setRestoreBackupConfirm(item)}
                                  className="h-7 px-2.5 text-[12px] font-medium rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                                >
                                  <RotateCcw className="h-3 w-3 text-slate-600 dark:text-slate-300" /> Restore
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => showToast(`Downloading backup snapshot (${item.size})...`, "success")}
                                  className="h-7 px-2.5 text-[12px] font-medium rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                                >
                                  <Download className="h-3 w-3 text-slate-600 dark:text-slate-300" /> Download
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* --- DOCTOR ADD/EDIT MODAL --- */}
        {doctorModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5 animate-scaleIn">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">
                  {editingDoctor ? "Edit Doctor Information" : "Add New Doctor"}
                </h3>
                <button onClick={() => setDoctorModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDoctor} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium">Doctor Name</Label>
                  <Input
                    required
                    placeholder="e.g. Dr. Ramesh Kumar"
                    value={docFormName}
                    onChange={(e) => setDocFormName(e.target.value)}
                    className="h-10 text-[13px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium">Specialty</Label>
                  <select
                    value={docFormSpeciality}
                    onChange={(e) => setDocFormSpeciality(e.target.value)}
                    className="w-full h-10 px-3 text-[13px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="General Dentist">General Dentist</option>
                    <option value="Endodontist">Endodontist</option>
                    <option value="Orthodontist">Orthodontist</option>
                    <option value="Periodontist">Periodontist</option>
                    <option value="Pedodontist">Pedodontist</option>
                    <option value="Prosthodontist">Prosthodontist</option>
                    <option value="Oral Surgeon">Oral Surgeon</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium">Contact Number</Label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={docFormPhone}
                    onChange={(e) => setDocFormPhone(e.target.value)}
                    className="h-10 text-[13px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium">Status</Label>
                  <select
                    value={docFormStatus}
                    onChange={(e) => setDocFormStatus(e.target.value as any)}
                    className="w-full h-10 px-3 text-[13px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="Available">Available</option>
                    <option value="In Consultation">In Consultation</option>
                    <option value="On Break">On Break</option>
                    <option value="Finished Today">Finished Today</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDoctorModalOpen(false)} className="h-10 px-4 text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-5 text-xs">
                    {editingDoctor ? "Save Changes" : "Add Doctor"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- DOCTOR DELETE CONFIRMATION MODAL --- */}
        {deleteDoctorConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 text-center animate-scaleIn">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-955/50 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Remove Doctor?</h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to remove <strong className="font-semibold text-slate-900 dark:text-white">{deleteDoctorConfirm.name}</strong> from clinic records?
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setDeleteDoctorConfirm(null)} className="h-10 px-4 text-xs">
                  Cancel
                </Button>
                <Button type="button" onClick={handleDeleteDoctor} className="bg-red-600 hover:bg-red-500 text-white font-bold h-10 px-5 text-xs">
                  Remove Doctor
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* --- STAFF ADD/EDIT MODAL --- */}
        {staffModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5 animate-scaleIn">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">
                  {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
                </h3>
                <button onClick={() => setStaffModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveStaff} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium">Full Name</Label>
                  <Input
                    required
                    placeholder="e.g. Sneha Rao"
                    value={staffFormName}
                    onChange={(e) => setStaffFormName(e.target.value)}
                    className="h-10 text-[13px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium">Role</Label>
                  <Input
                    required
                    placeholder="e.g. Senior Nurse / Desk Operations"
                    value={staffFormRole}
                    onChange={(e) => setStaffFormRole(e.target.value)}
                    className="h-10 text-[13px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium">Contact Number</Label>
                  <Input
                    placeholder="+91 98765 11223"
                    value={staffFormPhone}
                    onChange={(e) => setStaffFormPhone(e.target.value)}
                    className="h-10 text-[13px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium">Status</Label>
                  <select
                    value={staffFormStatus}
                    onChange={(e) => setStaffFormStatus(e.target.value as any)}
                    className="w-full h-10 px-3 text-[13px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStaffModalOpen(false)} className="h-10 px-4 text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-5 text-xs">
                    {editingStaff ? "Save Changes" : "Add Staff"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- STAFF DELETE CONFIRMATION MODAL --- */}
        {deleteStaffConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 text-center animate-scaleIn">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-955/50 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Remove Staff Member?</h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to remove <strong className="font-semibold text-slate-900 dark:text-white">{deleteStaffConfirm.name}</strong> from staff records?
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setDeleteStaffConfirm(null)} className="h-10 px-4 text-xs">
                  Cancel
                </Button>
                <Button type="button" onClick={handleDeleteStaff} className="bg-red-600 hover:bg-red-500 text-white font-bold h-10 px-5 text-xs">
                  Remove Staff
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* --- RESTORE BACKUP CONFIRMATION MODAL --- */}
        {restoreBackupConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 text-center animate-scaleIn">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-955/50 text-blue-600 flex items-center justify-center mx-auto">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Restore Database Backup?</h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to restore the database backup from <strong className="font-semibold text-slate-900 dark:text-white">{restoreBackupConfirm.date} ({restoreBackupConfirm.time})</strong>? Current session modifications will be overwritten with snapshot data.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setRestoreBackupConfirm(null)} className="h-10 px-4 text-xs">
                  Cancel
                </Button>
                <Button type="button" onClick={handleRestoreBackup} className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-5 text-xs">
                  Confirm Restore
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

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
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-xs font-semibold space-y-4">
              <span className="font-bold text-sm block">Tooth Diagnostic Map</span>
              <p className="text-slate-405 text-[10px]">Select a tooth outline to log override overrides:</p>
              
              <Odontogram 
                chartData={consultChart}
                selectedTooth={consultSelectedTooth}
                onSelectTooth={(toothNum) => setConsultSelectedTooth(toothNum)}
              />

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
      patients: patients.filter(p => p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.id.toLowerCase().includes(q)),
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

  if (loadingSession) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-505 mt-4 dark:text-slate-400 font-medium">
          Loading Health OS clinical workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-805 dark:bg-slate-900 dark:text-slate-100 flex font-sans antialiased overflow-hidden">
      
      {/* 1. Sidebar Left Navigation */}
      <aside
        className={`sticky top-0 left-0 h-screen bg-white dark:bg-slate-955 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col justify-between z-40 shrink-0 overflow-x-hidden transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-[68px]" : "w-[200px]"
        }`}
      >
        <div className={`border-b border-slate-200 dark:border-slate-800 flex items-center shrink-0 transition-all duration-300 ease-in-out h-20 ${
          sidebarCollapsed
            ? "px-0 justify-center flex-col py-2 gap-1.5"
            : "px-4 py-5 justify-between flex-row"
        }`}>
          <div className={`flex items-center transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "justify-center w-full" : "justify-start flex-1 min-w-0"
          }`}>
            <DentalLogo showText={!sidebarCollapsed} collapsed={sidebarCollapsed} />
          </div>
          
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`rounded-full flex items-center justify-center hover:bg-[#EFF6FF] hover:text-blue-600 text-slate-500 transition-all duration-250 ease-in-out shrink-0 active:scale-[0.97] ${
              sidebarCollapsed ? "h-6 w-6 mx-auto" : "h-8 w-8 ml-1"
            }`}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex flex-col flex-grow overflow-y-auto overflow-x-hidden">
          <nav className={`space-y-2 flex-grow mt-3 transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "px-0 py-3" : "p-3"
          }`}>
            {menuItems.map((item) => {
              const active = activeTab === item.name && !activeConsultationApptId;
              return (
                <div key={item.name} className="relative flex justify-center">
                  <button
                    onClick={() => selectTab(item.name)}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredItem(item.name);
                      setHoveredItemTop(rect.top + rect.height / 2);
                    }}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`h-[42px] flex items-center rounded-[10px] text-[14px] transition-all duration-300 ease-in-out group ${
                      active ? "font-semibold bg-blue-600 text-white shadow-sm" : "font-medium text-[#334155] hover:bg-blue-50/50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                    } ${
                      sidebarCollapsed ? "w-11 justify-center px-0 mx-auto" : "w-full justify-between px-3"
                    }`}
                  >
                    <div className={`flex items-center ${sidebarCollapsed ? "justify-center gap-0 w-full" : "gap-2.5"}`}>
                      <div className="relative flex items-center justify-center h-[22px] w-[22px] shrink-0">
                        <span className={active ? "text-white" : "text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-white transition-colors"}>
                          {React.cloneElement(item.icon, { className: "h-[22px] w-[22px]" })}
                        </span>
                        {item.badge && sidebarCollapsed && (
                          <span className="absolute -top-1.5 -right-1.5 text-[10px] font-medium h-4 min-w-4 px-1 rounded-full bg-red-650 text-white border-2 border-white dark:border-slate-955 flex items-center justify-center shadow-xs">
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
                        className={`text-[12px] font-medium px-2 py-0.5 rounded-full transition-all duration-300 ${
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
          sidebarCollapsed ? "px-0 py-4 flex flex-col items-center justify-center gap-3" : "p-4"
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
                onClick={handleLogout}
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
              
              <div className="flex items-center justify-start border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  onClick={handleLogout}
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
          
          <div className="flex items-center gap-7 flex-grow">
            {sidebarCollapsed && (
              <span className="text-[22px] font-bold text-slate-900 dark:text-white shrink-0 hidden md:inline-block">
                {activeTab}
              </span>
            )}
            <div className="flex items-center gap-3 flex-grow max-w-[540px] w-full relative">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-1.5 text-slate-500 hover:text-slate-808 dark:text-slate-400 dark:hover:text-white"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Global Search input */}
              <div className="relative w-full flex items-center">
                <Search className="absolute left-4 h-4.5 w-4.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search patients, appointments..."
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  className="h-11 w-full pl-[46px] pr-4 rounded-[11px] bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 text-[14px] font-medium text-slate-808 dark:text-slate-200 outline-none hover:border-slate-350 dark:hover:border-slate-700 focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition-all duration-150 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:text-[14px] placeholder:font-normal"
                />
              
                {/* Global search dropdown */}
                {globalSearchQuery && (
                  <div className="absolute top-12 left-0 w-full rounded-2xl border border-slate-100 bg-white shadow-xl dark:bg-slate-955 dark:border-slate-900/60 p-3 z-50 text-xs font-semibold max-h-80 overflow-y-auto">
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
        </div>

          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* + Quick Add Dropdown */}
            <div ref={quickAddRef} className="relative">
              <button
                onClick={() => setQuickAddOpen(!quickAddOpen)}
                className="h-9 flex items-center gap-1 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Quick Add</span>
              </button>
              
              <div className={`absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white shadow-xl dark:bg-slate-950 dark:border-slate-800 p-1.5 z-50 text-[14px] font-semibold text-left transition-all duration-200 origin-top-right transform ${
                quickAddOpen
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
              }`}>
                <button
                  onClick={() => { setActiveModal("addPatient"); setQuickAddOpen(false); }}
                  className="w-full h-11 flex items-center gap-2.5 px-3 rounded-lg text-slate-700 hover:bg-blue-50/50 hover:text-blue-750 dark:text-slate-300 dark:hover:bg-blue-955/20 dark:hover:text-blue-400 transition-all duration-150"
                >
                  <UserPlus className="h-[18px] w-[18px] text-blue-500 shrink-0" />
                  <span className="truncate">New Patient</span>
                </button>
                <button
                  onClick={() => {
                    if (patients.length > 0) {
                      setApptPatientId(patients[0].id);
                    }
                    setActiveModal("addAppointment");
                    setQuickAddOpen(false);
                  }}
                  className="w-full h-11 flex items-center gap-2.5 px-3 rounded-lg text-slate-700 hover:bg-blue-50/50 hover:text-blue-750 dark:text-slate-300 dark:hover:bg-blue-955/20 dark:hover:text-blue-400 transition-all duration-150"
                >
                  <CalendarDays className="h-[18px] w-[18px] text-cyan-500 shrink-0" />
                  <span className="truncate">New Appointment</span>
                </button>
                <button
                  onClick={() => { setActiveModal("addWalkIn"); setQuickAddOpen(false); }}
                  className="w-full h-11 flex items-center gap-2.5 px-3 rounded-lg text-slate-700 hover:bg-blue-50/50 hover:text-blue-750 dark:text-slate-300 dark:hover:bg-blue-955/20 dark:hover:text-blue-400 transition-all duration-150"
                >
                  <UserCheck className="h-[18px] w-[18px] text-amber-500 shrink-0" />
                  <span className="truncate">Walk-in Patient</span>
                </button>
                <button
                  onClick={() => { selectTab("Billing"); setActiveSubTab("Invoices"); setQuickAddOpen(false); }}
                  className="w-full h-11 flex items-center gap-2.5 px-3 rounded-lg text-slate-700 hover:bg-blue-50/50 hover:text-blue-750 dark:text-slate-300 dark:hover:bg-blue-955/20 dark:hover:text-blue-400 transition-all duration-150"
                >
                  <FileText className="h-[18px] w-[18px] text-red-500 shrink-0" />
                  <span className="truncate">Invoice List</span>
                </button>
                <button
                  onClick={() => { selectTab("Billing"); setActiveSubTab("Payments"); setQuickAddOpen(false); }}
                  className="w-full h-11 flex items-center gap-2.5 px-3 rounded-lg text-slate-700 hover:bg-blue-50/50 hover:text-blue-750 dark:text-slate-300 dark:hover:bg-blue-955/20 dark:hover:text-blue-400 transition-all duration-150"
                >
                  <Receipt className="h-[18px] w-[18px] text-emerald-500 shrink-0" />
                  <span className="truncate">Payment Logs</span>
                </button>
              </div>
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
 
            {/* Clinic Date */}
            <div className="hidden lg:block text-right text-[12px] border-r pr-3.5 border-slate-200 dark:border-slate-800 leading-none">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Wednesday, 12 Aug 2026</span>
            </div>
 
            {/* Profile Avatar */}
            <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold border-2 border-slate-100 shadow-sm shrink-0">
              AN
            </div>
          </div>
        </header>

        {/* Dynamic Inner Sub-tabs Bar (hidden if in active consultation mode) */}
        {!activeConsultationApptId && !selectedPatientId && activeTab !== "Dashboard" && activeTab !== "Treatments" && activeTab !== "Settings" && (
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
        <main className="p-4 sm:p-5 lg:p-5 space-y-4 max-w-7xl w-full mx-auto flex-grow">
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
              <button
                onClick={handleLogout}
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
                  const saved = registerPatient({
                    name: newPatName,
                    phone: newPatPhone,
                    age: newPatAge,
                    gender: newPatGender,
                    address: newPatAddress,
                    medicalNotes: newPatAllergies
                  });
                  if (saved) {
                    setNewPatName("");
                    setNewPatPhone("");
                    setNewPatAddress("");
                    setNewPatAllergies("None");
                    setActiveModal(null);
                  }
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
                Collect Payment & Apply Discount: Invoice {selectedInvoiceForPayment.id}
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
                  <button type="button" onClick={addCustomBillingItem} className="w-full h-8 rounded-lg border border-dashed border-blue-500 text-blue-600 font-bold cursor-pointer">
                    Add custom item
                  </button>
                </div>
              </div>

              {/* Billing computations & Payment details */}
              <div className="space-y-4">
                <span className="font-bold block uppercase text-[10px] text-slate-400">Total Calculation & Discounts</span>
                
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="space-y-1">
                    <Label>Discount Type</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white dark:bg-slate-905 px-3 py-1 text-xs focus:outline-none dark:border-slate-800 text-slate-808 dark:text-slate-200"
                      value={payDiscountType}
                      onChange={e => setPayDiscountType(e.target.value as "percentage" | "fixed")}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>Discount Value</Label>
                    <Input
                      type="number"
                      value={payDiscountValue || ""}
                      onChange={e => setPayDiscountValue(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                </div>

                <div className="p-3 border rounded-xl bg-blue-50/30 dark:bg-slate-900/30 text-xs space-y-1.5 font-bold">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{calculateInvoiceSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Discount:</span>
                    <span>- ₹{calculateInvoiceDiscountAmount().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black pt-1.5 border-t border-slate-200 dark:border-slate-800">
                    <span>Total:</span>
                    <span>₹{calculateInvoiceTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
                    <span>Paid Amount (So Far):</span>
                    <span>₹{selectedInvoiceForPayment.paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-blue-650 dark:text-blue-400 font-extrabold">
                    <span>Remaining Balance:</span>
                    <span>₹{Math.max(0, calculateInvoiceTotal() - selectedInvoiceForPayment.paidAmount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-[10px] block uppercase text-slate-400">Payment Collection Details</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label>Amount to Collect (₹)</Label>
                      <Input
                        type="number"
                        value={paymentCollectAmt || ""}
                        max={calculateInvoiceTotal() - selectedInvoiceForPayment.paidAmount}
                        onChange={e => setPaymentCollectAmt(Math.max(0, parseInt(e.target.value) || 0))}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Payment Method</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white dark:bg-slate-905 px-3 py-1 text-xs focus:outline-none dark:border-slate-800 text-slate-808 dark:text-slate-200"
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value)}
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Credit/Debit Card">Credit/Debit Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 rounded-xl mt-2 flex items-center justify-center gap-1.5 shadow-md cursor-pointer">
                  Collect ₹{paymentCollectAmt.toLocaleString()} ({paymentMethod})
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Receipt Modal (Design printer-friendly print logs) */}
      {lastGeneratedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/50 backdrop-blur-xs p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden text-xs font-semibold my-8"
          >
            {/* Header - Not printed */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 no-print">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Professional Clinical Invoice & Receipt</span>
              <button onClick={() => setLastGeneratedReceipt(null)} className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Printable Content Section */}
            <div id="print-area" className="p-8 space-y-6 bg-white dark:bg-slate-955 text-slate-808 dark:text-slate-200">
              
              {/* Clinic details header */}
              <div className="flex justify-between items-start border-b pb-4 border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[18px] font-black text-blue-600 tracking-tight block">APEX DENTAL CLINIC</span>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    123, Sector 5, HSR Layout, Bengaluru - 560102<br />
                    Phone: +91 99000 11000 | Email: billing@apexdental.com
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">INVOICE & RECEIPT</span>
                  <span className="text-[14px] font-black text-slate-900 dark:text-white block mt-0.5">{lastGeneratedReceipt.id}</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Date: {lastGeneratedReceipt.paymentDate}</span>
                </div>
              </div>

              {/* Patient & Doctor details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">PATIENT DETAILS</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">{lastGeneratedReceipt.patientName}</span>
                  <span className="text-[10px] text-slate-450 block">ID: {lastGeneratedReceipt.patientId}</span>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">CLINICAL DETAILS</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Dr. {lastGeneratedReceipt.doctor}</span>
                  <span className="text-[10px] text-slate-455 block">Treatment: {lastGeneratedReceipt.treatment}</span>
                </div>
              </div>

              {/* Itemized charges table */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">TREATMENT CHARGES STATEMENT</span>
                <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-900/40 text-slate-400 text-[10px] border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider">
                        <th className="py-2 px-3 font-bold">Description</th>
                        <th className="py-2 px-3 font-bold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {lastGeneratedReceipt.items.map((item, idx) => (
                        <tr key={idx} className="text-slate-700 dark:text-slate-300">
                          <td className="py-2.5 px-3 font-medium">{item.description}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white font-mono">₹{item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculations and summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Transaction history logs */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">TRANSACTION HISTORY</span>
                  {lastGeneratedReceipt.paymentLogs && lastGeneratedReceipt.paymentLogs.length > 0 ? (
                    <div className="space-y-1.5">
                      {lastGeneratedReceipt.paymentLogs.map((log, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] bg-slate-50/20 dark:bg-slate-900/10 p-2 rounded-lg border border-slate-100/50 dark:border-slate-850">
                          <span className="text-slate-500 font-medium">{log.method} Allocation</span>
                          <span className="text-slate-808 dark:text-slate-200 font-bold font-mono">₹{log.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-450 italic block">No payment records found.</span>
                  )}
                </div>

                {/* Computation blocks */}
                <div className="space-y-2 bg-slate-50/30 dark:bg-slate-900/10 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{lastGeneratedReceipt.subtotal.toLocaleString()}</span>
                  </div>
                  
                  {lastGeneratedReceipt.discountValue !== undefined && lastGeneratedReceipt.discountValue > 0 ? (
                    <div className="flex justify-between text-[11px] text-red-600 dark:text-red-400">
                      <span>Discount ({lastGeneratedReceipt.discountType === "percentage" ? `${lastGeneratedReceipt.discountValue}%` : `₹${lastGeneratedReceipt.discountValue}`}):</span>
                      <span className="font-mono">- ₹{Math.round(lastGeneratedReceipt.discountType === "percentage" ? (lastGeneratedReceipt.subtotal * (lastGeneratedReceipt.discountValue / 100)) : lastGeneratedReceipt.discountValue).toLocaleString()}</span>
                    </div>
                  ) : lastGeneratedReceipt.discount > 0 ? (
                    <div className="flex justify-between text-[11px] text-red-600 dark:text-red-400">
                      <span>Discount ({lastGeneratedReceipt.discount}%):</span>
                      <span className="font-mono">- ₹{Math.round(lastGeneratedReceipt.subtotal * (lastGeneratedReceipt.discount / 100)).toLocaleString()}</span>
                    </div>
                  ) : null}

                  <div className="flex justify-between text-xs font-black pt-1.5 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                    <span>Grand Total:</span>
                    <span className="font-mono">₹{lastGeneratedReceipt.total.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
                    <span>Paid Amount:</span>
                    <span className="font-mono">₹{lastGeneratedReceipt.paidAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-[11px] font-extrabold border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Status:</span>
                    <span className={`${
                      lastGeneratedReceipt.status === "Paid" ? "text-emerald-600 dark:text-emerald-400" :
                      lastGeneratedReceipt.status === "Partially Paid" ? "text-amber-600 dark:text-amber-400" :
                      "text-red-600 dark:text-red-400"
                    }`}>{lastGeneratedReceipt.status}</span>
                  </div>

                  {lastGeneratedReceipt.total - lastGeneratedReceipt.paidAmount > 0 && (
                    <div className="flex justify-between text-[11px] text-red-650 dark:text-red-400 font-extrabold">
                      <span>Outstanding Balance:</span>
                      <span className="font-mono">₹{(lastGeneratedReceipt.total - lastGeneratedReceipt.paidAmount).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Thank you message */}
              <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                <p className="font-bold">Thank you for visiting Apex Dental Clinic!</p>
                <p className="mt-0.5">Please retain this copy for insurance or future references.</p>
              </div>

            </div>

            {/* Action buttons footer - Not printed */}
            <div className="p-5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2.5 no-print">
              <button
                onClick={() => {
                  window.print();
                }}
                className="h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 font-bold shadow-xs cursor-pointer"
              >
                <Printer className="h-4 w-4" /> Print Invoice
              </button>
              <button
                onClick={() => setLastGeneratedReceipt(null)}
                className="h-10 rounded-xl bg-white hover:bg-slate-55 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-808 dark:text-slate-200 flex items-center justify-center font-bold cursor-pointer"
              >
                Close Preview
              </button>
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
            className="w-full max-w-[680px] bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden text-xs font-semibold"
          >
            <div className="flex items-start justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col text-slate-900 dark:text-white">
                <span className="text-[18px] font-bold leading-tight">Slot Management:</span>
                <span className="text-[16px] font-semibold text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  {selectedSlotData.date} at {selectedSlotData.time}
                </span>
              </div>
              <button onClick={() => setSelectedSlotData(null)} className="text-slate-400 hover:text-slate-650 shrink-0 mt-0.5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-8">
              {selectedSlotData.appointment ? (
                // Booked Slot
                <div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-8">
                    <div>
                      <span className="text-[13px] text-slate-450 dark:text-slate-500 block mb-1 uppercase tracking-wider font-semibold">Patient</span>
                      <strong className="text-[16px] text-slate-850 dark:text-slate-100 font-semibold block leading-tight">{selectedSlotData.appointment.patientName}</strong>
                    </div>
                    <div>
                      <span className="text-[13px] text-slate-450 dark:text-slate-500 block mb-1 uppercase tracking-wider font-semibold">Doctor</span>
                      <strong className="text-[16px] text-slate-850 dark:text-slate-100 font-semibold block leading-tight">{selectedSlotData.appointment.doctor}</strong>
                    </div>
                    <div>
                      <span className="text-[13px] text-slate-455 dark:text-slate-500 block mb-1 uppercase tracking-wider font-semibold">Treatment</span>
                      <strong className="text-[16px] text-slate-850 dark:text-slate-100 font-semibold block leading-tight">{selectedSlotData.appointment.treatment}</strong>
                    </div>
                    <div>
                      <span className="text-[13px] text-slate-455 dark:text-slate-500 block mb-1 uppercase tracking-wider font-semibold">Status</span>
                      <div className="mt-0.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                          selectedSlotData.appointment.status === "Scheduled" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400" :
                          selectedSlotData.appointment.status === "Checked In" || selectedSlotData.appointment.status === "Waiting" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400" :
                          selectedSlotData.appointment.status === "In Procedure" ? "bg-orange-100 text-orange-850 dark:bg-orange-950/40 dark:text-orange-400" :
                          selectedSlotData.appointment.status === "Completed" ? "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-400" :
                          "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                        }`}>
                          {selectedSlotData.appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Action Row */}
                  <div className="flex items-center gap-3 w-full mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    {/* Primary Status-based Action Button */}
                    {selectedSlotData.appointment.status === "Scheduled" && (
                      <button
                        type="button"
                        onClick={() => handleApptCheckIn(selectedSlotData.appointment!.id)}
                        className="h-12 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        Check In
                      </button>
                    )}
                    {(selectedSlotData.appointment.status === "Checked In" || selectedSlotData.appointment.status === "Waiting") && (
                      <button
                        type="button"
                        onClick={() => handleApptStartProcedure(selectedSlotData.appointment!.id)}
                        className="h-12 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        Start Procedure
                      </button>
                    )}
                    {selectedSlotData.appointment.status === "In Procedure" && (
                      <button
                        type="button"
                        onClick={() => handleApptCompleteProcedure(selectedSlotData.appointment!.id)}
                        className="h-12 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        Complete Procedure
                      </button>
                    )}
                    {selectedSlotData.appointment.status === "Completed" && (
                      (() => {
                        const hasInvoice = invoices.some(i => i.patientId === selectedSlotData.appointment!.patientId);
                        return (
                          <button
                            type="button"
                            onClick={() => handleApptGenerateBill(selectedSlotData.appointment!.id)}
                            className="h-12 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                          >
                            {hasInvoice ? "Collect Payment" : "Generate Bill"}
                          </button>
                        );
                      })()
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
                      className="h-12 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      Block Slot
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAppointments(prev => prev.map(a => a.id === selectedSlotData.appointment!.id ? { ...a, status: "Cancelled" } : a));
                        setSelectedSlotData(null);
                      }}
                      className="h-12 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] border border-red-200 text-red-655 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/20 transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : blockedSlots[`${selectedSlotData.date}_${selectedSlotData.time}`] ? (
                // Blocked Slot
                <div className="space-y-6 text-center py-1">
                  <p className="text-slate-500 font-medium">This slot is currently blocked for clinical maintenance.</p>
                  <div className="flex items-center gap-3 w-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleBlockSlotToggle(selectedSlotData.date, selectedSlotData.time)}
                      className="h-12 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      Unblock Slot
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSlotData(null)}
                      className="h-12 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                // Empty Slot - Allow Booking or Blocking
                 <form onSubmit={handleSlotBookingSubmit} className="space-y-4">
                  {(() => {
                    const selectedPatient = patients.find(p => p.id === slotPatientId);
                    const filteredPatientsForSlot = patients.filter(p => {
                      const query = slotPatientSearchQuery.toLowerCase().trim();
                      if (!query) return true;
                      return (
                        p.name.toLowerCase().includes(query) ||
                        p.id.toLowerCase().includes(query) ||
                        (p.phone && p.phone.toLowerCase().includes(query))
                      );
                    });
                    
                    return (
                      <div className="space-y-1.5">
                        <Label>Select Patient Record</Label>
                        
                        {/* Hidden select for HTML5 required validation */}
                        <select
                          value={slotPatientId}
                          onChange={e => setSlotPatientId(e.target.value)}
                          required
                          className="absolute w-0 h-0 opacity-0 pointer-events-none"
                        >
                          <option value="">-- Choose Patient --</option>
                          {patients.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>

                        <div className="relative" ref={slotPatientDropdownRef}>
                          <div
                            onClick={() => setSlotPatientDropdownOpen(!slotPatientDropdownOpen)}
                            className="flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 cursor-pointer"
                          >
                            <span className="truncate">
                              {selectedPatient ? `${selectedPatient.name} (${selectedPatient.id})` : "-- Choose Patient --"}
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          </div>

                          {slotPatientDropdownOpen && (
                            <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-850 shadow-lg z-50 flex flex-col">
                              {/* Search input field inside the dropdown */}
                              <div className="sticky top-0 bg-white dark:bg-slate-955 p-1.5 border-b border-slate-100 dark:border-slate-850">
                                <input
                                  type="text"
                                  placeholder="Search by name, ID, or mobile..."
                                  value={slotPatientSearchQuery}
                                  onChange={e => setSlotPatientSearchQuery(e.target.value)}
                                  className="h-8 w-full rounded-md border border-slate-150 bg-slate-50/50 dark:bg-slate-900 dark:border-slate-800 px-2.5 py-1 text-xs outline-none focus:bg-white dark:text-slate-350"
                                  onClick={e => e.stopPropagation()}
                                  autoFocus
                                />
                              </div>

                              {/* List of matching patient records */}
                              <div className="overflow-y-auto flex-1 max-h-48 scrollbar-thin">
                                {filteredPatientsForSlot.length > 0 ? (
                                  filteredPatientsForSlot.map(p => (
                                    <div
                                      key={p.id}
                                      onClick={() => {
                                        setSlotPatientId(p.id);
                                        setSlotPatientDropdownOpen(false);
                                      }}
                                      className={`px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer border-b border-slate-50/50 dark:border-slate-900/50 last:border-b-0 text-left ${
                                        slotPatientId === p.id ? "bg-blue-50/30 dark:bg-blue-955/20" : ""
                                      }`}
                                    >
                                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{p.name}</p>
                                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                        {p.id} • {p.phone || "+91 99000 11000"}
                                      </p>
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                                    No patients found
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-2 gap-5">
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
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleBlockSlotToggle(selectedSlotData.date, selectedSlotData.time)}
                      className="h-11 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      Block Slot
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSlotData(null)}
                      className="h-11 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="h-11 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-55 animate-slideLeft">
          <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-bold transition-all ${
            toast.type === "success" 
              ? "bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/30 dark:text-emerald-300"
              : "bg-red-50 border-red-100 text-red-800 dark:bg-red-950/40 dark:border-red-900/30 dark:text-red-300"
          }`}>
            <div className={`h-2 w-2 rounded-full ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`} />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {hoveredApptDay && (
        <div
          style={{
            position: "fixed",
            top: hoveredApptDay.rect.top,
            left: (typeof window !== "undefined" && hoveredApptDay.rect.left + hoveredApptDay.rect.width + 8 + 320 > window.innerWidth)
              ? hoveredApptDay.rect.left - 328
              : hoveredApptDay.rect.left + hoveredApptDay.rect.width + 8,
            width: "320px",
            zIndex: 9999
          }}
          onMouseEnter={handlePopoverMouseEnter}
          onMouseLeave={handlePopoverMouseLeave}
          className="animate-scaleIn bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-4 text-xs font-semibold text-slate-700 flex flex-col gap-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
            <span className="font-bold text-slate-800 dark:text-white text-[13px]">
              Appointments — {hoveredApptDay.dateStr}
            </span>
            <span className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-955/30 dark:text-blue-400 px-1.5 py-0.5 rounded font-extrabold">
              {hoveredApptDay.appointments.length}
            </span>
          </div>

          {/* List */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto scrollbar-thin pr-1">
            {hoveredApptDay.appointments.map(appt => (
              <div
                key={appt.id}
                onClick={() => {
                  setSelectedApptDetail(appt);
                  setHoveredApptDay(null);
                }}
                className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer flex flex-col gap-1 transition-all hover:border-slate-200 dark:hover:border-slate-800 shadow-3xs"
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                    {appt.patientName}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-550 shrink-0 font-extrabold">
                    {appt.time}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-[10px] text-slate-550 dark:text-slate-400 font-medium">
                  <span className="truncate">{appt.treatment}</span>
                  <span className="shrink-0">{appt.doctor}</span>
                </div>

                <div className="mt-1 flex justify-between items-center">
                  <span className="text-[9px] text-slate-455 dark:text-slate-500">
                    {appt.patientId}
                  </span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[8px] font-extrabold uppercase tracking-wider ${
                    appt.status === "Scheduled" ? "bg-blue-100 text-blue-808 dark:bg-blue-900/40 dark:text-blue-400" :
                    appt.status === "Checked In" || appt.status === "Waiting" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400" :
                    appt.status === "In Procedure" ? "bg-orange-100 text-orange-850 dark:bg-orange-950/40 dark:text-orange-400" :
                    appt.status === "Completed" ? "bg-slate-100 text-slate-808 dark:bg-slate-900/40 dark:text-slate-400" :
                    "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                  }`}>
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Hover Popover Card for Booked Calendar Slots */}
      {hoveredSlotPopover && (() => {
        const { appointment: app, rect } = hoveredSlotPopover;
        const pat = patients.find(p => p.id === app.patientId);
        const patPhone = pat?.phone || "+91 99000 11000";
        const patId = pat?.id || app.patientId || "DS-1001";

        const popoverWidth = 270;
        const popoverHeight = 220;

        let left = rect.left + rect.width + 10;
        if (typeof window !== "undefined" && left + popoverWidth > window.innerWidth - 20) {
          left = Math.max(10, rect.left - popoverWidth - 10);
        }

        let top = rect.top;
        if (typeof window !== "undefined" && top + popoverHeight > window.innerHeight - 20) {
          top = Math.max(10, window.innerHeight - popoverHeight - 20);
        }

        return (
          <div
            style={{ top: `${top}px`, left: `${left}px`, width: `${popoverWidth}px`, zIndex: 9999 }}
            onMouseEnter={() => {
              if (slotHoverTimeoutRef.current) {
                clearTimeout(slotHoverTimeoutRef.current);
                slotHoverTimeoutRef.current = null;
              }
            }}
            onMouseLeave={() => {
              if (slotHoverTimeoutRef.current) clearTimeout(slotHoverTimeoutRef.current);
              slotHoverTimeoutRef.current = setTimeout(() => {
                setHoveredSlotPopover(null);
              }, 200);
            }}
            onClick={() => {
              setHoveredSlotPopover(null);
              setSlotPatientId("");
              setSelectedSlotData({ date: app.date, time: app.time, appointment: app });
            }}
            className="fixed bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xl text-xs space-y-2.5 animate-fadeIn cursor-pointer"
          >
            {/* Header: Patient Name & Status Badge */}
            <div className="flex justify-between items-start gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="min-w-0 flex-1">
                <span className="font-bold text-sm text-slate-900 dark:text-white block leading-snug truncate">{app.patientName}</span>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block mt-0.5">ID: {patId}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                app.status === "Scheduled" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300" :
                app.status === "Checked In" || app.status === "Waiting" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300" :
                app.status === "In Procedure" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300" :
                app.status === "Completed" ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" : "bg-slate-100 text-slate-600"
              }`}>
                {app.status}
              </span>
            </div>

            {/* Details List */}
            <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-400 font-normal">Appt Time:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{app.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-normal">Doctor:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{app.doctor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-normal">Treatment:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[140px]">{app.treatment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-normal">Mobile:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{patPhone}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-[10px] text-blue-600 dark:text-blue-400 font-bold">
              <span>Click slot to manage details</span>
              <span>→</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
