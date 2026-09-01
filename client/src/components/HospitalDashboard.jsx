import { useEffect, useState } from "react";

const API = "http://localhost:5000";

function HospitalDashboard({ onBack, onSwitchRole }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchHospitalStatus = async () => {
    try {
      const response = await fetch(`${API}/api/hospital-status`);
      const data = await response.json();

      if (data.success) {
        setDepartments(data.departments);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Hospital status error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalStatus();

    const interval = setInterval(fetchHospitalStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusClass = (status) => {
    if (status === "Available") {
      return "bg-green-50 text-green-700 border-green-200";
    }

    if (status === "In Consultation") {
      return "bg-orange-50 text-orange-700 border-orange-200";
    }

    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ANVAYA</h1>

            <p className="text-sm text-slate-500">
              Hospital Operations Workspace
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              LIVE
            </span>

            <button
              onClick={fetchHospitalStatus}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Refresh
            </button>

            <div className="relative">
              <select
                value="hospital"
                onChange={(e) => onSwitchRole(e.target.value)}
                className="appearance-none rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 pr-9 text-sm font-bold text-blue-700 outline-none cursor-pointer"
              >
                <option value="patient">Patient View</option>
                <option value="doctor">Doctor Portal</option>
                <option value="hospital">Hospital Operations</option>
              </select>

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600">
                ▾
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-bold tracking-widest text-blue-600 uppercase">
            Real-Time Hospital Visibility
          </p>

          <h2 className="text-4xl font-bold text-slate-900 mt-2">
            Hospital Flow Dashboard
          </h2>

          <p className="text-slate-500 mt-2">
            Monitor department availability, patient queues and estimated
            waiting time.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500">Active Departments</p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {departments.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500">Patients Waiting</p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {departments.reduce(
                (total, department) =>
                  total + Number(department.patientsWaiting || 0),
                0,
              )}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500">Hospital Status</p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              Operational
            </p>
          </div>
        </div>

        {/* Departments */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">
              Department Status
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Live operational view across hospital departments
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading hospital status...
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {departments.map((department) => (
                <div
                  key={department.department}
                  className="p-6 hover:bg-slate-50 transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-slate-900">
                          {department.department}
                        </h4>

                        <span
                          className={`px-3 py-1 rounded-full border text-xs font-semibold ${getStatusClass(
                            department.status,
                          )}`}
                        >
                          {department.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-4">
                        <div>
                          <p className="text-xs text-slate-400">Doctor</p>

                          <p className="font-semibold text-slate-700">
                            {department.doctor}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Room</p>

                          <p className="font-semibold text-slate-700">
                            {department.room}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Waiting</p>

                          <p className="font-semibold text-slate-700">
                            {department.patientsWaiting} patients
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Estimated Wait
                          </p>

                          <p className="font-bold text-blue-600">
                            {department.estimatedWait}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-400 text-right">
            {lastUpdated
              ? `Last updated ${lastUpdated.toLocaleTimeString()} • Auto-refresh every 30 sec`
              : "Waiting for live data..."}
          </div>
        </section>

        {/* PATIENT FLOW */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  Patient Flow
                </p>

                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  Active Care Movement
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Track where patients are in the hospital care process.
                </p>
              </div>

              <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                1 active patient
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Patient
                  </p>

                  <h4 className="mt-1 text-lg font-bold text-slate-900">
                    Rahul Sharma
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    ANV-P001 · General Medicine
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Current Stage
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    Doctor Consultation
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Department
                  </p>

                  <p className="mt-1 text-sm font-semibold text-blue-600">
                    General Medicine
                  </p>
                </div>

                <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  View Patient →
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HospitalDashboard;
