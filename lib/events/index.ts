/**
 * Event system exports for n8n webhook integration
 */

// Types
export type {
  SollarEventType,
  SollarEventPayload,
  DispatchOptions,
  DispatchResult,
  WebhookEventRecord,
  // Diagnostic payloads
  DiagnosticCreatedPayload,
  DiagnosticActivatedPayload,
  DiagnosticResponseReceivedPayload,
  DiagnosticCompletedPayload,
  DiagnosticReminderPayload,
  // Risk payloads
  RiskThresholdExceededPayload,
  RiskReportGeneratedPayload,
  // User payloads
  UserInvitedPayload,
  UserJoinedPayload,
  // Billing payloads
  SubscriptionCreatedPayload,
  SubscriptionChangedPayload,
  SubscriptionCanceledPayload,
  PaymentSucceededPayload,
  PaymentFailedPayload,
} from "./types";

// Dispatcher functions
export {
  dispatchEvent,
  retryFailedEvents,
  markEventDelivered,
  getEventStats,
  verifySignature,
} from "./dispatcher";
