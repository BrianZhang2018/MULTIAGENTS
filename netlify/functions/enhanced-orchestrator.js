import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

/**
 * Enhanced OrchestratorAgent - Demonstrates rich context for interview demo
 * Shows how additional context improves AI routing decisions
 */
export class EnhancedOrchestratorAgent {
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

  /**
   * Enhanced routing with rich context for better AI decisions
   * @param {Object} state - Current state object
   * @returns {Promise<string>} - Agent name to route to
   */
  async process(state) {
    // Simulate additional context that could be retrieved from databases
    const customerContext = this.getCustomerContext(state.customer_id);
    const loanContext = this.getLoanContext(state.loan_number);
    const interactionHistory = this.getRecentInteractions(state.customer_id);

    const enhancedPrompt = `
You are an experienced mortgage servicing supervisor with 20+ years in the industry.
Analyze this customer inquiry using ALL available context to make the BEST routing decision.

═══════════════════════════════════════════════════════════════
CUSTOMER PROFILE:
═══════════════════════════════════════════════════════════════
Customer ID: ${state.customer_id}
Account Status: ${customerContext.status}
Risk Level: ${customerContext.riskLevel}
Preferred Communication: ${customerContext.preferredContact}
Previous Issues: ${customerContext.commonIssues.join(", ")}

═══════════════════════════════════════════════════════════════
LOAN DETAILS:
═══════════════════════════════════════════════════════════════
Loan Number: ${state.loan_number}
Loan Type: ${loanContext.type}
Current Status: ${loanContext.status}
Payment Status: ${loanContext.paymentStatus}
Next Due Date: ${loanContext.nextDueDate}
Outstanding Balance: ${loanContext.balance}

═══════════════════════════════════════════════════════════════
RECENT INTERACTION HISTORY:
═══════════════════════════════════════════════════════════════
${interactionHistory.map(interaction => 
  `${interaction.date}: ${interaction.type} - ${interaction.summary}`
).join("\\n")}

═══════════════════════════════════════════════════════════════
CURRENT INQUIRY:
═══════════════════════════════════════════════════════════════
"${state.inquiry_message}"

═══════════════════════════════════════════════════════════════
AVAILABLE SPECIALIST AGENTS:
═══════════════════════════════════════════════════════════════

🏪 CUSTOMER_SERVICE
   • Payment questions, account inquiries, general information
   • Payment setup, autopay, payment history
   • Account balance, statement requests
   • General mortgage questions
   • Best for: routine inquiries, account maintenance

📄 DOCUMENT_PROCESSOR  
   • Document uploads, loan modifications
   • Income verification, asset documentation
   • Application processing, form assistance
   • Document status tracking
   • Best for: paperwork, loan changes, applications

⚠️  RISK_COMPLIANCE
   • Delinquency management, loss mitigation
   • Foreclosure prevention, workout options
   • Fraud investigation, compliance issues
   • Legal notices, regulatory matters
   • Best for: payment problems, legal issues, urgent situations

💼 PORTFOLIO_MANAGER
   • Refinancing analysis, rate decisions
   • Investment strategy, market timing
   • Product switching, loan optimization
   • Financial planning, rate lock decisions
   • Best for: strategic financial decisions, market-driven inquiries

═══════════════════════════════════════════════════════════════
ROUTING INSTRUCTIONS:
═══════════════════════════════════════════════════════════════

Consider these factors in your decision:
1. CUSTOMER CONTEXT: Previous issues, risk level, interaction patterns
2. LOAN STATUS: Current standing, payment history, loan type
3. INQUIRY INTENT: What does the customer really need?
4. URGENCY LEVEL: Is this time-sensitive or routine?
5. COMPLEXITY: Does this require specialized expertise?

RESPOND WITH ONLY THE AGENT NAME: customer_service, document_processor, risk_compliance, or portfolio_manager

Your routing decision should optimize for:
- Customer satisfaction and quick resolution
- Appropriate expertise level for the inquiry
- Operational efficiency
`;

    try {
      const response = await this.llm.invoke([new HumanMessage({ content: enhancedPrompt })]);
      
      const agentName = response.content.trim().toLowerCase();
      const validAgents = ["customer_service", "document_processor", "risk_compliance", "portfolio_manager"];
      
      if (validAgents.includes(agentName)) {
        // Log the routing decision for demo purposes
        console.log(`🎯 Enhanced Routing Decision: ${agentName.toUpperCase()}`);
        console.log(`📋 Context Used: Customer ${customerContext.status}, Loan ${loanContext.status}, Risk ${customerContext.riskLevel}`);
        return agentName;
      } else {
        console.log(`⚠️  Invalid agent response: ${agentName}, defaulting to customer_service`);
        return "customer_service";
      }
    } catch (error) {
      console.error('Error in enhanced orchestrator agent:', error);
      return "customer_service";
    }
  }

