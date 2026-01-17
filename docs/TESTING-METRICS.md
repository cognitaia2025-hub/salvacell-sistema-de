# Testing the Dashboard Metrics Implementation

This guide provides instructions for manually testing the dashboard metrics implementation.

## Prerequisites

1. **Backend Requirements:**
   - Python 3.12+
   - PostgreSQL database
   - All dependencies from `backend/requirements.txt`

2. **Frontend Requirements:**
   - Node.js 18+
   - npm packages installed

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```
DATABASE_URL=postgresql+asyncpg://your_user:your_password@localhost:5432/salvacell_db
SECRET_KEY=your-secret-key-here
DEBUG=True
CORS_ORIGINS=http://localhost:5173,http://localhost:5000
```

### 3. Start the Backend

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: http://localhost:8000

### 4. Access API Documentation

Open your browser and navigate to:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Frontend Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Endpoint

The frontend is already configured to connect to the backend at `http://localhost:8000`.

### 3. Start the Development Server

```bash
npm run dev
```

The application will be available at: http://localhost:5173

## Testing the Metrics Endpoints

### Using the API Documentation (Swagger UI)

1. Navigate to http://localhost:8000/docs
2. Look for the **metrics** section
3. Test each endpoint:

#### Test User Engagement Metrics
- Click on `GET /metrics/user-engagement`
- Click "Try it out"
- Click "Execute"
- Verify the response includes:
  - `daily_active_users`
  - `monthly_active_users`
  - `user_retention_rate`
  - `total_registered_users`
  - `active_users_today`
  - `new_users_this_month`

#### Test System Performance Metrics
- Click on `GET /metrics/system-performance`
- Click "Try it out"
- Click "Execute"
- Verify the response includes:
  - `avg_response_time_ms`
  - `system_uptime_percent`
  - `total_requests`
  - `error_rate_percent`
  - `active_sessions`

#### Test Operational Metrics
- Click on `GET /metrics/operational`
- Click "Try it out"
- Click "Execute"
- Verify the response includes:
  - `total_orders_today`
  - `orders_in_progress`
  - `orders_completed_today`
  - `pending_orders`
  - `revenue_today`
  - `customer_satisfaction_score`

#### Test Dashboard Summary
- Click on `GET /metrics/dashboard`
- Click "Try it out"
- Click "Execute"
- Verify the response includes all three metric categories:
  - `user_engagement`
  - `system_performance`
  - `operational`

### Using cURL

Alternatively, test with cURL commands:

```bash
# User Engagement Metrics
curl http://localhost:8000/metrics/user-engagement

# System Performance Metrics
curl http://localhost:8000/metrics/system-performance

# Operational Metrics
curl http://localhost:8000/metrics/operational

# Dashboard Summary (all metrics)
curl http://localhost:8000/metrics/dashboard
```

## Testing the Frontend Dashboard

### 1. Access the Application

Navigate to http://localhost:5173

### 2. Navigate to Metrics Dashboard

Click on the **"Métricas"** tab in the navigation bar.

### 3. Verify Display

The metrics dashboard should display three sections:

#### User Engagement Section
- Daily Active Users (DAU) - blue gradient card
- Monthly Active Users (MAU) - purple gradient card
- User Retention Rate
- Total Registered Users
- New Users This Month - green gradient card

#### System Performance Section
- Average Response Time - with status indicator (green/yellow/red)
- System Uptime - with percentage
- Total Requests count
- Error Rate - with status indicator
- Active Sessions count

#### Operational Metrics Section
- Orders Today - blue gradient card
- Orders In Progress - purple gradient card
- Orders Completed Today - green gradient card
- Pending Orders - amber gradient card
- Revenue Today - emerald gradient card with currency formatting
- Customer Satisfaction Score (CSAT) - with star icon

### 4. Verify Auto-Refresh

Wait 30 seconds and verify that the metrics automatically refresh without needing to reload the page.

## Testing Performance Tracking

### 1. Generate API Traffic

Make several API calls to generate metrics:

```bash
# Make 10 requests to different endpoints
for i in {1..10}; do
  curl http://localhost:8000/health
  curl http://localhost:8000/metrics/system-performance
  sleep 0.5
done
```

### 2. Check Performance Metrics

```bash
curl http://localhost:8000/metrics/system-performance
```

Verify that:
- `total_requests` has increased
- `avg_response_time_ms` shows a realistic value
- Response includes `X-Response-Time` header

### 3. Check Response Headers

```bash
curl -I http://localhost:8000/health
```

Look for the `X-Response-Time` header showing the request processing time.

## Testing with Sample Data

If you need sample data for testing:

### 1. Create Test Users

Use the backend API or database directly to create test users with various `last_login` dates.

### 2. Create Test Orders

Create orders with different statuses and dates to populate the operational metrics.

### 3. Create Test Payments

Add payments to orders to test revenue calculations.

## Verifying Calculations

### User Retention Rate
- Formula: (Users active this month who were created before this month) / (Users active last month) * 100
- Should return 0.0 if no users were active in previous month

### Customer Satisfaction Score
- Currently calculated from delivery rate: (orders_completed_today / total_orders_today) * 5.0
- Capped at 5.0
- Default: 4.5 if no orders today

### Average Response Time
- Tracked by middleware for all requests
- Updated in real-time
- Displayed in milliseconds

## Common Issues and Solutions

### Issue: Database Connection Error
**Solution:** Verify that PostgreSQL is running and the `DATABASE_URL` in `.env` is correct.

### Issue: Metrics Show Zero Values
**Solution:** Create sample data in the database (users, orders, payments).

### Issue: Frontend Can't Connect to Backend
**Solution:** Verify that:
- Backend is running on port 8000
- CORS is properly configured in backend `.env`
- Frontend API client points to correct URL

### Issue: Icons Not Displaying
**Solution:** Icons have been mapped to available Phosphor icons. If issues persist, check that `@phosphor-icons/react` is properly installed.

## Production Considerations

Before deploying to production:

1. **Replace Placeholder Values:**
   - Implement real system uptime tracking
   - Integrate actual session management for active sessions
   - Implement proper CSAT survey integration

2. **Add Redis:**
   - Store performance metrics in Redis instead of in-memory
   - Configure Redis URL in `.env`

3. **Set Up Monitoring:**
   - Integrate with Prometheus/Grafana
   - Set up alerts for critical thresholds

4. **Database Optimization:**
   - Add indexes for frequently queried fields
   - Consider caching frequently accessed metrics

5. **Security:**
   - Add authentication to metrics endpoints
   - Restrict admin endpoints to authorized users
   - Use environment-specific secrets

## Additional Testing

For more comprehensive testing, consider:

1. **Load Testing:** Use tools like Apache JMeter or Locust to simulate high traffic
2. **Integration Tests:** Write automated tests using pytest
3. **E2E Tests:** Use Playwright or Cypress for frontend testing
4. **Performance Profiling:** Use Python profilers to optimize slow endpoints

## Support

For issues or questions, refer to:
- Main documentation: `/docs/METRICS-API-DOCUMENTATION.md`
- Implementation plan: `/docs/PLAN-04-dashboard-metrics.md`
- API documentation: http://localhost:8000/docs
