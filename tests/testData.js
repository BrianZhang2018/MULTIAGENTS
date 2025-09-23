// Test data and fixtures for LangGraph e2e tests

export const mockInquiries = {
  customerService: {
    payment: {
      customer_id: "CUST001",
      loan_number: "LOAN12345",
      inquiry_message: "I need help with my monthly payment amount and due date"
    },
    accountStatus: {
      customer_id: "CUST002", 
      loan_number: "LOAN67890",
      inquiry_message: "Can you check my current account balance and payment history?"
    },
    general: {
      customer_id: "CUST003",
      loan_number: "LOAN11111",
      inquiry_message: "I have questions about my mortgage statement"
    }
  },

  documentProcessor: {
    upload: {
      customer_id: "CUST004",
      loan_number: "LOAN22222",
      inquiry_message: "I need to upload my income verification documents for loan modification"
    },
    modification: {
      customer_id: "CUST005",
      loan_number: "LOAN33333", 
      inquiry_message: "I want to apply for a loan modification due to financial hardship"
    }
  },

  riskCompliance: {
    delinquency: {
      customer_id: "CUST006",
      loan_number: "LOAN44444",
      inquiry_message: "I'm behind on payments and received a foreclosure notice"
    },
    fraud: {
      customer_id: "CUST007",
      loan_number: "LOAN55555",
      inquiry_message: "I think someone is trying to fraudulently access my account"
    },
    compliance: {
      customer_id: "CUST008", 
      loan_number: "LOAN66666",
      inquiry_message: "I need information about my rights under the CFPB regulations"
    }
  },

  portfolioManager: {
    refinancing: {
      customer_id: "CUST009",
      loan_number: "LOAN77777",
      inquiry_message: "I'm interested in refinancing my mortgage to get a better rate"
    },
    rateChange: {
      customer_id: "CUST010",
      loan_number: "LOAN88888", 
      inquiry_message: "My adjustable rate mortgage is changing, what are my options?"
    },
    investment: {
      customer_id: "CUST011",
      loan_number: "LOAN99999",
      inquiry_message: "I want to understand investment options for my mortgage portfolio"
    }
  }
};

export const mockLLMResponses = {
  orchestrator: {
    customer_service: "customer_service",
    document_processor: "document_processor", 
    risk_compliance: "risk_compliance",
    portfolio_manager: "portfolio_manager"
  },

  agents: {
    customer_service: "Thank you for contacting us about your payment inquiry. Based on your account, your next payment of $1,247.89 is due on the 15th of next month. You can make payments online through our portal or by calling our automated system.",
    
    document_processor: "To proceed with your loan modification request, please submit the following documents: recent pay stubs (last 2 months), tax returns (last 2 years), bank statements (last 3 months), and a hardship letter. You can upload these securely through our document portal.",
    
    risk_compliance: "I understand you're facing financial difficulties. We have several assistance programs available including forbearance options, payment plans, and loan modifications. Let's discuss which option might work best for your situation to help you avoid foreclosure.",
    
    portfolio_manager: "Current market rates are favorable for refinancing. Based on your loan details, you may qualify for a rate reduction. The process typically takes 30-45 days and requires an appraisal. I can start the pre-qualification process if you'd like to proceed."
  }
};

export const mockEvents = {
  validPost: (body) => ({
    httpMethod: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://example.com'
    },
    body: JSON.stringify(body)
  }),

  corsOptions: {
    httpMethod: 'OPTIONS',
    headers: {
      'Origin': 'https://example.com',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type'
    }
  },

  invalidPost: {
    httpMethod: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ incomplete: 'data' })
  },

  noBody: {
    httpMethod: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }
};

export const mockContext = {
  functionName: 'process_inquiry',
  functionVersion: '1.0',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:process_inquiry',
  memoryLimitInMB: '128',
  awsRequestId: 'test-request-id',
  getRemainingTimeInMillis: () => 30000
};