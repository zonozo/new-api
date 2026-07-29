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

import {
  buildChatCompletionCurl,
  getApiEndpoints,
  getServerAddress,
} from '../connection-config'

describe('documentation connection configuration', () => {
  test('derives protocol base URLs from the current platform origin', () => {
    assert.deepEqual(getApiEndpoints('https://api.example.com/'), {
      openAI: 'https://api.example.com/v1',
      anthropic: 'https://api.example.com',
      gemini: 'https://api.example.com',
    })
  })

  test('prefers the configured server address over the page origin', () => {
    assert.equal(
      getServerAddress(
        { server_address: 'https://gateway.example.com/' },
        'https://dashboard.example.com'
      ),
      'https://gateway.example.com/'
    )
  })

  test('supports a nested camel-case server address', () => {
    assert.equal(
      getServerAddress(
        {
          server_address: '   ',
          data: { serverAddress: 'https://gateway.example.com' },
        },
        'https://dashboard.example.com'
      ),
      'https://gateway.example.com'
    )
  })

  test('falls back to the page origin when the configured address is empty', () => {
    assert.equal(
      getServerAddress(
        { server_address: '   ' },
        'https://dashboard.example.com/'
      ),
      'https://dashboard.example.com/'
    )
  })

  test('builds a first request that targets the OpenAI-compatible endpoint', () => {
    const command = buildChatCompletionCurl('https://api.example.com')

    assert.match(command, /https:\/\/api\.example\.com\/v1\/chat\/completions/)
    assert.match(command, /export NEW_API_KEY="sk-your-api-key"/)
    assert.match(command, /Authorization: Bearer \$NEW_API_KEY/)
    assert.match(command, /"model": "your-model-id"/)
  })
})
