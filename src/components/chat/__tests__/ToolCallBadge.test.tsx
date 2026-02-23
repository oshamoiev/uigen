import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

test("str_replace_editor + create shows Creating <filename>", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "create", path: "/src/components/Button.tsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Creating `Button.tsx`")).toBeDefined();
});

test("str_replace_editor + str_replace shows Editing <filename>", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/src/App.tsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Editing `App.tsx`")).toBeDefined();
});

test("str_replace_editor + insert shows Editing <filename>", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "insert", path: "/src/utils.ts" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Editing `utils.ts`")).toBeDefined();
});

test("str_replace_editor + view shows Viewing <filename>", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "view", path: "/src/index.tsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Viewing `index.tsx`")).toBeDefined();
});

test("str_replace_editor + undo_edit shows Undoing edit in <filename>", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "undo_edit", path: "/src/styles.css" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Undoing edit in `styles.css`")).toBeDefined();
});

test("file_manager + rename shows Renaming <filename>", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "file_manager",
        args: { command: "rename", path: "/src/old.tsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Renaming `old.tsx`")).toBeDefined();
});

test("file_manager + delete shows Deleting <filename>", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "file_manager",
        args: { command: "delete", path: "/src/temp.js" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Deleting `temp.js`")).toBeDefined();
});

test("unknown tool falls back to raw toolName", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "some_unknown_tool",
        args: {},
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});

test("completed state renders green dot and no spinner", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "create", path: "/src/Button.tsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("loading state renders spinner and no green dot", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "create", path: "/src/Button.tsx" },
        state: "call",
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});
