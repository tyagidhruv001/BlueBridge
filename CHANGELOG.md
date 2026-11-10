
## [Phase 1: Centralized Authentication & Authorization] - 2026-11-10

### Summary of Changes
- **Firebase ID Token Verification (`backend/src/middlewares/auth.middleware.js`)**:
  - Implemented strict `authenticate` middleware validating `Authorization: Bearer <token>`.
  - Attaches decoded `{ uid, email, emailVerified }` to `req.user`.
  - Rejects missing or malformed headers with 401 (`Authentication required`).
  - Rejects invalid or expired tokens with 401 (`Invalid or expired authentication token`).
- **Role-Based Access Control (`backend/src/middlewares/role.middleware.js`)**:
  - Implemented `requireRole(...allowedRoles)` middleware querying Firestore `users` collection server-side.
  - Rejects unauthorized roles with 403 (`Insufficient permissions`).
  - Attaches verified `req.user.role`.
- **Resource Ownership Enforcement (`backend/src/middlewares/ownership.middleware.js`)**:
  - Implemented `requireSelf(paramName)` ensuring `req.user.uid === req.params[paramName]` (or admin role).
  - Implemented `requireJobParticipant(paramName)` verifying participant ownership of bookings and jobs.
- **Protected Controllers & Routes**:
  - `backend/src/controllers/auth.controller.js`:
    - Updated `signup` to generate and return a Firebase custom token.
    - Updated `login` to block `mock-token` when `NODE_ENV === 'production'` and return verified custom token.
    - Updated `updateProfile`: enforces ownership check (`req.user.uid === uid`) and strips sensitive/immutable fields (`role`, `is_verified`, `verification_status`, `verified_at`, `wallet`, `stats`).
    - Updated `getDemoUser`: disabled in production with 403 response.
  - `backend/src/routes/users.routes.js` & `controllers/users.controller.js`: Protected with `authenticate` and `requireSelf`. Role field made immutable.
  - `backend/src/routes/bookings.routes.js` & `controllers/bookings.controller.js`: Customer identity derived strictly from `req.user.uid`; updates guarded by participant check.
  - `backend/src/routes/jobs.routes.js`: Protected endpoints deriving `customerId` from `req.user.uid` and enforcing participant ownership on updates.
  - `backend/src/routes/payments.routes.js` & `transactions.routes.js`: Protected with `authenticate`; user IDs bound to `req.user.uid`; balance and history endpoints restricted to resource owners.
  - `backend/src/routes/chat.routes.js`: P2P chat routes protected with `authenticate` and participant authorization.
  - `backend/src/routes/workers.routes.js`: Modification routes (`POST /:uid`, `PATCH /:uid/location`) protected with `authenticate` and `requireSelf`.
  - `backend/src/routes/verification.routes.js`: Document verification scan route protected with `authenticate`.
- **Frontend Token Synchronization**:
  - `frontend/src/api/api.js`: Updated `apiFetch` to automatically extract and attach Firebase ID tokens via `Authorization: Bearer <token>`, with graceful 401 and 403 handling.
  - `frontend/src/pages/auth/Login.jsx` & `Signup.jsx`: Integrated `signInWithCustomToken(auth, data.token)` to establish real client-side Firebase Auth sessions.
  - `frontend/src/main.jsx`: Attached `onAuthStateChanged` to keep tokens synchronized in storage.
- **Automated Verification**:
  - Created `backend/tests/auth.test.js` covering 11 automated test cases.
  - All 11 tests executed and verified passing.
  - Frontend production build verified passing (`npm run build`).

## [Phase 2: Authoritative Booking Engine & State Machine] - 2026-11-10

### Summary of Changes
- **Authoritative Booking Service (`backend/src/services/bookings.service.js`)**:
  - Unified `/api/bookings` and `/api/jobs` behind a single authoritative booking service.
  - Derived `customerId` strictly from `req.user.uid`; caller-supplied `customerId` in request bodies is discarded.
  - Enforced server-side price calculation based on worker rates + standard platform fee (₹49); arbitrary client prices are prevented.
  - Validated worker existence and confirmed worker role in Firestore.
  - Prevented customer self-assignment as worker (rejected with 400).
  - Implemented deduplication and idempotency protection using `idempotencyKey` / `clientRequestId`.
  - Enforced atomic booking state transitions and worker lifetime earnings updates within Firestore transactions (`db.runTransaction`).
- **Booking State Transition Machine (`backend/src/utils/bookingTransitions.js`)**:
  - Encoded valid state graph: `pending -> [assigned, accepted, cancelled]`, `assigned -> [accepted, declined, cancelled]`, `accepted -> [in_progress, cancelled]`, `in_progress -> [completed]`, `completed -> []`, `cancelled -> []`.
  - Blocked arbitrary transitions (e.g., jumping from `pending` directly to `completed`).
  - Added role-based constraints: customers cannot cancel `in_progress` or `completed` bookings; only assigned workers can accept, start, or complete bookings.
  - Prevented race conditions on unassigned job pool claiming by verifying `workerId` atomically in transaction.
