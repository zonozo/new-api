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

import type { TFunction } from 'i18next'

import { buildClientGuides } from '../../client-guide-data'
import { getApiEndpoints } from '../connection-config'

const translate = ((key: string) => key) as TFunction

describe('documentation client guides', () => {
  const guides = buildClientGuides(
    getApiEndpoints('https://api.example.com'),
    translate
  )

  test('covers every client promised by the beginner guide', () => {
    assert.deepEqual(
      guides.map((guide) => guide.name),
      [
        'CC Switch',
        'Claude Code',
        'Claude Desktop',
        'Codex',
        'Gemini CLI',
        'OpenCode',
        'OpenClaw',
        'Hermes Agent',
      ]
    )
  })

  test('places CC Switch first and explains the one-click key import flow', () => {
    const ccSwitch = guides[0]

    assert.equal(ccSwitch?.id, 'cc-switch')
    assert.equal(ccSwitch?.compatibility, 'manager')
    assert.match(
      ccSwitch?.description ?? '',
      /Claude Code, Codex, and Gemini CLI/
    )
    assert.match(ccSwitch?.instructions.join(' ') ?? '', /Open API keys/)
    assert.match(ccSwitch?.note ?? '', /API keys page.*one-click import/)
  })

  test('uses the Anthropic base URL and documents the Claude Desktop limitation', () => {
    const claudeCode = guides.find((guide) => guide.id === 'claude-code')
    const claudeDesktop = guides.find((guide) => guide.id === 'claude-desktop')

    assert.match(
      claudeCode?.configCode ?? '',
      /ANTHROPIC_BASE_URL="https:\/\/api\.example\.com"/
    )
    assert.equal(claudeDesktop?.compatibility, 'limited')
    assert.equal(claudeDesktop?.configCode, undefined)
  })

  test('documents the Codex custom provider and auth file configuration', () => {
    const codex = guides.find((guide) => guide.id === 'codex')

    assert.equal(
      codex?.configCode,
      `# ~/.codex/config.toml
model_provider = "custom"
model = "your-model-id"
model_reasoning_effort = "high"
disable_response_storage = true

[model_providers.custom]
name = "My Codex"
base_url = "https://api.example.com/v1"
wire_api = "responses"
requires_openai_auth = true

# ~/.codex/auth.json
{
  "OPENAI_API_KEY": ""
}

# macOS / Linux
export OPENAI_API_KEY="sk-your-api-key"

# Windows PowerShell
$env:OPENAI_API_KEY="sk-your-api-key"`
    )
    assert.deepEqual(codex?.instructions, [
      'Install Codex with npm, then create or edit config.toml and auth.json in ~/.codex.',
      'Replace your-model-id with an exact model ID from Model Square.',
      'Set OPENAI_API_KEY in auth.json before starting codex.',
    ])
  })
})
