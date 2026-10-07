"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Bot, SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

const INPUT_MIN_HEIGHT = 72;
const INPUT_MAX_HEIGHT = 160;

/**
 * Chat UI for the AI Architect tab. Messages are local only — no AI
 * generation yet, so submitting just appends the user's message.
 */
export function AiArchitectTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Grow with content between the min and max height, then scroll.
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(
      Math.max(input.scrollHeight, INPUT_MIN_HEIGHT),
      INPUT_MAX_HEIGHT,
    )}px`;
  }, [draft]);

  useEffect(() => {
    const scroll = scrollRef.current;
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
  }, [messages]);

  const canSend = draft.trim().length > 0;

  const sendMessage = () => {
    const content = draft.trim();
    if (!content) return;
    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-${current.length}`, role: "user", content },
    ]);
    setDraft("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleStarterPrompt = (prompt: string) => {
    setDraft(prompt);
    inputRef.current?.focus();
  };

  return (
    <>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4">
        {messages.length > 0 ? (
          <ul className="flex flex-col gap-3 py-2">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </ul>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-ai/15">
              <Bot className="h-6 w-6 text-ai-text" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-copy-primary">
                Design with Ghost AI
              </p>
              <p className="text-xs text-copy-muted">
                Describe a system and the AI Architect will help you map it out
                on the canvas.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleStarterPrompt(prompt)}
                  className="rounded-full border border-surface-border bg-bg-subtle px-3 py-1.5 text-xs text-ai-text transition-colors hover:border-ai/50 focus-visible:ring-2 focus-visible:ring-ai/50 focus-visible:outline-none"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-surface-border p-3"
      >
        <div className="relative">
          <Textarea
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your architecture…"
            aria-label="Message AI Architect"
            rows={1}
            className="min-h-[72px] max-h-40 resize-none overflow-y-auto rounded-xl border-surface-border bg-bg-surface pr-12 text-copy-primary placeholder:text-copy-faint dark:bg-bg-surface"
          />
          <Button
            type="submit"
            size="icon-sm"
            disabled={!canSend}
            aria-label="Send message"
            className="absolute right-2 bottom-2 rounded-lg bg-ai text-white hover:bg-ai/90"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1.5 text-[11px] text-copy-faint">
          Enter to send · Shift+Enter for a new line
        </p>
      </form>
    </>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <li className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <p
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words",
          isUser
            ? "rounded-br-md border-2 border-brand/50 bg-accent-dim text-copy-primary"
            : "rounded-bl-md border border-surface-border bg-bg-elevated text-ai-text",
        )}
      >
        {message.content}
      </p>
    </li>
  );
}
