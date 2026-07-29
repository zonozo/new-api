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
  InformationCircleIcon,
  LinkSquare01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import type { ClientGuide } from '../client-guide-data'
import { CodeBlock } from './code-block'

type ClientGuideCardProps = {
  guide: ClientGuide
}

export function ClientGuideCard(props: ClientGuideCardProps) {
  const { t } = useTranslation()
  let compatibilityLabel = t('Limited')
  let compatibilityVariant: 'default' | 'secondary' = 'secondary'

  if (props.guide.compatibility === 'direct') {
    compatibilityLabel = t('Direct API connection')
    compatibilityVariant = 'default'
  } else if (props.guide.compatibility === 'manager') {
    compatibilityLabel = t('Configuration manager')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-xl'>{props.guide.name}</CardTitle>
        <CardDescription className='max-w-3xl leading-6'>
          {props.guide.description}
        </CardDescription>
        <CardAction>
          <Badge variant={compatibilityVariant}>{compatibilityLabel}</Badge>
        </CardAction>
      </CardHeader>

      <CardContent className='flex flex-col gap-6'>
        <div className='flex flex-col gap-3'>
          <div className='flex items-center justify-between gap-3'>
            <h3 className='font-medium'>{t('Install')}</h3>
            <Button
              variant='outline'
              size='sm'
              render={
                <a
                  href={props.guide.installUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                />
              }
            >
              {t('Official documentation')}
              <HugeiconsIcon
                icon={LinkSquare01Icon}
                strokeWidth={2}
                data-icon='inline-end'
              />
            </Button>
          </div>
          {props.guide.installCode && (
            <CodeBlock
              label={t('Installation command')}
              code={props.guide.installCode}
            />
          )}
        </div>

        {props.guide.configCode && (
          <>
            <Separator />
            <div className='flex flex-col gap-3'>
              <h3 className='font-medium'>{t('Configure')}</h3>
              <CodeBlock code={props.guide.configCode} />
            </div>
          </>
        )}

        <Separator />
        <div className='flex flex-col gap-3'>
          <h3 className='font-medium'>{t('Finish setup')}</h3>
          <ol className='grid gap-3'>
            {props.guide.instructions.map((instruction, index) => (
              <li key={instruction} className='flex gap-3 leading-6'>
                <span className='bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium'>
                  {index + 1}
                </span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        <Alert>
          <HugeiconsIcon
            icon={InformationCircleIcon}
            strokeWidth={2}
            aria-hidden='true'
          />
          <AlertTitle>{t('Important')}</AlertTitle>
          <AlertDescription>{props.guide.note}</AlertDescription>
        </Alert>
      </CardContent>

      <CardFooter className='text-muted-foreground text-xs'>
        {t(
          'Commands and option names may change between client versions. Check the linked official documentation if your screen differs.'
        )}
      </CardFooter>
    </Card>
  )
}
