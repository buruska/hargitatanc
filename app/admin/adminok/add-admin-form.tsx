"use client";

import { useActionState, useEffect, useRef } from "react";
import { buttonPrimary, input, label } from "@/lib/styles";
import { createAdminAction, type CreateAdminState } from "./actions";

const initialState: CreateAdminState = {};

export function AddAdminForm({ canCreateMainAdmin }: { canCreateMainAdmin: boolean }) {
  const [state, formAction, isPending] = useActionState(createAdminAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.success) formRef.current?.reset(); }, [state.success]);

  return (
    <form action={formAction} className="grid gap-4" ref={formRef}>
      <div className="grid items-start gap-4 min-[620px]:grid-cols-2">
        <label className={`${label} content-start`}>E-mail<input autoComplete="off" className={input} name="email" required type="email" /></label>
        <label className={`${label} content-start`}>
          Ideiglenes jelszó
          <input
            aria-describedby="admin-password-requirements"
            autoComplete="new-password"
            className={input}
            minLength={12}
            name="password"
            required
            type="password"
          />
          <span className="text-xs font-bold leading-relaxed text-muted" id="admin-password-requirements">
            A jelszónak legalább 12 karakter hosszúnak kell lennie.
          </span>
        </label>
      </div>
      {canCreateMainAdmin ? (
        <label className={label}>Jogosultság<select className={input} defaultValue="MAIN_ADMIN" name="role"><option value="MAIN_ADMIN">Főadmin</option><option value="ADMIN">Admin</option></select></label>
      ) : <input name="role" type="hidden" value="ADMIN" />}
      {state.error ? <p className="border-2 border-thread-red/40 bg-thread-red/10 px-3 py-2.5 font-bold text-thread-red" role="alert">{state.error}</p> : null}
      {state.success ? <p className="border-2 border-pine/40 bg-pine/10 px-3 py-2.5 font-bold text-pine" role="status">{state.success}</p> : null}
      <button className={`${buttonPrimary} w-fit`} disabled={isPending} type="submit">
        {isPending ? "Létrehozás…" : canCreateMainAdmin ? "Adminisztrátor hozzáadása" : "Admin hozzáadása"}
      </button>
    </form>
  );
}
