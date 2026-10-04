import {
  buildFloorEstimateLines,
  buildWallEstimateLines,
  buildCeilingEstimateLines,
  buildTileEstimateLines,
  buildElectricEstimateLines,
  buildPlumbingEstimateLines,
  electricInputFromZone,
  plumbingInputFromZone,
  ELECTRIC_PRICE_MAPPING,
  TILE_PRICE_MAPPING,
  resolveElectricScenarioQuantity,
  resolvePlumbingScenarioQuantity,
  PLUMBING_PRICE_MAPPING,
  type EstimateLine,
  type EstimateZone,
} from '@/entities/estimate'

export type RoomSection = 'floors' | 'walls' | 'ceilings' | 'tile' | 'electrics' | 'plumbing'

/** Only measured, enabled catalogue lines in this room; zero and manual quantities stay intact. */
export function getRoomQuickFill(
  section: RoomSection,
  zone: EstimateZone,
  lines: readonly EstimateLine[],
  options?: { tileSurface?: 'floor' | 'walls' | 'backsplash' | 'both' },
) {
  let measured: EstimateLine[]
  switch (section) {
    case 'floors':
      measured = buildFloorEstimateLines({
        totalFloorArea: zone.floorArea,
        demolitionArea: zone.demolitionFloorArea,
        screedArea: zone.screedArea || zone.floorArea,
        wetZonesArea: zone.wetArea,
        avgDeltaMm: 0,
      })
      break
    case 'walls':
      measured = buildWallEstimateLines({
        totalWallArea: zone.wallArea,
        demolitionArea: zone.demolitionWallArea,
        plasterArea: zone.plasterArea,
        puttyArea: zone.puttyArea,
        finishArea: zone.finishArea,
        wallHeightM: 0,
        slopesLengthM: zone.slopesLength,
        cornersLengthM: zone.cornersLength,
      })
      break
    case 'ceilings':
      measured = buildCeilingEstimateLines({
        totalCeilingArea: zone.ceilingArea,
        demolitionArea: zone.demolitionCeilingArea,
        plasterArea: zone.plasterCeilingArea,
        puttyArea: zone.puttyCeilingArea,
        finishArea: zone.finishCeilingArea,
      })
      break
    case 'tile':
      measured = buildTileEstimateLines({
        floorTileArea: zone.tileFloorArea,
        wallTileArea: zone.tileWallArea,
        backsplashArea: zone.tileBacksplashArea,
        cuttingLength: zone.tileCuttingLength,
        cornerLength: zone.tileCornerLength,
        holesCount: zone.tileHolesCount,
        repairCount: zone.tileRepairCount,
      })
      break
    case 'electrics': {
      const input = electricInputFromZone(zone)
      const fields = new Map(
        ELECTRIC_PRICE_MAPPING.map((item) => [item.id, item.defaultQuantityFrom]),
      )
      measured = buildElectricEstimateLines(input).map((line) => ({
        ...line,
        quantity: resolveElectricScenarioQuantity(
          line.priceKey,
          fields.get(line.priceKey) ?? 'manual',
          input,
        ),
      }))
      break
    }
    case 'plumbing':
      measured = buildPlumbingEstimateLines(plumbingInputFromZone(zone)).map((line) => ({
        ...line,
        quantity: resolvePlumbingScenarioQuantity(
          line.priceKey,
          PLUMBING_PRICE_MAPPING.find((item) => item.id === line.priceKey)?.defaultQuantityFrom ??
            'manual',
          plumbingInputFromZone(zone),
        ),
      }))
      break
  }
  const byKey = new Map(measured.map((line) => [line.priceKey, line]))
  if (section === 'tile' && options?.tileSurface) {
    const quantity =
      options.tileSurface === 'floor'
        ? zone.tileFloorArea
        : options.tileSurface === 'walls'
          ? zone.tileWallArea
          : options.tileSurface === 'backsplash'
            ? zone.tileBacksplashArea
            : zone.tileFloorArea + zone.tileWallArea
    for (const [key, line] of byKey) {
      if (/^(clad|prep|grout|surcharge)-/.test(key) && line.unit === 'м²')
        byKey.set(key, { ...line, quantity })
    }
  }
  const ambiguousTileKeys = new Set(
    TILE_PRICE_MAPPING.filter((item) => item.defaultQuantityFrom === 'cladArea').map(
      (item) => item.id,
    ),
  )
  return lines.flatMap((line) => {
    const target = byKey.get(line.priceKey)
    return line.sectionId === section &&
      line.zoneId === zone.id &&
      line.enabled &&
      !(
        section === 'tile' &&
        !options?.tileSurface &&
        (ambiguousTileKeys.has(line.priceKey) ||
          /^(clad|prep|grout|surcharge)-/.test(line.priceKey))
      ) &&
      line.source !== 'manual' &&
      target &&
      target.unit === line.unit &&
      target.quantity > 0 &&
      target.quantity !== line.quantity
      ? [{ id: line.id, quantity: target.quantity }]
      : []
  })
}
