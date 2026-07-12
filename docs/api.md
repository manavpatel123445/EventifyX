# API Documentation

The backend service is structured using a feature-based modular architecture under the `/api` route.

## Authentication (`/api/auth`)

- `POST /register`: Registers a new user.
- `POST /login`: Log in and retrieve JWT tokens.
- `POST /refresh`: Refresh short-lived access token.
- `GET /me`: Retrieves current user profile.

## Events (`/api/events`)

- `GET /`: Lists all events (with filters and search queries).
- `POST /request`: Creates an event approval request.
- `GET /managed`: Fetch events managed by the current user.
- `PUT /:eventId`: Update event details.
- `PATCH /:eventId/cancel`: Cancel an event.

## Payments (`/api/payments`)

- `POST /create-checkout-session`: Prepares a Stripe payment checkout session.
- `POST /webhook`: Dynamic Stripe webhook receiver.
