import { useEffect, useMemo, useRef, useState } from 'react'

import {
  attachZonesToSelectedSections,
  buildCeilingEstimateLines,
  buildElectricEstimateLines,
  buildFloorEstimateLines,
  buildPlumbingEstimateLines,
  buildTileEstimateLines,
  buildWallEstimateLines,
  calculateEstimateTotal,
  CEILING_PRICE_MAPPING,
  CEILING_SECTION_ID,
  CEILING_SECTION_TITLE,
  ELECTRIC_PRICE_MAPPING,
  ELECTRIC_SECTION_ID,
  ELECTRIC_SECTION_TITLE,
  FLOOR_PRICE_MAPPING,
  FLOOR_SECTION_ID,
  FLOOR_SECTION_TITLE,
  getCeilingEstimateGroupTitle,
  getElectricEstimateGroupTitle,
  getFloorEstimateGroupTitle,
  getPlumbingEstimateGroupTitle,
  getSelectedEstimateSections,
  getTileEstimateGroupTitle,
  getWallEstimateGroupTitle,
  PLUMBING_PRICE_MAPPING,
  PLUMBING_SECTION_ID,
  PLUMBING_SECTION_TITLE,
  removeEstimateZone,
  resolveCeilingEstimateGroupId,
  resolveElectricEstimateGroupId,
  resolveFloorEstimateGroupId,
  resolvePlumbingEstimateGroupId,
  resolveTileEstimateGroupId,
  resolveWallEstimateGroupId,
  TILE_PRICE_MAPPING,
  TILE_SECTION_ID,
  TILE_SECTION_TITLE,
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
  DEFAULT_ELECTRIC_SCENARIOS,
  DEFAULT_FLOOR_PRESETS,
  DEFAULT_PLUMBING_SCENARIOS,
  DEFAULT_TILE_SCENARIOS,
  DEFAULT_WALL_SCENARIOS,
  EMPTY_CEILING_INPUT,
  EMPTY_ELECTRIC_INPUT,
  EMPTY_FLOOR_INPUT,
  EMPTY_PLUMBING_INPUT,
  EMPTY_TILE_INPUT,
  EMPTY_WALL_INPUT,
  readEstimateCalculatorSnapshot,
  restoreCeilingEstimateState,
  restoreCeilingScenarioDraft,
  restoreElectricEstimateState,
  restoreElectricScenarioDraft,
  restoreEstimateZones,
  restoreFloorEstimateState,
  restoreFloorPresetDraft,
  restorePlumbingEstimateState,
  restorePlumbingScenarioDraft,
  restoreTileEstimateState,
  restoreTileScenarioDraft,
  restoreWallEstimateState,
  restoreWallScenarioDraft,
  writeEstimateCalculatorSnapshot,
  type CeilingScenarioDraftState,
  type ElectricScenarioDraftState,
  type FloorPresetDraftState,
  type PlumbingScenarioDraftState,
  type TileScenarioDraftState,
  type WallScenarioDraftState,
} from '../model/estimate-calculator-persistence'
import { CeilingEstimatePanel } from '../ceilings/CeilingEstimatePanel'
import { useCeilingEstimateEditor } from '../ceilings/use-ceiling-estimate-editor'
import { ElectricEstimatePanel } from '../electrics/ElectricEstimatePanel'
import { useElectricEstimateEditor } from '../electrics/use-electric-estimate-editor'
import { FloorEstimatePanel } from '../floors/FloorEstimatePanel'
import { PlumbingEstimatePanel } from '../plumbing/PlumbingEstimatePanel'
import { usePlumbingEstimateEditor } from '../plumbing/use-plumbing-estimate-editor'
import { TileEstimatePanel } from '../tile/TileEstimatePanel'
import { useTileEstimateEditor } from '../tile/use-tile-estimate-editor'
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
      tile: restoreTileEstimateState(snapshot),
      electrics: restoreElectricEstimateState(snapshot),
      plumbing: restorePlumbingEstimateState(snapshot),
      zones: restoreEstimateZones(snapshot),
      floorPresets: restoreFloorPresetDraft(snapshot),
      wallScenarios: restoreWallScenarioDraft(snapshot),
      ceilingScenarios: restoreCeilingScenarioDraft(snapshot),
      tileScenarios: restoreTileScenarioDraft(snapshot),
      electricScenarios: restoreElectricScenarioDraft(snapshot),
      plumbingScenarios: restorePlumbingScenarioDraft(snapshot),
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
  const [tileScenarioDraft, setTileScenarioDraft] = useState<TileScenarioDraftState>(
    initial.tileScenarios,
  )
  const [electricScenarioDraft, setElectricScenarioDraft] = useState<ElectricScenarioDraftState>(
    initial.electricScenarios,
  )
  const [plumbingScenarioDraft, setPlumbingScenarioDraft] = useState<PlumbingScenarioDraftState>(
    initial.plumbingScenarios,
  )
  const [globalFeedbackEpoch, setGlobalFeedbackEpoch] = useState(0)

  const floors = useFloorEstimateEditor(initial.floors)
  const walls = useWallEstimateEditor(initial.walls)
  const ceilings = useCeilingEstimateEditor(initial.ceilings)
  const tile = useTileEstimateEditor(initial.tile)
  const electrics = useElectricEstimateEditor(initial.electrics)
  const plumbing = usePlumbingEstimateEditor(initial.plumbing)
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
        tileInput: tile.input,
        tileLines: tile.lines,
        electricInput: electrics.input,
        electricLines: electrics.lines,
        plumbingInput: plumbing.input,
        plumbingLines: plumbing.lines,
        floorPresets: floorPresetDraft,
        wallScenarios: wallScenarioDraft,
        ceilingScenarios: ceilingScenarioDraft,
        tileScenarios: tileScenarioDraft,
        electricScenarios: electricScenarioDraft,
        plumbingScenarios: plumbingScenarioDraft,
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
    tile.input,
    tile.lines,
    electrics.input,
    electrics.lines,
    plumbing.input,
    plumbing.lines,
    floorPresetDraft,
    wallScenarioDraft,
    ceilingScenarioDraft,
    tileScenarioDraft,
    electricScenarioDraft,
    plumbingScenarioDraft,
  ])

  function handleZonesChange(nextZones: EstimateZone[]) {
    const prevById = new Map(zones.map((zone) => [zone.id, zone]))
    for (const zone of nextZones) {
      const prev = prevById.get(zone.id)
      if (prev && prev.name !== zone.name) {
        floors.syncZoneName(zone.id, zone.name)
        walls.syncZoneName(zone.id, zone.name)
        ceilings.syncZoneName(zone.id, zone.name)
        tile.syncZoneName(zone.id, zone.name)
        electrics.syncZoneName(zone.id, zone.name)
        plumbing.syncZoneName(zone.id, zone.name)
      }
    }
    setZones(nextZones)
  }

  function handleDeleteZone(zoneId: string) {
    floors.removeLinesByZoneId(zoneId)
    walls.removeLinesByZoneId(zoneId)
    ceilings.removeLinesByZoneId(zoneId)
    tile.removeLinesByZoneId(zoneId)
    electrics.removeLinesByZoneId(zoneId)
    plumbing.removeLinesByZoneId(zoneId)
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
    setTileScenarioDraft({ ...DEFAULT_TILE_SCENARIOS })
    setElectricScenarioDraft({ ...DEFAULT_ELECTRIC_SCENARIOS })
    setPlumbingScenarioDraft({ ...DEFAULT_PLUMBING_SCENARIOS })
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
    tile.replaceEstimate({
      input: { ...EMPTY_TILE_INPUT },
      lines: buildTileEstimateLines(EMPTY_TILE_INPUT),
    })
    electrics.replaceEstimate({
      input: { ...EMPTY_ELECTRIC_INPUT },
      lines: buildElectricEstimateLines(EMPTY_ELECTRIC_INPUT),
    })
    plumbing.replaceEstimate({
      input: { ...EMPTY_PLUMBING_INPUT },
      lines: buildPlumbingEstimateLines(EMPTY_PLUMBING_INPUT),
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

  function resetTileSection() {
    tile.resetEstimate()
    setTileScenarioDraft({ ...DEFAULT_TILE_SCENARIOS })
  }

  function resetElectricsSection() {
    electrics.resetEstimate()
    setElectricScenarioDraft({ ...DEFAULT_ELECTRIC_SCENARIOS })
  }

  function resetPlumbingSection() {
    plumbing.resetEstimate()
    setPlumbingScenarioDraft({ ...DEFAULT_PLUMBING_SCENARIOS })
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
      {
        sectionId: TILE_SECTION_ID,
        sectionTitle: 'Плитка',
        lines: tile.lines,
        resolveGroupTitle: (line) =>
          getTileEstimateGroupTitle(resolveTileEstimateGroupId(line)),
      },
      {
        sectionId: ELECTRIC_SECTION_ID,
        sectionTitle: 'Электрика',
        lines: electrics.lines,
        resolveGroupTitle: (line) =>
          getElectricEstimateGroupTitle(resolveElectricEstimateGroupId(line)),
      },
      {
        sectionId: PLUMBING_SECTION_ID,
        sectionTitle: 'Сантехника',
        lines: plumbing.lines,
        resolveGroupTitle: (line) =>
          getPlumbingEstimateGroupTitle(resolvePlumbingEstimateGroupId(line)),
      },
    ])
    return attachZonesToSelectedSections(sections, zoneNameById)
  }, [
    floors.lines,
    walls.lines,
    ceilings.lines,
    tile.lines,
    electrics.lines,
    plumbing.lines,
    zoneNameById,
  ])

  const grandTotalRub = useMemo(
    () =>
      calculateEstimateTotal([
        { id: FLOOR_SECTION_ID, title: FLOOR_SECTION_TITLE, lines: floors.lines },
        { id: WALL_SECTION_ID, title: WALL_SECTION_TITLE, lines: walls.lines },
        { id: CEILING_SECTION_ID, title: CEILING_SECTION_TITLE, lines: ceilings.lines },
        { id: TILE_SECTION_ID, title: TILE_SECTION_TITLE, lines: tile.lines },
        { id: ELECTRIC_SECTION_ID, title: ELECTRIC_SECTION_TITLE, lines: electrics.lines },
        { id: PLUMBING_SECTION_ID, title: PLUMBING_SECTION_TITLE, lines: plumbing.lines },
      ]),
    [floors.lines, walls.lines, ceilings.lines, tile.lines, electrics.lines, plumbing.lines],
  )

  return (
    <div className={styles.workspace}>
      <div className={styles.zone}>
        <EstimateIntro
          floorsSelectedCount={floors.selectedCount}
          wallsSelectedCount={walls.selectedCount}
          ceilingsSelectedCount={ceilings.selectedCount}
          tileSelectedCount={tile.selectedCount}
          electricsSelectedCount={electrics.selectedCount}
          plumbingSelectedCount={plumbing.selectedCount}
          floorsTotalRub={floors.totalRub}
          wallsTotalRub={walls.totalRub}
          ceilingsTotalRub={ceilings.totalRub}
          tileTotalRub={tile.totalRub}
          electricsTotalRub={electrics.totalRub}
          plumbingTotalRub={plumbing.totalRub}
          grandTotalRub={grandTotalRub}
          floorsMappingCount={FLOOR_PRICE_MAPPING.length}
          wallsMappingCount={WALL_PRICE_MAPPING.length}
          ceilingsMappingCount={CEILING_PRICE_MAPPING.length}
          tileMappingCount={TILE_PRICE_MAPPING.length}
          electricsMappingCount={ELECTRIC_PRICE_MAPPING.length}
          plumbingMappingCount={PLUMBING_PRICE_MAPPING.length}
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

      <div
        id="estimate-panel-tile"
        role="tabpanel"
        aria-labelledby="estimate-tab-tile"
        hidden={activeTab !== 'tile'}
      >
        <TileEstimatePanel
          editor={tile}
          zones={zones}
          onZonesChange={handleZonesChange}
          onDeleteZone={handleDeleteZone}
          scenarioDraft={tileScenarioDraft}
          onScenarioDraftChange={(patch) =>
            setTileScenarioDraft((prev) => ({ ...prev, ...patch }))
          }
          onResetSection={resetTileSection}
          globalFeedbackEpoch={globalFeedbackEpoch}
        />
      </div>

      <div
        id="estimate-panel-electrics"
        role="tabpanel"
        aria-labelledby="estimate-tab-electrics"
        hidden={activeTab !== 'electrics'}
      >
        <ElectricEstimatePanel
          editor={electrics}
          zones={zones}
          onZonesChange={handleZonesChange}
          onDeleteZone={handleDeleteZone}
          scenarioDraft={electricScenarioDraft}
          onScenarioDraftChange={(patch) =>
            setElectricScenarioDraft((prev) => ({ ...prev, ...patch }))
          }
          onResetSection={resetElectricsSection}
          globalFeedbackEpoch={globalFeedbackEpoch}
        />
      </div>

      <div
        id="estimate-panel-plumbing"
        role="tabpanel"
        aria-labelledby="estimate-tab-plumbing"
        hidden={activeTab !== 'plumbing'}
      >
        <PlumbingEstimatePanel
          editor={plumbing}
          zones={zones}
          onZonesChange={handleZonesChange}
          onDeleteZone={handleDeleteZone}
          scenarioDraft={plumbingScenarioDraft}
          onScenarioDraftChange={(patch) =>
            setPlumbingScenarioDraft((prev) => ({ ...prev, ...patch }))
          }
          onResetSection={resetPlumbingSection}
          globalFeedbackEpoch={globalFeedbackEpoch}
        />
      </div>

      <div className={styles.zone}>
        <EstimateCombinedSummary sections={selectedSections} grandTotalRub={grandTotalRub} />
      </div>
    </div>
  )
}
