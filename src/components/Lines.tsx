// Renders text that uses <br> for line breaks, without injecting HTML.
export default function Lines({ text }: { text: string }) {
  const parts = text.split(/<br\s*\/?>/i);
  return <>{parts.map((p, i) => <span key={i}>{i > 0 && <br />}{p}</span>)}</>;
}
