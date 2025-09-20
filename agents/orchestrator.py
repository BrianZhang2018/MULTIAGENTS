from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from models import ServicingState
from config import Config

class OrchestratorAgent:
    """Simple orchestrator that analyzes customer inquiry and routes to appropriate agent"""
    
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model=Config.MODEL_NAME,
            temperature=Config.MODEL_TEMPERATURE,
            google_api_key=Config.GOOGLE_API_KEY
        )
    
    def process(self, state: ServicingState) -> str:
        """Analyze customer inquiry and determine which agent should handle it"""
        
        prompt = f"""
        You are a mortgage servicing supervisor. Analyze this customer inquiry and decide which agent should handle it:

        Customer ID: {state.customer_id}
        Loan Number: {state.loan_number}
        Inquiry: {state.inquiry_message}

        Available agents:
        - customer_service: Payment questions, account status, general inquiries
        - document_processor: Document uploads, loan modifications
        - risk_compliance: Delinquency, fraud, compliance issues
        - portfolio_manager: Refinancing, rate changes, investment questions

        Respond with ONLY the agent name that should handle this: customer_service, document_processor, risk_compliance, or portfolio_manager
        """
        
        response = self.llm.invoke([HumanMessage(content=prompt)])
        
        # Extract agent name from response
        agent_name = response.content.strip().lower()
        
        # Validate agent name
        valid_agents = ["customer_service", "document_processor", "risk_compliance", "portfolio_manager"]
        if agent_name not in valid_agents:
            agent_name = "customer_service"  # default fallback
        
        return agent_name