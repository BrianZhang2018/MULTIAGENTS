from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from models import ServicingState
from config import Config

class CustomerServiceAgent:
    """Simple customer service agent for payment and account inquiries"""
    
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model=Config.MODEL_NAME,
            temperature=Config.MODEL_TEMPERATURE,
            google_api_key=Config.GOOGLE_API_KEY
        )
    
    def process(self, state: ServicingState) -> str:
        """Handle customer service inquiries"""
        
        prompt = f"""
        You are a helpful mortgage customer service representative. Help the customer with their inquiry:

        Customer ID: {state.customer_id}
        Loan Number: {state.loan_number}
        Customer Question: {state.inquiry_message}

        Provide a helpful response addressing their concern. Be professional and empathetic.
        For payment questions, explain next steps they can take.
        For account status, let them know how they can get current information.
        """
        
        response = self.llm.invoke([HumanMessage(content=prompt)])
        return response.content