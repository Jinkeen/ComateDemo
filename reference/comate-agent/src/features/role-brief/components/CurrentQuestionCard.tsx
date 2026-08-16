"use client";

import { ArrowRight, ChevronLeft, PencilLine } from "lucide-react";
import type { FormEvent } from "react";
import type { AnswerSource, ClarificationQuestion, QuestionId, RoleBrief } from "../domain/types";

interface CurrentQuestionCardProps {
  role: RoleBrief;
  question: ClarificationQuestion;
  existingAnswer?: string;
  onAnswer: (questionId: QuestionId, value: string, source?: AnswerSource) => void;
  onSkip: () => void;
  onPrevious: () => void;
}

function submitValues(event: FormEvent<HTMLFormElement>, submit: (value: string, source: AnswerSource) => void) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const selectedValues = formData.getAll("value").map(String).map((value) => value.trim()).filter(Boolean);
  const customValue = String(formData.get("customValue") || "").trim();
  const values = customValue ? [...selectedValues, customValue] : selectedValues;

  if (!values.length) {
    return;
  }

  submit(values.join("、"), customValue && selectedValues.length === 0 ? "custom" : "option");
  event.currentTarget.reset();
}

function selectedOptions(existingAnswer: string, options: string[]): string[] {
  if (!existingAnswer) return [];
  const parts = existingAnswer.split(/[,，、\n]/).map((item) => item.trim()).filter(Boolean);
  return options.filter((option) => parts.includes(option));
}

export function CurrentQuestionCard({
  role,
  question,
  existingAnswer = "",
  onAnswer,
  onSkip,
  onPrevious,
}: CurrentQuestionCardProps) {
  const answeredIndex = role.answers.findIndex((item) => item.questionId === question.id);
  const questionNumber = answeredIndex >= 0 ? answeredIndex + 1 : Math.max(1, role.answers.length + 1);
  const canGoPrevious = question.id !== "location";
  const selected = selectedOptions(existingAnswer, question.options);
  const customRemainder = existingAnswer
    .split(/[,，、\n]/)
    .map((item) => item.trim())
    .filter((item) => item && !question.options.includes(item))
    .join("、");

  return (
    <section className="rh-question-card" aria-labelledby="current-question-title">
      <div className="rh-question-card-heading">
        <span>第 {questionNumber} 题</span>
        <span>{question.required ? "必填" : "可跳过"}</span>
      </div>
      <h1 id="current-question-title">{question.prompt}</h1>
      {question.helperText ? <p className="rh-question-helper">{question.helperText}</p> : null}
      {existingAnswer ? <p className="rh-question-helper">当前已填：{existingAnswer}</p> : null}

      {question.allowsMultiple ? (
        <form className="rh-choice-form" onSubmit={(event) => submitValues(event, (value, source) => onAnswer(question.id, value, source))}>
          <fieldset>
            <legend>可选择多个选项</legend>
            {question.options.map((option) => (
              <label className="rh-choice rh-choice-multiple" key={option}>
                <input defaultChecked={selected.includes(option)} name="value" type="checkbox" value={option} />
                <span>{option}</span>
              </label>
            ))}
          </fieldset>
          <label className="rh-custom-field">
            <PencilLine size={15} />
            <input defaultValue={customRemainder} name="customValue" placeholder="补充未列出的要求" />
          </label>
          <button className="rh-primary-button" type="submit">
            {existingAnswer ? "更新并继续" : "保存并继续"} <ArrowRight size={16} />
          </button>
        </form>
      ) : question.options.length ? (
        <div className="rh-choice-stack">
          {question.options.map((option, index) => (
            <button
              className={`rh-choice${existingAnswer === option ? " is-selected" : ""}`}
              key={option}
              type="button"
              onClick={() => onAnswer(question.id, option)}
            >
              <span className="rh-choice-radio" aria-hidden="true" />
              <span>{option}</span>
              <small className="rh-choice-key">{index + 1}</small>
            </button>
          ))}
          <form className="rh-custom-field" onSubmit={(event) => submitValues(event, (value) => onAnswer(question.id, value, "custom"))}>
            <PencilLine size={15} />
            <input
              defaultValue={question.options.includes(existingAnswer) ? "" : existingAnswer}
              name="customValue"
              placeholder="添加你自己的要求"
            />
            <button type="submit">提交</button>
          </form>
        </div>
      ) : (
        <form className="rh-freeform" onSubmit={(event) => submitValues(event, (value) => onAnswer(question.id, value, "custom"))}>
          <textarea defaultValue={existingAnswer} name="customValue" placeholder="输入你的回答" required />
          <button className="rh-primary-button" type="submit">
            {existingAnswer ? "更新并继续" : "继续"} <ArrowRight size={16} />
          </button>
        </form>
      )}

      <div className="rh-question-actions">
        <button disabled={!canGoPrevious} type="button" onClick={onPrevious}>
          <ChevronLeft size={15} />上一步
        </button>
        {!question.required ? (
          <button className="rh-skip-action" type="button" onClick={onSkip}>
            暂时跳过
          </button>
        ) : null}
      </div>
    </section>
  );
}
