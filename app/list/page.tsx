"use client";

import { useEffect, useState } from "react";
import { serialNumberService } from "@/lib/services/serialNumberService";
import { handoverService } from "@/lib/services/handoverService";
import { SerialNumber, FileRecord } from "@/lib/types";
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

export default function ListPage() {
  const [serials, setSerials] = useState<SerialNumber[]>([]);
  const [allFiles, setAllFiles] = useState<FileRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  // Edit form state
  const [editFurniture, setEditFurniture] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editFrame, setEditFrame] = useState("");
  const [editCustomer, setEditCustomer] = useState("");
  const [editArtedition, setEditArtedition] = useState("");
  const [editBuyer, setEditBuyer] = useState("");

  useEffect(() => {
    setSerials(serialNumberService.getSerialNumbers());
    setAllFiles(handoverService.getFiles());
  }, []);

  const reload = () => {
    setSerials(serialNumberService.getSerialNumbers());
    setAllFiles(handoverService.getFiles());
  };

  const getStatus = (s: SerialNumber) => {
    if (s.deleted) return "gelöscht";
    if (s.status === "Open") return "angelegt";
    
    // Delivered status logic
    const photos = allFiles.filter(f => f.serial_number_id === s.id && f.type === "image");
    if (photos.length === 0) return "geliefert - Bilder fehlen";
    return "geliefert";
  };

  const decodeSerial = (s: SerialNumber) => {
    const parts = [
      decodeFurniture(s.furnitureCode),
      decodeColor(s.colorCode),
      decodeFrame(s.frameCode),
      decodeCustomerType(s.customerType),
      ...(s.artedition !== "XX" ? [decodeArtedition(s.artedition)] : []),
    ];
    return parts.join(" • ");
  };

  const startEdit = (s: SerialNumber) => {
    setEditingId(s.id);
    setEditFurniture(s.furnitureCode);
    setEditColor(s.colorCode);
    setEditFrame(s.frameCode);
    setEditCustomer(s.customerType);
    setEditArtedition(s.artedition);
    setEditBuyer(s.buyerName);
  };

  const saveEdit = () => {
    if (!editingId) return;
    serialNumberService.updateSerialNumber(editingId, {
      furnitureCode: editFurniture,
      colorCode: editColor,
      frameCode: editFrame,
      customerType: editCustomer,
      artedition: editArtedition,
      buyerName: editBuyer,
    });
    setEditingId(null);
    reload();
  };

  const confirmDelete = () => {
    if (!deletingId || !deleteReason.trim()) return;
    serialNumberService.softDeleteSerialNumber(deletingId, deleteReason.trim());
    setDeletingId(null);
    setDeleteReason("");
    reload();
  };

  const downloadCSV = () => {
    const headers = ["Seriennummer", "Piece", "Farbe", "Gestell", "Kunde", "Art Edition", "Käufer", "Erstellt von", "Datum", "Status", "Löschgrund"];
    const rows = serials.map((s) => [
      s.fullSerial,
      decodeFurniture(s.furnitureCode),
      decodeColor(s.colorCode),
      decodeFrame(s.frameCode),
      decodeCustomerType(s.customerType),
      decodeArtedition(s.artedition),
      s.buyerName || "",
      s.createdBy,
      new Date(s.createdAt).toLocaleDateString("de-DE"),
      getStatus(s),
      s.deleteReason || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(";"))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `seriennummern_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.text("Seriennummern – höllental.", margin, y);
    y += 10;

    doc.setFontSize(8);
    doc.text(`Erstellt am ${new Date().toLocaleDateString("de-DE")}`, margin, y);
    y += 10;

    // Table header
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    const cols = [margin, 75, 100, 130, 160, 190, 215, 235, 260];
    const colHeaders = ["Seriennummer", "Status", "Käufer", "Piece", "Farbe", "Gestell", "Kunde", "Erstellt", "Datum"];
    colHeaders.forEach((h, i) => doc.text(h, cols[i], y));

    y += 2;
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    // Table rows
    doc.setFont("helvetica", "normal");
    for (const s of serials) {
      if (y > doc.internal.pageSize.getHeight() - 15) {
        doc.addPage();
        y = 20;
      }

      const rowData = [
        s.fullSerial,
        getStatus(s),
        s.buyerName || "—",
        decodeFurniture(s.furnitureCode),
        decodeColor(s.colorCode),
        decodeFrame(s.frameCode),
        decodeCustomerType(s.customerType),
        s.createdBy,
        new Date(s.createdAt).toLocaleDateString("de-DE"),
      ];

      if (s.deleted) {
        doc.setTextColor(160, 160, 160);
      } else {
        doc.setTextColor(17, 17, 17);
      }

      rowData.forEach((val, i) => doc.text(String(val), cols[i], y));

      if (s.deleted && s.deleteReason) {
        y += 4;
        doc.setTextColor(180, 80, 80);
        doc.text(`Grund: ${s.deleteReason}`, margin, y);
      }

      doc.setTextColor(17, 17, 17);
      y += 6;
    }

    doc.save(`seriennummern_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div>
      <div className="px-6 md:px-[90px] py-8 md:py-10 flex flex-col md:grid md:grid-cols-7 items-start md:items-baseline gap-6 md:gap-4">
        <div className="md:col-span-3">
          <h2 className="text-2xl md:text-3xl font-light tracking-tight">Seriennummern</h2>
        </div>
        <div className="md:col-span-4 flex flex-wrap md:justify-end gap-3 w-full md:w-auto">
          <button
            onClick={downloadCSV}
            disabled={serials.length === 0}
            className="border border-foreground px-4 py-1.5 text-sm hover:bg-foreground hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            CSV
          </button>
          <button
            onClick={downloadPDF}
            disabled={serials.length === 0}
            className="border border-foreground px-4 py-1.5 text-sm hover:bg-foreground hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            PDF
          </button>
        </div>
      </div>

      {serials.length === 0 ? (
        <div className="px-6 md:px-[90px]">
          <p className="text-muted text-sm">
            Bisher wurden keine Seriennummern vergeben.
          </p>
        </div>
      ) : (
        <div>
          {serials.map((serial) => (
            <div key={serial.id}>
              <div className="border-t border-border">
                <div className={`px-6 md:px-[90px] py-6 md:py-3 flex flex-col md:grid md:grid-cols-7 md:items-center gap-4 md:gap-4 ${serial.deleted ? "opacity-40" : ""}`}>
                  {/* Serial number – cols 1-2 */}
                  <div className={`md:col-span-2 text-xl md:text-2xl font-medium tracking-tight whitespace-nowrap ${serial.deleted ? "line-through" : ""}`}>
                    {serial.fullSerial}
                  </div>

                  {/* Status – col 3 */}
                  <div className="text-[10px] uppercase tracking-widest font-bold md:col-span-1">
                    <span className={
                      getStatus(serial) === "angelegt" ? "text-muted" :
                      getStatus(serial).includes("Bilder fehlen") ? "text-red-500" :
                      "text-foreground"
                    }>
                      {getStatus(serial)}
                    </span>
                  </div>

                  {/* Buyer name – col 4 */}
                  <div className="text-sm text-muted md:col-span-1">
                    {serial.deleted && serial.deleteReason ? (
                      <span className="text-red-500/70">{serial.deleteReason}</span>
                    ) : (
                      serial.buyerName || "—"
                    )}
                  </div>

                  {/* Decoded attributes – col 5 */}
                  <div className={`text-sm text-muted md:col-span-1 ${serial.deleted ? "line-through" : ""}`}>
                    {decodeSerial(serial)}
                  </div>

                  {/* Actions – col 6 */}
                  <div className="flex items-center md:justify-end gap-6 md:gap-3 py-2 md:py-0">
                    {!serial.deleted && (
                      <>
                        <button
                          onClick={async () => {
                            const { generateLabelPDF } = await import("@/lib/utils/labelPdf");
                            generateLabelPDF(serial.fullSerial);
                          }}
                          className="p-1 text-foreground hover:opacity-60 transition-opacity flex items-center gap-2"
                          title="Label PDF herunterladen"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                            <line x1="7" y1="7" x2="7.01" y2="7" />
                          </svg>
                          <span className="md:hidden text-xs uppercase tracking-widest font-bold">Label</span>
                        </button>
                        {handoverService.getAcceptanceBySerialId(serial.id) && (
                          <button
                            onClick={async () => {
                              const acc = handoverService.getAcceptanceBySerialId(serial.id);
                              if (acc) {
                                const { generateHandoverPDF } = await import("@/lib/utils/pdf");
                                const doc = generateHandoverPDF(serial, acc);
                                doc.save(`handover_${serial.fullSerial.replace(/\//g, "-")}.pdf`);
                              }
                            }}
                            className="p-1 text-foreground hover:opacity-60 transition-opacity flex items-center gap-2"
                            title="Handover PDF herunterladen"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10 9 9 9 8 9" />
                            </svg>
                            <span className="md:hidden text-xs uppercase tracking-widest font-bold">PDF</span>
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(serial)}
                          className="p-1 text-foreground hover:opacity-60 transition-opacity flex items-center gap-2"
                          title="Bearbeiten"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                          <span className="md:hidden text-xs uppercase tracking-widest font-bold">Edit</span>
                        </button>
                        <button
                          onClick={() => { setDeletingId(serial.id); setDeleteReason(""); }}
                          className="p-1 text-foreground hover:opacity-60 transition-opacity flex items-center gap-2"
                          title="Löschen"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                          <span className="md:hidden text-xs uppercase tracking-widest font-bold">Delete</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Creator and date – col 7 */}
                  <div className="text-xs text-muted md:text-right whitespace-nowrap leading-relaxed">
                    <div>
                      <span className="text-foreground">Erstellt:</span>{" "}
                      {serial.createdBy}
                    </div>
                    <div>
                      <span className="text-foreground">Datum:</span>{" "}
                      {new Date(serial.createdAt).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete reason input */}
              {deletingId === serial.id && (
                <div className="border-t border-border bg-neutral-50">
                  <div className="px-6 md:px-[90px] py-6 md:py-4 flex flex-col md:flex-row md:items-center gap-4">
                    <span className="text-sm text-muted shrink-0">Grund:</span>
                    <input
                      type="text"
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="Warum wird diese Nummer gelöscht?"
                      className="bg-transparent border-b border-border pb-1 text-sm outline-none flex-1"
                      autoFocus
                    />
                    <div className="flex items-center gap-6 mt-2 md:mt-0">
                      <button
                        onClick={confirmDelete}
                        disabled={!deleteReason.trim()}
                        className="text-sm text-foreground font-bold hover:underline disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        bestätigen
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="text-sm text-muted hover:text-foreground"
                      >
                        abbrechen
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit inline panel */}
              {editingId === serial.id && (
                <div className="border-t border-border bg-neutral-50">
                  <div className="px-6 md:px-[90px] py-8 md:py-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-6 md:gap-4 mb-8 md:mb-5">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider mb-2 text-muted">Piece</div>
                        <select value={editFurniture} onChange={(e) => setEditFurniture(e.target.value)} className="bg-transparent border-b border-border pb-1 text-sm outline-none w-full">
                          {Object.entries(MOEBEL_MAP).map(([c, n]) => <option key={c} value={c}>{c} – {n}</option>)}
                        </select>
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider mb-2 text-muted">Farbe</div>
                        <select value={editColor} onChange={(e) => setEditColor(e.target.value)} className="bg-transparent border-b border-border pb-1 text-sm outline-none w-full">
                          {Object.entries(FARBE_MAP).map(([c, n]) => <option key={c} value={c}>{c} – {n}</option>)}
                        </select>
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider mb-2 text-muted">Gestell</div>
                        <select value={editFrame} onChange={(e) => setEditFrame(e.target.value)} className="bg-transparent border-b border-border pb-1 text-sm outline-none w-full">
                          {Object.entries(GESTELL_MAP).map(([c, n]) => <option key={c} value={c}>{c} – {n}</option>)}
                        </select>
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider mb-2 text-muted">Kunde</div>
                        <select value={editCustomer} onChange={(e) => setEditCustomer(e.target.value)} className="bg-transparent border-b border-border pb-1 text-sm outline-none w-full">
                          {Object.entries(KUNDE_MAP).map(([c, n]) => <option key={c} value={c}>{c} – {n}</option>)}
                        </select>
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider mb-2 text-muted">Art Edition</div>
                        <select value={editArtedition} onChange={(e) => setEditArtedition(e.target.value)} className="bg-transparent border-b border-border pb-1 text-sm outline-none w-full">
                          {Object.entries(ARTEDITION_MAP).map(([c, n]) => <option key={c} value={c}>{c} – {n}</option>)}
                        </select>
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider mb-2 text-muted">Käufer</div>
                        <input
                          type="text"
                          value={editBuyer}
                          onChange={(e) => setEditBuyer(e.target.value)}
                          className="bg-transparent border-b border-border pb-1 text-sm outline-none w-full"
                        />
                      </div>
                      <div className="flex items-end gap-6 md:gap-3 justify-end mt-4 md:mt-0">
                        <button onClick={saveEdit} className="text-sm text-foreground font-bold hover:underline">
                          speichern
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-sm text-muted hover:text-foreground">
                          abbrechen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="border-t border-border" />
        </div>
      )}
    </div>
  );
}
