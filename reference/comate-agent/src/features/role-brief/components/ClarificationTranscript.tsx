import type { ConversationItem, ConversationTurn } from "../domain/presentation";
import { categoryLabels } from "../domain/questions";
import type { QuestionId } from "../domain/types";
import { AgentTransition } from "./AgentTransition";

function TurnRow({
  activeQuestionId,
  onRevisit,
  turn,
}: {
  activeQuestionId?: QuestionId | null;
  onRevisit?: (questionId: QuestionId) => void;
  turn: ConversationTurn;
}) {
  const isActive = activeQuestionId === turn.questionId;
  const content = (
    <>
      <p className="rh-turn-q">
        <span>Q:</span>
        {turn.question}
      </p>
      <p className="rh-turn-a">
        <span>A:</span>
        {turn.answer}
      </p>
    </>
  );

  if (!onRevisit) {
    return <div className="rh-turn-row">{content}</div>;
  }

  return (
    <button
      aria-current={isActive ? "step" : undefined}
      className={`rh-turn-row${isActive ? " is-active" : ""}`}
      onClick={() => onRevisit(turn.questionId)}
      title="点击返回查看或修改这一步"
      type="button"
    >
      {content}
    </button>
  );
}

export function ClarificationTranscript({
  items,
  activeQuestionId,
  onRevisit,
}: {
  items: ConversationItem[];
  activeQuestionId?: QuestionId | null;
  onRevisit?: (questionId: QuestionId) => void;
}) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="rh-transcript" aria-label="已确认的职位澄清对话">
      {items.map((item) => {
        if (item.kind === "transition") {
          return <AgentTransition key={`transition-${item.category}`}>{item.text}</AgentTransition>;
        }

        return (
          <article
            aria-label={`${categoryLabels[item.category]}已确认回答`}
            className="rh-turn-group"
            key={`group-${item.category}`}
          >
            {item.turns.map((turn) => (
              <TurnRow
                activeQuestionId={activeQuestionId}
                key={turn.questionId}
                turn={turn}
                onRevisit={onRevisit}
              />
            ))}
          </article>
        );
      })}
    </section>
  );
}
