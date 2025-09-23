/**
 * ServicingState - Shared state for the mortgage servicing workflow
 * JavaScript equivalent of the Python ServicingState class
 */
export class ServicingState {
  constructor({
    customer_id,
    loan_number,
    inquiry_message,
    current_agent = "orchestrator",
    orchestrator_response = null,
    customer_service_response = null,
    document_processor_response = null,
    risk_compliance_response = null,
    portfolio_manager_response = null,
    final_response = null,
    status = "pending",
    created_at = new Date()
  } = {}) {
    this.customer_id = customer_id;
    this.loan_number = loan_number;
    this.inquiry_message = inquiry_message;
    this.current_agent = current_agent;
    
    // Agent responses
    this.orchestrator_response = orchestrator_response;
    this.customer_service_response = customer_service_response;
    this.document_processor_response = document_processor_response;
    this.risk_compliance_response = risk_compliance_response;
    this.portfolio_manager_response = portfolio_manager_response;
    
    // Final result
    this.final_response = final_response;
    this.status = status; // pending, processing, completed
    this.created_at = created_at;
  }

  /**
   * Convert to plain object for LangGraph state management
   */
  toStateObject() {
    return {
      customer_id: this.customer_id,
      loan_number: this.loan_number,
      inquiry_message: this.inquiry_message,
      current_agent: this.current_agent,
      orchestrator_response: this.orchestrator_response,
      customer_service_response: this.customer_service_response,
      document_processor_response: this.document_processor_response,
      risk_compliance_response: this.risk_compliance_response,
      portfolio_manager_response: this.portfolio_manager_response,
      final_response: this.final_response,
      status: this.status,
      created_at: this.created_at
    };
  }

  /**
   * Create from plain object
   */
  static fromStateObject(obj) {
    return new ServicingState(obj);
  }
}

/**
 * State schema definition for LangGraph
 */
export const ServicingStateSchema = {
  customer_id: { value: (x, y) => y ?? x ?? null },
  loan_number: { value: (x, y) => y ?? x ?? null },
  inquiry_message: { value: (x, y) => y ?? x ?? null },
  current_agent: { value: (x, y) => y ?? x ?? "orchestrator" },
  orchestrator_response: { value: (x, y) => y ?? x ?? null },
  customer_service_response: { value: (x, y) => y ?? x ?? null },
  document_processor_response: { value: (x, y) => y ?? x ?? null },
  risk_compliance_response: { value: (x, y) => y ?? x ?? null },
  portfolio_manager_response: { value: (x, y) => y ?? x ?? null },
  final_response: { value: (x, y) => y ?? x ?? null },
  status: { value: (x, y) => y ?? x ?? "pending" },
  created_at: { value: (x, y) => y ?? x ?? new Date() }
};