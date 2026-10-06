"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  getCanSyncRagDoctorsAction,
  queryRagAction,
  RagDoctorRecommendation,
  RagQueryResult,
  syncRagDoctorsAction,
} from "@/services/rag.action"
import {
  ArrowRight,
  Bot,
  Database,
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  Send,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react"
import Link from "next/link"
import { FormEvent, useEffect, useRef, useState } from "react"

interface ChatDoctor extends RagDoctorRecommendation {
  doctorId?: string
}

interface ChatMessage {
  role: "assistant" | "user"
  text: string
  doctors?: ChatDoctor[]
}

const starterPrompts = [
  "Neurologist in Dhaka",
  "Find a cardiologist",
  "Doctors with 5+ years experience",
  "Pediatric specialist",
]

function parseRagAnswer(result: RagQueryResult): { text: string; doctors: ChatDoctor[] } {
  const answer = result.answer
  if (typeof answer === "string") return { text: answer, doctors: [] }

  const doctors = Array.isArray(answer?.doctors) ? answer.doctors : []
  const sources = result.sources ?? []
  const recommendations: ChatDoctor[] = doctors.map((doctor) => {
    const matchingSource = sources.find(
      (source) => source.sourceLabel?.trim().toLowerCase() === doctor.name.trim().toLowerCase()
    )
    return { ...doctor, doctorId: matchingSource?.sourceId }
  })

  const fallbackText = recommendations.length
    ? "Here are doctor recommendations matching your query:"
    : result.contextUsed
    ? "I couldn't identify a specific doctor from our database. Try another specialty or location."
    : "I don't have enough matching records in the system right now."

  return {
    text: answer?.answer ?? fallbackText,
    doctors: recommendations,
  }
}

const RagChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputQuery, setInputQuery] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hello! I’m your VitalLink AI Healthcare Assistant. Ask me about doctors, specialties, or medical guidance.",
    },
  ])
  const [isSending, setIsSending] = useState(false)
  const [canSyncDoctors, setCanSyncDoctors] = useState(false)
  const [syncChecked, setSyncChecked] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Check if current user is admin/superadmin when opening widget
  useEffect(() => {
    if (!isOpen || syncChecked) return
    let active = true

    void getCanSyncRagDoctorsAction()
      .then((allowed) => {
        if (active) {
          setCanSyncDoctors(allowed)
          setSyncChecked(true)
        }
      })
      .catch(() => {
        if (active) setSyncChecked(true)
      })

    return () => {
      active = false
    }
  }, [isOpen, syncChecked])

  // Scroll to bottom when messages change
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
      const result = await queryRagAction(normalized)
      if (result.success) {
        const parsed = parseRagAnswer(result.data)
        setMessages((prev) => [...prev, { role: "assistant", ...parsed }])
      } else {
        setMessages((prev) => [...prev, { role: "assistant", text: result.message }])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong while finding recommendations. Please try again." },
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
    setSyncMessage(null)
    setIsSyncing(true)
    try {
      const result = await syncRagDoctorsAction()
      if (result.success) {
        setSyncMessage(`Successfully indexed ${result.data.indexedCount ?? 0} doctors into AI knowledge base.`)
      } else {
        setSyncMessage(result.message || "Failed to sync doctor data.")
      }
    } catch {
      setSyncMessage("Error occurred while syncing doctor data.")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
      {/* Expanded Chatbot Modal */}
      {isOpen && (
        <section
          aria-label="VitalLink AI Healthcare Assistant"
          className="mb-3.5 flex h-[min(75dvh,40rem)] w-[calc(100vw-2rem)] max-w-sm sm:max-w-md flex-col overflow-hidden rounded-2xl border border-emerald-900/20 bg-white shadow-2xl shadow-emerald-950/25 animate-in slide-in-from-bottom-5 duration-200"
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
                Doctor discovery & healthcare search
              </p>
            </div>

            {/* Admin-only Ingestion / Sync action */}
            {canSyncDoctors && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 text-xs text-emerald-200 hover:bg-white/10 hover:text-white"
                onClick={() => void handleSyncDoctors()}
                disabled={isSyncing}
                title="Sync doctor profiles to AI Vector Knowledge Base (Admin only)"
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

          {/* Admin Sync Status Banner */}
          {syncMessage && (
            <div className="flex items-center justify-between gap-2 border-b border-emerald-100 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-900">
              <div className="flex items-center gap-1.5">
                <Database className="size-3.5 text-emerald-700 shrink-0" />
                <span>{syncMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setSyncMessage(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="size-3" />
              </button>
            </div>
          )}

          {/* Message History & Chat Body */}
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
                    <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  </div>

                  {/* Doctor Recommendation Cards */}
                  {message.doctors && message.doctors.length > 0 && (
                    <div className="mt-3 space-y-2.5">
                      {message.doctors.map((doctor, docIdx) => (
                        <article
                          key={`${doctor.name}-${docIdx}`}
                          className="rounded-xl border border-emerald-900/15 bg-white p-3.5 shadow-xs transition-shadow hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-100/80 text-emerald-800">
                                <Stethoscope className="size-4" />
                              </span>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">{doctor.name}</h4>
                                {doctor.specialty && (
                                  <Badge
                                    variant="secondary"
                                    className="mt-0.5 bg-emerald-50 text-[10px] text-emerald-800 border border-emerald-200/50"
                                  >
                                    {doctor.specialty}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {doctor.reason && (
                            <p className="mt-2 text-xs leading-relaxed text-slate-600 bg-slate-50 p-2 rounded-lg">
                              {doctor.reason}
                            </p>
                          )}

                          <div className="mt-2.5 flex items-center justify-end">
                            <Link
                              href={
                                doctor.doctorId
                                  ? `/consultation/doctor/${encodeURIComponent(doctor.doctorId)}`
                                  : "/consultation"
                              }
                              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
                            >
                              <span>{doctor.doctorId ? "View Doctor Profile" : "Browse Doctors"}</span>
                              <ArrowRight className="size-3" />
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Starter Query Chips for Easy Initiation */}
              {messages.length === 1 && (
                <div className="mt-4 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Sparkles className="size-3.5 text-emerald-700" />
                    <span>Popular Questions</span>
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

              {/* Thinking / Loading Indicator */}
              {isSending && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200/60 w-fit px-3 py-2 rounded-full shadow-2xs">
                  <LoaderCircle className="size-3.5 animate-spin text-emerald-700" />
                  <span>Searching doctor database & recommendations…</span>
                </div>
              )}
            </div>
          </div>

          {/* Input Form */}
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

      {/* Floating Trigger Button */}
      <div className="relative flex items-center">
        {/* Subtle tooltip invitation when closed */}
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