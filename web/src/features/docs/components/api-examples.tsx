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
import { useTranslation } from 'react-i18next'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  buildChatCompletionCurl,
  type ApiEndpoints,
} from '../lib/connection-config'
import { CodeBlock } from './code-block'

type ApiExamplesProps = {
  serverAddress: string
  endpoints: ApiEndpoints
}

export function ApiExamples(props: ApiExamplesProps) {
  const { t } = useTranslation()
  const curlExample = buildChatCompletionCurl(props.serverAddress)
  const powershellExample = `$env:NEW_API_KEY = "sk-your-api-key"

$headers = @{
  Authorization = "Bearer $env:NEW_API_KEY"
}

$body = @{
  model = "your-model-id"
  messages = @(
    @{ role = "user"; content = "Hello!" }
  )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "${props.endpoints.openAI}/chat/completions" -Method Post -Headers $headers -ContentType "application/json" -Body $body`
  const pythonExample = `# pip install openai
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["NEW_API_KEY"],
    base_url="${props.endpoints.openAI}",
)

response = client.chat.completions.create(
    model="your-model-id",
    messages=[{"role": "user", "content": "Hello!"}],
)

print(response.choices[0].message.content)`
  const javascriptExample = `// npm install openai
import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.NEW_API_KEY,
  baseURL: "${props.endpoints.openAI}",
})

const response = await client.chat.completions.create({
  model: "your-model-id",
  messages: [{ role: "user", content: "Hello!" }],
})

console.log(response.choices[0].message.content)`

  return (
    <section id='first-request' className='scroll-mt-24'>
      <div className='mb-6 flex flex-col gap-2'>
        <p className='text-primary text-sm font-medium'>
          {t('Make your first request')}
        </p>
        <h2 className='text-2xl font-semibold tracking-tight md:text-3xl'>
          {t('Verify the key before configuring an app')}
        </h2>
        <p className='text-muted-foreground max-w-2xl leading-7'>
          {t(
            'Replace the example key and model ID, then run one of the examples below. A successful response confirms your account, key, model, and endpoint.'
          )}
        </p>
      </div>

      <Tabs defaultValue='curl'>
        <TabsList>
          <TabsTrigger value='curl'>cURL</TabsTrigger>
          <TabsTrigger value='powershell'>PowerShell</TabsTrigger>
          <TabsTrigger value='python'>Python</TabsTrigger>
          <TabsTrigger value='javascript'>JavaScript</TabsTrigger>
        </TabsList>
        <TabsContent value='curl' className='mt-3'>
          <CodeBlock label='cURL' code={curlExample} />
        </TabsContent>
        <TabsContent value='powershell' className='mt-3'>
          <CodeBlock label='PowerShell' code={powershellExample} />
        </TabsContent>
        <TabsContent value='python' className='mt-3'>
          <CodeBlock label='Python' code={pythonExample} />
        </TabsContent>
        <TabsContent value='javascript' className='mt-3'>
          <CodeBlock label='JavaScript' code={javascriptExample} />
        </TabsContent>
      </Tabs>
    </section>
  )
}
