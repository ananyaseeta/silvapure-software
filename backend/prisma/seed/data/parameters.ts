/**
 * Parameter Seed Data
 *
 * Water quality and process parameters used across sensors and compliance.
 * Matches Parameter model:
 *   { code: String @unique, name: String, unit: String,
 *     acceptableMin: Decimal?, acceptableMax: Decimal?, description: String? }
 *
 * Acceptable limits are based on CPCB (India) General Standards for
 * discharge into inland surface waters (Schedule VI, Environment Protection Rules).
 * Set to null where no universal standard applies.
 */

export interface ParameterSeedData {
  code:          string;
  name:          string;
  unit:          string;
  acceptableMin: number | null;
  acceptableMax: number | null;
  description:   string;
}

export const parameters: ParameterSeedData[] = [
  // ── Physical ────────────────────────────────────────────────────────────────
  {
    code:          'pH',
    name:          'pH',
    unit:          'pH units',
    acceptableMin: 6.0,
    acceptableMax: 9.0,
    description:   'Hydrogen ion concentration expressing acidity or alkalinity on a 0–14 scale.',
  },
  {
    code:          'TEMPERATURE',
    name:          'Temperature',
    unit:          '°C',
    acceptableMin: null,
    acceptableMax: 40.0,
    description:   'Water temperature at point of measurement.',
  },
  {
    code:          'TURBIDITY',
    name:          'Turbidity',
    unit:          'NTU',
    acceptableMin: null,
    acceptableMax: 10.0,
    description:   'Optical clarity of water expressed in Nephelometric Turbidity Units.',
  },
  {
    code:          'COLOR',
    name:          'Colour',
    unit:          'Hazen (PCU)',
    acceptableMin: null,
    acceptableMax: 100.0,
    description:   'True colour of water measured in Platinum-Cobalt (Hazen) units.',
  },
  // ── Organic ─────────────────────────────────────────────────────────────────
  {
    code:          'BOD',
    name:          'Biochemical Oxygen Demand (BOD₅)',
    unit:          'mg/L',
    acceptableMin: null,
    acceptableMax: 30.0,
    description:   '5-day biochemical oxygen demand indicating biodegradable organic load.',
  },
  {
    code:          'COD',
    name:          'Chemical Oxygen Demand (COD)',
    unit:          'mg/L',
    acceptableMin: null,
    acceptableMax: 250.0,
    description:   'Total chemical oxygen demand including both biodegradable and refractory organics.',
  },
  {
    code:          'TOC',
    name:          'Total Organic Carbon (TOC)',
    unit:          'mg/L',
    acceptableMin: null,
    acceptableMax: null,
    description:   'Total carbon bound in organic molecules; used as surrogate for organic load.',
  },
  // ── Solids ──────────────────────────────────────────────────────────────────
  {
    code:          'TSS',
    name:          'Total Suspended Solids (TSS)',
    unit:          'mg/L',
    acceptableMin: null,
    acceptableMax: 100.0,
    description:   'Dry weight of particles retained on a 1.5 µm filter.',
  },
  {
    code:          'TDS',
    name:          'Total Dissolved Solids (TDS)',
    unit:          'mg/L',
    acceptableMin: null,
    acceptableMax: 2100.0,
    description:   'Total dissolved inorganic and organic material passing through a 2 µm filter.',
  },
  {
    code:          'MLSS',
    name:          'Mixed Liquor Suspended Solids (MLSS)',
    unit:          'mg/L',
    acceptableMin: 2000.0,
    acceptableMax: 5000.0,
    description:   'Concentration of suspended solids in the aeration tank of an activated sludge system.',
  },
  // ── Nutrients ───────────────────────────────────────────────────────────────
  {
    code:          'NH4_N',
    name:          'Ammoniacal Nitrogen (NH₄-N)',
    unit:          'mg/L',
    acceptableMin: null,
    acceptableMax: 50.0,
    description:   'Nitrogen present as ammonium ion, indicative of organic nitrogen decomposition.',
  },
  {
    code:          'NO3_N',
    name:          'Nitrate Nitrogen (NO₃-N)',
    unit:          'mg/L',
    acceptableMin: null,
    acceptableMax: 10.0,
    description:   'Nitrogen present as nitrate ion; high levels indicate incomplete denitrification.',
  },
  {
    code:          'TN',
    name:          'Total Nitrogen (TN)',
    unit:          'mg/L',
    acceptableMin: null,
    acceptableMax: null,
    description:   'Sum of all nitrogen species including organic, ammoniacal, nitrate, and nitrite nitrogen.',
  },
  {
    code:          'PO4_P',
    name:          'Orthophosphate (PO₄-P)',
    unit:          'mg/L',
    acceptableMin: null,
    acceptableMax: 5.0,
    description:   'Soluble reactive phosphorus measured as orthophosphate.',
  },
  {
    code:          'TP',
    name:          'Total Phosphorus (TP)',
    unit:          'mg/L',
    acceptableMin: null,
    acceptableMax: null,
    description:   'Sum of all phosphorus forms including particulate and dissolved fractions.',
  },
  // ── Oxygen & Redox ──────────────────────────────────────────────────────────
  {
    code:          'DO',
    name:          'Dissolved Oxygen (DO)',
    unit:          'mg/L',
    acceptableMin: 4.0,
    acceptableMax: null,
    description:   'Oxygen dissolved in water essential for aerobic biological treatment.',
  },
  {
    code:          'ORP',
    name:          'Oxidation-Reduction Potential (ORP)',
    unit:          'mV',
    acceptableMin: null,
    acceptableMax: null,
    description:   'Redox potential indicating oxidising or reducing conditions in water.',
  },
  // ── Ions & Conductivity ────────────────────────────────────────────────────
  {
    code:          'CONDUCTIVITY',
    name:          'Electrical Conductivity',
    unit:          'µS/cm',
    acceptableMin: null,
    acceptableMax: null,
    description:   'Measure of ionic strength and total dissolved ion concentration.',
  },
  {
    code:          'CHLORIDE',
    name:          'Chloride (Cl⁻)',
    unit:          'mg/L',
    acceptableMin: null,
    acceptableMax: 1000.0,
    description:   'Chloride ion concentration; high levels can inhibit biological treatment.',
  },
  {
    code:          'SULPHATE',
    name:          'Sulphate (SO₄²⁻)',
    unit:          'mg/L',
    acceptableMin: null,
    acceptableMax: 1000.0,
    description:   'Sulphate concentration; reduction to H₂S under anaerobic conditions.',
  },
  {
    code:          'RESIDUAL_CHLORINE',
    name:          'Residual Chlorine',
    unit:          'mg/L',
    acceptableMin: null,
    acceptableMax: 1.0,
    description:   'Free and combined chlorine remaining after disinfection treatment.',
  },
  // ── Heavy Metals ───────────────────────────────────────────────────────────
  {
    code:          'CHROMIUM',
    name:          'Total Chromium (Cr)',
    unit:          'mg/L',
    acceptableMin: null,
    acceptableMax: 2.0,
    description:   'Total chromium including hexavalent Cr(VI) and trivalent Cr(III) species.',
  },
  {
    code:          'LEAD',
    name:          'Lead (Pb)',
    unit:          'mg/L',
    acceptableMin: null,
    acceptableMax: 0.1,
    description:   'Dissolved lead concentration — highly toxic heavy metal.',
  },
  {
    code:          'CADMIUM',
    name:          'Cadmium (Cd)',
    unit:          'mg/L',
    acceptableMin: null,
    acceptableMax: 0.01,
    description:   'Dissolved cadmium — potent carcinogen and cumulative toxin.',
  },
  {
    code:          'ARSENIC',
    name:          'Arsenic (As)',
    unit:          'mg/L',
    acceptableMin: null,
    acceptableMax: 0.2,
    description:   'Total arsenic concentration — naturally occurring and industrial contaminant.',
  },
  {
    code:          'MERCURY',
    name:          'Mercury (Hg)',
    unit:          'mg/L',
    acceptableMin: null,
    acceptableMax: 0.01,
    description:   'Total mercury — extremely toxic heavy metal with bioaccumulation potential.',
  },
  // ── Process / Flow ─────────────────────────────────────────────────────────
  {
    code:          'FLOW_RATE',
    name:          'Flow Rate',
    unit:          'm³/hr',
    acceptableMin: null,
    acceptableMax: null,
    description:   'Volumetric flow rate of water in treatment channels or pipes.',
  },
  {
    code:          'SLUDGE_VOLUME_INDEX',
    name:          'Sludge Volume Index (SVI)',
    unit:          'mL/g',
    acceptableMin: 50.0,
    acceptableMax: 150.0,
    description:   'Settleability index of activated sludge; values >150 indicate bulking.',
  },
  {
    code:          'BIOGAS_METHANE',
    name:          'Biogas Methane Content',
    unit:          '%',
    acceptableMin: 55.0,
    acceptableMax: 75.0,
    description:   'Percentage methane in biogas produced by anaerobic digesters.',
  },
];
