import { useState } from "react";
import { X, Users, Search, Clock, Sparkles, Calendar } from "lucide-react";
import { INITIAL_CLASSES } from "../data";
export default function ClassesScheduler({
  isOpen,
  onClose,
  memberName,
  memberEmail,
  onTriggerSignUp
}) {
  const [classes, setClasses] = useState(() => {
    const saved = localStorage.getItem("infit_classes");
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem("infit_class_bookings");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [justBooked, setJustBooked] = useState(null);
  if (!isOpen) return null;
  const handleBookClass = (gymClass) => {
    const isAlreadyBooked = bookings.some((b) => b.classId === gymClass.id && b.memberEmail === (memberEmail || "guest"));
    if (isAlreadyBooked) {
      const updatedBookings2 = bookings.filter((b) => !(b.classId === gymClass.id && b.memberEmail === (memberEmail || "guest")));
      localStorage.setItem("infit_class_bookings", JSON.stringify(updatedBookings2));
      setBookings(updatedBookings2);
      const updatedClasses2 = classes.map((c) => {
        if (c.id === gymClass.id) {
          return { ...c, bookedSpots: Math.max(0, c.bookedSpots - 1) };
        }
        return c;
      });
      localStorage.setItem("infit_classes", JSON.stringify(updatedClasses2));
      setClasses(updatedClasses2);
      return;
    }
    if (gymClass.bookedSpots >= gymClass.spots) {
      alert("The class is currently full. Please try another session.");
      return;
    }
    const newBooking = {
      id: "B-" + Math.random().toString(36).substr(2, 5).toUpperCase(),
      classId: gymClass.id,
      date: (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" }),
      timeSlot: gymClass.time,
      memberName: memberName || "Guest Athlete",
      memberEmail: memberEmail || "guest"
    };
    const updatedBookings = [...bookings, newBooking];
    localStorage.setItem("infit_class_bookings", JSON.stringify(updatedBookings));
    setBookings(updatedBookings);
    const updatedClasses = classes.map((c) => {
      if (c.id === gymClass.id) {
        return { ...c, bookedSpots: c.bookedSpots + 1 };
      }
      return c;
    });
    localStorage.setItem("infit_classes", JSON.stringify(updatedClasses));
    setClasses(updatedClasses);
    setJustBooked(gymClass.name);
    setTimeout(() => setJustBooked(null), 3e3);
  };
  const filteredClasses = classes.filter((c) => {
    const matchesTab = activeTab === "All" || c.category === activeTab;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.trainer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      {
    /* Backdrop */
  }
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[3px]" onClick={onClose} />

      {
    /* Scheduler Container */
  }
      <div className="relative w-full max-w-2xl bg-[#121215] border border-white/10 rounded-sm overflow-hidden shadow-2xl z-10">
        
        {
    /* Header */
  }
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0B0B0C]">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#E50914]" />
              <span className="text-[10px] text-[#E50914] font-bold uppercase tracking-[0.2em] leading-none block">
                DAILY TRAINING SCHEDULE
              </span>
            </div>
            <h3 className="font-display text-2xl text-white font-black mt-1 tracking-wider uppercase">
              Elite Performance Classes
            </h3>
          </div>
          <button
    onClick={onClose}
    className="text-zinc-200/60 hover:text-[#EF4444] p-1.5 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
  >
            <X className="w-5 h-5" />
          </button>
        </div>

        {
    /* Filters/Search Bar */
  }
        <div className="p-4 bg-[#0B0B0C]/40 border-b border-white/10 space-y-3.5">
          <div className="flex flex-wrap gap-2">
            {["All", "Strength", "Cardio", "Yoga", "CrossFit"].map((tab) => <button
    key={tab}
    onClick={() => setActiveTab(tab)}
    className={`py-1.5 px-3.5 text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm border cursor-pointer ${activeTab === tab ? "bg-[#1A1A1E] text-white border-white" : "bg-[#121215] text-[#EEEEF0]/70 border-white/10 hover:border-white/30"}`}
  >
                {tab}
              </button>)}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-zinc-200/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
    type="text"
    placeholder="Search classes or certified coaches..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full bg-[#121215] border border-white/20 rounded-sm pl-10 pr-4 py-2 text-xs text-[#EEEEF0] placeholder-[#EEEEF0]/40 outline-none focus:border-[#E50914] transition-colors"
  />
          </div>
        </div>

        {
    /* Content list */
  }
        <div className="p-6 max-h-[50vh] overflow-y-auto space-y-4">
          
          {justBooked && <div className="p-3 bg-zinc-900 border border-[#E50914] text-white text-xs font-semibold rounded-sm flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#E50914] animate-pulse" />
              <span>
                <strong>Confirmed Booking:</strong> Registered for "{justBooked}". We added this to your schedule card!
              </span>
            </div>}

          {!memberName && <div className="p-4 bg-zinc-900 border border-white/10 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-xs text-zinc-300 leading-relaxed font-sans text-left font-semibold">
                👉 <strong>Guest Mode:</strong> You can mock book as a Guest, but enrolling with a membership will unlock priority access tokens and tracking.
              </div>
              <button
    onClick={() => {
      onClose();
      onTriggerSignUp();
    }}
    className="bg-[#1A1A1E] hover:bg-[#E50914] text-white transition-all py-1.5 px-3.5 rounded-sm font-sans text-[10px] tracking-wider font-bold uppercase flex-shrink-0 cursor-pointer border border-white/10"
  >
                Enroll Now
              </button>
            </div>}

          {filteredClasses.length === 0 ? <div className="text-center py-10 text-zinc-200/50 text-sm font-sans uppercase font-bold tracking-widest">
              No elite daily workout sessions found matching details.
            </div> : filteredClasses.map((item) => {
    const seatsLeft = item.spots - item.bookedSpots;
    const isBooked = bookings.some((b) => b.classId === item.id && b.memberEmail === (memberEmail || "guest"));
    return <div
      key={item.id}
      className={`p-4 rounded-sm border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-left ${isBooked ? "bg-zinc-900 border-[#E50914] border-2 shadow-lg shadow-[#E50914]/5" : "bg-[#121215] border-white/5 hover:border-white/20 hover:shadow-md"}`}
    >
                  <div className="space-y-1 md:max-w-[70%]">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm ${item.category === "Strength" ? "bg-[#E50914]/10 text-[#E50914]" : item.category === "Cardio" ? "bg-[#1A1A1E]/10 text-[#EEEEF0]" : item.category === "Yoga" ? "bg-[#8B5A2B]/10 text-[#8B5A2B]" : "bg-black/10 text-zinc-200"}`}>
                        {item.category}
                      </span>
                      <span className="text-[10px] text-zinc-200/60 font-sans flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#E50914]" /> {item.time} ({item.duration})
                      </span>
                    </div>

                    <h4 className="font-display text-xl font-black text-white tracking-widest uppercase">
                      {item.name}
                    </h4>

                    <p className="text-zinc-200/70 text-xs leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-2 text-[11px] text-zinc-200/60 flex items-center gap-2.5">
                      <span className="font-semibold text-zinc-200">Coached by: {item.trainer}</span>
                      <span className="text-zinc-200/10">•</span>
                      <span className="flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-zinc-200/50" />
                        {seatsLeft > 0 ? <span>{seatsLeft} / {item.spots} spots remaining</span> : <span className="text-red-600 font-semibold">Fully Booked</span>}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 md:text-right">
                    <button
      onClick={() => handleBookClass(item)}
      className={`w-full md:w-auto font-sans text-[10px] py-1.5 px-4 font-bold uppercase tracking-widest rounded-sm transition-all cursor-pointer ${isBooked ? "bg-[#E50914] hover:bg-black text-white" : "bg-[#121215] text-[#EEEEF0] border border-white hover:bg-black hover:text-white"}`}
    >
                      {isBooked ? "CANCEL BOOKED" : "CONFIRM PLACE"}
                    </button>
                  </div>
                </div>;
  })}

        </div>

        {
    /* Footer info counts */
  }
        <div className="p-4 bg-[#0B0B0C] border-t border-white/10 text-center">
          <span className="text-[10px] text-zinc-200/60 font-sans tracking-[0.2em] font-bold uppercase">
            ACTIVE CONSOLIDATED BOOKINGS: <span className="text-[#E50914] font-extrabold">{bookings.length} SESSIONS</span>
          </span>
        </div>

      </div>
    </div>;
}
