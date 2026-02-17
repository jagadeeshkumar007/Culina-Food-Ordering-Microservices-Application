# Culina 🍽️

A cloud-native food ordering platform built with microservices architecture, featuring real-time search, cart management, and order processing capabilities.

## 🏗️ Architecture

Culina is built using a microservices architecture with the following components:

### Backend Services (Spring Boot)
- **Auth Service** (Port 8080) - User authentication and authorization with JWT
- **Order Service** (Port 8081) - Order management and processing
- **Payment Service** (Port 8082) - Payment processing and transactions
- **Cart Service** (Port 8083) - Shopping cart management with Redis
- **Search Service** (Port 8084) - Real-time search with Elasticsearch

### Frontend
- **Culina Frontend** (Port 3000) - Next.js 16 application with React 19 and TypeScript

### Infrastructure
- **PostgreSQL** - Primary database for persistent data
- **Redis** - In-memory cache for cart data
- **Elasticsearch** - Search engine for menu items and chefs
- **Kafka** - Event streaming and inter-service communication

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Java 17 (for local development)
- Node.js 20+ (for frontend development)
- Maven (for building Spring Boot services)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workspace
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Verify services are running**
   ```bash
   docker-compose ps
   ```

### Service Endpoints

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Web application |
| Auth Service | http://localhost:8080 | Authentication & user management |
| Order Service | http://localhost:8081 | Order processing |
| Payment Service | http://localhost:8082 | Payment handling |
| Cart Service | http://localhost:8083 | Shopping cart |
| Search Service | http://localhost:8084 | Search functionality |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache |
| Elasticsearch | http://localhost:9200 | Search engine |
| Kafka | localhost:9092 | Message broker |

## 🛠️ Development

### Running Services Locally

#### Backend Services

Each Spring Boot service can be run independently:

```bash
cd <service-name>
mvn spring-boot:run
```

Make sure to configure the required environment variables:

```bash
export DB_HOST=localhost
export DB_USER=postgres
export DB_PASSWORD=root
export JWT_SECRET={encoded 256-bit key}
export KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

#### Frontend

```bash
cd culina-frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000

### Building Services

#### Build all services
```bash
docker-compose build
```

#### Build specific service
```bash
docker-compose build <service-name>
```

## 📦 Tech Stack

### Backend
- **Framework**: Spring Boot 3.2.5
- **Language**: Java 17
- **Security**: Spring Security + JWT
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Search**: Elasticsearch 8.12
- **Messaging**: Apache Kafka 7.6
- **ORM**: Spring Data JPA

### Frontend
- **Framework**: Next.js 16.1
- **UI Library**: React 19.2
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Linting**: ESLint 9

## 🔑 Key Features

- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Multi-Chef Support**: Browse and order from multiple chefs
- **Shopping Cart**: Persistent cart with chef conflict detection
- **Real-time Search**: Fast search powered by Elasticsearch
- **Order Management**: Complete order lifecycle management
- **Payment Processing**: Integrated payment handling
- **Event-Driven Architecture**: Kafka-based event streaming for service communication

## 🗄️ Database Schema

The application uses PostgreSQL with separate schemas for each service:
- User accounts and authentication
- Menu items and chef profiles
- Orders and order items
- Payment transactions

Cart data is stored in Redis for fast access and automatic expiration.

## 🔐 Environment Variables

### Common Variables
```env
JWT_SECRET=<your-jwt-secret>
```

### Database Configuration
```env
DB_HOST=postgres
DB_USER=postgres
DB_PASSWORD=root
```

### Redis Configuration (Cart Service)
```env
REDIS_HOST=redis
REDIS_PORT=6379
```

### Kafka Configuration
```env
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
```

### Elasticsearch Configuration (Search Service)
```env
ELASTICSEARCH_URI=http://elasticsearch:9200
```

### Frontend Configuration
```env
NEXT_PUBLIC_AUTH_SERVICE_URL=http://auth-service:8080
NEXT_PUBLIC_ORDER_SERVICE_URL=http://order-service:8081
NEXT_PUBLIC_CART_SERVICE_URL=http://cart-service:8083
NEXT_PUBLIC_SEARCH_SERVICE_URL=http://search-service:8084
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token

### Order Endpoints
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/{id}` - Get order details

### Cart Endpoints
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `DELETE /api/cart/items/{id}` - Remove item from cart
- `POST /api/cart/checkout` - Checkout cart

### Search Endpoints
- `GET /api/search/menu-items` - Search menu items
- `GET /api/search/chefs` - Search chefs

## 🐳 Docker Volumes

Persistent data is stored in Docker volumes:
- `postgres-data` - PostgreSQL database
- `redis-data` - Redis cache
- `elasticsearch-data` - Elasticsearch indices
- `kafka-data` - Kafka logs and topics

## 🧪 Testing

### Backend Tests
```bash
cd <service-name>
mvn test
```

### Frontend Tests
```bash
cd culina-frontend
npm test
```

## 📊 Monitoring

Service health can be monitored through:
- Docker Compose logs: `docker-compose logs -f <service-name>`
- Elasticsearch health: `curl http://localhost:9200/_cluster/health`
- Individual service health endpoints (if implemented)

## 🔧 Troubleshooting

### Services won't start
1. Check if ports are already in use
2. Ensure Docker has enough resources allocated
3. Check logs: `docker-compose logs <service-name>`

### Database connection issues
1. Verify PostgreSQL is running: `docker-compose ps postgres`
2. Check database credentials in environment variables
3. Ensure services wait for database to be ready

### Kafka connection issues
1. Wait for Kafka to fully initialize (can take 30-60 seconds)
2. Check Kafka logs: `docker-compose logs kafka`
3. Verify `KAFKA_BOOTSTRAP_SERVERS` configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
