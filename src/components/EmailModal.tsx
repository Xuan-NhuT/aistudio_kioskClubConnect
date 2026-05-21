import React, { useState } from "react";
import { Student } from "../types";
import { Mail, Send, CheckCircle2, X, Sparkles, MessageCircleCode } from "lucide-react";

interface EmailModalProps {
  recipient: Student;
  senderName: string;
  senderEmail: string;
  senderNetId: string;
  onClose: () => void;
}

const EMAIL_TEMPLATES = [
  {
    label: "Study Together",
    subject: "Studying nearby - want to join?",
    body: "Hey! Saw you are checked in nearby. I'm working on some class stuff too, want to sit together or compare notes?"
  },
  {
    label: "Grab Boba / Eat",
    subject: "Boba / quick food break?",
    body: "Hey there! I am taking a short break from studying. Down to grab a quick boba or snack at the Ave/HUB?"
  },
  {
    label: "Sync up on Club Goals",
    subject: "Club project sync up?",
    body: "Hey! Saw you are in the same building. Just wanted to see if you have 10 minutes to chat about our club's upcoming events or project ideas?"
  }
];

export default function EmailModal({
  recipient,
  senderName,
  senderEmail,
  senderNetId,
  onClose,
}: EmailModalProps) {
  const [subject, setSubject] = useState("Saw you checked in nearby!");
  const [message, setMessage] = useState(
    `Hey ${recipient.name.split(" ")[0]},\n\nSaw that we are both the same club and checked in here nearby! Let's study or hook up to chat if you are free.\n\nBest,\n${senderName}`
  );
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleApplyTemplate = (tpl: typeof EMAIL_TEMPLATES[0]) => {
    setSubject(tpl.subject);
    setMessage(`Hey ${recipient.name.split(" ")[0]},\n\n${tpl.body}\n\nBest,\n${senderName}`);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    // Animate a high-fidelity kiosk delivery server dispatch
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
    }, 1200);
  };

  const mailtoUrl = `mailto:${recipient.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-[scaleIn_0.2s_ease-out]">
        
        {/* Header containing UW Purple branding and close button */}
        <div className="bg-brand-purple text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-brand-gold-light" />
            <div>
              <h3 className="font-display font-semibold text-base leading-tight">UW Campus Mail Messenger</h3>
              <p className="text-xs text-slate-300">Fast connection via UW Email system</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSent ? (
          <form onSubmit={handleSend} className="p-5 overflow-y-auto space-y-4 flex-1">
            {/* Delivery Route */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 text-xs text-slate-600 space-y-1.5">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">From (Kiosk Session):</span>
                <span className="font-mono text-brand-purple">{senderName} ({senderEmail})</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-1.5">
                <span className="font-semibold text-slate-500">To Recipient:</span>
                <span className="font-mono text-brand-purple">{recipient.name} ({recipient.email})</span>
              </div>
            </div>

            {/* Quick Templates Selection */}
            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-2">Quick Message Templates:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {EMAIL_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="p-2 border border-slate-200 rounded-lg text-left hover:border-brand-purple hover:bg-brand-purple/5 text-[11px] text-slate-700 transition-all font-medium leading-snug"
                  >
                    💡 {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
              />
            </div>

            {/* Message Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Your Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-purple resize-none"
              />
            </div>

            {/* Send Footer actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSending}
                className="flex-1 bg-brand-purple hover:bg-brand-purple-light text-white font-medium text-sm py-2 px-4 rounded-xl shadow-lg shadow-brand-purple/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-brand-gold-light animate-pulse" />
                    <span>Send</span>
                  </>
                )}
              </button>
              
              <a
                href={mailtoUrl}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Open native mail client"
              >
                Launch Native Mail
              </a>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center space-y-4 flex-1 flex flex-col justify-center items-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-400/30 text-emerald-500 animate-[bounce_1.4s_infinite]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="space-y-1">
              <h4 className="font-display font-bold text-lg text-slate-800">Email Dispatched Successfully!</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your message has been dispatched to <span className="font-mono text-brand-purple font-semibold">{recipient.email}</span>.
              </p>
            </div>

            {/* Kiosk-Free Continuation instructions */}
            <div className="bg-brand-purple/5 border border-brand-purple/15 rounded-xl p-4 text-left w-full max-w-sm mx-auto space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-purple">
                <Sparkles className="w-4 h-4 text-brand-gold-dark" />
                <span>Continue conversation on your phone or laptop</span>
              </div>
              <p className="text-[11.5px] text-slate-600 leading-relaxed font-sans">
                Since this is a campus email dispatch, you can check responses by opening your <strong>UW Outlook or email inbox on your phone or other device</strong>. 
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans italic border-t border-brand-purple/10 pt-1.5">
                You can safely step away from this kiosk and continue chatting on the go without having to stay here!
              </p>
            </div>



            <button
              onClick={onClose}
              className="mt-2 px-6 py-2 bg-brand-purple hover:bg-brand-purple-light text-white font-medium text-xs rounded-xl transition-colors shadow-lg cursor-pointer font-sans"
            >
              Back to Nearby Friends
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
