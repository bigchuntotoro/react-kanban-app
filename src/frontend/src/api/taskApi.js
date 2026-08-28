const API_BASE_URL = "http://localhost:8082/api/tasks";

// 전체 작업 목록 조회 (GET)
export const getTasks = async () => {
  const res = await fetch(API_BASE_URL);
  if (!res.ok) throw new Error("작업 목록을 불러오는데 실패했습니다.");
  return res.json();
};

// 작업 상태 변경 (PATCH)
export const updateTaskStatus = async (id, status) => {
  const res = await fetch(`${API_BASE_URL}/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("상태 변경에 실패했습니다.");
  return res.status === 204 ? true : res.json();
};

// 작업 삭제 (DELETE)
export const deleteTaskApi = async (id) => {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("삭제 처리에 실패했습니다.");
  return true;
};

// 작업 생성 (POST)
export const createTask = async (taskData) => {
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });
  if (!res.ok) throw new Error("작업 생성에 실패했습니다.");
  return res.json();
};
