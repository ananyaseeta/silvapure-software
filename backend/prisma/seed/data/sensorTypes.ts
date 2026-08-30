/**
 * Sensor Type Seed Data
 *
 * Matches SensorType model: { code: String @unique, name: String, description: String? }
 */

export interface SensorTypeSeedData {
  code:        string;
  name:        string;
  description: string;
}

export const sensorTypes: SensorTypeSeedData[] = [
  // ── Water Quality ──────────────────────────────────────────────────────────
  {
    code:        'PH_SENSOR',
    name:        'pH Sensor',
    description: 'Measures hydrogen ion concentration (acidity/alkalinity) of water.',
  },
  {
    code:        'DO_SENSOR',
    name:        'Dissolved Oxygen Sensor',
    description: 'Measures dissolved oxygen concentration in water — critical for biological treatment.',
  },
  {
    code:        'COD_SENSOR',
    name:        'COD Sensor',
    description: 'Online chemical oxygen demand analyser for organic load monitoring.',
  },
  {
    code:        'BOD_SENSOR',
    name:        'BOD Sensor',
    description: 'Biological oxygen demand sensor for organic pollution assessment.',
  },
  {
    code:        'TSS_SENSOR',
    name:        'Total Suspended Solids Sensor',
    description: 'Turbidity-based or optical sensor for suspended particulate measurement.',
  },
  {
    code:        'TURBIDITY_SENSOR',
    name:        'Turbidity Sensor',
    description: 'Measures light scattering caused by suspended particles in water.',
  },
  {
    code:        'TDS_SENSOR',
    name:        'Total Dissolved Solids Sensor',
    description: 'Conductivity-based sensor for dissolved salt and mineral concentration.',
  },
  {
    code:        'CONDUCTIVITY_SENSOR',
    name:        'Conductivity Sensor',
    description: 'Measures electrical conductivity as a proxy for ionic strength and TDS.',
  },
  {
    code:        'ORP_SENSOR',
    name:        'ORP / Redox Sensor',
    description: 'Measures oxidation-reduction potential for disinfection and anaerobic monitoring.',
  },
  {
    code:        'AMMONIA_SENSOR',
    name:        'Ammonia-Nitrogen Sensor',
    description: 'Ion-selective or UV-absorption sensor for ammoniacal nitrogen concentration.',
  },
  {
    code:        'NITRATE_SENSOR',
    name:        'Nitrate Sensor',
    description: 'Ion-selective electrode or UV sensor for nitrate-nitrogen measurement.',
  },
  {
    code:        'PHOSPHATE_SENSOR',
    name:        'Phosphate Sensor',
    description: 'Colorimetric or ion-selective sensor for orthophosphate measurement.',
  },
  {
    code:        'CHLORINE_SENSOR',
    name:        'Residual Chlorine Sensor',
    description: 'Amperometric sensor for free and total residual chlorine in treated water.',
  },
  {
    code:        'HEAVY_METAL_SENSOR',
    name:        'Heavy Metals Sensor',
    description: 'Electrochemical sensor for trace metal detection (Pb, Cd, Cr, As, Hg).',
  },
  {
    code:        'OIL_GREASE_SENSOR',
    name:        'Oil & Grease Sensor',
    description: 'IR or UV-based sensor for hydrocarbon detection in wastewater.',
  },
  {
    code:        'COLOR_SENSOR',
    name:        'Colour / Absorbance Sensor',
    description: 'Spectrophotometric sensor for true and apparent colour measurement.',
  },
  // ── Physical / Process ─────────────────────────────────────────────────────
  {
    code:        'FLOW_SENSOR',
    name:        'Flow Meter',
    description: 'Measures volumetric or mass flow rate of water streams (inlet, outlet, recycle).',
  },
  {
    code:        'LEVEL_SENSOR',
    name:        'Level Sensor',
    description: 'Ultrasonic, pressure, or float sensor for liquid level in tanks and sumps.',
  },
  {
    code:        'TEMPERATURE_SENSOR',
    name:        'Temperature Sensor',
    description: 'RTD or thermocouple for water and process temperature monitoring.',
  },
  {
    code:        'PRESSURE_SENSOR',
    name:        'Pressure Sensor',
    description: 'Measures system pressure in pipes, membranes, and process vessels.',
  },
  {
    code:        'SLUDGE_DENSITY_SENSOR',
    name:        'Sludge Density Sensor',
    description: 'Ultrasonic or optical sensor for mixed liquor suspended solids (MLSS) in aeration tanks.',
  },
  // ── Gas ───────────────────────────────────────────────────────────────────
  {
    code:        'BIOGAS_SENSOR',
    name:        'Biogas Analyser',
    description: 'Measures methane (CH4) and CO2 concentration in biogas from anaerobic digesters.',
  },
  {
    code:        'H2S_SENSOR',
    name:        'Hydrogen Sulphide Sensor',
    description: 'Electrochemical sensor for H2S detection in sewage and sludge environments.',
  },
  {
    code:        'AIR_FLOW_SENSOR',
    name:        'Air Flow Sensor',
    description: 'Measures aeration air volume supplied to biological treatment reactors.',
  },
];
