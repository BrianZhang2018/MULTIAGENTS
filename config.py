import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    LANGCHAIN_TRACING_V2 = os.getenv("LANGCHAIN_TRACING_V2", "true")
    LANGCHAIN_API_KEY = os.getenv("LANGCHAIN_API_KEY")
    LANGCHAIN_PROJECT = os.getenv("LANGCHAIN_PROJECT", "atlas-mortgage-servicing")
    
    CORE_BANKING_API_URL = os.getenv("CORE_BANKING_API_URL", "https://mock-core-banking.api")
    DOCUMENT_STORAGE_API_URL = os.getenv("DOCUMENT_STORAGE_API_URL", "https://mock-docs.api")
    COMPLIANCE_API_URL = os.getenv("COMPLIANCE_API_URL", "https://mock-compliance.api")
    
    MODEL_NAME = "gemini-1.5-pro"
    MODEL_TEMPERATURE = 0.1
    
    @classmethod
    def validate(cls):
        if not cls.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        return True