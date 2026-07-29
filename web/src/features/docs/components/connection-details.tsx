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
import { InformationCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import type { ApiEndpoints } from '../lib/connection-config'
import { CodeBlock } from './code-block'

type ConnectionDetailsProps = {
  endpoints: ApiEndpoints
}

export function ConnectionDetails(props: ConnectionDetailsProps) {
  const { t } = useTranslation()

  const endpointRows = [
    {
      label: t('OpenAI-compatible base URL'),
      value: props.endpoints.openAI,
    },
    {
      label: t('Anthropic-compatible base URL'),
      value: props.endpoints.anthropic,
    },
    {
      label: t('Gemini-compatible base URL'),
      value: props.endpoints.gemini,
    },
  ]

  return (
    <section id='connection-details' className='scroll-mt-24'>
      <Card>
        <CardHeader>
          <CardTitle className='text-xl'>{t('Connection details')}</CardTitle>
          <CardDescription className='leading-6'>
            {t(
              'These addresses are generated from the site you are viewing. Use the protocol-specific value required by your client.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <div className='grid gap-3'>
            {endpointRows.map((endpoint) => (
              <CodeBlock
                key={endpoint.label}
                label={endpoint.label}
                code={endpoint.value}
              />
            ))}
          </div>
          <Alert>
            <HugeiconsIcon
              icon={InformationCircleIcon}
              strokeWidth={2}
              aria-hidden='true'
            />
            <AlertTitle>{t('Keep your API key secret')}</AlertTitle>
            <AlertDescription>
              {t(
                'Store keys in environment variables or a local secret manager. Never commit them to Git, paste them into screenshots, or share them in support messages.'
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  )
}
