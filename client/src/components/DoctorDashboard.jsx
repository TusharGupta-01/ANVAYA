import ABHAVerification from "./ABHAVerification";
import { useEffect, useState } from "react";
import {
  Search,
  UserRound,
  HeartPulse,
  FileText,
  Clock3,
  Stethoscope,
  ArrowLeft,
  CheckCircle2,
  Activity,
  Users,
  Timer,
  MapPin,
  RefreshCw,
  Plus,
  Lock,
} from "lucide-react";

const API = "http://localhost:5000";

function DoctorDashboard({ onBack, onSwitchRole }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(null);
  const [abhaVerified, setAbhaVerified] = useState(false);
  const [showRecordCare, setShowRecordCare] = useState(false);

  const [recordSaving, setRecordSaving] = useState(false);

  const [recordForm, setRecordForm] = useState({
    type: "Prescription",
    title: "",
    description: "",
    department: "General Medicine",
    file: null,
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${API}/api/patients`);
      const data = await response.json();

      setPatients(data.patients || []);
    } catch (error) {
      console.error("Failed to load patients:", error);
    }
  };

  const openPatient = async (patient) => {
    setSelectedPatient(patient);

    // New patient session starts locked
    setAbhaVerified(false);
    setConsent(null);
    setTimeline([]);
    setLoading(false);
  };
  const handleAbhaVerified = async () => {
    setAbhaVerified(true);
    setLoading(true);

    try {
      // 1. Check patient consent only after identity verification
      const consentResponse = await fetch(
        `${API}/api/consent/${selectedPatient.patientId}`,
      );

      const consentData = await consentResponse.json();

      setConsent(consentData.consent);

      // 2. Consent is required before clinical records are loaded
      if (!consentData.consent?.granted) {
        setTimeline([]);
        return;
      }

      // 3. Only now request the care journey
      const recordsResponse = await fetch(
        `${API}/api/care-events/doctor/${selectedPatient.patientId}`,
      );

      if (!recordsResponse.ok) {
        throw new Error("Failed to load authorized patient records");
      }

      const recordsData = await recordsResponse.json();

      setTimeline(recordsData.timeline || []);
    } catch (error) {
      console.error("Failed to load authorized patient data:", error);

      setConsent(null);
      setTimeline([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordCare = async (e) => {
    e.preventDefault();

    if (!selectedPatient) return;

    if (!recordForm.title.trim()) {
      alert("Please enter a record title.");
      return;
    }

    try {
      setRecordSaving(true);

      const formData = new FormData();

      // Patient context is automatically attached
      formData.append("patientId", selectedPatient.patientId);

      formData.append("type", recordForm.type);
      formData.append("title", recordForm.title);
      formData.append("description", recordForm.description);
      formData.append("department", recordForm.department);

      if (recordForm.file) {
        formData.append("file", recordForm.file);
      }

      const response = await fetch(`${API}/api/care-events`, {
        method: "POST",
        headers: {
          "x-user-role": "doctor",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save care record");
      }

      // Close form
      setShowRecordCare(false);

      // Reset form
      setRecordForm({
        type: "Prescription",
        title: "",
        description: "",
        department: "General Medicine",
        file: null,
      });

      // Refresh Care Journey
      const recordsResponse = await fetch(
        `${API}/api/care-events/doctor/${selectedPatient.patientId}`,
      );

      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json();
        setTimeline(recordsData.timeline || []);
      }
    } catch (error) {
      console.error("Failed to save care record:", error);
      alert(error.message || "Failed to save care record.");
    } finally {
      setRecordSaving(false);
    }
  };

  const filteredPatients = patients.filter((patient) =>
    `${patient.name} ${patient.patientId}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <HeartPulse size={24} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-slate-900">ANVAYA</h1>

              <p className="text-xs text-slate-500">
                Connected Digital Healthcare
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value="doctor"
                onChange={(e) => onSwitchRole(e.target.value)}
                className="appearance-none rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 pr-9 text-xs font-bold text-blue-700 outline-none cursor-pointer"
              >
                <option value="patient">Patient View</option>
                <option value="doctor">Doctor Portal</option>
                <option value="hospital">Hospital Operations</option>
              </select>

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-blue-600">
                ▾
              </span>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <Stethoscope size={18} />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* TITLE */}
        <div className="mb-7">
          <p className="text-xs font-bold tracking-widest text-blue-600">
            CLINICAL WORKSPACE
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Patient Care Dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Access connected patient information and care history.
          </p>
        </div>

        {!selectedPatient ? (
          <>
            {/* SEARCH */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Find Patient
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Search by patient name or ANVAYA patient ID.
                </p>
              </div>

              <div className="relative">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Rahul Sharma or ANV-P001"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>

            {/* PATIENT LIST */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <h3 className="font-bold text-slate-900">Patients</h3>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredPatients.length} patient
                  {filteredPatients.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient._id}
                    onClick={() => openPatient(patient)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-blue-50 sm:px-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <UserRound size={20} />
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900">
                          {patient.name}
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          {patient.patientId} • {patient.age} years •{" "}
                          {patient.gender}
                        </p>
                      </div>
                    </div>

                    <span className="hidden text-sm font-semibold text-blue-600 sm:block">
                      View Record →
                    </span>
                  </button>
                ))}

                {filteredPatients.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <UserRound size={35} className="mx-auto text-slate-300" />

                    <p className="mt-3 font-semibold text-slate-600">
                      No patient found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try searching by name or patient ID.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* PATIENT RECORD */
          <div>
            {/* BACK */}
            <button
              onClick={() => {
                setSelectedPatient(null);
                setTimeline([]);
                setConsent(null);
                setAbhaVerified(false);
              }}
              className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              Back to Patients
            </button>
            {/* ABHA VERIFICATION */}
            <ABHAVerification
              patient={selectedPatient}
              onVerified={handleAbhaVerified}
            />
            {/* CONSENT STATUS */}
            <div
              className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold ${
                consent?.granted
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              <CheckCircle2 size={16} />

              {consent?.granted
                ? "Patient Consent Verified"
                : "Consent Required"}
            </div>

            {/* PATIENT HEADER */}
            {/* PATIENT CLINICAL SNAPSHOT */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* Patient Identity */}
              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <UserRound size={25} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-bold tracking-wider text-blue-600">
                          PATIENT RECORD
                        </p>

                        {abhaVerified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                            <CheckCircle2 size={12} />
                            ABHA VERIFIED
                          </span>
                        )}
                      </div>

                      <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                        {selectedPatient.name}
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        {selectedPatient.age} years • {selectedPatient.gender}
                      </p>

                      <p className="mt-1 text-[11px] font-medium text-slate-400">
                        Patient ID: {selectedPatient.patientId}
                      </p>
                    </div>
                  </div>

                  {/* Basic Details + Record Care */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="grid grid-cols-2 gap-3">
                      <InfoBox
                        label="Blood Group"
                        value={selectedPatient.bloodGroup || "Not Available"}
                      />

                      <InfoBox
                        label="ABHA"
                        value={selectedPatient.abhaMasked || "Not Linked"}
                      />
                    </div>

                    {abhaVerified && consent?.granted && (
                      <button
                        type="button"
                        onClick={() => setShowRecordCare(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                      >
                        <Plus size={18} />
                        Record Care
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Clinical Snapshot */}
              <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-4 sm:px-6 sm:py-5">
                {abhaVerified && consent?.granted ? (
                  <>
                    <div className="mb-3 flex items-end justify-between gap-4">
                      <h3 className="text-base font-extrabold text-slate-900">
                        Clinical Snapshot
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Important information for safe and informed care.
                      </p>
                    </div>
                    <span className="hidden text-[11px] font-medium text-slate-400 sm:block">
                      Clinical summary
                    </span>
                    <div className="grid gap-3 lg:grid-cols-3">
                      {/* Allergies */}
                      <div className="rounded-xl border border-red-100 bg-white p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⚠️</span>

                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                              Allergies
                            </p>

                            <p className="text-[11px] text-slate-400">
                              Safety information
                            </p>
                            <p className="mt-0.5 text-[10px] font-semibold text-red-500">
                              {selectedPatient.allergies?.length || 0} recorded
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          {selectedPatient.allergies?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedPatient.allergies.map(
                                (allergy, index) => (
                                  <span
                                    key={`${allergy}-${index}`}
                                    className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700"
                                  >
                                    {allergy}
                                  </span>
                                ),
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">
                              No known allergies recorded
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Current Medications */}
                      <div className="rounded-xl border border-blue-100 bg-white p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">💊</span>

                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                              Current Medication
                            </p>

                            <p className="text-[11px] text-slate-400">
                              Active medications
                            </p>
                            <p className="mt-0.5 text-[10px] font-semibold text-blue-500">
                              {selectedPatient.currentMedications?.length || 0}{" "}
                              active
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          {selectedPatient.currentMedications?.length > 0 ? (
                            selectedPatient.currentMedications
                              .slice(0, 2)
                              .map((medication) => (
                                <div
                                  key={medication._id || medication.name}
                                  className="rounded-lg bg-blue-50/70 px-3 py-2"
                                >
                                  <p className="text-xs font-bold text-slate-800">
                                    {medication.name}
                                  </p>

                                  <p className="mt-0.5 text-[11px] text-slate-500">
                                    {medication.dosage}
                                    {medication.frequency
                                      ? ` • ${medication.frequency}`
                                      : ""}
                                  </p>
                                </div>
                              ))
                          ) : (
                            <p className="text-sm text-slate-500">
                              No active medications recorded
                            </p>
                          )}
                        </div>

                        {selectedPatient.currentMedications?.length > 2 && (
                          <p className="mt-2 text-[11px] font-semibold text-blue-600">
                            +{selectedPatient.currentMedications.length - 2}{" "}
                            more medications
                          </p>
                        )}
                      </div>

                      {/* Vaccinations */}
                      <div className="rounded-xl border border-emerald-100 bg-white p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">💉</span>

                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                              Vaccinations
                            </p>

                            <p className="text-[11px] text-slate-400">
                              Recorded immunizations
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          {selectedPatient.vaccinations?.length > 0 ? (
                            selectedPatient.vaccinations
                              .slice(0, 3)
                              .map((vaccine) => (
                                <div
                                  key={vaccine._id || vaccine.name}
                                  className="flex items-center justify-between rounded-lg bg-emerald-50/60 px-3 py-2"
                                >
                                  <div>
                                    <p className="text-xs font-semibold text-slate-800">
                                      {vaccine.name}
                                    </p>

                                    {vaccine.date && (
                                      <p className="mt-0.5 text-[10px] text-slate-400">
                                        {new Date(
                                          vaccine.date,
                                        ).toLocaleDateString("en-IN", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        })}
                                      </p>
                                    )}
                                  </div>

                                  <span className="text-[10px] font-bold text-emerald-700">
                                    ✓ {vaccine.status}
                                  </span>
                                </div>
                              ))
                          ) : (
                            <p className="text-sm text-slate-500">
                              No vaccination records available
                            </p>
                          )}
                        </div>

                        {selectedPatient.vaccinations?.length > 3 && (
                          <p className="mt-2 text-[11px] font-semibold text-emerald-600">
                            +{selectedPatient.vaccinations.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-[220px] items-center justify-center">
                    <div className="max-w-md text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                        <Lock size={24} />
                      </div>

                      {!abhaVerified ? (
                        <>
                          <h3 className="mt-4 text-base font-extrabold text-slate-900">
                            Clinical Information Protected
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            Verify the patient's ABHA-linked identity before
                            accessing clinical information.
                          </p>

                          <p className="mt-3 text-xs font-semibold text-blue-600">
                            ABHA verification required
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="mt-4 text-base font-extrabold text-slate-900">
                            Patient Consent Required
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            Patient consent is required before accessing
                            connected clinical information.
                          </p>

                          <p className="mt-3 text-xs font-semibold text-amber-600">
                            Waiting for patient consent
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* CARE JOURNEY */}
            {abhaVerified &&
              (consent?.granted ? (
                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {/* JOURNEY HEADER */}
                  <div className="border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                            Care Journey
                          </h3>

                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                            {timeline.length}{" "}
                            {timeline.length === 1 ? "record" : "records"}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          Connected clinical records from the patient's care
                          encounters.
                        </p>
                      </div>

                      <div className="flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        <CheckCircle2 size={15} />
                        Records Connected
                      </div>
                    </div>
                  </div>

                  {/* JOURNEY CONTENT */}
                  {loading ? (
                    <div className="px-6 py-16 text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                      <p className="mt-4 text-sm font-medium text-slate-500">
                        Loading connected care records...
                      </p>
                    </div>
                  ) : timeline.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <FileText size={24} />
                      </div>

                      <h4 className="mt-4 text-base font-bold text-slate-900">
                        No care records yet
                      </h4>

                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        Clinical records captured during the patient's
                        encounters will appear here automatically.
                      </p>
                    </div>
                  ) : (
                    <div className="px-5 py-6 sm:px-7 sm:py-7">
                      {/* TIMELINE */}
                      <div className="relative">
                        {/* Vertical timeline line */}
                        <div className="absolute bottom-6 left-[19px] top-6 w-px bg-slate-200" />

                        <div className="space-y-7">
                          {timeline.map((event, index) => {
                            const eventDate = new Date(event.timestamp);

                            return (
                              <div
                                key={event._id}
                                className="relative flex gap-4 sm:gap-5"
                              >
                                {/* Timeline marker */}
                                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white bg-blue-50 text-blue-600 shadow-sm">
                                  {event.type === "Consultation" ? (
                                    <Stethoscope size={18} />
                                  ) : (
                                    <FileText size={18} />
                                  )}
                                </div>

                                {/* RECORD CARD */}
                                <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/40 p-4 transition hover:border-blue-200 hover:bg-blue-50/20 sm:p-5">
                                  {/* Top row */}
                                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                    <div className="min-w-0">
                                      {/* Record type */}
                                      <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                                          {event.type}
                                        </span>

                                        {index === 0 && (
                                          <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                                            Latest
                                          </span>
                                        )}
                                      </div>

                                      {/* Title */}
                                      <h4 className="text-base font-extrabold text-slate-900 sm:text-lg">
                                        {event.title}
                                      </h4>

                                      {/* Department */}
                                      <p className="mt-1 text-sm font-semibold text-blue-600">
                                        {event.department || "General Medicine"}
                                      </p>
                                    </div>

                                    {/* Date */}
                                    <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-500">
                                      <Clock3 size={14} />

                                      <span>
                                        {eventDate.toLocaleDateString("en-IN", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        })}
                                      </span>

                                      <span className="text-slate-300">•</span>

                                      <span>
                                        {eventDate.toLocaleTimeString("en-IN", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Description */}
                                  {event.description && (
                                    <p className="mt-4 text-sm leading-6 text-slate-600">
                                      {event.description}
                                    </p>
                                  )}

                                  {/* Encounter context */}
                                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
                                    <span className="rounded-md bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                                      Department:{" "}
                                      {event.department || "General Medicine"}
                                    </span>

                                    <span className="rounded-md bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                                      Recorded by:{" "}
                                      {event.createdBy || "Healthcare Staff"}
                                    </span>
                                  </div>

                                  {/* Document */}
                                  {event.fileName && event.fileUrl && (
                                    <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-3">
                                      <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                                          <FileText size={17} />
                                        </div>

                                        <div className="min-w-0">
                                          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                                            Original Record
                                          </p>

                                          <p className="truncate text-xs font-semibold text-slate-700">
                                            {event.fileName}
                                          </p>
                                        </div>
                                      </div>

                                      <button
                                        onClick={() =>
                                          window.open(
                                            `${API}${event.fileUrl}`,
                                            "_blank",
                                          )
                                        }
                                        className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-200 transition hover:bg-emerald-100"
                                      >
                                        View Record →
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-6 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
                  <div className="border-b border-amber-100 px-5 py-5 sm:px-7">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">
                          Care Journey
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Connected clinical records across patient encounters.
                        </p>
                      </div>

                      <div className="hidden rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 sm:block">
                        Protected
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                      <Lock size={24} />
                    </div>

                    <h4 className="mt-4 text-lg font-extrabold text-slate-900">
                      Health Records Locked
                    </h4>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Patient consent is required before connected clinical
                      records can be accessed.
                    </p>

                    <div className="mt-5 inline-flex items-center rounded-full bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700">
                      Consent Required
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>
      {showRecordCare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-5 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* HEADER */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Point of Care
                  </span>

                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    AUTHORIZED
                  </span>
                </div>

                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                  Record Care
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Capture this encounter while care is happening.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowRecordCare(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            {/* PATIENT CONTEXT */}
            <div className="shrink-0 border-b border-slate-100 bg-slate-50 px-6 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <UserRound size={19} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">
                        {selectedPatient.name}
                      </p>

                      <span className="text-[10px] font-semibold text-slate-400">
                        {selectedPatient.patientId}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      {selectedPatient.age} years • {selectedPatient.gender} •{" "}
                      {selectedPatient.bloodGroup || "Blood group unavailable"}
                    </p>
                  </div>
                </div>

                <div className="hidden text-right sm:block">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Access verified
                  </p>

                  <p className="mt-0.5 text-[11px] font-bold text-emerald-600">
                    ABHA + Patient Consent
                  </p>
                </div>
              </div>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleRecordCare}
              className="min-h-0 overflow-y-auto"
            >
              <div className="px-6 py-5">
                {/* SECTION TITLE */}
                <div className="mb-4">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Care Details
                  </h3>

                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Enter the clinical information from this encounter.
                  </p>
                </div>

                {/* TYPE + DEPARTMENT */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold text-slate-700">
                      Record Type
                    </label>

                    <select
                      value={recordForm.type}
                      onChange={(e) =>
                        setRecordForm({
                          ...recordForm,
                          type: e.target.value,
                        })
                      }
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option>Consultation</option>
                      <option>Prescription</option>
                      <option>Clinical Note</option>
                      <option>Care Observation</option>
                      <option>Lab Report</option>
                      <option>ECG Report</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold text-slate-700">
                      Department
                    </label>

                    <select
                      value={recordForm.department}
                      onChange={(e) =>
                        setRecordForm({
                          ...recordForm,
                          department: e.target.value,
                        })
                      }
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option>General Medicine</option>
                      <option>Cardiology</option>
                      <option>Pathology</option>
                      <option>Radiology</option>
                      <option>Emergency</option>
                      <option>Orthopedics</option>
                    </select>
                  </div>
                </div>

                {/* TITLE */}
                <div className="mt-4">
                  <label className="mb-1.5 block text-[11px] font-bold text-slate-700">
                    Record Title
                  </label>

                  <input
                    type="text"
                    value={recordForm.title}
                    onChange={(e) =>
                      setRecordForm({
                        ...recordForm,
                        title: e.target.value,
                      })
                    }
                    placeholder="e.g. Fever consultation"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* CLINICAL SUMMARY */}
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">
                      Clinical Summary
                    </label>

                    <span className="text-[10px] text-slate-400">
                      Brief encounter note
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    value={recordForm.description}
                    onChange={(e) =>
                      setRecordForm({
                        ...recordForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Findings, diagnosis, treatment or observation..."
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm leading-5 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* ATTACHMENT */}
                <div className="mt-5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">
                      Supporting Record
                    </label>

                    <span className="text-[10px] text-slate-400">Optional</span>
                  </div>

                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50/40">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                      <FileText size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-700">
                        {recordForm.file
                          ? recordForm.file.name
                          : "Attach prescription, report or clinical document"}
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        PDF, JPG or PNG • Max 10 MB
                      </p>
                    </div>

                    <span className="shrink-0 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600">
                      Browse
                    </span>

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) =>
                        setRecordForm({
                          ...recordForm,
                          file: e.target.files?.[0] || null,
                        })
                      }
                    />
                  </label>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3.5">
                <p className="hidden text-[10px] text-slate-400 sm:block">
                  Record will be added to the patient's Care Journey.
                </p>

                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRecordCare(false)}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={recordSaving}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {recordSaving ? "Saving..." : "Save Care Record"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">
        {value || "Not available"}
      </p>
    </div>
  );
}

export default DoctorDashboard;
