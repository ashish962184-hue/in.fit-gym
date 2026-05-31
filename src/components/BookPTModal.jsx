import { useState } from "react";
import { X, Award, CheckCircle } from "lucide-react";
import { TRAINERS } from "../data";
export default function BookPTModal({
  isOpen,
  onClose,
  memberName,
  memberEmail,
  onTriggerSignUp
}) {
  const [trainerId, setTrainerId] = useState(TRAINERS[0].id);
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("07:00 AM - 08:30 AM");
  const [goal, setGoal] = useState("Compound Strength");
  const [notes, setNotes] = useState("");
  const [ptBookings, setPtBookings] = useState(() => {
    const saved = localStorage.getItem("infit_pt_bookings");
    return saved ? JSON.parse(saved) : [];
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastBookingCode, setLastBookingCode] = useState("");
  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date) {
      alert("Please choose a training session date.");
      return;
    }
    const bookingCode = "PT-" + Math.random().toString(36).substr(2, 5).toUpperCase();
    const newBooking = {
      id: bookingCode,
      trainerId,
      date,
      timeSlot,
      goal,
      notes,
      memberName: memberName || "Guest Athlete",
      memberEmail: memberEmail || "guest"
    };
    const updated = [...ptBookings, newBooking];
    localStorage.setItem("infit_pt_bookings", JSON.stringify(updated));
    setPtBookings(updated);
    setLastBookingCode(bookingCode);
    setIsSuccess(true);
  };
  const activeTrainer = TRAINERS.find((t) => t.id === trainerId);
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      {
    /* Backdrop */
  }
      <div
    className="absolute inset-0 bg-black/45 backdrop-blur-[3px]"
    onClick={() => {
      if (isSuccess) {
        setIsSuccess(false);
        onClose();
      } else {
        onClose();
      }
    }}
  />

      {
    /* Box Container */
  }
      <div className="relative w-full max-w-lg bg-[#121215] border border-white/10 rounded-sm overflow-hidden shadow-2xl z-10">
        
        {
    /* Header */
  }
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0B0B0C]">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#EF4444]" />
              <span className="text-[10px] text-[#EF4444] font-bold uppercase tracking-[0.2em] leading-none block">
                ONE-ON-ONE COACHING
              </span>
            </div>
            <h3 className="font-serif italic text-2xl text-[#EEEEF0] font-bold mt-1 tracking-tight">
              Elite Personal Training
            </h3>
          </div>
          <button
    onClick={() => {
      setIsSuccess(false);
      onClose();
    }}
    className="text-zinc-200/60 hover:text-[#EF4444] p-1.5 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
  >
            <X className="w-5 h-5" />
          </button>
        </div>

        {
    /* Content Panel */
  }
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          
          {!isSuccess ? <form onSubmit={handleSubmit} className="space-y-4">
              
              {!memberName && <div className="p-3 bg-amber-50 border border-amber-100 rounded-sm flex justify-between items-center gap-3">
                  <span className="text-[11px] text-amber-950 leading-relaxed text-left font-medium">
                    👉 Training is free to test as a guest, but active membership gives access to offline tracking.
                  </span>
                  <button
    type="button"
    onClick={() => {
      onClose();
      onTriggerSignUp();
    }}
    className="bg-[#1A1A1E] text-white text-[9px] px-3 py-1.5 rounded-sm uppercase tracking-wider font-bold hover:bg-[#EF4444] flex-shrink-0 cursor-pointer"
  >
                    Enroll
                  </button>
                </div>}

              {
    /* Focus Goal & Timeslot */
  }
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-200/60 uppercase tracking-[0.15em] mb-1.5 text-left leading-none">
                    Coaching Focus *
                  </label>
                  <select
    value={goal}
    onChange={(e) => setGoal(e.target.value)}
    className="w-full bg-[#121215] border border-white/20 rounded-sm px-2.5 py-2 text-xs text-[#EEEEF0] uppercase tracking-wider outline-none focus:border-[#EF4444]"
  >
                    <option value="Compound Strength">Compound Strength</option>
                    <option value="Metabolic Conditioning">Metabolic Cardio</option>
                    <option value="Olympic Speed lifts">Olympic Lifts</option>
                    <option value="Muscle Hypertrophy">Hypertrophy Path</option>
                    <option value="Athletic Mobility">Mobility / Flow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-200/60 uppercase tracking-[0.15em] mb-1.5 text-left leading-none">
                    Timeslot *
                  </label>
                  <select
    value={timeSlot}
    onChange={(e) => setTimeSlot(e.target.value)}
    className="w-full bg-[#121215] border border-white/20 rounded-sm px-2.5 py-2 text-xs text-[#EEEEF0] outline-none focus:border-[#EF4444]"
  >
                    <option value="06:00 AM - 07:30 AM">06:00 AM - 07:30 AM</option>
                    <option value="07:30 AM - 09:00 AM">07:30 AM - 09:00 AM</option>
                    <option value="09:00 AM - 10:30 AM">09:00 AM - 10:30 AM</option>
                    <option value="05:00 PM - 06:30 PM">05:00 PM - 06:30 PM</option>
                    <option value="06:30 PM - 08:30 PM">06:30 PM - 08:30 PM</option>
                  </select>
                </div>
              </div>

              {
    /* Date selection */
  }
              <div>
                <label className="block text-[10px] font-bold text-zinc-200/60 uppercase tracking-[0.15em] mb-1.5 text-left leading-none">
                  Training Date *
                </label>
                <input
    type="date"
    required
    value={date}
    min={(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}
    onChange={(e) => setDate(e.target.value)}
    className="w-full bg-[#121215] border border-white/20 rounded-sm px-3.5 py-2 text-xs text-[#EEEEF0] outline-none focus:border-[#EF4444]"
  />
              </div>

              {
    /* Notes */
  }
              <div>
                <label className="block text-[10px] font-bold text-zinc-200/60 uppercase tracking-[0.15em] mb-1.5 text-left leading-none">
                  Athletic Goals / Injury Notes (Optional)
                </label>
                <textarea
    rows={2}
    maxLength={180}
    placeholder="e.g. History of mild lower back tightness; want to check squat form."
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    className="w-full bg-[#121215] border border-white/20 rounded-sm px-3 py-2 text-xs text-[#EEEEF0] placeholder-zinc-600/30 outline-none focus:border-[#EF4444]"
  />
              </div>

              <div className="pt-2 border-t border-white/5">
                <button
    type="submit"
    className="w-full bg-[#1A1A1E] hover:bg-[#EF4444] text-white font-sans text-[10px] tracking-[0.25em] font-bold uppercase py-3.5 rounded-sm transition-all shadow-sm cursor-pointer"
  >
                  REQUEST APPOINTMENT PASS
                </button>
              </div>

            </form> : <div className="text-center py-4 space-y-5">
              <div className="w-12 h-12 bg-[#EF4444] rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>

              <div className="space-y-1">
                <h4 className="font-serif italic text-lg font-bold text-[#EEEEF0] tracking-tight">
                  coaching spot reserved
                </h4>
                <p className="text-xs text-zinc-200/60">
                  Show your token at reception to unlock entry.
                </p>
              </div>

              {
    /* Ticket View */
  }
              <div className="bg-[#0B0B0C] rounded-sm border border-white/10 p-5 text-left space-y-3 max-w-sm mx-auto font-mono text-[#EEEEF0]">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-[10px] text-[#EF4444] font-bold">APPOINTMENT TOKEN</span>
                  <span className="text-[10px] text-zinc-200 font-extrabold">{lastBookingCode}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-200/60">ATHLETE:</span>
                    <span className="text-zinc-200 font-bold uppercase">{memberName || "GUEST ATHLETE"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-200/60">ELITE COACH:</span>
                    <span className="text-[#EF4444] font-bold">{activeTrainer?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-200/60">FOCUS AREA:</span>
                    <span className="text-zinc-200 font-semibold uppercase">{goal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-200/60">TIMESLOT:</span>
                    <span className="text-zinc-200">{timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-200/60">DATE:</span>
                    <span className="text-[#EF4444] font-bold">{date}</span>
                  </div>
                </div>
                
                {notes && <div className="mt-2.5 pt-2.5 border-t border-white/10 text-[10px] text-zinc-200/60 italic leading-normal">
                    " {notes} "
                  </div>}
              </div>

              <div className="pt-2 border-t border-white/5">
                <button
    type="button"
    onClick={() => {
      setIsSuccess(false);
      onClose();
    }}
    className="w-full bg-[#1A1A1E] hover:bg-[#EF4444] text-white py-3 font-sans text-[10px] tracking-widest font-bold uppercase rounded-sm transition-all cursor-pointer"
  >
                  DISMISS CODE
                </button>
              </div>
            </div>}

        </div>

      </div>
    </div>;
}
