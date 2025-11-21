#!/bin/bash

echo "=========================================="
echo "PHASE 2: BACKEND API TESTING"
echo "=========================================="
echo ""

BASE_URL="http://localhost:5000/api/v1"

# Test 1: Register User
echo "Test 1: Register New User"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "Test123456",
    "role": "Viewer"
  }')
echo "$REGISTER_RESPONSE" | jq . || echo "$REGISTER_RESPONSE"
echo ""

# Test 2: Login User
echo "Test 2: Login User"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -c /tmp/cookies.txt \
  -d '{
    "email": "testuser@example.com",
    "password": "Test123456"
  }')
echo "$LOGIN_RESPONSE" | jq . || echo "$LOGIN_RESPONSE"

# Extract access token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken // empty')
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refreshToken // empty')
echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo ""

# Test 3: Get Current User
echo "Test 3: Get Current User (/auth/me)"
curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq . || echo "Failed"
echo ""

# Test 4: Get Products
echo "Test 4: Get All Products"
curl -s -X GET "$BASE_URL/products" | jq '. | {success, count: (.products | length)}' || echo "Failed"
echo ""

# Test 5: Get Categories
echo "Test 5: Get All Categories"
curl -s -X GET "$BASE_URL/categories" | jq '. | {success, count: (.categories | length)}' || echo "Failed"
echo ""

echo "=========================================="
echo "Basic API Tests Complete!"
echo "=========================================="
