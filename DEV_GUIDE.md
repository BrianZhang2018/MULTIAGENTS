# 🚀 ATLAS Development Guide

## Quick Start

### 1. Start the Server
```bash
# Using npm script (recommended)
npm start

# Or directly
./scripts/start-server.sh

# Or using Netlify CLI directly
netlify dev
```

### 2. Test All Agents
```bash
# Test all agent routing
npm run test:agents

# Run unit tests
npm run test:unit

# Run both
npm run test:e2e
```

### 3. Access LangGraph Studio (Optional)
```bash
npm run studio
```

## 📋 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Start Server** | `npm start` | Start development server with health checks |
| **Development** | `npm run dev` | Start Netlify dev server directly |
| **Test Agents** | `npm run test:agents` | Test all LangGraph agent routing |
| **Unit Tests** | `npm run test:unit` | Run Jest unit tests |
| **E2E Tests** | `npm run test:e2e` | Run end-to-end agent tests |
| **Test Coverage** | `npm run test:coverage` | Run tests with coverage report |
| **LangGraph Studio** | `npm run studio` | Start LangGraph Studio UI |
| **Deploy** | `npm run deploy` | Deploy to Netlify production |
| **Setup** | `npm run setup` | Install dependencies |

## 🔧 Development Workflow

### Starting Development
1. **Clone and Setup**
   ```bash
   git clone <repository>
   cd MultiAgents
   npm run setup
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Google API key
   ```

3. **Start Development**
   ```bash
   npm start
   ```

### Testing Workflow
1. **Start Server** (in terminal 1)
   ```bash
   npm start
   ```

2. **Run Tests** (in terminal 2)
   ```bash
   npm run test:agents
   ```

3. **Development Testing**
   ```bash
   # Watch mode for unit tests
   npm run test:watch
   
   # Single test run
   npm run test:unit
   ```

## 🌐 Server Information

### Local Development
- **Frontend**: http://localhost:8888
- **Functions**: http://localhost:8888/.netlify/functions/
- **Health Check**: http://localhost:8888/.netlify/functions/process_inquiry

### Available Endpoints

#### Process Inquiry (Main LangGraph Function)
```bash
POST http://localhost:8888/.netlify/functions/process_inquiry

# Request Body:
{
  "customer_id": "CUST001",
  "loan_number": "LOAN12345", 
  "inquiry_message": "I need help with my payment"
}

# Response:
{
  "customer_id": "CUST001",
  "loan_number": "LOAN12345",
  "routed_to": "customer_service",
  "response": "...",
  "status": "completed",
  "workflow_engine": "langgraph.js",
  "timestamp": "2025-09-22T21:15:08.626Z"
}
```

#### Health Check
```bash
GET/POST http://localhost:8888/.netlify/functions/process_inquiry

# Response:
{
  "message": "ATLAS LangGraph.js function is working",
  "method": "GET",
  "environment": "netlify",
  "langgraph": "enabled"
}
```

## 🤖 Agent Types & Routing

### Customer Service Agent
**Routes when inquiry contains:**
- Payment questions
- Account status
- General inquiries
- Balance information

**Example:**
```json
{
  "inquiry_message": "I need help with my monthly payment amount and due date"
}
```

### Document Processor Agent  
**Routes when inquiry contains:**
- Document uploads
- Loan modifications
- Paperwork requirements
- File submissions

**Example:**
```json
{
  "inquiry_message": "I need to upload documents for loan modification"
}
```

### Risk Compliance Agent
**Routes when inquiry contains:**
- Delinquency issues
- Foreclosure notices
- Fraud concerns
- Compliance questions

**Example:**
```json
{
  "inquiry_message": "I received a foreclosure notice and need help"
}
```

### Portfolio Manager Agent
**Routes when inquiry contains:**
- Refinancing requests
- Rate changes
- Investment questions
- Market conditions

**Example:**
```json
{
  "inquiry_message": "I want to refinance my mortgage for a better rate"
}
```

## 🧪 Testing Examples

### Manual Testing with curl
```bash
# Test customer service routing
curl -X POST http://localhost:8888/.netlify/functions/process_inquiry \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "CUST001",
    "loan_number": "LOAN12345",
    "inquiry_message": "I need help with my monthly payment"
  }'

# Test document processor routing  
curl -X POST http://localhost:8888/.netlify/functions/process_inquiry \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "CUST002", 
    "loan_number": "LOAN67890",
    "inquiry_message": "I need to upload loan modification documents"
  }'
```

### Using the Test Script
```bash
# Run all agent tests
npm run test:agents

# The script will test:
# ✅ Server connectivity
# ✅ Health endpoint
# ✅ All 4 agent types
# ✅ Edge cases and validation
# ✅ Response formatting
```

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Check for processes using ports
lsof -i :3999
lsof -i :8888

# Kill existing processes
npm start  # Script handles this automatically

# Manual kill
lsof -ti :3999 | xargs kill -9
lsof -ti :8888 | xargs kill -9
```

### API Quota Issues
```bash
# Check API key is set
grep GOOGLE_API_KEY .env

# Test API directly
curl -H "Content-Type: application/json" \
  -d '{"contents": [{"parts": [{"text": "Hello"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY"
```

### Function Timeouts
- **Local dev timeout**: 30 seconds (normal)
- **Check quota**: Use Flash model for free tier
- **Network issues**: Check internet connection

### Test Failures
```bash
# Ensure server is running
curl http://localhost:8888

# Check function health
curl http://localhost:8888/.netlify/functions/process_inquiry

# Run individual tests
npm run test:unit
```

## 📁 Project Structure

```
MultiAgents/
├── scripts/
│   ├── start-server.sh      # Server startup script
│   └── test-agents.sh       # Agent testing script
├── netlify/functions/
│   ├── process_inquiry.js   # Main LangGraph function
│   ├── orchestrator-agent.js # Routing agent
│   ├── agents.js           # Specialist agents
│   ├── workflow.js         # LangGraph workflow
│   └── models.js           # State models
├── tests/
│   ├── simple.e2e.test.js  # E2E tests
│   └── setup.js            # Test configuration
├── public/
│   └── index.html          # Frontend interface
├── .env                    # Environment variables
├── .env.example           # Environment template
├── package.json           # NPM scripts & dependencies
├── netlify.toml          # Netlify configuration
└── DEV_GUIDE.md          # This guide
```

## 🚀 Deployment

### Production Deployment
```bash
# Deploy to Netlify
npm run deploy

# Or using Netlify CLI
netlify deploy --prod
```

### Environment Variables (Production)
Set in Netlify dashboard:
- `GOOGLE_API_KEY`: Your Google Generative AI API key
- `LANGCHAIN_API_KEY`: LangSmith API key (optional)
- `LANGCHAIN_PROJECT`: Project name (optional)

## 🎯 Next Steps

1. **Start Development**: `npm start`
2. **Test All Agents**: `npm run test:agents` 
3. **Open Frontend**: http://localhost:8888
4. **Try LangGraph Studio**: `npm run studio`
5. **Deploy**: `npm run deploy`

Your ATLAS Multi-Agent System is ready for development! 🎉