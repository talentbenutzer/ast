"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { employeeService } from "@/lib/services/employeeService";
import { serialNumberService } from "@/lib/services/serialNumberService";
import { Employee } from "@/lib/types";
import {
  MOEBEL_MAP,
  FARBE_MAP,
  GESTELL_MAP,
  KUNDE_MAP,
  ARTEDITION_MAP,
  decodeFurniture,
  decodeColor,
  decodeFrame,
  decodeCustomerType,
  decodeArtedition,
} from "@/lib/utils/mappings";

export default function GeneratorPage() {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const [furnitureCode, setFurnitureCode] = useState(Object.keys(MOEBEL_MAP)[0]);
  const [colorCode, setColorCode] = useState(Object.keys(FARBE_MAP)[0]);
  const [frameCode, setFrameCode] = useState(Object.keys(GESTELL_MAP)[0]);
  const [customerType, setCustomerType] = useState(Object.keys(KUNDE_MAP)[0]);
  const [artedition, setArtedition] = useState(Object.keys(ARTEDITION_MAP)[0]);

  const [buyerName, setBuyerName] = useState("");

  const [previewNumber, setPreviewNumber] = useState("");
  const [previewYear, setPreviewYear] = useState("");

  useEffect(() => {
    employeeService.getEmployees().then(setEmployees);

    const activeEmp = employeeService.getActiveEmployee();
    if (activeEmp) {
      setSelectedEmployeeId(activeEmp.id);
    }

    setPreviewYear(new Date().getFullYear().toString().slice(-2));
    setPreviewNumber(serialNumberService.getNextProductionNumber());
  }, []);

  const previewFull = previewYear && previewNumber
    ? serialNumberService.generateSerialNumberString({
        year: previewYear,
        productionNumber: previewNumber,
        furnitureCode,
        colorCode,
        frameCode,
        customerType,
        artedition,
      })
    : "";

  const decodedParts = [
    decodeFurniture(furnitureCode),
    decodeColor(colorCode),
    decodeFrame(frameCode),
    decodeCustomerType(customerType),
    ...(artedition !== "XX" ? [decodeArtedition(artedition)] : []),
  ].filter(Boolean);

  const handleAssign = () => {
    if (!selectedEmployeeId) return;

    const emp = employees.find((e) => e.id === selectedEmployeeId);
    if (!emp) return;

    serialNumberService.createSerialNumber({
      furnitureCode,
      colorCode,
      frameCode,
      customerType,
      artedition,
      buyerName: buyerName.trim(),
      createdBy: emp.name,
    });

    setPreviewNumber(serialNumberService.getNextProductionNumber());
    setBuyerName("");
    router.push("/list");
  };

  return (
    <div>
      {/* 1px top line */}
      <div className="border-t border-foreground" />

      {/* Sticky Header with Serial Number Preview */}
      <div 
        className="sticky top-0 bg-white z-50 border-b border-border shadow-sm"
        style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 50 }}
      >
        {/* Large serial number preview */}
        <div className="px-6 md:px-[90px] pt-5 pb-3 overflow-x-auto no-scrollbar">
          <div className="flex w-max">
            <div 
              className="text-[clamp(1.5rem,8vw,3.5rem)] font-medium tracking-tight leading-tight"
              style={{ whiteSpace: 'nowrap' }}
            >
              {previewFull || "—"}
            </div>
            {/* Horizontal spacer to maintain padding when scrolling */}
            <div className="w-6 md:w-[90px] h-1 flex-shrink-0" />
          </div>
        </div>

        {/* Decoded human-readable line */}
        <div className="px-6 md:px-[90px] pt-2 pb-4">
          <div className="text-[10px] md:text-sm font-bold tracking-widest uppercase flex items-center gap-x-4 gap-y-2 flex-wrap">
            {decodedParts.map((part, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-muted hidden md:inline">▪</span>}
                {part}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Auswahl heading */}
      <div className="px-6 md:px-[90px] pt-10 pb-[15px]">
        <h3 className="text-2xl md:text-3xl font-light tracking-tight">Auswahl</h3>
      </div>

      {/* 1px line above config grid */}
      <div className="border-t border-border" />

      {/* Config grid – options */}
      <div className="px-6 md:px-[90px] pt-8 md:pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-10 md:gap-4">
          {/* Piece */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-4 md:mb-3 text-muted">Piece</div>
            <ul className="space-y-3 md:space-y-1.5">
              {Object.entries(MOEBEL_MAP).map(([code, name]) => {
                const isSelected = furnitureCode === code;
                return (
                  <li
                    key={code}
                    onClick={() => setFurnitureCode(code)}
                    className={`flex items-center gap-2 cursor-pointer text-sm transition-all duration-100 ${
                      isSelected ? "font-bold text-foreground" : "text-muted hover:text-foreground"
                    }`}
                  >
                    <span className={`w-4 md:w-5 text-right text-xs ${isSelected ? "text-foreground" : "text-transparent"}`}>—</span>
                    <span>{code}</span>
                    <span className="opacity-80">{name}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Farbe */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-4 md:mb-3 text-muted">Farbe</div>
            <ul className="space-y-3 md:space-y-1.5">
              {Object.entries(FARBE_MAP).map(([code, name]) => {
                const isSelected = colorCode === code;
                return (
                  <li
                    key={code}
                    onClick={() => setColorCode(code)}
                    className={`flex items-center gap-2 cursor-pointer text-sm transition-all duration-100 ${
                      isSelected ? "font-bold text-foreground" : "text-muted hover:text-foreground"
                    }`}
                  >
                    <span className={`w-4 md:w-5 text-right text-xs ${isSelected ? "text-foreground" : "text-transparent"}`}>—</span>
                    <span>{code}</span>
                    <span className="opacity-80">{name}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Gestell */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-4 md:mb-3 text-muted">Gestell</div>
            <ul className="space-y-3 md:space-y-1.5">
              {Object.entries(GESTELL_MAP).map(([code, name]) => {
                const isSelected = frameCode === code;
                return (
                  <li
                    key={code}
                    onClick={() => setFrameCode(code)}
                    className={`flex items-center gap-2 cursor-pointer text-sm transition-all duration-100 ${
                      isSelected ? "font-bold text-foreground" : "text-muted hover:text-foreground"
                    }`}
                  >
                    <span className={`w-4 md:w-5 text-right text-xs ${isSelected ? "text-foreground" : "text-transparent"}`}>—</span>
                    <span>{code}</span>
                    <span className="opacity-80">{name}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Kunde */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-4 md:mb-3 text-muted">Kunde</div>
            <ul className="space-y-3 md:space-y-1.5">
              {Object.entries(KUNDE_MAP).map(([code, name]) => {
                const isSelected = customerType === code;
                return (
                  <li
                    key={code}
                    onClick={() => setCustomerType(code)}
                    className={`flex items-center gap-2 cursor-pointer text-sm transition-all duration-100 ${
                      isSelected ? "font-bold text-foreground" : "text-muted hover:text-foreground"
                    }`}
                  >
                    <span className={`w-4 md:w-5 text-right text-xs ${isSelected ? "text-foreground" : "text-transparent"}`}>—</span>
                    <span>{code}</span>
                    <span className="opacity-80">{name}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Art Edition */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-4 md:mb-3 text-muted">Art Edition</div>
            <ul className="space-y-3 md:space-y-1.5">
              {Object.entries(ARTEDITION_MAP).map(([code, name]) => {
                const isSelected = artedition === code;
                return (
                  <li
                    key={code}
                    onClick={() => setArtedition(code)}
                    className={`flex items-center gap-2 cursor-pointer text-sm transition-all duration-100 ${
                      isSelected ? "font-bold text-foreground" : "text-muted hover:text-foreground"
                    }`}
                  >
                    <span className={`w-4 md:w-5 text-right text-xs ${isSelected ? "text-foreground" : "text-transparent"}`}>—</span>
                    <span>{code}</span>
                    <span className="opacity-80">{name}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom: Mitarbeiter, Kunde, Button */}
      <div className="px-6 md:px-[90px] pt-16 pb-20 md:pb-10">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-10 md:gap-4 items-end">
          <div className="md:col-span-1">
            <div className="text-xs font-bold uppercase tracking-wider mb-2 text-muted">Mitarbeiter</div>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="bg-transparent border-b border-border pb-1 text-sm outline-none cursor-pointer w-full appearance-none"
            >
              <option value="" disabled>Bitte wählen...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <div className="text-xs font-bold uppercase tracking-wider mb-2 text-muted">Kunde</div>
            <input
              type="text"
              placeholder="Name"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className="bg-transparent border-b border-border pb-1 text-sm outline-none w-full"
            />
          </div>

          {/* Empty space on desktop */}
          <div className="hidden md:block md:col-span-4" />

          {/* Button */}
          <div className="md:col-span-1 flex justify-end">
            <button
              onClick={handleAssign}
              disabled={!selectedEmployeeId}
              className="w-full md:w-auto bg-foreground text-white px-8 py-4 md:py-3 text-sm font-medium tracking-wide hover:bg-accent-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Nummer vergeben
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
