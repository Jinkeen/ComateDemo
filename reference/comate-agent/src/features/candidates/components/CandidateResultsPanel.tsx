"use client";

import { useEffect, useState } from "react";
import type { CandidateMatch } from "../domain/types";

interface CandidateResultsPanelProps { roleId: string; }

export function CandidateResultsPanel({ roleId }: CandidateResultsPanelProps) {
  const [candidates, setCandidates] = useState<CandidateMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/api/roles/${roleId}/candidates`)
      .then(async (response) => ({ response, body: await response.json() as { candidates?: CandidateMatch[]; message?: string } }))
      .then(({ response, body }) => {
        if (!active) return;
        if (!response.ok) throw new Error(body.message || "无法检索候选人。");
        setCandidates(body.candidates || []);
      })
      .catch((caught: unknown) => { if (active) setError(caught instanceof Error ? caught.message : "无法检索候选人。"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [roleId]);

  if (loading) return <section className="rh-candidate-results"><p>正在检索本地虚构简历库…</p></section>;
  if (error) return <section className="rh-candidate-results"><p>{error}</p></section>;
  return <section className="rh-candidate-results" aria-label="候选人搜索结果"><header><p>本地虚构简历库</p><h2>匹配候选人</h2><span>{candidates.length} 位候选人</span></header><div className="rh-candidate-list">{candidates.map((match) => <article key={match.candidate.id}><div><b>{match.candidate.name}</b><span>{match.candidate.title} · {match.candidate.location}</span></div><strong>{match.score} 分</strong><p>{match.reasons.join("；") || "符合基础条件"}</p>{match.gaps.length ? <small>待确认：{match.gaps.join("；")}</small> : null}</article>)}</div></section>;
}
