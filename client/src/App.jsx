import { useEffect, useState } from "react";
import {
  Activity,
  FileText,
  HeartPulse,
  Clock3,
  UserRound,
  Stethoscope,
  ChevronRight,
  CheckCircle2,
  X,
  Paperclip,
} from "lucide-react";

import "./index.css";
import DoctorDashboard from "./components/DoctorDashboard";
import HospitalDashboard from "./components/HospitalDashboard";
import LabStaffDashboard from "./components/LabStaffDashboard";
import NurseDashboard from "./components/NurseDashboard";

const API = "http://localhost:5000";
const patientId = "ANV-P001";

function App() {
  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState("patient");
  // const [view, setView] = useState("hospital");
  const [form, setForm] = useState({
    type: "Lab Report",
    title: "",
    description: "",
    department: "Cardiology",
    createdBy: "Dr. Sharma",
    file: null,
  });
  const [consent, setConsent] = useState(null);
  const [consentLoading, setConsentLoading] = useState(false);
  const [showAllRecords, setShowAllRecords] = useState(false);

  const loadData = async () => {
    try {
      // 1. Load patient identity first
      const patientRes = await fetch(`${API}/api/patients/${patientId}`);

      if (!patientRes.ok) {
        throw new Error("Failed to load patient information");
      }

      const patientData = await patientRes.json();

      // Patient information should never depend on consent or
      // care-record loading.
      setPatient(patientData.patient);

      // 2. Load consent separately
      try {
        const consentRes = await fetch(`${API}/api/consent/${patientId}`);

        if (consentRes.ok) {
          const consentData = await consentRes.json();
          setConsent(consentData.consent);
        }
      } catch (error) {
        console.error("Consent loading failed:", error);
      }

      // 3. Load patient's own care records separately
      try {
        const timelineRes = await fetch(
          `${API}/api/care-events/patient/${patientId}`,
        );

        if (!timelineRes.ok) {
          throw new Error("Failed to load patient care records");
        }

        const timelineData = await timelineRes.json();

        setTimeline(timelineData.timeline || []);
      } catch (error) {
        console.error("Care records loading failed:", error);

        // Do not destroy patient information if records fail.
        setTimeline([]);
      }
    } catch (error) {
      console.error("Patient loading failed:", error);

      // Keep the UI from showing fake/undefined patient information.
      setPatient(null);
    } finally {
      setLoading(false);
    }
  };
  const updateConsent = async (granted) => {
    try {
      setConsentLoading(true);

      const response = await fetch(`${API}/api/consent/${patientId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ granted }),
      });

      const data = await response.json();

      if (data.success) {
        setConsent(data.consent);
        await loadData();
      }
    } catch (error) {
      console.error("Consent update failed:", error);
    } finally {
      setConsentLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);
  if (view === "hospital") {
    return (
      <HospitalDashboard
        onBack={() => setView("patient")}
        onSwitchRole={setView}
      />
    );
  }
  if (view === "doctor") {
    return (
      <DoctorDashboard
        onBack={() => setView("patient")}
        onSwitchRole={setView}
      />
    );
  }
  if (view === "lab_staff") {
  return (
    <LabStaffDashboard
      onBack={() => setView("patient")}
      onSwitchRole={setView}
    />
  );
}
if (view === "nurse") {
  return (
    <NurseDashboard
      onBack={() => setView("patient")}
      onSwitchRole={setView}
    />
  );
}
  if (loading) {
    return (
      <div className="loading">
        <HeartPulse size={42} />
        <h2>Loading ANVAYA...</h2>
      </div>
    );
  }

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon">
              <HeartPulse size={24} />
            </div>

            <div>
              <div className="brand-name">ANVAYA</div>
              <div className="brand-subtitle">Connected Digital Healthcare</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value="patient"
                onChange={(e) => setView(e.target.value)}
                className="appearance-none rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 pr-9 text-xs font-bold text-blue-700 outline-none cursor-pointer"
              >
                <option value="patient">Patient View</option>
                <option value="doctor">Doctor Portal</option>
                <option value="lab_staff">Lab Staff</option>
                <option value="nurse">Nursing Workspace</option>
                <option value="receptionist">Reception Workspace</option>
                <option value="hospital">Hospital Operations</option>
              </select>

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-blue-600">
                ▾
              </span>
            </div>

            <div className="avatar">
              <UserRound size={18} />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="container">
        {/* WELCOME */}
        <section className="welcome">
          <div className="eyebrow">YOUR HEALTH JOURNEY</div>

          <h1>Welcome, {patient?.name}</h1>

          <p>Your healthcare information, connected in one place.</p>
        </section>

        {/* HEALTH SNAPSHOT */}
        <section className="health-snapshot">
          <div className="snapshot-heading">
            <div>
              <div className="eyebrow">HEALTH SNAPSHOT</div>

              <h2>Your care at a glance</h2>

              <p>
                Important health information and recent activity from your
                connected care journey.
              </p>
            </div>

            <div className="snapshot-status">
              <CheckCircle2 size={16} />
              Records Connected
            </div>
          </div>

          <div className="snapshot-grid">
            {/* ALLERGIES */}
            <div className="snapshot-card allergy-card">
              <div className="snapshot-card-top">
                <div className="snapshot-icon">⚠️</div>

                <div>
                  <div className="snapshot-label">ALLERGIES</div>
                  <div className="snapshot-meta">
                    {patient?.allergies?.length || 0} recorded
                  </div>
                </div>
              </div>

              <div className="snapshot-value">
                {patient?.allergies?.length > 0
                  ? patient.allergies.slice(0, 2).join(", ")
                  : "No known allergies"}
              </div>

              {patient?.allergies?.length > 2 && (
                <div className="snapshot-note">
                  +{patient.allergies.length - 2} more
                </div>
              )}
            </div>

            {/* MEDICATIONS */}
            <div className="snapshot-card medication-card">
              <div className="snapshot-card-top">
                <div className="snapshot-icon">💊</div>

                <div>
                  <div className="snapshot-label">CURRENT MEDICATION</div>
                  <div className="snapshot-meta">
                    {patient?.currentMedications?.length || 0} active
                  </div>
                </div>
              </div>

              <div className="snapshot-value">
                {patient?.currentMedications?.length > 0
                  ? patient.currentMedications[0].name
                  : "No active medication"}
              </div>

              {patient?.currentMedications?.length > 1 && (
                <div className="snapshot-note">
                  +{patient.currentMedications.length - 1} more medications
                </div>
              )}
            </div>

            {/* VACCINATIONS */}
            <div className="snapshot-card vaccination-card">
              <div className="snapshot-card-top">
                <div className="snapshot-icon">💉</div>

                <div>
                  <div className="snapshot-label">VACCINATIONS</div>
                  <div className="snapshot-meta">
                    {patient?.vaccinations?.length || 0} recorded
                  </div>
                </div>
              </div>

              <div className="snapshot-value">
                {patient?.vaccinations?.length > 0
                  ? `${patient.vaccinations.length} immunizations`
                  : "No records available"}
              </div>

              <div className="snapshot-note">Immunization history</div>
            </div>

            {/* CARE RECORDS */}
            <div className="snapshot-card records-card">
              <div className="snapshot-card-top">
                <div className="snapshot-icon">
                  <FileText size={19} />
                </div>

                <div>
                  <div className="snapshot-label">CARE RECORDS</div>
                  <div className="snapshot-meta">Connected history</div>
                </div>
              </div>

              <div className="snapshot-value">{timeline.length} records</div>

              <div className="snapshot-note">Across your care journey</div>
            </div>
          </div>
        </section>
        {/* MAIN GRID */}
        <div className="content-grid">
          {/* CARE JOURNEY */}
          <section className="card">
            <div className="card-header">
              <div>
                <h2>Care Journey</h2>

                <p>Complete timeline of your healthcare interactions</p>
              </div>

              <div className="connected">
                <CheckCircle2 size={17} />
                Connected
              </div>
            </div>

            <div className="timeline">
              {timeline.map((event, index) => (
                <TimelineItem
                  key={event._id}
                  event={event}
                  last={index === timeline.length - 1}
                />
              ))}
            </div>
          </section>

          {/* RIGHT PANEL */}
          <aside>
            {/* QUICK ACTIONS */}
            <div className="card action-card">
              <h2>Quick Actions</h2>

              <p className="muted">Manage your connected health records</p>

              <button
                className="secondary-button"
                onClick={() => setShowAllRecords(true)}
              >
                <FileText size={18} />
                View All Records
                <ChevronRight size={16} />
              </button>
            </div>
            {/*consent*/}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Consent & Sharing
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    You control who can access your connected health records.
                  </p>
                </div>

                <div
                  className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                    consent?.granted
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {consent?.granted ? "CONSENT ACTIVE" : "NOT SHARED"}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Healthcare record access
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Allow authorized doctors to view your records
                  </p>
                </div>

                <button
                  disabled={consentLoading}
                  onClick={() => updateConsent(!consent?.granted)}
                  className={`relative h-6 w-11 rounded-full transition ${
                    consent?.granted ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      consent?.granted ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
            {/* LATEST CARE */}
            <div className="latest-card">
              <div className="latest-title">
                <Stethoscope size={19} />
                Latest Care
              </div>

              {timeline[0] && (
                <>
                  <h3>{timeline[0].title}</h3>

                  <p>{timeline[0].department}</p>

                  <div className="latest-time">
                    <Clock3 size={14} />

                    {new Date(timeline[0].timestamp).toLocaleString()}
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </main>
      {showAllRecords && (
        <div className="records-modal-overlay">
          <div className="records-modal">
            {/* HEADER */}
            <div className="records-modal-header">
              <div>
                <div className="eyebrow">CONNECTED RECORDS</div>

                <h2>All Health Records</h2>

                <p>
                  {patient?.name} · {patient?.patientId}
                </p>
              </div>

              <button
                className="records-close"
                onClick={() => setShowAllRecords(false)}
                aria-label="Close records"
              >
                <X size={20} />
              </button>
            </div>

            {/* SUMMARY */}
            <div className="records-summary">
              <div>
                <strong>{timeline.length}</strong>
                <span>connected records</span>
              </div>

              <div className="records-summary-status">
                <CheckCircle2 size={15} />
                Connected care history
              </div>
            </div>

            {/* RECORD LIST */}
            <div className="records-list">
              {timeline.length === 0 ? (
                <div className="records-empty">
                  <FileText size={24} />
                  <h3>No health records yet</h3>
                  <p>
                    Connected care records will appear here when they are added.
                  </p>
                </div>
              ) : (
                timeline.map((event, index) => (
                  <div className="all-record-item" key={event._id}>
                    <div className="all-record-icon">
                      {event.type === "Consultation" ? (
                        <Stethoscope size={18} />
                      ) : (
                        <FileText size={18} />
                      )}
                    </div>

                    <div className="all-record-main">
                      <div className="all-record-top">
                        <div>
                          <span className="all-record-type">{event.type}</span>

                          <h3>{event.title}</h3>

                          <p>{event.department}</p>
                        </div>

                        <div className="all-record-date">
                          <Clock3 size={13} />

                          {new Date(event.timestamp).toLocaleDateString()}
                        </div>
                      </div>

                      {event.description && (
                        <p className="all-record-description">
                          {event.description}
                        </p>
                      )}

                      <div className="all-record-footer">
                        <span>
                          Recorded by {event.createdBy || "Healthcare Staff"}
                        </span>

                        {event.fileName && event.fileUrl && (
                          <button
                            onClick={() =>
                              window.open(`${API}${event.fileUrl}`, "_blank")
                            }
                            className="all-record-file"
                          >
                            <Paperclip size={13} />
                            View original record
                            <ChevronRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div className="summary-card">
      <div className="summary-icon">{icon}</div>

      <div className="summary-label">{label}</div>

      <div className="summary-value">{value}</div>
    </div>
  );
}

function TimelineItem({ event, last }) {
  return (
    <div className="timeline-item">
      <div className="timeline-left">
        <div className="timeline-icon">
          {event.type === "Consultation" ? (
            <Stethoscope size={19} />
          ) : (
            <FileText size={19} />
          )}
        </div>

        {!last && <div className="timeline-line" />}
      </div>

      <div className="timeline-content">
        <div className="timeline-top">
          <div>
            <h3>{event.title}</h3>

            <div className="department">{event.department}</div>
          </div>

          <div className="date">
            <Clock3 size={13} />

            {new Date(event.timestamp).toLocaleDateString()}
          </div>
        </div>

        <p>{event.description}</p>

        <div className="event-meta">
          <span className="tag">{event.type}</span>

          <span className="created">Added by {event.createdBy}</span>

          {event.fileName && event.fileUrl && (
            <button
              onClick={() => window.open(`${API}${event.fileUrl}`, "_blank")}
              className="attachment"
            >
              <Paperclip size={14} />
              {event.fileName}
              <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
