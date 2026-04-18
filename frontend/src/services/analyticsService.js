import api from "./api";

export const getMoodAnalytics = () => api.get("/api/analytics/mood");
