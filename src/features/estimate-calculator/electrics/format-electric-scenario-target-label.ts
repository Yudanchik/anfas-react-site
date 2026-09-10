/** Labels для select «Применить к» — только имя зоны, без zoneType. */
export function formatElectricScenarioTargetLabel(zone: { name: string }): string {
  return zone.name
}
