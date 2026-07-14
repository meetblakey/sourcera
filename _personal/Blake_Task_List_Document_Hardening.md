
**Document consistency**

1. Finish Phase 5 of current Integration Document, as it was started to be integrated into **Sourcera_Master_Spec.md**.

**Update lagging Documents**

1. Update **Master_Summary.md** with **Sourcera_Seller_Pricing_Strategy.md** and ensure consistent integration with new concepts throughout the complete document where required. The document should be of exceptional quality. Once information has been integrated properley, reorganise if required, to logically present the document for end consumption. 

**Redo Integration into the Master Spec including new decisions to be made**

2. ==Redo the Integration_Prompts to associate for all missed **Seller_Pricing_Strategy.md** inclusions and integration needs. 
	1. *Use the existing chat in Claude Cowork to reconfigure this.*
	
3. Start again and finish the integration document associated with the integration of new features. Overwrite and edit existing *integration* files (**PHASE1_VERIFY.md**, **PHASE2_VERIFY.md**, **PHASE3_VERIFY.md**, **PHASE4_VERIFY.md**, **PHASE5_VERIFY.md**), **RECONCILIATION.md** and **DELTA_INVENTORY.md** as required. They haven't been integrated anywhere yet, so there is no cascading effects.

4. Update the Decisions.md document with engineering level design and final decisions.

5. Create a optimised prompt list (Instructions + best in class Optimised Claude prompt list) in **Decision_Integration_Prompt_Guide.md,** to be 100% accurate in integration with no hallucination or drift using the Decisions.md file as the source of decisions. Ensure first, Claude reads from the files **DELTA_INVENTORY.md** and **RECONCILIATION.md** for full context, then reads **Decisions.md** in full. Do not grep, read in full. Provide the prompt list including project instructions.
6. ==Execute the prompts from **Decision_Integration_Prompt_Guide.md,** to add in the **Decisions.md** decisions into **Sourcera_Master_Spec.md**.==

**Master Spec Audit for inconsistencies**

7. You are the senior technical product strategist, staff engineer, and software planning partner for Sourcera — the operating system for enterprise software procurement. You collaborate on product strategy, specification authoring, technical architecture, go-to-market, pricing, and operational planning. You are running on **Claude Opus 4.6 (1M context)**. Every output is expected to reflect Opus-grade depth: deep source reading, edge-case coverage, cross-document synthesis, adversarial self-review. Brevity is never the goal. Precision, completeness, buildability, and defensibility are. Behave like an experienced staff engineer who has shipped enterprise SaaS: calm, decisive, opinionated where it matters, humble where the data is thin, and relentlessly specific about what is true, what is assumed, and what is unknown. 100% accurate in ensuring adherence to instruction, with no hallucination or drift. Do not grep, read in full. Create a optimised instructions and prompt list (best in class, optimised Claude prompt list) for first auditing  **Sourcera_Master_Spec.md** for engineering inconsistencies, non-scoped features, breaking changes, inefficient workflows, etc and then providing solutions to each, creating a fully scoped, engineering production quality handoff document, with every feature fully scoped. Instead of integrating the changes, add all audit results and relevant changes, specified exactly, in a new .md filed named **AUDIT_Sourcera_Master_Spec.md** Provide the prompt list as a .md file named **Master_Audit_Prompt_List.md**.

8. ==Execute the prompts as per **Master_Audit_Prompt_List.md**.==

9. Integrate the complete audit into **Sourcera_Master_Spec.md** using **AUDIT_Sourcera_Master_Spec.md**, ensuring all features are completely consistent, engineering quality spec.

10. Update **Sourcera_Master_Summary.md** as required based upon the finalised **Sourcera_Master_Spec.md**.

**Re-streamline as required**

11. Create a **Proposed_Changes.md** document that attempts to 'simplify' and streamline for user experience, adherence to the Soucera method as per **Sourcera_Master_Summary.md** whilst maintaining the various needs of a robust RFP tool. Reduce unnessary friction, unnecessary user input or over-complicated methods for completing processes.  

**Update the UX**

12. Update the UX_Design_of_Sourcera.md with the complete feature set of Sourcera_Master_Summary.md. 

**Build**

13. Implement the best of Skills, Routing, Claude.md, Agent packs to ensure a complete context packet across relevant parts of the codebase for full production build. How to best do this unknown right now. 