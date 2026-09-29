"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Script from "next/script";
import { useCharacter } from "@/hooks/useCharacter";
import { useTheme } from "@/hooks/useTheme";
import { useGoogleDriveAuth } from "@/hooks/useGoogleDriveAuth";
import { CharacterContext, ThemeContext, GoogleDriveContext } from "@/lib/context";
import { initGoogleAuth } from "@/lib/googleDrive";
import { SheetTab } from "@/components/tabs/SheetTab";
import { CombatTab } from "@/components/tabs/CombatTab";
import { InventoryTab } from "@/components/tabs/InventoryTab";
import { NotesTab } from "@/components/tabs/NotesTab";
import { EncyclopediaTab } from "@/components/tabs/EncyclopediaTab";
import { SettingsTab } from "@/components/tabs/SettingsTab";
import { OfflineBadge } from "@/components/OfflineBadge";
import { DiceBoxCanvas } from "@/components/DiceBoxCanvas";
import { QuickActionsFab } from "@/components/ui/QuickActionsFab";
import { Toaster } from "sonner";
import { Shield, Swords, Backpack, BookOpen, Library, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { EffectsProvider } from "@/components/effects/EffectsProvider";
import { TabTransition } from "@/components/ui/TabTransition";
import { swipeOrigin, tabDirection } from "@/lib/motion";
import type { ReactNode } from "react";

type Tab = "ficha" | "combate" | "inventario" | "notas" | "enciclopedia" | "ajustes";

const TAB_ORDER: Tab[] = ["ficha", "combate", "inventario", "notas", "enciclopedia", "ajustes"];

const TAB_META: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: "ficha", label: "Ficha", icon: <Shield size={20} strokeWidth={1.5} /> },
  { id: "combate", label: "Combate", icon: <Swords size={20} strokeWidth={1.5} /> },
  { id: "inventario", label: "Inventario", icon: <Backpack size={20} strokeWidth={1.5} /> },
  { id: "notas", label: "Notas", icon: <BookOpen size={20} strokeWidth={1.5} /> },
  { id: "enciclopedia", label: "Enciclopedia", icon: <Library size={20} strokeWidth={1.5} /> },
  { id: "ajustes", label: "Ajustes", icon: <Settings size={20} strokeWidth={1.5} /> },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("ficha");
  const [isPinching, setIsPinching] = useState(false);
  const charState = useCharacter();
  const themeState = useTheme();
  const driveState = useGoogleDriveAuth();
  const reducedMotion = usePrefersReducedMotion();
  const appRootRef = useRef<HTMLDivElement>(null);
  const [tabFx, setTabFx] = useState<{
    origin: { x: number; y: number } | null;
    scrollOffset: number;
  }>({ origin: null, scrollOffset: 0 });
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  function goToTab(next: Tab, origin: { x: number; y: number } | null) {
    if (next === activeTab) return;
    setTabFx({ origin, scrollOffset: window.scrollY });
    setActiveTab(next);
  }

  const { dragX, dragOpacity, handleDragEnd } = useSwipeNavigation(
    TAB_ORDER,
    activeTab,
    (next) =>
      goToTab(
        next,
        swipeOrigin(
          tabDirection(TAB_ORDER, activeTab, next),
          window.innerWidth,
          window.innerHeight
        )
      )
  );

  // Each tab starts at the top; the leaving tab is drawn at its old offset.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const transitionMode = reducedMotion
    ? "instant"
    : themeState.motionStyle === "flashy"
      ? "flashy"
      : "normal";

  if (!charState.character) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <p className="font-heading italic text-muted">Diario de campaña de</p>
          <p className="font-heading text-4xl text-foreground">Mavok</p>
        </motion.div>
      </div>
    );
  }

  const tabContent: Record<Tab, ReactNode> = {
    ficha: <SheetTab />,
    combate: <CombatTab />,
    inventario: <InventoryTab />,
    notas: <NotesTab />,
    enciclopedia: <EncyclopediaTab />,
    ajustes: <SettingsTab />,
  };

  return (
    <CharacterContext.Provider value={charState}>
      <ThemeContext.Provider value={themeState}>
        <GoogleDriveContext.Provider value={driveState}>
          <EffectsProvider
            motionStyle={themeState.motionStyle}
            reducedMotion={reducedMotion}
            rageActive={charState.character.resources.rpiRages.active}
            shakeTarget={appRootRef}
          >
          {googleClientId && (
            <Script
              src="https://accounts.google.com/gsi/client"
              strategy="afterInteractive"
              onLoad={() => initGoogleAuth(googleClientId)}
            />
          )}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "var(--card)",
                color: "var(--fg)",
                border: "1px solid var(--border-color)",
                fontFamily: "var(--font-body)",
              },
            }}
          />
          <OfflineBadge />
          <DiceBoxCanvas />
          <div className="flex flex-col min-h-dvh">
            <motion.main
              className="flex-1 overflow-y-auto pb-safe-nav"
              style={{ x: dragX, opacity: dragOpacity, touchAction: 'pan-y pinch-zoom' }}
              drag={
                isPinching ||
                activeTab === "enciclopedia" ||
                activeTab === "notas"
                  ? false
                  : "x"
              }
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              onTouchStart={(e) => {
                if (e.touches.length > 1) setIsPinching(true);
              }}
              onTouchMove={(e) => {
                if (e.touches.length > 1) setIsPinching(true);
              }}
              onTouchEnd={(e) => {
                if (e.touches.length === 0) setIsPinching(false);
              }}
            >
              {/* Shake target: only tab content, never the fixed nav/FAB (a
                  transformed ancestor would re-anchor fixed children). */}
              <div ref={appRootRef}>
                <TabTransition
                  tabKey={activeTab}
                  order={TAB_ORDER}
                  origin={tabFx.origin}
                  mode={transitionMode}
                  scrollOffset={tabFx.scrollOffset}
                >
                  {tabContent[activeTab]}
                </TabTransition>
              </div>
            </motion.main>

            <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 nav-island-bottom">
              <div
                className="mx-auto max-w-md flex items-center justify-around h-16 rounded-2xl border border-border/60"
                style={{
                  background: "var(--nav-bg)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  boxShadow:
                    "0 6px 24px var(--slab-shadow), inset 0 1px 0 color-mix(in srgb, var(--fg) 6%, transparent)",
                }}
              >
                {TAB_META.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      goToTab(tab.id, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
                    }}
                    aria-current={activeTab === tab.id ? "page" : undefined}
                    className={`relative flex flex-col items-center justify-center gap-0.5 font-heading text-[0.75rem] tracking-[-0.01em] flex-1 h-full transition-colors duration-200 ${
                      activeTab === tab.id ? "text-accent" : "text-muted"
                    }`}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-1 w-1.5 h-1.5 rotate-45 rounded-[1px] bg-cord"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </nav>
            {(activeTab === "ficha" || activeTab === "combate") && (
              <QuickActionsFab activeTab={activeTab} />
            )}
          </div>
          </EffectsProvider>
        </GoogleDriveContext.Provider>
      </ThemeContext.Provider>
    </CharacterContext.Provider>
  );
}
