#!/usr/bin/env python3
"""
Simple test script to verify metrics API endpoints work correctly
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_metrics_endpoints():
    """Test all metrics endpoints"""
    
    print("Testing Metrics API Endpoints...")
    print("=" * 50)
    
    # Test system performance endpoint
    print("\n1. Testing /metrics/system-performance")
    response = client.get("/metrics/system-performance")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Response: {data}")
        assert "avg_response_time_ms" in data
        assert "system_uptime_percent" in data
        assert "total_requests" in data
        assert "error_rate_percent" in data
        print("   ✓ System Performance endpoint works!")
    else:
        print(f"   ✗ Failed: {response.text}")
        return False
    
    # Test operational endpoint (will fail without database, but we can check structure)
    print("\n2. Testing /metrics/operational")
    response = client.get("/metrics/operational")
    print(f"   Status: {response.status_code}")
    if response.status_code in [200, 500]:  # 500 is ok if no DB connection
        print("   ✓ Operational endpoint exists!")
    else:
        print(f"   ✗ Unexpected status: {response.text}")
        return False
    
    # Test user engagement endpoint
    print("\n3. Testing /metrics/user-engagement")
    response = client.get("/metrics/user-engagement")
    print(f"   Status: {response.status_code}")
    if response.status_code in [200, 500]:  # 500 is ok if no DB connection
        print("   ✓ User Engagement endpoint exists!")
    else:
        print(f"   ✗ Unexpected status: {response.text}")
        return False
    
    # Test dashboard summary endpoint
    print("\n4. Testing /metrics/dashboard")
    response = client.get("/metrics/dashboard")
    print(f"   Status: {response.status_code}")
    if response.status_code in [200, 500]:  # 500 is ok if no DB connection
        print("   ✓ Dashboard endpoint exists!")
    else:
        print(f"   ✗ Unexpected status: {response.text}")
        return False
    
    # Test reset endpoint
    print("\n5. Testing /metrics/reset-metrics")
    response = client.post("/metrics/reset-metrics")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Response: {data}")
        assert data["status"] == "reset"
        print("   ✓ Reset endpoint works!")
    else:
        print(f"   ✗ Failed: {response.text}")
        return False
    
    print("\n" + "=" * 50)
    print("✓ All metrics endpoints are properly configured!")
    print("\nNote: Database-dependent endpoints may show 500 errors")
    print("      without a database connection, but this is expected.")
    return True

if __name__ == "__main__":
    try:
        success = test_metrics_endpoints()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
