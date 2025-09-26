'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Target,
  Heart,
  Lightbulb,
  Users,
  Shield,
  BrainCircuit,
  Sparkles,
  CheckCircle,
  Zap,
  Award,
  Globe,
  ArrowRight,
  Star
} from 'lucide-react'

interface VisionItem {
  icon: React.ElementType
  title: string
  description: string
  gradient: string
  features: string[]
}

const visionData: VisionItem[] = [
  {
    icon: Target,
    title: 'Vår Mission',
    description: 'Att demokratisera karriärmöjligheter genom att ge alla svenskar tillgång till professionell karriärcoachning och AI-driven vägledning.',
    gradient: 'from-pink-500 to-rose-500',
    features: [
      'Tillgänglig för alla, oavsett bakgrund',
      'Professionell kvalitet till rimligt pris',
      'Kontinuerlig utveckling och förbättring',
      'Svenska marknaden i fokus'
    ]
  },
  {
    icon: Lightbulb,
    title: 'Vår Vision',
    description: 'En framtid där varje svensk kan navigera sin karriär med självförtroende, stödd av den mest avancerade AI-teknologin och mänskliga expertis.',
    gradient: 'from-purple-500 to-indigo-500',
    features: [
      'AI som förstår svensk arbetsmarknad',
      'Personlig utveckling för alla',
      'Jämställda karriärmöjligheter',
      'Innovation inom HR-teknik'
    ]
  },
  {
    icon: Heart,
    title: 'Våra Värderingar',
    description: 'Vi bygger våra tjänster på grund av tillit, transparens och genuint engagemang för våra användares framgång och välbefinnande.',
    gradient: 'from-blue-500 to-cyan-500',
    features: [
      'Integritet och datasäkerhet först',
      'Transparent AI och algoritmer',
      'Användaren i centrum alltid',
      'Kontinuerlig innovation'
    ]
  }
]

export default function VisionSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const featureVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut"
      }
    })
  }

  return (
    <section
      ref={ref}
      className="py-24 bg-gradient-to-b from-slate-50/50 to-white relative overflow-hidden"
    >
      {/* Background Design Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-2 h-2 bg-pink-400 rounded-full opacity-60" />
        <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400 rounded-full opacity-40" />
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-50" />
        <div className="absolute bottom-20 right-20 w-4 h-4 bg-pink-300 rounded-full opacity-30" />

        {/* Large gradient circles */}
        <div className="absolute -top-64 -left-64 w-96 h-96 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-64 -right-64 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-50 to-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-purple-200/50">
            <Sparkles className="w-4 h-4" />
            Vår filosofi
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Mer än bara <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">AI-teknik</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Vi kombinerar avancerad artificiell intelligens med djup förståelse för den svenska arbetsmarknaden
            och genuint engagemang för varje användares framgång. Det är vad som gör Jobbcoach.ai unikt.
          </p>
        </motion.div>

        {/* Vision Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20"
        >
          {visionData.map((item, index) => (
            <motion.div
              key={item.title}
              variants={itemVariants}
              whileHover={{
                y: -8,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="group relative bg-white rounded-3xl p-8 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:border-gray-300"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                {/* Icon */}
                <motion.div
                  whileHover={{
                    scale: 1.1,
                    rotate: 5,
                    transition: { duration: 0.3 }
                  }}
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                >
                  <item.icon className="w-10 h-10 text-white" />
                </motion.div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-pink-600 transition-colors duration-300">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed mb-6">
                  {item.description}
                </p>

                {/* Features List */}
                <div className="space-y-3">
                  {item.features.map((feature, featureIndex) => (
                    <motion.div
                      key={featureIndex}
                      custom={featureIndex}
                      variants={featureVariants}
                      initial="hidden"
                      animate={isInView ? "visible" : "hidden"}
                      className="flex items-center gap-3 text-sm text-gray-700"
                    >
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Decorative element */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </motion.div>
          ))}
        </motion.div>

        {/* Technology Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-12 border border-gray-200 shadow-lg"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  AI som förstår Sverige
                </h3>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Vår AI är tränad specifikt på den svenska arbetsmarknaden, kulturen och språket.
                Det betyder att du får råd som faktiskt fungerar här, med terminologi som känns naturlig
                och strategier anpassade för svenska arbetsgivare.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Svenska marknaden</h4>
                      <p className="text-sm text-gray-600">Förstår svenska rekryteringsprocesser</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">GDPR-säker</h4>
                      <p className="text-sm text-gray-600">Full efterlevnad av svenska lagar</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Snabb utveckling</h4>
                      <p className="text-sm text-gray-600">Kontinuerligt lärande och förbättring</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Users className="w-4 h-4 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Mänsklig touch</h4>
                      <p className="text-sm text-gray-600">AI + experters insikter</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Element */}
            <div className="relative">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">Premium AI-modell</div>
                      <div className="text-white/80 text-sm">Tränad på 50,000+ svenska jobbansökningar</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">Expertvaliderat</div>
                      <div className="text-white/80 text-sm">Granskad av svenska karriärcoacher</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <BrainCircuit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">Kontinuerligt lärande</div>
                      <div className="text-white/80 text-sm">Uppdateras varje dag med ny data</div>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/10 rounded-full animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-white/10 rounded-full animate-pulse delay-300" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Upplev skillnaden med en AI-karriärcoach som verkligen förstår dig och den svenska arbetsmarknaden.
          </p>

          <motion.div
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px -12px rgba(236, 72, 153, 0.3)"
            }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
            Upptäck din potential
            <ArrowRight className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}