import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Runs before every request — attaches the token if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/resumes/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getResumes = () => api.get("/resumes/");

export const deleteResume = (id) => api.delete(`/resumes/${id}`);

export const createAnalysis = (resumeId, jobTitle, jobDescription) =>
  api.post("/analysis/", {
    resume_id: resumeId,
    job_title: jobTitle,
    job_description: jobDescription,
  });

export const getAnalyses = () => api.get("/analysis/");
export const deleteAnalysis = (id) => api.delete(`/analysis/${id}`);  