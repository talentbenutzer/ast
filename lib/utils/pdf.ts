import { jsPDF } from "jspdf";
import { SerialNumber, Acceptance } from "../types";
import {
  decodeFurniture,
  decodeColor,
  decodeFrame,
  decodeArtedition,
} from "./mappings";

export const generateHandoverPDF = (
  serial: SerialNumber,
  acceptance: Acceptance
): jsPDF => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 20;
  let y = 20;

  // Brand
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("höllental.", margin, y);
  y += 15;

  doc.setFontSize(14);
  doc.text("Übergabe- & Abnahmeprotokoll", margin, y);
  y += 15;

  // Serial & Product
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Seriennummer:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(serial.fullSerial, margin + 40, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.text("Produkt:", margin, y);
  doc.setFont("helvetica", "normal");
  const productDesc = [
    decodeFurniture(serial.furnitureCode),
    decodeColor(serial.colorCode),
    decodeFrame(serial.frameCode),
    ...(serial.artedition !== "XX" ? [decodeArtedition(serial.artedition)] : [])
  ].join(" • ");
  doc.text(productDesc, margin + 40, y);
  y += 15;

  // Customer
  doc.setFont("helvetica", "bold");
  doc.text("Kunde:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${acceptance.customer_first_name} ${acceptance.customer_last_name}`, margin + 40, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.text("Lieferadresse:", margin, y);
  doc.setFont("helvetica", "normal");
  const addressText = String(acceptance.address || "");
  const splitAddress = doc.splitTextToSize(addressText, 120);
  doc.text(splitAddress, margin + 40, y);
  y += (splitAddress.length * 5) + 5;

  // Delivery Status
  doc.setFont("helvetica", "bold");
  doc.text("Lieferdatum:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(acceptance.delivered_at).toLocaleDateString("de-DE"), margin + 40, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.text("Status:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${acceptance.delivered ? "[x] geliefert" : "[ ] geliefert"}   ${acceptance.assembled ? "[x] montiert" : "[ ] montiert"}`, margin + 40, y);
  y += 20;

  // Signatures
  const sigWidth = 70;
  const sigHeight = 30;
  
  if (acceptance.customer_signature) {
    doc.text("Unterschrift Kunde", margin, y);
    try {
      doc.addImage(acceptance.customer_signature, "PNG", margin, y + 2, sigWidth, sigHeight);
    } catch (e) {
      console.warn("Could not add customer signature image", e);
    }
  }

  if (acceptance.employee_signature) {
    doc.text("Unterschrift Mitarbeiter", margin + 90, y);
    try {
      doc.addImage(acceptance.employee_signature, "PNG", margin + 90, y + 2, sigWidth, sigHeight);
    } catch (e) {
      console.warn("Could not add employee signature image", e);
    }
  }
  y += 45;

  // Footer
  doc.setFontSize(8);
  const locationText = String(acceptance.location || "Unbekannt");
  doc.text(`${locationText}, ${new Date(acceptance.created_at).toLocaleDateString("de-DE")}`, margin, y);
  
  return doc;
};
