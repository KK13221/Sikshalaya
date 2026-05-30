# Claude Fix Prompts

## Fix Prompt 1: Implement Global Async Error Handling in Express

Problem:
The Express API controllers are written as async functions, but they lack `try...catch` blocks. If a Sequelize database error occurs (e.g., validation failure or missing required field), it results in an unhandled promise rejection. This either hangs the incoming request indefinitely or completely crashes the Node.js process.

Expected Behavior:
Any unhandled exception or database error inside an async controller should automatically be caught and forwarded to the Express global error handling middleware via `next(err)`. The server should never crash from a bad payload.

Current Behavior:
Errors crash the node process. 

Files to Inspect:
- `server/index.js`
- `server/controllers/schoolController.js`
- `server/controllers/authController.js`
- `server/controllers/teacherController.js`

Implementation Requirements:
- Install `express-async-errors`.
- Require `express-async-errors` at the very top of `server/index.js` before routes.
- Ensure the global error handler in `server/index.js` catches these and maps Sequelize validation errors to clean 400 Bad Request responses rather than 500 errors.
- Avoid breaking existing working features.

Acceptance Criteria:
- No backend warnings/errors about Unhandled Promise Rejections.
- API returns proper 400 JSON error response when creating a branch without a `name`.
- Node server continues running after an error.

---

## Fix Prompt 2: Add API Validation Middleware

Problem:
The API routes directly pass `req.body` into `Model.create()` without validating the payload structure or sanitizing inputs. This allows bad data to hit the database layer directly and makes the app vulnerable to XSS and injection.

Expected Behavior:
API routes should reject invalid payloads (e.g., missing names, invalid emails) before they ever reach the controller or database.

Current Behavior:
Controllers dump `req.body` directly into Sequelize `create()` and `update()` methods.

Files to Inspect:
- `server/routes/schools.js`
- `server/routes/users.js`
- `server/controllers/schoolController.js`
- `server/package.json`

Implementation Requirements:
- Fix backend validation by implementing `express-validator`.
- Create a `server/middleware/validate.js` file with rules for `school`, `user`, and `teacher` payloads.
- Apply the validation middleware to the `POST` and `PUT` routes.
- Sanitize strings to prevent XSS.

Acceptance Criteria:
- Add works correctly with valid data.
- API returns a 400 error detailing specific validation failures if an email is formatted wrong or a required string is missing.

---

## Fix Prompt 3: Remove Hardcoded Default Passwords & Add Client-Side Validation

Problem:
The SuperAdmin frontend shows a hardcoded default password (`Admin@123`) when creating a new Principal. Furthermore, the frontend forms do not properly validate emails or arrays (like Teacher subjects) before submitting to the API.

Expected Behavior:
Passwords should either be auto-generated securely on the backend or left blank for the user to set via an email link. Forms should prevent submission of malformed emails or empty required fields.

Current Behavior:
`SuperAdmin.jsx` sets `password: 'Admin@123'` as the default state for Principals. 

Files to Inspect:
- `src/pages/SuperAdmin.jsx`

Implementation Requirements:
- Fix frontend validation on the Principal and Teacher forms.
- Change the `type="email"` input to validate properly before calling the API.
- Remove the hardcoded password logic. Either generate a secure random password on the backend or force a password prompt.

Acceptance Criteria:
- Form cannot be submitted with an invalid email.
- Default password is no longer exposed in the UI.

---

## Fix Prompt 4: Implement Proper Pagination in Super Admin Panels

Problem:
The current React frontend fetches all records at once with a hardcoded `limit: 100` and relies entirely on client-side array `.filter()` for search. This will not scale when thousands of teachers or students are added.

Expected Behavior:
The list views should utilize server-side pagination and server-side search querying.

Current Behavior:
`schoolsApi.list({ limit: 100 })` is hardcoded in the frontend, fetching a maximum of 100 records and ignoring the rest. 

Files to Inspect:
- `src/pages/SuperAdmin.jsx`
- `server/controllers/schoolController.js`

Implementation Requirements:
- Update frontend state to manage `page` and `limit`.
- Pass `search` query parameters to the API instead of using client-side `.filter()`.
- Add a pagination UI component to navigate through pages.
- Avoid breaking existing working layout features.

Acceptance Criteria:
- Search input hits the backend API with a debounced query.
- Table can navigate between page 1 and page 2.

---

## Fix Prompt 5: Enforce Dynamic Roles & Permissions

Problem:
The Super Admin can toggle role-specific permissions (e.g. enabling or disabling "Invite teachers" or "Enter marks" for the Principal) and successfully save them to `localStorage` under `shikshalaya_permissions`. However, these permissions are purely cosmetic and are not actually enforced anywhere. The Principal can still log in and fully access the "Teachers" and "Marks & results" pages and invite/manage them, because the sidebar navigation and UI panels do not check these saved permissions.

Expected Behavior:
When a Super Admin toggles off a permission for a role (e.g. Principal), that role's navigation menu items in the sidebar should be hidden, and any associated CRUD operations (like adding a teacher, collecting fees, entering marks) should be disabled or blocked on both the frontend and backend.

Current Behavior:
Permissions are saved to `localStorage` under `shikshalaya_permissions` in `SuperAdmin.jsx`, but they are ignored by `App.jsx`, `PrincipalAdmin.jsx`, and backend middleware.

Files to Inspect:
- `src/App.jsx`
- `src/pages/PrincipalAdmin.jsx`
- `server/middleware/auth.js`

Implementation Requirements:
- Add a helper function `hasPermission(permissionLabel, role)` in frontend to load and parse `shikshalaya_permissions` from `localStorage`.
- In `src/App.jsx`, filter the `PRINCIPAL_NAV` array dynamically using `hasPermission()` before rendering the `Sidebar` navigation.
  * Map navigation items to their matching permission labels, e.g.:
    - `Classes` -> `Manage classes & sections`
    - `Teachers` -> `Invite teachers`
    - `Attendance` -> `Mark attendance`
    - `Marks & results` -> `Enter marks`
    - `Reports` -> `Export data`
- In `src/pages/PrincipalAdmin.jsx`, hide or disable "+ Add", "Edit", or action buttons (e.g., in teachers, students, marks view) if the active role lacks the corresponding permission.
- (Optional but highly recommended) Wire the permissions check on the backend if a permission API or header parameter is developed.

Acceptance Criteria:
- When "Invite teachers" is toggled OFF for the Principal role, logging in as a Principal should hide the "Teachers" tab in the sidebar navigation.
- If a Principal tries to directly access a restricted view or API, it should block/deny access.
- Restoring permissions in Super Admin and logging back in as a Principal should immediately restore access.
