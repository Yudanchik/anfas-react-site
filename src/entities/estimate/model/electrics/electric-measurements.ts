import type { ElectricEstimateInput } from '../shared/estimate.types'

type PointCounts = Pick<
  ElectricEstimateInput,
  | 'electricSocketsCount'
  | 'electricSwitchesCount'
  | 'electricDataPointsCount'
  | 'electricSocketBoxesCount'
>

/** Один встраиваемый механизм занимает одно установочное место.
 * Количество можно исправить вручную для накладных/готовых точек и блоков. */
export function estimateSocketBoxes(
  values: Pick<
    PointCounts,
    'electricSocketsCount' | 'electricSwitchesCount' | 'electricDataPointsCount'
  >,
): number {
  return values.electricSocketsCount + values.electricSwitchesCount + values.electricDataPointsCount
}

/** Пока поле равно прежней автоматической оценке, оно следует за точками.
 * Любое ручное отклонение сохраняется при следующих изменениях точек. */
export function patchElectricPoints(
  values: PointCounts,
  patch: Partial<PointCounts>,
): Partial<PointCounts> {
  if (patch.electricSocketBoxesCount !== undefined) return patch
  if (
    patch.electricSocketsCount === undefined &&
    patch.electricSwitchesCount === undefined &&
    patch.electricDataPointsCount === undefined
  )
    return patch
  if (values.electricSocketBoxesCount !== estimateSocketBoxes(values)) return patch
  return { ...patch, electricSocketBoxesCount: estimateSocketBoxes({ ...values, ...patch }) }
}
