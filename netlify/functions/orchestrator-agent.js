import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

/**
 * OrchestratorAgent - Analyzes customer inquiry and routes to appropriate agent
 * JavaScript equivalent of the Python OrchestratorAgent class
 */
export class OrchestratorAgent {
  constructor() {
    // Get API key from environment
    const googleApiKey = process.env.GOOGLE_API_KEY;
    if (!googleApiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is required');
    }

    this.llm = new ChatGoogleGenerativeAI({
      modelName: "gemini-1.5-flash",
      temperature: 0.1,
      apiKey: googleApiKey
    });
  }

  /**
   * Analyze customer inquiry and determine which agent should handle it
   * @param {Object} state - Current state object
   * @returns {Promise<string>} - Agent name to route to
   */
  async process(state) {
    const prompt = `
You are a mortgage servicing supervisor. Analyze this customer inquiry and decide which agent should handle it:

Customer ID: ${state.customer_id}
Loan Number: ${state.loan_number}
Inquiry: ${state.inquiry_message}

Available agents:
- customer_service: Payment questions, account status, general inquiries
- document_processor: Document uploads, loan modifications
- risk_compliance: Delinquency, fraud, compliance issues
- portfolio_manager: Refinancing, rate changes, investment questions

Respond with ONLY the agent name that should handle this: customer_service, document_processor, risk_compliance, or portfolio_manager
    `;

    try {
      const response = await this.llm.invoke([new HumanMessage({ content: prompt })]);
      
      // Extract agent name from response
      const agentName = response.content.trim().toLowerCase();
      
      // Validate agent name
      const validAgents = ["customer_service", "document_processor", "risk_compliance", "portfolio_manager"];
      if (validAgents.includes(agentName)) {
        return agentName;
      } else {
        // Default fallback
        return "customer_service";
      }
    } catch (error) {
      console.error('Error in orchestrator agent:', error);
      // Default fallback on error
      return "customer_service";
    }
  }
}