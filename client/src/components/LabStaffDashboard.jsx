import { useEffect, useState } from "react";
import {
  Search,
  HeartPulse,
  UserRound,
  FileText,
  Upload,
  CheckCircle2,
  ArrowLeft,
  Clock3,
} from "lucide-react";

const API = "http://localhost:5000";

function LabStaffDashboard({ onBack, onSwitchRole }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [showUpload, setShowUpload] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
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

  const filteredPatients = patients.filter((patient) =>
    `${patient.name} ${patient.patientId}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const openPatient = (patient) => {
    setSelectedPatient(patient);
    setShowUpload(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedPatient) return;

    if (!form.title.trim()) {
      alert("Please enter the investigation name.");
      return;
    }

    if (!form.file) {
      alert("Please attach the laboratory report.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      // Patient context is automatically attached
      formData.append("patientId", selectedPatient.patientId);

      formData.append("type", "Lab Report");
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("department", "Pathology");
      formData.append("file", form.file);

      const response = await fetch(`${API}/api/care-events`, {
        method: "POST",
        headers: {
          "x-user-role": "lab_staff",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to upload report");
      }

      alert("Laboratory report added to patient's care journey.");

      setForm({
        title: "",
        description: "",
        file: null,
      });

      setShowUpload(false);
    } catch (error) {
      console.error("Lab upload failed:", error);
      alert(error.message || "Failed to upload laboratory report.");
    } finally {
      setSaving(false);
    }
  };

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
            <div className="relative">
              <select
                value="lab_staff"
                onChange={(e) => onSwitchRole(e.target.value)}
                className="cursor-pointer appearance-none rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 pr-9 text-xs font-bold text-blue-700 outline-none"
              >
                <option value="patient">Patient View</option>
                <option value="doctor">Doctor Portal</option>
                <option value="lab_staff">Lab Staff</option>
                <option value="hospital">Hospital Operations</option>
              </select>

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-blue-600">
                ▾
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
        {!selectedPatient ? (
          <>
            {/* TITLE */}
            <section className="mb-8">
              <p className="text-xs font-bold tracking-widest text-blue-600">
                LABORATORY WORKSPACE
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                Record Laboratory Results
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Find a patient and attach verified laboratory reports directly
                to their connected care journey.
              </p>
            </section>

            {/* SEARCH */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h3 className="text-base font-extrabold text-slate-900">
                  Find Patient
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Search using patient name or ANVAYA patient ID.
                </p>
              </div>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search patient name or ID..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-300 focus:bg-white"
                />
              </div>
            </section>

            {/* PATIENTS */}
            <section className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Patients
                </h3>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredPatients.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-slate-500">
                    No patients found.
                  </div>
                ) : (
                  filteredPatients.map((patient) => (
                    <button
                      key={patient.patientId}
                      onClick={() => openPatient(patient)}
                      className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <UserRound size={18} />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {patient.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {patient.patientId} · {patient.age} years ·{" "}
                            {patient.gender}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-blue-600">
                        Open Patient →
                      </span>
                    </button>
                  ))
                )}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* BACK */}
            <button
              onClick={() => setSelectedPatient(null)}
              className="mb-5 flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={15} />
              Back to Patients
            </button>

            {/* PATIENT */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <UserRound size={24} />
                    </div>

                    <div>
                      <p className="text-xs font-bold tracking-wider text-blue-600">
                        PATIENT
                      </p>

                      <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                        {selectedPatient.name}
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        {selectedPatient.patientId} ·{" "}
                        {selectedPatient.age} years ·{" "}
                        {selectedPatient.gender}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Blood Group
                      </p>
                      <p className="mt-1 text-sm font-extrabold text-slate-800">
                        {selectedPatient.bloodGroup || "Not Available"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        ABHA
                      </p>
                      <p className="mt-1 text-sm font-extrabold text-slate-800">
                        {selectedPatient.abhaMasked || "Not Linked"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* LAB ACTION */}
            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              {!showUpload ? (
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold tracking-wider text-blue-600">
                      LAB RECORD
                    </p>

                    <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                      Add Laboratory Report
                    </h3>

                    <p className="mt-1 max-w-xl text-sm text-slate-500">
                      Attach the investigation result to this patient's
                      longitudinal care record.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowUpload(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    <Upload size={17} />
                    Upload Lab Report
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpload}>
                  <div className="mb-6">
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Upload Laboratory Report
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      This record will be attached to {selectedPatient.name}'s
                      care journey.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700">
                        Investigation
                      </label>

                      <input
                        value={form.title}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            title: e.target.value,
                          })
                        }
                        placeholder="e.g. Complete Blood Count"
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-300"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700">
                        Department
                      </label>

                      <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
                        Pathology
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="text-xs font-bold text-slate-700">
                      Result Summary
                    </label>

                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      placeholder="Brief summary of the laboratory findings..."
                      className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-300"
                    />
                  </div>

                  <div className="mt-5">
                    <label className="text-xs font-bold text-slate-700">
                      Attach Report
                    </label>

                    <label className="mt-2 flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-5 transition hover:border-blue-300 hover:bg-blue-50/30">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                        <FileText size={20} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {form.file
                            ? form.file.name
                            : "Choose laboratory report"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          PDF, JPG or PNG · Maximum 10 MB
                        </p>
                      </div>

                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) =>
                          setForm({
                            ...form,
                            file: e.target.files?.[0] || null,
                          })
                        }
                      />
                    </label>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowUpload(false)}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      {saving ? (
                        "Saving..."
                      ) : (
                        <>
                          <CheckCircle2 size={17} />
                          Save Lab Report
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* CONTEXT */}
            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Clock3 size={17} className="text-slate-400" />

                <h3 className="text-sm font-extrabold text-slate-900">
                  Record Context
                </h3>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Patient
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {selectedPatient.name}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Department
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    Pathology
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Recorded By
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    Lab Staff
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default LabStaffDashboard;