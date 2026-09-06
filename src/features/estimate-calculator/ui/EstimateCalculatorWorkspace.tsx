import { useEffect, useMemo, useRef, useState } from 'react'

import {
  attachZonesToSelectedSections,
  buildCeilingEstimateLines,
  buildFloorEstimateLines,
  buildWallEstimateLines,
  calculateEstimateTotal,
  CEILING_PRICE_MAPPING,
  CEILING_SECTION_ID,
  CEILING_SECTION_TITLE,
  FLOOR_PRICE_MAPPING,
  FLOOR_SECTION_ID,
  FLOOR_SECTION_TITLE,
  getCeilingEstimateGroupTitle,
  getFloorEstimateGroupTitle,
  getSelectedEstimateSections,
  getWallEstimateGroupTitle,
  removeEstimateZone,
  resolveCeilingEstimateGroupId,
  resolveFloorEstimateGroupId,
  resolveWallEstimateGroupId,
  WALL_PRICE_MAPPING,
  WALL_SECTION_ID,
  WALL_SECTION_TITLE,
  type EstimateZone,
} from '@/entities/estimate'
import { useFloorEstimateEditor } from '@/features/floor-estimate/model/use-floor-estimate-editor'

import {
  buildEstimateCalculatorSnapshot,
  clearEstimateCalculatorSnapshot,
  DEFAULT_CEILING_SCENARIOS,
  DEFAULT_FLOOR_PRESETS,
  DEFAULT_WALL_SCENARIOS,
  EMPTY_CEILING_INPUT,
  EMPTY_FLOOR_INPUT,
  EMPTY_WALL_INPUT,
  readEstimateCalculatorSnapshot,
  restoreCeilingEstimateState,
  restoreCeilingScenarioDraft,
  restoreEstimateZones,
  restoreFloorEstimateState,
  restoreFloorPresetDraft,
  restoreWallEstimateState,
  restoreWallScenarioDraft,
  writeEstimateCalculatorSnapshot,
  type CeilingScenarioDraftState,
  type FloorPresetDraftState,
  type WallScenarioDraftState,
} from '../model/estimate-calculator-persistence'
import { CeilingEstimatePanel } from '../ceilings/CeilingEstimatePanel'
import { useCeilingEstimateEditor } from '../ceilings/use-ceiling-estimate-editor'
import { FloorEstimatePanel } from '../floors/FloorEstimatePanel'
import { useWallEstimateEditor } from '../walls/use-wall-estimate-editor'
import { WallEstimatePanel } from '../walls/WallEstimatePanel'
import { EstimateCombinedSummary } from './EstimateCombinedSummary'
import { EstimateIntro } from './EstimateIntro'
import { EstimateTabs, type EstimateTabId } from './EstimateTabs'
import styles from './EstimateCalculatorWorkspace.module.scss'

