"use client";

import { deleteUser } from "@/app/actions";

export function DeleteUserButton({ userId }: { userId: number | string }) {
  return (
    <form
      action={deleteUser}
      onSubmit={(event) => {
        if (!window.confirm("Are you sure you want to delete this user?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        className="rounded-lg border border-red-300/20 bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-400/20"
      >
        Delete
      </button>
    </form>
  );
}
