"use client";

import { useActionState } from "react";
import { buttonPrimary, input, label, panel } from "@/lib/styles";
import { updateSocialLinksAction, type SocialLinksFormState } from "./actions";

const initialState: SocialLinksFormState = {};

export function SocialLinksForm({
  facebookUrl,
  instagramUrl,
  tiktokUrl,
}: {
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
}) {
  const [state, formAction, isPending] = useActionState(updateSocialLinksAction, initialState);

  return (
    <form action={formAction} className={`${panel} mt-6 grid gap-5 p-5`}>
      <label className={label}>
        Facebook link
        <input className={input} defaultValue={facebookUrl} name="facebookUrl" required type="url" />
      </label>
      <label className={label}>
        Instagram link
        <input className={input} defaultValue={instagramUrl} name="instagramUrl" required type="url" />
      </label>
      <label className={label}>
        TikTok link
        <input className={input} defaultValue={tiktokUrl === "#" ? "" : tiktokUrl} name="tiktokUrl" required type="url" />
      </label>
      {state.message ? (
        <p className={`border px-3 py-2 text-sm font-extrabold ${state.success ? "border-pine/40 text-pine" : "border-thread-red/40 text-thread-red"}`}>
          {state.message}
        </p>
      ) : null}
      <button className={`${buttonPrimary} justify-self-start`} disabled={isPending} type="submit">
        {isPending ? "Mentés..." : "Linkek mentése"}
      </button>
    </form>
  );
}