export function EstimateCalculatorWorkspace() {
  const [initial] = useState(() => {
    const snapshot = readEstimateCalculatorSnapshot()
    return {
      snapshot,
      floors: restoreFloorEstimateState(snapshot),
      walls: restoreWallEstimateState(snapshot),
      ceilings: restoreCeilingEstimateState(snapshot),
      zones: restoreEstimateZones(snapshot),
      floorPresets: restoreFloorPresetDraft(snapshot),
      wallScenarios: restoreWallScenarioDraft(snapshot),
      ceilingScenarios: restoreCeilingScenarioDraft(snapshot),
      activeTab: (snapshot?.activeTab ?? 'floors') as EstimateTabId,
    }
  })

  const [activeTab, setActiveTab] = useState<EstimateTabId>(initial.activeTab)
  const [zones, setZones] = useState<EstimateZone[]>(initial.zones)
  const [floorPresetDraft, setFloorPresetDraft] = useState<FloorPresetDraftState>(
    initial.floorPresets,
  )
  const [wallScenarioDraft, setWallScenarioDraft] = useState<WallScenarioDraftState>(
    initial.wallScenarios,
  )
  const [ceilingScenarioDraft, setCeilingScenarioDraft] = useState<CeilingScenarioDraftState>(
    initial.ceilingScenarios,
  )
  const [globalFeedbackEpoch, setGlobalFeedbackEpoch] = useState(0)

  const floors = useFloorEstimateEditor(initial.floors)
  const walls = useWallEstimateEditor(initial.walls)
  const ceilings = useCeilingEstimateEditor(initial.ceilings)
  const skipFirstPersist = useRef(true)

  useEffect(() => {
    if (skipFirstPersist.current) {
      skipFirstPersist.current = false
      return
    }

    writeEstimateCalculatorSnapshot(
      buildEstimateCalculatorSnapshot({
        activeTab,
        zones,
        floorsInput: floors.input,
        floorsLines: floors.lines,
        wallsInput: walls.input,
        wallsLines: walls.lines,
        ceilingsInput: ceilings.input,
        ceilingsLines: ceilings.lines,
        floorPresets: floorPresetDraft,
        wallScenarios: wallScenarioDraft,
        ceilingScenarios: ceilingScenarioDraft,
      }),
    )
  }, [
    activeTab,
    zones,
    floors.input,
    floors.lines,
    walls.input,
    walls.lines,
    ceilings.input,
    ceilings.lines,
    floorPresetDraft,
    wallScenarioDraft,
    ceilingScenarioDraft,
  ])

  function handleZonesChange(nextZones: EstimateZone[]) {
    const prevById = new Map(zones.map((zone) => [zone.id, zone]))
    for (const zone of nextZones) {
      const prev = prevById.get(zone.id)
      if (prev && prev.name !== zone.name) {
        floors.syncZoneName(zone.id, zone.name)
        walls.syncZoneName(zone.id, zone.name)
        ceilings.syncZoneName(zone.id, zone.name)
      }
    }
    setZones(nextZones)
  }

  function handleDeleteZone(zoneId: string) {
    floors.removeLinesByZoneId(zoneId)
    walls.removeLinesByZoneId(zoneId)
    ceilings.removeLinesByZoneId(zoneId)
    setZones((prev) => removeEstimateZone(prev, zoneId))
  }

  function resetAllEstimate() {
    clearEstimateCalculatorSnapshot()
    setGlobalFeedbackEpoch((n) => n + 1)
    setActiveTab('floors')
    setZones([])
    setFloorPresetDraft({ ...DEFAULT_FLOOR_PRESETS })
    setWallScenarioDraft({ ...DEFAULT_WALL_SCENARIOS })
    setCeilingScenarioDraft({ ...DEFAULT_CEILING_SCENARIOS })
    floors.replaceEstimate({
      input: { ...EMPTY_FLOOR_INPUT },
      lines: buildFloorEstimateLines(EMPTY_FLOOR_INPUT),
    })
    walls.replaceEstimate({
      input: { ...EMPTY_WALL_INPUT },
      lines: buildWallEstimateLines(EMPTY_WALL_INPUT),
    })
    ceilings.replaceEstimate({
      input: { ...EMPTY_CEILING_INPUT },
      lines: buildCeilingEstimateLines(EMPTY_CEILING_INPUT),
    })
  }

  function resetWallsSection() {
    walls.resetEstimate()
    setWallScenarioDraft({ ...DEFAULT_WALL_SCENARIOS })
  }

  function resetCeilingsSection() {
    ceilings.resetEstimate()
    setCeilingScenarioDraft({ ...DEFAULT_CEILING_SCENARIOS })
  }

  const zoneNameById = useMemo(
    () => new Map(zones.map((zone) => [zone.id, zone.name])),
    [zones],
  )

  const selectedSections = useMemo(() => {
    const sections = getSelectedEstimateSections([
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
      {
        sectionId: CEILING_SECTION_ID,
        sectionTitle: 'Потолки',
        lines: ceilings.lines,
        resolveGroupTitle: (line) =>
          getCeilingEstimateGroupTitle(resolveCeilingEstimateGroupId(line)),
      },
    ])
    return attachZonesToSelectedSections(sections, zoneNameById)
  }, [floors.lines, walls.lines, ceilings.lines, zoneNameById])

  const grandTotalRub = useMemo(
    () =>
      calculateEstimateTotal([
        { id: FLOOR_SECTION_ID, title: FLOOR_SECTION_TITLE, lines: floors.lines },
        { id: WALL_SECTION_ID, title: WALL_SECTION_TITLE, lines: walls.lines },
        { id: CEILING_SECTION_ID, title: CEILING_SECTION_TITLE, lines: ceilings.lines },
      ]),
    [floors.lines, walls.lines, ceilings.lines],
  )

  return (
    <div className={styles.workspace}>
      <div className={styles.zone}>
        <EstimateIntro
          floorsSelectedCount={floors.selectedCount}
          wallsSelectedCount={walls.selectedCount}
          ceilingsSelectedCount={ceilings.selectedCount}
          floorsTotalRub={floors.totalRub}
          wallsTotalRub={walls.totalRub}
          ceilingsTotalRub={ceilings.totalRub}
          grandTotalRub={grandTotalRub}
          floorsMappingCount={FLOOR_PRICE_MAPPING.length}
          wallsMappingCount={WALL_PRICE_MAPPING.length}
          ceilingsMappingCount={CEILING_PRICE_MAPPING.length}
        />
        <EstimateTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div
        id="estimate-panel-floors"
        role="tabpanel"
        aria-labelledby="estimate-tab-floors"
        hidden={activeTab !== 'floors'}
      >
        <FloorEstimatePanel
          editor={floors}
          zones={zones}
          onZonesChange={handleZonesChange}
          onDeleteZone={handleDeleteZone}
          presetDraft={floorPresetDraft}
          onPresetDraftChange={(patch) =>
            setFloorPresetDraft((prev) => ({ ...prev, ...patch }))
          }
          onResetAll={resetAllEstimate}
          globalFeedbackEpoch={globalFeedbackEpoch}
        />
      </div>

      <div
        id="estimate-panel-walls"
        role="tabpanel"
        aria-labelledby="estimate-tab-walls"
        hidden={activeTab !== 'walls'}
      >
        <WallEstimatePanel
          editor={walls}
          zones={zones}
          onZonesChange={handleZonesChange}
          onDeleteZone={handleDeleteZone}
          scenarioDraft={wallScenarioDraft}
          onScenarioDraftChange={(patch) =>
            setWallScenarioDraft((prev) => ({ ...prev, ...patch }))
          }
          onResetSection={resetWallsSection}
          globalFeedbackEpoch={globalFeedbackEpoch}
        />
      </div>

      <div
        id="estimate-panel-ceilings"
        role="tabpanel"
        aria-labelledby="estimate-tab-ceilings"
        hidden={activeTab !== 'ceilings'}
      >
        <CeilingEstimatePanel
          editor={ceilings}
          zones={zones}
          onZonesChange={handleZonesChange}
          onDeleteZone={handleDeleteZone}
          scenarioDraft={ceilingScenarioDraft}
          onScenarioDraftChange={(patch) =>
            setCeilingScenarioDraft((prev) => ({ ...prev, ...patch }))
          }
          onResetSection={resetCeilingsSection}
          globalFeedbackEpoch={globalFeedbackEpoch}
        />
      </div>

      <div className={styles.zone}>
        <EstimateCombinedSummary sections={selectedSections} grandTotalRub={grandTotalRub} />
      </div>
    </div>
  )
}
