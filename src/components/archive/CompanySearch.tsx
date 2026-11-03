import { useEffect, useId, useRef, useState } from "react";
import { Search } from "lucide-react";
import { normalizeCompanyName, searchArchiveCompanies } from "@/lib/archiveDisplay";
import type { ArchiveCompany } from "@/types/archive";

interface CompanySearchProps {
  companies: ArchiveCompany[];
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (company: ArchiveCompany) => void;
  onCreate?: (name: string) => void;
  counts?: Record<string, number>;
  label?: string;
}

export default function CompanySearch({ companies, query, onQueryChange, onSelect, onCreate, counts, label = "회사명 검색" }: CompanySearchProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const matches = searchArchiveCompanies(companies, query);
  const canCreate = !!onCreate && !!normalizeCompanyName(query) && !companies.some((company) => [company.display, company.name, ...company.aliases].some((name) => normalizeCompanyName(name) === normalizeCompanyName(query)));
  const optionCount = matches.length + Number(canCreate);
  const selectedIndex = Math.min(activeIndex, Math.max(0, optionCount - 1));
  const visible = open && !!query.trim();
  const select = (index: number) => {
    if (index < matches.length) onSelect(matches[index]);
    else if (canCreate) onCreate?.(query.trim());
    setOpen(false);
  };
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div className="search" ref={root}>
      <Search className="ic" size={19} aria-hidden="true" />
      <input
        value={query} onChange={(event) => { onQueryChange(event.target.value); setActiveIndex(0); setOpen(true); }}
        onFocus={() => setOpen(true)} onBlur={(event) => { if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) setOpen(false); }}
        onKeyDown={(event) => {
          if (event.key === "Escape") { setOpen(false); return; }
          if (event.key === "Tab") { setOpen(false); return; }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault(); setOpen(true);
            if (optionCount) setActiveIndex(!visible ? (event.key === "ArrowDown" ? 0 : optionCount - 1) : (selectedIndex + (event.key === "ArrowDown" ? 1 : -1) + optionCount) % optionCount);
          }
          if (event.key === "Enter") { event.preventDefault(); if (optionCount) select(visible ? selectedIndex : 0); }
        }}
        placeholder={onCreate ? "회사명을 입력하고 목록에서 골라 주세요" : "회사명으로 검색 (예: 토스, kakao, 배민)"}
        autoComplete="off" aria-label={label} role="combobox" aria-autocomplete="list"
        aria-expanded={visible} aria-controls={`${id}-list`} aria-activedescendant={visible && optionCount ? `${id}-option-${selectedIndex}` : undefined}
      />
      {visible && (
        <div className="ac" id={`${id}-list`} role="listbox" aria-label="회사 검색 결과">
          {matches.map((company, index) => (
            <button type="button" role="option" id={`${id}-option-${index}`} aria-selected={index === selectedIndex} key={company.id} className={index === selectedIndex ? "hl" : ""}
              onPointerDown={(event) => event.preventDefault()} onClick={() => select(index)}>
              <span><span className="nm">{company.display}</span>{company.name !== company.display && <span className="lg">{company.name}</span>}{company.listed && <span className="tag-listed">상장</span>}</span>
              {!!counts?.[company.id] && <span className="ct">질문 {counts[company.id]}개</span>}
            </button>
          ))}
          {!matches.length && <div className="empty">찾는 회사가 없어요</div>}
          {canCreate && <button type="button" role="option" id={`${id}-option-${matches.length}`} aria-selected={selectedIndex === matches.length} className={selectedIndex === matches.length ? "hl" : ""} onPointerDown={(event) => event.preventDefault()} onClick={() => select(matches.length)}><span className="nm">‘{query.trim()}’로 직접 등록하기</span><span className="ct">목록에 없을 때만</span></button>}
        </div>
      )}
    </div>
  );
}
