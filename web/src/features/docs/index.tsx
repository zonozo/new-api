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
  BookOpen01Icon,
  Clock01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Footer } from '@/components/layout/components/footer'
import { PublicLayout } from '@/components/layout/components/public-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useStatus } from '@/hooks/use-status'

import { ApiExamples } from './components/api-examples'
import { ClientGuides } from './components/client-guides'
import { ConnectionDetails } from './components/connection-details'
import { QuickStart } from './components/quick-start'
import { Troubleshooting } from './components/troubleshooting'
import { getApiEndpoints, getServerAddress } from './lib/connection-config'

export function Docs() {
  const { t } = useTranslation()
  const { status } = useStatus()
  const serverAddress = getServerAddress(status, window.location.origin)
  const endpoints = getApiEndpoints(serverAddress)
  const sections = [
    { href: '#quick-start', label: t('Quick start') },
    { href: '#connection-details', label: t('Connection details') },
    { href: '#first-request', label: t('Make your first request') },
    { href: '#app-guides', label: t('App setup') },
    { href: '#troubleshooting', label: t('Troubleshooting') },
  ]

  return (
    <PublicLayout showMainContainer={false}>
      <main>
        <section className='bg-primary/[0.04] border-border/60 border-b px-4 pt-28 pb-16 md:pt-36 md:pb-20'>
          <div className='mx-auto max-w-6xl'>
            <Badge variant='secondary' className='mb-5'>
              <HugeiconsIcon
                icon={BookOpen01Icon}
                strokeWidth={2}
                data-icon='inline-start'
                aria-hidden='true'
              />
              {t('Beginner API guide')}
            </Badge>
            <p className='text-muted-foreground mt-5 max-w-3xl text-base leading-7 md:text-lg md:leading-8'>
              {t(
                'Create an account, generate a key, verify the API, and connect popular coding agents and desktop clients with copy-ready examples.'
              )}
            </p>

            <div className='mt-8 flex flex-wrap gap-3'>
              <Button size='lg' render={<Link to='/sign-up' />}>
                {t('Create an account')}
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                  data-icon='inline-end'
                />
              </Button>
              <Button size='lg' variant='outline' render={<Link to='/keys' />}>
                {t('Manage API keys')}
              </Button>
            </div>

            <div className='text-muted-foreground mt-8 flex flex-wrap items-center gap-4 text-sm'>
              <span className='flex items-center gap-1.5'>
                <HugeiconsIcon
                  icon={Clock01Icon}
                  className='size-4'
                  strokeWidth={2}
                  aria-hidden='true'
                />
                {t('About 10 minutes')}
              </span>
              <span>{t('No prior API experience required')}</span>
              <span>OpenAI · Anthropic · Gemini</span>
            </div>

            <nav
              aria-label={t('Documentation sections')}
              className='mt-8 flex gap-2 overflow-x-auto pb-2 lg:hidden'
            >
              {sections.map((section) => (
                <Button
                  key={section.href}
                  size='sm'
                  variant='outline'
                  render={<a href={section.href} />}
                >
                  {section.label}
                </Button>
              ))}
            </nav>
          </div>
        </section>

        <div className='mx-auto grid max-w-6xl gap-12 px-4 py-14 lg:grid-cols-[13rem_minmax(0,1fr)] lg:py-20'>
          <aside className='hidden lg:block'>
            <nav
              aria-label={t('Documentation sections')}
              className='sticky top-24 flex flex-col gap-1'
            >
              <p className='text-foreground mb-2 text-sm font-medium'>
                {t('On this page')}
              </p>
              {sections.map((section) => (
                <a
                  key={section.href}
                  href={section.href}
                  className='text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg px-3 py-2 text-sm transition-colors'
                >
                  {section.label}
                </a>
              ))}
            </nav>
          </aside>

          <div className='min-w-0'>
            <div className='flex flex-col gap-16 md:gap-20'>
              <QuickStart />
              <Separator />
              <ConnectionDetails endpoints={endpoints} />
              <Separator />
              <ApiExamples
                serverAddress={serverAddress}
                endpoints={endpoints}
              />
              <Separator />
              <ClientGuides endpoints={endpoints} />
              <Separator />
              <Troubleshooting />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </PublicLayout>
  )
}
