import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { EXAMPLES } from "@/lib/lp/examples";
import { isBlankModel } from "@/lib/lp/ids";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const nav = useNavigate();
  const saved = useApp((s) => s.saved);
  const loadExample = useApp((s) => s.loadExample);
  const loadSaved = useApp((s) => s.loadSaved);
  const newModel = useApp((s) => s.newModel);
  const deleteSaved = useApp((s) => s.deleteSaved);
  const model = useApp((s) => s.model);
  const inProgress = !isBlankModel(model);

  const openExample = (id: string) => {
    loadExample(id);
    nav({ to: "/editor" });
  };
  const openNew = () => {
    newModel();
    nav({ to: "/editor" });
  };
  const openSaved = (id: string) => {
    loadSaved(id);
    nav({ to: "/editor" });
  };

  return (
    <div className="flex flex-col gap-8 pt-1">
      <header>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium tracking-[0.16em] text-steel uppercase">Investigación operativa</p>
          <ThemeSwitcher />
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Lingrok</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          Armá un modelo de programación lineal, resolvélo y leé el informe. Los ejemplos de abajo son opcionales: sirven
          para practicar, no hace falta usarlos.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={openNew}>
            <Plus size={16} /> Nuevo modelo
          </Button>
          {inProgress && (
            <Button variant="outline" onClick={() => nav({ to: "/editor" })}>
              Continuar
            </Button>
          )}
        </div>
      </header>

      {saved.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Recientes</h2>
          <ul className="flex flex-col gap-2">
            {saved.map((m) => (
              <li key={m.id}>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
                  <button className="min-w-0 flex-1 text-left" onClick={() => openSaved(m.id)}>
                    <div className="truncate font-medium">{m.name || "Modelo"}</div>
                    <div className="text-xs text-subtle">
                      {m.variables.length} var · {m.constraints.length} rest · {m.sense.toUpperCase()}
                    </div>
                  </button>
                  <button
                    className="size-11 text-subtle hover:text-danger"
                    aria-label="Eliminar"
                    onClick={() => deleteSaved(m.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-1 text-lg font-semibold">Ejemplos</h2>
        <p className="mb-4 text-sm text-muted">Casos clásicos de cátedra, por si querés ver uno resuelto antes de cargar el tuyo.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => openExample(ex.id)}
              className="rounded-lg border border-border bg-surface p-4 text-left transition-colors duration-150 hover:bg-elevated"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs tracking-wide text-steel uppercase">{ex.topic}</div>
                  <div className="mt-1 font-medium">{ex.name}</div>
                  <p className="mt-1 text-sm text-muted">{ex.blurb}</p>
                  <div className="mt-2 flex gap-2 text-xs text-subtle">
                    <span>{ex.vars} var</span>
                    {ex.graphic && <span>gráfico</span>}
                    {ex.integer && <span>entera</span>}
                  </div>
                </div>
                <ChevronRight size={18} className="mt-1 shrink-0 text-subtle" />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold">En el iPhone</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
          <li>Abrí Compartir en Safari y elegí «Agregar a inicio».</li>
          <li>Lingrok queda como una app, a pantalla completa.</li>
          <li>Los modelos se guardan en este aparato (no hace falta cuenta).</li>
        </ol>
      </section>

      <p className="pb-2 text-center text-[11px] text-subtle">
        <a
          href="https://github.com/MateoDi9z"
          target="_blank"
          rel="noreferrer"
          className="hover:text-muted"
          title="Autor"
        >
          MateoDi9z
        </a>
      </p>
    </div>
  );
}
