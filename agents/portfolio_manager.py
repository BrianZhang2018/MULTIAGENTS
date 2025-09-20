from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from models import ServicingState
from config import Config

class PortfolioManagerAgent:
    """Simple portfolio management agent for refinancing and rate inquiries"""
    
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model=Config.MODEL_NAME,
            temperature=Config.MODEL_TEMPERATURE,
            google_api_key=Config.GOOGLE_API_KEY
        )
    
    def process(self, state: ServicingState) -> str:
        """Handle portfolio management and refinancing requests"""
        
        prompt = f"""
        You are a mortgage portfolio management specialist. Help with the customer's inquiry:

        Customer ID: {state.customer_id}
        Loan Number: {state.loan_number}
        Inquiry: {state.inquiry_message}

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
        """
        
        response = self.llm.invoke([HumanMessage(content=prompt)])
        return response.content