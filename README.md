
# E-commerce Microservices (Spring Boot)

A starter Angular + Java/Spring Boot microservices project with:
- `user-service` (port 8081)
- `product-service` (port 8082)
- `order-service` (port 8083)
- `api-gateway` (port 8080)
- `deployment/` Docker Compose sample
- `docs/` API notes

Each business service has Controller, Service, Repository, DTO, Entity, and exception handling.
The business services use H2 in-memory databases so the project can be run locally without installing MySQL.
Data is reset when each service restarts.

## Requirements
- JDK 21
- Maven 3.9+
- Docker (optional)

## Run locally
Open four terminals from the project root and run:

```bash
mvn -f user-service/pom.xml spring-boot:run
mvn -f product-service/pom.xml spring-boot:run
mvn -f order-service/pom.xml spring-boot:run
mvn -f api-gateway/pom.xml spring-boot:run
```

Gateway base URL: `http://localhost:8080`

## API routes through gateway

### Users
- `POST /api/users` create user
- `GET /api/users` list users
- `GET /api/users/{id}` get user
- `PUT /api/users/{id}` update user
- `DELETE /api/users/{id}` delete user

### Products
- `POST /api/products` create product
- `GET /api/products` list products
- `GET /api/products/{id}` get product
- `PUT /api/products/{id}` update product
- `DELETE /api/products/{id}` delete product

### Orders
- `POST /api/orders` create order
- `GET /api/orders` list orders
- `GET /api/orders/{id}` get order
- `PUT /api/orders/{id}/status` update order status
- `DELETE /api/orders/{id}` delete order

## Example payloads

Create user:
```json
{"name":"Karan Rathod","email":"karan@example.com"}
```

Create product:
```json
{"name":"Wireless Mouse","description":"Bluetooth mouse","price":799.00,"stock":25}
```

Create order:
```json
{"userId":1,"productId":1,"quantity":2}
```

## Notes
- This is a learning/demo scaffold, not production-ready.
- Order service stores `userId` and `productId` as IDs; it does not yet call the other services or reserve stock.
- No authentication, service discovery, distributed tracing, or centralized secrets management is configured.
- The gateway routes requests to fixed localhost service URLs. For Docker, use the Compose service names configured in `deployment/docker-compose.yml`.

## Run the Angular frontend

Start all four backend services first, then run:

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:4200`. The Angular dev-server proxy sends `/api/**` to the API Gateway on port 8080.
