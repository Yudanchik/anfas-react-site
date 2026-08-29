import { useMemo, useState } from 'react'

import {
  calculateEstimateTotal,
  FLOOR_PRICE_MAPPING,
  FLOOR_SECTION_ID,
  FLOOR_SECTION_TITLE,
  getFloorEstimateGroupTitle,
  getSelectedEstimateSections,
  getWallEstimateGroupTitle,
  resolveFloorEstimateGroupId,
  resolveWallEstimateGroupId,
  WALL_PRICE_MAPPING,
  WALL_SECTION_ID,
  WALL_SECTION_TITLE,
} from '@/entities/estimate'
import { useFloorEstimateEditor } from '@/features/floor-estimate'

import { FloorEstimatePanel } from '../floors/FloorEstimatePanel'
import { useWallEstimateEditor } from '../walls/use-wall-estimate-editor'
import { WallEstimatePanel } from '../walls/WallEstimatePanel'
import { EstimateCombinedSummary } from './EstimateCombinedSummary'
import { EstimateIntro } from './EstimateIntro'
import { EstimateTabs, type EstimateTabId } from './EstimateTabs'
import styles from './EstimateCalculatorWorkspace.module.scss'

export function EstimateCalculatorWorkspace() {
  const [activeTab, setActiveTab] = useState<EstimateTabId>('floors')
  const floors = useFloorEstimateEditor()
  const walls = useWallEstimateEditor()

  const selectedSections = useMemo(
    () =>
      getSelectedEstimateSections([
        {
          sectionId: FLOOR_SECTION_ID,
          sectionTitle: 'Полы',
          lines: floors.lines,
          resolveGroupTitle: (line) =>
            getFloorEstimateGroupTitle(resolveFloorEstimateGroupId(line)),
        },
        {
          sectionId: WALL_SECTION_ID,
          sectionTitle: 'Стены',
          lines: walls.lines,
          resolveGroupTitle: (line) => getWallEstimateGroupTitle(resolveWallEstimateGroupId(line)),
        },
      ]),
    [floors.lines, walls.lines],
  )

  const grandTotalRub = useMemo(
    () =>
      calculateEstimateTotal([
        { id: FLOOR_SECTION_ID, title: FLOOR_SECTION_TITLE, lines: floors.lines },
        { id: WALL_SECTION_ID, title: WALL_SECTION_TITLE, lines: walls.lines },
      ]),
    [floors.lines, walls.lines],
  )

  return (
    <div className={styles.workspace}>
      <div className={styles.zone}>
        <EstimateIntro
          floorsSelectedCount={floors.selectedCount}
          wallsSelectedCount={walls.selectedCount}
          floorsTotalRub={floors.totalRub}
          wallsTotalRub={walls.totalRub}
          grandTotalRub={grandTotalRub}
          floorsMappingCount={FLOOR_PRICE_MAPPING.length}
          wallsMappingCount={WALL_PRICE_MAPPING.length}
        />
        <EstimateTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div
        id="estimate-panel-floors"
        role="tabpanel"
        aria-labelledby="estimate-tab-floors"
        hidden={activeTab !== 'floors'}
      >
        <FloorEstimatePanel editor={floors} />
      </div>

      <div
        id="estimate-panel-walls"
        role="tabpanel"
        aria-labelledby="estimate-tab-walls"
        hidden={activeTab !== 'walls'}
      >
        <WallEstimatePanel editor={walls} />
      </div>

      <div className={styles.zone}>
        <EstimateCombinedSummary sections={selectedSections} grandTotalRub={grandTotalRub} />
      </div>
    </div>
  )
}
