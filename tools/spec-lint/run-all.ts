/**
 * Sourcera Spec-Lint — batch runner for the M02.3 runtime-active gate set.
 *
 * Authority anchor: Sourcera_Master_Spec.md §M.4 (CI gate cluster), §M.5.4
 * (catalog). Runs every harness gate promoted to `runtime_active` in the
 * v7.2.0-REM M02.3 Runtime-Wiring pass, aggregates results, prints a summary,
 * and exits non-zero (fail-closed) if any gate fails or hits a parse_error.
 *
 * Usage:
 *   npx tsx run-all.ts --spec ../../Sourcera_Master_Spec.md \
 *                      --ux ../../UX_Design_of_Sourcera.md [--no-emit]
 */

import { loadDoc } from "./lib/spec_loader.js";
import { parseOverrides } from "./lib/overrides.js";
import { isEntrypoint, runGate } from "./lib/gate.js";
import { emit } from "./lib/emit.js";
import { EXIT_CODE } from "./lib/types.js";
import type { GateContext, SpecDoc, SpecLintGate } from "./lib/types.js";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

import { gate as anchorNoColon } from "./gates/appendix_anchor_slug_no_colon.js";
import { gate as principle9 } from "./gates/principle_9_anchor_canonicality.js";
import { gate as internalNoHttp } from "./gates/appendix_i_internal_event_no_http_status.js";
import { gate as appendixIBillingCodeCompleteness } from "./gates/appendix_i_billing_code_completeness.js";
import { gate as appendixIRetryabilityCompleteness } from "./gates/appendix_i_retryability_completeness.js";
import { gate as cooldownStatusConvention } from "./gates/cooldown_status_convention.js";
import { gate as rbacRoleNameCanonicality } from "./gates/rbac_role_name_canonicality.js";
import { gate as fgaCustomRoleScopeCanonicalConsumer } from "./gates/fga_custom_role_scope_canonical_consumer.js";
import { gate as mfaEnforcementLevelCanonicalConsumer } from "./gates/mfa_enforcement_level_canonical_consumer.js";
import { gate as appendixJApiTokenScopeEndpointConsistency } from "./gates/appendix_j_api_token_scope_endpoint_consistency.js";
import { gate as consoleScopeBothHeaderRequired } from "./gates/console_scope_both_header_required.js";
import { gate as apiRateLimitClassRegistryConsistency } from "./gates/api_rate_limit_class_registry_consistency.js";
import { gate as appendixIBillingErrorCodeCatalogComplete } from "./gates/appendix_i_billing_error_code_catalog_complete.js";
import { gate as appendixIEndpointCrossReferenceCompleteness } from "./gates/appendix_i_endpoint_cross_reference_completeness.js";
import { gate as errorCodeLocalizationKeyCompleteness } from "./gates/error_code_localization_key_completeness.js";
import { gate as appendixMNoOrphan } from "./gates/appendix_m_no_orphan_engine_concept.js";
import { gate as appendixMEngineToSurfaceCompleteness } from "./gates/appendix_m_engine_to_surface_completeness.js";
import { gate as appendixMNoInlineEngineConceptsInUxSpec } from "./gates/appendix_m_no_inline_engine_concepts_in_ux_spec.js";
import { gate as appendixMConformancePostureCompleteness } from "./gates/appendix_m_conformance_posture_completeness.js";
import { gate as accessibilitySuccessCriterionFixtureCoverage } from "./gates/accessibility_success_criterion_fixture_coverage.js";
import { gate as touchTargetPerTierSingleSource } from "./gates/touch_target_per_tier_single_source.js";
import { gate as noHardcodedDirectionalCss } from "./gates/no_hardcoded_directional_css.js";
import { gate as annualWcagAuditRemediationSlaTracker } from "./gates/annual_wcag_audit_remediation_sla_tracker.js";
import { gate as inboxItemEntityContract } from "./gates/inbox_item_entity_contract.js";
import { gate as pulseHealthScoreMathBounds } from "./gates/pulse_health_score_math_bounds.js";
import { gate as sellerBidWorkspacePulseHealthEntityContract } from "./gates/seller_bid_workspace_pulse_health_entity_contract.js";
import { gate as sellerPulseHealthScoreMathBounds } from "./gates/seller_pulse_health_score_math_bounds.js";
import { gate as notificationChannelNoSms } from "./gates/notification_channel_no_sms.js";
import { gate as inboxPulseMobileExportParity } from "./gates/inbox_pulse_mobile_export_parity.js";
import { gate as pulseThresholdEventCatalogConsistency } from "./gates/pulse_threshold_event_catalog_consistency.js";
import { gate as pulseDigestEmailSingleSource } from "./gates/pulse_digest_email_single_source.js";
import { gate as buyerInboxPulseApiContractCompleteness } from "./gates/buyer_inbox_pulse_api_contract_completeness.js";
import { gate as first30SecondsTestPresentOnNewUxSurface } from "./gates/first_30_seconds_test_present_on_new_ux_surface.js";
import { gate as soloNumeric } from "./gates/solo_tier_numeric_single_source.js";
import { gate as retention } from "./gates/retention_singleton_section_40_2_canonical.js";
import { gate as defenseView } from "./gates/defense_view_appendix_i_pairing.js";
import { gate as m5RuntimeCoverage } from "./gates/appendix_m5_runtime_status_coverage.js";
import { gate as m5HeaderParity } from "./gates/appendix_m5_header_count_parity.js";
import { gate as evalStarterPairing } from "./gates/eval_starter_appendix_i_pairing.js";
import { gate as m5CrossRefResolution } from "./gates/appendix_m5_cross_reference_resolution_completeness.js";
import { gate as m5AeRowEnumerationParity } from "./gates/appendix_m5_ae_row_enumeration_parity.js";
import { gate as sectionAnchorNoColon } from "./gates/section_anchor_slug_no_colon.js";
import { gate as aeTargetVersion } from "./gates/ae_ledger_target_version_completeness.js";
import { gate as aeAcceptanceTest } from "./gates/ae_ledger_acceptance_test_completeness.js";
import { gate as kAnonFloorSingleSource } from "./gates/k_anon_floor_single_source.js";
import { gate as entityConsoleScope } from "./gates/entity_console_scope_paragraph_required.js";
import { gate as ghostBidImportSize } from "./gates/ghost_bid_import_size_single_source.js";
import { gate as sellerMayaAuditActionNamespace } from "./gates/seller_maya_audit_action_namespace.js";
import { gate as sellerMayaSurfaceAbstractionEngineUnchanged } from "./gates/seller_maya_surface_abstraction_engine_unchanged.js";
import { gate as soloCapabilityRegistryFieldRegistration } from "./gates/solo_capability_registry_field_registration.js";
import { gate as soloBillingCardPriceSingleSource } from "./gates/solo_billing_card_price_single_source.js";
import { gate as soloMicrocopyTemplateParity } from "./gates/solo_microcopy_template_parity.js";
import { gate as soloEnvelopeValueSingleSource } from "./gates/solo_envelope_value_single_source.js";
import { gate as auditEventSchemaSingleSource } from "./gates/audit_event_schema_single_source_of_truth.js";
import { gate as auditLogScopeSingleSource } from "./gates/audit_log_scope_single_source.js";
import { gate as auditEventHashChainColumnsPresent } from "./gates/audit_event_hash_chain_columns_present.js";
import { gate as dsarSlaSingleSourceOfTruth } from "./gates/dsar_sla_single_source_of_truth.js";
import { gate as outcomeContractRetentionBounded } from "./gates/outcome_contract_retention_bounded.js";
import { gate as dsarAuditActorAndRedactionEnumRegistration } from "./gates/dsar_audit_actor_and_redaction_enum_registration.js";
import { gate as dsarPseudonymFieldNameCanonicality } from "./gates/dsar_pseudonym_field_name_canonicality.js";
import { gate as automatedDecisionReviewSourceResolution } from "./gates/automated_decision_review_source_resolution.js";
import { gate as automatedDecisionReviewSourceMatrixCompleteness } from "./gates/automated_decision_review_source_matrix_completeness.js";
import { gate as appendixCDsarEventCompleteness } from "./gates/appendix_c_dsar_event_completeness.js";
import { gate as dsarApiErrorCatalogCompleteness } from "./gates/dsar_api_error_catalog_completeness.js";
import { gate as dsarCascadePatternDefaultRowRetired } from "./gates/dsar_cascade_pattern_default_row_retired.js";
import { gate as dsarCascadeClassCoverageCompleteness } from "./gates/dsar_cascade_class_coverage_completeness.js";
import { gate as dsarCascadePerRowIdempotencyMarkerCompleteness } from "./gates/dsar_cascade_per_row_idempotency_marker_completeness.js";
import { gate as entityRetentionCoverageOnDiff } from "./gates/entity_retention_coverage_on_diff.js";
import { gate as appendixCWebhookCatalogCompleteness } from "./gates/appendix_c_webhook_catalog_completeness.js";
import { gate as appendixCToAppendixGCoverage } from "./gates/appendix_c_to_appendix_g_coverage.js";
import { gate as appendixCToAppendixFRetryClassCoverage } from "./gates/appendix_c_to_appendix_f_retry_class_coverage.js";
import { gate as webhookDefaultRetryClass } from "./gates/webhook_default_retry_class.js";
import { gate as appendixJEnumCompleteness } from "./gates/appendix_j_enum_completeness.js";
import { gate as appendixJDeprecationMarkerCoverage } from "./gates/appendix_j_deprecation_marker_coverage.js";
import { gate as privacyAbusePhase45ContractCompleteness } from "./gates/privacy_abuse_phase45_contract_completeness.js";
import { gate as simRetiredSummaryCurrentAuthorityAbsent } from "./gates/sim_retired_summary_current_authority_absent.js";
import { gate as retiredSummaryCurrentAuthorityAbsent } from "./gates/retired_summary_current_authority_absent.js";
import { gate as tcoResidualContractCompleteness } from "./gates/tco_residual_contract_completeness.js";
import { gate as sellerTeamsResidualContractCompleteness } from "./gates/seller_teams_residual_contract_completeness.js";
import { gate as kbMcpPhase52ResidualContractCompleteness } from "./gates/kb_mcp_phase52_residual_contract_completeness.js";
import { gate as kbPhase53ResidualContractCompleteness } from "./gates/kb_phase53_residual_contract_completeness.js";
import { gate as bidWorkspacePhase23ResidualContractCompleteness } from "./gates/bid_workspace_phase23_residual_contract_completeness.js";
import { gate as sellerConsolePhase24ResidualContractCompleteness } from "./gates/seller_console_phase24_residual_contract_completeness.js";
import { gate as apiPhase81ResidualContractCompleteness } from "./gates/api_phase81_residual_contract_completeness.js";
import { gate as numericalSingletonWebhookEndpointCount } from "./gates/numerical_singleton_webhook_endpoint_count.js";
import { gate as webhookPayloadNoSelectionReportNarrative } from "./gates/webhook_payload_no_selection_report_narrative.js";
import { gate as webhookPhase82ResidualContractCompleteness } from "./gates/webhook_phase82_residual_contract_completeness.js";
import { gate as policyIngestionEnumCanonicalConsumer } from "./gates/policy_ingestion_enum_canonical_consumer.js";
import { gate as appendixLPolicyIngestionStateMachineCanonicality } from "./gates/appendix_l_policy_ingestion_state_machine_canonicality.js";
import { gate as policyIngestionWebhookCatalogCompleteness } from "./gates/policy_ingestion_webhook_catalog_completeness.js";
import { gate as policyIngestionEntityContractCompleteness } from "./gates/policy_ingestion_entity_contract_completeness.js";
import { gate as policyIngestionEndpointContractCompleteness } from "./gates/policy_ingestion_endpoint_contract_completeness.js";
import { gate as policyIngestionLimitSingleSource } from "./gates/policy_ingestion_limit_single_source.js";
import { gate as policyIngestionResidencyDsarContract } from "./gates/policy_ingestion_residency_dsar_contract.js";
import { gate as pipelineSurfaceCompressionEngineUnchanged } from "./gates/pipeline_surface_compression_engine_unchanged.js";
import { gate as pipelineSurfaceCompressionStepToPhaseCanonical } from "./gates/pipeline_surface_compression_step_to_phase_canonical.js";
import { gate as pipelineSurfaceCompressionNoSeparateSellerPhaseCounter } from "./gates/pipeline_surface_compression_no_separate_seller_phase_counter.js";
import { gate as kbExportConsoleFirewallStatusConsistency } from "./gates/kb_export_console_firewall_status_consistency.js";
import { gate as kbExportIntegrityHttpCodeSingleSource } from "./gates/kb_export_integrity_http_code_single_source.js";
import { gate as citeVerifyReasonEnumCanonicalConsistency } from "./gates/cite_verify_reason_enum_canonical_consistency.js";
import { gate as mcpKbRetrieveQuerySingletonConsistency } from "./gates/mcp_kb_retrieve_query_singleton_consistency.js";
import { gate as mcpKbRetrieveNamespacePreferenceSingletonConsistency } from "./gates/mcp_kb_retrieve_namespace_preference_singleton_consistency.js";
import { gate as idempotencyKeyCanonicalErrorCode } from "./gates/idempotency_key_canonical_error_code.js";
import { gate as billingPostIdempotencyKeyRequired } from "./gates/billing_post_idempotency_key_required.js";
import { gate as aioperationSettlementStateCanonicalConsumer } from "./gates/aioperation_settlement_state_canonical_consumer.js";
import { gate as paginationEnvelopeCanonical } from "./gates/pagination_envelope_canonical.js";
import { gate as paginationParamCanonical } from "./gates/pagination_param_canonical.js";
import { gate as phaseAdvancementEndpointPathCanonical } from "./gates/phase_advancement_endpoint_path_canonical.js";
import { gate as phase1StakeholderAcceptanceNotGate } from "./gates/phase_1_stakeholder_acceptance_not_gate.js";
import { gate as phase6BiddingCloseMinimumSevenDays } from "./gates/phase_6_bidding_close_minimum_seven_days.js";
import { gate as materialAmendmentThreeDayNotice } from "./gates/material_amendment_three_day_notice.js";
import { gate as phaseAdvancementEndpointContractComplete } from "./gates/phase_advancement_endpoint_contract_complete.js";
import { gate as phaseAdvancementIdempotencyKeyRequired } from "./gates/phase_advancement_idempotency_key_required.js";
import { gate as phaseAdvancementThirdPartyOutageCompleteness } from "./gates/phase_advancement_third_party_outage_completeness.js";
import { gate as errorEnvelopeCanonical } from "./gates/error_envelope_canonical.js";
import { gate as phaseWorkflowErrorCodeCatalogComplete } from "./gates/phase_workflow_error_code_catalog_complete.js";
import { gate as coldPipelineNoVendorResponseAbortPath } from "./gates/cold_pipeline_no_vendor_response_abort_path.js";
import { gate as planChangePipelinePhaseGrandfatherCompleteness } from "./gates/plan_change_pipeline_phase_grandfather_completeness.js";
import { gate as section10PlanGatingSourceCitationCompleteness } from "./gates/section10_plan_gating_source_citation_completeness.js";
import { gate as approvalWorkflowStateMachineCanonicality } from "./gates/approval_workflow_state_machine_canonicality.js";
import { gate as selectionPhaseEntityAuthoringCompleteness } from "./gates/selection_phase_entity_authoring_completeness.js";
import { gate as workspaceStatusCanonicalConsumer } from "./gates/workspace_status_canonical_consumer.js";
import { gate as workspaceStatusStateMachineCanonicality } from "./gates/workspace_status_state_machine_canonicality.js";
import { gate as pipelinePhaseCanonical13ValueConsumer } from "./gates/pipeline_phase_canonical_13_value_consumer.js";
import { gate as pipelinePhaseStateMachineCanonicality } from "./gates/pipeline_phase_state_machine_canonicality.js";
import { gate as consoleBridgeNoDsarEventKinds } from "./gates/console_bridge_no_dsar_event_kinds.js";
import { gate as consoleBridgeNoGroupEventKinds } from "./gates/console_bridge_no_group_event_kinds.js";
import { gate as consoleBridgeNoDsarV9EventKinds } from "./gates/console_bridge_no_dsar_v9_event_kinds.js";
import { gate as consoleBridgeRedactionKindCompleteness } from "./gates/console_bridge_redaction_kind_completeness.js";
import { gate as bridgeEventBodyPiiSweepCompleteness } from "./gates/bridge_event_body_pii_sweep_completeness.js";
import { gate as userOrganizationAttributeDisambiguation } from "./gates/user_organization_attribute_disambiguation.js";
import { gate as sellerActivationCohortCanonicalEnum } from "./gates/seller_activation_cohort_canonical_enum.js";
import { gate as heroMomentTerminalStateSingleSource } from "./gates/hero_moment_terminal_state_single_source.js";
import { gate as retentionCohortCanonicalConsumer } from "./gates/retention_cohort_canonical_consumer.js";
import { gate as auditLogSurfacingCrossReferenceConsistency } from "./gates/audit_log_surfacing_cross_reference_consistency.js";
import { gate as settlementFreezeCarveoutsCanonical } from "./gates/settlement_freeze_carveouts_canonical.js";
import { gate as costBasePublishGateThresholdSingleSource } from "./gates/cost_base_publish_gate_threshold_single_source.js";
import { gate as costBaseDriftThresholdCanonicality } from "./gates/cost_base_drift_threshold_canonicality.js";
import { gate as costBaseRecalcCronCanonicality } from "./gates/cost_base_recalc_cron_canonicality.js";
import { gate as costBaseRecalcSampleWindowCanonicality } from "./gates/cost_base_recalc_sample_window_canonicality.js";
import { gate as walletStateEnumCanonicality } from "./gates/wallet_state_enum_canonicality.js";
import { gate as phase1BillingFieldCentsUniformity } from "./gates/phase1_billing_field_cents_uniformity.js";
import { gate as phase1BillingLegacyUsdFieldAbsence } from "./gates/phase1_billing_legacy_usd_field_absence.js";
import { gate as usageEventDailyAggregateEntityContract } from "./gates/usage_event_daily_aggregate_entity_contract.js";
import { gate as phase1RequiredIndexCompleteness } from "./gates/phase1_required_index_completeness.js";
import { gate as walletAutotopupOverrideApiSurfaceGuard } from "./gates/wallet_autotopup_override_api_surface_guard.js";
import { gate as usageEnvelopeViolationKindAppendixIPairing } from "./gates/usage_envelope_violation_kind_appendix_i_pairing.js";
import { gate as conversionFunnelRegistryCanonicalConsumer } from "./gates/conversion_funnel_registry_canonical_consumer.js";
import { gate as m16FunnelCanonicalConsumer } from "./gates/m16_funnel_canonical_consumer.js";
import { gate as m14VelocityCapPlanTierAntiAbuseDistinction } from "./gates/m14_velocity_cap_plan_tier_anti_abuse_distinction.js";
import { gate as m14InlinePlanTierNumericalSingletonPurged } from "./gates/m14_inline_plan_tier_numerical_singleton_purged.js";
import { gate as networkEffectsInventoryCompleteness } from "./gates/network_effects_inventory_completeness.js";
import { gate as appendixJRateLimitClassPathResolves } from "./gates/appendix_j_rate_limit_class_path_resolves.js";
import { gate as settingsAuditLogRetentionNoInlineRestatement } from "./gates/settings_audit_log_retention_no_inline_restatement.js";
import { gate as roleGlossaryCoverage } from "./gates/role_glossary_coverage.js";
import { gate as apiPathPrefixCanonical } from "./gates/api_path_prefix_canonical.js";
import { gate as deploymentRegionRegistryFourValueComplete } from "./gates/deployment_region_registry_four_value_complete.js";
import { gate as orgResidencyChangeStateMachineComplete } from "./gates/org_residency_change_state_machine_complete.js";
import { gate as orgResidencyChangeApiContractComplete } from "./gates/org_residency_change_api_contract_complete.js";
import { gate as section404ResidencyContractResolves } from "./gates/section_40_4_residency_contract_resolves.js";
import { gate as section474ResidencyCurrentApacCustom } from "./gates/section_47_4_residency_current_apac_custom.js";
import { gate as legalEntityEnumCanonicalConsistency } from "./gates/legal_entity_enum_canonical_consistency.js";
import { gate as enumBoundNoInlineSentinelAdmission } from "./gates/enum_bound_no_inline_sentinel_admission.js";
import { gate as heatMapCellFieldAllowlistDriftDetect } from "./gates/heat_map_cell_field_allowlist_drift_detect.js";
import { gate as systemAgentIdEnumNoAliasCollision } from "./gates/system_agent_id_enum_no_alias_collision.js";
import { gate as marketplaceListingCategoryTaxonomyFk } from "./gates/marketplace_listing_category_taxonomy_fk.js";
import { gate as marketplaceEntityLifecycleEnumCompleteness } from "./gates/marketplace_entity_lifecycle_enum_completeness.js";
import { gate as marketplaceEntityMoneyIntegerCents } from "./gates/marketplace_entity_money_integer_cents.js";
import { gate as marketplaceEntityConventionBarCompleteness } from "./gates/marketplace_entity_convention_bar_completeness.js";
import { gate as ndaRecordDsarSignatoryPseudonymization } from "./gates/nda_record_dsar_signatory_pseudonymization.js";
import { gate as emailSpfDkimDmarcCitationsResolve } from "./gates/email_spf_dkim_dmarc_citations_resolve.js";
import { gate as emailTypeCatalogCoverage } from "./gates/email_type_catalog_coverage.js";
import { gate as emailDomainEntityContractCompleteness } from "./gates/email_domain_entity_contract_completeness.js";
import { gate as emailRetentionDsarBinding } from "./gates/email_retention_dsar_binding.js";
import { gate as emailVolumeSingleSource } from "./gates/email_volume_single_source.js";
import { gate as loopsProviderIntegrationContractCompleteness } from "./gates/loops_provider_integration_contract_completeness.js";
import { gate as emailGlossaryAndOutageContract } from "./gates/email_glossary_and_outage_contract.js";
import { gate as identityAuthenticationAcceptanceAndGlossaryCompleteness } from "./gates/identity_authentication_acceptance_and_glossary_completeness.js";
import { gate as featureAccessMatrixCanonicalBinding } from "./gates/feature_access_matrix_canonical_binding.js";
import { gate as sellerEntityPlanGateAndAnchorHygiene } from "./gates/seller_entity_plan_gate_and_anchor_hygiene.js";
import { gate as sellerSignalEnumCadenceAuthorityConsistency } from "./gates/seller_signal_enum_cadence_authority_consistency.js";
import { gate as matchScoreMobileProvenanceContract } from "./gates/match_score_mobile_provenance_contract.js";
import { gate as marketplaceGlossaryRoleDisambiguation } from "./gates/marketplace_glossary_role_disambiguation.js";
import { gate as soloUnmetGateLifecycleContract } from "./gates/solo_unmet_gate_lifecycle_contract.js";
import { gate as soloOwnerModeStateMachineContract } from "./gates/solo_owner_mode_state_machine_contract.js";
import { gate as scoreDisagreementAndCohortEnumContract } from "./gates/score_disagreement_and_cohort_enum_contract.js";
import { gate as scoringResilienceContractCompleteness } from "./gates/scoring_resilience_contract_completeness.js";
import { gate as workspaceCohortAssignmentVacancyContract } from "./gates/workspace_cohort_assignment_vacancy_contract.js";
import { gate as methodTaxonomyGuidanceScopeConsistency } from "./gates/method_taxonomy_guidance_scope_consistency.js";
import { gate as vendorShortlistingEngagementEvidenceConsistency } from "./gates/vendor_shortlisting_engagement_evidence_consistency.js";
import { gate as policyIngestionResilienceInputSafetyContract } from "./gates/policy_ingestion_resilience_input_safety_contract.js";
import { gate as policyIngestionAcceptanceCriteriaObservability } from "./gates/policy_ingestion_acceptance_criteria_observability.js";
import { gate as auditEventRetentionAuthorityConsistency } from "./gates/audit_event_retention_authority_consistency.js";
import { gate as dsarDocumentationHygieneConsistency } from "./gates/dsar_documentation_hygiene_consistency.js";
import { gate as dsarTerminologyDpoCanonical } from "./gates/dsar_terminology_dpo_canonical.js";
import { gate as organizationPlanStateIntegrityContract } from "./gates/organization_plan_state_integrity_contract.js";
import { gate as buyerResponseScoreLockLifecycleContract } from "./gates/buyer_response_score_lock_lifecycle_contract.js";
import { gate as orgScopedConsoleExceptionContract } from "./gates/org_scoped_console_exception_contract.js";
import { gate as buyerEntityMutationGovernanceContract } from "./gates/buyer_entity_mutation_governance_contract.js";
import { gate as uiPreferenceResilienceContract } from "./gates/ui_preference_resilience_contract.js";
import { gate as marginFloorBreachEventCanonicality } from "./gates/margin_floor_breach_event_canonicality.js";
import { gate as soloEnvelopeCounterEntityPresent } from "./gates/solo_envelope_counter_entity_present.js";
import { gate as pricingFormulaCapabilityMultiplierConsistency } from "./gates/pricing_formula_capability_multiplier_consistency.js";
import { gate as section34EndpointAuthoredPer32Conventions } from "./gates/section_34_endpoint_authored_per_32_conventions.js";
import { gate as soloModeEngineFieldNotInSellerSerializers } from "./gates/solo_mode_engine_field_not_in_seller_serializers.js";
import { gate as soloModeAppendixMCoverage } from "./gates/solo_mode_appendix_m_coverage.js";
import { gate as pipelineSurfaceCompressionTeamModeUnchangedBuyer } from "./gates/pipeline_surface_compression_team_mode_unchanged_buyer.js";
import { gate as soloRoleGridInclusion } from "./gates/solo_role_grid_inclusion.js";
import { gate as appendixJPlanTierInlineStringRetired } from "./gates/appendix_j_plan_tier_inline_string_retired.js";
import { gate as workspaceCancellationReasonEnumRegistered } from "./gates/workspace_cancellation_reason_enum_registered.js";
import { gate as workspaceCancellationWindowSingleSource } from "./gates/workspace_cancellation_window_single_source.js";
import { gate as workspaceRecoveryEventCatalogCompleteness } from "./gates/workspace_recovery_event_catalog_completeness.js";
import { gate as workspaceCancellationEventDeliveryConformance } from "./gates/workspace_cancellation_event_delivery_conformance.js";
import { gate as webhookEventVersionInEnvelope } from "./gates/webhook_event_version_in_envelope.js";
import { gate as webhookEventClassRequiredInEnvelope } from "./gates/webhook_event_class_required_in_envelope.js";
import { gate as webhook4xxNoRetry } from "./gates/webhook_4xx_no_retry.js";
import { gate as webhookSecretRotationContract } from "./gates/webhook_secret_rotation_contract.js";
import { gate as webhookSecretPlaintextNoLog } from "./gates/webhook_secret_plaintext_no_log.js";
import { gate as webhookDeliveryAttemptInEnvelope } from "./gates/webhook_delivery_attempt_in_envelope.js";
import { gate as webhookEventIdCanonicalFormat } from "./gates/webhook_event_id_canonical_format.js";
import { gate as appendixGEventNameUnderscoreNormalization } from "./gates/appendix_g_event_name_underscore_normalization.js";
import { gate as posthogSamplingRateEnumClosed } from "./gates/posthog_sampling_rate_enum_closed.js";
import { gate as appendixGEventFamilyBindingExhaustive } from "./gates/appendix_g_event_family_binding_exhaustive.js";
import { gate as workspaceTemplateEntityContractCompleteness } from "./gates/workspace_template_entity_contract_completeness.js";
import { gate as workspaceTemplateEntitlementSingleton } from "./gates/workspace_template_entitlement_singleton.js";
import { gate as workspaceTemplateEnumRegistrationConsistency } from "./gates/workspace_template_enum_registration_consistency.js";
import { gate as workspaceTemplateRetentionDsarBinding } from "./gates/workspace_template_retention_dsar_binding.js";
import { gate as workspaceTemplateApiContractCompleteness } from "./gates/workspace_template_api_contract_completeness.js";
import { gate as workspaceTemplateEventCatalogConsistency } from "./gates/workspace_template_event_catalog_consistency.js";
import { gate as workspaceTemplateAuditRegistryConsistency } from "./gates/workspace_template_audit_registry_consistency.js";
import { gate as soloPerEvalRefundOpenThresholdSingleton } from "./gates/solo_per_eval_refund_open_threshold_singleton.js";
import { gate as sellerKbBootstrapEntitlementSingleton } from "./gates/seller_kb_bootstrap_entitlement_singleton.js";
import { gate as entitlementMatrixEnforcementModeEnumBound } from "./gates/entitlement_matrix_enforcement_mode_enum_bound.js";
import { gate as entitlementMatrixFreeAllowanceTyped } from "./gates/entitlement_matrix_free_allowance_typed.js";
import { gate as entitlementMatrixUpgradeSurfaceTyped } from "./gates/entitlement_matrix_upgrade_surface_typed.js";
import { gate as entitlementMatrixKbSuggestionRateCardCardinality } from "./gates/entitlement_matrix_kb_suggestion_rate_card_cardinality.js";
import { gate as entitlementMatrixFeatureAccessMirrorConsistency } from "./gates/entitlement_matrix_feature_access_mirror_consistency.js";
import { gate as presignedUrlEgressConventionSingleSource } from "./gates/presigned_url_egress_convention_single_source.js";
import { gate as enterpriseSecurityPlanGatingRowPointerConsistency } from "./gates/enterprise_security_plan_gating_row_pointer_consistency.js";
import { gate as growthMechanicAarrrKpiCanonicalConsumer } from "./gates/growth_mechanic_aarrr_kpi_canonical_consumer.js";
import { gate as growthMechanicRateLimitCoverage } from "./gates/growth_mechanic_rate_limit_coverage.js";
import { gate as l1CrossRegistryNumericSingleton } from "./gates/l1_cross_registry_numeric_singleton.js";
import { gate as l1KbSeedRejectionContract } from "./gates/l1_kb_seed_rejection_contract.js";
import { gate as l1HeroMomentFirstBidHandoff } from "./gates/l1_hero_moment_first_bid_handoff.js";
import { gate as section3CustomerCopyEngineBoundary } from "./gates/section3_customer_copy_engine_boundary.js";
import { gate as uxPrincipleCurrencyCanonicality } from "./gates/ux_principle_currency_canonicality.js";
import { gate as bulkActionToolbarScopeAndStateCompleteness } from "./gates/bulk_action_toolbar_scope_and_state_completeness.js";
import { gate as pageStateTransitionMatrixCompleteness } from "./gates/page_state_transition_matrix_completeness.js";
import { gate as section3AppendixGEventNameCanonicality } from "./gates/section3_appendix_g_event_name_canonicality.js";
import { gate as offlineConnectivityMobileParityAndTelemetry } from "./gates/offline_connectivity_mobile_parity_and_telemetry.js";
import { gate as section3PlanGateBulkSelectionRollbackConsistency } from "./gates/section3_plan_gate_bulk_selection_rollback_consistency.js";
import { gate as section3PresencePipelineAuthorityConsistency } from "./gates/section3_presence_pipeline_authority_consistency.js";
import { gate as section3EntitlementAndDsarSingletonConsistency } from "./gates/section3_entitlement_and_dsar_singleton_consistency.js";
import { gate as section3SurfaceCatalogDarkModeBinding } from "./gates/section3_surface_catalog_dark_mode_binding.js";
import { gate as section3SurfaceEngineMappingCompleteness } from "./gates/section3_surface_engine_mapping_completeness.js";
import { gate as soloTierHeroMomentSloSingleSource } from "./gates/solo_tier_hero_moment_slo_single_source.js";
import { gate as heroMomentAbandonmentRecoveryCadenceCompleteness } from "./gates/hero_moment_abandonment_recovery_cadence_completeness.js";
import { gate as posthogEventPayloadSingleSourcePerEvent } from "./gates/posthog_event_payload_single_source_per_event.js";
import { gate as rubricVersionScoreImmutability } from "./gates/rubric_version_score_immutability.js";
import { gate as requirementRelationSameWorkspaceGuard } from "./gates/requirement_relation_same_workspace_guard.js";
import { gate as pipelineOverlayCanonicalPhaseMapping } from "./gates/pipeline_overlay_canonical_phase_mapping.js";
import { gate as localizationBundleCriticalStringCoverage } from "./gates/localization_bundle_critical_string_coverage.js";
import { gate as kbCitationInClosedBidAttributedRegistered } from "./gates/kb_citation_in_closed_bid_attributed_registered.js";
import { gate as webhookInlineRetryCurveLint } from "./gates/webhook_inline_retry_curve_lint.js";
import { gate as crmSyncEventCatalogConsistency } from "./gates/crm_sync_event_catalog_consistency.js";
import { gate as webhookPayloadKAnonymityFloor } from "./gates/webhook_payload_k_anonymity_floor.js";
import { gate as coreApiEndpointDetailCompleteness } from "./gates/core_api_endpoint_detail_completeness.js";
import { gate as coreApiErrorCodeRegistrationConsistency } from "./gates/core_api_error_code_registration_consistency.js";
import { gate as internalCommentLegacyAliasNoShadowSchema } from "./gates/internal_comment_legacy_alias_no_shadow_schema.js";
import { gate as evalVerticalEvalStarterCoverage } from "./gates/eval_vertical_eval_starter_coverage.js";
import { gate as evalStarterSeedSchemaCurrency } from "./gates/eval_starter_seed_schema_currency.js";
import { gate as evalStarterSeedUseCaseIndexValidity } from "./gates/eval_starter_seed_use_case_index_validity.js";
import { gate as evalStarterMarketplaceCategoryMappingPresent } from "./gates/eval_starter_marketplace_category_mapping_present.js";
import { gate as scenarioModelingEntityContractResolution } from "./gates/scenario_modeling_entity_contract_resolution.js";
import { gate as scenarioModelingPlanCapSingleSource } from "./gates/scenario_modeling_plan_cap_single_source.js";
import { gate as scenarioModelingEndpointContractCompleteness } from "./gates/scenario_modeling_endpoint_contract_completeness.js";
import { gate as scenarioModelingEventCatalogConsistency } from "./gates/scenario_modeling_event_catalog_consistency.js";
import { gate as scenarioModelingLifecycleStateMachine } from "./gates/scenario_modeling_lifecycle_state_machine.js";
import { gate as scenarioModelingAppendixMSurfaceCoverage } from "./gates/scenario_modeling_appendix_m_surface_coverage.js";
import { gate as qaThreadNumericSingleSource } from "./gates/qa_thread_numeric_single_source.js";
import { gate as appendixMQaSectionCompleteness } from "./gates/appendix_m_qa_section_completeness.js";
import { gate as appendixMQaPhaseAndTierConsistency } from "./gates/appendix_m_qa_phase_and_tier_consistency.js";
import { gate as inboxPulsePlanGatingCoverage } from "./gates/inbox_pulse_plan_gating_coverage.js";
import { gate as pulseDigestDayEnumCanonicality } from "./gates/pulse_digest_day_enum_canonicality.js";
import { gate as pulseDependencyDegradedModeContract } from "./gates/pulse_dependency_degraded_mode_contract.js";
import { gate as responsiveBreakpointEnumRegistryCompleteness } from "./gates/responsive_breakpoint_enum_registry_completeness.js";
import { gate as responsivePosthogEventCatalogCompleteness } from "./gates/responsive_posthog_event_catalog_completeness.js";
import { gate as responsiveMobileErrorCatalogCompleteness } from "./gates/responsive_mobile_error_catalog_completeness.js";
import { gate as responsiveDesignAppendixMSurfaceCoverage } from "./gates/responsive_design_appendix_m_surface_coverage.js";
import { gate as featureParityMatrixCompleteness } from "./gates/feature_parity_matrix_completeness.js";
import { gate as specMatrixLint } from "./gates/spec_matrix_lint.js";
import { gate as responsiveMobileCiGateCatalogCompleteness } from "./gates/responsive_mobile_ci_gate_catalog_completeness.js";
import { gate as responsiveDashboardAnchorResolution } from "./gates/responsive_dashboard_anchor_resolution.js";
import { gate as responsiveMobilePerformanceBudgetSingleSource } from "./gates/responsive_mobile_performance_budget_single_source.js";
import { gate as coreWebVitalsInAppSingleton } from "./gates/core_web_vitals_in_app_singleton.js";
import { gate as agentCostAuthorityNoSection44InlineRestatement } from "./gates/agent_cost_authority_no_section44_inline_restatement.js";
import { gate as soloTierSurfaceTreatmentAppendixMCoverage } from "./gates/solo_tier_surface_treatment_appendix_m_coverage.js";
import { gate as soloAbsorptionCapEventCatalogCompleteness } from "./gates/solo_absorption_cap_event_catalog_completeness.js";
import { gate as mcpToolCatalogDiagramConsistency } from "./gates/mcp_tool_catalog_diagram_consistency.js";
import { gate as mcpRateLimitLaunchPostureCanonicality } from "./gates/mcp_rate_limit_launch_posture_canonicality.js";
import { gate as kbInjectionScannerOperationalCadenceCanonicality } from "./gates/kb_injection_scanner_operational_cadence_canonicality.js";
import { gate as decisionsStatusFieldCompleteness } from "./gates/decisions_status_field_completeness.js";
import { gate as kbReviewCadenceDefaultSingleSource } from "./gates/kb_review_cadence_default_single_source.js";
import { gate as kbLifecycleStateAliasContract } from "./gates/kb_lifecycle_state_alias_contract.js";
import { gate as kbRetrieveFreshnessEnumCompleteness } from "./gates/kb_retrieve_freshness_enum_completeness.js";
import { gate as sellerProfilePublicFieldContractCompleteness } from "./gates/seller_profile_public_field_contract_completeness.js";
import { gate as verificationTierCriteriaSingleSource } from "./gates/verification_tier_criteria_single_source.js";
import { gate as capabilityDeclarationSection26NoShadowSchema } from "./gates/capability_declaration_section_26_no_shadow_schema.js";
import { gate as sellerPageEnrichmentCapabilityIdSingleSource } from "./gates/seller_page_enrichment_capability_id_single_source.js";
import { gate as sellerSoftwareUnclaimedStubRenderMode } from "./gates/seller_software_unclaimed_stub_render_mode.js";
import { gate as optOutHttpResponseSingleSource } from "./gates/opt_out_http_response_single_source.js";
import { gate as marketplaceMatchScoreEntityFieldTableCompleteness } from "./gates/marketplace_match_score_entity_field_table_completeness.js";
import { gate as marketplaceMatchScoreForwardReferenceResolution } from "./gates/marketplace_match_score_forward_reference_resolution.js";
import { gate as marketplaceProactiveOfferEntityContractCompleteness } from "./gates/marketplace_proactive_offer_entity_contract_completeness.js";
import { gate as marketplaceProactiveOfferOfferKindChannelSplit } from "./gates/marketplace_proactive_offer_offer_kind_channel_split.js";
import { gate as sellerOnboardingDropoffRecoveryRegistryComplete } from "./gates/seller_onboarding_dropoff_recovery_registry_complete.js";
import { gate as sellerOnboardingActivationEventsUse51Envelope } from "./gates/seller_onboarding_activation_events_use_51_envelope.js";
import { gate as sellerOnboardingConversionMomentKindCanonical } from "./gates/seller_onboarding_conversion_moment_kind_canonical.js";
import { gate as agentThresholdConfigContractCompleteness } from "./gates/agent_threshold_config_contract_completeness.js";
import { gate as agentPromptInjectionCatalogConsistency } from "./gates/agent_prompt_injection_catalog_consistency.js";
import { gate as customAgentInstructionsContractCompleteness } from "./gates/custom_agent_instructions_contract_completeness.js";
import { gate as agentOutputSurfaceRegistryConsistency } from "./gates/agent_output_surface_registry_consistency.js";
import { gate as downgradeExcessBucketStatusEnumCanonical } from "./gates/downgrade_excess_bucket_status_enum_canonical.js";
import { gate as planUpgradeCarryOverSingleSource } from "./gates/plan_upgrade_carry_over_single_source.js";
import { gate as downgradeApiIntegrationBucketClassesRegistered } from "./gates/downgrade_api_integration_bucket_classes_registered.js";
import { gate as protectedAssetArchiveStateCanonical } from "./gates/protected_asset_archive_state_canonical.js";
import { gate as protectedAssetPurgeGuard } from "./gates/protected_asset_purge_guard.js";
import { gate as integrationExportContractCompleteness } from "./gates/integration_export_contract_completeness.js";
import { gate as integrationExportTerminalEventPairing } from "./gates/integration_export_terminal_event_pairing.js";
import { gate as outcomeContractSignalSubjectEnumBound } from "./gates/outcome_contract_signal_subject_enum_bound.js";
import { gate as opsSessionNumericalCapsSingleSource } from "./gates/ops_session_numerical_caps_single_source.js";
import { gate as appendixGLegacyAliasRetirementEnforced } from "./gates/appendix_g_legacy_alias_retirement_enforced.js";
import { gate as buyerEvaluationFunnelDerivationConsistency } from "./gates/buyer_evaluation_funnel_derivation_consistency.js";
import { gate as soloTrialOnePerOrgLifetime } from "./gates/solo_trial_one_per_org_lifetime.js";
import { gate as soloUpgradeCtaThreshold } from "./gates/solo_upgrade_cta_threshold_3_events_30d_subscription_immediate_per_eval_bid.js";
import { gate as firecrawlOutageProgressLineSubstitution } from "./gates/firecrawl_outage_progress_line_substitution.js";
import { gate as kbBootstrapAllowanceCompensationCompleteness } from "./gates/kb_bootstrap_allowance_compensation_completeness.js";
import { gate as m16SameDomainEnforcementDualPointCanonical } from "./gates/m16_same_domain_enforcement_dual_point_canonical.js";
import { gate as dsarErasedSellerExcludedFromRecoveryCadence } from "./gates/dsar_erased_seller_excluded_from_recovery_cadence.js";
import { gate as networkEffectsDashboardOutageRenderContract } from "./gates/network_effects_dashboard_outage_render_contract.js";
import { gate as emailBounceComplaintSuppressionRuntime } from "./gates/email_bounce_complaint_suppression_runtime.js";
import { gate as auditIntegrityExemptionRedactionPathCorrectness } from "./gates/audit_integrity_exemption_redaction_path_correctness.js";

