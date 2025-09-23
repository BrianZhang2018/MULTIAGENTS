import { createServicingGraph } from "./workflow.js";
import { ServicingState } from "./models.js";

/**
 * Netlify function to process mortgage servicing inquiries using LangGraph.js
 */
export async function handler(event, context) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '3600'
      }
    };
  }

  // Return test response if no body (for debugging)
  if (!event.body) {
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        message: 'ATLAS LangGraph.js function is working',
        method: event.httpMethod || 'unknown',
        environment: 'netlify',
        langgraph: 'enabled'
      })
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { customer_id, loan_number, inquiry_message } = body;

    // Validate required fields
    if (!customer_id || !loan_number || !inquiry_message) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: 'Missing required fields: customer_id, loan_number, inquiry_message' 
        })
      };
    }

    // Check for API key
    if (!process.env.GOOGLE_API_KEY) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: 'API key not configured' 
        })
      };
    }

    // Create initial state
    const initialState = {
      customer_id,
      loan_number,
      inquiry_message,
      current_agent: "orchestrator",
      status: "pending",
      created_at: new Date()
    };

    // Create and execute the LangGraph workflow
    const graph = createServicingGraph();
    
    // Execute the workflow
    const result = await graph.invoke(initialState);

    // Return successful response
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        customer_id,
        loan_number,
        routed_to: result.current_agent,
        response: result.final_response,
        status: result.status,
        workflow_engine: 'langgraph.js',
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Error in process_inquiry function:', error);
    
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        error: error.message || 'Internal server error',
        type: error.name || 'UnknownError',
        function: 'process_inquiry',
        workflow_engine: 'langgraph.js',
        debug: process.env.NODE_ENV === 'development',
        timestamp: new Date().toISOString()
      })
    };
  }
}