import { Feedback, FeedbackStatus } from "../types";

const FEEDBACK_KEY = "ast_feedback";

export const feedbackService = {
  getFeedback: (): Feedback[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(FEEDBACK_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  addFeedback: (message: string): Feedback => {
    const feedbackList = feedbackService.getFeedback();
    const newFeedback: Feedback = {
      id: crypto.randomUUID(),
      message,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newFeedback, ...feedbackList];
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(updated));
    return newFeedback;
  },

  updateFeedback: (id: string, message: string): Feedback | null => {
    const feedbackList = feedbackService.getFeedback();
    const index = feedbackList.findIndex((f) => f.id === id);
    if (index === -1) return null;

    const updatedFeedback = {
      ...feedbackList[index],
      message,
      updatedAt: new Date().toISOString(),
    };
    feedbackList[index] = updatedFeedback;
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbackList));
    return updatedFeedback;
  },

  updateStatus: (id: string, status: FeedbackStatus): Feedback | null => {
    const feedbackList = feedbackService.getFeedback();
    const index = feedbackList.findIndex((f) => f.id === id);
    if (index === -1) return null;

    const updatedFeedback = {
      ...feedbackList[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    feedbackList[index] = updatedFeedback;
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbackList));
    return updatedFeedback;
  },

  deleteFeedback: (id: string): void => {
    const feedbackList = feedbackService.getFeedback();
    const updated = feedbackList.filter((f) => f.id !== id);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(updated));
  },
};
