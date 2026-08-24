"use client";

import { FiTrash2 } from "react-icons/fi";

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
        aria-label={`Delete user ${userId}`}
        title="Delete user"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-300/20 bg-red-400/10 text-red-100 transition hover:bg-red-400/20"
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </form>
  );
}