/**
 * Gates promoted to `runtime_active`: verified to PASS on the latest
 * main-branch Master Spec and to pass/fail their CI fixtures. These are the
 * merge-blocking required checks.
 */
export const GATES_RUNTIME_ACTIVE: SpecLintGate[] = [
  anchorNoColon,
  principle9,
  internalNoHttp,
  appendixIBillingCodeCompleteness,
  appendixIRetryabilityCompleteness,
  cooldownStatusConvention,
  rbacRoleNameCanonicality,
  fgaCustomRoleScopeCanonicalConsumer,
  mfaEnforcementLevelCanonicalConsumer,
  appendixJApiTokenScopeEndpointConsistency,
  consoleScopeBothHeaderRequired,
  apiRateLimitClassRegistryConsistency,
  appendixIBillingErrorCodeCatalogComplete,
  appendixIEndpointCrossReferenceCompleteness,
  errorCodeLocalizationKeyCompleteness,
  appendixMNoOrphan,
  appendixMEngineToSurfaceCompleteness,
  appendixMNoInlineEngineConceptsInUxSpec,
  appendixMConformancePostureCompleteness,
  accessibilitySuccessCriterionFixtureCoverage,
  touchTargetPerTierSingleSource,
  noHardcodedDirectionalCss,
  annualWcagAuditRemediationSlaTracker,
  inboxItemEntityContract,
  pulseHealthScoreMathBounds,
  sellerBidWorkspacePulseHealthEntityContract,
  sellerPulseHealthScoreMathBounds,
  notificationChannelNoSms,
  inboxPulseMobileExportParity,
  pulseThresholdEventCatalogConsistency,
  pulseDigestEmailSingleSource,
  buyerInboxPulseApiContractCompleteness,
  first30SecondsTestPresentOnNewUxSurface,
  defenseView,
  m5RuntimeCoverage,
  m5HeaderParity,
  evalStarterPairing,
  m5CrossRefResolution,
  m5AeRowEnumerationParity,
  soloNumeric,
  retention,
  sectionAnchorNoColon,
  kAnonFloorSingleSource,
  entityConsoleScope,
  ghostBidImportSize,
  sellerMayaAuditActionNamespace,
  sellerMayaSurfaceAbstractionEngineUnchanged,
  soloCapabilityRegistryFieldRegistration,
  soloBillingCardPriceSingleSource,
  soloMicrocopyTemplateParity,
  soloEnvelopeValueSingleSource,
  auditEventSchemaSingleSource,
  auditLogScopeSingleSource,
  auditEventHashChainColumnsPresent,
  dsarSlaSingleSourceOfTruth,
  outcomeContractRetentionBounded,
  dsarAuditActorAndRedactionEnumRegistration,
  dsarPseudonymFieldNameCanonicality,
  automatedDecisionReviewSourceResolution,
  automatedDecisionReviewSourceMatrixCompleteness,
  appendixCDsarEventCompleteness,
  dsarApiErrorCatalogCompleteness,
  dsarCascadePatternDefaultRowRetired,
  dsarCascadeClassCoverageCompleteness,
  dsarCascadePerRowIdempotencyMarkerCompleteness,
  entityRetentionCoverageOnDiff,
  appendixCWebhookCatalogCompleteness,
  appendixCToAppendixGCoverage,
  appendixCToAppendixFRetryClassCoverage,
  webhookDefaultRetryClass,
  appendixJEnumCompleteness,
  appendixJDeprecationMarkerCoverage,
  privacyAbusePhase45ContractCompleteness,
  simRetiredSummaryCurrentAuthorityAbsent,
  retiredSummaryCurrentAuthorityAbsent,
  tcoResidualContractCompleteness,
  sellerTeamsResidualContractCompleteness,
  kbMcpPhase52ResidualContractCompleteness,
  kbPhase53ResidualContractCompleteness,
  bidWorkspacePhase23ResidualContractCompleteness,
  sellerConsolePhase24ResidualContractCompleteness,
  apiPhase81ResidualContractCompleteness,
  numericalSingletonWebhookEndpointCount,
  webhookPayloadNoSelectionReportNarrative,
  webhookPhase82ResidualContractCompleteness,
  policyIngestionEnumCanonicalConsumer,
  appendixLPolicyIngestionStateMachineCanonicality,
  policyIngestionWebhookCatalogCompleteness,
  policyIngestionEntityContractCompleteness,
  policyIngestionEndpointContractCompleteness,
  policyIngestionLimitSingleSource,
  policyIngestionResidencyDsarContract,
  pipelineSurfaceCompressionEngineUnchanged,
  pipelineSurfaceCompressionStepToPhaseCanonical,
  pipelineSurfaceCompressionNoSeparateSellerPhaseCounter,
  kbExportConsoleFirewallStatusConsistency,
  kbExportIntegrityHttpCodeSingleSource,
  citeVerifyReasonEnumCanonicalConsistency,
  mcpKbRetrieveQuerySingletonConsistency,
  mcpKbRetrieveNamespacePreferenceSingletonConsistency,
  idempotencyKeyCanonicalErrorCode,
  billingPostIdempotencyKeyRequired,
  aioperationSettlementStateCanonicalConsumer,
  paginationEnvelopeCanonical,
  paginationParamCanonical,
  phaseAdvancementEndpointPathCanonical,
  phase1StakeholderAcceptanceNotGate,
  phase6BiddingCloseMinimumSevenDays,
  materialAmendmentThreeDayNotice,
  phaseAdvancementEndpointContractComplete,
  phaseAdvancementIdempotencyKeyRequired,
  phaseAdvancementThirdPartyOutageCompleteness,
  errorEnvelopeCanonical,
  phaseWorkflowErrorCodeCatalogComplete,
  coldPipelineNoVendorResponseAbortPath,
  planChangePipelinePhaseGrandfatherCompleteness,
  section10PlanGatingSourceCitationCompleteness,
  approvalWorkflowStateMachineCanonicality,
  selectionPhaseEntityAuthoringCompleteness,
  workspaceStatusCanonicalConsumer,
  workspaceStatusStateMachineCanonicality,
  pipelinePhaseCanonical13ValueConsumer,
  pipelinePhaseStateMachineCanonicality,
  consoleBridgeNoDsarEventKinds,
  consoleBridgeNoGroupEventKinds,
  consoleBridgeNoDsarV9EventKinds,
  consoleBridgeRedactionKindCompleteness,
  bridgeEventBodyPiiSweepCompleteness,
  userOrganizationAttributeDisambiguation,
  sellerActivationCohortCanonicalEnum,
  heroMomentTerminalStateSingleSource,
  retentionCohortCanonicalConsumer,
  auditLogSurfacingCrossReferenceConsistency,
  settlementFreezeCarveoutsCanonical,
  costBasePublishGateThresholdSingleSource,
  costBaseDriftThresholdCanonicality,
  costBaseRecalcCronCanonicality,
  costBaseRecalcSampleWindowCanonicality,
  walletStateEnumCanonicality,
  phase1BillingFieldCentsUniformity,
  phase1BillingLegacyUsdFieldAbsence,
  usageEventDailyAggregateEntityContract,
  phase1RequiredIndexCompleteness,
  walletAutotopupOverrideApiSurfaceGuard,
  usageEnvelopeViolationKindAppendixIPairing,
  conversionFunnelRegistryCanonicalConsumer,
  m16FunnelCanonicalConsumer,
  m14VelocityCapPlanTierAntiAbuseDistinction,
  m14InlinePlanTierNumericalSingletonPurged,
  networkEffectsInventoryCompleteness,
  appendixJRateLimitClassPathResolves,
  settingsAuditLogRetentionNoInlineRestatement,
  roleGlossaryCoverage,
  apiPathPrefixCanonical,
  deploymentRegionRegistryFourValueComplete,
  orgResidencyChangeStateMachineComplete,
  orgResidencyChangeApiContractComplete,
  section404ResidencyContractResolves,
  section474ResidencyCurrentApacCustom,
  legalEntityEnumCanonicalConsistency,
  enumBoundNoInlineSentinelAdmission,
  heatMapCellFieldAllowlistDriftDetect,
  systemAgentIdEnumNoAliasCollision,
  marketplaceListingCategoryTaxonomyFk,
  marketplaceEntityLifecycleEnumCompleteness,
  marketplaceEntityMoneyIntegerCents,
  marketplaceEntityConventionBarCompleteness,
  ndaRecordDsarSignatoryPseudonymization,
  emailSpfDkimDmarcCitationsResolve,
  emailTypeCatalogCoverage,
  emailDomainEntityContractCompleteness,
  emailRetentionDsarBinding,
  emailVolumeSingleSource,
  loopsProviderIntegrationContractCompleteness,
  emailGlossaryAndOutageContract,
  identityAuthenticationAcceptanceAndGlossaryCompleteness,
  featureAccessMatrixCanonicalBinding,
  sellerEntityPlanGateAndAnchorHygiene,
  sellerSignalEnumCadenceAuthorityConsistency,
  matchScoreMobileProvenanceContract,
  marketplaceGlossaryRoleDisambiguation,
  marginFloorBreachEventCanonicality,
  soloEnvelopeCounterEntityPresent,
  pricingFormulaCapabilityMultiplierConsistency,
  section34EndpointAuthoredPer32Conventions,
  soloModeEngineFieldNotInSellerSerializers,
  soloModeAppendixMCoverage,
  pipelineSurfaceCompressionTeamModeUnchangedBuyer,
  soloRoleGridInclusion,
  appendixJPlanTierInlineStringRetired,
  workspaceCancellationReasonEnumRegistered,
  workspaceCancellationWindowSingleSource,
  workspaceRecoveryEventCatalogCompleteness,
  workspaceCancellationEventDeliveryConformance,
  webhookEventVersionInEnvelope,
  webhookEventClassRequiredInEnvelope,
  webhook4xxNoRetry,
  webhookSecretRotationContract,
  webhookSecretPlaintextNoLog,
  webhookDeliveryAttemptInEnvelope,
  webhookEventIdCanonicalFormat,
  appendixGEventNameUnderscoreNormalization,
  posthogSamplingRateEnumClosed,
  appendixGEventFamilyBindingExhaustive,
  workspaceTemplateEntityContractCompleteness,
  workspaceTemplateEntitlementSingleton,
  workspaceTemplateEnumRegistrationConsistency,
  workspaceTemplateRetentionDsarBinding,
  workspaceTemplateApiContractCompleteness,
  workspaceTemplateEventCatalogConsistency,
  workspaceTemplateAuditRegistryConsistency,
  soloPerEvalRefundOpenThresholdSingleton,
  sellerKbBootstrapEntitlementSingleton,
  entitlementMatrixEnforcementModeEnumBound,
  entitlementMatrixFreeAllowanceTyped,
  entitlementMatrixUpgradeSurfaceTyped,
  entitlementMatrixKbSuggestionRateCardCardinality,
  entitlementMatrixFeatureAccessMirrorConsistency,
  presignedUrlEgressConventionSingleSource,
  enterpriseSecurityPlanGatingRowPointerConsistency,
  growthMechanicAarrrKpiCanonicalConsumer,
  growthMechanicRateLimitCoverage,
  l1CrossRegistryNumericSingleton,
  l1KbSeedRejectionContract,
  l1HeroMomentFirstBidHandoff,
  section3CustomerCopyEngineBoundary,
  uxPrincipleCurrencyCanonicality,
  bulkActionToolbarScopeAndStateCompleteness,
  pageStateTransitionMatrixCompleteness,
  section3AppendixGEventNameCanonicality,
  offlineConnectivityMobileParityAndTelemetry,
  section3PlanGateBulkSelectionRollbackConsistency,
  section3PresencePipelineAuthorityConsistency,
  section3EntitlementAndDsarSingletonConsistency,
  section3SurfaceCatalogDarkModeBinding,
  section3SurfaceEngineMappingCompleteness,
  soloTierHeroMomentSloSingleSource,
  heroMomentAbandonmentRecoveryCadenceCompleteness,
  posthogEventPayloadSingleSourcePerEvent,
  rubricVersionScoreImmutability,
  requirementRelationSameWorkspaceGuard,
  pipelineOverlayCanonicalPhaseMapping,
  localizationBundleCriticalStringCoverage,
  kbCitationInClosedBidAttributedRegistered,
  webhookInlineRetryCurveLint,
  crmSyncEventCatalogConsistency,
  webhookPayloadKAnonymityFloor,
  coreApiEndpointDetailCompleteness,
  coreApiErrorCodeRegistrationConsistency,
  internalCommentLegacyAliasNoShadowSchema,
  evalVerticalEvalStarterCoverage,
  evalStarterSeedSchemaCurrency,
  evalStarterSeedUseCaseIndexValidity,
  evalStarterMarketplaceCategoryMappingPresent,
  scenarioModelingEntityContractResolution,
  scenarioModelingPlanCapSingleSource,
  scenarioModelingEndpointContractCompleteness,
  scenarioModelingEventCatalogConsistency,
  scenarioModelingLifecycleStateMachine,
  scenarioModelingAppendixMSurfaceCoverage,
  qaThreadNumericSingleSource,
  appendixMQaSectionCompleteness,
  appendixMQaPhaseAndTierConsistency,
  inboxPulsePlanGatingCoverage,
  pulseDigestDayEnumCanonicality,
  pulseDependencyDegradedModeContract,
  responsiveBreakpointEnumRegistryCompleteness,
  responsivePosthogEventCatalogCompleteness,
  responsiveMobileErrorCatalogCompleteness,
  responsiveDesignAppendixMSurfaceCoverage,
  featureParityMatrixCompleteness,
  specMatrixLint,
  responsiveMobileCiGateCatalogCompleteness,
  responsiveDashboardAnchorResolution,
  responsiveMobilePerformanceBudgetSingleSource,
  coreWebVitalsInAppSingleton,
  agentCostAuthorityNoSection44InlineRestatement,
  soloTierSurfaceTreatmentAppendixMCoverage,
  soloAbsorptionCapEventCatalogCompleteness,
  mcpToolCatalogDiagramConsistency,
  mcpRateLimitLaunchPostureCanonicality,
  kbInjectionScannerOperationalCadenceCanonicality,
  decisionsStatusFieldCompleteness,
  kbReviewCadenceDefaultSingleSource,
  kbLifecycleStateAliasContract,
  kbRetrieveFreshnessEnumCompleteness,
  sellerProfilePublicFieldContractCompleteness,
  verificationTierCriteriaSingleSource,
  capabilityDeclarationSection26NoShadowSchema,
  sellerPageEnrichmentCapabilityIdSingleSource,
  sellerSoftwareUnclaimedStubRenderMode,
  optOutHttpResponseSingleSource,
  marketplaceMatchScoreEntityFieldTableCompleteness,
  marketplaceMatchScoreForwardReferenceResolution,
  marketplaceProactiveOfferEntityContractCompleteness,
  marketplaceProactiveOfferOfferKindChannelSplit,
  sellerOnboardingDropoffRecoveryRegistryComplete,
  sellerOnboardingActivationEventsUse51Envelope,
  sellerOnboardingConversionMomentKindCanonical,
  agentThresholdConfigContractCompleteness,
  agentPromptInjectionCatalogConsistency,
  customAgentInstructionsContractCompleteness,
  agentOutputSurfaceRegistryConsistency,
  downgradeExcessBucketStatusEnumCanonical,
  planUpgradeCarryOverSingleSource,
  downgradeApiIntegrationBucketClassesRegistered,
  protectedAssetArchiveStateCanonical,
  protectedAssetPurgeGuard,
  integrationExportContractCompleteness,
  integrationExportTerminalEventPairing,
  soloUnmetGateLifecycleContract,
  soloOwnerModeStateMachineContract,
  scoreDisagreementAndCohortEnumContract,
  scoringResilienceContractCompleteness,
  workspaceCohortAssignmentVacancyContract,
  methodTaxonomyGuidanceScopeConsistency,
  vendorShortlistingEngagementEvidenceConsistency,
  policyIngestionResilienceInputSafetyContract,
  policyIngestionAcceptanceCriteriaObservability,
  auditEventRetentionAuthorityConsistency,
  dsarDocumentationHygieneConsistency,
  dsarTerminologyDpoCanonical,
  organizationPlanStateIntegrityContract,
  buyerResponseScoreLockLifecycleContract,
  orgScopedConsoleExceptionContract,
  buyerEntityMutationGovernanceContract,
  uiPreferenceResilienceContract,
  aeTargetVersion,
  aeAcceptanceTest,
];

