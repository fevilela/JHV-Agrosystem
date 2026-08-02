import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const { upload, remove, getPublicUrl } = vi.hoisted(() => ({
  upload: vi.fn(),
  remove: vi.fn(),
  getPublicUrl: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: () => ({ upload, remove, getPublicUrl }),
    },
  })),
}));

import { extractObjectPath, saveUploadedFile, deleteUploadedFile } from "./upload";

describe("extractObjectPath", () => {
  it("extracts the object path from a Supabase Storage public URL", () => {
    const url =
      "https://xyzcompany.supabase.co/storage/v1/object/public/uploads/animals/abc123/photos/def456.jpg";
    expect(extractObjectPath(url)).toBe("animals/abc123/photos/def456.jpg");
  });

  it("returns null for a URL that isn't a Supabase Storage public URL", () => {
    expect(extractObjectPath("https://example.com/foo.jpg")).toBeNull();
    expect(extractObjectPath("/uploads/animals/abc123/photos/def456.jpg")).toBeNull();
  });
});

describe("saveUploadedFile / deleteUploadedFile", () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = "https://xyzcompany.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
    upload.mockReset();
    remove.mockReset();
    getPublicUrl.mockReset();
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("uploads the file bytes and returns the public URL + original file name", async () => {
    upload.mockResolvedValue({ error: null });
    getPublicUrl.mockReturnValue({
      data: {
        publicUrl:
          "https://xyzcompany.supabase.co/storage/v1/object/public/uploads/animals/abc/photos/x.jpg",
      },
    });

    const file = new File(["conteudo"], "foto.jpg", { type: "image/jpeg" });
    const result = await saveUploadedFile(file, "animals/abc/photos");

    expect(upload).toHaveBeenCalledOnce();
    const [objectPath] = upload.mock.calls[0];
    expect(objectPath.startsWith("animals/abc/photos/")).toBe(true);
    expect(objectPath.endsWith(".jpg")).toBe(true);
    expect(result.name).toBe("foto.jpg");
    expect(result.url).toBe(
      "https://xyzcompany.supabase.co/storage/v1/object/public/uploads/animals/abc/photos/x.jpg"
    );
  });

  it("throws when the Storage upload fails", async () => {
    upload.mockResolvedValue({ error: { message: "boom" } });
    const file = new File(["x"], "x.jpg");
    await expect(saveUploadedFile(file, "animals/abc/photos")).rejects.toThrow("boom");
  });

  it("removes the object using the path extracted from the URL", async () => {
    remove.mockResolvedValue({ error: null });
    await deleteUploadedFile(
      "https://xyzcompany.supabase.co/storage/v1/object/public/uploads/animals/abc/photos/x.jpg"
    );
    expect(remove).toHaveBeenCalledWith(["animals/abc/photos/x.jpg"]);
  });

  it("does nothing when the URL isn't a recognized Storage URL (old local /uploads/ path)", async () => {
    await deleteUploadedFile("/uploads/animals/abc/photos/x.jpg");
    expect(remove).not.toHaveBeenCalled();
  });
});
