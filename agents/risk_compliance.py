from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from models import ServicingState
from config import Config

class RiskComplianceAgent:
    """Simple risk and compliance agent for delinquency and regulatory matters"""
    
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model=Config.MODEL_NAME,
            temperature=Config.MODEL_TEMPERATURE,
            google_api_key=Config.GOOGLE_API_KEY
        )
    
    def process(self, state: ServicingState) -> str:
        """Handle risk and compliance issues"""
        
        prompt = f"""
        You are a mortgage risk and compliance specialist. Address the customer's concern:

        Customer ID: {state.customer_id}
        Loan Number: {state.loan_number}
        Issue: {state.inquiry_message}

        For delinquency issues, provide:
        - Available assistance programs
        - Steps to avoid foreclosure
        - Payment plan options

        For compliance matters, explain:
        - Regulatory protections
        - Customer rights
        - Proper procedures

        Be supportive and provide actionable guidance.
        """
        
        response = self.llm.invoke([HumanMessage(content=prompt)])
        return response.content