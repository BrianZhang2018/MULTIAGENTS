from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from models import ServicingState
from config import Config

class DocumentProcessorAgent:
    """Simple document processing agent for loan modifications and document handling"""
    
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model=Config.MODEL_NAME,
            temperature=Config.MODEL_TEMPERATURE,
            google_api_key=Config.GOOGLE_API_KEY
        )
    
    def process(self, state: ServicingState) -> str:
        """Handle document processing requests"""
        
        prompt = f"""
        You are a mortgage document processing specialist. Help the customer with their document-related request:

        Customer ID: {state.customer_id}
        Loan Number: {state.loan_number}
        Request: {state.inquiry_message}

        Provide guidance on:
        - What documents they need to submit
        - How to submit documents
        - Processing timelines
        - Next steps in the process

        Be clear and specific about requirements.
        """
        
        response = self.llm.invoke([HumanMessage(content=prompt)])
        return response.content