"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowRight, 
  Play, 
  CheckCircle, 
  Star,
  Users,
  MapPin,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Award,
  Heart,
  MessageCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/layout/navbar'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const float = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  // Generate deterministic particle positions (same on server and client)
  const particles = Array.from({ length: 20 }, (_, i) => {
    // Use index-based seeded random for consistent positions
    const seed = i * 123.456789
    const x = (Math.sin(seed) * 0.5 + 0.5) * 1200
    const y = (Math.cos(seed * 1.5) * 0.5 + 0.5) * 800
    return { x, y, delay: i * 0.1 }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/30 to-white overflow-hidden">
      {/* Navigation */}
      <Navbar isScrolled={isScrolled} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Professional Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/20 to-white">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[var(--primary)]/8 to-[var(--primary-light)]/6 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-[var(--accent)]/10 to-[var(--primary-lighter)]/8 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-[var(--primary)]/3 to-transparent rounded-full"></div>
        </div>

        {/* Professional floating elements */}
        {mounted && (
          <div className="absolute inset-0 overflow-hidden">
            {particles.slice(0, 8).map((particle, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[var(--primary)]/20 rounded-full"
                initial={{ 
                  x: particle.x, 
                  y: particle.y,
                  opacity: 0 
                }}
                animate={{ 
                  y: [null, particle.y - 200], 
                  opacity: [0, 0.6, 0] 
                }}
                transition={{ 
                  duration: 20 + (i % 3), 
                  repeat: Infinity, 
                  delay: particle.delay,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center z-10">
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-12"
          >
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center px-6 py-3 rounded-full glass-card border border-[var(--primary)]/20 text-[var(--primary)] text-sm mb-8 depth-2 bg-white font-mono">
                <Zap className="h-4 w-4 mr-2" />
                The Future of Work is Here
              </div>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-hero font-display text-gray-900"
            >
              Connect
              <span className="text-[var(--primary)]"> Talent </span>
              <br />
              with
              <span className="text-[var(--primary-light)]"> Opportunity</span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-feature font-body text-gray-600 max-w-4xl mx-auto"
            >
              Where exceptional professionals meet visionary companies. 
              <br className="hidden lg:block" />
              Create meaningful connections that shape the future of remote work.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center pt-8"
            >
              <Link href="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto w-full sm:w-auto">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                  Find Your Next Role
                  <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 ml-2 sm:ml-3" />
                </Button>
              </Link>
              <Link href="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto w-full sm:w-auto">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                  Discover Talent
                </Button>
              </Link>
            </motion.div>

            {/* Floating interactive cards */}
            <motion.div 
              variants={fadeInUp}
              className="relative pt-12 sm:pt-16"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto px-4 sm:px-0">
                <motion.div
                  {...float}
                  className="enhanced-card depth-2"
                >
                  <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--primary)] mb-3 sm:mb-4" />
                  <h3 className="text-gray-900 font-heading font-semibold mb-2 text-sm sm:text-base">Global Network</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">Connect across continents</p>
                </motion.div>
                
                <motion.div
                  {...float}
                  transition={{ delay: 0.2 }}
                  className="enhanced-card depth-2 sm:transform sm:translate-y-4"
                >
                  <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--primary)] mb-3 sm:mb-4" />
                  <h3 className="text-gray-900 font-heading font-semibold mb-2 text-sm sm:text-base">Smart Matching</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">AI-powered connections</p>
                </motion.div>
                
                <motion.div
                  {...float}
                  transition={{ delay: 0.4 }}
                  className="enhanced-card depth-2 sm:col-span-2 lg:col-span-1"
                >
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--primary)] mb-3 sm:mb-4" />
                  <h3 className="text-gray-900 font-heading font-semibold mb-2 text-sm sm:text-base">Secure Platform</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">Enterprise-grade security</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-slate-50/40 via-white to-slate-50/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-br from-[var(--primary)]/8 to-[var(--primary-light)]/6 rounded-full blur-2xl sm:blur-3xl"></div>
          <div className="absolute bottom-0 right-1/3 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-tl from-[var(--accent)]/12 to-[var(--primary-lighter)]/8 rounded-full blur-2xl sm:blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-12 sm:mb-16 lg:mb-20"
          >
            <h2 className="text-display font-heading text-gray-900 mb-6 sm:mb-8">
              Why Choose <span className="text-[var(--primary)]">Dozyr</span>?
            </h2>
            <p className="text-feature font-body text-gray-600 max-w-4xl mx-auto px-4 sm:px-0">
              Experience the next generation of remote work with our innovative platform 
              designed to connect exceptional talent with visionary opportunities.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {[
              {
                icon: <Globe className="h-8 w-8" />,
                title: "Global Network",
                description: "Connect with professionals worldwide in our thriving remote ecosystem."
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Secure Platform",
                description: "Enterprise-grade security ensuring your data and transactions are protected."
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Smart Matching",
                description: "Advanced algorithms connect you with the perfect opportunities and talent."
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: "Quality Excellence",
                description: "Curated community of verified professionals and premium opportunities."
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "Growth Focused",
                description: "Tools and insights to accelerate your career or business growth."
              },
              {
                icon: <Heart className="h-8 w-8" />,
                title: "Community First",
                description: "Built by remote work enthusiasts for the global remote community."
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <div className="enhanced-card h-full group">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-4 sm:mb-6 text-white group-hover:scale-110 transition-transform duration-300 ${
                    index % 3 === 0 ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)]' :
                    index % 3 === 1 ? 'bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary-lighter)]' :
                    'bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)]'
                  }`}>
                    <div className="h-6 w-6 sm:h-8 sm:w-8">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-heading text-gray-900 mb-3 sm:mb-4">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 font-body">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Interactive Stats Section */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24%,rgba(124,58,237,.05)_25%,rgba(124,58,237,.05)_26%,transparent_27%,transparent_74%,rgba(124,58,237,.05)_75%,rgba(124,58,237,.05)_76%,transparent_77%,transparent_24%),linear-gradient(0deg,transparent_24%,rgba(124,58,237,.05)_25%,rgba(124,58,237,.05)_26%,transparent_27%,transparent_74%,rgba(124,58,237,.05)_75%,rgba(124,58,237,.05)_76%,transparent_77%,transparent_24%)] bg-[length:40px_40px] sm:bg-[length:80px_80px]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-12 sm:mb-16 lg:mb-20"
          >
            <h2 className="text-display font-heading text-gray-900 mb-6 sm:mb-8">
              Join the <span className="text-[var(--primary)]">Revolution</span>
            </h2>
            <p className="text-feature font-body text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
              Be part of the movement that's reshaping how the world works
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16"
          >
            {[
              { number: "50K+", label: "Active Professionals" },
              { number: "15K+", label: "Success Stories" },
              { number: "180+", label: "Countries" },
              { number: "99%", label: "Satisfaction Rate" }
            ].map((stat, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <div className="enhanced-card text-center hover:border-[var(--primary)]/50 transition-all duration-300">
                  <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[var(--primary)] mb-2 font-display">
                    {stat.number}
                  </div>
                  <div className="text-sm sm:text-base text-gray-600 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Interactive call-to-action cards */}
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp}>
              <Link href="/auth">
                <div className="enhanced-card hover:border-[var(--primary)] transition-all duration-300 group cursor-pointer interactive">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--primary)] group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-gray-900 mb-3 sm:mb-4">For Talent</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                    Discover opportunities that match your skills and ambitions
                  </p>
                  <div className="text-[var(--primary)] font-semibold text-sm sm:text-base">Join as Talent →</div>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link href="/auth">
                <div className="enhanced-card hover:border-[var(--primary)] transition-all duration-300 group cursor-pointer interactive">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                      <Award className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--primary)] group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-gray-900 mb-3 sm:mb-4">For Companies</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                    Access a curated network of exceptional professionals
                  </p>
                  <div className="text-[var(--primary)] font-semibold text-sm sm:text-base">Hire Talent →</div>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section - Enhanced */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-[var(--primary)] via-[var(--primary-light)] to-[var(--primary-lighter)] relative overflow-hidden">
        {/* Enhanced animated background elements */}
        <div className="absolute inset-0">
          {/* Multiple rotating circles for more dynamic feel */}
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-16 sm:-top-32 -right-16 sm:-right-32 w-32 h-32 sm:w-64 sm:h-64 rounded-full border-2 sm:border-4 border-black/15"
          />
          <motion.div 
            animate={{ rotate: -360, scale: [1, 0.8, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-16 sm:-bottom-32 -left-16 sm:-left-32 w-40 h-40 sm:w-80 sm:h-80 rounded-full border-2 sm:border-4 border-black/15"
          />
          
          {/* Additional animated elements */}
          <motion.div 
            animate={{ 
              rotate: 360,
              x: [0, 50, 0, -50, 0],
              y: [0, -30, 0, 30, 0]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white/10 backdrop-blur-sm"
          />
          <motion.div 
            animate={{ 
              rotate: -360,
              x: [0, -40, 0, 40, 0],
              y: [0, 20, 0, -20, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-3/4 right-1/4 w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-white/15 backdrop-blur-sm"
          />
          
          {/* Floating particles */}
          {mounted && Array.from({ length: 12 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * 600,
                opacity: 0 
              }}
              animate={{ 
                y: [null, -100], 
                opacity: [0, 0.8, 0],
                scale: [1, 1.5, 1]
              }}
              transition={{ 
                duration: 15 + (i % 5), 
                repeat: Infinity, 
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div
              variants={fadeInUp}
              className="mb-8 sm:mb-12"
            >
              <motion.h2 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-black mb-6 sm:mb-8 leading-tight font-display"
                whileInView={{ 
                  textShadow: [
                    "0 0 0px rgba(0,0,0,0)",
                    "0 0 20px rgba(0,0,0,0.3)",
                    "0 0 0px rgba(0,0,0,0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Ready to Shape
                <br />
                <motion.span
                  animate={{ 
                    scale: [1, 1.05, 1],
                    color: ["#000000", "#ffffff", "#000000"]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  the Future?
                </motion.span>
              </motion.h2>
            </motion.div>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg sm:text-xl lg:text-2xl text-black/90 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0 font-body"
            >
              Join the next generation of remote work and unlock unlimited possibilities
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
            >
              <Link href="/auth" className="w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button size="lg" className="bg-white text-[var(--primary)] hover:bg-gray-100 text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 h-auto rounded-2xl font-bold w-full sm:w-auto shadow-2xl hover:shadow-white/50">
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Start Your Journey
                    </motion.span>
                    <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 ml-2 sm:ml-3" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/jobs" className="w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-[var(--primary)] text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 h-auto rounded-2xl w-full sm:w-auto backdrop-blur-sm bg-white/10 shadow-xl hover:shadow-white/30">
                    <Globe className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                    Explore Platform
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-100 to-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp}>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-display text-gray-900 mb-4 sm:mb-6">
              Stay <span className="text-[var(--primary)]">Connected</span>
            </h3>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 leading-relaxed">
              Get exclusive insights, opportunities, and updates from the remote work revolution
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg mx-auto">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-12 sm:h-14 text-base sm:text-lg"
                required
              />
              <Button type="submit" disabled={isSubmitted} className="btn-primary h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg whitespace-nowrap">
                {isSubmitted ? (
                  <>
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Subscribed!
                  </>
                ) : (
                  'Join Newsletter'
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="relative py-16 sm:py-20 lg:py-24 bg-gray-900 border-t border-gray-800">
        {/* Subtle background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[var(--primary)]/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-[var(--accent)]/5 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">
            {/* Brand section */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="dozyr-brand mb-6 sm:mb-8">
                <span className="dozyr-text text-3xl sm:text-4xl text-white">Dozyr</span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6 sm:mb-8 text-base sm:text-lg">
                Empowering the future of remote work through meaningful connections and innovative technology.
              </p>
              
              {/* Professional social icons */}
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[var(--primary)] hover:border-[var(--primary)] transition-all duration-300 group">
                  <Globe className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <div className="w-12 h-12 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[var(--primary)] hover:border-[var(--primary)] transition-all duration-300 group">
                  <MessageCircle className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <div className="w-12 h-12 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[var(--primary)] hover:border-[var(--primary)] transition-all duration-300 group">
                  <Users className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>

            {/* Link sections */}
            <div>
              <h4 className="font-bold text-white mb-6 sm:mb-8 text-lg font-heading relative">
                For Talent
                <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-[var(--primary)]"></div>
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/jobs" className="text-gray-400 hover:text-[var(--primary)] transition-colors text-base group">
                    Find Opportunities
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="text-gray-400 hover:text-[var(--primary)] transition-colors text-base group">
                    Build Profile
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-[var(--primary)] transition-colors text-base group">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 sm:mb-8 text-lg font-heading relative">
                For Companies
                <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-[var(--primary)]"></div>
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/talent" className="text-gray-400 hover:text-[var(--primary)] transition-colors text-base">
                    Discover Talent
                  </Link>
                </li>
                <li>
                  <Link href="/jobs/post" className="text-gray-400 hover:text-[var(--primary)] transition-colors text-base">
                    Post Opportunities
                  </Link>
                </li>
                <li>
                  <Link href="/enterprise" className="text-gray-400 hover:text-[var(--primary)] transition-colors text-base">
                    Enterprise
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 sm:mb-8 text-lg font-heading relative">
                Resources
                <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-[var(--primary)]"></div>
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-[var(--primary)] transition-colors text-base">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-[var(--primary)] transition-colors text-base">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-gray-400 hover:text-[var(--primary)] transition-colors text-base">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-[var(--primary)] transition-colors text-base">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="border-t border-gray-700 pt-8 flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-0">
            <p className="text-gray-400 text-sm sm:text-base text-center lg:text-left">
              © 2025 Dozyr. All rights reserved. Crafted with precision for the remote work revolution.
            </p>
            <div className="flex items-center space-x-6">
              <Link href="/terms" className="text-gray-400 hover:text-[var(--primary)] transition-colors text-sm sm:text-base">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-[var(--primary)] transition-colors text-sm sm:text-base">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}