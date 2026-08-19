import React, { useState, useEffect } from "react";
import TaskCard from "./TaskCard";
import FilterBar from "./FilterBar";
import TaskModal from "./TaskModal";
import { taskApi } from "../api/taskApi";

const COLUMNS = [
  {
    id: "TODO",
    title: "할 일",
    subtitle: "To Do",
    icon: "📌",
    accentColor: "bg-amber-500",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200/60",
    columnBg: "bg-slate-100/70 border-slate-200/80",
    dragOverStyle: "ring-2 ring-amber-400/60 border-amber-300 bg-amber-50/40",
  },
  {
    id: "IN_PROGRESS",
    title: "진행 중",
    subtitle: "In Progress",
    icon: "⚡",
    accentColor: "bg-indigo-500",
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200/60",
    columnBg: "bg-indigo-50/30 border-indigo-100/80",
    dragOverStyle:
      "ring-2 ring-indigo-400/60 border-indigo-300 bg-indigo-50/60",
  },
  {
    id: "DONE",
    title: "완료",
    subtitle: "Done",
    icon: "✅",
    accentColor: "bg-emerald-500",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200/60",
    columnBg: "bg-emerald-50/30 border-emerald-100/80",
    dragOverStyle:
      "ring-2 ring-emerald-400/60 border-emerald-300 bg-emerald-50/60",
  },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumnId, setDragOverColumnId] = useState(null); // 드래그 오버 시 시각 효과용

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await taskApi.getAllTasks();
      if (Array.isArray(data)) {
        setTasks(data);
      } else if (data && Array.isArray(data.content)) {
        setTasks(data.content);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Task 목록 조회 실패:", error);
      setTasks([]);
    }
  };

  // 드래그 앤 드롭 이벤트
  const handleDragStart = (e, id) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    if (dragOverColumnId !== colId) {
      setDragOverColumnId(colId);
    }
  };

  const handleDragLeave = (e, colId) => {
    // 컬럼 내부 자식 요소를 지나갈 때 발생하는 dragLeave 방지
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (dragOverColumnId === colId) {
      setDragOverColumnId(null);
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumnId(null);
    if (!draggedTaskId) return;

    // UI 즉시 반영 (낙관적 업데이트)
    setTasks((prev) => {
      const currentList = Array.isArray(prev) ? prev : [];
      return currentList.map((t) =>
        t.id === draggedTaskId ? { ...t, status: targetStatus } : t,
      );
    });

    try {
      await taskApi.updateTaskStatus(draggedTaskId, targetStatus);
    } catch (error) {
      console.error("상태 변경 실패:", error);
      fetchTasks();
    } finally {
      setDraggedTaskId(null);
    }
  };

  // 모달 제어
  const handleOpenCreateModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (formData) => {
    try {
      if (selectedTask) {
        await taskApi.updateTask(selectedTask.id, formData);
      } else {
        await taskApi.createTask(formData);
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (error) {
      console.error("Task 저장 실패:", error);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await taskApi.deleteTask(id);
      setTasks((prev) => {
        const currentList = Array.isArray(prev) ? prev : [];
        return currentList.filter((t) => t.id !== id);
      });
    } catch (error) {
      console.error("Task 삭제 실패:", error);
    }
  };

  // 필터링
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const filteredTasks = safeTasks.filter((t) => {
    if (!t) return false;
    const title = t.title || "";
    const matchesKeyword = title
      .toLowerCase()
      .includes(searchKeyword.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" || t.category === selectedCategory;
    return matchesKeyword && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 antialiased p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 상단 대시보드 헤더 */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Task Workspace
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              스프링 부트 & React 기반 칸반 보드
            </p>
          </div>

          {/* 전체 작업 통계 요약 뱃지 */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-600 flex items-center gap-2">
              <span className="text-slate-400">전체 태스크</span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 font-bold">
                {safeTasks.length}개
              </span>
            </div>
          </div>
        </header>

        {/* 필터 및 검색 바 */}
        <FilterBar
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onOpenCreateModal={handleOpenCreateModal}
        />

        {/* 칸반 보드 컬럼 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter(
              (t) => t.status === col.id,
            );
            const isDraggingOver = dragOverColumnId === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={(e) => handleDragLeave(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`relative p-4 rounded-2xl border transition-all duration-200 flex flex-col min-h-[620px] backdrop-blur-sm ${
                  col.columnBg
                } ${isDraggingOver ? col.dragOverStyle : "shadow-sm"}`}
              >
                {/* 컬럼 상단 Accent Line */}
                <div
                  className={`absolute top-0 left-6 right-6 h-1 rounded-b-full ${col.accentColor}`}
                />

                {/* 컬럼 헤더 */}
                <div className="flex items-center justify-between pt-1 pb-3 mb-3 border-b border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{col.icon}</span>
                    <h2 className="font-bold text-slate-800 text-base">
                      {col.title}
                    </h2>
                    <span className="text-xs text-slate-400 font-normal">
                      ({col.subtitle})
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${col.badgeBg}`}
                  >
                    {columnTasks.length}
                  </span>
                </div>

                {/* 태스크 카드 목록 */}
                <div className="flex-1 space-y-3.5">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDragStart={handleDragStart}
                      onClick={handleOpenEditModal}
                      onDelete={handleDeleteTask}
                    />
                  ))}

                  {/* 작업 미존재 시 Empty State */}
                  {columnTasks.length === 0 && (
                    <div className="h-40 flex flex-col items-center justify-center gap-1.5 text-xs text-slate-400 border-2 border-dashed border-slate-300/60 rounded-xl bg-white/40">
                      <span className="text-lg">📥</span>
                      <p className="font-medium">등록된 작업이 없습니다</p>
                      <p className="text-[11px] text-slate-400/80">
                        카드를 드래그하여 이동해보세요
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 등록/수정 모달 */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSaveTask}
          initialData={selectedTask}
        />
      </div>
    </div>
  );
}
