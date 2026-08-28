const API_BASE_URL = "http://100.88.187.37:8082/api/tasks";

// 전체 조회
export const getTasks = async () => {
  const response = await fetch(API_BASE_URL);

  if (!response.ok) {
    throw new Error(`조회 실패: ${response.status}`);
  }

  return await response.json();
};

// 작업 추가
export const createTask = async (taskData) => {
  console.log("작업 추가 요청:", taskData);

  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  console.log("작업 추가 응답:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("서버 오류:", errorText);
    throw new Error(`작업 추가 실패: ${response.status}`);
  }

  return await response.json();
};

// 상태 변경
export const updateTaskStatus = async (id, status) => {
  const response = await fetch(`${API_BASE_URL}/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`상태 변경 실패: ${response.status}`);
  }

  return await response.json();
};

// 삭제
export const deleteTaskApi = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`삭제 실패: ${response.status}`);
  }
};
