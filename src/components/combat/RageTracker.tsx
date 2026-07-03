"use client";

import { motion, AnimatePresence } from "framer-motion";

interface RageTrackerProps {
  slots: boolean[];
  active: boolean;
  onToggleSlot: (index: number) => void;
  onToggleActive: () => void;
}

// Deterministic pseudo-random in [0, 1) from a seed — pure and idempotent,
// unlike Math.random(), so it satisfies react-hooks/purity when called
// during render. Visually indistinguishable for decorative particles.
function seeded(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function Ember({ delay, index }: { delay: number; index: number }) {
  const xMid = (seeded(index * 2 + 1) - 0.5) * 30;
  const xEnd = (seeded(index * 2 + 2) - 0.5) * 40;
  const repeatDelay = seeded(index * 3 + 1) * 2;
  const left = 30 + seeded(index * 5 + 1) * 40;
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-orange-400"
      initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, -20, -40, -55],
        x: [0, xMid, xEnd],
        scale: [0, 1.5, 1, 0],
      }}
      transition={{
        duration: 1.8,
        delay,
        repeat: Infinity,
        repeatDelay,
        ease: "easeOut",
      }}
      style={{
        left: `${left}%`,
        bottom: "10%",
        filter: "blur(0.5px)",
      }}
    />
  );
}

export function RageTracker({
  slots,
  active,
  onToggleSlot,
  onToggleActive,
}: RageTrackerProps) {
  const remaining = slots.filter(Boolean).length;
  const canActivate = !active && remaining > 0;

  return (
    <div className="relative mt-3">
      {/* Ember particles when raging */}
      <AnimatePresence>
        {active && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <Ember key={i} delay={i * 0.25} index={i} />
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative rounded-xl p-3 overflow-hidden"
        animate={
          active
            ? {
                backgroundColor: [
                  "rgba(139,45,45,0.08)",
                  "rgba(180,50,30,0.15)",
                  "rgba(139,45,45,0.08)",
                ],
              }
            : { backgroundColor: "rgba(0,0,0,0)" }
        }
        transition={
          active
            ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3 }
        }
      >
        {/* Background glow when active */}
        <AnimatePresence>
          {active && (
            <motion.div
              className="absolute inset-0 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                background:
                  "radial-gradient(ellipse at center bottom, rgba(180,50,30,0.25) 0%, transparent 70%)",
              }}
            />
          )}
        </AnimatePresence>

        <div className="relative flex items-center justify-center gap-3">
          {/* Rage slots */}
          <div className="flex gap-2">
            {slots.map((available, i) => {
              const isUsed = !available;
              return (
                <motion.button
                  key={i}
                  onClick={() => onToggleSlot(i)}
                  whileTap={{ scale: 0.85 }}
                  className="relative"
                >
                  {/* Slot container */}
                  <motion.div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-colors ${
                      isUsed
                        ? "border-muted/20 bg-muted/5"
                        : active
                          ? "border-orange-500/80 bg-orange-950/30"
                          : "border-rage/40 bg-rage/10"
                    }`}
                    animate={
                      !isUsed && active
                        ? {
                            borderColor: [
                              "rgba(249,115,22,0.8)",
                              "rgba(239,68,68,0.9)",
                              "rgba(249,115,22,0.8)",
                            ],
                            boxShadow: [
                              "0 0 8px rgba(249,115,22,0.3)",
                              "0 0 16px rgba(239,68,68,0.5)",
                              "0 0 8px rgba(249,115,22,0.3)",
                            ],
                          }
                        : {}
                    }
                    transition={
                      !isUsed && active
                        ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                        : {}
                    }
                  >
                    <AnimatePresence mode="wait">
                      {isUsed ? (
                        <motion.span
                          key="used"
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 90 }}
                          className="text-muted/30 text-sm font-heading"
                        >
                          ✕
                        </motion.span>
                      ) : (
                        <motion.span
                          key="available"
                          initial={{ scale: 0 }}
                          animate={
                            active
                              ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }
                              : { scale: 1 }
                          }
                          exit={{ scale: 0 }}
                          transition={
                            active
                              ? {
                                  duration: 0.8,
                                  repeat: Infinity,
                                  repeatDelay: 0.5 + i * 0.2,
                                }
                              : {}
                          }
                          className="text-xl leading-none"
                        >
                          🔥
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.button>
              );
            })}
          </div>

          {/* Rage toggle button */}
          <motion.button
            onClick={onToggleActive}
            disabled={!active && !canActivate}
            whileTap={active || canActivate ? { scale: 0.9 } : {}}
            className="relative ml-1"
          >
            <motion.div
              className={`px-4 py-2 rounded-lg font-heading text-xs tracking-[0.2em] uppercase ${
                active
                  ? "text-white"
                  : canActivate
                    ? "text-rage/80 border border-rage/40"
                    : "text-muted/30 border border-muted/15 cursor-not-allowed"
              }`}
              animate={
                active
                  ? {
                      background: [
                        "linear-gradient(135deg, #8b2d2d, #b33a1a)",
                        "linear-gradient(135deg, #b33a1a, #8b2d2d)",
                        "linear-gradient(135deg, #8b2d2d, #b33a1a)",
                      ],
                      boxShadow: [
                        "0 0 15px rgba(180,50,30,0.4), inset 0 0 10px rgba(255,100,50,0.1)",
                        "0 0 25px rgba(180,50,30,0.6), inset 0 0 15px rgba(255,100,50,0.2)",
                        "0 0 15px rgba(180,50,30,0.4), inset 0 0 10px rgba(255,100,50,0.1)",
                      ],
                    }
                  : {
                      background: "transparent",
                      boxShadow: "none",
                    }
              }
              transition={
                active
                  ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.3 }
              }
            >
              {active ? "RAGING" : "RAGE"}
            </motion.div>
          </motion.button>
        </div>

        {/* Bottom bar */}
        <AnimatePresence>
          {active && (
            <motion.div
              className="mt-2 h-[2px] rounded-full overflow-hidden"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.div
                className="h-full w-full"
                animate={{
                  background: [
                    "linear-gradient(90deg, transparent, #f97316, #ef4444, #f97316, transparent)",
                    "linear-gradient(90deg, transparent, #ef4444, #f97316, #ef4444, transparent)",
                    "linear-gradient(90deg, transparent, #f97316, #ef4444, #f97316, transparent)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rage details when active */}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mt-2 px-1 space-y-0.5">
                <p className="text-[0.65rem] text-orange-300/80 leading-relaxed">
                  +2 daño · Resistencia Bludgeoning/Piercing/Slashing · Ventaja FUE checks/saves
                </p>
                <p className="text-[0.65rem] text-muted leading-relaxed">
                  Extiende: ataca · fuerza salvación · Bonus Action
                </p>
                <p className="text-[0.65rem] text-muted leading-relaxed">
                  No concentración · No hechizos
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
