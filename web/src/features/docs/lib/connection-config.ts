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
import type { SystemStatus } from '@/features/auth/types'

export type ApiEndpoints = {
  openAI: string
  anthropic: string
  gemini: string
}

export function getServerAddress(
  status: SystemStatus | null,
  fallbackOrigin: string
): string {
  const candidates = [
    status?.server_address,
    status?.serverAddress,
    status?.data?.server_address,
    status?.data?.serverAddress,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }
  }

  return fallbackOrigin
}

export function getApiEndpoints(serverAddress: string): ApiEndpoints {
  const platformOrigin = serverAddress.replace(/\/+$/, '')

  return {
    openAI: `${platformOrigin}/v1`,
    anthropic: platformOrigin,
    gemini: platformOrigin,
  }
}

export function buildChatCompletionCurl(serverAddress: string): string {
  const endpoints = getApiEndpoints(serverAddress)

  return `export NEW_API_KEY="sk-your-api-key"

curl ${endpoints.openAI}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $NEW_API_KEY" \\
  -d '{
    "model": "your-model-id",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`
}
