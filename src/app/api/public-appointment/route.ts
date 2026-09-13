import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    console.error("[CRITICAL CONFIG ERROR] SUPABASE_SERVICE_ROLE_KEY environment variable is missing on the server.");
    return null;
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false }
  });
}

function convertToUiDate(dbDate: string): string {
  if (!dbDate) return "12 Aug 2026";
  const parts = dbDate.split("-");
  if (parts.length === 3) {
    const year = parts[0];
    const monthNum = parts[1];
    const day = parts[2].padStart(2, "0");
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = parseInt(monthNum, 10) - 1;
    const month = months[monthIndex] || "Jan";
    
    return `${day} ${month} ${year}`;
  }
  return dbDate;
}

// GET: Expose minimal active doctor info for public form dropdown
export async function GET() {
  try {
    const supabase = getAdminSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "An unexpected server configuration error occurred." }, { status: 500 });
    }
    const { data: doctors, error } = await supabase
      .from("doctors")
      .select("id, name, speciality, status")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error loading doctors for public form:", error.message);
      return NextResponse.json({ success: false, error: "Failed to load doctors." }, { status: 500 });
    }

    const safeDoctors = (doctors || [])
      .filter(d => !d.status || d.status === "Available" || d.status === "Active")
      .map(d => ({
        id: d.id,
        name: d.name,
        speciality: d.speciality || "General Dentist"
      }));

    return NextResponse.json({ success: true, doctors: safeDoctors });
  } catch (err: any) {
    console.error("GET public-appointment error:", err?.message || err);
    return NextResponse.json({ success: false, error: "Server error loading options." }, { status: 500 });
  }
}

// POST: Public appointment request submission
export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: "Invalid JSON request payload." }, { status: 400 });
    }

    const {
      name,
      phone,
      email,
      date,
      preferredDate,
      time,
      preferredTime,
      doctor,
      doctorId,
      treatment,
      procedure,
      notes
    } = body || {};

    // 1. Server-side Validation
    const rawName = (name || "").trim();
    if (!rawName || rawName.length < 2) {
      return NextResponse.json({ success: false, error: "Full name is required (minimum 2 characters)." }, { status: 400 });
    }
    const sanitizedName = rawName.slice(0, 100);

    const rawPhone = (phone || "").trim();
    const digits = rawPhone.replace(/\D/g, "");
    if (!digits || digits.length < 10) {
      return NextResponse.json({ success: false, error: "A valid 10-digit phone number is required." }, { status: 400 });
    }
    const phone10 = digits.slice(-10);
    const normalizedPhone = `+91 ${phone10.slice(0, 5)} ${phone10.slice(5)}`;

    const targetDateStr = (date || preferredDate || "").trim();
    if (!targetDateStr) {
      return NextResponse.json({ success: false, error: "Preferred appointment date is required." }, { status: 400 });
    }

    // Standardized ISO date YYYY-MM-DD
    let formattedDate = targetDateStr;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDateStr)) {
      const parsed = new Date(targetDateStr);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json({ success: false, error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
      }
      formattedDate = parsed.toISOString().split("T")[0];
    }

    const targetTimeStr = (time || preferredTime || "09:00 AM").trim();
    const sanitizedTime = targetTimeStr.slice(0, 20);

    const sanitizedProcedure = (procedure || treatment || "Consultation").trim().slice(0, 100);
    const sanitizedNotes = (notes || "").trim().slice(0, 300);
    const sanitizedEmail = email ? String(email).trim().toLowerCase().slice(0, 100) : null;

    const supabase = getAdminSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "An unexpected server configuration error occurred. Please try again later." }, { status: 500 });
    }

    // 2. Validate Doctor Selection (if provided)
    let validDoctorId: string | null = null;
    const requestedDoctorId = doctorId || doctor;
    if (requestedDoctorId && typeof requestedDoctorId === "string" && requestedDoctorId.trim()) {
      const { data: docRecord } = await supabase
        .from("doctors")
        .select("id")
        .eq("id", requestedDoctorId.trim())
        .single();
      
      if (docRecord) {
        validDoctorId = docRecord.id;
      }
    }

    // 3. Patient Matching (Search by normalized last 10 digits)
    const { data: dbPatients, error: patFetchErr } = await supabase
      .from("patients")
      .select("id, patient_id, name, phone");

    if (patFetchErr) {
      console.error("Failed to query patients:", patFetchErr.message);
      return NextResponse.json({ success: false, error: "Database service error." }, { status: 500 });
    }

    let matchedPatient = (dbPatients || []).find(p => {
      const pDigits = (p.phone || "").replace(/\D/g, "");
      return pDigits.endsWith(phone10);
    });

    let patientUuid: string;

    if (matchedPatient) {
      patientUuid = matchedPatient.id;
    } else {
      // Generate continuous 4-digit sequential Patient ID (0001, 0002, ...)
      let maxNum = 0;
      (dbPatients || []).forEach(p => {
        const rawId = p.patient_id || p.id || "";
        const matches = rawId.match(/\d+/g);
        if (matches) {
          matches.forEach((m: string) => {
            const num = parseInt(m, 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          });
        }
      });
      const newSeqId = (maxNum + 1).toString().padStart(4, "0");

      const { data: newPat, error: newPatErr } = await supabase
        .from("patients")
        .insert({
          patient_id: newSeqId,
          name: sanitizedName,
          phone: normalizedPhone,
          email: sanitizedEmail,
          patient_type: "New",
          status: "Active",
          visit: convertToUiDate(formattedDate),
          balance: "₹0",
          medical_notes: "None"
        })
        .select()
        .single();

      if (newPatErr || !newPat) {
        console.error("Failed to create patient record:", newPatErr?.message);
        return NextResponse.json({ success: false, error: "Failed to register patient record." }, { status: 500 });
      }
      patientUuid = newPat.id;
    }

    // 4. Duplicate Protection: Check if identical active appointment exists
    const { data: existingAppts } = await supabase
      .from("appointments")
      .select("id")
      .eq("patient_id", patientUuid)
      .eq("appointment_date", formattedDate)
      .eq("time_slot", sanitizedTime)
      .neq("status", "Cancelled");

    if (existingAppts && existingAppts.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Your appointment request has been received. Our clinic will contact you to confirm your appointment."
      });
    }

    // 5. Create Appointment in Supabase
    const requestNotes = sanitizedNotes ? `Public Website Request: ${sanitizedNotes}` : "Public Website Request";

    const { error: apptInsErr } = await supabase
      .from("appointments")
      .insert({
        patient_id: patientUuid,
        doctor_id: validDoctorId,
        appointment_date: formattedDate,
        time_slot: sanitizedTime,
        procedure_name: sanitizedProcedure,
        status: "Scheduled",
        notes: requestNotes
      });

    if (apptInsErr) {
      console.error("Failed to insert public appointment:", apptInsErr.message);
      return NextResponse.json({ success: false, error: "Failed to submit appointment request." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Your appointment request has been received. Our clinic will contact you to confirm your appointment."
    });

  } catch (err: any) {
    console.error("POST public-appointment server error:", err?.message || err);
    return NextResponse.json({ success: false, error: "An unexpected server error occurred. Please try again later." }, { status: 500 });
  }
}
