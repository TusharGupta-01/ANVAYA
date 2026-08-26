import { useEffect, useState } from "react";
import {
  Activity,
  FileText,
  HeartPulse,
  Clock3,
  Upload,
  UserRound,
  Stethoscope,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

import "./index.css";
import DoctorDashboard from "./components/DoctorDashboard";
const API = "http://localhost:5000";
const patientId = "ANV-P001";

function App() {
  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState("patient");
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

  const loadData = async () => {
    try {
      const patientRes = await fetch(`${API}/api/patients/${patientId}`);

      const patientData = await patientRes.json();

      const timelineRes = await fetch(
        `${API}/api/care-events/patient/${patientId}`,
      );
      const consentRes = await fetch(`${API}/api/consent/${patientId}`);

      const consentData = await consentRes.json();

      setConsent(consentData.consent);
      const timelineData = await timelineRes.json();

      setPatient(patientData.patient);
      setTimeline(timelineData.timeline || []);
    } catch (error) {
      console.error(error);
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
      }
    } catch (error) {
      console.error("Consent update failed:", error);
    } finally {
      setConsentLoading(false);
    }
  };
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!form.title || !form.file) {
      alert("Please enter a title and select a file.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("patientId", patientId);
      formData.append("type", form.type);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("department", form.department);
      formData.append("createdBy", form.createdBy);
      formData.append("file", form.file);

      const response = await fetch(`${API}/api/care-events`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Upload failed");
      }

      alert("Health record uploaded successfully!");

      setForm({
        type: "Lab Report",
        title: "",
        description: "",
        department: "Cardiology",
        createdBy: "Dr. Sharma",
        file: null,
      });

      setShowUpload(false);

      await loadData();
    } catch (error) {
      console.error(error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);
  if (view === "doctor") {
    return <DoctorDashboard onBack={() => setView("patient")} />;
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
            <button
              onClick={() => setView("doctor")}
              className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
            >
              Doctor Portal
            </button>

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

        {/* PATIENT SUMMARY */}
        <section className="summary-grid">
          <SummaryCard
            icon={<UserRound />}
            label="Patient ID"
            value={patient?.patientId}
          />

          <SummaryCard
            icon={<Activity />}
            label="Age"
            value={`${patient?.age} years`}
          />

          <SummaryCard
            icon={<HeartPulse />}
            label="Blood Group"
            value={patient?.bloodGroup}
          />

          <SummaryCard
            icon={<FileText />}
            label="Care Records"
            value={timeline.length}
          />
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
                className="upload-button"
                onClick={() => setShowUpload(true)}
              >
                <Upload size={19} />

                <span>Upload Health Record</span>

                <ChevronRight size={18} />
              </button>

              <button className="secondary-button">
                <FileText size={18} />
                View All Records
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
      {showUpload && (
        <div className="modal-overlay">
          <div className="upload-modal">
            <div className="modal-header">
              <div>
                <h2>Upload at Point of Care</h2>

                <p>Capture this care event while it happens.</p>
              </div>

              <button
                className="close-button"
                onClick={() => setShowUpload(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpload}>
              <label>Record Type</label>

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value,
                  })
                }
              >
                <option>Lab Report</option>
                <option>ECG Report</option>
                <option>Prescription</option>
                <option>Consultation</option>
                <option>Discharge Summary</option>
                <option>Other</option>
              </select>

              <label>Record Title</label>

              <input
                type="text"
                placeholder="e.g. ECG Report"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
              />

              <label>Department</label>

              <select
                value={form.department}
                onChange={(e) =>
                  setForm({
                    ...form,
                    department: e.target.value,
                  })
                }
              >
                <option>Cardiology</option>
                <option>Pathology</option>
                <option>General Medicine</option>
                <option>Emergency</option>
                <option>Radiology</option>
                <option>Orthopedics</option>
              </select>

              <label>Description</label>

              <textarea
                placeholder="Briefly describe this care event..."
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
              />

              <label>Attach Medical Record</label>

              <div className="file-box">
                <Upload size={22} />

                <div>
                  <strong>
                    {form.file ? form.file.name : "Choose medical record"}
                  </strong>

                  <span>PDF, JPG or PNG</span>
                </div>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      file: e.target.files[0],
                    })
                  }
                />
              </div>

              <button
                className="submit-upload"
                type="submit"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Save Health Record"}
              </button>
            </form>
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
              📎 {event.fileName} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
