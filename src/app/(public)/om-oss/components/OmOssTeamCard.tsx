'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export interface TeamMember {
  name: string
  title: string
  image: string
  bio: string
  expertise: string[]
}

interface OmOssTeamCardProps {
  member: TeamMember
  index: number
}

export default function OmOssTeamCard({ member, index }: OmOssTeamCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-white rounded-3xl border border-orange-100 overflow-hidden hover:border-orange-200 transition-colors"
      style={{
        boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)',
      }}
    >
      {/* Bild */}
      <div className="relative aspect-[4/3] overflow-hidden bg-orange-50">
        <Image
          src={member.image}
          alt={`${member.name}, ${member.title} pa Jobbcoach.ai`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(255, 255, 255, 0.85), transparent)',
          }}
        />
      </div>

      {/* Innehall */}
      <div className="p-6 sm:p-7">
        <h3 className="text-xl font-black text-slate-900 mb-1.5 leading-tight">
          {member.name}
        </h3>
        <div
          className="inline-block text-[11px] font-bold uppercase tracking-[0.14em] mb-4 px-2.5 py-1 rounded-full"
          style={{
            background:
              'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(220, 38, 38, 0.08) 100%)',
            color: '#DC2626',
          }}
        >
          {member.title}
        </div>

        <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed mb-5">
          {member.bio}
        </p>

        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700">
            Expertområden
          </div>
          <div className="flex flex-wrap gap-1.5">
            {member.expertise.map((skill) => (
              <span
                key={skill}
                className="inline-block px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100 text-[11px] font-bold text-slate-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  )
}
