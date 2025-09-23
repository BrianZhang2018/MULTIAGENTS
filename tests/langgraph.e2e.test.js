import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { handler } from '../netlify/functions/process_inquiry.js';
import { mockInquiries, mockLLMResponses, mockEvents, mockContext } from './testData.js';

// Mock the Google Generative AI - must be done before importing
const mockInvoke = jest.fn();

// Mock at the module level
jest.mock('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    invoke: mockInvoke,
    ainvoke: mockInvoke  // Also mock async version
  }))
}));

describe('LangGraph E2E Tests - Multi-Agent Mortgage Servicing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment
    process.env.GOOGLE_API_KEY = 'test-api-key-12345';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('CORS Handling', () => {
    test('should handle OPTIONS preflight request', async () => {
      const result = await handler(mockEvents.corsOptions, mockContext);
      
      expect(result.statusCode).toBe(200);
      expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(result.headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
      expect(result.headers['Access-Control-Allow-Headers']).toBe('Content-Type');
    });

    test('should include CORS headers in all responses', async () => {
      const result = await handler(mockEvents.noBody, mockContext);
      
      expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    });
  });

  describe('Request Validation', () => {
    test('should return test response when no body provided', async () => {
      const result = await handler(mockEvents.noBody, mockContext);
      
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.message).toBe('ATLAS LangGraph.js function is working');
      expect(body.langgraph).toBe('enabled');
    });

    test('should return 400 for missing required fields', async () => {
      const result = await handler(mockEvents.invalidPost, mockContext);
      
      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error).toContain('Missing required fields');
    });

    test('should return 500 when API key is missing', async () => {
      delete process.env.GOOGLE_API_KEY;
      
      const event = mockEvents.validPost(mockInquiries.customerService.payment);
      const result = await handler(event, mockContext);
      
      expect(result.statusCode).toBe(500);
      const body = JSON.parse(result.body);
      expect(body.error).toBe('API key not configured');
    });
  });

  describe('Customer Service Agent Routing', () => {
    test('should route payment inquiry to customer service', async () => {
      // Mock orchestrator response
      mockInvoke
        .mockResolvedValueOnce({ content: 'customer_service' })  // Orchestrator
        .mockResolvedValueOnce({ content: mockLLMResponses.agents.customer_service }); // Agent

      const event = mockEvents.validPost(mockInquiries.customerService.payment);
      const result = await handler(event, mockContext);
      
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      
      expect(body.customer_id).toBe('CUST001');
      expect(body.loan_number).toBe('LOAN12345');
      expect(body.routed_to).toBe('customer_service');
      expect(body.response).toContain('payment');
      expect(body.status).toBe('completed');
      expect(body.workflow_engine).toBe('langgraph.js');
    });

    test('should handle account status inquiry', async () => {
      mockInvoke
        .mockResolvedValueOnce({ content: 'customer_service' })
        .mockResolvedValueOnce({ content: mockLLMResponses.agents.customer_service });

      const event = mockEvents.validPost(mockInquiries.customerService.accountStatus);
      const result = await handler(event, mockContext);
      
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.routed_to).toBe('customer_service');
      expect(body.customer_id).toBe('CUST002');
    });
  });

  describe('Document Processor Agent Routing', () => {
    test('should route document upload to document processor', async () => {
      mockInvoke
        .mockResolvedValueOnce({ content: 'document_processor' })
        .mockResolvedValueOnce({ content: mockLLMResponses.agents.document_processor });

      const event = mockEvents.validPost(mockInquiries.documentProcessor.upload);
      const result = await handler(event, mockContext);
      
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      
      expect(body.routed_to).toBe('document_processor');
      expect(body.response).toContain('documents');
      expect(body.customer_id).toBe('CUST004');
    });

    test('should handle loan modification request', async () => {
      mockInvoke
        .mockResolvedValueOnce({ content: 'document_processor' })
        .mockResolvedValueOnce({ content: mockLLMResponses.agents.document_processor });

      const event = mockEvents.validPost(mockInquiries.documentProcessor.modification);
      const result = await handler(event, mockContext);
      
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.routed_to).toBe('document_processor');
      expect(body.customer_id).toBe('CUST005');
    });
  });

  describe('Risk Compliance Agent Routing', () => {
    test('should route delinquency issue to risk compliance', async () => {
      mockInvoke
        .mockResolvedValueOnce({ content: 'risk_compliance' })
        .mockResolvedValueOnce({ content: mockLLMResponses.agents.risk_compliance });

      const event = mockEvents.validPost(mockInquiries.riskCompliance.delinquency);
      const result = await handler(event, mockContext);
      
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      
      expect(body.routed_to).toBe('risk_compliance');
      expect(body.response).toContain('assistance programs');
      expect(body.customer_id).toBe('CUST006');
    });

    test('should handle fraud concerns', async () => {
      mockInvoke
        .mockResolvedValueOnce({ content: 'risk_compliance' })
        .mockResolvedValueOnce({ content: mockLLMResponses.agents.risk_compliance });

      const event = mockEvents.validPost(mockInquiries.riskCompliance.fraud);
      const result = await handler(event, mockContext);
      
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.routed_to).toBe('risk_compliance');
      expect(body.customer_id).toBe('CUST007');
    });
  });

  describe('Portfolio Manager Agent Routing', () => {
    test('should route refinancing inquiry to portfolio manager', async () => {
      mockInvoke
        .mockResolvedValueOnce({ content: 'portfolio_manager' })
        .mockResolvedValueOnce({ content: mockLLMResponses.agents.portfolio_manager });

      const event = mockEvents.validPost(mockInquiries.portfolioManager.refinancing);
      const result = await handler(event, mockContext);
      
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      
      expect(body.routed_to).toBe('portfolio_manager');
      expect(body.response).toContain('refinancing');
      expect(body.customer_id).toBe('CUST009');
    });

    test('should handle rate change inquiries', async () => {
      mockInvoke
        .mockResolvedValueOnce({ content: 'portfolio_manager' })
        .mockResolvedValueOnce({ content: mockLLMResponses.agents.portfolio_manager });

      const event = mockEvents.validPost(mockInquiries.portfolioManager.rateChange);
      const result = await handler(event, mockContext);
      
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.routed_to).toBe('portfolio_manager');
      expect(body.customer_id).toBe('CUST010');
    });
  });

  describe('Error Handling', () => {
    test('should handle LLM API errors gracefully', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('API rate limit exceeded'));

      const event = mockEvents.validPost(mockInquiries.customerService.payment);
      const result = await handler(event, mockContext);
      
      expect(result.statusCode).toBe(500);
      const body = JSON.parse(result.body);
      expect(body.error).toContain('API rate limit exceeded');
      expect(body.workflow_engine).toBe('langgraph.js');
    });

    test('should fallback to customer service for invalid agent routing', async () => {
      // Mock orchestrator returning invalid agent name
      mockInvoke
        .mockResolvedValueOnce({ content: 'invalid_agent_name' })
        .mockResolvedValueOnce({ content: mockLLMResponses.agents.customer_service });

      const event = mockEvents.validPost(mockInquiries.customerService.payment);
      const result = await handler(event, mockContext);
      
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      // Should fallback to customer_service
      expect(body.routed_to).toBe('customer_service');
    });

    test('should handle network timeouts', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      mockInvoke.mockRejectedValueOnce(timeoutError);

      const event = mockEvents.validPost(mockInquiries.customerService.payment);
      const result = await handler(event, mockContext);
      
      expect(result.statusCode).toBe(500);
      const body = JSON.parse(result.body);
      expect(body.type).toBe('TimeoutError');
    });
  });

  describe('Response Format Validation', () => {
    test('should return proper response structure', async () => {
      mockInvoke
        .mockResolvedValueOnce({ content: 'customer_service' })
        .mockResolvedValueOnce({ content: mockLLMResponses.agents.customer_service });

      const event = mockEvents.validPost(mockInquiries.customerService.payment);
      const result = await handler(event, mockContext);
      
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      
      // Validate response structure
      expect(body).toHaveProperty('customer_id');
      expect(body).toHaveProperty('loan_number');
      expect(body).toHaveProperty('routed_to');
      expect(body).toHaveProperty('response');
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('workflow_engine');
      expect(body).toHaveProperty('timestamp');
      
      // Validate data types
      expect(typeof body.customer_id).toBe('string');
      expect(typeof body.loan_number).toBe('string');
      expect(typeof body.routed_to).toBe('string');
      expect(typeof body.response).toBe('string');
      expect(body.status).toBe('completed');
      expect(body.workflow_engine).toBe('langgraph.js');
    });
  });
});