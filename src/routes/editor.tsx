import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bookmark, Play } from "lucide-react";
import { useState } from "react";
import { LingoEditor } from "@/components/lingo-editor";
import { MatrixEditor } from "@/components/matrix-editor";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/editor")({ component: EditorPage });

function EditorPage() {
  const nav = useNavigate();
  const model = useApp((s) => s.model);
  const setModel = useApp((s) => s.setModel);
  const saveCurrent = useApp((s) => s.saveCurrent);
  const solve = useApp((s) => s.solve);
  const editorTab = useApp((s) => s.editorTab);
  const setEditorTab = useApp((s) => s.setEditorTab);
  const parseError = useApp((s) => s.parseError);
  const [savedFlash, setSavedFlash] = useState(false);

  const run = () => {
    solve();
    nav({ to: "/informe" });
  };

  return (
    <div className="flex flex-col gap-4 pt-1">
      <PageHeader
        kicker="Modelo"
        title="Editor"
        description="Cargá coeficientes en la tabla o escribí el modelo en LINGO."
      />

      <div className="flex gap-1 rounded-md border border-border bg-surface p-1">
        {(
          [
            ["visual", "Visual"],
            ["lingo", "LINGO"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            className={cn(
              "h-10 flex-1 rounded-sm text-sm font-medium",
              editorTab === id ? "bg-accent text-accent-fg" : "text-muted",
            )}
            onClick={() => setEditorTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {editorTab === "visual" ? (
        <MatrixEditor model={model} onChange={setModel} />
      ) : (
        <LingoEditor model={model} onApply={setModel} error={parseError} />
      )}

      <div className="sticky bottom-24 z-10 flex gap-2 pt-2">
        <Button className="flex-1" onClick={run}>
          <Play size={16} fill="currentColor" /> Resolver
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            saveCurrent();
            setSavedFlash(true);
            setTimeout(() => setSavedFlash(false), 1200);
          }}
        >
          <Bookmark size={16} />
          {savedFlash ? "Listo" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
