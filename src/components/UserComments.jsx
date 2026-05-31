import { useState, useEffect } from "react";
import { Star, MessageSquare, Send, Trash2, CheckCircle2, Clock } from "lucide-react";

function getRelativeTimeString(isoString) {
  if (!isoString) return "Just now";
  // If it's not a valid ISO date, return the raw value (e.g. for fallback compatibility)
  if (isoString.includes("ago") || isoString === "Just now") {
    return isoString;
  }
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const DEFAULT_COMMENTS = [
  {
    id: "c1",
    name: "Vikram Reddy",
    category: "Strength Training",
    rating: 5,
    text: "Best compound lifting cages in Hyderabad. The deadlifting platforms are world-class and always maintained properly. Highly recommend for serious powerlifters.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "c2",
    name: "Anjali Sharma",
    category: "Cardio Suite",
    rating: 4,
    text: "Elite atmosphere with excellent ventilation. The high-performance treadmills keep up with intensive sprinting series. Extremely clean lockers as well!",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "c3",
    name: "Karthik Rao",
    category: "Personal Training",
    rating: 5,
    text: "Unlocking massive strength milestones here. Sandeep’s customized coaching on form checks and periodization completely level-up your training protocol.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export default function UserComments() {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Strength");
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(null);
  const [text, setText] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 60000);

    const saved = localStorage.getItem("infit_user_comments");
    if (saved) {
      try {
        setComments(JSON.parse(saved));
      } catch {
        setComments(DEFAULT_COMMENTS);
      }
    } else {
      setComments(DEFAULT_COMMENTS);
      localStorage.setItem("infit_user_comments", JSON.stringify(DEFAULT_COMMENTS));
    }

    return () => clearInterval(interval);
  }, []);

  const saveComments = (newComments) => {
    setComments(newComments);
    localStorage.setItem("infit_user_comments", JSON.stringify(newComments));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!name.trim()) {
      setErrorMsg("Please specify your name.");
      return;
    }
    if (name.trim().length < 2) {
      setErrorMsg("Name must be at least 2 characters long.");
      return;
    }
    if (!text.trim()) {
      setErrorMsg("Please write a comment or review.");
      return;
    }
    if (text.trim().length < 5) {
      setErrorMsg("Comment must be at least 5 characters.");
      return;
    }
    const newComment = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      category: `${category} Focus`,
      rating,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      isUserAdded: true
    };
    const updated = [newComment, ...comments];
    saveComments(updated);
    setName("");
    setText("");
    setRating(5);
    setSuccessMsg("Thank you! Your verified comment was published.");
    setTimeout(() => {
      setSuccessMsg("");
    }, 4e3);
  };
  const handleDelete = (id) => {
    const updated = comments.filter((c) => c.id !== id);
    saveComments(updated);
  };
  const averageRating = comments.length > 0 ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1) : "5.0";
  return <div className="w-full space-y-6">
      
      {
    /* Dynamic Summary Stats Panel */
  }
      <div className="bg-[#121215]/80 border border-white/5 rounded-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#EEEEF0]/50 block font-bold">ATHLETE COMMUNITY REVIEWS</span>
            <span className="text-xs text-[#EEEEF0] font-sans font-medium">Showing {comments.length} verified athlete reviews</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#0B0B0C] px-3 py-1.5 rounded-sm border border-white/5">
          <div className="flex text-[#EF4444]">
            {Array.from({ length: 5 }).map((_, i) => <Star
    key={i}
    className={`w-3.5 h-3.5 ${Math.round(parseFloat(averageRating)) > i ? "fill-[#EF4444]" : "opacity-20"}`}
  />)}
          </div>
          <span className="text-xs font-bold text-white tracking-widest">{averageRating} / 5</span>
        </div>
      </div>

      {
    /* Review Form */
  }
      <form onSubmit={handleSubmit} className="bg-[#121215] border border-[#EF4444]/10 hover:border-[#EF4444]/30 transition-all rounded-sm p-6 space-y-4 text-left relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#EF4444]" />
        
        <div>
          <h4 className="text-[10px] font-sans font-extrabold uppercase tracking-[0.2em] text-[#EF4444]">
            LEAVE YOUR TRANSFORMATION REVIEW
          </h4>
          <p className="text-[#EEEEF0]/50 text-[11px] font-serif italic mt-0.5">
            Share your training progress, lift milestones, or facility rating.
          </p>
        </div>

        {errorMsg && <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded-sm">
            {errorMsg}
          </div>}

        {successMsg && <div className="p-3 bg-[#84CC16]/10 border border-[#84CC16]/20 text-[#84CC16] text-xs rounded-sm flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0 animate-bounce" />
            {successMsg}
          </div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-[#EEEEF0]/60 block">Your Name</label>
            <input
    type="text"
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="e.g. Rahul Verma"
    className="w-full bg-[#0B0B0C] text-white border border-white/10 focus:border-[#EF4444] rounded-sm px-3 py-2 text-xs outline-none transition-colors"
  />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-[#EEEEF0]/60 block">Primary Focus</label>
            <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="w-full bg-[#0B0B0C] text-white border border-white/10 focus:border-[#EF4444] rounded-sm px-3 py-2 text-xs outline-none transition-colors appearance-none cursor-pointer"
  >
              <option value="Strength">Strength Training</option>
              <option value="Cardio Suite">Cardio Suite</option>
              <option value="Personal Coaching">Personal Coaching</option>
              <option value="Group HIIT">Group HIIT</option>
              <option value="Steam & Recovery">Steam & Recovery</option>
            </select>
          </div>
        </div>

        {
    /* Rating Star Selector */
  }
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#EEEEF0]/60">Your Rating:</span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => {
    const currentStar = i + 1;
    const isLit = hoveredRating !== null ? currentStar <= hoveredRating : currentStar <= rating;
    return <button
      type="button"
      key={i}
      onClick={() => setRating(currentStar)}
      onMouseEnter={() => setHoveredRating(currentStar)}
      onMouseLeave={() => setHoveredRating(null)}
      className="p-1 hover:scale-125 transition-transform"
    >
                  <Star
      className={`w-5 h-5 transition-colors cursor-pointer ${isLit ? "fill-[#EF4444] text-[#EF4444]" : "text-white/20 hover:text-white/45"}`}
    />
                </button>;
  })}
          </div>
        </div>

        {
    /* Comment Input */
  }
        <div className="space-y-1">
          <label className="text-[9px] font-bold uppercase tracking-wider text-[#EEEEF0]/60 block">Review Comment</label>
          <textarea
    rows={3}
    value={text}
    onChange={(e) => setText(e.target.value)}
    placeholder="Write your constructive review here..."
    className="w-full bg-[#0B0B0C] text-white border border-white/10 focus:border-[#EF4444] rounded-sm px-3 py-2 text-xs outline-none transition-colors resize-none placeholder-zinc-600"
  />
        </div>

        {
    /* Submit */
  }
        <button
    type="submit"
    className="w-full py-3 bg-[#EF4444] hover:bg-white text-white hover:text-black font-sans font-extrabold uppercase tracking-widest text-[10px] rounded-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#EF4444]/15"
  >
          <Send className="w-3.5 h-3.5" />
          PUBLISH TESTIMONIAL
        </button>
      </form>

      {
    /* Feed List */
  }
      <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
        {comments.map((comment) => <div
    key={comment.id}
    className="bg-[#121215] border border-white/5 p-4 rounded-sm relative text-left group transition-all hover:border-white/10"
  >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center border border-white/10 uppercase font-sans text-[10px] text-white font-extrabold">
                  {comment.name.slice(0, 2)}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#EEEEF0] block flex items-center gap-1">
                    {comment.name}
                    {comment.isUserAdded && <span className="inline-flex items-center gap-0.5 bg-[#84CC16]/10 text-[#84CC16] border border-[#84CC16]/20 py-0.5 px-1 rounded-sm text-[7px] tracking-wide uppercase font-black uppercase font-sans">
                        <CheckCircle2 className="w-2 h-2" /> Verified Athlete
                      </span>}
                  </span>
                  
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => <Star
    key={i}
    className={`w-2.5 h-2.5 ${comment.rating > i ? "fill-[#EF4444] text-[#EF4444]" : "opacity-10"}`}
  />)}
                    </div>
                    <span className="text-[7.5px] uppercase font-sans tracking-widest bg-white/5 border border-white/10 text-white/50 px-1 py-0.2 rounded-sm">
                      {comment.category}
                    </span>
                  </div>
                </div>
              </div>

              {
    /* Delete Trigger */
  }
              {comment.isUserAdded && <button
    onClick={() => handleDelete(comment.id)}
    className="p-1.5 bg-red-950/10 hover:bg-red-500/10 border border-red-500/15 text-[#EF4444] rounded-sm transition-colors cursor-pointer"
    title="Remove Comment"
  >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>}
            </div>

            <p className="text-xs text-[#EEEEF0]/85 leading-relaxed mt-2.5 font-serif italic pl-1">
              "{comment.text}"
            </p>

            <span className="text-[8px] font-mono text-[#EEEEF0]/40 font-semibold absolute bottom-2 right-3 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {getRelativeTimeString(comment.createdAt || comment.timestamp)}
            </span>
          </div>)}
      </div>

    </div>;
}
