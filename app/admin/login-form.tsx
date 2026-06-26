"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { buttonPrimary, input, label } from "@/lib/styles";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <form action={formAction} className="grid gap-3.5">
      {state.error ? (
        <p className="border-2 border-[rgb(179_38_32_/_42%)] bg-[rgb(179_38_32_/_10%)] px-3 py-2.5 text-thread-red">
          {state.error}
        </p>
      ) : null}
      <label className={label}>
        E-mail
        <input className={input} name="email" type="email" autoComplete="email" required />
      </label>
      <label className={label}>
        Jelszó
        <span className="relative">
          <input
            className={`${input} w-full pr-11`}
            name="password"
            type={isPasswordVisible ? "text" : "password"}
            autoComplete="current-password"
            required
          />
          <button
            aria-label={isPasswordVisible ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
            className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center text-muted transition hover:text-charcoal"
            type="button"
            onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
          >
            <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
              {isPasswordVisible ? (
                <>
                  <path
                    d="m3 3 18 18"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <path
                    d="M10.6 10.6a2 2 0 0 0 2.8 2.8"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <path
                    d="M9.3 5.3A9.2 9.2 0 0 1 12 5c5 0 8.5 4.5 9.5 7a11.4 11.4 0 0 1-2.4 3.5M6.2 6.2A12.4 12.4 0 0 0 2.5 12c1 2.5 4.5 7 9.5 7 1.5 0 2.8-.4 4-1"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </>
              ) : (
                <>
                  <path
                    d="M2.5 12c1-2.5 4.5-7 9.5-7s8.5 4.5 9.5 7c-1 2.5-4.5 7-9.5 7s-8.5-4.5-9.5-7Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    fill="none"
                    r="2.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </>
              )}
            </svg>
          </button>
        </span>
      </label>
      <button className={buttonPrimary} disabled={isPending} type="submit">
        {isPending ? "Belépés..." : "Belépés"}
      </button>
    </form>
  );
}
