import { StateGraph, START, END } from "@langchain/langgraph";
import { OrchestratorAgent } from "./orchestrator-agent.js";
import { 
  CustomerServiceAgent, 
  DocumentProcessorAgent, 
  RiskComplianceAgent, 
  PortfolioManagerAgent 
} from "./agents.js";
import { ServicingStateSchema } from "./models.js";

// Initialize agents
const orchestrator = new OrchestratorAgent();
const customerService = new CustomerServiceAgent();
const documentProcessor = new DocumentProcessorAgent();
const riskCompliance = new RiskComplianceAgent();
const portfolioManager = new PortfolioManagerAgent();

/**
 * Orchestrator node - decides which agent to route to
 */
async function orchestratorNode(state) {
  try {
    const nextAgent = await orchestrator.process(state);
    
    return {
      orchestrator_response: `Routing to: ${nextAgent}`,
      current_agent: nextAgent,
      status: "processing"
    };
  } catch (error) {
    console.error("Error in orchestrator node:", error);
    return {
      orchestrator_response: "Error in routing, defaulting to customer service",
      current_agent: "customer_service",
      status: "processing"
    };
  }
}

/**
 * Customer service node
 */
async function customerServiceNode(state) {
  try {
    const response = await customerService.process(state);
    
    return {
      customer_service_response: response,
      final_response: response,
      status: "completed"
    };
  } catch (error) {
    console.error("Error in customer service node:", error);
    return {
      customer_service_response: "Error processing request. Please contact support.",
      final_response: "Error processing request. Please contact support.",
      status: "completed"
    };
  }
}

/**
 * Document processor node
 */
async function documentProcessorNode(state) {
  try {
    const response = await documentProcessor.process(state);
    
    return {
      document_processor_response: response,
      final_response: response,
      status: "completed"
    };
  } catch (error) {
    console.error("Error in document processor node:", error);
    return {
      document_processor_response: "Error processing document request. Please contact support.",
      final_response: "Error processing document request. Please contact support.",
      status: "completed"
    };
  }
}

/**
 * Risk compliance node
 */
async function riskComplianceNode(state) {
  try {
    const response = await riskCompliance.process(state);
    
    return {
      risk_compliance_response: response,
      final_response: response,
      status: "completed"
    };
  } catch (error) {
    console.error("Error in risk compliance node:", error);
    return {
      risk_compliance_response: "Error processing compliance request. Please contact support.",
      final_response: "Error processing compliance request. Please contact support.",
      status: "completed"
    };
  }
}

/**
 * Portfolio manager node
 */
async function portfolioManagerNode(state) {
  try {
    const response = await portfolioManager.process(state);
    
    return {
      portfolio_manager_response: response,
      final_response: response,
      status: "completed"
    };
  } catch (error) {
    console.error("Error in portfolio manager node:", error);
    return {
      portfolio_manager_response: "Error processing portfolio request. Please contact support.",
      final_response: "Error processing portfolio request. Please contact support.",
      status: "completed"
    };
  }
}

/**
 * Routing function - determines which agent to go to after orchestrator
 */
function routeAfterOrchestrator(state) {
  return state.current_agent || "customer_service";
}

/**
 * Create the LangGraph workflow for mortgage servicing
 */
export function createServicingGraph() {
  const workflow = new StateGraph({
    channels: ServicingStateSchema
  });

  // Add nodes
  workflow.addNode("orchestrator", orchestratorNode);
  workflow.addNode("customer_service", customerServiceNode);
  workflow.addNode("document_processor", documentProcessorNode);
  workflow.addNode("risk_compliance", riskComplianceNode);
  workflow.addNode("portfolio_manager", portfolioManagerNode);

  // Add edges
  workflow.addEdge(START, "orchestrator");

  // Conditional routing from orchestrator
  workflow.addConditionalEdges(
    "orchestrator",
    routeAfterOrchestrator,
    {
      "customer_service": "customer_service",
      "document_processor": "document_processor",
      "risk_compliance": "risk_compliance", 
      "portfolio_manager": "portfolio_manager"
    }
  );

  // All agents go to END
  workflow.addEdge("customer_service", END);
  workflow.addEdge("document_processor", END);
  workflow.addEdge("risk_compliance", END);
  workflow.addEdge("portfolio_manager", END);

  return workflow.compile();
}