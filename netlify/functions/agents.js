import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

/**
 * Base class for all specialist agents
 */
class BaseAgent {
  constructor() {
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

  async process(state, prompt) {
    try {
      const response = await this.llm.invoke([new HumanMessage({ content: prompt })]);
      return response.content;
    } catch (error) {
      console.error(`Error in ${this.constructor.name}:`, error);
      return "I apologize, but I'm experiencing technical difficulties. Please try again later or contact our support team.";
    }
  }
}

/**
 * CustomerServiceAgent - Handles payment and account inquiries
 */
export class CustomerServiceAgent extends BaseAgent {
  async process(state) {
    const prompt = `
You are a helpful mortgage customer service representative. Help the customer with their inquiry:

Customer ID: ${state.customer_id}
Loan Number: ${state.loan_number}
Customer Question: ${state.inquiry_message}

Provide a helpful response addressing their concern. Be professional and empathetic.
For payment questions, explain next steps they can take.
For account status, let them know how they can get current information.
    `;

    return await super.process(state, prompt);
  }
}

/**
 * DocumentProcessorAgent - Handles document uploads and loan modifications
 */
export class DocumentProcessorAgent extends BaseAgent {
  async process(state) {
    const prompt = `
You are a mortgage document processing specialist. Help the customer with their document-related request:

Customer ID: ${state.customer_id}
Loan Number: ${state.loan_number}
Request: ${state.inquiry_message}

Provide guidance on:
- What documents they need to submit
- How to submit documents
- Processing timelines
- Next steps in the process

Be clear and specific about requirements.
    `;

    return await super.process(state, prompt);
  }
}

/**
 * RiskComplianceAgent - Handles delinquency, fraud, and compliance issues
 */
export class RiskComplianceAgent extends BaseAgent {
  async process(state) {
    const prompt = `
You are a mortgage risk and compliance specialist. Address the customer's concern:

Customer ID: ${state.customer_id}
Loan Number: ${state.loan_number}
Issue: ${state.inquiry_message}

For delinquency issues, provide:
- Available assistance programs
- Steps to avoid foreclosure
- Payment plan options

For compliance matters, explain:
- Regulatory protections
- Customer rights
- Proper procedures

Be supportive and provide actionable guidance.
    `;

    return await super.process(state, prompt);
  }
}

/**
 * PortfolioManagerAgent - Handles refinancing and rate changes
 */
export class PortfolioManagerAgent extends BaseAgent {
  async process(state) {
    const prompt = `
You are a mortgage portfolio management specialist. Help with the customer's inquiry:

Customer ID: ${state.customer_id}
Loan Number: ${state.loan_number}
Inquiry: ${state.inquiry_message}

For refinancing questions, explain:
- Current market conditions
- Qualification requirements
- Potential benefits and costs
- Application process

For rate inquiries, provide:
- How rates are determined
- Rate change notifications
- Options available

Be informative and helpful in guiding their decision.
    `;

    return await super.process(state, prompt);
  }
}