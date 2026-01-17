def test_get_clients_empty(client):
    """Test getting clients from empty database"""
    response = client.get('/clients/')
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_clients_with_pagination(client):
    """Test getting clients with pagination parameters"""
    response = client.get('/clients/?skip=0&limit=10')
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_client_missing_data(client):
    """Test creating client with missing required data"""
    response = client.post('/clients/', json={})
    assert response.status_code == 422  # Validation error


def test_create_client_valid_data(client):
    """Test creating client with valid data"""
    client_data = {
        "name": "Test Client",
        "phone": "1234567890",
        "email": "test@example.com"
    }
    response = client.post('/clients/', json=client_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == client_data["name"]
    assert data["phone"] == client_data["phone"]
    assert data["email"] == client_data["email"]
    assert "id" in data


def test_get_clients_after_creation(client):
    """Test getting clients after creating one"""
    # Create a client first
    client_data = {
        "name": "Another Test Client",
        "phone": "0987654321",
        "email": "another@example.com"
    }
    create_response = client.post('/clients/', json=client_data)
    assert create_response.status_code == 201
    
    # Get all clients
    get_response = client.get('/clients/')
    assert get_response.status_code == 200
    clients = get_response.json()
    assert len(clients) >= 1
    assert any(c["name"] == client_data["name"] for c in clients)
