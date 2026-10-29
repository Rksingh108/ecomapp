# API overview

All endpoints can be accessed through the API gateway on port 8080.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/users` | Create user |
| GET | `/api/users` | List users |
| GET | `/api/users/{id}` | Read user |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |
| POST | `/api/products` | Create product |
| GET | `/api/products` | List products |
| GET | `/api/products/{id}` | Read product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | List orders |
| GET | `/api/orders/{id}` | Read order |
| PUT | `/api/orders/{id}` | Update order |
| PATCH | `/api/orders/{id}/status` | Update order status |
| DELETE | `/api/orders/{id}` | Delete order |

Order status values: `CREATED`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`.
