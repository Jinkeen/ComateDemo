"use client";

import { resolveSearchNarrative } from "../domain/presentation";
import type { QuestionId, RoleBrief } from "../domain/types";

interface RoleBriefSummaryCardProps {
  role: RoleBrief;
  isSubmitting?: boolean;
  onBack: () => void;
  onConfirm: () => void;
  onEdit: (questionId: QuestionId) => void;
}

export function RoleBriefSummaryCard({
  role,
  isSubmitting = false,
  onBack,
  onConfirm,
}: RoleBriefSummaryCardProps) {
  const confirmed = role.lifecycleState === "confirmed";
  const narrative = resolveSearchNarrative(role);

  return (
    <article aria-labelledby="search-ready-title" className="rh-search-ready">
      <h1 id="search-ready-title">准备搜索</h1>
      <p>
        {narrative}
        如需调整，可
        <button className="rh-search-ready-edit" disabled={isSubmitting} onClick={onBack} type="button">
          返回修改
        </button>
        。
      </p>
      <button
        className="rh-search-ready-start"
        disabled={isSubmitting || confirmed}
        onClick={onConfirm}
        type="button"
      >
        {isSubmitting ? "搜索中…" : confirmed ? "已开始搜索" : "开始搜索"}
      </button>
    </article>
  );
}
