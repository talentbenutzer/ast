import { SerialNumber } from "../types";

const SERIALS_KEY = "ast_serial_numbers";

export const serialNumberService = {
  getSerialNumbers: (): SerialNumber[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(SERIALS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  getNextProductionNumber: (): string => {
    const serials = serialNumberService.getSerialNumbers();
    if (serials.length === 0) return "0001";

    const lastNumber = Math.max(
      ...serials.map((s) => parseInt(s.productionNumber, 10))
    );
    const nextNumber = lastNumber + 1;
    return nextNumber.toString().padStart(4, "0");
  },

  generateSerialNumberString: (params: {
    year: string;
    productionNumber: string;
    furnitureCode: string;
    colorCode: string;
    frameCode: string;
    customerType: string;
    artedition: string;
  }): string => {
    return `${params.year}/${params.productionNumber}/${params.furnitureCode}/${params.colorCode}/${params.frameCode}/${params.customerType}/${params.artedition}`;
  },

  createSerialNumber: (
    data: Omit<SerialNumber, "id" | "productionNumber" | "createdAt" | "status" | "fullSerial" | "year">
  ): SerialNumber => {
    const serials = serialNumberService.getSerialNumbers();
    const productionNumber = serialNumberService.getNextProductionNumber();
    const year = new Date().getFullYear().toString().slice(-2);
    
    const fullSerial = serialNumberService.generateSerialNumberString({
      year,
      productionNumber,
      furnitureCode: data.furnitureCode,
      colorCode: data.colorCode,
      frameCode: data.frameCode,
      customerType: data.customerType,
      artedition: data.artedition,
    });

    const newSerialNumber: SerialNumber = {
      ...data,
      id: crypto.randomUUID(),
      year,
      productionNumber,
      status: "Open",
      createdAt: new Date().toISOString(),
      fullSerial,
    };

    const updated = [newSerialNumber, ...serials];
    localStorage.setItem(SERIALS_KEY, JSON.stringify(updated));
    return newSerialNumber;
  },

  updateSerialNumber: (
    id: string,
    data: Pick<SerialNumber, "furnitureCode" | "colorCode" | "frameCode" | "customerType" | "artedition" | "buyerName">
  ): SerialNumber | null => {
    const serials = serialNumberService.getSerialNumbers();
    const index = serials.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const existing = serials[index];
    const fullSerial = serialNumberService.generateSerialNumberString({
      year: existing.year,
      productionNumber: existing.productionNumber,
      furnitureCode: data.furnitureCode,
      colorCode: data.colorCode,
      frameCode: data.frameCode,
      customerType: data.customerType,
      artedition: data.artedition,
    });

    const updatedSerial: SerialNumber = {
      ...existing,
      ...data,
      fullSerial,
    };

    serials[index] = updatedSerial;
    localStorage.setItem(SERIALS_KEY, JSON.stringify(serials));
    return updatedSerial;
  },

  softDeleteSerialNumber: (id: string, reason: string): SerialNumber | null => {
    const serials = serialNumberService.getSerialNumbers();
    const index = serials.findIndex((s) => s.id === id);
    if (index === -1) return null;

    serials[index] = {
      ...serials[index],
      deleted: true,
      deleteReason: reason,
    };

    localStorage.setItem(SERIALS_KEY, JSON.stringify(serials));
    return serials[index];
  },
};
