import { useState, useRef, useEffect } from "react";
import { Send, X, ArrowUpRight, Dumbbell } from "lucide-react";
export default function AthleteChatbot({ isOpen, onClose, gymContext }) {
  const [messages, setMessages] = useState([
    {
      id: "m1",
      sender: "coach",
      text: "Welcome to in.fit GYM! Ready to shatter your physical limits? Whether you want to gain raw muscle, shred fat, or master your lifts, I am here to find your perfect plan. Ask me about our world-class Real Leader USA biomechanic racks, dynamic classes, and premium AC recovery spaces\u2014or let me know your goals to recommend the ideal membership tier today!",
      timestamp: /* @__PURE__ */ new Date()
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);
  if (!isOpen) return null;
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const userMessage = {
      id: "u-" + Date.now(),
      sender: "athlete",
      text: inputVal,
      timestamp: /* @__PURE__ */ new Date()
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputVal("");
    setIsTyping(true);
    try {
      const geminiMessages = updatedMessages.map((m) => ({
        role: m.sender === "athlete" ? "user" : "model",
        content: m.text
      }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: geminiMessages,
          gymContext
        })
      });
      if (!res.ok) {
        throw new Error("Failed to contact chat server.");
      }
      const data = await res.json();
      const coachMessage = {
        id: "c-" + Date.now(),
        sender: "coach",
        text: data.reply || "Excellent training strategy. What's the next goal?",
        timestamp: /* @__PURE__ */ new Date()
      };
      setMessages((prev) => [...prev, coachMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: "err-" + Date.now(),
        sender: "coach",
        text: "Apologies, athlete. A temporary communication issue occurred. Connect with us on WhatsApp or retry!",
        timestamp: /* @__PURE__ */ new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  return <div className="fixed bottom-24 right-6 z-50 w-[350px] bg-[#121215] border border-white/10 rounded-sm overflow-hidden flex flex-col shadow-2xl font-sans text-left">
      
      {
    /* Header */
  }
      <div className="p-4 bg-[#0B0B0C] border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#E50914]/15 border border-[#E50914]/20 flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-[#E50914]" />
          </div>
          <div>
            <span className="text-[8px] text-[#E50914] font-bold uppercase tracking-widest leading-none block mb-0.5">ASSISTANT</span>
            <span className="text-[10px] font-sans font-black text-white uppercase tracking-wider block">Plan & Membership Advisor</span>
          </div>
        </div>
        <button
    onClick={onClose}
    className="text-zinc-200/60 hover:text-[#E50914] p-1 rounded-full hover:bg-black/5 cursor-pointer"
  >
          <X className="w-4 h-4" />
        </button>
      </div>

      {
    /* Messages */
  }
      <div className="flex-1 p-4 h-[320px] overflow-y-auto space-y-3.5 bg-[#0B0B0C]/30">
        {messages.map((m) => <div key={m.id} className={`flex ${m.sender === "athlete" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-sm p-3 text-xs leading-relaxed ${m.sender === "athlete" ? "bg-[#E50914] text-white rounded-br-none font-medium" : "bg-[#121215] text-[#EEEEF0] border border-white/5 rounded-bl-none shadow-sm"}`}>
              {m.text}
            </div>
          </div>)}
        {isTyping && <div className="flex justify-start">
            <div className="bg-[#121215] border border-white/5 rounded-sm rounded-bl-none p-3 text-xs flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-[#E50914] rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-[#E50914] rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-[#E50914] rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>}
        <div ref={messagesEndRef} />
      </div>

      {
    /* Form Input */
  }
      <form onSubmit={handleSend} className="p-3 bg-[#0B0B0C] border-t border-white/10 flex gap-2">
        <input
    type="text"
    placeholder="Type lifting or routine query..."
    value={inputVal}
    onChange={(e) => setInputVal(e.target.value)}
    className="flex-1 bg-[#121215] border border-white/15 rounded-sm px-2.5 py-1.5 text-xs text-[#EEEEF0] placeholder-zinc-600/30 outline-none focus:border-[#E50914]"
  />
        <button
    type="submit"
    className="bg-[#1A1A1E] hover:bg-[#E50914] text-white p-2 rounded-sm transition-colors flex items-center justify-center cursor-pointer"
  >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {
    /* WhatsApp Link Bridge */
  }
      <div className="p-2.5 bg-[#0B0B0C] border-t border-white/10 text-center">
        <a
    href="https://api.whatsapp.com/send?phone=919966683776"
    target="_blank"
    rel="noopener noreferrer"
    className="text-[9px] text-[#E50914] hover:text-[#EEEEF0] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors"
  >
          OR CONNECT ON WHATSAPP DIRECTLY <ArrowUpRight className="w-3 h-3" />
        </a>
      </div>

    </div>;
}
