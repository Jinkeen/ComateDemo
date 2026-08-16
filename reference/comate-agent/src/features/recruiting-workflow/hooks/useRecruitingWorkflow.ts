"use client";

import { useCallback, useEffect, useState } from "react";
import type { CandidateMatch } from "@/features/candidates/domain/types";
import type { StoredRecruitingWorkflow } from "../data/sqlite-recruiting-workflow-repository";

async function parseWorkflow(response: Response): Promise<StoredRecruitingWorkflow> {
  const body = await response.json() as StoredRecruitingWorkflow | { message?: string };
  if (!response.ok) throw new Error("message" in body ? body.message || "招聘流程操作失败。" : "招聘流程操作失败。");
  return body as StoredRecruitingWorkflow;
}

export function useRecruitingWorkflow(roleId: string, initial: StoredRecruitingWorkflow | null) {
  const [workflow, setWorkflow] = useState(initial);
  const [candidates, setCandidates] = useState<CandidateMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const workflowRoleId = workflow?.state.roleId;

  const load = useCallback(async () => {
    try {
      setWorkflow(await parseWorkflow(await fetch(`/api/roles/${roleId}/workflow`, { cache: "no-store" })));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "无法加载招聘流程。");
    }
  }, [roleId]);

  useEffect(() => {
    if (!workflow) void load();
  }, [load, workflow]);

  useEffect(() => {
    if (!workflowRoleId) return;
    let cancelled = false;
    void fetch(`/api/roles/${roleId}/candidates?pageSize=100`, { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json() as { items?: CandidateMatch[]; message?: string };
        if (!response.ok) throw new Error(body.message || "无法加载虚拟候选人。");
        if (!cancelled) setCandidates(body.items ?? []);
      })
      .catch((caught) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "无法加载虚拟候选人。");
      });
    return () => { cancelled = true; };
  }, [roleId, workflowRoleId]);

  const mutate = useCallback(async (action: Record<string, unknown>) => {
    if (!workflow || isPending) return;
    setIsPending(true);
    try {
      const next = await parseWorkflow(await fetch(`/api/roles/${roleId}/workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...action, expectedVersion: workflow.version }),
      }));
      setWorkflow(next);
      setError(null);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "招聘流程操作失败。";
      setError(message);
      if (message.includes("刷新")) await load();
    } finally {
      setIsPending(false);
    }
  }, [isPending, load, roleId, workflow]);

  return { workflow, candidates, error, isPending, mutate };
}
