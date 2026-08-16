"use client";

import Link from "next/link";
import type { StoredRecruitingWorkflow } from "@/features/recruiting-workflow/data/sqlite-recruiting-workflow-repository";
import { buildConversationItems } from "../domain/presentation";
import type { RoleBrief } from "../domain/types";
import { ClarificationTranscript } from "./ClarificationTranscript";

export function RoleBriefOverview({ role, onReopen }: { role: RoleBrief; onReopen?: () => void }) {
  const rows = [
    ["招聘地区", role.location || "待确认"],
    ["工作方式", role.workModel || "待确认"],
    ["职级经验", role.seniority || "待确认"],
    ["业务领域", role.domain || "待确认"],
    ["薪酬范围", role.compensation || "待确认"],
    ["面试流程", role.interviewProcess || "待确认"],
  ];
  const transcript = buildConversationItems(role);

  return (
    <section className="nw-task-card nw-overview-panel">
      <p className="nw-eyebrow">职位简报</p>
      <h2>{role.title}</h2>
      <p className="nw-stage-lead">{role.originalDescription}</p>
      <div className="nw-overview-grid">
        {rows.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <b>{value}</b>
          </div>
        ))}
      </div>
      <div className="nw-overview-block">
        <span>核心要求</span>
        <p>{role.mustHaves.join("、") || "待确认"}</p>
      </div>

      {transcript.length ? (
        <div className="nw-overview-block rh-overview-transcript">
          <span>澄清对话记录</span>
          <ClarificationTranscript items={transcript} />
        </div>
      ) : null}

      <div className="nw-overview-actions">
        {onReopen ? (
          <button className="nw-link-action" type="button" onClick={onReopen}>
            返回查看并修改澄清
          </button>
        ) : null}
        <Link className="nw-link-action" href={`/hire/role/${role.id}`}>
          返回招聘流程
        </Link>
      </div>
    </section>
  );
}

export function InterviewOverview({ role, workflow }: { role: RoleBrief; workflow: StoredRecruitingWorkflow | null }) {
  const interview = workflow?.state.interview;
  return (
    <section className="nw-task-card nw-overview-panel">
      <p className="nw-eyebrow">面试安排</p>
      <h2>{role.title} · 面试日历</h2>
      {interview ? (
        <div className="nw-interview-record">
          <span>模拟排期已确认</span>
          <b>{new Date(interview.startsAt).toLocaleString("zh-CN")}</b>
          <p>候选人编号：{interview.candidateId}</p>
        </div>
      ) : (
        <div className="nw-empty-state">
          <b>暂时没有面试安排</b>
          <p>完成候选人审批和模拟回复后，可在招聘流程中创建模拟排期。</p>
        </div>
      )}
      <Link className="nw-link-action" href={`/hire/role/${role.id}`}>
        前往招聘流程
      </Link>
    </section>
  );
}
