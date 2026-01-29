'use client'

import { memo, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const AgentFeatures = memo(function AgentFeatures() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const agents = [
    {
      key: 'sales',
      title: t('agents.sales.title'),
      description: t('agents.sales.description'),
      category: t('agents.sales.category'),
      features: [t('agents.sales.feature1'), t('agents.sales.feature2'), t('agents.sales.feature3')]
    },
    {
      key: 'marketing',
      title: t('agents.marketing.title'),
      description: t('agents.marketing.description'),
      category: t('agents.marketing.category'),
      features: [t('agents.marketing.feature1'), t('agents.marketing.feature2'), t('agents.marketing.feature3')]
    },
    {
      key: 'research',
      title: t('agents.research.title'),
      description: t('agents.research.description'),
      category: t('agents.research.category'),
      features: [t('agents.research.feature1'), t('agents.research.feature2'), t('agents.research.feature3')]
    },
    {
      key: 'content',
      title: t('agents.content.title'),
      description: t('agents.content.description'),
      category: t('agents.content.category'),
      features: [t('agents.content.feature1'), t('agents.content.feature2'), t('agents.content.feature3')]
    },
    {
      key: 'data',
      title: t('agents.data.title'),
      description: t('agents.data.description'),
      category: t('agents.data.category'),
      features: [t('agents.data.feature1'), t('agents.data.feature2'), t('agents.data.feature3')]
    },
    {
      key: 'support',
      title: t('agents.support.title'),
      description: t('agents.support.description'),
      category: t('agents.support.category'),
      features: [t('agents.support.feature1'), t('agents.support.feature2'), t('agents.support.feature3')]
    },
    {
      key: 'telegram',
      title: t('agents.telegram.title'),
      description: t('agents.telegram.description'),
      category: t('agents.telegram.category'),
      features: [t('agents.telegram.feature1'), t('agents.telegram.feature2'), t('agents.telegram.feature3')]
    }
  ]

  return (
    <section id="agents" ref={ref} className="py-24 relative">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t('agents.title')} <span className="text-primary">{t('agents.titleHighlight')}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('agents.subtitle')}
          </p>
        </motion.div>

        {/* Agent Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.key}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Card className="h-full hover:border-primary/50 transition-colors duration-300 group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {agent.category}
                    </Badge>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {agent.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {agent.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {agent.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs px-2 py-1 bg-white/5 rounded-md text-muted-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
})
