import { z } from "zod";

// Input Types
export enum MachineType {
  L = "L",
  M = "M",
  H = "H"
}

export const formSchema = z.object({
  type: z.nativeEnum(MachineType),
  airTemp: z.number().min(0, "Air temperature must be positive").max(500, "Unrealistic temperature"),
  processTemp: z.number().min(0, "Process temperature must be positive").max(500, "Unrealistic temperature"),
  rotationalSpeed: z.number().int().min(0, "Speed cannot be negative").max(10000, "Exceeds max RPM"),
  torque: z.number().min(0, "Torque cannot be negative"),
  toolWear: z.number().int().min(0, "Tool wear cannot be negative"),
});

export type FormValues = z.infer<typeof formSchema>;

// API Types
export interface PredictionRequest {
  "Type": string;
  "Air temperature [K]": number;
  "Process temperature [K]": number;
  "Rotational speed [rpm]": number;
  "Torque [Nm]": number;
  "Tool wear [min]": number;
}

export interface PredictionResponse {
  failure_probability: number;
  predicted_failure_type?: string; // Assuming API might return this, or just prob
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  status: 'Normal' | 'Failure Imminent';
  probability: number;
  type: MachineType;
}