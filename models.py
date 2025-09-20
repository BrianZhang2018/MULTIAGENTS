from typing import Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime

# Simple state schema for learning
class ServicingState(BaseModel):
    """Simple shared state for the mortgage servicing workflow"""
    
    customer_id: str
    loan_number: str
    inquiry_message: str
    current_agent: str = "orchestrator"
    
    # Simple responses from each agent
    orchestrator_response: Optional[str] = None
    customer_service_response: Optional[str] = None
    document_processor_response: Optional[str] = None
    risk_compliance_response: Optional[str] = None
    portfolio_manager_response: Optional[str] = None
    
    # Final result
    final_response: Optional[str] = None
    status: str = "pending"  # pending, processing, completed
    
    created_at: datetime = datetime.now()