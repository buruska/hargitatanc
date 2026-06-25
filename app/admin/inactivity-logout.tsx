"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { logoutAction } from "@/app/actions/auth";

const TIMEOUT_SECONDS = 10 * 60;
const ACTIVITY_EVENTS = ["click", "keydown", "mousemove", "scroll", "touchstart"] as const;

function formatRemaining(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function InactivityLogoutTimer() {
  const [remainingSeconds, setRemainingSeconds] = useState(TIMEOUT_SECONDS);
  const [, startTransition] = useTransition();
  const expiresAtRef = useRef(Date.now() + TIMEOUT_SECONDS * 1000);
  const hasLoggedOutRef = useRef(false);

  const formattedTime = useMemo(() => formatRemaining(remainingSeconds), [remainingSeconds]);

  useEffect(() => {
    function resetTimer() {
      if (hasLoggedOutRef.current) {
        return;
      }

      expiresAtRef.current = Date.now() + TIMEOUT_SECONDS * 1000;
      setRemainingSeconds(TIMEOUT_SECONDS);
    }

    function logout() {
      if (hasLoggedOutRef.current) {
        return;
      }

      hasLoggedOutRef.current = true;
      startTransition(() => {
        void logoutAction();
      });
    }

    const intervalId = window.setInterval(() => {
      const secondsLeft = Math.max(0, Math.ceil((expiresAtRef.current - Date.now()) / 1000));
      setRemainingSeconds(secondsLeft);

      if (secondsLeft === 0) {
        logout();
      }
    }, 1000);

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true });
    });

    return () => {
      window.clearInterval(intervalId);
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });
    };
  }, [startTransition]);

  return <p className="mt-1 text-sm font-extrabold text-muted/75">Automatikus kilépés: {formattedTime}</p>;
}
