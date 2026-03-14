import api from "./api";

export const applyJob = async (data: any) => {
  const response = await api.post("/apply-job", data);
  return response.data;
};

export const getPipeline = async () => {
  const response = await api.get("/ats-pipeline");
  return response.data;
};

export const updateStatus = async (id: number, status: string) => {
  const response = await api.put(`/update-status/${id}`, { status });
  return response.data;
};