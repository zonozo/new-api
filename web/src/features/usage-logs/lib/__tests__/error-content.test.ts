/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import type { UsageLog } from '../../data/schema'
import { renderLogContent } from '../format'

const baseLog: UsageLog = {
  id: 1,
  user_id: 1,
  created_at: 0,
  type: 5,
  content: 'Key invalid',
  username: '',
  token_name: '',
  model_name: '',
  quota: 0,
  prompt_tokens: 0,
  completion_tokens: 0,
  use_time: 0,
  is_stream: false,
  channel: 0,
  channel_name: '',
  token_id: 0,
  group: '',
  ip: '',
  other: '',
  request_id: '',
  upstream_request_id: '',
}

describe('usage log error content', () => {
  test('localizes standardized errors returned to regular users', () => {
    const translated = renderLogContent(
      baseLog,
      { error_type: 'standard_error', error_code: 'KEY_INVALID' },
      (key) => `translated:${key}`
    )

    assert.equal(translated, 'translated:Key invalid')
  })

  test('preserves original upstream errors returned to privileged users', () => {
    const rawLog = {
      ...baseLog,
      content: 'upstream provider raw failure detail',
    }
    const rendered = renderLogContent(
      rawLog,
      { error_type: 'openai_error', error_code: 'insufficient_quota' },
      (key) => `translated:${key}`
    )

    assert.equal(rendered, rawLog.content)
  })
})
