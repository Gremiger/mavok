"use client";

export function DeathSaves({
  successes,
  failures,
  onChange,
  onRegainConsciousness,
}: {
  successes: number;
  failures: number;
  onChange: (successes: number, failures: number) => void;
  onRegainConsciousness: () => void;
}) {
  const isStable = successes >= 3;
  const isDead = failures >= 3;

  return (
    <div className="bg-danger/10 border border-danger/30 rounded-lg p-3">
      <h3 className="font-heading text-danger text-center text-sm mb-3">
        Salvaciones de muerte
      </h3>
      {(isStable || isDead) && (
        <p
          className={`text-center text-xs font-heading mb-2 ${
            isDead ? "text-danger" : "text-success"
          }`}
        >
          {isDead ? "Muerto" : "Estable"}
        </p>
      )}
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
      <div className="flex flex-wrap justify-center gap-1.5 mt-3">
        <button
          onClick={() => onChange(successes, Math.min(3, failures + 2))}
          className="text-xs px-2 py-0.5 border border-border rounded hover:border-accent hover:text-accent"
        >
          Rodé 1
        </button>
        <button
          onClick={onRegainConsciousness}
          className="text-xs px-2 py-0.5 border border-border rounded hover:border-accent hover:text-accent"
        >
          Rodé 20
        </button>
        <button
          onClick={() => onChange(successes, Math.min(3, failures + 1))}
          className="text-xs px-2 py-0.5 border border-border rounded hover:border-accent hover:text-accent"
        >
          Recibí daño
        </button>
        <button
          onClick={() => onChange(successes, Math.min(3, failures + 2))}
          className="text-xs px-2 py-0.5 border border-border rounded hover:border-accent hover:text-accent"
        >
          Golpe crítico
        </button>
      </div>
      <p className="text-muted/60 text-[0.6rem] mt-2 text-center leading-relaxed">
        Si el daño recibido iguala o supera tu HP máximo, mueres al instante. Estable:
        no hace más salvaciones, sigue Unconscious, recupera 1 HP tras 1d4 horas si no
        es curado antes.
      </p>
    </div>
  );
}
