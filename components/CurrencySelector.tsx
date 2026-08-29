"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useCurrency } from "@/components/CurrencyProvider";

export default function CurrencySelector() {
  const { currency, setCurrency, currencies, loading } = useCurrency();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();
  const disabled = loading && currencies.length <= 1;

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  function focusOption(index: number) {
    if (!currencies.length) return;
    optionRefs.current[(index + currencies.length) % currencies.length]?.focus();
  }

  function openAndFocus() {
    setOpen(true);
    requestAnimationFrame(() => focusOption(Math.max(0, currencies.findIndex(item => item.code === currency))));
  }

  function choose(code: string) {
    setCurrency(code);
    setOpen(false);
  }

  return <div ref={rootRef} className="currency-menu">
    <button type="button" disabled={disabled} aria-label={`Display currency: ${currency}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={menuId} onClick={() => open ? setOpen(false) : openAndFocus()} onKeyDown={event => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); openAndFocus(); } if (event.key === "Escape") setOpen(false); }} className="currency-menu-trigger">
      <span>{currency}</span><span aria-hidden="true" className="currency-menu-chevron">▾</span>
    </button>
    {open && <div id={menuId} role="listbox" aria-label="Display currency" className="currency-menu-list">
      {currencies.map((item, index) => <button key={item.code} ref={node => { optionRefs.current[index] = node; }} type="button" role="option" aria-selected={item.code === currency} onClick={() => choose(item.code)} onKeyDown={event => { if (event.key === "ArrowDown") { event.preventDefault(); focusOption(index + 1); } else if (event.key === "ArrowUp") { event.preventDefault(); focusOption(index - 1); } else if (event.key === "Home") { event.preventDefault(); focusOption(0); } else if (event.key === "End") { event.preventDefault(); focusOption(currencies.length - 1); } else if (event.key === "Escape") { event.preventDefault(); setOpen(false); rootRef.current?.querySelector<HTMLButtonElement>(".currency-menu-trigger")?.focus(); } }} className="currency-menu-option">
        <strong>{item.code}</strong><span>{item.name}</span><span aria-hidden="true" className="currency-menu-check">{item.code === currency ? "✓" : ""}</span>
      </button>)}
    </div>}
  </div>;
}
