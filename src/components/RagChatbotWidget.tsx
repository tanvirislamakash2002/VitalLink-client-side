"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getUserRoleAction, ingestDoctorsAction, queryRagAction } from "@/app/_actions/rag.action"
import {
  Bot,
  Database,
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  Send,
  Sparkles,
  X,
} from "lucide-react"
import { FormEvent, useEffect, useRef, useState } from "react"

interface ChatMessage {
  role: "assistant" | "user"
  text: string
  sources?: string
}

const starterPrompts = [
  "Neurologist in Dhaka",
  "Cardiologist near me",
  "Doctors with 5+ years experience",
  "Pediatric specialist",
]

const RagChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputQuery, setInputQuery] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hello! I am your VitalLink AI Healthcare Assistant. Ask me anything about doctors, specialties, or care guidance.",
    },
  ])
  const [isSending, setIsSending] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [roleChecked, setRoleChecked] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Verify whether the logged in user is ADMIN or SUPER_ADMIN
  useEffect(() => {
    if (!isOpen || roleChecked) return
    let active = true

    void getUserRoleAction()
      .then((role) => {
        if (active) {
          setIsAdmin(role === "ADMIN" || role === "SUPER_ADMIN")
          setRoleChecked(true)
        }
      })
      .catch(() => {
        if (active) setRoleChecked(true)
      })

    return () => {
      active = false
    }
  }, [isOpen, roleChecked])

  // Scroll to latest message
  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
      inputRef.current?.focus()
    }
  }, [messages, isOpen])

  const handleQuery = async (query: string) => {
    const normalized = query.trim()
    if (!normalized || isSending) return

    setMessages((prev) => [...prev, { role: "user", text: normalized }])
    setInputQuery("")
    setIsSending(true)

    try {
      const res = await queryRagAction(normalized)
      if (res.success && res.answer) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: res.answer,
            sources: res.sources,
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: res.error || "Unable to retrieve doctor recommendations right now.",
          },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Something went wrong while contacting the assistant. Please try again.",
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void handleQuery(inputQuery)
  }

  const handleSyncDoctors = async () => {
    setSyncStatus(null)
    setIsSyncing(true)
    try {
      const res = await ingestDoctorsAction()
      if (res.success) {
        setSyncStatus(
          res.message || `Doctors data indexed successfully (${res.indexedCount ?? 0} indexed).`
        )
      } else {
        setSyncStatus(res.error || "Failed to sync doctor data.")
      }
    } catch {
      setSyncStatus("Error occurred while executing doctor sync.")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
      {/* Expanded Chatbot Modal */}
      {isOpen && (
        <section
          aria-label="VitalLink AI Assistant"
          className="mb-3.5 flex h-[min(75dvh,40rem)] w-[calc(100vw-2rem)] max-w-sm sm:max-w-md flex-col overflow-hidden rounded-2xl border border-emerald-900/20 bg-white shadow-2xl shadow-emerald-950/25 animate-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <header className="flex items-center gap-3 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 px-4 py-3.5 text-white">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
              <Bot aria-hidden="true" className="size-5 text-emerald-300" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-sm font-bold">VitalLink AI Assistant</h2>
                <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="truncate text-[11px] text-emerald-200/80">
                Doctor discovery & healthcare guidance
              </p>
            </div>

            {/* Ingestion / Sync action - only visible and actionable for ADMIN / SUPER_ADMIN */}
            {isAdmin && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2.5 text-xs font-semibold text-emerald-200 hover:bg-white/10 hover:text-white"
                onClick={() => void handleSyncDoctors()}
                disabled={isSyncing}
                title="Sync doctor profiles to vector database (Admin Only)"
                aria-label="Sync doctor profiles"
              >
                {isSyncing ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="size-3.5" />
                )}
                <span className="hidden sm:inline">Sync DB</span>
              </Button>
            )}

            {/* Close Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
            >
              <X className="size-4" />
            </Button>
          </header>

          {/* Admin Sync Notification Banner */}
          {syncStatus && (
            <div className="flex items-center justify-between gap-2 border-b border-emerald-100 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-900">
              <div className="flex items-center gap-1.5">
                <Database className="size-3.5 text-emerald-700 shrink-0" />
                <span>{syncStatus}</span>
              </div>
              <button
                type="button"
                onClick={() => setSyncStatus(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="size-3" />
              </button>
            </div>
          )}

          {/* Chat Body & Conversation History */}
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-slate-50/50 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={message.role === "user" ? "ml-8" : "mr-4"}
                >
                  <div
                    className={
                      message.role === "user"
                        ? "ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-xs bg-emerald-800 px-4 py-2.5 text-sm text-white shadow-xs"
                        : "w-fit max-w-[95%] rounded-2xl rounded-tl-xs border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 shadow-xs"
                    }
                  >
                    <div className="leading-relaxed whitespace-pre-wrap">{message.text}</div>

                    {message.sources && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className="bg-emerald-50 text-[10px] text-emerald-800 border border-emerald-200/50"
                        >
                          {message.sources}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Starter Query Chips for Easy Initiation */}
              {messages.length === 1 && (
                <div className="mt-4 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Sparkles className="size-3.5 text-emerald-700" />
                    <span>Popular Searches</span>
                  </div>
                  <div className="mt-2.5 flex flex-col gap-1.5">
                    {starterPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => void handleQuery(prompt)}
                        disabled={isSending}
                        className="rounded-lg border border-slate-200/70 bg-slate-50/70 px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:border-emerald-700/40 hover:bg-emerald-50 hover:text-emerald-900 disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Thinking / Searching Indicator */}
              {isSending && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200/60 w-fit px-3 py-2 rounded-full shadow-2xs">
                  <LoaderCircle className="size-3.5 animate-spin text-emerald-700" />
                  <span>Searching medical records & recommendations…</span>
                </div>
              )}
            </div>
          </div>

          {/* Query Input Box */}
          <form
            onSubmit={handleFormSubmit}
            className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
          >
            <Input
              ref={inputRef}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="e.g. Neurologist in Dhaka..."
              aria-label="Ask the VitalLink assistant"
              disabled={isSending}
              className="h-10 text-xs sm:text-sm rounded-xl focus-visible:ring-emerald-700"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputQuery.trim() || isSending}
              className="size-10 shrink-0 rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 disabled:opacity-50"
              aria-label="Send query"
              title="Send query"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </section>
      )}

      {/* Floating Trigger Bubble Button */}
      <div className="relative flex items-center">
        {!isOpen && (
          <div className="pointer-events-none absolute right-16 hidden whitespace-nowrap rounded-lg bg-emerald-950 px-3 py-1.5 text-xs font-semibold text-white shadow-lg sm:block animate-in fade-in slide-in-from-right-2">
            Ask AI Doctor Assistant
          </div>
        )}

        <Button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative flex size-14 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-900 via-emerald-800 to-teal-700 text-white shadow-xl shadow-emerald-950/30 transition-all hover:scale-105 hover:shadow-2xl active:scale-95"
          aria-label={isOpen ? "Close VitalLink assistant" : "Open VitalLink assistant"}
          aria-expanded={isOpen}
          title="VitalLink AI Assistant"
        >
          {isOpen ? (
            <X className="size-6" />
          ) : (
            <>
              <span className="absolute -top-0.5 -right-0.5 flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-emerald-500" />
              </span>
              <MessageCircle className="size-6" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default RagChatbotWidget
