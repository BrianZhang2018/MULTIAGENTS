from langgraph.graph import StateGraph, START, END
from langgraph.types import Command
from typing import Dict, Any

from models import ServicingState
from agents.orchestrator import OrchestratorAgent
from agents.customer_service import CustomerServiceAgent
from agents.document_processor import DocumentProcessorAgent
from agents.risk_compliance import RiskComplianceAgent
from agents.portfolio_manager import PortfolioManagerAgent

# Initialize agents
orchestrator = OrchestratorAgent()
customer_service = CustomerServiceAgent()
document_processor = DocumentProcessorAgent()
risk_compliance = RiskComplianceAgent()
portfolio_manager = PortfolioManagerAgent()

def orchestrator_node(state: ServicingState) -> Dict[str, Any]:
    """Orchestrator decides which agent to route to"""
    next_agent = orchestrator.process(state)
    state.orchestrator_response = f"Routing to: {next_agent}"
    state.current_agent = next_agent
    state.status = "processing"
    
    return {
        "orchestrator_response": state.orchestrator_response,
        "current_agent": next_agent,
        "status": "processing"
    }

def customer_service_node(state: ServicingState) -> Dict[str, Any]:
    """Customer service agent processes the inquiry"""
    response = customer_service.process(state)
    state.customer_service_response = response
    state.final_response = response
    state.status = "completed"
    
    return {
        "customer_service_response": response,
        "final_response": response,
        "status": "completed"
    }

def document_processor_node(state: ServicingState) -> Dict[str, Any]:
    """Document processor agent handles the inquiry"""
    response = document_processor.process(state)
    state.document_processor_response = response
    state.final_response = response
    state.status = "completed"
    
    return {
        "document_processor_response": response,
        "final_response": response,
        "status": "completed"
    }

def risk_compliance_node(state: ServicingState) -> Dict[str, Any]:
    """Risk compliance agent handles the inquiry"""
    response = risk_compliance.process(state)
    state.risk_compliance_response = response
    state.final_response = response
    state.status = "completed"
    
    return {
        "risk_compliance_response": response,
        "final_response": response,
        "status": "completed"
    }

def portfolio_manager_node(state: ServicingState) -> Dict[str, Any]:
    """Portfolio manager agent handles the inquiry"""
    response = portfolio_manager.process(state)
    state.portfolio_manager_response = response
    state.final_response = response
    state.status = "completed"
    
    return {
        "portfolio_manager_response": response,
        "final_response": response,
        "status": "completed"
    }

def route_after_orchestrator(state: ServicingState) -> str:
    """Determine which agent to go to after orchestrator"""
    return state.current_agent

# Create the graph
def create_servicing_graph():
    """Create the LangGraph workflow for mortgage servicing"""
    
    workflow = StateGraph(ServicingState)
    
    # Add nodes
    workflow.add_node("orchestrator", orchestrator_node)
    workflow.add_node("customer_service", customer_service_node)
    workflow.add_node("document_processor", document_processor_node)
    workflow.add_node("risk_compliance", risk_compliance_node)
    workflow.add_node("portfolio_manager", portfolio_manager_node)
    
    # Add edges
    workflow.add_edge(START, "orchestrator")
    
    # Conditional routing from orchestrator
    workflow.add_conditional_edges(
        "orchestrator",
        route_after_orchestrator,
        {
            "customer_service": "customer_service",
            "document_processor": "document_processor", 
            "risk_compliance": "risk_compliance",
            "portfolio_manager": "portfolio_manager"
        }
    )
    
    # All agents go to END
    workflow.add_edge("customer_service", END)
    workflow.add_edge("document_processor", END)
    workflow.add_edge("risk_compliance", END)
    workflow.add_edge("portfolio_manager", END)
    
    return workflow.compile()