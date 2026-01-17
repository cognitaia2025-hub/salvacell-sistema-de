def test_get_orders_empty(client):
    """Test getting orders from empty database"""
    response = client.get('/orders/')
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_orders_with_pagination(client):
    """Test getting orders with pagination parameters"""
    response = client.get('/orders/?skip=0&limit=10')
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_order_missing_data(client):
    """Test creating order with missing required data"""
    response = client.post('/orders/', json={})
    assert response.status_code == 422  # Validation error


def test_create_order_valid_data(client):
    """Test creating order with valid data"""
    # First create a client
    client_data = {
        "name": "Order Test Client",
        "phone": "1111111111",
        "email": "orderclient@example.com"
    }
    client_response = client.post('/clients/', json=client_data)
    assert client_response.status_code == 201
    client_id = client_response.json()["id"]
    
    # Create order
    order_data = {
        "client_id": client_id,
        "device_brand": "Apple",
        "device_model": "iPhone 12",
        "issue_description": "Screen broken",
        "estimated_cost": 150.00
    }
    response = client.post('/orders/', json=order_data)
    assert response.status_code == 201
    data = response.json()
    assert data["client_id"] == client_id
    assert data["device_brand"] == order_data["device_brand"]
    assert "id" in data
    assert "folio" in data


def test_get_order_by_id(client):
    """Test getting specific order by ID"""
    # First create a client and order
    client_data = {
        "name": "Get Order Test Client",
        "phone": "2222222222",
        "email": "getorder@example.com"
    }
    client_response = client.post('/clients/', json=client_data)
    client_id = client_response.json()["id"]
    
    order_data = {
        "client_id": client_id,
        "device_brand": "Samsung",
        "device_model": "Galaxy S21",
        "issue_description": "Battery issue",
        "estimated_cost": 80.00
    }
    order_response = client.post('/orders/', json=order_data)
    assert order_response.status_code == 201
    order_id = order_response.json()["id"]
    
    # Get the order by ID
    get_response = client.get(f'/orders/{order_id}')
    assert get_response.status_code == 200
    data = get_response.json()
    assert data["id"] == order_id
    assert data["client_id"] == client_id
