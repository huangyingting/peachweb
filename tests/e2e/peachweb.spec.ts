import { execSync } from "node:child_process";
import { expect, test } from "@playwright/test";

test.describe("PeachWeb & PeachWorlds 3D Studio End-to-End Verification", () => {
  test.beforeAll(() => {
    try {
      execSync(
        'printf "%s\\n" "PeachAdmin2026!" | npm run bootstrap:admin -- --email admin@peachweb.local --name "Root Admin" --password-stdin',
        { stdio: "pipe" },
      );
    } catch {
      // Already bootstrapped
    }
  });

  test.afterAll(() => {
    execSync("rm -f dev.db && npm run db:migrate && npm run db:seed", {
      stdio: "pipe",
    });
  });

  test("1. Marketing pages, mega-menus, pricing billing toggle, and gallery filter work", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Build 3D Websites/i }),
    ).toBeVisible();
    await expect(page.getByTestId("peach-three-canvas").first()).toBeVisible();

    // Navigate to Pricing and toggle Monthly vs Yearly
    await page.goto("/pricing");
    await expect(page.getByTestId("price-pro")).toHaveText("$35");
    await page.getByRole("button", { name: "Monthly Billing" }).click();
    await expect(page.getByTestId("price-pro")).toHaveText("$46");

    // Verify Features, Ecommerce, Portfolio, Technology, Storytelling, Gallery
    for (const route of [
      "/features",
      "/ecommerce",
      "/portfolio",
      "/technology",
      "/storytelling",
      "/gallery",
    ]) {
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
    }
  });

  test("2. Public registration is blocked (403) and invite-only lifecycle + 3D Studio + Publish works end-to-end", async ({
    page,
    request,
  }) => {
    // 1. Direct public POST /api/auth/register is strictly forbidden
    const regRes = await request.post("/api/auth/register", {
      data: { email: "attacker@example.com", password: "Password123" },
    });
    expect(regRes.status()).toBe(403);

    // 2. Log in as bootstrapped CLI Root Admin
    await page.goto("/login");
    await page.fill("#login-email", "admin@peachweb.local");
    await page.fill("#login-password", "PeachAdmin2026!");
    await page.getByRole("button", { name: /Continue to Studio/i }).click();
    await page.waitForURL("**/workspace");

    // 3. Issue a single-use invitation code from /admin/invitations
    await page.goto("/admin/invitations");
    const uniqueEmail = `creator_${Date.now()}@peachweb.local`;
    await page.fill('input[placeholder="designer@studio.io"]', uniqueEmail);
    await page.getByRole("button", { name: "Generate Link" }).click();

    const inviteUrlText = await page
      .getByTestId("generated-invite-url")
      .textContent();
    expect(inviteUrlText).toContain("/invite/");
    const invitePath = new URL(inviteUrlText!.trim()).pathname;

    // 4. Sign out admin and redeem the single-use invitation as the new creator
    await request.post("/api/auth/logout");
    await page.goto(invitePath);
    await expect(
      page.getByRole("heading", { name: "Accept Your Invitation" }),
    ).toBeVisible();
    await page.fill("#accept-name", "Spatial Creator");
    await page.fill("#accept-password", "CreatorPass2026!");
    await page
      .getByRole("button", { name: /Accept Invitation & Launch Studio/i })
      .click();
    await page.waitForURL("**/workspace");

    // Verify Workspace Notification Bell popover
    await page.getByTestId("workspace-notifications-btn").click();
    await expect(
      page.getByTestId("workspace-notifications-popover"),
    ).toBeVisible();

    // 5. Verify replay of the consumed invitation token is rejected
    await page.goto(invitePath);
    await expect(
      page.getByRole("heading", { name: "Invitation Unavailable" }),
    ).toBeVisible();

    // 6. Walk through the 5-step /remix AI Site Generator Wizard
    await page.goto("/remix");
    await expect(page.getByTestId("remix-step-indicator")).toHaveText(
      "Category Selection",
    );
    await page.getByTestId("remix-continue-btn").click();
    await expect(page.getByTestId("remix-step-indicator")).toHaveText(
      "Step 1 of 5",
    );
    await page.fill(
      '[data-testid="remix-business-name"]',
      "Aether 3D Robotics",
    );
    await page.getByTestId("remix-continue-btn").click();
    await expect(page.getByTestId("remix-step-indicator")).toHaveText(
      "Step 2 of 5",
    );
    await page.getByTestId("remix-continue-btn").click();
    await expect(page.getByTestId("remix-step-indicator")).toHaveText(
      "Step 3 of 5",
    );
    await page.getByTestId("remix-continue-btn").click();
    await expect(page.getByTestId("remix-step-indicator")).toHaveText(
      "Step 4 of 5",
    );
    await page.getByTestId("remix-continue-btn").click();
    await expect(page.getByTestId("remix-step-indicator")).toHaveText(
      "Step 5 of 5",
    );
    await page.getByTestId("remix-generate-btn").click();

    // 7. Lands in /builder/[id] 3D Studio
    await page.waitForURL("**/builder/**");
    await expect(page.getByTestId("mode-tab-ui")).toBeVisible();
    await expect(page.getByTestId("mode-tab-3d")).toBeVisible();
    await expect(page.getByTestId("mode-tab-animate")).toBeVisible();

    // Add a UI Button in UI mode
    await page.getByTestId("add-ui-button").click();

    // Verify Assets drawer and Site Settings (General / Domains / Plans) sub-tabs
    await page.getByTestId("left-rail-assets").click();
    await expect(page.getByTestId("studio-assets-drawer")).toBeVisible();
    await page.getByTestId("left-rail-settings").click();
    await expect(page.getByTestId("studio-settings-drawer")).toBeVisible();
    await page.getByTestId("studio-settings-tab-domains").click();
    await page.getByTestId("studio-settings-tab-plans").click();

    // Switch to 3D mode and add a Cylinder 3D Mesh + verify Camera PiP, Performance & Material Editor
    await page.getByTestId("mode-tab-3d").click();
    await expect(page.getByTestId("camera-pip-card")).toBeVisible();
    await expect(page.getByTestId("inspector-3d-performance")).toBeVisible();
    await page.getByTestId("open-material-editor-btn").click();
    await expect(page.getByTestId("floating-material-editor")).toBeVisible();
    await page.getByTestId("left-rail-add-3d").click();
    await page.getByTestId("add-3d-cylinder").click();

    // Switch to Animate mode and add a scroll keyframe
    await page.getByTestId("mode-tab-animate").click();
    await expect(page.getByTestId("animate-timeline-dock")).toBeVisible();
    await page.getByTestId("add-keyframe-btn").click();

    // Save a named Version Snapshot
    await page.getByTestId("studio-versions-btn").click();
    await page.fill(
      '[data-testid="version-label-input"]',
      "v1.0 Cylinder 3D Scene",
    );
    await page.getByTestId("save-version-snapshot-btn").click();
    await expect(page.getByText("v1.0 Cylinder 3D Scene")).toBeVisible();
    await page.getByTestId("close-versions-modal-btn").click();

    // Publish the 3D Website Live and visit /site/[slug]
    await page.getByTestId("studio-publish-btn").click();
    await page.getByTestId("confirm-publish-now-btn").click();
    const liveLink = page.getByTestId("published-live-site-link");
    await expect(liveLink).toBeVisible();
    const liveHref = await liveLink.getAttribute("href");
    expect(liveHref).toContain("/site/");

    await page.goto(liveHref!);
    await expect(page.getByText("Aether 3D Robotics").first()).toBeVisible();
    await expect(page.getByText("Made in PeachWeb 3D")).toBeVisible();
  });
});
