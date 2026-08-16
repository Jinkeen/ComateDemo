"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { allResumeCandidateCount } from "@/features/candidates/data/seed-candidates";

interface RecalibrationActionCardProps {
  roleId: string;
}

export function RecalibrationActionCard({ roleId }: RecalibrationActionCardProps) {
  return (
    <section aria-label="全部候选人" className="recalibration-action-card">
      <div className="recalibration-action-copy">
        <span aria-hidden="true">
          <Users size={20} strokeWidth={1.8} />
        </span>
        <p>根据最新要求，已找到 {allResumeCandidateCount} 位候选人。</p>
      </div>
      <Link
        className="recalibration-action-button"
        href={`/hire/role/${roleId}?view=screening&mode=all`}
      >
        全部候选人
      </Link>
    </section>
  );
}
