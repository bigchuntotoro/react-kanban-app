import axios from "axios";

// Vite 프록시 또는 Spring Boot 서버 주소
const API_BASE_URL = "http://localhost:8080/api/tasks";

export const taskApi = {
  // 전체 목록 조회
  getAllTasks: async () => {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  },

  // Task 단건 생성
  createTask: async (taskData) => {
    const response = await axios.post(API_BASE_URL, taskData);
    return response.data;
  },

  // Task 수정 (전체/상세 수정)
  updateTask: async (id, taskData) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, taskData);
    return response.data;
  },

  // Task 상태 및 순서 변경 (드래그 앤 드롭 전용)
  updateTaskStatus: async (id, status, displayOrder = 0) => {
    const response = await axios.patch(`${API_BASE_URL}/${id}/status`, {
      status,
      displayOrder,
    });
    return response.data;
  },

  // Task 삭제
  deleteTask: async (id) => {
    await axios.delete(`${API_BASE_URL}/${id}`);
  },
};
