#!/usr/bin/env python3
"""
Syntax validation test for metrics API
"""

import sys
import ast
import os

def test_syntax(filename):
    """Test Python file syntax"""
    filepath = os.path.join(os.path.dirname(__file__), filename)
    print(f"Checking syntax of {filename}...")
    
    try:
        with open(filepath, 'r') as f:
            code = f.read()
        
        # Try to parse the code
        ast.parse(code)
        print(f"  ✓ {filename} has valid Python syntax")
        return True
    except SyntaxError as e:
        print(f"  ✗ {filename} has syntax error: {e}")
        return False
    except FileNotFoundError:
        print(f"  ✗ {filename} not found")
        return False

def main():
    """Test all new files"""
    print("=" * 50)
    print("Metrics Implementation - Syntax Validation")
    print("=" * 50)
    
    files = [
        'routers/metrics.py',
        'middleware.py',
    ]
    
    all_passed = True
    for filename in files:
        if not test_syntax(filename):
            all_passed = False
    
    print("=" * 50)
    if all_passed:
        print("✓ All files have valid syntax!")
        
        # Check that key features are present
        print("\nChecking metrics.py for required endpoints...")
        with open('routers/metrics.py', 'r') as f:
            content = f.read()
            
        endpoints = [
            '/metrics/user-engagement',
            '/metrics/system-performance',
            '/metrics/operational',
            '/metrics/dashboard',
        ]
        
        for endpoint in endpoints:
            if endpoint in content:
                print(f"  ✓ Endpoint {endpoint} is defined")
            else:
                print(f"  ✗ Endpoint {endpoint} not found")
                all_passed = False
        
        # Check middleware
        print("\nChecking middleware.py...")
        with open('middleware.py', 'r') as f:
            content = f.read()
            
        if 'PerformanceMiddleware' in content:
            print("  ✓ PerformanceMiddleware is defined")
        else:
            print("  ✗ PerformanceMiddleware not found")
            all_passed = False
        
        print("=" * 50)
        if all_passed:
            print("✓ All validation checks passed!")
            return 0
        else:
            print("✗ Some validation checks failed")
            return 1
    else:
        print("✗ Syntax errors found")
        return 1

if __name__ == "__main__":
    sys.exit(main())