- **Joi Validation Schemas (`backend/src/validators/booking.validator.js`)**:
  - `createBookingSchema`: Validates `serviceType`, `date`, `time`, `address`, `location`, `paymentMethod`, etc.
  - `updateBookingSchema`: Validates `status`, `tracking`, etc., while stripping prohibited fields (`price`, `amount`, `payment`).
- **Route Consolidation**:
  - Refactored [`backend/src/controllers/bookings.controller.js`](file:///c:/CODING/COMMITS/MyBlue/cynide/backend/src/controllers/bookings.controller.js) and [`backend/src/routes/jobs.routes.js`](file:///c:/CODING/COMMITS/MyBlue/cynide/backend/src/routes/jobs.routes.js) to delegate directly to `bookings.service.js`.
- **Automated Verification**:
  - Created [`backend/tests/bookings.test.js`](file:///c:/CODING/COMMITS/MyBlue/cynide/backend/tests/bookings.test.js) covering state transitions, role permissions, price immutability, worker validation, self-assignment prevention, deduplication, and atomic completion earnings.
  - Full test suite passing (21/21 tests in `npm test`).

## [Phase 3: Rebuild Payment & Wallet Security] - 2026-11-10

### Summary of Changes
- **Authoritative Payments Service (`backend/src/services/payments.service.js`)**:
  - Implemented atomic `creditWallet` within Firestore transactions (`db.runTransaction`).
  - Added strict idempotency protection against duplicate credit callbacks and replays.
  - Implemented atomic `deductWallet` verifying customer booking ownership, preventing negative wallet balances, matching exact required booking price, updating booking payment status to `paid`, and recording transactions atomically.
  - Integrated server-side Razorpay HMAC-SHA256 signature verification preventing signature tampering and wrong-user order manipulation.
  - Implemented secure wallet balance inspection and transaction history querying scoped to the authenticated user.
  - Enforced platform currency standardization (`USD` platform default, with `INR` preserved where appropriate).
- **Disabled Insecure Direct Transaction Writing (`backend/src/routes/transactions.routes.js`)**:
  - Locked down `POST /api/transactions` with HTTP 403 Forbidden: clients cannot directly create successful credit transactions or manipulate wallet balances.
  - Restricted `GET /api/transactions/:userId` to authenticated resource owner or admin, returning sanitized transaction histories.
- **Request Validation (`backend/src/validators/payment.validator.js`)**:
  - Built Joi validation schemas for order creation (`createOrderSchema`), payment verification (`verifyPaymentSchema`), wallet deduction (`deductWalletSchema`), and refunds (`refundSchema`).
  - Enforced positive finite numbers for all financial amounts.
- **Automated Verification**:
  - Created [`backend/tests/payments.test.js`](file:///c:/CODING/COMMITS/MyBlue/cynide/backend/tests/payments.test.js) with 11 automated test cases covering invalid amounts, atomic crediting, idempotency, insufficient balances, ownership validation, price matching, HMAC signature validation, order recipient matching, and 403 enforcement on direct transaction posts.
  - Executed full test suite: all 32/32 tests passing cleanly in `npm test`.
  - Frontend production build verified passing (`npm run build`).

## [Phase 4: PayPal Commerce & Payment Engine] - 2026-11-10

### Summary of Changes
- **Authoritative PayPal Service (`backend/src/services/paypal.service.js`)**:
  - Implemented PayPal REST API v2 integration for orders and checkout captures.
  - Implemented OAuth 2.0 client credentials token management with automatic in-memory caching and token refresh.
  - Created `createOrder` method: derives authoritative pricing from Firestore `jobs` collection, validates customer ownership, enforces single-payment constraints, creates orders via PayPal Orders v2 API, and stores pending transactions in Firestore.
  - Created `captureOrder` method: enforces user ownership, verifies PayPal server capture status (`COMPLETED`), atomically updates transaction status and booking payment record (`payment.status = 'paid'`, `payment.method = 'paypal'`) using Firestore `db.runTransaction`.
  - Added strict idempotency protection preventing duplicate order captures and race conditions.
  - Added PayPal webhook signature verification (`verifyWebhookSignature`) and asynchronous event processor (`handleWebhookEvent`) for `PAYMENT.CAPTURE.COMPLETED`.
  - Added sanitized public configuration endpoint (`getClientConfig`) ensuring client secrets are never leaked to the client.
- **PayPal Request Validators (`backend/src/validators/paypal.validator.js`)**:
  - `createPayPalOrderSchema`: validates required `bookingId` and supported currencies.
  - `capturePayPalOrderSchema`: validates required `orderId` and optional `bookingId`.
- **Payment Routes Extension (`backend/src/routes/payments.routes.js`)**:
  - `GET /api/payments/paypal/config`: public client SDK bootstrap.
  - `POST /api/payments/paypal/create-order`: protected by `authenticate`.
  - `POST /api/payments/paypal/capture-order`: protected by `authenticate`.
  - `POST /api/payments/paypal/webhook`: public webhook endpoint with signature validation.
- **Automated Verification**:
  - Created [`backend/tests/paypal.test.js`](file:///c:/CODING/COMMITS/MyBlue/cynide/backend/tests/paypal.test.js) with 9 automated test cases covering config sanitization, ownership checks, authoritative price derivation, capture state transitions, idempotency, and route authorization.
  - Executed full test suite: all 41/41 tests passing cleanly in `npm test`.
