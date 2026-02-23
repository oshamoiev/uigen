"use client";

import { Loader2 } from "lucide-react";

interface ToolCallBadgeProps {
  toolInvocation: {
    toolName: string;
    args: Record<string, unknown>;
    state: string;
    result?: unknown;
  };
}

function basename(filePath: string): string {
  return filePath.split("/").pop() ?? filePath;
}

function getFriendlyLabel(toolName: string, args: Record<string, unknown>): string {
  const command = args.command as string | undefined;
  const filePath = args.path as string | undefined;
  const filename = filePath ? basename(filePath) : undefined;

  if (toolName === "str_replace_editor") {
    if (command === "create" && filename) return `Creating \`${filename}\``;
    if ((command === "str_replace" || command === "insert") && filename) return `Editing \`${filename}\``;
    if (command === "view" && filename) return `Viewing \`${filename}\``;
    if (command === "undo_edit" && filename) return `Undoing edit in \`${filename}\``;
  }

  if (toolName === "file_manager") {
    if (command === "rename" && filename) return `Renaming \`${filename}\``;
    if (command === "delete" && filename) return `Deleting \`${filename}\``;
  }

  return toolName;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const label = getFriendlyLabel(toolInvocation.toolName, toolInvocation.args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {toolInvocation.state === "result" && toolInvocation.result ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
