import { Acceptance, FileRecord, SerialNumber } from "../types";
import { serialNumberService } from "./serialNumberService";

const ACCEPTANCE_KEY = "ast_acceptance";
const FILES_KEY = "ast_files";

export const handoverService = {
  getAcceptances: (): Acceptance[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(ACCEPTANCE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  getFiles: (): FileRecord[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(FILES_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  completeHandover: async (
    acceptanceData: Omit<Acceptance, "id" | "created_at">
  ): Promise<{ acceptance: Acceptance; pdfFile: FileRecord }> => {
    // 1. Create Acceptance Record
    const acceptances = handoverService.getAcceptances();
    const newAcceptance: Acceptance = {
      ...acceptanceData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    
    // 2. Save PDF Reference (In a real app, we'd upload to Supabase here)
    const files = handoverService.getFiles();
    const pdfFile: FileRecord = {
      id: crypto.randomUUID(),
      serial_number_id: acceptanceData.serial_number_id,
      type: "pdf",
      storage_path: `serial/${acceptanceData.serial_number_id}/pdf/handover_${newAcceptance.id}.pdf`,
      created_at: new Date().toISOString(),
    };

    // 3. Update Serial Number Status
    const serials = serialNumberService.getSerialNumbers();
    const serialIndex = serials.findIndex(s => s.id === acceptanceData.serial_number_id);
    if (serialIndex !== -1) {
      serials[serialIndex].status = "Delivered";
      localStorage.setItem("ast_serial_numbers", JSON.stringify(serials));
    }

    // Persist
    localStorage.setItem(ACCEPTANCE_KEY, JSON.stringify([newAcceptance, ...acceptances]));
    localStorage.setItem(FILES_KEY, JSON.stringify([pdfFile, ...files]));

    return { acceptance: newAcceptance, pdfFile };
  },

  getAcceptanceBySerialId: (serialId: string): Acceptance | undefined => {
    return handoverService.getAcceptances().find(a => a.serial_number_id === serialId);
  },

  uploadPhotos: async (serialId: string, files: File[]): Promise<FileRecord[]> => {
    const existingFiles = handoverService.getFiles();
    const newFileRecords: FileRecord[] = [];

    for (const file of files) {
      const record: FileRecord = {
        id: crypto.randomUUID(),
        serial_number_id: serialId,
        type: "image",
        storage_path: `serial/${serialId}/images/${file.name}`,
        created_at: new Date().toISOString(),
      };
      newFileRecords.push(record);
    }

    localStorage.setItem(FILES_KEY, JSON.stringify([...newFileRecords, ...existingFiles]));
    return newFileRecords;
  },

  getFilesBySerialId: (serialId: string): FileRecord[] => {
    return handoverService.getFiles().filter(f => f.serial_number_id === serialId);
  }
};
