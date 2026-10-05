import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Buffer } from 'node:buffer'
import { build } from 'esbuild'
import { resolveRoomFootprintSketch } from '../src/entities/estimate/model/shared/room-footprint-sketch.ts'

const bundle = await build({ entryPoints: ['src/entities/estimate/model/shared/wall-measurements.ts'],
  bundle: true, platform: 'node', format: 'esm', write: false })
const { calculateWallMeasurements, createRectangularWalls, relinkRectangularWalls, roomFootprintArea, roomFootprintPerimeter, syncRoomFootprintAreas, updateRoomDimensions } =
  await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`)

test('четыре стены и проёмы дают проверяемую площадь и отдельные откосы', () => {
  const walls = createRectangularWalls(4, 3, 2.7)
  walls[0].openings = [{ id: 'window', kind: 'window', widthM: 1.2, heightM: 1.5, count: 2, deduct: true, finishSlopes: true, slopeSides: 3 }]
  walls[1].openings = [{ id: 'door', kind: 'door', widthM: 0.9, heightM: 2.1, count: 1, deduct: true, finishSlopes: true, slopeSides: 3 }]
  const result = calculateWallMeasurements({ roomLengthM: 4, roomWidthM: 3, roomHeightM: 2.7, walls })
  assert.deepEqual(result, { grossArea: 37.8, deductedArea: 5.49, netArea: 32.31, slopesLength: 13.5, errors: [] })
})

test('откосы не попадают в расчёт без явного выбора; можно оставить проём без вычета', () => {
  const walls = createRectangularWalls(4, 3, 2.7)
  walls[0].openings = [{ id: 'window', kind: 'window', widthM: 1, heightM: 1, count: 1, deduct: false, finishSlopes: false, slopeSides: 3 }]
  const result = calculateWallMeasurements({ roomLengthM: 4, roomWidthM: 3, roomHeightM: 2.7, walls })
  assert.equal(result.netArea, 37.8)
  assert.equal(result.slopesLength, 0)
})

test('неполные и физически невозможные замеры не считаются готовыми', () => {
  const walls = createRectangularWalls(4, 3, 2.7)
  walls[0].openings = [{ id: 'large', kind: 'window', widthM: 5, heightM: 2, count: 1, deduct: true, finishSlopes: false, slopeSides: 3 }]
  assert.match(calculateWallMeasurements({ roomLengthM: 4, roomWidthM: 3, roomHeightM: 2.7, walls }).errors.join(' '), /превышают/)
  walls[0].openings = [{ id: 'incomplete', kind: 'door', widthM: 0, heightM: 2, count: 1, deduct: true, finishSlopes: false, slopeSides: 3 }]
  assert.match(calculateWallMeasurements({ roomLengthM: 4, roomWidthM: 3, roomHeightM: 2.7, walls }).errors.join(' '), /укажите/)
})

test('четвёртая сторона откоса добавляет ширину только выбранного проёма', () => {
  const walls = createRectangularWalls(5, 4, 2.7)
  walls[0].openings = [{ id: 'window', kind: 'window', widthM: 1.5, heightM: 1.2, count: 1, deduct: true, finishSlopes: true, slopeSides: 4 }]
  const result = calculateWallMeasurements({ roomLengthM: 5, roomWidthM: 4, roomHeightM: 2.7, walls })
  assert.equal(result.netArea, 46.8)
  assert.equal(result.slopesLength, 5.4)
})


test('габариты комнаты обновляют только связанные стены, ручной замер остаётся', () => {
  const walls = createRectangularWalls(5, 4, 2.7)
  walls[0].openings = [{ id: 'window', kind: 'window', widthM: 1.5, heightM: 1.2, count: 1, deduct: true, finishSlopes: false, slopeSides: 3 }]
  walls[1].lengthM = 4.4
  walls[1].lengthSource = undefined
  const next = updateRoomDimensions({ roomLengthM: 5, roomWidthM: 4, roomHeightM: 2.7, walls }, {
    roomLengthM: 6, roomWidthM: 5, roomHeightM: 3,
  })
  assert.deepEqual(next.walls.map((wall) => wall.lengthM), [6, 4.4, 6, 5])
  assert.deepEqual(next.walls.map((wall) => wall.heightM), [3, 3, 3, 3])
  assert.equal(next.walls[0].openings[0].widthM, 1.5)
  assert.equal(calculateWallMeasurements(next).netArea, 62.4)
})

test('повторная привязка четырёх стен сохраняет проёмы', () => {
  const walls = createRectangularWalls(5, 4, 2.7)
  walls[0].openings = [{ id: 'window', kind: 'window', widthM: 1, heightM: 1, count: 1, deduct: true, finishSlopes: false, slopeSides: 3 }]
  const measurements = { roomLengthM: 6, roomWidthM: 5, roomHeightM: 3, walls }
  const next = relinkRectangularWalls(measurements)
  assert.deepEqual(next.walls.map((wall) => wall.lengthM), [6, 5, 6, 5])
  assert.equal(next.walls[0].openings[0].id, 'window')
  assert.equal(calculateWallMeasurements(next).netArea, 65)
})

test('площадь комнаты автоматически заполняет пол и потолок, но сохраняет ручную правку', () => {
  const initial = { roomLengthM: 4, roomWidthM: 3, roomHeightM: 2.7, walls: [] }
  const first = syncRoomFootprintAreas(initial, initial, 0, 0)
  assert.equal(first.floorArea, 12)
  assert.equal(first.ceilingArea, 12)
  const resized = updateRoomDimensions(first.measurements, { roomLengthM: 5 })
  const second = syncRoomFootprintAreas(first.measurements, resized, 12, 10)
  assert.equal(second.floorArea, 15)
  assert.equal(second.ceilingArea, undefined)
  assert.equal(second.measurements.autoFootprintArea, 15)
  const temporaryEmpty = updateRoomDimensions(second.measurements, { roomLengthM: 0 })
  const emptyResult = syncRoomFootprintAreas(second.measurements, temporaryEmpty, 15, 10)
  assert.equal(emptyResult.measurements.autoFootprintArea, 15)
  const restored = syncRoomFootprintAreas(emptyResult.measurements, updateRoomDimensions(temporaryEmpty, { roomLengthM: 6 }), 15, 10)
  assert.equal(restored.floorArea, 18)
  assert.equal(restored.ceilingArea, undefined)
})

test('непрямоугольный контур из шести точек даёт площадь и периметр, не зависящие от числа стен', () => {
  const initial = { roomLengthM: 4, roomWidthM: 4, roomHeightM: 2.7, walls: [], autoFootprintArea: 16 }
  const shape = { ...initial, footprintVertices: [
    [0, 0], [4, 0], [4, 2], [2, 2], [2, 4], [0, 4],
  ].map(([xM, yM], index) => ({ id: String(index), xM, yM })) }
  assert.equal(roomFootprintArea(shape), 12)
  assert.equal(roomFootprintPerimeter(shape), 16)
  const synced = syncRoomFootprintAreas(initial, shape, 16, 16)
  assert.equal(synced.floorArea, 12)
  assert.equal(synced.ceilingArea, 12)
  assert.equal(syncRoomFootprintAreas(initial, shape, 10, 16).floorArea, undefined)
})

test('самопересекающийся контур не сохраняет прежнюю автоматическую площадь прямоугольника', () => {
  const initial = { roomLengthM: 4, roomWidthM: 3, roomHeightM: 2.7, walls: [] }
  const shape = { ...initial, footprintVertices: [
    [0, 0], [4, 3], [0, 3], [4, 0],
  ].map(([xM, yM], index) => ({ id: String(index), xM, yM })) }
  assert.equal(roomFootprintArea(shape), null)
  assert.equal(syncRoomFootprintAreas(initial, shape, 12, 12).floorArea, 0)
})

test('дополнительные стены не сбрасывают площадь по габаритам; одна ниша или выступ уточняет её', () => {
  const initial = { roomLengthM: 4, roomWidthM: 3, roomHeightM: 2.7,
    autoFootprintArea: 12, walls: createRectangularWalls(4, 3, 2.7) }
  const next = { ...initial, walls: [...initial.walls, { ...initial.walls[0], id: 'fifth' }] }
  assert.equal(roomFootprintArea(next), 12)
  assert.equal(roomFootprintPerimeter(next), 14)
  const result = syncRoomFootprintAreas(initial, next, 12, 10)
  assert.equal(result.floorArea, 12)
  assert.equal(result.ceilingArea, undefined)
  const cutout = { ...next, footprintAdjustment: { kind: 'cutout', widthM: 1, depthM: 1 } }
  assert.equal(roomFootprintArea(cutout), 11)
  assert.equal(roomFootprintPerimeter(cutout), 18)
  const cutoutResult = syncRoomFootprintAreas(next, cutout, 12, 12)
  assert.equal(cutoutResult.floorArea, 11)
  const extension = { ...next, footprintAdjustment: { kind: 'extension', widthM: 1, depthM: 1 } }
  assert.equal(roomFootprintArea(extension), 13)
  assert.equal(roomFootprintPerimeter(extension), 18)
  assert.equal(syncRoomFootprintAreas(cutoutResult.measurements, extension, 11, 10).floorArea, 13)
  assert.equal(roomFootprintArea({ ...next, footprintAdjustment: { kind: 'cutout', widthM: 4, depthM: 1 } }), null)
})

test('скошенный угол и несколько простых частей дают площадь без координат; периметр берётся из стен', () => {
  const initial = { roomLengthM: 8, roomWidthM: 4, roomHeightM: 2.7,
    walls: [8, 4, 5, Math.hypot(3, 2.5), 1.5].map((lengthM, index) => ({
      id: String(index), name: 'Стена', lengthM, heightM: 2.7, openings: [],
    })) }
  const clipped = { ...initial, footprintParts: [
    { id: 'a', shape: 'triangle', operation: 'subtract', widthM: 3, heightM: 2.5 },
  ] }
  assert.equal(roomFootprintArea(clipped), 28.25)
  assert.equal(roomFootprintPerimeter(clipped), 22.41)
  const extended = { ...clipped, footprintParts: [...clipped.footprintParts,
    { id: 'b', shape: 'rectangle', operation: 'add', widthM: 2, heightM: 1 },
    { id: 'c', shape: 'rectangle', operation: 'subtract', widthM: 1, heightM: 1 },
  ] }
  assert.equal(roomFootprintArea(extended), 29.25)
  assert.equal(roomFootprintArea({ ...clipped, footprintParts: [
    { id: 'a', shape: 'rectangle', operation: 'subtract', widthM: 8, heightM: 4 },
  ] }), null)
  assert.equal(roomFootprintArea({ ...clipped, footprintKnownArea: 30 }), 30)
  assert.equal(roomFootprintArea({ ...clipped, footprintKnownArea: 0 }), null)
  assert.equal(roomFootprintPerimeter({ ...clipped, walls: [] }), null)
})

const sketchRoom = { roomLengthM: 8, roomWidthM: 4, roomHeightM: 2.7, walls: [] }
const sketchPart = (patch = {}) => ({ id: 'part', shape: 'rectangle', operation: 'subtract',
  widthM: 1, heightM: 1, position: 'top-left', offsetM: 0, ...patch })

test('схема скошенного угла соответствует виду сверху и площади', () => {
  const measurements = { ...sketchRoom, footprintParts: [sketchPart({ shape: 'triangle', widthM: 3, heightM: 2.5 })] }
  const sketch = resolveRoomFootprintSketch(measurements)
  assert.deepEqual(sketch.parts[0].points, [{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 0, y: 2.5 }])
  assert.deepEqual(sketch.errors, [])
  assert.deepEqual(sketch.pending, [])
  assert.equal(roomFootprintArea(measurements), 28.25)
})

test('части можно сдвигать вдоль стороны; выступы и вырезы проверяются по габаритам', () => {
  const measurements = { ...sketchRoom, footprintParts: [sketchPart({ operation: 'add', position: 'bottom',
    offsetM: 2, widthM: 3, heightM: 2 })] }
  assert.deepEqual(resolveRoomFootprintSketch(measurements).parts[0].points,
    [{ x: 2, y: 4 }, { x: 5, y: 4 }, { x: 5, y: 6 }, { x: 2, y: 6 }])
  assert.equal(roomFootprintArea(measurements), 38)
  for (const patch of [
    { operation: 'add', position: 'bottom', offsetM: 7, widthM: 2 },
    { position: 'right', offsetM: 4, heightM: 2 },
    { widthM: 9 }, { offsetM: -1 },
  ]) {
    const invalid = { ...sketchRoom, footprintParts: [sketchPart(patch)] }
    assert.ok(resolveRoomFootprintSketch(invalid).errors.length)
    assert.equal(roomFootprintArea(invalid), null)
  }
})

test('перекрытие частей не удваивает площадь; касание допустимо', () => {
  const measurements = { ...sketchRoom, footprintParts: [sketchPart({ widthM: 3, heightM: 2 }),
    sketchPart({ id: 'second', position: 'top', offsetM: 2, widthM: 2 })] }
  assert.match(resolveRoomFootprintSketch(measurements).errors.join(' '), /перекрываются/)
  assert.equal(roomFootprintArea(measurements), null)
  assert.equal(syncRoomFootprintAreas(sketchRoom, measurements, 32, 32).floorArea, 0)
  assert.equal(syncRoomFootprintAreas(sketchRoom, measurements, 31, 32).floorArea, undefined)
  measurements.footprintParts[1].offsetM = 3
  assert.deepEqual(resolveRoomFootprintSketch(measurements).errors, [])
  assert.equal(roomFootprintArea(measurements), 24)
})

test('старые части без расположения сохраняют площадь и просят уточнить схему', () => {
  const measurements = { ...sketchRoom, footprintParts: [sketchPart({ position: undefined })] }
  assert.equal(roomFootprintArea(measurements), 31)
  assert.deepEqual(resolveRoomFootprintSketch(measurements).parts, [])
  assert.match(resolveRoomFootprintSketch(measurements).pending.join(' '), /расположение/)
})

test('все четыре скошенных угла и боковые выступы ориентированы правильно', () => {
  for (const [position, expected] of [
    ['top-left', [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }]],
    ['top-right', [{ x: 8, y: 0 }, { x: 6, y: 0 }, { x: 8, y: 1 }]],
    ['bottom-left', [{ x: 0, y: 4 }, { x: 2, y: 4 }, { x: 0, y: 3 }]],
    ['bottom-right', [{ x: 8, y: 4 }, { x: 6, y: 4 }, { x: 8, y: 3 }]],
  ]) {
    const measurements = { ...sketchRoom, footprintParts: [sketchPart({ shape: 'triangle', widthM: 2, position })] }
    assert.deepEqual(resolveRoomFootprintSketch(measurements).parts[0].points, expected)
    assert.equal(roomFootprintArea(measurements), 31)
  }
  for (const position of ['top', 'bottom', 'left', 'right']) {
    const measurements = { ...sketchRoom, footprintParts: [sketchPart({ operation: 'add', position, offsetM: 1 })] }
    assert.deepEqual(resolveRoomFootprintSketch(measurements).errors, [])
    assert.equal(roomFootprintArea(measurements), 33)
  }
})
