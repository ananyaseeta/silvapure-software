# SILVAPURE Telemetry Requirements for AI/ML

## Purpose

This document specifies the sensor readings, sampling rates, data quality requirements, and minimum data volumes that SILVAPURE hardware must collect and the SILVAPURE platform must store to enable real training and production inference for each of the four AI models.

These requirements are derived from the SILVAPURE Prisma schema (`Telemetry`, `Sensor`, `Parameter`, `Device`, `Controller`, `TreatmentPlant`) and from the data requirements of each model.

This document does NOT specify hardware procurement or IoT communication protocols — those are covered in the SILVAPURE Device Management and IoT integration specifications.

---

## Section A — Plant Health Scoring

### Required Parameters at Each Treatment Plant Inlet

| Parameter Code | Parameter Name | Minimum Sampling Rate | Units | Notes |
|---|---|---|---|---|
| `pH` | pH | Every 15 minutes | pH units | ±0.05 pH accuracy required |
| `BOD` | Biochemical Oxygen Demand | Daily (lab) or hourly (online BOD analyser) | mg/L | Lab samples minimum acceptable; online preferred |
| `COD` | Chemical Oxygen Demand | Daily (lab) or 4-hourly (online COD analyser) | mg/L | Lab samples minimum acceptable |
| `TSS` | Total Suspended Solids | Every 15 minutes (turbidity-based proxy) or daily (gravimetric lab) | mg/L | Turbidity proxy acceptable with calibration |
| `FLOW_RATE` | Inlet Flow Rate | Every 5 minutes | m³/hr | Continuous flow meter required |
| `TEMPERATURE` | Water Temperature | Every 15 minutes | °C | ±0.5°C accuracy |

### Required Parameters at Each Treatment Stage (Aeration/Biological)

| Parameter Code | Parameter Name | Minimum Sampling Rate | Units |
|---|---|---|---|
| `DO` | Dissolved Oxygen | Every 5 minutes | mg/L |
| `MLSS` | Mixed Liquor Suspended Solids | Every 30 minutes (online) or daily (lab) | mg/L |
| `TEMPERATURE` | Process Temperature | Every 15 minutes | °C |
| `PH` | Process pH | Every 15 minutes | pH units |
| `AIR_FLOW` | Aeration Air Flow | Every 5 minutes | m³/hr |

### Required Parameters at Effluent Outlet

Same parameters as inlet, plus:

| Parameter Code | Parameter Name | Minimum Sampling Rate | Units |
|---|---|---|---|
| `RESIDUAL_CHLORINE` | Residual Chlorine (post-disinfection) | Every 15 minutes | mg/L |
| `TURBIDITY` | Turbidity | Every 15 minutes | NTU |
| `CONDUCTIVITY` | Electrical Conductivity | Every 15 minutes | µS/cm |

### Alert and Maintenance Data Required
- All historical `Alert` records with `treatmentPlantId`, `severity`, `status`, `createdAt`, `resolvedAt`
- All `Maintenance` records with `deviceId`, `maintenanceType`, `status`, `scheduledDate`, `performedDate`
- Minimum 90 days of continuous data before model training

---

## Section B — Water Quality Prediction

### Required Parameters (all from Section A plus the following)

| Parameter Code | Parameter Name | Minimum Sampling Rate | Units | Purpose |
|---|---|---|---|---|
| `NH4_N` | Ammoniacal Nitrogen | Every 2 hours (online) or daily (lab) | mg/L | Biological treatment indicator |
| `NO3_N` | Nitrate Nitrogen | Daily (lab) or 4-hourly | mg/L | Nitrification completion |
| `PO4_P` | Orthophosphate | Daily (lab) | mg/L | Phosphorus removal monitoring |
| `SLUDGE_VOLUME_INDEX` | SVI | Daily | mL/g | Sludge settleability |
| `ORP` | Oxidation-Reduction Potential | Every 15 minutes | mV | Anoxic zone monitoring |

### Minimum Data Volume for Training
- Minimum: 180 days of continuous monitoring at the required sampling rates
- Preferred: 2 years (captures seasonal variation, monsoon effects)
- Required sequence length for LSTM input: at least 7 × minimum sequence length of the model

### Data Quality Thresholds
- Maximum allowable gap before flagging: 60 minutes
- Maximum allowable missingness per day: 20% of expected readings
- Days with >20% missingness are excluded from model training

### Prediction Horizon Requirements
The Water Quality Prediction model must be able to predict at least 6 hours ahead. This requires:
- At least 6 hours of historical context per prediction (i.e., the model window covers at least 6 hours + 6 hours future)
- Online BOD/COD sensors provide sub-hourly readings; lab samples are supplemented by inline proxies

