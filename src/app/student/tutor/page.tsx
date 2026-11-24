"use client";
import { useEffect, useRef, useState } from "react";
import { Send, Volume2 } from "lucide-react";
import { Button, LogoMark, Pill } from "@/components/ui";
import { tutorOpening, tutorReplies, type TutorMessage } from "@/lib/sample-data";
import { cn } from "@/lib/utils";

export default function TutorPage() {
  const [messages, setMessages] = useState<TutorMessage[]>(tutorOpening);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [reply, setReply] = useState(0);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, typing]);

  const send = () => {
    if (!text.trim() || typing) return;
    setMessages(m => [...m, { role: "student", text }]);
    setText(""); setTyping(true);
    setTimeout(() => { setMessages(m => [...m, { role: "tutor", text: tutorReplies[reply % tutorReplies.length]! }]); setReply(r => r + 1); setTyping(false); }, 900);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="hl-rise flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3"><LogoMark size={40} /><div><h1 className="text-2xl font-extrabold">Your tutor</h1><p className="text-sm text-muted-foreground">Helping with: Profit, loss and discount</p></div></div>
        <Pill tone="info">Knows your path and what you’ve mastered</Pill>
      </div>
      <div className="min-h-[50dvh] space-y-3 rounded-3xl border bg-card p-4 sm:p-6">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "student" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%] rounded-3xl px-4 py-3 text-[15px] leading-relaxed", m.role === "student" ? "rounded-br-lg bg-foreground text-background" : "rounded-bl-lg bg-sky-soft")}>
              {m.text}
              {m.role === "tutor" && <button aria-label="Read aloud" className="ml-2 inline-flex align-middle text-accent"><Volume2 className="h-4 w-4" /></button>}
            </div>
          </div>
        ))}
        {typing && <div className="flex"><div className="rounded-3xl rounded-bl-lg bg-sky-soft px-4 py-3 text-muted-foreground">Thinking…</div></div>}
        <div ref={end} />
      </div>
      <form className="flex gap-2" onSubmit={e => { e.preventDefault(); send(); }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Ask a question about this lesson…" className="flex-1 rounded-full border border-input bg-card px-5 py-3 text-sm outline-none focus:border-accent" />
        <Button type="submit" size="lg" disabled={!text.trim() || typing}><Send /> Send</Button>
      </form>
      <p className="text-center text-xs text-muted-foreground">The tutor never asks for personal details. Your school can’t see these conversations.</p>
    </div>
  );
}
