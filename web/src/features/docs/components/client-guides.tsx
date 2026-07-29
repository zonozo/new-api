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

import { buildClientGuides } from '../client-guide-data'
import type { ApiEndpoints } from '../lib/connection-config'
import { ClientGuideCard } from './client-guide-card'

type ClientGuidesProps = {
  endpoints: ApiEndpoints
}

export function ClientGuides(props: ClientGuidesProps) {
  const { t } = useTranslation()
  const [ccSwitchGuide, ...clientGuides] = buildClientGuides(props.endpoints, t)
  const defaultClientGuide = clientGuides[0]

  if (!ccSwitchGuide || !defaultClientGuide) return null

  return (
    <section id='app-guides' className='scroll-mt-24'>
      <div className='mb-6 flex flex-col gap-2'>
        <p className='text-primary text-sm font-medium'>{t('App setup')}</p>
        <h2 className='text-2xl font-semibold tracking-tight md:text-3xl'>
          {t('Connect your favorite app')}
        </h2>
        <p className='text-muted-foreground max-w-3xl leading-7'>
          {t(
            'Pick a client below. Base URLs are already filled with the address of this platform; replace only the API key and model ID.'
          )}
        </p>
      </div>

      <div className='mb-10'>
        <ClientGuideCard guide={ccSwitchGuide} />
      </div>

      <h3 className='mb-4 text-xl font-semibold tracking-tight'>
        {t('Individual client setup')}
      </h3>

      <Tabs defaultValue={defaultClientGuide.id}>
        <div className='overflow-x-auto pb-2'>
          <TabsList className='w-max min-w-full justify-start'>
            {clientGuides.map((guide) => (
              <TabsTrigger key={guide.id} value={guide.id}>
                {guide.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {clientGuides.map((guide) => (
          <TabsContent key={guide.id} value={guide.id} className='mt-3'>
            <ClientGuideCard guide={guide} />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
