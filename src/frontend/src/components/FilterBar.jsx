import React from "react";

export default function FilterBar({
  searchKeyword,
  setSearchKeyword,
  selectedCategory,
  setSelectedCategory,
  onOpenCreateModal,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      {/* 검색 및 필터 */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <input
          type="text"
          placeholder="제목 검색..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-60"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">전체 카테고리</option>
          <option value="FE">Frontend</option>
          <option value="BE">Backend</option>
          <option value="DEVOPS">DevOps</option>
          <option value="DESIGN">Design</option>
        </select>
      </div>

      {/* 새 작업 추가 버튼 */}
      <button
        onClick={onOpenCreateModal}
        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm flex items-center justify-center gap-1.5"
      >
        <span>+</span> 새 작업 추가
      </button>
    </div>
  );
}
