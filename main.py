import uuid
from datetime import datetime
from config import Config
from models import ServicingState
from workflows.servicing_workflow import create_servicing_graph

def main():
    """Simple main function to test the multi-agent system"""
    
    # Validate configuration
    try:
        Config.validate()
        print("✅ Configuration validated")
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        print("Please set your GOOGLE_API_KEY in .env file")
        return
    
    # Create the workflow
    print("🔧 Creating workflow...")
    app = create_servicing_graph()
    print("✅ Workflow created")
    
    # Test scenarios
    test_scenarios = [
        {
            "customer_id": "CUST001",
            "loan_number": "LOAN12345",
            "inquiry_message": "I want to know when my next payment is due and check my balance."
        },
        {
            "customer_id": "CUST002", 
            "loan_number": "LOAN67890",
            "inquiry_message": "I need to submit income documents for a loan modification request."
        },
        {
            "customer_id": "CUST003",
            "loan_number": "LOAN11111", 
            "inquiry_message": "I'm having trouble making payments and worried about foreclosure."
        },
        {
            "customer_id": "CUST004",
            "loan_number": "LOAN22222",
            "inquiry_message": "I'm interested in refinancing my mortgage due to lower interest rates."
        }
    ]
    
    print("\n🚀 Running test scenarios...\n")
    
    for i, scenario in enumerate(test_scenarios, 1):
        print(f"--- Scenario {i} ---")
        print(f"Customer: {scenario['customer_id']}")
        print(f"Loan: {scenario['loan_number']}")
        print(f"Inquiry: {scenario['inquiry_message']}")
        print()
        
        # Create initial state
        initial_state = ServicingState(
            customer_id=scenario["customer_id"],
            loan_number=scenario["loan_number"],
            inquiry_message=scenario["inquiry_message"]
        )
        
        try:
            # Run the workflow
            result = app.invoke(initial_state)
            
            print(f"🤖 Orchestrator: {result.get('orchestrator_response', 'No response')}")
            print(f"📝 Final Response: {result.get('final_response', 'No response')}")
            print(f"✅ Status: {result.get('status', 'Unknown')}")
            
        except Exception as e:
            print(f"❌ Error: {e}")
        
        print("\n" + "="*50 + "\n")

if __name__ == "__main__":
    main()