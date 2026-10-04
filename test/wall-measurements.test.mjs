import assert from 'node:assert/strict'
import { test } from 'node:test'
import { calculateWallMeasurements, createRectangularWalls, relinkRectangularWalls, roomFootprintArea, roomFootprintPerimeter, syncRoomFootprintAreas, updateRoomDimensions } from '../src/entities/estimate/model/shared/wall-measurements.ts'

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

test('пятая стена без контура сбрасывает только прежнюю автоматическую площадь прямоугольника', () => {
  const initial = { roomLengthM: 4, roomWidthM: 3, roomHeightM: 2.7,
    autoFootprintArea: 12, walls: createRectangularWalls(4, 3, 2.7) }
  const next = { ...initial, walls: [...initial.walls, { ...initial.walls[0], id: 'fifth' }] }
  assert.equal(roomFootprintArea(next), null)
  assert.equal(roomFootprintPerimeter(next), null)
  const result = syncRoomFootprintAreas(initial, next, 12, 10)
  assert.equal(result.floorArea, 0)
  assert.equal(result.ceilingArea, undefined)
})
