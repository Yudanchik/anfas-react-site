/** Labels для select «Применить к» — только имя зоны, без zoneType. */
export function formatPlumbingScenarioTargetLabel(zone: { name: string }): string {
  return zone.name
}