---

## Section C — Predictive Maintenance

### Required Device Telemetry

For each device tracked in the SILVAPURE `Device` table, the following must be collected:

| Signal | Minimum Sampling Rate | Units | Notes |
|---|---|---|---|
| Motor current (if accessible) | Every 1 minute | Amperes | Anomalous current indicates bearing wear |
| Operating temperature | Every 5 minutes | °C | Motor winding temperature if accessible |
| Vibration amplitude | Every 1 minute | mm/s RMS | Requires vibration sensor attachment |
| Flow rate output | Every 5 minutes | m³/hr | Deviation from rated capacity indicates wear |
| Pressure differential (for pumps) | Every 5 minutes | bar | Impeller wear indicator |
| Device on/off status | Every 1 minute | Boolean | Required for cumulative runtime calculation |
| Cumulative runtime | Calculated field | Hours | Derived from on/off status |

### Required Maintenance Records
- All `Maintenance` records with `maintenanceType`, `status`, `scheduledDate`, `performedDate`
- All corrective maintenance records (`maintenanceType = CORRECTIVE`) are failure events
- Minimum: at least 5 corrective maintenance events per device type before supervised training
- If < 5 corrective events: use unsupervised anomaly-based maintenance prediction only

### Device Registration Requirements
All `Device` records must have:
- `manufacturer` and `model` fields populated
- `installedOn` date populated (required for age-based features)
- `serialNumber` populated (for manufacturer failure rate cross-referencing if available)

### Minimum Data Volume
- Minimum 12 months per device before supervised failure prediction is meaningful
- Less than 12 months: use anomaly-based approach only

---

## Section D — Anomaly Detection

### Required Parameters
All parameters from Sections A, B, and C contribute to anomaly detection. The anomaly detection model operates on the full multivariate sensor stream.

### Additional Requirements
| Signal | Minimum Sampling Rate | Purpose |
|---|---|---|
| All Section A parameters | As specified in A | Baseline anomaly detection |
| Sensor `calibrationStatus` changes | Event-driven | Distinguishing calibration events from genuine anomalies |
| `Device.lastHeartbeatAt` | Every 5 minutes | Communication loss detection |
| `Device.communicationStatus` | Every 5 minutes | Device offline anomaly |
| Alert acknowledgement timestamps | Event-driven | Alert pattern anomalies |

### Normal Operation Baseline Period
- A period of at least 30 consecutive days with:
  - No CRITICAL alerts
  - No corrective maintenance events
  - No known process upsets (to be confirmed by plant manager)
- This baseline period defines the "normal" distribution for anomaly detection training
- The baseline period must be documented and signed off by a plant operator

### Sampling Rate Requirements
- For point anomaly detection: 15-minute resolution minimum
- For contextual and collective anomaly detection: 1-minute resolution preferred
- Below 15-minute resolution: many subtle process anomalies will be missed

---

## Section E — Data Governance

### Data Retention
- Raw telemetry: minimum 3 years (for seasonal modelling and annual compliance)
- Alert records: minimum 5 years
- Maintenance records: lifetime of each device
- Water quality lab samples: minimum 5 years (regulatory requirement)

### Data Quality Monitoring
The following data quality metrics should be computed daily and surfaced in the SILVAPURE platform:
- Completeness per sensor: percentage of expected readings received
- Calibration status: number of sensors in `DUE` or `EXPIRED` calibration status
- Sensor fault rate: percentage of sensors with `SensorStatus.FAULT` in the last 24 hours

### Privacy and Regulatory Considerations
- Wastewater quality data from operational facilities may be subject to data-sharing restrictions under the Environment Protection Act, 1986 (India) and state-level rules
- Before sharing aggregated model training data across plants, verify applicable restrictions with legal counsel
- This document does not constitute legal advice on data sharing requirements

---

## Section F — Transition Checklist

Before transitioning from proxy data (Phase 1) to real SILVAPURE data (Phase 2), verify:

- [ ] Minimum data volume met (per model requirements above)
- [ ] Baseline normal operation period identified and documented
- [ ] All required sensors are calibrated and communication-confirmed
- [ ] Data quality metrics show < 10% overall missingness
- [ ] Database export pipeline from SILVAPURE PostgreSQL to ML environment is tested
- [ ] Data processing and model training code has been unit-tested on proxy data
- [ ] Plant operator has reviewed and confirmed the normal operation baseline period
