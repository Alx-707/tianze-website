import { describe, expect, it } from "vitest";
import {
  ALLOWED_FILE_TYPES,
  generateSafeFileName,
  getFileCategory,
  sanitizeFileName,
  validateFileSignature,
  validateFileUpload,
  validateMultipleFiles,
  type FileValidationResult,
} from "@/lib/security-file-upload";

const createFile = (bytes: number[], name: string, type: string) =>
  new File([new Uint8Array(bytes)], name, { type });

describe("security-file-upload", () => {
  it("rejects disallowed mime types and dangerous names", () => {
    const file = createFile(
      [1, 2, 3],
      "payload.exe",
      "application/octet-stream",
    );
    const result = validateFileUpload(file);

    expect(result.valid).toBe(false);
    expect(result.error).toContain("not allowed");
  });

  it("validates png signature and detects mismatch", async () => {
    const validPng = {
      type: "image/png",
      arrayBuffer: async () => Uint8Array.from([0x89, 0x50, 0x4e, 0x47]).buffer,
    } as unknown as File;

    const invalidPng = createFile(
      [0x00, 0x01, 0x02, 0x03],
      "b.png",
      "image/png",
    );

    const ok: FileValidationResult = await validateFileSignature(validPng);
    const bad: FileValidationResult = await validateFileSignature(invalidPng);

    expect(ok.valid).toBe(true);
    expect(bad.valid).toBe(false);
    expect(bad.error).toContain("signature");
  });

  it("enforces file count and total size in validateMultipleFiles", () => {
    const small = createFile(new Array(2048).fill(1), "a.jpg", "image/jpeg");
    const files = [small, small, small];

    const tooMany = validateMultipleFiles(files, { maxFiles: 2 });
    expect(tooMany.valid).toBe(false);

    const oversized = validateMultipleFiles(files, {
      maxTotalSizeMB: 0.000001,
    });
    expect(oversized.valid).toBe(false);
  });

  it("classifies file category and generates safe names", () => {
    const img = createFile([1], "photo.png", "image/png");
    expect(getFileCategory(img)).toBe("images");

    const safe = generateSafeFileName("räw name!.png", "prefix");
    expect(safe).toMatch(/^prefix_r_w_name_\d+\.png$/);
    expect(sanitizeFileName("!!bad//name!!")).toBe("bad_name");
  });

  it("respects allowed categories override", () => {
    const doc = createFile([1], "doc.pdf", "application/pdf");
    const result = validateFileUpload(doc, {
      allowedCategories: ["documents"],
    });
    expect(result.valid).toBe(true);

    const archive = createFile([1], "data.zip", "application/zip");
    const blocked = validateFileUpload(archive, {
      allowedTypes: [...ALLOWED_FILE_TYPES.images],
    });
    expect(blocked.valid).toBe(false);
  });
});
