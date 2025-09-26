'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import {
  Star,
  Users,
  Award,
  ChevronRight,
  Linkedin,
  Mail,
  ExternalLink
} from 'lucide-react'

interface TeamMember {
  name: string
  title: string
  image: string
  bio: string
  expertise: string[]
  linkedinUrl?: string
  email?: string
}

interface TeamMemberCardProps {
  member: TeamMember
  index: number
}

export default function TeamMemberCard({ member, index }: TeamMemberCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }
    }
  }

  const imageVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }
    }
  }

  const overlayVariants = {
    hover: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:border-pink-200"
    >
      {/* Profile Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <Image
          src={member.image}
          alt={`${member.name} - ${member.title}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Professional Badge */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-pink-600 border border-pink-200/50">
          Expert
        </div>

        {/* Contact Links - Visible on Hover */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10
          }}
          className="absolute top-4 right-4 flex gap-2"
        >
          {member.linkedinUrl && (
            <a
              href={member.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-blue-600 hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
              aria-label={`${member.name}s LinkedIn profil`}
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-pink-600 hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
              aria-label={`Skicka e-post till ${member.name}`}
            >
              <Mail className="w-4 h-4" />
            </a>
          )}
        </motion.div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Name and Title */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors duration-300">
            {member.name}
          </h3>
          <p className="text-sm font-medium text-pink-600 bg-pink-50 px-3 py-1 rounded-full inline-block">
            {member.title}
          </p>
        </div>

        {/* Bio */}
        <p className="text-gray-600 text-sm leading-relaxed mb-5">
          {member.bio}
        </p>

        {/* Expertise Tags */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <Star className="w-3 h-3" />
            Expertområden
          </div>
          <div className="flex flex-wrap gap-2">
            {member.expertise.map((skill, skillIndex) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: index * 0.1 + skillIndex * 0.05,
                  duration: 0.3
                }}
                className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium hover:bg-pink-100 hover:text-pink-700 transition-colors duration-200"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Interactive Bottom */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              <span>Hjälper kandidater sedan 2020</span>
            </div>

            <motion.div
              whileHover={{ x: 5 }}
              className="text-pink-600 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Subtle Gradient Border Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  )
}