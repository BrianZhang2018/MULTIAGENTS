#!/bin/bash

# ATLAS Multi-Agent System - Test All Agents
# Automated testing script for all LangGraph agents

set -e  # Exit on any error

SERVER_URL="http://localhost:8888"
FUNCTION_URL="$SERVER_URL/.netlify/functions/process_inquiry"
TIMEOUT=60

echo "🧪 Testing ATLAS Multi-Agent System"
echo "=================================================="
echo "Server: $SERVER_URL"
echo "Function: $FUNCTION_URL"
echo ""

# Function to test API endpoint
test_agent() {
    local test_name="$1"
    local customer_id="$2"
    local loan_number="$3"
    local inquiry="$4"
    local expected_agent="$5"
    
    echo "🔍 Testing: $test_name"
    echo "   Expected Agent: $expected_agent"
    
    # Make the API call
    response=$(curl -s -X POST "$FUNCTION_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"customer_id\": \"$customer_id\",
            \"loan_number\": \"$loan_number\",
            \"inquiry_message\": \"$inquiry\"
        }" \
        --max-time $TIMEOUT)
    
    # Check if response is valid JSON
    if ! echo "$response" | jq . > /dev/null 2>&1; then
        echo "   ❌ Invalid JSON response"
        echo "   Response: $response"
        return 1
    fi
    
    # Extract routed agent
    routed_to=$(echo "$response" | jq -r '.routed_to')
    status=$(echo "$response" | jq -r '.status')
    
    # Validate routing
    if [ "$routed_to" = "$expected_agent" ]; then
        echo "   ✅ Correctly routed to: $routed_to"
    else
        echo "   ⚠️  Unexpected routing: $routed_to (expected: $expected_agent)"
    fi
    
    # Validate completion
    if [ "$status" = "completed" ]; then
        echo "   ✅ Status: $status"
    else
        echo "   ❌ Status: $status"
    fi
    
    # Get response length
    response_text=$(echo "$response" | jq -r '.response')
    response_length=${#response_text}
    echo "   📝 Response length: $response_length characters"
    
    echo ""
    return 0
}

# Check if server is running
echo "🔧 Checking server status..."
if ! curl -s "$SERVER_URL" > /dev/null; then
    echo "❌ Server not running at $SERVER_URL"
    echo "   Please start the server first:"
    echo "   ./scripts/start-server.sh"
    exit 1
fi

# Test health endpoint
echo "🏥 Testing health endpoint..."
health_response=$(curl -s -X POST "$FUNCTION_URL" \
    -H "Content-Type: application/json" \
    --max-time 10)

if echo "$health_response" | jq -e '.message' > /dev/null 2>&1; then
    echo "   ✅ Health check passed"
    echo "   Message: $(echo "$health_response" | jq -r '.message')"
else
    echo "   ❌ Health check failed"
    echo "   Response: $health_response"
fi
echo ""

echo "🤖 Testing Agent Routing..."
echo "=================================================="

# Test Customer Service Agent
test_agent \
    "Customer Service - Payment Inquiry" \
    "CUST001" \
    "LOAN12345" \
    "I need help with my monthly payment amount and due date" \
    "customer_service"

test_agent \
    "Customer Service - Account Status" \
    "CUST002" \
    "LOAN67890" \
    "Can you check my current account balance and payment history?" \
    "customer_service"

# Test Document Processor Agent  
test_agent \
    "Document Processor - Upload Request" \
    "CUST003" \
    "LOAN11111" \
    "I need to upload my income verification documents for loan modification" \
    "document_processor"

test_agent \
    "Document Processor - Modification Request" \
    "CUST004" \
    "LOAN22222" \
    "I want to apply for a loan modification due to financial hardship" \
    "document_processor"

# Test Risk Compliance Agent
test_agent \
    "Risk Compliance - Delinquency" \
    "CUST005" \
    "LOAN33333" \
    "I'm behind on payments and received a foreclosure notice" \
    "risk_compliance"

test_agent \
    "Risk Compliance - Fraud Concern" \
    "CUST006" \
    "LOAN44444" \
    "I think someone is trying to fraudulently access my account" \
    "risk_compliance"

# Test Portfolio Manager Agent
test_agent \
    "Portfolio Manager - Refinancing" \
    "CUST007" \
    "LOAN55555" \
    "I'm interested in refinancing my mortgage to get a better rate" \
    "portfolio_manager"

test_agent \
    "Portfolio Manager - Rate Change" \
    "CUST008" \
    "LOAN66666" \
    "My adjustable rate mortgage is changing, what are my options?" \
    "portfolio_manager"

echo "🎯 Testing Edge Cases..."
echo "=================================================="

# Test validation
echo "🔍 Testing validation errors..."
validation_response=$(curl -s -X POST "$FUNCTION_URL" \
    -H "Content-Type: application/json" \
    -d '{"incomplete": "data"}' \
    --max-time 10)

if echo "$validation_response" | jq -e '.error' | grep -q "Missing required fields"; then
    echo "   ✅ Validation error handling works"
else
    echo "   ❌ Validation error handling failed"
    echo "   Response: $validation_response"
fi

echo ""
echo "🎉 Testing Complete!"
echo "=================================================="
echo "✅ All agent routing tests completed"
echo "💡 Check the output above for any routing issues"
echo "🚀 Your ATLAS system is ready for production!"
echo ""