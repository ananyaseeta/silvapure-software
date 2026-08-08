/**
 * Treatment Technology Seed Data
 *
 * Covers the standard biological, physicochemical, and advanced technologies
 * deployed across STP, ETP, and CETP plant types.
 * Matches TreatmentTechnology model: { name: String @unique, description: String? }
 */

export interface TreatmentTechnologySeedData {
  name:        string;
  description: string;
}

export const treatmentTechnologies: TreatmentTechnologySeedData[] = [
  // ── Biological ─────────────────────────────────────────────────────────────
  {
    name:        'Activated Sludge Process (ASP)',
    description: 'Aerobic biological treatment using suspended microbial flocs in aeration tanks.',
  },
  {
    name:        'Sequential Batch Reactor (SBR)',
    description: 'Fill-and-draw activated sludge system operated in timed cycles for nutrient removal.',
  },
  {
    name:        'Moving Bed Biofilm Reactor (MBBR)',
    description: 'Attached-growth biofilm process using plastic carriers in aerated tanks.',
  },
  {
    name:        'Membrane Bioreactor (MBR)',
    description: 'Activated sludge combined with ultrafiltration membranes for high-quality effluent.',
  },
  {
    name:        'Upflow Anaerobic Sludge Blanket (UASB)',
    description: 'Anaerobic digestion reactor for high COD industrial and municipal wastewater.',
  },
  {
    name:        'Trickling Filter',
    description: 'Fixed-film biological treatment over a rock or plastic media bed.',
  },
  {
    name:        'Extended Aeration (EA)',
    description: 'Long-retention activated sludge variant suitable for small-to-medium plants.',
  },
  {
    name:        'Aerated Lagoon',
    description: 'Large open pond with mechanical aeration for low-cost, land-intensive treatment.',
  },
  {
    name:        'Constructed Wetlands',
    description: 'Engineered wetland systems using plants and media for passive treatment.',
  },
  // ── Physicochemical ────────────────────────────────────────────────────────
  {
    name:        'Coagulation & Flocculation',
    description: 'Chemical dosing followed by gentle mixing to aggregate suspended solids.',
  },
  {
    name:        'Dissolved Air Flotation (DAF)',
    description: 'Pressurised air-bubble system for removal of suspended solids, oils, and fats.',
  },
  {
    name:        'Neutralisation',
    description: 'pH adjustment using acid or alkali dosing prior to biological or discharge stages.',
  },
  {
    name:        'Chemical Precipitation',
    description: 'Addition of chemicals to precipitate heavy metals and phosphorus from solution.',
  },
  {
    name:        'Electrocoagulation',
    description: 'Electrolytic metal dissolution to coagulate and remove contaminants in situ.',
  },
  // ── Advanced & Tertiary ────────────────────────────────────────────────────
  {
    name:        'Reverse Osmosis (RO)',
    description: 'High-pressure membrane separation for TDS reduction and water reuse production.',
  },
  {
    name:        'Ultrafiltration (UF)',
    description: 'Hollow-fibre membrane polishing step to remove bacteria, colloids, and turbidity.',
  },
  {
    name:        'Nanofiltration (NF)',
    description: 'Intermediate-pressure membrane for divalent salt removal and colour reduction.',
  },
  {
    name:        'UV Disinfection',
    description: 'Ultraviolet irradiation for pathogen inactivation without chemical residuals.',
  },
  {
    name:        'Ozonation',
    description: 'Ozone dosing for micro-pollutant degradation, colour removal, and disinfection.',
  },
  {
    name:        'Activated Carbon Adsorption',
    description: 'Granular or powdered activated carbon for trace organics and colour removal.',
  },
  {
    name:        'Zero Liquid Discharge (ZLD)',
    description: 'Integrated concentration and evaporation system achieving no liquid effluent discharge.',
  },
  // ── Sludge Treatment ──────────────────────────────────────────────────────
  {
    name:        'Anaerobic Digestion',
    description: 'Biological stabilisation of sludge with biogas recovery.',
  },
  {
    name:        'Belt Press / Filter Press',
    description: 'Mechanical sludge dewatering using press belts or plate-and-frame presses.',
  },
  {
    name:        'Centrifuge Dewatering',
    description: 'High-speed centrifugal separation of sludge solids from water.',
  },
  {
    name:        'Solar Sludge Drying',
    description: 'Greenhouse-based sludge drying using solar energy for volume reduction.',
  },
];
