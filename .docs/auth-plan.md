# Monte Auth Migration Plan

## Scope
- Consolidate all authentication, impersonation, user management, and organization lifecycle features onto Better Auth’s Admin and Organization plugins.
- Remove bespoke Convex tables, mutations, and frontend flows that duplicate plugin behavior.
- Maintain existing magic-link sign-in powered by Better Auth.
- Adopt Better Auth’s organization role model (`owner`, `admin`, `member`) alongside custom roles (`guide`, `guardian`, `student`) while keeping the Monte “internal” role as an out-of-band global privilege tier.

## Prerequisites
- Confirm repository is on Better Auth v1.3.27+ and `@convex-dev/better-auth` ≥ 0.9.1.
- Ensure `.env` contains `CONVEX_SITE_URL`, `SITE_URL`, and Resend credentials for magic links.
- Install Better Auth CLI (`npx @better-auth/cli`) for schema generation.
- Snapshot existing auth-related tables (users, organizations, memberships, invites) before schema changes, even if the data set is small.

## Phase 1 — Schema & Configuration
1. **Define access control**
- Create `apps/backend/convex/auth/permissions.ts` exporting access controllers for Admin and Organization plugins.
- Enumerate global roles: `internal`, `admin`, `guide`, `guardian`, `student`.
- Treat `internal` as Monte staff outside of any organization context; grant full admin plugin privileges via `adminRoles`/`adminUserIds`.
- Map organization roles (`owner`, `admin`, `member`) plus custom sub-roles (`guide`, `guardian`, `student`) layered onto the Organization plugin access controller.
- Ensure only `owner` can delete organizations, update billing, and promote/demote admins; allow `admin` to manage invites and memberships but block them from destructive billing actions; keep `member` read-only unless extra permissions assigned.
2. **Extend plugin schemas**
- In new `apps/backend/convex/auth/schema.ts`, describe additional fields:
  - Organization: `joinCode`, `planKey`, `billingCycle`, `seatLimit`, `seatsInUse`, pricing tier metadata.
  - Member: `relationships`, `status`, `invitedByUserId`.
  - Invitation: `createdByUserId`, `token`, `notes`.
   - Enable dynamic access control if we expect runtime role creation.
3. **Update auth client creation**
   - Replace `createAuth` configuration with:
     - `plugins: [magicLink(), crossDomain({...}), admin({ ...options }), organization({ ...options })]`.
     - Pass access controllers, roles, `adminRoles`, and `adminUserIds` (Monte team IDs).
     - Configure organization hooks for seat counts, billing sync, invite emails.
   - Register session schema additions (`impersonatedBy`, `activeOrganizationId`, `activeTeamId` as needed).
4. **Run schema generation**
   - Execute `npx @better-auth/cli generate` to establish plugin tables.
- Drop legacy Convex tables (`organizations`, `orgMemberships`, `orgInvites`, `billingAccounts`, `userProfiles` impersonation fields) only after confirming new plugin tables are populated and other domain tables (e.g., curriculum content) remain untouched.

## Phase 2 — Backend Convex Updates
1. **Replace legacy modules**
   - Delete `apps/backend/convex/modules/organizations` and `modules/auth` helper functions that manage org state manually.
   - Introduce thin Convex wrappers (if necessary) calling Better Auth APIs for curriculum-specific needs (e.g., join code retrieval, plan selection).
2. **Seat tracking & billing**
- Implement server-side hooks (e.g., `afterAddMember`, `afterRemoveMember`) to adjust seat counts stored in organization additional fields.
  - Students count toward pricing tiers; guardians do not.
  - Enforce guardrails so each student can link to up to two guardian memberships via member additional fields.
- Move billing account creation into hook triggered by `afterCreateOrganization`, using pricing tiers:
  - Tier 1: 1 student – $49/month or $490/year.
  - Tier 2: 2–4 students – $79/month or $790/year.
  - Tier 3: 5–100 students – $19/month or $190/year per student.
  - Tier 4: 101+ students – first 100 students at Tier 3 rate; each additional student $9/month or $90/year.
3. **Impersonation**
   - Remove custom impersonation stubs.
   - Use `auth.api.impersonateUser` and `auth.api.stopImpersonating` in new Convex functions if the frontend still calls Convex endpoints.
4. **Ensure admin safety**
   - Add guards so only users with `internal` or plugin-admin role can call impersonation or destructive APIs.

## Phase 3 — Frontend Integration
1. **Auth client**
   - Update `apps/frontend/src/lib/auth-client.ts` to register `adminClient` and `organizationClient` with shared access controllers/roles derived via `inferOrgAdditionalFields`.
   - Expose helper functions from the new plugin namespaces (list users, impersonate, create orgs, etc.).
2. **AuthProvider**
   - Refactor to load Better Auth’s session payloads that now contain organization/role data (use `authClient.organization.useListOrganizations`, `useActiveOrganization`, etc.).
   - Remove calls to `curriculumClient` for org list, invites, impersonation; substitute direct plugin calls.
   - Manage active organization via `authClient.organization.setActive`.
3. **Signup flow**
- When `role === admin`, call `authClient.organization.create` after magic-link verification instead of Convex mutation.
- For guardians/guides/students, use `organization.acceptInvitation` or `setActive` as needed.
- Internal signup: assign `internal` role via admin plugin `setRole` once access code validated; these users operate outside org pricing and manage global admin tasks.
4. **Admin dashboard**
- Replace Convex-driven UI actions with plugin interactions:
  - Invitations via `organization.inviteMember`/`cancelInvitation`.
  - Membership management via `organization.listMembers`, `updateMemberRole`, `removeMember`.
  - Impersonation via `admin.impersonateUser` / `stopImpersonating`.
  - Join-code regeneration using additional field update or organization hook endpoint.
- Render data directly from plugin responses (adjust types accordingly).
- Enforce role-based UI:
  - Owners manage billing settings, delete org, and promote/demote admins.
  - Admins manage invites and members but cannot touch billing/destruction.
  - Guides/students interact with curriculum tools.
  - Guardians view linked student progress only (read-only) and do not affect seat counts.

## Phase 4 — Curriculum API Layer
1. **Simplify client**
   - Remove organization/impersonation wrappers from `packages/api/src/curriculum.ts`.
   - Keep curriculum-specific endpoints (lessons, units) untouched.
   - Export new helper module if frontend still needs typed access to plugin results.
2. **Auth token handling**
   - Retain Convex token fetch; ensure plugin session metadata still includes everything required for curriculum calls.

## Phase 5 — Cleanup & Validation
1. **Code removal**
- Delete unused Convex tables, generated types, and migration scripts tied to legacy org models while preserving all non-auth data (curriculum content, lessons, etc.).
   - Remove `userProfiles` fields that are now redundant; if still needed for display names, ensure they sync with Better Auth user data.
2. **Testing**
   - Unit tests for new hooks and access control utilities.
   - Integration tests covering signup, org creation, invite acceptance, role change, impersonation.
   - Manual QA checklist documenting each role’s experience.
3. **Documentation**
- Update README sections referencing org management.
- Document environment variables, plugin configuration, and onboarding steps in `.docs`.
- Capture pricing model, role definitions, guardian constraints, and impersonation policies in team docs for future reference.

## Phase 6 — Deployment
- Perform final verification in the existing environment: ensure new plugin tables contain expected records, legacy auth tables are deprecated, and non-auth tables retain their data. Run through end-to-end flows locally/staging before enabling for everyone.
- Monitor Better Auth logs post-deploy; confirm impersonation audit information and invite emails fire correctly.
- Tag release and communicate new workflows to teammates before further development resumes.
