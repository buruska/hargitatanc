"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="form-stack">
      {state.error ? <p className="error">{state.error}</p> : null}
      <label>
        E-mail
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Jelszó
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <button className="primary" disabled={isPending} type="submit">
        {isPending ? "Belépés..." : "Belépés"}
      </button>
    </form>
  );
}
