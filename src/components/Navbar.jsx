import { useState } from "react";
import { Phone, Menu, Sparkles, Award, LogIn, LogOut, Settings, X, Calendar, Clock, AlertCircle } from "lucide-react";
export default function Navbar({
  onJoinClick,
  onClassesClick,
  onFacilityClick,
  onPackagesClick,
  onCommunityClick,
  currentUser,
  loggedInUser,
  onAuthTrigger,
  onAdminTrigger,
  onLogout
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const userStatus = currentUser?.status || "PENDING";
  const hasProfile = !!currentUser;
  return <>
      <nav className="fixed top-0 w-full z-40 bg-[#0B0B0C]/95 backdrop-blur-md border-b border-white/10 font-sans">
        <div className="flex justify-between items-center px-5 md:px-20 h-20 max-w-7xl mx-auto">
          
          {
    /* Brand Logo & Name */
  }
          <div
            onClick={onFacilityClick}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <img 
              src="/logo.jpg" 
              alt="in.fit GYM Logo" 
              className="w-9 h-9 rounded-full object-cover border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.4)] transition-transform group-hover:scale-105" 
            />
            <div className="flex items-baseline gap-1.5">
              <h1 className="font-display font-black text-2xl tracking-tighter text-white group-hover:text-[#E50914] transition-all leading-none uppercase">
                in.fit
              </h1>
              <span className="font-sans text-xs font-black tracking-[0.15em] uppercase text-[#E50914] block leading-none">
                GYM
              </span>
            </div>
          </div>

          {
    /* Desktop Navigation Links */
  }
          <div className="hidden md:flex items-center gap-6.5 select-none text-[10px] font-bold uppercase tracking-[0.18em]">
            <button
    onClick={onFacilityClick}
    className="text-[#EEEEF0]/80 hover:text-[#EF4444] cursor-pointer transition-colors"
  >
              The Forge
            </button>
            <button
    onClick={onPackagesClick}
    className="text-[#EEEEF0]/80 hover:text-[#EF4444] cursor-pointer transition-colors"
  >
              Packages
            </button>
            <button
    onClick={onClassesClick}
    className="text-[#EEEEF0]/80 hover:text-[#EF4444] cursor-pointer transition-colors"
  >
              Class Log
            </button>
            <button
    onClick={onCommunityClick}
    className="text-[#EEEEF0]/80 hover:text-[#EF4444] cursor-pointer transition-colors"
  >
              Community Feed
            </button>
            {loggedInUser && loggedInUser.role === "admin" && <button
    onClick={onAdminTrigger}
    className="text-amber-400 hover:text-white flex items-center gap-1.5 cursor-pointer bg-white/5 px-3 py-1.5 rounded-sm border border-amber-500/15"
  >
                <Settings className="w-3.5 h-3.5 animate-spin" /> Admin CMS
              </button>}
          </div>

          {
    /* Action Widgets */
  }
          <div className="flex items-center gap-4 relative">
            
            {
    /* Support Phone Hotlink */
  }
            <a
    href="tel:9966683776"
    className="text-[#EF4444] hover:text-[#EEEEF0] hover:bg-black/5 transition-all p-2.5 rounded-full flex items-center justify-center cursor-pointer"
    title="Call Support Office"
  >
              <Phone className="w-4.5 h-4.5" />
            </a>

            {
    /* User Pass System Account Widget */
  }
            {loggedInUser ? <div className="relative">
                <div
    onClick={() => setShowDropdown(!showDropdown)}
    className="bg-[#111111] border border-white/15 rounded-sm py-1.5 px-3 flex items-center gap-2.5 cursor-pointer transition-all hover:border-[#E50914] group select-none animate-fade-in text-white"
  >
                  <div className="text-right">
                    <span className="text-[8px] uppercase tracking-[0.15em] text-zinc-400 block font-bold">
                      {loggedInUser.role === "admin" ? "CMS ADMIN" : "ATHLETE PASS"}
                    </span>
                    <span className="font-display text-xs font-black text-white tracking-widest block uppercase group-hover:text-[#E50914] transition-colors">
                      {loggedInUser.fullName.split(" ")[0]}
                    </span>
                  </div>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${loggedInUser.role === "admin" ? "bg-[#E50914]/15 border-[#E50914]/40 text-[#E50914]" : "bg-white/10 border-white/10 text-zinc-200"}`}>
                    {loggedInUser.role === "admin" ? <Settings className="w-3.5 h-3.5" /> : <Award className="w-3.5 h-3.5" />}
                  </div>
                </div>

                {
    /* Dynamic click dropdown options */
  }
                {showDropdown && <div className="absolute right-0 mt-2 w-56 bg-[#121215] border border-white/10 rounded-sm shadow-xl py-1.5 z-50 text-left font-sans text-xs">
                    <div className="px-3.5 py-2 border-b border-white/5 text-[10px] text-zinc-400">
                      Signed in as <br />
                      <strong className="text-[#EEEEF0] truncate block">{loggedInUser.email}</strong>
                    </div>

                    {
    /* Member dynamic status panels for standard user roles */
  }
                    {loggedInUser.role === "user" && <div className="px-3.5 py-2 border-b border-white/5 space-y-1">
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block">Inquiry Status</span>
                        
                        {userStatus === "PENDING" && <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded-sm border border-amber-500/25">
                            <Clock className="w-3 h-3" /> PENDING REVIEW
                          </div>}
                        {userStatus === "CONTACTED" && <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded-sm border border-blue-500/25">
                            <Phone className="w-3 h-3 font-bold" /> CONTACTED/STAGING
                          </div>}
                        {userStatus === "APPROVED" && <div className="flex items-center gap-1.5 text-[10px] text-[#E50914] font-bold bg-[#E50914]/10 px-2 py-1 rounded-sm border border-[#E50914]/25">
                            <Sparkles className="w-3 h-3" /> PASS ACTIVATED
                          </div>}
                        {userStatus === "REJECTED" && <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-bold bg-red-500/15 px-2 py-1 rounded-sm border border-red-500/25">
                            <AlertCircle className="w-3 h-3" /> REJECTED / RETRY
                          </div>}
                      </div>}

                    {
    /* Conditional Digital Athlete Card Link */
  }
                    {loggedInUser.role === "user" && <div className="p-1 border-b border-white/5">
                        {userStatus === "APPROVED" ? <button
    onClick={() => {
      setShowDropdown(false);
      setShowPassModal(true);
    }}
    className="w-full text-left px-2.5 py-2 text-xs text-[#EEEEF0] hover:bg-[#E50914] hover:text-white rounded-sm flex items-center gap-2 font-bold transition-all cursor-pointer bg-[#E50914]/10 border border-[#E50914]/15"
  >
                            <Award className="w-4 h-4 text-[#E50914] shrink-0" /> 🎫 VIEW ATHLETE CARD
                          </button> : <div className="p-2 text-[10.5px] text-zinc-400 bg-white/5 rounded-sm italic">
                            Pass generation is pending owner review and validation.
                          </div>}
                      </div>}

                    {loggedInUser.role === "admin" && <button
    onClick={() => {
      setShowDropdown(false);
      onAdminTrigger();
    }}
    className="w-full text-left px-3.5 py-2 text-xs text-[#EEEEF0] hover:bg-zinc-800 flex items-center gap-2 font-semibold cursor-pointer transition-colors"
  >
                        <Settings className="w-4 h-4 text-[#E50914] shrink-0" /> Dashboard CMS
                      </button>}

                    <button
    onClick={() => {
      setShowDropdown(false);
      onLogout();
    }}
    className="w-full text-left px-3.5 py-2.5 text-xs text-red-500 hover:bg-red-500/10 hover:text-red-400 flex items-center gap-2 font-semibold cursor-pointer transition-colors"
  >
                      <LogOut className="w-4 h-4 shrink-0" /> Sign Out
                    </button>
                  </div>}
              </div> : <div className="flex items-center gap-2.5">
                <button
    onClick={onAuthTrigger}
    className="text-[10px] font-bold uppercase tracking-widest text-[#EEEEF0]/75 hover:text-[#EF4444] py-2.5 px-3.5 flex items-center gap-1 cursor-pointer transition-all border border-transparent hover:border-white/10"
    title="Access Passport login/register"
  >
                  <LogIn className="w-4 h-4 text-[#EF4444] shrink-0" /> Sign In
                </button>
                
                <button
    onClick={() => onJoinClick()}
    className="hidden sm:block bg-[#1A1A1E] hover:bg-[#EF4444] text-white font-sans text-[10px] tracking-[0.25em] font-bold px-5 py-3 uppercase rounded-sm border border-white hover:border-[#EF4444] transition-all cursor-pointer shadow-sm shadow-[#EF4444]/15 animate-pulse hover:animate-none"
  >
                  Join Now
                </button>
              </div>}

            {
    /* Mobile Menu indicator */
  }
            <button
    onClick={onClassesClick}
    className="md:hidden text-[#EEEEF0]/70 hover:text-[#EF4444] p-1.5"
    title="Open Schedule"
  >
              <Menu className="w-5 h-5 cursor-pointer" />
            </button>

          </div>
        </div>
      </nav>

      {
    /* --- IN-FIT DIGITAL ATHLETE CARD DIALOGUE FOR APPROVED ATHLETES --- */
  }
      {showPassModal && currentUser && <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {
    /* Backdrop */
  }
          <div
    className="absolute inset-0 bg-black/65 backdrop-blur-[4px]"
    onClick={() => setShowPassModal(false)}
  />

          {
    /* Card Frame */
  }
          <div className="relative w-full max-w-sm bg-[#121215] border-2 border-[#E50914] rounded-sm overflow-hidden shadow-2xl z-10 font-sans p-6 text-left space-y-6">
            
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E50914] text-white flex items-center justify-center font-bold text-sm">
                  IN
                </div>
                <div>
                  <h5 className="font-display font-black text-white text-md tracking-tight leading-none uppercase">in.fit GYM</h5>
                  <span className="text-[7.5px] text-[#E50914] font-bold uppercase tracking-widest block mt-0.5">
                    APPROVED ATHLETE MEMBER
                  </span>
                </div>
              </div>
              
              <button
    onClick={() => setShowPassModal(false)}
    className="text-zinc-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
  >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <span className="text-[8px] uppercase tracking-wider text-[#EEEEF0]/50 block font-bold font-sans">MEMBER NAME</span>
                <span className="font-display text-2xl text-white font-black tracking-wide uppercase leading-tight">
                  {currentUser.fullName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-[#EEEEF0]/50 block font-bold">UID PASS CODE</span>
                  <span className="font-mono text-xs text-[#EEEEF0]/90 tracking-wider font-bold block truncate uppercase">
                    {currentUser.memberId}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-[#EEEEF0]/50 block font-bold">APPROVED SINCE</span>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#EEEEF0]/80 font-medium font-sans mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-[#E50914]" />
                    {currentUser.joinedDate}
                  </div>
                </div>
              </div>
            </div>

            {
    /* Simulated Branded Barcode */
  }
            <div className="pt-4 border-t border-white/10 flex flex-col items-center">
              <div className="flex justify-center items-stretch h-9 gap-0.5 w-full max-w-[210px] mb-2 opacity-95">
                {Array.from({ length: 44 }).map((_, i) => <div
    key={i}
    className="bg-zinc-200"
    style={{
      width: i % 4 === 0 ? "3px" : i % 3 === 0 ? "1px" : i % 5 === 0 ? "4px" : "2px",
      opacity: i % 7 === 0 ? 0.3 : 1
    }}
  />)}
              </div>
              <span className="text-[8.5px] font-mono text-[#EEEEF0]/40 tracking-[0.25em] uppercase font-semibold">
                * ACTIVE-{currentUser.selectedPlanId}-{currentUser.memberId} *
              </span>
            </div>

            <div className="pt-2">
              <button
    onClick={() => {
      alert("Pass card image downloaded successfully to local storage cache.");
      setShowPassModal(false);
    }}
    className="w-full bg-[#1A1A1E] border border-white/10 hover:border-[#E50914] hover:bg-[#E50914] text-white font-sans text-[10px] tracking-[0.2em] font-bold uppercase py-3 rounded-sm transition-all text-center cursor-pointer"
  >
                DOWNLOAD DIGITAL ACCREDITATION
              </button>
            </div>
          </div>
        </div>}
    </>;
}
