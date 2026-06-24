"use client";

export function DeathSaves({
  successes,
  failures,
  onChange,
}: {
  successes: number;
  failures: number;
  onChange: (successes: number, failures: number) => void;
}) {
  return (
    <div className="bg-danger/10 border border-danger/30 rounded-lg p-3">
      <h3 className="font-heading text-danger text-center text-sm mb-3">
        Salvaciones de muerte
      </h3>
      <div className="flex justify-around">
        <div className="text-center">
          <div className="text-xs text-muted mb-1">Éxitos</div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => onChange(i < successes ? i : i + 1, failures)}
                className={`w-6 h-6 rounded-full border-2 transition-colors ${
                  i < successes
                    ? "bg-success border-success"
                    : "border-muted"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted mb-1">Fallos</div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => onChange(successes, i < failures ? i : i + 1)}
                className={`w-6 h-6 rounded-full border-2 transition-colors ${
                  i < failures
                    ? "bg-danger border-danger"
                    : "border-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
