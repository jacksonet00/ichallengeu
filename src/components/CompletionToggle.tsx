interface CompletionToggleProps {
  completed: boolean;
  onToggle: () => void;
}

export default function CompletionToggle({
  completed,
  onToggle,
}: CompletionToggleProps) {

  return (
    <div onClick={onToggle}>
      {completed ? <h1>✅</h1> : <h1>❌</h1>}
    </div>
  );
}