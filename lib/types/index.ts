export type Employee = {
  id: string;
  name: string;
  createdAt: string;
};

export type SerialNumberStatus = "Open" | "Delivered";

export type Acceptance = {
  id: string;
  serial_number_id: string;
  customer_first_name: string;
  customer_last_name: string;
  address: string;
  delivered_at: string;
  delivered: boolean;
  assembled: boolean;
  location: string;
  created_by: string; // Employee ID or Name
  created_at: string;
  customer_signature?: string; // Base64
  employee_signature?: string; // Base64
};

export type FileRecord = {
  id: string;
  serial_number_id: string;
  type: "pdf" | "image";
  storage_path: string;
  created_at: string;
};

export type SerialNumber = {
  id: string;
  year: string;
  productionNumber: string;
  furnitureCode: string;
  colorCode: string;
  frameCode: string;
  customerType: string;
  artedition: string;
  buyerName: string;
  createdBy: string; // Employee ID or name
  status: SerialNumberStatus;
  createdAt: string;
  fullSerial: string;
  deleted?: boolean;
  deleteReason?: string;
};

export type FeedbackStatus = "open" | "done";

export type Feedback = {
  id: string;
  message: string;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
};