/**
 * Advisory gates whose detector artifacts exist but are not yet promoted.
 */
export const GATES_ADVISORY: SpecLintGate[] = [
  outcomeContractSignalSubjectEnumBound,
  opsSessionNumericalCapsSingleSource,
  appendixGLegacyAliasRetirementEnforced,
  buyerEvaluationFunnelDerivationConsistency,
  soloTrialOnePerOrgLifetime,
  soloUpgradeCtaThreshold,
  firecrawlOutageProgressLineSubstitution,
  kbBootstrapAllowanceCompensationCompleteness,
  m16SameDomainEnforcementDualPointCanonical,
  dsarErasedSellerExcludedFromRecoveryCadence,
  networkEffectsDashboardOutageRenderContract,
  emailBounceComplaintSuppressionRuntime,
  auditIntegrityExemptionRedactionPathCorrectness,
];

/** Full set (used by the dispatcher). */
export const GATES: SpecLintGate[] = [...GATES_RUNTIME_ACTIVE, ...GATES_ADVISORY];

function arg(name: string, def?: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : def;
}

async function main() {
  const specPath = arg("--spec", "../../Sourcera_Master_Spec.md")!;
  const uxPath = arg("--ux", "../../UX_Design_of_Sourcera.md");
  const reconPath = arg("--reconciliation");
  const aeLedgerPath = arg("--ae-ledger", "../../_integration/AUTHORED_EXTENSIONS_LEDGER.md");
  const decisionsPath = arg("--decisions", join(dirname(specPath), "_integration/Decisions.md"));
  const buyerPricingPath = arg("--buyer-pricing", join(dirname(specPath), "Sourcera_Buyer_Pricing_Strategy.md"));
  const sellerPricingPath = arg("--seller-pricing", join(dirname(specPath), "Sourcera_Seller_Pricing_Strategy.md"));
  const prBodyPath = arg("--pr-body");
  const noEmit = process.argv.includes("--no-emit");

  const masterSpec: SpecDoc = loadDoc(specPath);
  const uxSpec = uxPath && existsSync(uxPath) ? loadDoc(uxPath) : undefined;
  const reconciliation =
    reconPath && existsSync(reconPath) ? loadDoc(reconPath) : undefined;
  const prBody = prBodyPath && existsSync(prBodyPath) ? loadDoc(prBodyPath).text : "";

  let blockingWorst = 0;
  const summary: Array<Record<string, string | number>> = [];

  const runOne = async (g: SpecLintGate, blocking: boolean) => {
    const overrides = parseOverrides(prBody, { knownGateIds: new Set([g.id]) });
    const extraDocs = new Map<string, SpecDoc>();
    if (g.inputs.aeLedger && aeLedgerPath && existsSync(aeLedgerPath)) {
      extraDocs.set("aeLedger", loadDoc(aeLedgerPath));
    }
    if (g.inputs.decisions && decisionsPath && existsSync(decisionsPath)) {
      extraDocs.set("decisions", loadDoc(decisionsPath));
    }
    if (g.inputs.buyerPricing && buyerPricingPath && existsSync(buyerPricingPath)) {
      extraDocs.set("buyerPricing", loadDoc(buyerPricingPath));
    }
    if (g.inputs.sellerPricing && sellerPricingPath && existsSync(sellerPricingPath)) {
      extraDocs.set("sellerPricing", loadDoc(sellerPricingPath));
    }

    const ctx: GateContext = {
      masterSpec,
      uxSpec: g.inputs.uxSpec ? uxSpec : undefined,
      reconciliation: g.inputs.reconciliation ? reconciliation : undefined,
      overrides,
      extraDocs,
    };
    const result = runGate(g, ctx);
    if (!noEmit) {
      try {
        await emit(result, {
          prId: process.env.PR_ID,
          commitSha: process.env.COMMIT_SHA,
          mergeBaseSha: process.env.MERGE_BASE_SHA,
        });
      } catch {
        /* audit emit never masks the verdict */
      }
    }
    if (blocking) blockingWorst = Math.max(blockingWorst, EXIT_CODE[result.outcome]);
    const live = result.findings.filter((f) => !f.suppressed_by_override).length;
    summary.push({ mode: blocking ? "blocking" : "advisory", gate: g.id, outcome: result.outcome, findings: live });
    if (result.outcome !== "pass" && result.outcome !== "override_applied") {
      for (const f of result.findings.filter((x) => !x.suppressed_by_override).slice(0, 8)) {
        process.stderr.write(`  [${blocking ? "BLOCK" : "advis"}] [${g.id}] ${f.file}:${f.line} ${f.message}\n`);
      }
    }
  };

  for (const g of GATES_RUNTIME_ACTIVE) await runOne(g, true);
  for (const g of GATES_ADVISORY) await runOne(g, false);

  process.stdout.write("\n=== spec-lint batch summary ===\n");
  for (const s of summary) {
    process.stdout.write(
      `${String(s.mode).padEnd(9)} ${String(s.outcome).padEnd(16)} ${String(s.findings).padStart(4)}  ${s.gate}\n`,
    );
  }
  process.stdout.write(
    `\nblocking gates worst exit code: ${blockingWorst} (advisory findings are non-blocking)\n`,
  );
  process.exitCode = blockingWorst;
}

if (isEntrypoint(import.meta.url)) {
  main().catch((e) => {
    process.stderr.write(`run-all error: ${(e as Error).stack ?? e}\n`);
    process.exitCode = 2;
  });
}
