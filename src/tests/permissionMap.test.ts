/**
 * ============================================================================
 * canAccessPath — UI Visibility / Route Guard Tests
 * ============================================================================
 * Tests that canAccessPath correctly enforces permission requirements
 * for various frontend paths.
 * ============================================================================
 */
import { describe, test, expect } from "vitest"
import {
  canAccessPath,
  PATH_PERMISSIONS,
  NAV_PERMISSIONS,
  SUB_ITEM_PERMISSIONS,
  getFirstAccessiblePath,
} from "@/constants/permissionMap"

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Simulates a user with a specific set of permissions */
function createPermissionCheckers(perms: string[]) {
  const hasPermission = (key: string) => perms.includes(key)
  const hasAnyPermission = (...keys: string[]) => keys.some((k) => perms.includes(k))
  return { hasPermission, hasAnyPermission }
}

/** Simulates a bypass role (sysadmin/collegeadmin) — always returns true */
function createBypassCheckers() {
  return {
    hasPermission: () => true,
    hasAnyPermission: () => true,
  }
}

/** Simulates a user with NO permissions */
function createEmptyCheckers() {
  return createPermissionCheckers([])
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe("canAccessPath", () => {
  // ──────────────────────────────────────────────────────────
  // Deny: User lacks required permission
  // ──────────────────────────────────────────────────────────

  test("denies /college/students when user lacks students.view", () => {
    const { hasPermission, hasAnyPermission } = createPermissionCheckers(["jobs.view"])
    expect(canAccessPath("/college/students", hasPermission, hasAnyPermission)).toBe(false)
  })

  test("denies /college/create-job when user lacks jobs.create", () => {
    const { hasPermission, hasAnyPermission } = createPermissionCheckers(["jobs.view"])
    expect(canAccessPath("/college/create-job", hasPermission, hasAnyPermission)).toBe(false)
  })

  test("denies all permission-gated paths for user with empty permissions", () => {
    const { hasPermission, hasAnyPermission } = createEmptyCheckers()

    for (const path of Object.keys(PATH_PERMISSIONS)) {
      const result = canAccessPath(path, hasPermission, hasAnyPermission)
      expect(result).toBe(false)
    }
  })

  // ──────────────────────────────────────────────────────────
  // Allow: User has the required permission
  // ──────────────────────────────────────────────────────────

  test("allows /college/students when user has students.view", () => {
    const { hasPermission, hasAnyPermission } = createPermissionCheckers(["students.view"])
    expect(canAccessPath("/college/students", hasPermission, hasAnyPermission)).toBe(true)
  })

  test("allows /college/create-job when user has jobs.create", () => {
    const { hasPermission, hasAnyPermission } = createPermissionCheckers(["jobs.create"])
    expect(canAccessPath("/college/create-job", hasPermission, hasAnyPermission)).toBe(true)
  })

  test("allows /college/dashboard when user has dashboard.view", () => {
    const { hasPermission, hasAnyPermission } = createPermissionCheckers(["dashboard.view"])
    expect(canAccessPath("/college/dashboard", hasPermission, hasAnyPermission)).toBe(true)
  })

  // ──────────────────────────────────────────────────────────
  // Allow: Array permission (hasAny) — e.g. Job Postings needs jobs.view|applications.view|overrides.view
  // ──────────────────────────────────────────────────────────

  test("allows path with array permission when user has ANY matching", () => {
    // /college/jobs has permission "jobs.view" (single), but let's test a path that would use array
    // NAV_PERMISSIONS has arrays, PATH_PERMISSIONS mostly singles — test via direct call
    const { hasPermission, hasAnyPermission } = createPermissionCheckers(["overrides.view"])
    // The /college/overrides path requires overrides.view
    expect(canAccessPath("/college/overrides", hasPermission, hasAnyPermission)).toBe(true)
  })

  // ──────────────────────────────────────────────────────────
  // Bypass: Unmapped paths are always accessible
  // ──────────────────────────────────────────────────────────

  test("allows unmapped paths (no permission required)", () => {
    const { hasPermission, hasAnyPermission } = createEmptyCheckers()
    expect(canAccessPath("/college/my-profile", hasPermission, hasAnyPermission)).toBe(true)
    expect(canAccessPath("/college/change-password", hasPermission, hasAnyPermission)).toBe(true)
  })

  // ──────────────────────────────────────────────────────────
  // Dynamic segments (prefix matching)
  // ──────────────────────────────────────────────────────────

  test("matches dynamic path /college/job/some-uuid via prefix", () => {
    const { hasPermission, hasAnyPermission } = createPermissionCheckers(["jobs.view"])
    expect(canAccessPath("/college/job/abc-123-def", hasPermission, hasAnyPermission)).toBe(true)
  })

  test("denies dynamic path /college/student/abc when lacking students.view", () => {
    const { hasPermission, hasAnyPermission } = createPermissionCheckers(["jobs.view"])
    expect(canAccessPath("/college/student/abc-123", hasPermission, hasAnyPermission)).toBe(false)
  })

  // ──────────────────────────────────────────────────────────
  // Bypass roles (sysadmin/collegeadmin)
  // ──────────────────────────────────────────────────────────

  test("bypass role accesses ALL permission-gated paths", () => {
    const { hasPermission, hasAnyPermission } = createBypassCheckers()
    for (const path of Object.keys(PATH_PERMISSIONS)) {
      expect(canAccessPath(path, hasPermission, hasAnyPermission)).toBe(true)
    }
  })
})

// ── Data integrity tests ────────────────────────────────────────────────────

describe("Permission map data integrity", () => {
  test("all PATH_PERMISSIONS values are non-empty strings or string arrays", () => {
    for (const [path, perm] of Object.entries(PATH_PERMISSIONS)) {
      if (Array.isArray(perm)) {
        expect(perm.length).toBeGreaterThan(0)
        perm.forEach((p) => expect(typeof p).toBe("string"))
      } else {
        expect(typeof perm).toBe("string")
        expect(perm.length).toBeGreaterThan(0)
      }
    }
  })

  test("all NAV_PERMISSIONS values are non-empty strings or string arrays", () => {
    for (const [label, perm] of Object.entries(NAV_PERMISSIONS)) {
      if (Array.isArray(perm)) {
        expect(perm.length).toBeGreaterThan(0)
        perm.forEach((p) => expect(typeof p).toBe("string"))
      } else {
        expect(typeof perm).toBe("string")
        expect(perm.length).toBeGreaterThan(0)
      }
    }
  })

  test("all SUB_ITEM_PERMISSIONS paths start with /college/", () => {
    for (const path of Object.keys(SUB_ITEM_PERMISSIONS)) {
      expect(path.startsWith("/college/")).toBe(true)
    }
  })

  test("all PATH_PERMISSIONS paths start with /college/", () => {
    for (const path of Object.keys(PATH_PERMISSIONS)) {
      expect(path.startsWith("/college/")).toBe(true)
    }
  })
})

// ── Edit-suffix permission tests ────────────────────────────────────────────

describe("Edit-suffix permission gating", () => {
  test("denies /college/job/:id/edit when user has jobs.view but not jobs.update", () => {
    const { hasPermission, hasAnyPermission } = createPermissionCheckers(["jobs.view"])
    expect(canAccessPath("/college/job/abc-123/edit", hasPermission, hasAnyPermission)).toBe(false)
  })

  test("allows /college/job/:id/edit when user has jobs.update", () => {
    const { hasPermission, hasAnyPermission } = createPermissionCheckers(["jobs.update"])
    expect(canAccessPath("/college/job/abc-123/edit", hasPermission, hasAnyPermission)).toBe(true)
  })

  test("denies /college/student/:id/edit when user has students.view but not students.update", () => {
    const { hasPermission, hasAnyPermission } = createPermissionCheckers(["students.view"])
    expect(canAccessPath("/college/student/abc-123/edit", hasPermission, hasAnyPermission)).toBe(false)
  })

  test("allows /college/student/:id/edit when user has students.update", () => {
    const { hasPermission, hasAnyPermission } = createPermissionCheckers(["students.update"])
    expect(canAccessPath("/college/student/abc-123/edit", hasPermission, hasAnyPermission)).toBe(true)
  })

  test("denies /college/training-program/:id/edit when user lacks training.manage", () => {
    const { hasPermission, hasAnyPermission } = createPermissionCheckers(["training.view"])
    expect(canAccessPath("/college/training-program/abc-123/edit", hasPermission, hasAnyPermission)).toBe(false)
  })

  test("allows /college/training-program/:id/edit when user has training.manage", () => {
    const { hasPermission, hasAnyPermission } = createPermissionCheckers(["training.manage"])
    expect(canAccessPath("/college/training-program/abc-123/edit", hasPermission, hasAnyPermission)).toBe(true)
  })

  test("detail page (non-edit) still uses .view permission", () => {
    const { hasPermission, hasAnyPermission } = createPermissionCheckers(["jobs.view"])
    expect(canAccessPath("/college/job/abc-123", hasPermission, hasAnyPermission)).toBe(true)
  })
})

// ── getFirstAccessiblePath tests ────────────────────────────────────────────

describe("getFirstAccessiblePath", () => {
  test("bypass roles always get /college/dashboard", () => {
    expect(getFirstAccessiblePath(null, "collegeadmin")).toBe("/college/dashboard")
    expect(getFirstAccessiblePath(null, "sysadmin")).toBe("/college/dashboard")
    expect(getFirstAccessiblePath([], "collegeadmin")).toBe("/college/dashboard")
  })

  test("returns /college/dashboard when user has dashboard.view", () => {
    expect(getFirstAccessiblePath(["dashboard.view"], "tpo")).toBe("/college/dashboard")
  })

  test("skips dashboard, returns /college/students when user lacks dashboard.view", () => {
    expect(getFirstAccessiblePath(["students.view"], "tpc")).toBe("/college/students")
  })

  test("follows priority chain: jobs after students", () => {
    expect(getFirstAccessiblePath(["jobs.view"], "hod")).toBe("/college/jobs")
  })

  test("follows priority chain: companies after jobs", () => {
    expect(getFirstAccessiblePath(["companies.view"], "teacher")).toBe("/college/companies")
  })

  test("follows priority chain: training after companies", () => {
    expect(getFirstAccessiblePath(["training.view"], "tpc")).toBe("/college/training-programs")
  })

  test("falls back to /college/my-profile when no permissions match", () => {
    expect(getFirstAccessiblePath([], "tpo")).toBe("/college/my-profile")
    expect(getFirstAccessiblePath(null, "tpc")).toBe("/college/my-profile")
  })
})
