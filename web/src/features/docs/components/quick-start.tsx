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
import {
  ArrowRight01Icon,
  Key01Icon,
  Rocket01Icon,
  SearchList01Icon,
  UserAdd01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function QuickStart() {
  const { t } = useTranslation()

  const steps = [
    {
      number: '01',
      icon: UserAdd01Icon,
      title: t('Register and sign in'),
      description: t(
        'Create your account, verify it when required, and sign in to the dashboard.'
      ),
      action: t('Open registration'),
      kind: 'route',
      to: '/sign-up' as const,
    },
    {
      number: '02',
      icon: SearchList01Icon,
      title: t('Choose a model'),
      description: t(
        'Open Model Square and copy an exact model ID that supports the protocol required by your app.'
      ),
      action: t('Open Model Square'),
      kind: 'route',
      to: '/pricing' as const,
    },
    {
      number: '03',
      icon: Key01Icon,
      title: t('Create an API key'),
      description: t(
        'Create a key in Token Management. Set its model access and quota limits if needed.'
      ),
      action: t('Open key management'),
      kind: 'route',
      to: '/keys' as const,
    },
    {
      number: '04',
      icon: Rocket01Icon,
      title: t('Connect and verify'),
      description: t(
        'Copy the platform address and key into your app, then send a small test request before real work.'
      ),
      action: t('View request example'),
      kind: 'anchor',
      href: '#first-request',
    },
  ] as const

  return (
    <section id='quick-start' className='scroll-mt-24'>
      <div className='mb-6 flex flex-col gap-2'>
        <p className='text-primary text-sm font-medium'>{t('Quick start')}</p>
        <h2 className='text-2xl font-semibold tracking-tight md:text-3xl'>
          {t('Four steps to a working API key')}
        </h2>
        <p className='text-muted-foreground max-w-2xl leading-7'>
          {t(
            'Complete these steps in order. The same API key can be used by multiple compatible clients.'
          )}
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        {steps.map((step) => (
          <Card key={step.number} className='min-h-52'>
            <CardHeader>
              <div className='bg-primary/10 text-primary mb-3 flex size-10 items-center justify-center rounded-lg'>
                <HugeiconsIcon
                  icon={step.icon}
                  className='size-5'
                  strokeWidth={2}
                  aria-hidden='true'
                />
              </div>
              <CardTitle className='text-lg'>{step.title}</CardTitle>
              <CardDescription className='leading-6'>
                {step.description}
              </CardDescription>
              <CardAction>
                <span className='text-muted-foreground font-mono text-xs'>
                  {step.number}
                </span>
              </CardAction>
            </CardHeader>
            <CardContent className='mt-auto'>
              {step.kind === 'route' ? (
                <Button
                  variant='link'
                  className='px-0'
                  render={<Link to={step.to} />}
                >
                  {step.action}
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    strokeWidth={2}
                    data-icon='inline-end'
                  />
                </Button>
              ) : (
                <Button
                  variant='link'
                  className='px-0'
                  render={<a href={step.href} />}
                >
                  {step.action}
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    strokeWidth={2}
                    data-icon='inline-end'
                  />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
