"use client";

import { useEffect, useState } from "react";
import { feedbackService } from "@/lib/services/feedbackService";
import { Feedback } from "@/lib/types";

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState("");

  useEffect(() => {
    setFeedbacks(feedbackService.getFeedback());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    feedbackService.addFeedback(message.trim());
    setFeedbacks(feedbackService.getFeedback());
    setMessage("");
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editMessage.trim()) return;
    feedbackService.updateFeedback(editingId, editMessage.trim());
    setFeedbacks(feedbackService.getFeedback());
    setEditingId(null);
  };

  const toggleStatus = (id: string, currentStatus: "open" | "done") => {
    feedbackService.updateStatus(id, currentStatus === "open" ? "done" : "open");
    setFeedbacks(feedbackService.getFeedback());
  };

  const handleDelete = (id: string) => {
    feedbackService.deleteFeedback(id);
    setFeedbacks(feedbackService.getFeedback());
  };

  return (
    <div>
      {/* Header with inline form */}
      <div className="px-6 md:px-[90px] py-8 md:py-10">
        <div className="flex flex-col md:grid md:grid-cols-7 md:items-baseline gap-6 md:gap-4">
          <div className="md:col-span-2">
            <h2 className="text-2xl md:text-3xl font-light tracking-tight">Feedback</h2>
          </div>
          <form onSubmit={handleSubmit} className="md:col-span-5 flex flex-col sm:flex-row md:items-baseline gap-4">
            <input
              type="text"
              placeholder="Neues Feedback..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-transparent text-xl md:text-2xl font-light text-muted placeholder-muted/50 outline-none flex-1 min-w-0"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="border border-foreground px-6 py-3 md:px-4 md:py-1.5 text-sm hover:bg-foreground hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
            >
              + senden
            </button>
          </form>
        </div>
      </div>

      {/* Feedback list */}
      <div>
        {feedbacks.length === 0 ? (
          <>
            <div className="border-t border-border" />
            <div className="px-6 md:px-[90px] py-6">
              <p className="text-muted text-sm">Kein Feedback vorhanden.</p>
            </div>
          </>
        ) : (
          <>
            {feedbacks.map((item) => (
              <div key={item.id} className="border-t border-border">
                <div
                  className={`px-6 md:px-[90px] py-6 md:py-4 flex flex-col md:grid md:grid-cols-7 md:items-baseline gap-4 ${
                    item.status === "done" ? "opacity-40" : ""
                  }`}
                >
                  {editingId === item.id ? (
                    <form onSubmit={handleUpdate} className="md:col-span-7 flex flex-col md:flex-row md:items-baseline gap-4">
                      <input
                        type="text"
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        className="bg-transparent border-b border-border pb-1 text-sm outline-none flex-1"
                        autoFocus
                      />
                      <div className="flex gap-6 mt-2 md:mt-0">
                        <button type="submit" className="text-sm text-foreground font-bold hover:underline">
                          speichern
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-sm text-muted hover:text-foreground"
                        >
                          abbrechen
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {/* Message – cols 1-4 */}
                      <div className={`md:col-span-4 text-sm ${item.status === "done" ? "line-through" : ""}`}>
                        {item.message}
                      </div>

                      {/* Status – col 5 */}
                      <div className="text-xs text-muted md:col-span-1">
                        {item.status === "done" ? "erledigt" : "offen"}
                      </div>

                      {/* Actions – cols 6-7 */}
                      <div className="flex flex-wrap items-baseline gap-6 md:col-span-2 md:justify-end">
                        <button
                          onClick={() => toggleStatus(item.id, item.status)}
                          className="text-sm text-muted hover:text-foreground transition-colors"
                        >
                          {item.status === "open" ? "erledigt" : "öffnen"}
                        </button>
                        {item.status === "open" && (
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setEditMessage(item.message);
                            }}
                            className="text-sm text-muted hover:text-foreground transition-colors"
                          >
                            bearbeiten
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-sm text-muted hover:text-foreground transition-colors"
                        >
                          löschen
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            <div className="border-t border-border" />
          </>
        )}
      </div>
    </div>
  );
}
