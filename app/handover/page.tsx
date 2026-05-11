"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { employeeService } from "@/lib/services/employeeService";
import { serialNumberService } from "@/lib/services/serialNumberService";
import { handoverService } from "@/lib/services/handoverService";
import { Employee, SerialNumber, FileRecord, Acceptance } from "@/lib/types";
import {
  decodeFurniture,
  decodeColor,
  decodeFrame,
  decodeArtedition,
} from "@/lib/utils/mappings";
import { SignaturePad } from "@/components/ui/SignaturePad";

export default function HandoverPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [serials, setSerials] = useState<SerialNumber[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentSerialId, setCurrentSerialId] = useState("");

  // Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedSerialId, setSelectedSerialId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split("T")[0]);
  const [isDelivered, setIsDelivered] = useState(true);
  const [isAssembled, setIsAssembled] = useState(false);
  const [customerSignature, setCustomerSignature] = useState("");
  const [employeeSignature, setEmployeeSignature] = useState("");

  // Photo State
  const [uploadedPhotos, setUploadedPhotos] = useState<FileRecord[]>([]);

  useEffect(() => {
    employeeService.getEmployees().then(setEmployees);
    // Only show non-delivered serials for selection
    const allSerials = serialNumberService.getSerialNumbers();
    setSerials(allSerials.filter((s) => s.status !== "Delivered" && !s.deleted));

    const activeEmp = employeeService.getActiveEmployee();
    if (activeEmp) setSelectedEmployeeId(activeEmp.id);
  }, []);

  const selectedSerial = serials.find((s) => s.id === selectedSerialId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSerial || !selectedEmployeeId || !customerSignature || !employeeSignature) {
      alert("Bitte alle erforderlichen Felder ausfüllen (inkl. Unterschriften).");
      return;
    }

    setIsSubmitting(true);

    try {
      const emp = employees.find((e) => e.id === selectedEmployeeId);
      
      const accData: Omit<Acceptance, "id" | "created_at"> = {
        serial_number_id: selectedSerial.id,
        customer_first_name: firstName,
        customer_last_name: lastName,
        address,
        delivered_at: deliveryDate,
        delivered: isDelivered,
        assembled: isAssembled,
        location: address.split(",")[0].trim() || "Unbekannt",
        created_by: emp?.name || "System",
        customer_signature: customerSignature,
        employee_signature: employeeSignature,
      };

      // 1. Generate and Download PDF
      const { generateHandoverPDF } = await import("@/lib/utils/pdf");
      const doc = generateHandoverPDF(selectedSerial, {
        ...accData,
        id: "temp",
        created_at: new Date().toISOString(),
      });
      doc.save(`ast_handover_${selectedSerial.fullSerial.replace(/\//g, "-")}.pdf`);

      // 2. Complete Handover
      await handoverService.completeHandover(accData);

      setCurrentSerialId(selectedSerial.id);
      setIsFinished(true);
    } catch (error) {
      console.error("Handover failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !currentSerialId) return;
    const files = Array.from(e.target.files);
    await handoverService.uploadPhotos(currentSerialId, files);
    setUploadedPhotos(handoverService.getFilesBySerialId(currentSerialId).filter(f => f.type === "image"));
  };

  if (isFinished) {
    return (
      <div className="px-6 md:px-[90px] py-10">
        <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-10">Fotos hochladen</h2>
        <div className="border-t border-border pt-10">
          <div className="mb-10">
            <p className="text-sm text-muted mb-6">Handover erfolgreich abgeschlossen. Bitte laden Sie Fotos des ausgelieferten Produkts hoch.</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="inline-block border border-foreground px-8 py-4 md:py-3 text-sm font-medium tracking-wide hover:bg-foreground hover:text-white transition-colors cursor-pointer w-full md:w-auto text-center"
            >
              + Fotos auswählen
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedPhotos.map((photo) => (
              <div key={photo.id} className="aspect-square bg-neutral-100 border border-border flex items-center justify-center overflow-hidden">
                <span className="text-[10px] text-muted p-4 text-center break-all">{photo.storage_path}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-20 flex justify-end">
            <button
              onClick={() => router.push("/list")}
              className="w-full md:w-auto bg-foreground text-white px-8 py-4 md:py-3 text-sm font-medium tracking-wide hover:bg-accent-hover transition-colors"
            >
              Zur Liste
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="px-6 md:px-[90px] py-10">
        <h2 className="text-2xl md:text-3xl font-light tracking-tight">Übergabe / Abnahme</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section 1: Basis-Daten */}
        <div className="border-t border-border">
          <div className="px-6 md:px-[90px] py-10 grid grid-cols-1 md:grid-cols-7 gap-10">
            <div className="md:col-span-2">
              <div className="text-xs font-bold uppercase tracking-wider mb-4 text-muted">Mitarbeiter *</div>
              <select
                required
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="bg-transparent border-b border-border pb-1 text-sm outline-none w-full appearance-none"
              >
                <option value="" disabled>Bitte wählen...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <div className="text-xs font-bold uppercase tracking-wider mb-4 text-muted">Seriennummer *</div>
              <select
                required
                value={selectedSerialId}
                onChange={(e) => setSelectedSerialId(e.target.value)}
                className="bg-transparent border-b border-border pb-1 text-sm outline-none w-full appearance-none"
              >
                <option value="" disabled>Bitte wählen...</option>
                {serials.map((s) => (
                  <option key={s.id} value={s.id}>{s.fullSerial} ({s.buyerName || "Kein Name"})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Produkt-Details */}
        {selectedSerial && (
          <div className="border-t border-border bg-neutral-50/50">
            <div className="px-6 md:px-[90px] py-10">
              <div className="text-xs font-bold uppercase tracking-wider mb-8 text-muted">Produkt-Details</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-8">
                <div>
                  <div className="text-[10px] uppercase text-muted mb-1">Möbel</div>
                  <div className="text-sm font-medium">{decodeFurniture(selectedSerial.furnitureCode)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted mb-1">Farbe</div>
                  <div className="text-sm font-medium">{decodeColor(selectedSerial.colorCode)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted mb-1">Gestell</div>
                  <div className="text-sm font-medium">{decodeFrame(selectedSerial.frameCode)}</div>
                </div>
                {selectedSerial.artedition !== "XX" && (
                  <div>
                    <div className="text-[10px] uppercase text-muted mb-1">Art Edition</div>
                    <div className="text-sm font-medium">{decodeArtedition(selectedSerial.artedition)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Kunden-Daten */}
        <div className="border-t border-border">
          <div className="px-6 md:px-[90px] py-10">
            <div className="text-xs font-bold uppercase tracking-wider mb-8 text-muted">Kunden-Daten</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
              <div>
                <div className="text-[10px] uppercase text-muted mb-2">Vorname</div>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-transparent border-b border-border pb-1 text-sm outline-none w-full"
                />
              </div>
              <div>
                <div className="text-[10px] uppercase text-muted mb-2">Nachname</div>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-transparent border-b border-border pb-1 text-sm outline-none w-full"
                />
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted mb-2">Lieferadresse</div>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-transparent border-b border-border pb-1 text-sm outline-none w-full resize-none"
                placeholder="Straße, Hausnummer, PLZ Ort"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Liefer-Daten */}
        <div className="border-t border-border">
          <div className="px-6 md:px-[90px] py-10 grid grid-cols-1 md:grid-cols-7 gap-10">
            <div className="md:col-span-2">
              <div className="text-xs font-bold uppercase tracking-wider mb-6 text-muted">Liefer-Daten</div>
              <div className="text-[10px] uppercase text-muted mb-2">Lieferdatum</div>
              <input
                type="date"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="bg-transparent border-b border-border pb-1 text-sm outline-none w-full appearance-none"
              />
            </div>
            <div className="md:col-span-5 flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-10 pb-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-6 h-6 border flex items-center justify-center transition-colors ${isDelivered ? 'bg-foreground border-foreground' : 'border-border group-hover:border-foreground'}`}>
                  {isDelivered && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <input type="checkbox" className="hidden" checked={isDelivered} onChange={(e) => setIsDelivered(e.target.checked)} />
                <span className="text-sm">geliefert</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-6 h-6 border flex items-center justify-center transition-colors ${isAssembled ? 'bg-foreground border-foreground' : 'border-border group-hover:border-foreground'}`}>
                  {isAssembled && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <input type="checkbox" className="hidden" checked={isAssembled} onChange={(e) => setIsAssembled(e.target.checked)} />
                <span className="text-sm">montiert</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 5: Unterschriften */}
        <div className="border-t border-border">
          <div className="px-6 md:px-[90px] py-10 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20">
            <SignaturePad label="Unterschrift Kunde" onSave={setCustomerSignature} />
            <SignaturePad label="Unterschrift Mitarbeiter" onSave={setEmployeeSignature} />
          </div>
        </div>

        {/* Submit */}
        <div className="border-t border-border">
          <div className="px-6 md:px-[90px] py-10 flex flex-col md:flex-row md:justify-end md:items-center gap-8">
            <div className="text-[10px] uppercase text-muted tracking-widest order-2 md:order-1">
              Ort, Datum: {address.split(",")[0].trim() || "..." }, {new Date().toLocaleDateString("de-DE")}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto bg-foreground text-white px-12 py-5 md:py-4 text-sm font-medium tracking-wide hover:bg-accent-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed order-1 md:order-2"
            >
              {isSubmitting ? "Wird verarbeitet..." : "Übergabe abschließen"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
