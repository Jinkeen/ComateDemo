"use client";

import { ArrowUp } from "lucide-react";
import { useState, type FormEvent } from "react";

interface ClarificationComposerProps {
  disabled?: boolean;
  onSubmit?: (value: string) => void;
}

export function ClarificationComposer({ disabled = false, onSubmit }: ClarificationComposerProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit?.(trimmed);
    setValue("");
  }

  return (
    <div className="rh-clarification-composer-shell">
      <div className="rh-clarification-composer-track">
        <form
          className="rh-clarification-composer"
          onSubmit={handleSubmit}
        >
        <input
          aria-label="补充筛选资料"
          disabled={disabled}
          name="supplement"
          onChange={(event) => setValue(event.target.value)}
          placeholder="请补充足够的资料以帮助筛选候选人"
          type="text"
          value={value}
        />
        <button
          aria-label="发送补充资料"
          disabled={disabled || !value.trim()}
          type="submit"
        >
          <ArrowUp aria-hidden="true" size={18} strokeWidth={2.2} />
        </button>
        </form>
      </div>
    </div>
  );
}
