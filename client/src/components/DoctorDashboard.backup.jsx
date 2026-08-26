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
} from "lucide-react";

const API = "http://localhost:5000";

function DoctorDashboard({ onBack }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(null);

  // LIVE HOSPITAL STATUS
  const [hospitalStatus, setHospitalStatus] = useState([]);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusUpdatedAt, setStatusUpdatedAt] = useState(null);

  useEffect(() => {
    fetchPatients();
    fetchHospitalStatus();

    const interval = setInterval(() => {
      fetchHospitalStatus();
    }, 30000);

    return () => clearInterval(interval);
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

  const fetchHospitalStatus = async () => {
    try {
      setStatusLoading(true);

      const response = await fetch(`${API}/api/hospital-status`);
      const data = await response.json();

      setHospitalStatus(data.departments || []);
      setStatusUpdatedAt(data.updatedAt || new Date().toISOString());
    } catch (error) {
      console.error("Failed to load hospital status:", error);
    } finally {
      setStatusLoading(false);
    }
  };

  const openPatient = async (patient) => {
    setSelectedPatient(patient);
    setLoading(true);

    try {
      const response = await fetch(
        `${API}/api/care-events/patient/${patient.patientId}`,
      );

      const data = await response.json();

      setTimeline(data.timeline || []);
    } catch (error) {
      console.error("Failed to load patient records:", error);
    } finally {
      setLoading(false);
    }

    try {
      const consentResponse = await fetch(
        `${API}/api/consent/${patient.patientId}`,
      );

      const consentData = await consentResponse.json();

      setConsent(consentData.consent);
    } catch (error) {
      console.error("Failed to load consent:", error);
      setConsent(null);
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
              <h1 className="text-xl font-extrabold text-slate-900">
                ANVAYA
              </h1>

              <p className="text-xs text-slate-500">
                Connected Digital Healthcare
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 sm:block">
              Doctor Portal
            </span>

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

        {/* ===================================================== */}
        {/* LIVE HOSPITAL FLOW */}
        {/* ===================================================== */}

        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* SECTION HEADER */}
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Activity size={19} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Live Hospital Flow
                  </h3>

                  <p className="text-xs text-slate-500">
                    Current department status
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                LIVE
              </div>

              <button
                onClick={fetchHospitalStatus}
                disabled={statusLoading}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={statusLoading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* STATUS CARDS */}
          {statusLoading && hospitalStatus.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              Loading live hospital status...
            </div>
          ) : (
            <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 sm:p-5">
              {hospitalStatus.map((department) => (
                <div
                  key={department.department}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
                >
                  {/* DEPARTMENT */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {department.department}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            department.status === "Available"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        />

                        <span className="text-xs font-semibold text-slate-600">
                          {department.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                      <Stethoscope size={17} />
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div className="mt-4 space-y-2 border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <UserRound size={13} />
                        Doctor
                      </span>

                      <span className="font-semibold text-slate-700">
                        {department.doctor}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <MapPin size={13} />
                        Room
                      </span>

                      <span className="font-semibold text-slate-700">
                        {department.room}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Users size={13} />
                        Waiting
                      </span>

                      <span className="font-semibold text-slate-700">
                        {department.patientsWaiting} patients
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Timer size={13} />
                        Est. wait
                      </span>

                      <span className="font-bold text-blue-600">
                        {department.estimatedWait}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* UPDATED TIME */}
          {statusUpdatedAt && (
            <div className="border-t border-slate-100 px-5 py-3 text-right text-[10px] text-slate-400 sm:px-6">
              Last updated{" "}
              {new Date(statusUpdatedAt).toLocaleTimeString()}
              {" • "}Auto-refresh every 30 sec
            </div>
          )}
        </section>

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
                    <UserRound
                      size={35}
                      className="mx-auto text-slate-300"
                    />

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
              }}
              className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              Back to Patients
            </button>

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
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <UserRound size={25} />
                  </div>

                  <div>
                    <p className="text-xs font-bold tracking-wider text-blue-600">
                      PATIENT RECORD
                    </p>

                    <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                      {selectedPatient.name}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      {selectedPatient.patientId} • {selectedPatient.age} years
                      • {selectedPatient.gender}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <InfoBox
                    label="Blood Group"
                    value={selectedPatient.bloodGroup}
                  />

                  <InfoBox label="ABHA" value={selectedPatient.abhaMasked} />
                </div>
              </div>
            </div>

            {/* CARE JOURNEY */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Care Journey
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Connected clinical records across encounters.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <CheckCircle2 size={16} />
                  Connected
                </div>
              </div>

              {loading ? (
                <div className="px-6 py-12 text-center text-sm text-slate-500">
                  Loading patient records...
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {timeline.map((event) => (
                    <div key={event._id} className="flex gap-4 px-5 py-5 sm:px-6">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        {event.type === "Consultation" ? (
                          <Stethoscope size={19} />
                        ) : (
                          <FileText size={19} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col justify-between gap-2 md:flex-row">
                          <div>
                            <h4 className="font-bold text-slate-900">
                              {event.title}
                            </h4>

                            <p className="mt-1 text-xs font-semibold text-blue-600">
                              {event.department}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock3 size={13} />
                            {new Date(
                              event.timestamp,
                            ).toLocaleDateString()}
                          </div>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          {event.description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                            {event.type}
                          </span>

                          <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-500">
                            Added by {event.createdBy}
                          </span>

                          {event.fileName && event.fileUrl && (
                            <button
                              onClick={() =>
                                window.open(
                                  `${API}${event.fileUrl}`,
                                  "_blank",
                                )
                              }
                              className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600 transition hover:bg-emerald-100"
                            >
                              📎 {event.fileName} →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {timeline.length === 0 && (
                    <div className="px-6 py-12 text-center text-sm text-slate-500">
                      No care records available.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
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