import json


def test_login_missing_credentials(client):
    """Test login with missing credentials"""
    response = client.post('/auth/login', json={})
    assert response.status_code == 422  # Validation error


def test_login_invalid_credentials(client):
    """Test login with invalid credentials"""
    response = client.post(
        '/auth/login',
        json={"username": "nonexistent", "password": "wrongpass"}
    )
    assert response.status_code in [400, 401]  # Bad request or Unauthorized


def test_health_endpoint(client):
    """Test health check endpoint"""
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_root_endpoint(client):
    """Test root endpoint"""
    response = client.get('/')
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
    assert data["status"] == "running"
