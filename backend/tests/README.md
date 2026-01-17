# Backend Tests

This directory contains the pytest test suite for the SalvaCell API.

## Test Structure

- `conftest.py` - Shared fixtures and test configuration
- `test_auth.py` - Authentication and health check endpoint tests
- `test_clients.py` - Client management endpoint tests
- `test_orders.py` - Order management endpoint tests
- `test_inventory.py` - Inventory management endpoint tests

## Running Tests

### Run all tests
```bash
cd backend
pytest tests/
```

### Run with verbose output
```bash
pytest tests/ -v
```

### Run with coverage report
```bash
pytest tests/ --cov=. --cov-report=term-missing
```

### Run specific test file
```bash
pytest tests/test_clients.py -v
```

### Run specific test
```bash
pytest tests/test_clients.py::test_create_client_valid_data -v
```

## Test Database

Tests use an in-memory SQLite database that is:
- Created fresh for each test
- Automatically cleaned up after each test
- Does not require any external database setup

## Dependencies

Test dependencies are included in `requirements.txt`:
- pytest==7.4.4
- pytest-asyncio==0.23.4
- pytest-cov==4.1.0

## Writing New Tests

1. Create test files with the prefix `test_`
2. Name test functions with the prefix `test_`
3. Use the `client` fixture to make API requests
4. Tests are isolated and can be run in any order

Example:
```python
def test_my_endpoint(client):
    """Test description"""
    response = client.get('/my-endpoint/')
    assert response.status_code == 200
    assert response.json()["key"] == "value"
```
