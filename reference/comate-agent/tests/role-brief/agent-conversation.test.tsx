import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentConversation } from "@/features/role-brief/components/AgentConversation";
import { getQuestion } from "@/features/role-brief/domain/questions";
import { answerQuestion, createRoleDraft, revisitQuestion } from "@/features/role-brief/domain/workflow";

afterEach(cleanup);

describe("选项式 Agent 澄清界面", () => {
  it("将已回答内容投影为 Q/A，并呈现下一道选项题", () => {
    const draft = createRoleDraft("招聘一位 AI 产品经理，负责大模型产品从 0 到 1 落地");
    const role = answerQuestion(draft, "location", "远程优先");

    const onAnswer = vi.fn();

    render(
      <AgentConversation
        roleId={role.id}
        role={role}
        question={getQuestion("workModel")}
        onAnswer={onAnswer}
        onSkip={() => undefined}
        onPrevious={() => undefined}
        onRevisit={() => undefined}
      />,
    );

    expect(screen.getByText("职位原始需求")).toBeInTheDocument();
    expect(screen.getByText("这个职位主要在哪个地区招聘？")).toBeInTheDocument();
    expect(screen.getByText("远程优先")).toBeInTheDocument();
    expect(screen.getByText("先确认地点和工作方式，这两项会直接决定能搜到哪些人。")).toBeInTheDocument();
    expect(screen.queryByText("地点已确认为远程优先。接下来确认工作方式：")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "希望候选人采用哪种工作方式？" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "混合办公 2" }));
    expect(onAnswer).toHaveBeenCalledWith("workModel", "混合办公");
  });

  it("每类第一题显示阶段开场，并忽略模型旁白", () => {
    const role = createRoleDraft("招聘一位 AI 产品经理，负责大模型产品从 0 到 1 落地");

    render(
      <AgentConversation
        roleId={role.id}
        role={role}
        question={getQuestion("location")}
        agentSummary="地点确认后可以缩小初步候选池。"
        onAnswer={() => undefined}
        onSkip={() => undefined}
        onPrevious={() => undefined}
        onRevisit={() => undefined}
      />,
    );

    expect(screen.getByText("思考过程")).toBeInTheDocument();
    expect(screen.getByText("先确认地点和工作方式，这两项会直接决定能搜到哪些人。")).toBeInTheDocument();
    expect(screen.queryByText("地点确认后可以缩小初步候选池。")).not.toBeInTheDocument();
  });

  it("回看已答题时显示回看句，不重播类开场", () => {
    let role = createRoleDraft("招聘一位 AI 产品经理，负责大模型产品从 0 到 1 落地");
    role = answerQuestion(role, "location", "远程优先");
    role = revisitQuestion(role, "location");

    render(
      <AgentConversation
        roleId={role.id}
        role={role}
        question={getQuestion("location")}
        onAnswer={() => undefined}
        onSkip={() => undefined}
        onPrevious={() => undefined}
        onRevisit={() => undefined}
      />,
    );

    expect(screen.getByText("正在回看「地点」，可直接修改后继续。")).toBeInTheDocument();
    expect(screen.queryByText("先确认地点和工作方式，这两项会直接决定能搜到哪些人。")).not.toBeInTheDocument();
  });

  it("进入下一类时保留上一类开场，并在当前题前显示新开场", () => {
    let role = createRoleDraft("招聘一位 AI 产品经理，负责大模型产品从 0 到 1 落地");
    role = answerQuestion(role, "location", "远程优先");
    role = answerQuestion(role, "workModel", "混合办公");

    render(
      <AgentConversation
        roleId={role.id}
        role={role}
        question={getQuestion("seniority")}
        onAnswer={() => undefined}
        onSkip={() => undefined}
        onPrevious={() => undefined}
        onRevisit={() => undefined}
      />,
    );

    expect(screen.getByText("先确认地点和工作方式，这两项会直接决定能搜到哪些人。")).toBeInTheDocument();
    expect(screen.getByText("岗位安排已记下。接下来确认职级、能力和背景，用来收紧人选范围。")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "你希望候选人处于什么职级？" })).toBeInTheDocument();
    const arrangementCard = screen.getByRole("article", { name: "岗位安排已确认回答" });
    expect(arrangementCard).toContainElement(screen.getByText("这个职位主要在哪个地区招聘？"));
    expect(arrangementCard).toContainElement(screen.getByText("希望候选人采用哪种工作方式？"));
  });

  it("职位确认后在摘要下方展示候选人推荐", () => {
    const draft = createRoleDraft("招聘一位 AI 产品经理，负责大模型产品从 0 到 1 落地");
    const role = {
      ...draft,
      lifecycleState: "confirmed" as const,
      activeQuestionId: null,
    };

    render(
      <AgentConversation
        roleId={role.id}
        role={role}
        question={null}
        onAnswer={() => undefined}
        onSkip={() => undefined}
        onPrevious={() => undefined}
        onRevisit={() => undefined}
      />,
    );

    const summary = screen.getByRole("heading", { name: "准备搜索" });
    const thinking = screen.getByText("检索已完成。接下来对照岗位要求与候选人画像，把匹配度最高的几位放在前面。");
    const recommendations = screen.getByRole("heading", { name: "推荐候选人" });
    expect(thinking.closest(".rh-agent-transition")).toHaveTextContent("思考过程");
    expect(summary.compareDocumentPosition(thinking) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(thinking.compareDocumentPosition(recommendations) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("样本判断完成后在思考过程后展示全部候选人操作卡", () => {
    const draft = createRoleDraft("招聘一位 AI 产品经理，负责大模型产品从 0 到 1 落地");
    const role = {
      ...draft,
      lifecycleState: "confirmed" as const,
      activeQuestionId: null,
    };

    render(
      <AgentConversation
        roleId={role.id}
        role={role}
        question={null}
        calibrationFeedback={[
          { verdict: "good_fit", evidence: "更看重 B 端产品经验" },
          { verdict: "maybe", evidence: "传播能力强但交付证据不足" },
          { verdict: "not_a_fit", evidence: "工程背景偏重，产品判断不够" },
        ]}
        onAnswer={() => undefined}
        onSkip={() => undefined}
        onPrevious={() => undefined}
        onRevisit={() => undefined}
      />,
    );

    const thinking = screen.getByText(
      "已根据你补充的判断原因，提取出后续筛选偏好：更看重「B 端产品经验」，需核实「传播能力强但交付证据不足」，降低「工程背景偏重，产品判断不够」。接下来按更新后的条件再次筛选候选人。",
    );
    const actionCard = screen.getByRole("region", { name: "全部候选人" });
    const action = screen.getByRole("link", { name: "全部候选人" });
    expect(thinking.closest(".rh-agent-transition")).toHaveTextContent("思考过程");
    expect(actionCard).toHaveTextContent("根据最新要求，已找到 284 位候选人。");
    expect(thinking.compareDocumentPosition(actionCard) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(action).toHaveAttribute("href", `/hire/role/${role.id}?view=screening&mode=all`);
    expect(screen.getAllByRole("heading", { name: "推荐候选人" })).toHaveLength(1);
  });
});
