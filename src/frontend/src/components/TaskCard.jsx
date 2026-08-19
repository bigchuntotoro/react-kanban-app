import React from "react";

export default function TaskCard({ task, onDragStart, onClick, onDelete }) {
  const handleCardClick = (e) => {
    // 삭제 버튼 클릭 시 모달이 뜨지 않도록 이벤트 전파 중지
    if (e.target.tagName === "BUTTON") return;
    onClick(task);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={handleCardClick}
      className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition cursor-grab active:cursor-grabbing group relative"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-slate-800 break-all leading-snug">
          {task.title}
        </h3>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 text-xs transition px-1"
          title="삭제"
        >
          ✕
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
        {task.category ? (
          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium">
            {task.category}
          </span>
        ) : (
          <span />
        )}
        <span>{task.createdAt ? task.createdAt.substring(0, 10) : ""}</span>
      </div>
    </div>
  );
}
