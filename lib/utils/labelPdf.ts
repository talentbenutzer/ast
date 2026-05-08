import { jsPDF } from "jspdf";

/**
 * Generates a small label PDF (40mm × 15mm) with a black background
 * and the serial number in white text using the page's font (Neue Montreal / Inter).
 * Uses an off-screen canvas to render the text with the browser font,
 * then embeds it as a high-resolution image in the PDF.
 */
export const generateLabelPDF = (serialNumber: string): void => {
  // Label dimensions in mm
  const labelWidthMM = 40;
  const labelHeightMM = 15;

  // High-res canvas for crisp output (4x scale for 300+ DPI)
  const scale = 4;
  const mmToPx = 3.7795; // 1mm ≈ 3.78px at 96dpi
  const canvasWidth = Math.round(labelWidthMM * mmToPx * scale);
  const canvasHeight = Math.round(labelHeightMM * mmToPx * scale);

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Black background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // White text with the project's font stack
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Use the CSS variable font (Neue Montreal / Inter) – try multiple weights
  const fontSize = Math.round(canvasHeight * 0.32);
  ctx.font = `500 ${fontSize}px "Neue Montreal", var(--font-neue-montreal), Inter, "Helvetica Neue", Arial, sans-serif`;

  // Measure and auto-scale if text is too wide
  let textWidth = ctx.measureText(serialNumber).width;
  const maxWidth = canvasWidth * 0.88; // 6% padding each side

  if (textWidth > maxWidth) {
    const scaledFontSize = Math.round(fontSize * (maxWidth / textWidth));
    ctx.font = `500 ${scaledFontSize}px "Neue Montreal", var(--font-neue-montreal), Inter, "Helvetica Neue", Arial, sans-serif`;
    textWidth = ctx.measureText(serialNumber).width;
  }

  ctx.fillText(serialNumber, canvasWidth / 2, canvasHeight / 2 + 1);

  // Convert canvas to image and embed in PDF
  const imgData = canvas.toDataURL("image/png");

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [labelWidthMM, labelHeightMM],
  });

  doc.addImage(imgData, "PNG", 0, 0, labelWidthMM, labelHeightMM);
  doc.save(`label_${serialNumber.replace(/\//g, "-")}.pdf`);
};
