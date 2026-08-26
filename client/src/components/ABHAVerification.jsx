import { useState } from "react";

export default function ABHAVerification({ patient, onVerified }) {
  const [abha, setAbha] = useState("");
  const [status, setStatus] = useState("idle");

  const verifyABHA = () => {
    if (!abha.trim()) return;

    setStatus("verifying");

    setTimeout(() => {
      setStatus("verified");
      onVerified?.();
    }, 900);
  };

  if (status === "verified") {
    return (
      <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
            ✓
          </div>

          <div>
            <p className="font-semibold text-green-800">
              ABHA Identity Verified
            </p>

            <p className="text-sm text-green-700">
              {patient?.name || "Patient"} • {patient?.abhaMasked || "XXXX-XXXX-4821"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
          ABHA Identity
        </p>

        <h3 className="mt-1 text-xl font-bold text-slate-900">
          Verify Patient Identity
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Verify the patient's ABHA-linked identity before accessing
          connected health records.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <input
          type="text"
          value={abha}
          onChange={(e) => setAbha(e.target.value)}
          placeholder="Enter ABHA ID / Address"
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
        />

        <button
          onClick={verifyABHA}
          disabled={status === "verifying"}
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {status === "verifying" ? "Verifying..." : "Verify ABHA"}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <span className="h-2 w-2 rounded-full bg-green-500"></span>
        Identity data is masked in the clinical workspace
      </div>
    </div>
  );
}