"use client";

import { FiTrash2 } from "react-icons/fi";

import { deleteParameter } from "@/app/actions";

export function DeleteParameterButton({ parameterId }: { parameterId: number | string }) {
  return (
    <form
      action={deleteParameter}
      onSubmit={(event) => {
        if (!window.confirm("Are you sure you want to delete this parameter?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="parameterId" value={parameterId} />
      <button
        type="submit"
        aria-label={`Delete parameter ${parameterId}`}
        title="Delete parameter"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-300/20 bg-red-400/10 text-red-500/60 transition hover:bg-red-400/20"
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </form>
  );
}
