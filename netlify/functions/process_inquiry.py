#!/usr/bin/env python3

import json
import os
from typing import Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

def handler(event, context):
    """Netlify function to process mortgage servicing inquiries"""
    
    # Handle CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        }
    
    # Return test response if no body (for debugging)
    if not event.get('body'):
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': 'ATLAS function is working',
                'method': event.get('httpMethod', 'unknown'),
                'environment': 'netlify'
            })
        }
    
    try:
        # Parse request body
        body = json.loads(event['body'])
        customer_id = body.get('customer_id')
        loan_number = body.get('loan_number') 
        inquiry_message = body.get('inquiry_message')
        
        if not all([customer_id, loan_number, inquiry_message]):
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        # Get API key from environment
        google_api_key = os.environ.get('GOOGLE_API_KEY')
        if not google_api_key:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'API key not configured'})
            }
        
        # Initialize LLM
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-pro",
            temperature=0.1,
            google_api_key=google_api_key
        )
        
        # Step 1: Orchestrator - Route to appropriate agent
        orchestrator_prompt = f"""
        You are a mortgage servicing supervisor. Analyze this customer inquiry and decide which agent should handle it:

        Customer ID: {customer_id}
        Loan Number: {loan_number}
        Inquiry: {inquiry_message}

        Available agents:
        - customer_service: Payment questions, account status, general inquiries
        - document_processor: Document uploads, loan modifications
        - risk_compliance: Delinquency, fraud, compliance issues
        - portfolio_manager: Refinancing, rate changes, investment questions

        Respond with ONLY the agent name: customer_service, document_processor, risk_compliance, or portfolio_manager
        """
        
        orchestrator_response = llm.invoke([HumanMessage(content=orchestrator_prompt)])
        agent_name = orchestrator_response.content.strip().lower()
        
        # Validate agent name
        valid_agents = ["customer_service", "document_processor", "risk_compliance", "portfolio_manager"]
        if agent_name not in valid_agents:
            agent_name = "customer_service"
        
        # Step 2: Process with the selected agent
        agent_response = process_with_agent(llm, agent_name, customer_id, loan_number, inquiry_message)
        
        # Return response
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'customer_id': customer_id,
                'loan_number': loan_number,
                'routed_to': agent_name,
                'response': agent_response,
                'status': 'completed'
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': str(e),
                'type': type(e).__name__,
                'function': 'process_inquiry',
                'debug': True
            })
        }

def process_with_agent(llm, agent_name: str, customer_id: str, loan_number: str, inquiry_message: str) -> str:
    """Process inquiry with the specified agent"""
    
    if agent_name == "customer_service":
        prompt = f"""
        You are a helpful mortgage customer service representative. Help the customer with their inquiry:

        Customer ID: {customer_id}
        Loan Number: {loan_number}
        Customer Question: {inquiry_message}

        Provide a helpful response addressing their concern. Be professional and empathetic.
        For payment questions, explain next steps they can take.
        For account status, let them know how they can get current information.
        """
    
    elif agent_name == "document_processor":
        prompt = f"""
        You are a mortgage document processing specialist. Help the customer with their document-related request:

        Customer ID: {customer_id}
        Loan Number: {loan_number}
        Request: {inquiry_message}

        Provide guidance on:
        - What documents they need to submit
        - How to submit documents
        - Processing timelines
        - Next steps in the process

        Be clear and specific about requirements.
        """
    
    elif agent_name == "risk_compliance":
        prompt = f"""
        You are a mortgage risk and compliance specialist. Address the customer's concern:

        Customer ID: {customer_id}
        Loan Number: {loan_number}
        Issue: {inquiry_message}

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
    
    elif agent_name == "portfolio_manager":
        prompt = f"""
        You are a mortgage portfolio management specialist. Help with the customer's inquiry:

        Customer ID: {customer_id}
        Loan Number: {loan_number}
        Inquiry: {inquiry_message}

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
    
    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content