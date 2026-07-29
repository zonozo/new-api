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
import type { TFunction } from 'i18next'

import type { ApiEndpoints } from './lib/connection-config'

export type ClientGuide = {
  id: string
  name: string
  description: string
  compatibility: 'direct' | 'limited' | 'manager'
  installCode?: string
  installUrl: string
  configCode?: string
  instructions: string[]
  note: string
}

export function buildClientGuides(
  endpoints: ApiEndpoints,
  t: TFunction
): ClientGuide[] {
  return [
    {
      id: 'cc-switch',
      name: 'CC Switch',
      description: t(
        'CC Switch centrally manages provider configurations for Claude Code, Codex, and Gemini CLI, so you can switch endpoints, API keys, and models without editing each config file manually.'
      ),
      compatibility: 'manager',
      installUrl: 'https://ccswitch.io',
      instructions: [
        t(
          'Download and install CC Switch from the official website, then open it once to register the ccswitch:// link.'
        ),
        t(
          'Open API keys, open the actions menu for the API key you want to use, and select CC Switch.'
        ),
        t(
          'Choose Claude, Codex, or Gemini, enter a provider name, and select the model to import.'
        ),
        t(
          'Select Open CC Switch, allow the browser to open the app, then confirm and enable the imported provider.'
        ),
      ],
      note: t(
        'The API keys page supports one-click import to CC Switch. If the app does not open, make sure CC Switch is installed and your browser allows ccswitch:// links.'
      ),
    },
    {
      id: 'claude-code',
      name: 'Claude Code',
      description: t(
        'Anthropic’s terminal coding agent. Connect it through the platform’s Anthropic-compatible endpoint.'
      ),
      compatibility: 'direct',
      installUrl: 'https://code.claude.com/docs/en/setup',
      installCode: `# macOS / Linux
curl -fsSL https://claude.ai/install.sh | bash

# Windows PowerShell
irm https://claude.ai/install.ps1 | iex`,
      configCode: `# macOS / Linux
export ANTHROPIC_BASE_URL="${endpoints.anthropic}"
export ANTHROPIC_AUTH_TOKEN="sk-your-api-key"
claude

# Windows PowerShell
$env:ANTHROPIC_BASE_URL="${endpoints.anthropic}"
$env:ANTHROPIC_AUTH_TOKEN="sk-your-api-key"
claude`,
      instructions: [
        t('Install Claude Code with the command for your operating system.'),
        t(
          'Set both environment variables in the terminal where you run Claude Code.'
        ),
        t(
          'Start claude and select a model that is available on this platform.'
        ),
      ],
      note: t(
        'Use the platform root URL for ANTHROPIC_BASE_URL. Claude Code adds the /v1/messages path itself.'
      ),
    },
    {
      id: 'claude-desktop',
      name: 'Claude Desktop',
      description: t(
        'Anthropic’s desktop chat app. It can install MCP tools, but it does not expose a custom model API base URL.'
      ),
      compatibility: 'limited',
      installUrl: 'https://claude.ai/download',
      instructions: [
        t(
          'Download and install Claude Desktop from the official download page.'
        ),
        t('Sign in with a Claude account to use its built-in chat service.'),
        t(
          'Use Claude Code, Codex, OpenCode, or another compatible client for this platform API.'
        ),
      ],
      note: t(
        'Claude Desktop MCP configuration only adds tools. It does not replace the built-in Claude model provider with this platform.'
      ),
    },
    {
      id: 'codex',
      name: 'Codex',
      description: t(
        'OpenAI’s coding agent. A custom provider in config.toml can use the platform’s Responses API.'
      ),
      compatibility: 'direct',
      installUrl: 'https://developers.openai.com/codex/cli',
      installCode: `npm install -g @openai/codex`,
      configCode: `# ~/.codex/config.toml
model_provider = "custom"
model = "your-model-id"
model_reasoning_effort = "high"
disable_response_storage = true

[model_providers.custom]
name = "My Codex"
base_url = "${endpoints.openAI}"
wire_api = "responses"
requires_openai_auth = true

# ~/.codex/auth.json
{
  "OPENAI_API_KEY": ""
}

# macOS / Linux
export OPENAI_API_KEY="sk-your-api-key"

# Windows PowerShell
$env:OPENAI_API_KEY="sk-your-api-key"`,
      instructions: [
        t(
          'Install Codex with npm, then create or edit config.toml and auth.json in ~/.codex.'
        ),
        t('Replace your-model-id with an exact model ID from Model Square.'),
        t('Set OPENAI_API_KEY in auth.json before starting codex.'),
      ],
      note: t(
        'Choose a model that supports the Responses API and tool calling for the best Codex experience.'
      ),
    },
    {
      id: 'gemini-cli',
      name: 'Gemini CLI',
      description: t(
        'Google’s terminal agent. Recent versions can target a custom Gemini API base URL.'
      ),
      compatibility: 'direct',
      installUrl: 'https://github.com/google-gemini/gemini-cli',
      installCode: `npm install -g @google/gemini-cli`,
      configCode: `# macOS / Linux
export GEMINI_API_KEY="sk-your-api-key"
export GOOGLE_GEMINI_BASE_URL="${endpoints.gemini}"
gemini

# Windows PowerShell
$env:GEMINI_API_KEY="sk-your-api-key"
$env:GOOGLE_GEMINI_BASE_URL="${endpoints.gemini}"
gemini`,
      instructions: [
        t('Install the latest Gemini CLI with npm.'),
        t('Set the API key and Gemini base URL in the same terminal session.'),
        t('Select an available Gemini model and run a short test prompt.'),
      ],
      note: t(
        'This connection requires a recent Gemini CLI and the platform’s native Gemini /v1beta routes. If your CLI ignores the custom base URL, use OpenCode instead.'
      ),
    },
    {
      id: 'opencode',
      name: 'OpenCode',
      description: t(
        'An open-source coding agent with first-class support for custom OpenAI-compatible providers.'
      ),
      compatibility: 'direct',
      installUrl: 'https://opencode.ai/docs',
      installCode: `curl -fsSL https://opencode.ai/install | bash

# Or install with npm
npm install -g opencode-ai`,
      configCode: `// opencode.json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "newapi": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "New API",
      "options": {
        "baseURL": "${endpoints.openAI}",
        "apiKey": "{env:NEW_API_KEY}"
      },
      "models": {
        "your-model-id": {
          "name": "your-model-id"
        }
      }
    }
  },
  "model": "newapi/your-model-id"
}`,
      instructions: [
        t(
          'Install OpenCode, then add opencode.json to your project or user config directory.'
        ),
        t(
          'Set NEW_API_KEY in your environment and replace both model placeholders.'
        ),
        t('Run opencode in your project directory.'),
      ],
      note: t(
        'Keep the provider ID and the model prefix aligned: newapi/your-model-id refers to the newapi provider block above.'
      ),
    },
    {
      id: 'openclaw',
      name: 'OpenClaw',
      description: t(
        'A personal AI assistant that can connect to messaging channels and OpenAI-compatible model providers.'
      ),
      compatibility: 'direct',
      installUrl: 'https://docs.openclaw.ai',
      installCode: `# Node.js 22 or newer is required
npm install -g openclaw@latest
openclaw onboard --install-daemon`,
      configCode: `# In the onboarding wizard, choose:
Provider: Custom / OpenAI-compatible
Base URL: ${endpoints.openAI}
API key: sk-your-api-key
Model ID: your-model-id`,
      instructions: [
        t('Install Node.js 22 or newer, then install OpenClaw globally.'),
        t(
          'Run the onboarding wizard and choose a custom OpenAI-compatible provider.'
        ),
        t('Enter the platform base URL, API key, and an exact model ID.'),
      ],
      note: t(
        'Finish the channel and daemon steps only after the model test succeeds. On Windows, WSL2 is the most predictable setup.'
      ),
    },
    {
      id: 'hermes',
      name: 'Hermes Agent',
      description: t(
        'Nous Research’s agent CLI. Its setup wizard supports custom OpenAI-compatible endpoints.'
      ),
      compatibility: 'direct',
      installUrl: 'https://github.com/NousResearch/hermes-agent',
      installCode: `curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
hermes setup`,
      configCode: `# In hermes setup, choose the custom OpenAI-compatible option
Base URL: ${endpoints.openAI}
API key: sk-your-api-key
Model: your-model-id

hermes`,
      instructions: [
        t(
          'Run the official installer on macOS, Linux, or WSL2, then start hermes setup.'
        ),
        t('Choose the custom OpenAI-compatible provider when prompted.'),
        t(
          'Enter the platform connection details and verify with a simple prompt.'
        ),
      ],
      note: t(
        'Wizard labels may differ slightly by Hermes version. Choose the option that asks for an OpenAI-compatible base URL.'
      ),
    },
  ]
}
