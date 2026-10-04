import type { EstimateZone } from '../shared/estimate-zone'

type Fixtures = Pick<
  EstimateZone,
  | 'plumbingSinksCount'
  | 'plumbingBathtubsCount'
  | 'plumbingShowersCount'
  | 'plumbingToiletsCount'
  | 'plumbingWasherConnectionsCount'
  | 'plumbingDishwasherConnectionsCount'
>

/** Типовая схема: два вывода на смеситель, один ХВС на бачок/машину; один слив на прибор. */
export function estimatePlumbingPoints(values: Fixtures) {
  const mixed =
    values.plumbingSinksCount + values.plumbingBathtubsCount + values.plumbingShowersCount
  const cold =
    values.plumbingToiletsCount +
    values.plumbingWasherConnectionsCount +
    values.plumbingDishwasherConnectionsCount
  return { plumbingWaterPointsCount: mixed * 2 + cold, plumbingSewerPointsCount: mixed + cold }
}

export function patchPlumbingFixturePoints(
  zone: EstimateZone,
  patch: Partial<Omit<EstimateZone, 'id'>>,
) {
  const next = { ...patch }
  // Ручная правка каждой группы сохраняется независимо от другой группы.
  if (patch.plumbingMixersCount !== undefined || patch.plumbingInstallationsCount !== undefined) {
    next.plumbingFixtureCountsMode = 'manual'
  }
  if (
    patch.plumbingWaterPointsCount !== undefined ||
    patch.plumbingSewerPointsCount !== undefined
  ) {
    next.plumbingPointsMode = 'manual'
  }
  const values = { ...zone, ...next }
  if (values.plumbingPointsMode === 'fixtures') Object.assign(next, estimatePlumbingPoints(values))
  if (values.plumbingFixtureCountsMode === 'auto') {
    next.plumbingMixersCount =
      values.plumbingSinksCount + values.plumbingBathtubsCount + values.plumbingShowersCount
    // Считаем именно новые рамы: подвесная чаша на готовой раме новой установки не требует.
    if (values.plumbingToiletMount && values.plumbingToiletMount !== 'unknown') {
      next.plumbingInstallationsCount =
        values.plumbingToiletMount === 'installation' ? values.plumbingToiletsCount : 0
    }
  }
  return next
}
