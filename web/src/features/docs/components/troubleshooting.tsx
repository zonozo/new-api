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

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function Troubleshooting() {
  const { t } = useTranslation()

  const items = [
    {
      value: 'unauthorized',
      question: t('Why do I get 401 Unauthorized?'),
      answer: t(
        'Confirm the key is enabled and copied without spaces. OpenAI-compatible clients use Authorization: Bearer, while Anthropic and Gemini clients may send their protocol-specific key header automatically.'
      ),
    },
    {
      value: 'model',
      question: t('Why do I get model not found or no available channel?'),
      answer: t(
        'Model IDs are exact and case-sensitive. Copy the ID from Model Square, confirm your key can access it, and use a protocol supported by that model.'
      ),
    },
    {
      value: 'rate-limit',
      question: t('What should I check for 429 or insufficient quota?'),
      answer: t(
        'Check your account balance, API key quota, group limits, and request rate. Retry only after the displayed limit or balance issue is resolved.'
      ),
    },
    {
      value: 'base-url',
      question: t('Should the base URL include /v1?'),
      answer: t(
        'OpenAI-compatible clients usually need /v1. Claude Code and native Gemini clients use the platform root URL because they append their own protocol paths.'
      ),
    },
    {
      value: 'exposed-key',
      question: t('What if I accidentally exposed an API key?'),
      answer: t(
        'Disable or delete the key immediately, create a replacement, and update every client that used it. Do not keep using an exposed key.'
      ),
    },
  ]

  return (
    <section id='troubleshooting' className='scroll-mt-24'>
      <div className='mb-6 flex flex-col gap-2'>
        <p className='text-primary text-sm font-medium'>
          {t('Troubleshooting')}
        </p>
        <h2 className='text-2xl font-semibold tracking-tight md:text-3xl'>
          {t('Common connection problems')}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('Before asking for help')}</CardTitle>
          <CardDescription>
            {t(
              'Keep the request ID and exact error message, but remove API keys before sharing logs.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion>
            {items.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent className='text-muted-foreground leading-6'>
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </section>
  )
}
