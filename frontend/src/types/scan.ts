export type ScanRecord = {
  plate: string;
  status: "ALLOWED" | "DENIED";
  confidence: number;
  timestamp: string;
  verification?: string;
  owner?: string;
  owner_name?: string;
  designation?: string;
  department?: string;
  vehicle_type?: string;
  vehicle_color?: string;
  plate_type?: string;
  make?: string;
  model?: string;
  phone?: string;
  email?: string;
  match_type?: string;
};

export function mapApiScan(data: Record<string, unknown>): ScanRecord {
  return {
    plate: String(data.plate || data.plate_number || "Unknown"),
    status: (data.status as ScanRecord["status"]) || "DENIED",
    confidence: Number(data.confidence ?? 0),
    timestamp: String(data.timestamp || new Date().toISOString()),
    verification: data.verification ? String(data.verification) : undefined,
    owner: String(data.owner || data.owner_name || "Unknown"),
    owner_name: String(data.owner_name || data.owner || "Unknown"),
    designation: String(data.designation || "—"),
    department: String(data.department || "—"),
    vehicle_type: String(data.vehicle_type || "Unknown"),
    vehicle_color: String(data.vehicle_color || "Unknown"),
    plate_type: String(data.plate_type || "Unknown"),
    make: String(data.make || "—"),
    model: String(data.model || "—"),
    phone: String(data.phone || "—"),
    email: String(data.email || "—"),
    match_type: String(data.match_type || "none"),
  };
}
