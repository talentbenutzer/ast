"use client";

import { useState } from "react";
import { serialNumberService } from "@/lib/services/serialNumberService";
import { SerialNumber } from "@/lib/types";

export default function InternPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage("");
    setError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split("\n");
        
        if (lines.length <= 1) {
          setError("Die Datei ist leer oder enthält nur Header.");
          return;
        }

        // Skip header
        const dataLines = lines.slice(1);
        
        const existingSerials = serialNumberService.getSerialNumbers();
        const existingFullSerials = new Set(existingSerials.map(s => s.fullSerial));
        
        const newSerials: SerialNumber[] = [];
        let skippedCount = 0;
        
        for (const line of dataLines) {
          if (!line.trim()) continue;
          
          // Split by semicolon and remove quotes
          const cells = line.split(";").map(cell => cell.replace(/^"|"$/g, '').trim());
          
          const fullSerial = cells[0];
          if (!fullSerial) continue;
          
          // Skip if already exists
          if (existingFullSerials.has(fullSerial)) {
            skippedCount++;
            continue;
          }
          
          // Parse fullSerial: Year/ProductionNumber/FurnitureCode/ColorCode/FrameCode/CustomerType/Artedition
          const parts = fullSerial.split("/");
          if (parts.length < 6) {
            console.warn(`Ungültiges Seriennummern-Format: ${fullSerial}`);
            continue;
          }
          
          const year = parts[0];
          const productionNumber = parts[1];
          const furnitureCode = parts[2];
          const colorCode = parts[3];
          const frameCode = parts[4];
          const customerType = parts[5];
          const artedition = parts[6] || "XX";
          
          const buyerName = cells[6] || "";
          const createdBy = cells[7] || "System";
          const createdAtStr = cells[8] || "";
          const statusStr = cells[9] || "Open";
          const deleteReason = cells[10] || "";
          
          // Parse date (DD.MM.YYYY to ISO)
          let createdAt = new Date().toISOString();
          if (createdAtStr) {
            const dateParts = createdAtStr.split(".");
            if (dateParts.length === 3) {
              const [day, month, yearFull] = dateParts;
              createdAt = new Date(`${yearFull}-${month}-${day}`).toISOString();
            }
          }
          
          let status = "Open";
          if (statusStr.includes("geliefert")) status = "Delivered";
          
          const deleted = statusStr === "gelöscht";
          
          newSerials.push({
            id: crypto.randomUUID(),
            year,
            productionNumber,
            furnitureCode,
            colorCode,
            frameCode,
            customerType,
            artedition,
            buyerName,
            createdBy,
            createdAt,
            status: status as any,
            fullSerial,
            deleted,
            deleteReason: deleted ? deleteReason : undefined,
          });
        }
        
        if (newSerials.length > 0) {
          // Append new (old) serials to the end of the existing list
          const updated = [...existingSerials, ...newSerials];
          localStorage.setItem("ast_serial_numbers", JSON.stringify(updated));
          setMessage(`${newSerials.length} neue Seriennummern erfolgreich hinzugefügt. ${skippedCount} wurden übersprungen (bereits vorhanden).`);
        } else {
          setMessage(`Keine neuen Seriennummern hinzugefügt. ${skippedCount} wurden übersprungen.`);
        }
      } catch (err) {
        console.error("Fehler beim Verarbeiten der CSV:", err);
        setError("Fehler beim Verarbeiten der Datei. Bitte überprüfe das Format.");
      }
      
      // Reset file input
      e.target.value = "";
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="px-6 md:px-[90px] py-10">
      <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-10">Intern</h2>
      
      <div className="border-t border-border pt-10">
        <h3 className="text-xl font-light mb-4">Seriennummern importieren (.CSV)</h3>
        <p className="text-sm text-muted mb-6">
          Lade hier eine exportierte CSV-Datei hoch, um alte Seriennummern hinzuzufügen. 
          Bestehende Nummern werden dabei nicht überschrieben oder gelöscht.
        </p>

        <div className="mb-6">
          <input
            type="file"
            accept=".csv"
            onChange={handleUpload}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="inline-block border border-foreground px-8 py-4 md:py-3 text-sm font-medium tracking-wide hover:bg-foreground hover:text-white transition-colors cursor-pointer w-full md:w-auto text-center"
          >
            Datei auswählen
          </label>
        </div>

        {message && (
          <div className="p-4 bg-green-50 text-green-700 text-sm rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
