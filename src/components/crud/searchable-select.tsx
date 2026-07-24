"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type SearchableSelectOption = { value: string; label: string };

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function SearchableSelect({
  name,
  options,
  defaultValue,
  value: controlledValue,
  onChange,
  required,
  placeholder,
  searchPlaceholder,
  className,
}: {
  name?: string;
  options: SearchableSelectOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}) {
  const isControlled = controlledValue !== undefined;
  const [internalId, setInternalId] = useState(defaultValue ?? "");
  const selectedId = isControlled ? (controlledValue as string) : internalId;

  const initial = options.find((o) => o.value === selectedId);
  const [query, setQuery] = useState(initial?.label ?? "");
  const [typed, setTyped] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keeps the displayed text in sync when the selection changes from
  // outside (controlled mode) rather than through this component's own
  // selectOption/blur handlers.
  useEffect(() => {
    if (!isControlled) return;
    const current = options.find((o) => o.value === controlledValue);
    setQuery(current?.label ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledValue, isControlled]);

  const emptyOption: SearchableSelectOption = {
    value: "",
    label: placeholder ?? (required ? "Selecione" : "—"),
  };

  const filtered = useMemo(() => {
    const list = typed && query.trim() !== "" ? options.filter((o) => normalize(o.label).includes(normalize(query))) : options;
    return [emptyOption, ...list];
  }, [options, query, typed, emptyOption]);

  function selectOption(opt: SearchableSelectOption) {
    if (isControlled) onChange?.(opt.value);
    else setInternalId(opt.value);
    setQuery(opt.value ? opt.label : "");
    setTyped(false);
    setOpen(false);
  }

  function handleBlur() {
    setOpen(false);
    const current = options.find((o) => o.value === selectedId);
    setQuery(current?.label ?? "");
    setTyped(false);
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        required={required}
        autoComplete="off"
        value={query}
        placeholder={searchPlaceholder ?? "Buscar..."}
        onFocus={(e) => {
          setOpen(true);
          setTyped(false);
          setHighlight(0);
          e.target.select();
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setTyped(true);
          setOpen(true);
          setHighlight(0);
        }}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setHighlight((h) => Math.min(h + 1, filtered.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter") {
            if (open && filtered[highlight]) {
              e.preventDefault();
              selectOption(filtered[highlight]);
            }
          } else if (e.key === "Escape") {
            inputRef.current?.blur();
          }
        }}
        className={
          className ??
          "w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition-shadow duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        }
      />
      {name && <input type="hidden" name={name} value={selectedId} />}

      {open && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-neutral-200 bg-white py-1 text-sm shadow-lg">
          {filtered.length === 0 && <li className="px-3 py-2 text-neutral-400">Nenhum resultado</li>}
          {filtered.map((opt, i) => (
            <li
              key={opt.value || "__empty__"}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectOption(opt)}
              className={`cursor-pointer px-3 py-2 ${
                i === highlight ? "bg-brand-50 text-brand-800" : "text-neutral-700 hover:bg-neutral-50"
              } ${opt.value === "" ? "text-neutral-400" : ""}`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
