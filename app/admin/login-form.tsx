"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { buttonPrimary, input, label } from "@/lib/styles";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

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
        <input className={input} name="password" type="password" autoComplete="current-password" required />
      </label>
      <button className={buttonPrimary} disabled={isPending} type="submit">
        {isPending ? "Belépés..." : "Belépés"}
      </button>
    </form>
  );
}
