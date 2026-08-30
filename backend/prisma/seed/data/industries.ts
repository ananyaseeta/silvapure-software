/**
 * Industry Type Seed Data
 *
 * Covers the main verticals that use wastewater treatment.
 * Matches the IndustryType model: { name: String @unique, description: String? }
 */

export interface IndustryTypeSeedData {
  name:        string;
  description: string;
}

export const industryTypes: IndustryTypeSeedData[] = [
  {
    name:        'Pharmaceuticals',
    description: 'Drug manufacturing and active pharmaceutical ingredient (API) production facilities.',
  },
  {
    name:        'Textiles',
    description: 'Dyeing, finishing, and fabric processing plants generating dye-laden effluent.',
  },
  {
    name:        'Food & Beverage',
    description: 'Food processing, dairy, and beverage production facilities with high BOD/COD loads.',
  },
  {
    name:        'Chemicals',
    description: 'Specialty chemicals, agrochemicals, and industrial chemical manufacturing.',
  },
  {
    name:        'Municipal',
    description: 'City-level and town-level sewage treatment plants (STPs) operated by municipal bodies.',
  },
  {
    name:        'Automotive',
    description: 'Vehicle manufacturing and component plants generating metallic and oily wastewater.',
  },
  {
    name:        'Paper & Pulp',
    description: 'Paper manufacturing and pulp processing facilities with high fibre and chemical loads.',
  },
  {
    name:        'Steel & Metals',
    description: 'Steel mills, foundries, and metal surface treatment plants.',
  },
  {
    name:        'Tanneries',
    description: 'Leather processing facilities generating chromium-rich and high-strength effluents.',
  },
  {
    name:        'Electronics',
    description: 'PCB manufacturing, semiconductor fabrication, and electronics assembly.',
  },
  {
    name:        'Power Generation',
    description: 'Thermal power plants and industrial power stations with cooling tower and ash pond effluent.',
  },
  {
    name:        'Mining',
    description: 'Mineral extraction and processing operations generating acid mine drainage.',
  },
  {
    name:        'Hospitality',
    description: 'Hotels, resorts, and large hospitality complexes with on-site STPs.',
  },
  {
    name:        'Real Estate',
    description: 'Residential townships, commercial complexes, and SEZs with decentralised ETPs.',
  },
  {
    name:        'Distilleries',
    description: 'Alcohol distillation plants generating high-strength spent-wash effluent.',
  },
];
