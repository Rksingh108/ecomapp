# Angular frontend for E-commerce Microservices

Angular 19 standalone application for managing products, customers, and orders.

## Prerequisites
- Node.js 20.11+ or 22+
- npm
- JDK 21 and Maven 3.9+ for the Spring Boot services

## Start the complete application
1. Start each backend service in separate terminals from the repository root:

   ```bash
   mvn -f user-service/pom.xml spring-boot:run
   mvn -f product-service/pom.xml spring-boot:run
   mvn -f order-service/pom.xml spring-boot:run
   mvn -f api-gateway/pom.xml spring-boot:run
   ```

2. In another terminal:

   ```bash
   cd frontend
   npm install
   npm start
   ```

3. Open `http://localhost:4200`.

Angular's development proxy forwards `/api/**` to `http://localhost:8080` (Spring Cloud Gateway), which routes:
- `/api/users/**` to User Service on port 8081
- `/api/products/**` to Product Service on port 8082
- `/api/orders/**` to Order Service on port 8083

Do not set frontend API URLs directly to individual service ports. Using relative `/api/...` paths ensures requests pass through the gateway.

## Features
- Dashboard metrics and recent orders
- Product create, list, update, delete and search
- Customer create, list, update, delete and search
- Order create, list, delete and status update
- API error notifications
- Responsive desktop/tablet/mobile layout

## Build
```bash
npm run build
```

## Important
The backend uses H2 in-memory databases. Records are reset on service restart. Order service stores user and product IDs but currently does not validate those IDs against the user/product services or decrement inventory. The dashboard is wired to real backend endpoints; it is not mock data.
