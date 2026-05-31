import { useState } from "react";
import { X, ShieldCheck, Printer, FileText } from "lucide-react";
export default function LegalConsentModal({ isOpen, onClose, documentType }) {
  const [signer, setSigner] = useState("");
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [signedStamp, setSignedStamp] = useState(null);
  if (!isOpen || !documentType) return null;
  const handleSign = (e) => {
    e.preventDefault();
    if (!signer.trim() || !agreementChecked) {
      alert("Please read and agree to all terms before digital execution.");
      return;
    }
    const signatureStamp = "STAMP-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    setSignedStamp(signatureStamp);
  };
  const handlePrint = () => {
    window.print();
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      {
    /* Backdrop */
  }
      <div
    className="absolute inset-0 bg-black/45 backdrop-blur-[3px]"
    onClick={() => {
      setSigner("");
      setAgreementChecked(false);
      setSignedStamp(null);
      onClose();
    }}
  />

      <div className="relative w-full max-w-2xl bg-[#121215] border border-white/10 rounded-sm overflow-hidden shadow-2xl z-10">
        
        {
    /* Header */
  }
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0B0B0C]">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#E50914]" />
            <h3 className="font-display text-lg font-black text-white tracking-widest text-left uppercase">
              {documentType === "parq" && "PAR-Q Formal Questionnaire Form"}
              {documentType === "contract" && "PT Athlete Performance Contract"}
              {documentType === "waiver" && "Gym Access & Personal Liability Waiver"}
            </h3>
          </div>
          <button
    onClick={() => {
      setSigner("");
      setAgreementChecked(false);
      setSignedStamp(null);
      onClose();
    }}
    className="text-zinc-200/60 hover:text-[#E50914] p-1.5 hover:bg-black/5 rounded-full transition-colors cursor-pointer text-white"
  >
            <X className="w-5 h-5" />
          </button>
        </div>

        {
    /* Paper content */
  }
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-5">
          
          <div className="p-4 bg-[#0B0B0C] border border-white/10 rounded-sm text-xs space-y-3.5 text-[#EEEEF0]/85 text-left leading-relaxed max-h-[320px] overflow-y-auto font-mono">
            
            {documentType === "parq" && <>
                <p className="font-bold text-zinc-200 border-b border-white/10 pb-1 uppercase font-sans">SECTION 1: PHYSIOLOGICAL PROFILE DESCRIPTION</p>
                <p>
                  The Physical Activity Readiness Questionnaire (PAR-Q) is designed to flag potential neuromuscular, cardiovascular, or physical orthopedic variables prior to loading. If you intend to execute extreme heavy lifts with *Real Leader USA* elite compound machines (e.g. 45° plate Hack Squats, selectorized chest presses), strict clearance is required.
                </p>
                <p className="font-bold text-zinc-200 uppercase pt-2 border-b border-white/10 pb-1 font-sans">SECTION 2: MEDICAL ASSESSMENT CONDITIONS</p>
                <p>
                  1. Have you ever experienced heart pacing warnings or prescription drug treatment? <br />
                  2. Do you experience joint dislocation or arthritic friction when performing deep eccentric contractions? <br />
                  3. Are you prone to dizziness during prolonged high-intensity cardiovascular threshold sprints?
                </p>
                <p className="font-bold text-zinc-200 uppercase pt-2 border-b border-white/10 pb-1 font-sans">SECTION 3: LIABILITY ASSUMPTION</p>
                <p>
                  By completing and digitally validating this checklist, the participating athlete agrees that they have consulted with personal healthcare professionals if they possess compound physical restrictions, entering at their own sovereign fitness responsibility.
                </p>
              </>}

            {documentType === "contract" && <>
                <p className="font-bold text-zinc-200 border-b border-white/10 pb-1 uppercase font-sans">RECITALS</p>
                <p>
                  This agreement is executed between physical coaches of <strong>in.fit GYM</strong> (representing NASM / ACE performance specialists) and the registering Athlete.
                </p>
                <p className="font-bold text-zinc-200 uppercase pt-2 border-b border-white/10 pb-1 font-sans">COACHING TERMS & RESOLUTIONS</p>
                <p>
                  1. <strong>Session Standards:</strong> Sessions must begin on time. The trainer will design custom biometric progressions, emphasizing form analysis, joint recovery, and tailored nutritional pacing plans.
                </p>
                <p>
                  2. <strong>24-Hour Policy:</strong> Any rescheduling or slot swaps must occur at least 24 hours prior to booking. Failure to do so will forfeit the digital session token.
                </p>
                <p>
                  3. <strong>Effort Manifest:</strong> The trainer agrees to provide highest level of expert safety supervision, and the athlete agrees to load heavy and lift with intensity.
                </p>
              </>}

            {documentType === "waiver" && <>
                <p className="font-bold text-zinc-200 border-b border-white/10 pb-1 uppercase font-sans">GENERAL RELEASE & LIABILITY WAIVER</p>
                <p>
                  I acknowledge that participating in physical workouts, bodybuilding, metcon routines, powerlifting, steam sessions, and physical load conditioning carries core hazards. I hereby waive all personal claims, damages, or clinical action against in.fit GYM, its coaches, and its administrators at Annojiguda, Hyderabad.
                </p>
                <p className="font-bold text-zinc-200 uppercase pt-2 border-b border-white/10 pb-1 font-sans">FACILITY PROTOCOLS</p>
                <p>
                  Athletes must rack their own weights. The use of heavy loaded barbells without collars/clips is strictly forbidden on the Strength Floor. Re-hydration fluids must remain capped. Appropriate training garments and athletic footwear are mandatory at all times.
                </p>
                <p className="font-bold text-zinc-200 uppercase pt-2 border-b border-white/10 pb-1 font-sans">DIGITAL ENVELOPE CONSENT</p>
                <p>
                  Applying a virtual electronic signature in the box below confirms that you have reached legal maturity, understand the release parameters, and agree to train with honor and extreme intensity.
                </p>
              </>}

          </div>

          {signedStamp ? <div className="p-5 bg-zinc-900 border-2 border-[#E50914] text-center rounded-sm space-y-3.5 max-w-md mx-auto shadow-xl">
              <div className="w-10 h-10 bg-[#E50914] rounded-full flex items-center justify-center mx-auto shadow-md">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-display text-base font-black text-white tracking-widest uppercase">DOCUMENT SIGNED SECURELY</h4>
                <p className="text-[11px] text-zinc-300 mt-1 font-sans font-semibold uppercase tracking-wide">
                  Verified Signature: <span className="text-[#E50914] font-black uppercase underline decoration-[#E50914] decoration-2">{signer}</span>
                </p>
                <p className="text-[10px] text-zinc-400 font-mono">
                  Token Clearance: {signedStamp} • {(/* @__PURE__ */ new Date()).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="pt-2 flex gap-3 justify-center">
                <button
    onClick={handlePrint}
    className="bg-[#121215] text-[#EEEEF0] border border-white/10 hover:border-white py-1.5 px-3 rounded-sm text-[10px] tracking-widest font-bold font-sans uppercase flex items-center gap-1.5 transition-colors cursor-pointer bg-black"
  >
                  <Printer className="w-3.5 h-3.5" /> PRINT FILE
                </button>
                <button
    onClick={() => {
      setSigner("");
      setAgreementChecked(false);
      setSignedStamp(null);
      onClose();
    }}
    className="bg-[#E50914] hover:bg-black text-white py-1.5 px-4.5 rounded-sm text-[10px] tracking-widest font-bold font-sans uppercase transition-all cursor-pointer border border-[#E50914]"
  >
                  CLOSE SHEETS
                </button>
              </div>
            </div> : <form onSubmit={handleSign} className="space-y-4 max-w-md mx-auto">
              <label className="flex gap-2.5 p-3 bg-[#0B0B0C]/70 hover:bg-zinc-800 rounded-sm border border-white/5 cursor-pointer select-none transition-all items-center text-left">
                <input
    type="checkbox"
    checked={agreementChecked}
    onChange={(e) => setAgreementChecked(e.target.checked)}
    className="h-4 w-4 rounded bg-[#121215] border-white/30 text-[#E50914] focus:ring-[#E50914]"
  />
                <span className="text-xs text-[#EEEEF0] font-semibold font-sans leading-tight">I certify that I have thoroughly read, understood, and agreed to all detailed clauses</span>
              </label>

              <div className="grid grid-cols-3 gap-3 items-end">
                <div className="col-span-2 text-left">
                  <label className="block text-[10px] font-bold text-zinc-200/60 uppercase tracking-wider mb-1.5">
                    Athletic Legal Name (Signature) *
                  </label>
                  <input
    type="text"
    required
    value={signer}
    onChange={(e) => setSigner(e.target.value)}
    placeholder="e.g. Aditi Rao"
    className="w-full bg-[#121215] border border-white/20 rounded-sm px-2.5 py-2 text-xs text-[#EEEEF0] outline-none focus:border-[#E50914]"
  />
                </div>
                <button
    type="submit"
    className="w-full bg-[#1A1A1E] hover:bg-[#E50914] text-white text-[10px] font-bold uppercase tracking-widest py-2.5 px-2 rounded-sm transition-all shadow-sm cursor-pointer border border-white/10"
  >
                  SIGN DOCUMENT
                </button>
              </div>
            </form>}

        </div>

      </div>
    </div>;
}
