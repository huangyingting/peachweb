import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/account-admission/passwords";
import {
  normalizeEmail,
  validatePasswordPolicy,
} from "@/lib/account-admission/policy";
import {
  generateInvitationToken,
  hashInvitationToken,
} from "@/lib/account-admission/tokens";
import { synthesizeRemixDocument } from "@/lib/remix-generator";

describe("Account Admission Security Primitives", () => {
  it("normalizes email addresses and enforces password policy", () => {
    expect(normalizeEmail("  Creator@PeachWeb.IO ")).toBe("creator@peachweb.io");
    expect(() => validatePasswordPolicy("short1")).toThrow();
    expect(() => validatePasswordPolicy("alllettersonly")).toThrow();
    expect(() => validatePasswordPolicy("StrongPass2026")).not.toThrow();
  });

  it("hashes and verifies passwords with scrypt timing-safe comparison", async () => {
    const hash = await hashPassword("PeachStudio2026");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("PeachStudio2026", hash)).toBe(true);
    expect(await verifyPassword("WrongPassword99", hash)).toBe(false);
  });

  it("generates high-entropy single-use tokens and deterministic SHA-256 hashes", () => {
    const { rawToken, tokenHash } = generateInvitationToken();
    expect(rawToken.length).toBeGreaterThan(24);
    expect(tokenHash).toHaveLength(64);
    expect(hashInvitationToken(rawToken)).toBe(tokenHash);
    expect(tokenHash).not.toContain(rawToken);
  });
});

describe("AI 3D Site Generator (/remix) Synthesis Engine", () => {
  it("synthesizes a complete UI + 3D WebGL scene document with brand colors", () => {
    const doc = synthesizeRemixDocument({
      category: "SAAS",
      businessName: "Hyperion 3D Cloud",
      businessDescription: "Spatial cloud observability in real-time WebGL.",
      collectionId: "peach-aurora",
      templateId: "121",
      palette: {
        primary: "#ff6b4a",
        secondary: "#9333ea",
        accent: "#38bdf8",
        background: "#090a10",
        surface: "#131522",
        text: "#f8fafc",
      },
    });

    expect(doc.name).toBe("Hyperion 3D Cloud");
    expect(doc.uiState.palette.primary).toBe("#ff6b4a");
    expect(doc.sceneState.objects.length).toBeGreaterThanOrEqual(2);
    expect(doc.sceneState.keyframes.length).toBeGreaterThanOrEqual(3);
  });
});
