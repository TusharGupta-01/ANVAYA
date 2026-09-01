import { useEffect, useState } from "react";
import {
  HeartPulse,
  UserRound,
  Search,
  ArrowLeft,
  Activity,
  Save,
  CheckCircle2,
} from "lucide-react";

const API = "http://localhost:5000";

function NurseDashboard({ onBack, onSwitchRole }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    status: "Stable",
    painScore: "0",
    observation: "",
    department: "Surgical Ward",
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
  };

  const resetForm = () => {
    setForm({
      title: "",
      status: "Stable",
      painScore: "0",
      observation: "",
      department: "Surgical Ward",
    });
  };

  const handleSaveObservation = async (e) => {
    e.preventDefault();

    if (!selectedPatient) return;

    if (!form.title.trim()) {
      alert("Please enter an observation title.");
      return;
    }

    if (!form.observation.trim()) {
      alert("Please enter the nursing observation.");
      return;
    }

    try {
      setSaving(true);

      const description =
        `Patient Status: ${form.status}\n` +
        `Pain Score: ${form.painScore}/10\n\n` +
        form.observation;

      const formData = new FormData();

      formData.append("patientId", selectedPatient.patientId);
      formData.append("type", "Care Observation");
      formData.append("title", form.title);
      formData.append("description", description);
      formData.append("department", form.department);

      const response = await fetch(`${API}/api/care-events`, {
        method: "POST",
        headers: {
          "x-user-role": "nurse",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save observation");
      }

      alert("Nursing observation added to the patient's care journey.");

      resetForm();
    } catch (error) {
      console.error("Nursing observation failed:", error);
      alert(error.message || "Failed to save nursing observation.");
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
              <h1 className="text-xl font-extrabold text-slate-900">ANVAYA</h1>

              <p className="text-xs text-slate-500">
                Connected Digital Healthcare
              </p>
            </div>
          </div>

          <select
            value="nurse"
            onChange={(e) => onSwitchRole(e.target.value)}
            className="cursor-pointer rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 outline-none"
          >
            <option value="patient">Patient View</option>
            <option value="doctor">Doctor Portal</option>
            <option value="lab_staff">Lab Staff</option>
            <option value="nurse">Nurse Workspace</option>
            <option value="hospital">Hospital Operations</option>
          </select>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
        {!selectedPatient ? (
          <>
            {/* TITLE */}
            <section className="mb-8">
              <p className="text-xs font-bold tracking-widest text-blue-600">
                NURSING CARE WORKSPACE
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                Record Bedside Care
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Capture patient observations when care happens and attach them
                directly to the patient's longitudinal care journey.
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

            {/* PATIENT LIST */}
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
              onClick={() => {
                setSelectedPatient(null);
                resetForm();
              }}
              className="mb-5 flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={15} />
              Back to Patients
            </button>

            {/* PATIENT HEADER */}
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
                        {selectedPatient.patientId} · {selectedPatient.age}{" "}
                        years · {selectedPatient.gender}
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

            {/* OBSERVATION FORM */}
            <form
              onSubmit={handleSaveObservation}
              className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-blue-600" />

                  <h3 className="text-lg font-extrabold text-slate-900">
                    Nursing Observation
                  </h3>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Record the patient's current bedside condition.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                

                {/* DEPARTMENT */}
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Department
                  </label>

                  <select
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300"
                  >
                    <option>Surgical Ward</option>
                    <option>General Ward</option>
                    <option>ICU</option>
                    <option>Emergency</option>
                    <option>Recovery Room</option>
                  </select>
                </div>
              </div>

              {/* TITLE */}
              <div className="mt-5">
                <label className="text-xs font-bold text-slate-700">
                  Observation Title
                </label>

                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Bedside nursing observation"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-300"
                />
              </div>

              {/* STATUS + PAIN */}
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Patient Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300"
                  >
                    <option>Stable</option>
                    <option>Under Observation</option>
                    <option>Needs Attention</option>
                    <option>Critical</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Pain Score
                  </label>

                  <select
                    value={form.painScore}
                    onChange={(e) =>
                      setForm({ ...form, painScore: e.target.value })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300"
                  >
                    {Array.from({ length: 11 }, (_, index) => (
                      <option key={index} value={index}>
                        {index} / 10
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* OBSERVATION */}
              <div className="mt-5">
                <label className="text-xs font-bold text-slate-700">
                  Nursing Observation
                </label>

                <textarea
                  value={form.observation}
                  onChange={(e) =>
                    setForm({ ...form, observation: e.target.value })
                  }
                  rows={5}
                  placeholder="Describe the patient's condition, dressing, mobility, symptoms, response to care, or other relevant bedside observations..."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-300"
                />
              </div>

              {/* SUBMIT */}
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save size={17} />
                      Save Care Observation
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* CONTEXT */}
            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold tracking-wider text-blue-600">
                RECORD CONTEXT
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
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
                    Recorded By
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    Nurse
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Timestamp
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    Automatically recorded
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

export default NurseDashboard;
