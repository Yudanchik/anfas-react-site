import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ESTIMATE_STATUS_SUCCESS_CLEAR_MS } from './use-estimate-status-message'

describe('estimate status message lifecycle constants', () => {
  it('uses a short auto-clear window for success/info feedback', () => {
    assert.equal(ESTIMATE_STATUS_SUCCESS_CLEAR_MS, 4500)
    assert.ok(ESTIMATE_STATUS_SUCCESS_CLEAR_MS >= 4000)
    assert.ok(ESTIMATE_STATUS_SUCCESS_CLEAR_MS <= 5000)
  })
})
