# Environmental and Regulatory References

## Disclaimer

This document is provided for reference only to help the ML development team understand the regulatory context for SILVAPURE's target market. **This document does not constitute legal or regulatory compliance advice.** Environmental regulations are subject to amendment. Always consult a qualified environmental engineer or regulatory specialist for compliance decisions.

---

## India — Primary Regulatory Framework

### Environment Protection Act, 1986
- Enacted: 23 May 1986
- Authority: Ministry of Environment, Forest and Climate Change (MoEFCC), Government of India

### Environment Protection Rules, 1986 — Schedule VI General Standards

**IMPORTANT QUALIFICATION ON ALL VALUES BELOW:**

The values listed here are based on publicly available summaries of CPCB General Standards for discharge into inland surface water (Schedule VI, Environment Protection Rules). They are provided as a reference starting point only.

**The applicable discharge limits for any specific SILVAPURE deployment depend on:**
1. The specific regulatory notification currently in force (rules are amended periodically)
2. The industry category of the facility (CPCB Schedule I sets industry-specific standards that may differ significantly from Schedule VI general standards)
3. The state in which the facility operates (State Pollution Control Board conditions apply)
4. Site-specific consent conditions in the facility's Consent to Operate (CTO) issued by the relevant SPCB — these may be more stringent than general standards
5. Whether the facility is classified as Red, Orange, or Green category under CPCB norms
6. Whether the discharge goes to inland surface water, a public sewer, land for irrigation, or marine coastal areas — different standards apply to each

**DO NOT use these values for regulatory compliance without verifying the applicable current standard with a qualified environmental engineer and the relevant SPCB/CPCB.**

General Schedule VI reference values for inland surface water discharge (from publicly available CPCB summaries — not directly verified from the current Official Gazette):

| Parameter | Reference Value |
|---|---|
| pH | 6.0–9.0 |
| BOD₅ | ≤ 30 mg/L |
| COD | ≤ 250 mg/L |
| Total Suspended Solids | ≤ 100 mg/L |
| Temperature | ≤ 40°C |

**Manual verification required:** The COD value of ≤ 250 mg/L was not directly confirmed from a live CPCB source during the audit. The BOD ≤ 30 mg/L threshold is corroborated by CPCB river-monitoring FAQs. All values require verification against the current Schedule VI text, available at: https://cpcb.nic.in/effluent-emission/

### Central Pollution Control Board (CPCB)
- Website: https://cpcb.nic.in/
- CPCB publishes guidelines, consent conditions, and monitoring protocols for industrial and municipal wastewater discharge
- CPCB's Online Continuous Effluent Monitoring System (OCEMS) requirements are relevant to real-time effluent monitoring

### State Pollution Control Boards (SPCBs)
- Each Indian state has an SPCB with the authority to issue consent to establish (CTE) and consent to operate (CTO) for wastewater treatment facilities
- Site-specific discharge limits in the CTO may be more stringent than general standards
- SPCB consent conditions override general standards — always check the site-specific CTO

---

## India — OCEMS (Online Continuous Effluent Monitoring System)

CPCB has mandated real-time online monitoring for certain categories of heavily polluting industries (Red and Orange category industries). The OCEMS specification is directly relevant to SILVAPURE's sensor integration requirements.

- CPCB OCEMS Guidelines: https://cpcb.nic.in/ocems.php
- Relevant parameters for online monitoring typically include: pH, BOD/COD (via TOC proxy), TSS (via turbidity), flow rate, temperature
- Data must be transmitted to CPCB's Central Server in real time

**SILVAPURE relevance:** SILVAPURE's telemetry architecture should be designed to support OCEMS data submission requirements for applicable customers.

---

## India — BIS Standards Relevant to Wastewater

| Standard | Title | Relevance |
|---|---|---|
| IS 2490 (various parts) | Tolerance Limits for Industrial Effluents | Industry-specific effluent standards |
| IS 10500:2012 | Drinking Water Specification | Reference for treated water reuse standards |

Bureau of Indian Standards: https://www.bis.gov.in/

---

## United States — EPA Standards (Reference Only)

The EPA standards are referenced because several proxy datasets (EPA Water Quality Portal, UCI datasets from US facilities) operate under these standards. **These do not apply directly to SILVAPURE's India-market deployments.**

### Clean Water Act (CWA), 1972
- 33 U.S.C. §1251 et seq.
- National Pollutant Discharge Elimination System (NPDES): https://www.epa.gov/npdes
- Technology-based effluent limits vary by industry category

### EPA National Recommended Water Quality Criteria
- https://www.epa.gov/wqc/national-recommended-water-quality-criteria-aquatic-life-criteria-table
- Relevant to interpreting EPA Water Quality Portal data

---

## WHO Guidelines (International Reference)

World Health Organization. (2022). *Guidelines for Drinking-Water Quality: Fourth Edition Incorporating the First and Second Addenda*. WHO Press. https://www.who.int/publications/i/item/9789240045064

**Relevance:** Reference for parameter ranges and health-based standards for treated water. Does not apply to wastewater discharge standards but useful for treated effluent reuse scenarios.

---

## Key Monitoring Parameter References for SILVAPURE Models

| Parameter | Indian Standard | WHO Guideline | Notes |
|---|---|---|---|
| pH (effluent) | 6.0–9.0 (CWA 1986) | 6.5–8.5 (drinking water) | Different context |
| BOD₅ | ≤ 30 mg/L (inland water) | — | India standard |
| COD | ≤ 250 mg/L (inland water) | — | India standard |
| TSS | ≤ 100 mg/L (inland water) | — | India standard |
| Total Nitrogen | Varies by consent | — | Site-specific |
| Total Phosphorus | Varies by consent | — | Site-specific |
| Heavy metals | Specified in Schedule VI, IS 2490 | WHO guidelines | Industry-specific |

---

## Regulatory Change Monitoring

Environmental regulations are subject to amendment. The SILVAPURE team should monitor:
- CPCB notifications: https://cpcb.nic.in/notifications.php
- Gazette of India (for Environment Protection Act amendments): https://egazette.gov.in/
- MoEFCC press releases: https://moef.gov.in/
