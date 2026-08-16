export function AgentTransition({ children }: { children: string }) {
  return (
    <div className="rh-agent-transition">
      <div className="rh-agent-transition-label">
        <span>思考过程</span>
        <i aria-hidden="true" />
      </div>
      <p>{children}</p>
    </div>
  );
}