  /**
   * Simulate customer context retrieval (in real system, this would query CRM)
   */
  getCustomerContext(customerId) {
    // Simulated customer data for demo
    const customerProfiles = {
      "CUST001": {
        status: "Good Standing",
        riskLevel: "Low",
        preferredContact: "Email",
        commonIssues: ["Payment scheduling", "Account questions"]
      },
      "CUST002": {
        status: "Active", 
        riskLevel: "Medium",
        preferredContact: "Phone",
        commonIssues: ["Document submissions", "Loan modifications"]
      },
      "CUST003": {
        status: "At Risk",
        riskLevel: "High", 
        preferredContact: "Phone",
        commonIssues: ["Payment difficulties", "Legal notices"]
      },
      "CUST004": {
        status: "VIP",
        riskLevel: "Low",
        preferredContact: "Email",
        commonIssues: ["Investment decisions", "Rate optimization"]
      }
    };

    return customerProfiles[customerId] || {
      status: "Active",
      riskLevel: "Medium", 
      preferredContact: "Email",
      commonIssues: ["General inquiries"]
    };
  }

  /**
   * Simulate loan context retrieval (in real system, this would query loan database)
   */
  getLoanContext(loanNumber) {
    const loanProfiles = {
      "LOAN12345": {
        type: "30-Year Fixed",
        status: "Current",
        paymentStatus: "On Time",
        nextDueDate: "2025-10-15",
        balance: "$284,750"
      },
      "LOAN67890": {
        type: "ARM 5/1",
        status: "Modification Pending", 
        paymentStatus: "Modified Terms",
        nextDueDate: "2025-10-20",
        balance: "$312,450"
      },
      "LOAN11111": {
        type: "15-Year Fixed",
        status: "Delinquent",
        paymentStatus: "30 Days Past Due",
        nextDueDate: "2025-09-15",
        balance: "$156,890"
      },
      "LOAN22222": {
        type: "ARM 7/1",
        status: "Rate Adjustment Pending",
        paymentStatus: "Current",
        nextDueDate: "2025-11-01", 
        balance: "$445,200"
      }
    };

    return loanProfiles[loanNumber] || {
      type: "30-Year Fixed",
      status: "Current",
      paymentStatus: "On Time",
      nextDueDate: "2025-10-15",
      balance: "$250,000"
    };
  }

  /**
   * Simulate interaction history retrieval (in real system, this would query interaction logs)
   */
  getRecentInteractions(customerId) {
    const interactionHistory = {
      "CUST001": [
        { date: "2025-09-20", type: "Payment", summary: "Set up autopay" },
        { date: "2025-09-15", type: "Inquiry", summary: "Asked about escrow account" }
      ],
      "CUST002": [
        { date: "2025-09-18", type: "Document", summary: "Uploaded income verification" },
        { date: "2025-09-10", type: "Modification", summary: "Started loan modification process" }
      ],
      "CUST003": [
        { date: "2025-09-22", type: "Legal", summary: "Received foreclosure notice" },
        { date: "2025-09-01", type: "Payment", summary: "Missed payment due to job loss" }
      ],
      "CUST004": [
        { date: "2025-09-19", type: "Rate", summary: "Inquired about refinancing rates" },
        { date: "2025-08-30", type: "Investment", summary: "Discussed portfolio optimization" }
      ]
    };

    return interactionHistory[customerId] || [
      { date: "2025-09-15", type: "General", summary: "First contact" }
    ];
  }
}