export type MdDoctor = {
  mdDoctorId?: number | string;
  doctorId?: number | string;
  doctorName?: string;
  doctorMailId?: string;
  doctorMobileNumber?: number | string;
  labName?: string;
  labId?: number | string;
  educationQulification?: string;
  signUrl?: string | null;
  signImage?: string | number[] | { type?: string; data?: number[] } | null;
  active?: boolean;
  isActive?: boolean;
  signPosition?: number | string;
  createdBy?: number | string;
};

export function getMdDoctorId(doctor: MdDoctor) {
  return doctor.mdDoctorId ?? doctor.doctorId;
}

function detectImageMimeType(base64: string) {
  if (base64.startsWith("iVBOR")) return "image/png";
  if (base64.startsWith("/9j/")) return "image/jpeg";
  if (base64.startsWith("R0lGOD")) return "image/gif";
  if (base64.startsWith("UklGR")) return "image/webp";
  if (base64.startsWith("PHN2Zy")) return "image/svg+xml";
  return "image/png";
}

function byteArrayToDataUrl(bytes: number[]) {
  if (bytes.length === 0 || bytes.some((byte) => !Number.isInteger(byte) || byte < 0 || byte > 255)) {
    return null;
  }

  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.slice(offset, offset + 0x8000));
  }
  const base64 = btoa(binary);
  return `data:${detectImageMimeType(base64)};base64,${base64}`;
}

export function getMdDoctorSignatureSource(doctor: Pick<MdDoctor, "signImage" | "signUrl">) {
  const image = doctor.signImage;
  if (Array.isArray(image)) return byteArrayToDataUrl(image);
  if (image && typeof image === "object" && Array.isArray(image.data)) {
    return byteArrayToDataUrl(image.data);
  }

  const value = typeof image === "string" && image ? image : doctor.signUrl;
  if (!value) return null;
  if (/^(data:image\/|https?:\/\/|\/)/i.test(value)) return value;

  const byteaHex = value.match(/^\\x([0-9a-f]+)$/i);
  if (byteaHex) {
    const bytes = byteaHex[1].match(/.{2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? [];
    return byteArrayToDataUrl(bytes);
  }

  const base64 = value.replace(/\s/g, "");
  if (!/^[a-z0-9+/]+={0,2}$/i.test(base64)) return null;
  return `data:${detectImageMimeType(base64)};base64,${base64}`;
}

export type MdDoctorListResponse =
  | MdDoctor[]
  | {
      data?: MdDoctor[];
      result?: MdDoctor[];
      doctors?: MdDoctor[];
      statusCode?: number;
      message?: string;
    };

export function resolveMdDoctorList(payload: MdDoctorListResponse) {
  if (Array.isArray(payload)) return payload;
  return payload.data ?? payload.result ?? payload.doctors ?? [];
}
