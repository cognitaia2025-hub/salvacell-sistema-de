def test_get_inventory_items_empty(client):
    """Test getting inventory items from empty database"""
    response = client.get('/inventory/items')
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_inventory_with_pagination(client):
    """Test getting inventory with pagination parameters"""
    response = client.get('/inventory/items?skip=0&limit=10')
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_inventory_item_missing_data(client):
    """Test creating inventory item with missing required data"""
    response = client.post('/inventory/items', json={})
    assert response.status_code == 422  # Validation error


def test_create_inventory_item_valid_data(client):
    """Test creating inventory item with valid data"""
    item_data = {
        "sku": "TEST-SKU-001",
        "name": "Test Screen",
        "category": "screens",
        "stock": 10,
        "purchase_price": 40.00,
        "sale_price": 50.00,
        "min_stock": 5
    }
    response = client.post('/inventory/items', json=item_data)
    assert response.status_code == 201
    data = response.json()
    assert data["sku"] == item_data["sku"]
    assert data["name"] == item_data["name"]
    assert data["stock"] == item_data["stock"]
    assert "id" in data


def test_create_duplicate_sku(client):
    """Test creating inventory item with duplicate SKU"""
    item_data = {
        "sku": "DUPLICATE-SKU",
        "name": "Test Item 1",
        "category": "screens",
        "stock": 5,
        "purchase_price": 25.00,
        "sale_price": 30.00,
        "min_stock": 2
    }
    # First creation should succeed
    response1 = client.post('/inventory/items', json=item_data)
    assert response1.status_code == 201
    
    # Second creation with same SKU should fail
    response2 = client.post('/inventory/items', json=item_data)
    assert response2.status_code == 400


def test_get_inventory_items_after_creation(client):
    """Test getting inventory items after creating some"""
    # Create an item
    item_data = {
        "sku": "GET-TEST-001",
        "name": "Battery",
        "category": "batteries",
        "stock": 20,
        "purchase_price": 20.00,
        "sale_price": 25.00,
        "min_stock": 10
    }
    create_response = client.post('/inventory/items', json=item_data)
    assert create_response.status_code == 201
    
    # Get all items
    get_response = client.get('/inventory/items')
    assert get_response.status_code == 200
    items = get_response.json()
    assert len(items) >= 1
    assert any(item["sku"] == item_data["sku"] for item in items)
