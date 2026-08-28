import React, { useState, useEffect, useMemo } from "react";
import {
  getTasks,
  updateTaskStatus,
  deleteTaskApi,
  createTask,
} from "../api/taskApi";

const COLUMNS = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "DONE", title: "Done" },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("MEDIUM");
  const [newTaskCategory, setNewTaskCategory] = useState("Dev");

  // 1. 백엔드에서 전체 작업 목록 불러오기
  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error("DB 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. 상태 변경
  const moveTask = async (id, direction) => {
    const targetTask = tasks.find((t) => t.id === id);
    if (!targetTask) return;

    let newStatus = targetTask.status;
    if (direction === "next") {
      newStatus = targetTask.status === "TODO" ? "IN_PROGRESS" : "DONE";
    } else {
      newStatus = targetTask.status === "DONE" ? "IN_PROGRESS" : "TODO";
    }

    // UI 선반영 (Optimistic Update)
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    );

    try {
      await updateTaskStatus(id, newStatus);
    } catch (error) {
      console.error("상태 수정 실패:", error);
      fetchTasks(); // 실패 시 백엔드 데이터로 원복
    }
  };

  // 3. 작업 삭제
  const handleDeleteTask = async (id) => {
    // UI 선반영
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await deleteTaskApi(id);
    } catch (error) {
      console.error("삭제 실패:", error);
      fetchTasks();
    }
  };

  // 4. 작업 추가
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTaskData = {
      title: newTaskTitle,
      status: "TODO",
      priority: newTaskPriority,
      category: newTaskCategory, // DB 필드명 통일
    };

    try {
      await createTask(newTaskData);
      setNewTaskTitle("");
      setNewTaskCategory("Dev");
      setIsAdding(false);
      fetchTasks();
    } catch (error) {
      console.error("추가 실패:", error);
    }
  };

  // 필터링 적용
  const filteredTasks = tasks.filter((task) => {
    const matchesPriority =
      priorityFilter === "All" || task.priority === priorityFilter;
    const matchesSearch = task.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  // KPI 지표 계산
  const metrics = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "DONE").length;
    const completion = total > 0 ? Math.round((done / total) * 100) : 0;
    const highPriority = tasks.filter((t) => t.priority === "HIGH").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;

    return { completion, highPriority, inProgress };
  }, [tasks]);

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "24px",
        fontFamily: "sans-serif",
        color: "#334155",
      }}
    >
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "20px",
          color: "#0f172a",
        }}
      >
        Kanban Task Manager (MariaDB 연동)
      </h1>

      {/* 보드 영역 */}
      <div
        style={{
          backgroundColor: "#f1f5f9",
          padding: "16px",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter(
              (t) => t.status === col.id,
            );

            return (
              <div
                key={col.id}
                style={{
                  backgroundColor: "#e2e8f0",
                  padding: "12px",
                  borderRadius: "12px",
                  minHeight: "360px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                    {col.title}
                  </span>
                  <span
                    style={{
                      backgroundColor: "#475569",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: "bold",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {columnTasks.length}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      style={{
                        backgroundColor: "#fff",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "bold",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor:
                              task.priority === "HIGH"
                                ? "#dbeafe"
                                : task.priority === "MEDIUM"
                                  ? "#dcfce7"
                                  : "#fef3c7",
                            color:
                              task.priority === "HIGH"
                                ? "#2563eb"
                                : task.priority === "MEDIUM"
                                  ? "#16a34a"
                                  : "#d97706",
                          }}
                        >
                          {task.priority}
                        </span>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            color: "#94a3b8",
                          }}
                        >
                          ✕
                        </button>
                      </div>

                      <p
                        style={{
                          fontWeight: "600",
                          fontSize: "13px",
                          margin: "0 0 10px 0",
                          color: "#1e293b",
                        }}
                      >
                        {task.title}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                          #{task.category || task.tag || "General"}
                        </span>
                        <div style={{ display: "flex", gap: "4px" }}>
                          {task.status !== "TODO" && (
                            <button
                              onClick={() => moveTask(task.id, "prev")}
                              style={{
                                padding: "2px 6px",
                                border: "1px solid #cbd5e1",
                                borderRadius: "4px",
                                background: "#fff",
                                cursor: "pointer",
                                fontSize: "11px",
                              }}
                            >
                              ←
                            </button>
                          )}
                          {task.status !== "DONE" && (
                            <button
                              onClick={() => moveTask(task.id, "next")}
                              style={{
                                padding: "2px 6px",
                                border: "1px solid #cbd5e1",
                                borderRadius: "4px",
                                background: "#fff",
                                cursor: "pointer",
                                fontSize: "11px",
                              }}
                            >
                              →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 하단 지표 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "12px 0",
          marginBottom: "24px",
          borderTop: "1px solid #e2e8f0",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "10px",
              fontWeight: "bold",
              color: "#64748b",
              marginBottom: "4px",
            }}
          >
            COMPLETION
          </div>
          <div style={{ fontSize: "18px", fontWeight: "bold" }}>
            {metrics.completion}%
          </div>
        </div>
        <div
          style={{ width: "1px", height: "24px", backgroundColor: "#cbd5e1" }}
        />
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "10px",
              fontWeight: "bold",
              color: "#64748b",
              marginBottom: "4px",
            }}
          >
            HIGH PRIORITY
          </div>
          <div style={{ fontSize: "18px", fontWeight: "bold" }}>
            {metrics.highPriority}
          </div>
        </div>
        <div
          style={{ width: "1px", height: "24px", backgroundColor: "#cbd5e1" }}
        />
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "10px",
              fontWeight: "bold",
              color: "#64748b",
              marginBottom: "4px",
            }}
          >
            IN PROGRESS
          </div>
          <div style={{ fontSize: "18px", fontWeight: "bold" }}>
            {metrics.inProgress}
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "12px", fontWeight: "600", width: "50px" }}>
            Priority
          </label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#f8fafc",
              fontSize: "12px",
            }}
          >
            <option value="All">All</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "12px", fontWeight: "600", width: "50px" }}>
            Search
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#f8fafc",
              fontSize: "12px",
            }}
          />
        </div>
      </div>

      {/* 추가 버튼 및 폼 */}
      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#e2e8f0",
            border: "none",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "600",
            color: "#334155",
            cursor: "pointer",
          }}
        >
          Add Task
        </button>
      ) : (
        <form
          onSubmit={handleAddTask}
          style={{
            backgroundColor: "#f1f5f9",
            padding: "12px",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <input
            type="text"
            placeholder="Task title..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "12px",
            }}
            autoFocus
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              style={{
                padding: "6px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "12px",
              }}
            >
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
            <input
              type="text"
              placeholder="Category"
              value={newTaskCategory}
              onChange={(e) => setNewTaskCategory(e.target.value)}
              style={{
                flex: 1,
                padding: "6px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "12px",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "6px 12px",
                backgroundColor: "#0f172a",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              style={{
                padding: "6px 12px",
                backgroundColor: "#cbd5e1",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
