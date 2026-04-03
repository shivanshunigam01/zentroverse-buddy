import { useState } from "react";
import { MessageSquare, Send, Bot, User, Clock, CheckCheck, ArrowRight } from "lucide-react";

const conversations = [
  { id: 1, name: "Rajesh Kumar", lastMsg: "Yes, I'm interested in Thar", time: "2 min", unread: 2, status: "active" },
  { id: 2, name: "Priya Sharma", lastMsg: "Can you share EMI options?", time: "15 min", unread: 1, status: "active" },
  { id: 3, name: "Amit Patel", lastMsg: "Bot: Welcome! How can we help?", time: "32 min", unread: 0, status: "bot" },
  { id: 4, name: "Sneha Reddy", lastMsg: "I'd like to schedule a test drive", time: "1 hr", unread: 0, status: "active" },
  { id: 5, name: "Vikram Singh", lastMsg: "Bot: Following up on your inquiry", time: "2 hrs", unread: 0, status: "bot" },
];

const chatMessages = [
  { from: "bot", text: "Hi Rajesh! 👋 Welcome to Zentroverse. I'm your AI assistant. How can I help you today?", time: "10:30 AM" },
  { from: "bot", text: "Are you looking to:\n1️⃣ Buy a new vehicle\n2️⃣ Explore financing options\n3️⃣ Schedule a test drive\n4️⃣ Get service support", time: "10:30 AM" },
  { from: "user", text: "I'm interested in buying a Thar", time: "10:32 AM" },
  { from: "bot", text: "Great choice! 🚙 The Mahindra Thar is one of our most popular models. Which variant interests you?\n\n• LX Hard Top - ₹15.35L\n• LX Soft Top - ₹14.85L\n• AX Opt - ₹16.65L\n• Earth Edition - ₹15.99L", time: "10:32 AM" },
  { from: "user", text: "AX Opt looks good. What's the on-road price?", time: "10:34 AM" },
  { from: "bot", text: "The AX Opt on-road price in your city would be approximately ₹19.2L. Would you like me to:\n\n✅ Share detailed specs\n✅ Calculate EMI options\n✅ Book a test drive\n✅ Connect with a sales executive", time: "10:34 AM" },
  { from: "user", text: "Yes, I'm interested in Thar", time: "10:35 AM" },
];

const templates = [
  { name: "Welcome Greeting", triggers: "New lead created", responses: 2341, conversion: "34%" },
  { name: "Interest Capture", triggers: "After greeting", responses: 1876, conversion: "28%" },
  { name: "Follow-up Nudge", triggers: "24hr no response", responses: 943, conversion: "12%" },
  { name: "Test Drive Offer", triggers: "Interest confirmed", responses: 567, conversion: "45%" },
  { name: "Finance Calculator", triggers: "EMI inquiry", responses: 423, conversion: "38%" },
];

const AIEngagement = () => {
  const [activeConvo, setActiveConvo] = useState(1);
  const [tab, setTab] = useState<"conversations" | "templates">("conversations");

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">AI Engagement Engine</h2>
        <p className="text-sm text-muted-foreground">WhatsApp Bot • 2,341 messages sent today</p>
      </div>

      <div className="flex gap-2 mb-2">
        <button onClick={() => setTab("conversations")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "conversations" ? "gradient-primary text-primary-foreground shadow" : "bg-card text-muted-foreground border border-border"}`}>
          Live Conversations
        </button>
        <button onClick={() => setTab("templates")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "templates" ? "gradient-primary text-primary-foreground shadow" : "bg-card text-muted-foreground border border-border"}`}>
          Bot Templates
        </button>
      </div>

      {tab === "conversations" ? (
        <div className="glass-card rounded-xl overflow-hidden flex h-[520px]">
          {/* Conversation List */}
          <div className="w-80 border-r border-border overflow-y-auto">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConvo(c.id)}
                className={`w-full p-4 text-left border-b border-border/50 hover:bg-secondary/50 transition-colors ${activeConvo === c.id ? "bg-secondary" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                    {c.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{c.name}</span>
                      <span className="text-[10px] text-muted-foreground">{c.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {c.status === "bot" && <Bot size={10} className="text-primary flex-shrink-0" />}
                      <p className="text-xs text-muted-foreground truncate">{c.lastMsg}</p>
                    </div>
                  </div>
                  {c.unread > 0 && <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{c.unread}</span>}
                </div>
              </button>
            ))}
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">RK</div>
                <div>
                  <p className="text-sm font-bold text-foreground">Rajesh Kumar</p>
                  <p className="text-[10px] text-success font-medium">● Online • Thar Inquiry</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-success/10 text-success font-semibold">AI Active</span>
                <button className="px-2 py-1 rounded bg-secondary text-muted-foreground font-medium hover:bg-primary hover:text-primary-foreground transition-colors">Take Over</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] rounded-xl px-4 py-2.5 ${
                    msg.from === "user" ? "gradient-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}>
                    <p className="text-sm whitespace-pre-line">{msg.text}</p>
                    <div className={`flex items-center gap-1 mt-1 ${msg.from === "user" ? "justify-end" : ""}`}>
                      {msg.from === "bot" && <Bot size={10} className="text-primary" />}
                      <span className="text-[10px] opacity-70">{msg.time}</span>
                      {msg.from === "user" && <CheckCheck size={12} className="opacity-70" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border flex items-center gap-2">
              <input placeholder="Type a message..." className="flex-1 px-4 py-2.5 bg-secondary rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground" />
              <button className="p-2.5 rounded-lg gradient-primary text-primary-foreground"><Send size={16} /></button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-3 font-semibold text-muted-foreground">Template Name</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Trigger</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Responses</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Conversion</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="p-3 font-semibold text-foreground">{t.name}</td>
                  <td className="p-3 text-muted-foreground">{t.triggers}</td>
                  <td className="p-3 font-bold text-foreground">{t.responses.toLocaleString()}</td>
                  <td className="p-3"><span className="px-2 py-1 rounded-full bg-success/10 text-success text-xs font-bold">{t.conversion}</span></td>
                  <td className="p-3"><button className="text-xs text-primary font-semibold hover:underline">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AIEngagement;
