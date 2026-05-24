"use client";

import { useEffect, useRef, useState } from "react";
import type { DistanceUnit } from "@/lib/units";

type Theme = "light" | "dark";

type SettingsMenuProps = {
  distanceUnit: DistanceUnit;
  onDistanceUnitChange: (unit: DistanceUnit) => void;
};

const themeStorageKey = "ocht.theme";
const unitStorageKey = "ocht.distanceUnit";
const legacyThemeStorageKey = "reprun.theme";
const legacyUnitStorageKey = "reprun.distanceUnit";

function readStorageWithLegacy(key: string, legacyKey: string) {
  const value = window.localStorage.getItem(key);

  if (value !== null) {
    return value;
  }

  const legacyValue = window.localStorage.getItem(legacyKey);

  if (legacyValue !== null) {
    window.localStorage.setItem(key, legacyValue);
  }

  return legacyValue;
}

function readPreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = readStorageWithLegacy(themeStorageKey, legacyThemeStorageKey);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

function readPreferredDistanceUnit(): DistanceUnit {
  if (typeof window === "undefined") {
    return "km";
  }

  const savedUnit = readStorageWithLegacy(unitStorageKey, legacyUnitStorageKey);

  return savedUnit === "mi" ? "mi" : "km";
}

export function SettingsMenu({
  distanceUnit,
  onDistanceUnitChange,
}: SettingsMenuProps) {
  const [theme, setTheme] = useState<Theme>("light");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preferredTheme = readPreferredTheme();
    const preferredUnit = readPreferredDistanceUnit();

    setTheme(preferredTheme);
    applyTheme(preferredTheme);
    onDistanceUnitChange(preferredUnit);
  }, [onDistanceUnitChange]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function updateTheme(nextTheme: Theme) {
    setTheme(nextTheme);
    window.localStorage.setItem(themeStorageKey, nextTheme);
    applyTheme(nextTheme);
  }

  function updateDistanceUnit(nextUnit: DistanceUnit) {
    window.localStorage.setItem(unitStorageKey, nextUnit);
    onDistanceUnitChange(nextUnit);
  }

  return (
    <div className="settings-menu" ref={menuRef}>
      <button
        className="settings-menu__trigger"
        type="button"
        aria-expanded={open}
        aria-label="Open settings"
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          focusable="false"
        >
          <path
            d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M19.4 13.4c.1-.5.1-.9.1-1.4s0-.9-.1-1.4l2-1.5-2-3.5-2.4 1a8.4 8.4 0 0 0-2.4-1.4L14.3 2h-4l-.4 3.2a8.4 8.4 0 0 0-2.4 1.4l-2.4-1-2 3.5 2 1.5c-.1.5-.1.9-.1 1.4s0 .9.1 1.4l-2 1.5 2 3.5 2.4-1a8.4 8.4 0 0 0 2.4 1.4l.4 3.2h4l.4-3.2a8.4 8.4 0 0 0 2.4-1.4l2.4 1 2-3.5-2.1-1.5Z"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
        </svg>
      </button>

      {open ? (
        <div className="settings-menu__panel">
          <fieldset>
            <legend>Theme</legend>
            <div className="settings-menu__switch">
              <button
                className={theme === "light" ? "is-active" : undefined}
                type="button"
                onClick={() => updateTheme("light")}
              >
                Light
              </button>
              <button
                className={theme === "dark" ? "is-active" : undefined}
                type="button"
                onClick={() => updateTheme("dark")}
              >
                Dark
              </button>
            </div>
          </fieldset>

          <fieldset>
            <legend>Distance</legend>
            <div className="settings-menu__switch">
              <button
                className={distanceUnit === "km" ? "is-active" : undefined}
                type="button"
                onClick={() => updateDistanceUnit("km")}
              >
                KM
              </button>
              <button
                className={distanceUnit === "mi" ? "is-active" : undefined}
                type="button"
                onClick={() => updateDistanceUnit("mi")}
              >
                Miles
              </button>
            </div>
          </fieldset>
        </div>
      ) : null}
    </div>
  );
}
