import { useState } from "react";
import { X, ShieldCheck, Mail, Lock, User, Phone, Sparkles, Key, AlertCircle } from "lucide-react";
import { validatePasswordSecurity } from "../cmsDefaults";
import { supabase } from "../supabaseClient";

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState("login");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFullName, setRegFullName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  if (!isOpen) return null;

  const cleanForms = () => {
    setRegEmail("");
    setRegPassword("");
    setRegFullName("");
    setRegPhone("");
    setLoginEmail("");
    setLoginPassword("");
    setRecoveryEmail("");
    setRecoveryStep(1);
    setAuthError("");
    setAuthSuccess("");
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setLoading(true);

    if (!regEmail.trim() || !regPassword.trim() || !regFullName.trim() || !regPhone.trim()) {
      setAuthError("All standard registration details are required.");
      setLoading(false);
      return;
    }

    const checkPass = validatePasswordSecurity(regPassword);
    if (!checkPass.isValid) {
      setAuthError(checkPass.error || "Password complexity not met.");
      setLoading(false);
      return;
    }

    try {
      // 1. Supabase Auth Sign Up
      const derivedRole = regEmail.toLowerCase().includes("admin") ? "ADMIN" : "MEMBER";
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPassword,
        options: {
          data: {
            full_name: regFullName.trim(),
            phone: regPhone.trim(),
            role: derivedRole
          }
        }
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error("Registration succeeded but no auth user profile returned.");

      // Role is already derived above

      // Insert is now handled by Supabase Database Trigger automatically
      // to avoid RLS/session race conditions on the frontend.

      const activeProfile = {
        email: regEmail.trim().toLowerCase(),
        fullName: regFullName.trim(),
        phone: regPhone.trim(),
        role: derivedRole,
        joinedDate: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
      };

      setAuthSuccess("Athlete account registered successfully! Logging you in...");
      setTimeout(() => {
        onLoginSuccess(activeProfile);
        cleanForms();
        onClose();
      }, 1500);
    } catch (err) {
      setAuthError(err.message || "An unexpected registration error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setLoading(true);

    try {
      // 1. Supabase Sign In
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (authError) throw authError;

      const user = authData.user;

      // 2. Retrieve corresponding role profile row from public.users table
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile sync error details:", profileError);
        throw new Error(`Profile sync failed: ${profileError.message || profileError.details || 'Row not found or RLS blocked'}`);
      }

      const activeProfile = {
        email: profile.email,
        fullName: profile.full_name,
        phone: profile.phone,
        role: profile.role,
        joinedDate: new Date(profile.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
      };

      setAuthSuccess(`Welcome back, ${profile.full_name.split(" ")[0]}! Syncing performance pass...`);
      setTimeout(() => {
        onLoginSuccess(activeProfile);
        cleanForms();
        onClose();
      }, 1200);
    } catch (err) {
      setAuthError(err.message || "Authentication credentials incorrect.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail.trim(), {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) throw error;

      setAuthSuccess("Password reset instruction has been sent to your email!");
      setTimeout(() => {
        setTab("login");
        cleanForms();
      }, 2000);
    } catch (err) {
      setAuthError(err.message || "Failed to trigger recovery reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[3px]" onClick={onClose} />

      {/* Auth Panel Box */}
      <div className="relative w-full max-w-md bg-[#0B0B0C] border border-white/10 rounded-sm overflow-hidden shadow-2xl z-10 text-left">
        
        {/* Header decoration */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#121215]">
          <div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-[#EF4444]" />
              <span className="text-[10px] text-[#EF4444] font-bold uppercase tracking-[0.2em] leading-none block">
                ATHLETE PASSPORT
              </span>
            </div>
            <h3 className="font-display font-black italic text-xl text-[#EEEEF0] tracking-tight mt-1">
              {tab === "login" && "Sign In to Your Pass"}
              {tab === "register" && "Enter Elite Gym Registry"}
              {tab === "forgot_password" && "Athlete Recovery Terminal"}
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-200/60 hover:text-[#EF4444] p-1.5 hover:bg-black/5 rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {authError && (
          <div className="p-4 bg-red-50 text-[#EF4444] border-b border-red-200 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
            <span>{authError}</span>
          </div>
        )}
        {authSuccess && (
          <div className="p-4 bg-emerald-50 text-emerald-800 border-b border-emerald-200 text-xs flex items-center gap-2 font-medium">
            <Sparkles className="w-4.5 h-4.5 text-[#EF4444] animate-pulse" />
            <span>{authSuccess}</span>
          </div>
        )}

        {/* Tab Selector */}
        {tab !== "forgot_password" && (
          <div className="flex border-b border-white/10">
            <button
              onClick={() => {
                setTab("login");
                setAuthError("");
              }}
              disabled={loading}
              className={`w-1/2 py-3 text-center text-[10px] font-bold uppercase tracking-widest border-r border-white/5 transition-all cursor-pointer ${tab === "login" ? "bg-[#1A1A1E]/5 text-[#EF4444]" : "bg-[#121215]/40 text-zinc-200/40 hover:text-zinc-200 hover:bg-[#121215]/80"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab("register");
                setAuthError("");
              }}
              disabled={loading}
              className={`w-1/2 py-3 text-center text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${tab === "register" ? "bg-[#1A1A1E]/5 text-[#EF4444]" : "bg-[#121215]/40 text-zinc-200/40 hover:text-zinc-200 hover:bg-[#121215]/80"}`}
            >
              Make Account
            </button>
          </div>
        )}

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* LOGIN SUBMIT */}
          {tab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[8px] font-bold text-zinc-200/60 uppercase tracking-widest mb-1">
                    Your Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-200/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      disabled={loading}
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="athlete@infit.com"
                      className="w-full bg-[#121215] border border-white/15 focus:border-[#EF4444] rounded-sm pl-9 pr-3.5 py-2.5 text-xs text-[#EEEEF0] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[8px] font-bold text-zinc-200/60 uppercase tracking-widest">
                      Secure Password
                    </label>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setTab("forgot_password")}
                      className="text-[8px] font-bold text-[#EF4444] uppercase tracking-widest hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-200/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      disabled={loading}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#121215] border border-white/15 focus:border-[#EF4444] rounded-sm pl-9 pr-3.5 py-2.5 text-xs text-[#EEEEF0] outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A1A1E] hover:bg-[#EF4444] text-white font-sans text-[10px] tracking-[0.25em] font-bold uppercase py-3.5 rounded-sm transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {loading ? "AUTHENTICATING..." : "ACCESS PASS PORTAL"}
                </button>
              </div>
            </form>
          )}

          {/* REGISTER SUBMIT */}
          {tab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[8px] font-bold text-zinc-200/60 uppercase tracking-widest mb-1">
                    Athlete Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-200/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      disabled={loading}
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="Rohit Sharma"
                      className="w-full bg-[#121215] border border-white/15 focus:border-[#EF4444] rounded-sm pl-9 pr-3 py-2.5 text-xs text-[#EEEEF0] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] font-bold text-zinc-200/60 uppercase tracking-widest mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-200/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      disabled={loading}
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 99666 83776"
                      className="w-full bg-[#121215] border border-white/15 focus:border-[#EF4444] rounded-sm pl-9 pr-3 py-2.5 text-xs text-[#EEEEF0] outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-bold text-zinc-200/60 uppercase tracking-widest mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-200/30 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    disabled={loading}
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="athlete@infit.com"
                    className="w-full bg-[#121215] border border-white/15 focus:border-[#EF4444] rounded-sm pl-9 pr-3.5 py-2.5 text-xs text-[#EEEEF0] outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-bold text-zinc-200/60 uppercase tracking-widest mb-1">
                  Strength Password (Letters & Numbers)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-200/30 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    disabled={loading}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min. 6 safe characters"
                    className="w-full bg-[#121215] border border-white/15 focus:border-[#EF4444] rounded-sm pl-9 pr-3.5 py-2.5 text-xs text-[#EEEEF0] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#EF4444] hover:bg-black text-white font-sans text-[10px] tracking-[0.25em] font-bold uppercase py-3.5 rounded-sm transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {loading ? "CREATING PROFILE..." : "REGISTER ACCOUNT"}
                </button>
              </div>
            </form>
          )}

          {/* ACCOUNT RECOVERY FLOW */}
          {tab === "forgot_password" && (
            <form onSubmit={handleRecoverySubmit} className="space-y-4">
              <div className="p-3.5 bg-amber-950/20 border border-amber-500/20 rounded-sm text-[#EEEEF0]/70 text-[11px] leading-relaxed">
                ⚙️ <strong>Athlete Recovery Terminal:</strong> Provide your registered email and we will send a password reset link to recover your credentials.
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[8px] font-bold text-zinc-200/60 uppercase tracking-widest mb-1">
                    Enter Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    disabled={loading}
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="e.g. athlete@infit.com"
                    className="w-full bg-[#121215] border border-white/15 focus:border-[#EF4444] rounded-sm px-3 py-2.5 outline-none text-[#EEEEF0]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setTab("login")}
                  className="w-1/3 border border-white/20 text-[#EEEEF0] py-3 rounded-sm text-[10px] tracking-widest font-bold uppercase hover:bg-black/5"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-[#1A1A1E] hover:bg-[#EF4444] text-white py-3 rounded-sm text-[10px] tracking-widest font-bold uppercase transition-shadow disabled:opacity-50"
                >
                  {loading ? "SENDING..." : "SEND RESET INSTRUCTIONS"}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
