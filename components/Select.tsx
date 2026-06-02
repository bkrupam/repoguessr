"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

interface MenuPosition {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = "Select",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const gap = 8;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const openUpward = spaceBelow < 220 && spaceAbove > spaceBelow;
    const maxHeight = Math.min(320, openUpward ? spaceAbove : spaceBelow);

    setMenuPos({
      left: rect.left,
      width: rect.width,
      maxHeight: Math.max(120, maxHeight),
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + gap }
        : { top: rect.bottom + gap }),
    });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const selected = value || placeholder;
  const isPlaceholder = !value;

  const menu =
    open && menuPos && mounted
      ? createPortal(
          <ul
            ref={menuRef}
            role="listbox"
            className="fixed z-[100] overflow-y-auto overflow-x-hidden bg-[#050505] border border-[#9A9A9A] rounded-lg shadow-[0_16px_40px_rgba(0,0,0,0.85)]"
            style={{
              left: menuPos.left,
              width: menuPos.width,
              maxHeight: menuPos.maxHeight,
              top: menuPos.top,
              bottom: menuPos.bottom,
            }}
          >
            {options.map((opt) => (
              <li key={opt} role="option" aria-selected={opt === value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`body-type w-full text-left px-4 py-4 transition-colors border-b border-[#1a1a1a] last:border-0 ${
                    opt === value
                      ? "text-white bg-[#1a1a1a]"
                      : "text-[#9A9A9A] hover:text-white hover:bg-black"
                  }`}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          if (open) setOpen(false);
          else {
            updateMenuPosition();
            setOpen(true);
          }
        }}
        className={`body-type w-full flex items-center justify-between gap-3 px-4 py-4 border rounded-lg transition-colors focus:outline-none ${
          open ? "border-white" : "border-[#9A9A9A] hover:border-white"
        } ${isPlaceholder ? "text-[#9A9A9A]" : "text-white"}`}
      >
        <span className="truncate text-left">{selected}</span>
        <span
          className={`label text-[#9A9A9A] shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {menu}
    </>
  );
}
