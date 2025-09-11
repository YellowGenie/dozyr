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
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-white overflow-hidden">
      {/* Navigation */}
      <Navbar isScrolled={isScrolled} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50 to-white">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-200/30 to-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-purple-100/40 to-purple-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-100/20 to-transparent rounded-full"></div>
        </div>

        {/* Floating glass particles */}
        {mounted && (
          <div className="absolute inset-0 overflow-hidden">
            {particles.map((particle, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-purple-200/30 rounded-full glass-card"
                initial={{ 
                  x: particle.x, 
                  y: particle.y,
                  opacity: 0 
                }}
                animate={{ 
                  y: [null, particle.y - 100], 
                  opacity: [0, 1, 0] 
                }}
                transition={{ 
                  duration: 15 + (i % 5), 
                  repeat: Infinity, 
                  delay: particle.delay
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
              <div className="inline-flex items-center px-6 py-3 rounded-full glass-card border border-[var(--accent)]/30 text-[var(--accent)] text-sm mb-8 depth-2 bg-white">
                <Zap className="h-4 w-4 mr-2 icon-depth" />
                The Future of Work is Here
              </div>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-6xl lg:text-8xl xl:text-9xl font-bold text-gray-900 leading-tight"
            >
              Connect
              <span className="text-[var(--accent)] drop-shadow-lg"> Talent </span>
              <br />
              with
              <span className="text-[var(--accent)] drop-shadow-lg"> Opportunity</span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto"
            >
              Where exceptional professionals meet visionary companies. 
              <br className="hidden lg:block" />
              Create meaningful connections that shape the future of remote work.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
            >
              <Link href="/auth">
                <Button size="lg" className="btn-primary text-lg px-8 py-4 h-auto">
                  <Users className="h-6 w-6 mr-3" />
                  Find Your Next Role
                  <ArrowRight className="h-6 w-6 ml-3" />
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="lg" className="btn-secondary text-lg px-8 py-4 h-auto">
                  <Award className="h-6 w-6 mr-3" />
                  Discover Talent
                </Button>
              </Link>
            </motion.div>

            {/* Floating interactive cards */}
            <motion.div 
              variants={fadeInUp}
              className="relative pt-16"
            >
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <motion.div
                  {...float}
                  className="enhanced-card depth-2"
                >
                  <Globe className="h-8 w-8 text-[var(--accent)] mb-4 icon-depth" />
                  <h3 className="text-gray-900 font-semibold mb-2">Global Network</h3>
                  <p className="text-gray-600 text-sm">Connect across continents</p>
                </motion.div>
                
                <motion.div
                  {...float}
                  transition={{ delay: 0.2 }}
                  className="enhanced-card depth-2 transform translate-y-4"
                >
                  <Zap className="h-8 w-8 text-[var(--accent)] mb-4 icon-depth" />
                  <h3 className="text-gray-900 font-semibold mb-2">Instant Matching</h3>
                  <p className="text-gray-600 text-sm">AI-powered connections</p>
                </motion.div>
                
                <motion.div
                  {...float}
                  transition={{ delay: 0.4 }}
                  className="enhanced-card depth-2"
                >
                  <Shield className="h-8 w-8 text-[var(--accent)] mb-4 icon-depth" />
                  <h3 className="text-gray-900 font-semibold mb-2">Secure Platform</h3>
                  <p className="text-gray-600 text-sm">Enterprise-grade security</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gradient-to-b from-purple-50 via-white to-purple-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8">
              Why Choose <span className="text-[var(--accent)] drop-shadow-lg">Dozyr</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Experience the next generation of remote work with our innovative platform 
              designed to connect exceptional talent with visionary opportunities.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
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
                <div className="enhanced-card h-full hover:border-[var(--accent)]/50 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] rounded-xl flex items-center justify-center mb-6 text-white icon-depth group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Interactive Stats Section */}
      <section className="py-32 bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24%,rgba(124,58,237,.05)_25%,rgba(124,58,237,.05)_26%,transparent_27%,transparent_74%,rgba(124,58,237,.05)_75%,rgba(124,58,237,.05)_76%,transparent_77%,transparent_24%),linear-gradient(0deg,transparent_24%,rgba(124,58,237,.05)_25%,rgba(124,58,237,.05)_26%,transparent_27%,transparent_74%,rgba(124,58,237,.05)_75%,rgba(124,58,237,.05)_76%,transparent_77%,transparent_24%)] bg-[length:80px_80px]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8">
              Join the <span className="text-[var(--accent)] drop-shadow-lg">Revolution</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Be part of the movement that's reshaping how the world works
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-4 gap-8 mb-16"
          >
            {[
              { number: "50K+", label: "Active Professionals" },
              { number: "15K+", label: "Success Stories" },
              { number: "180+", label: "Countries" },
              { number: "99%", label: "Satisfaction Rate" }
            ].map((stat, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <div className="enhanced-card text-center hover:border-[var(--accent)]/50 transition-all duration-300">
                  <div className="text-4xl lg:text-5xl font-bold text-[var(--accent)] mb-2 icon-depth">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
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
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp}>
              <Link href="/auth">
                <div className="enhanced-card hover:border-[var(--accent)] transition-all duration-300 group cursor-pointer interactive">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] rounded-xl flex items-center justify-center text-white icon-depth group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-8 w-8" />
                    </div>
                    <ArrowRight className="h-6 w-6 text-[var(--accent)] group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">For Talent</h3>
                  <p className="text-gray-600 mb-4">
                    Discover opportunities that match your skills and ambitions
                  </p>
                  <div className="text-[var(--accent)] font-semibold">Join as Talent →</div>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link href="/auth">
                <div className="enhanced-card hover:border-[var(--accent)] transition-all duration-300 group cursor-pointer interactive">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] rounded-xl flex items-center justify-center text-white icon-depth group-hover:scale-110 transition-transform duration-300">
                      <Award className="h-8 w-8" />
                    </div>
                    <ArrowRight className="h-6 w-6 text-[var(--accent)] group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">For Companies</h3>
                  <p className="text-gray-600 mb-4">
                    Access a curated network of exceptional professionals
                  </p>
                  <div className="text-[var(--accent)] font-semibold">Hire Talent →</div>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-gradient-to-br from-[var(--accent)] via-[var(--accent-light)] to-[var(--accent)] relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-32 -right-32 w-64 h-64 rounded-full border-4 border-black/10"
          />
          <motion.div 
            animate={{ rotate: -360, scale: [1, 0.9, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full border-4 border-black/10"
          />
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center px-6 lg:px-8">
          <motion.div {...fadeInUp}>
            <h2 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Ready to Shape
              <br />
              the Future?
            </h2>
            <p className="text-xl lg:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join the next generation of remote work and unlock unlimited possibilities
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/auth">
                <Button size="lg" className="bg-white text-[var(--accent)] hover:bg-gray-100 text-xl px-12 py-6 h-auto rounded-2xl interactive font-bold">
                  Start Your Journey
                  <ArrowRight className="h-6 w-6 ml-3" />
                </Button>
              </Link>
              <Link href="/jobs">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[var(--accent)] text-xl px-12 py-6 h-auto rounded-2xl interactive">
                  <Globe className="h-6 w-6 mr-3" />
                  Explore Platform
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gradient-to-b from-gray-100 to-white">
        <div className="max-w-4xl mx-auto text-center px-6 lg:px-8">
          <motion.div {...fadeInUp}>
            <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Stay <span className="text-[var(--accent)]">Connected</span>
            </h3>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Get exclusive insights, opportunities, and updates from the remote work revolution
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-14 text-lg"
                required
              />
              <Button type="submit" disabled={isSubmitted} className="btn-primary h-14 px-8 text-lg">
                {isSubmitted ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
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

      {/* Footer */}
      <footer className="py-16 bg-gray-900 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="dozyr-brand mb-6">
                <span className="dozyr-text text-3xl">Dozyr</span>
                <div className="dozyr-sparkle"></div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Empowering the future of remote work through meaningful connections and innovative technology.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer interactive hover:bg-[var(--accent)] transition-all duration-300">
                  <Globe className="h-5 w-5 text-gray-300 hover:text-white" />
                </div>
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer interactive hover:bg-[var(--accent)] transition-all duration-300">
                  <MessageCircle className="h-5 w-5 text-gray-300 hover:text-white" />
                </div>
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer interactive hover:bg-[var(--accent)] transition-all duration-300">
                  <Users className="h-5 w-5 text-gray-300 hover:text-white" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-200 mb-6">For Talent</h4>
              <ul className="space-y-3">
                <li><Link href="/jobs" className="text-gray-400 hover:text-[var(--accent)] transition-colors cursor-pointer interactive">Find Opportunities</Link></li>
                <li><Link href="/profile" className="text-gray-400 hover:text-[var(--accent)] transition-colors cursor-pointer interactive">Build Profile</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 hover:text-[var(--accent)] transition-colors cursor-pointer interactive">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-200 mb-6">For Companies</h4>
              <ul className="space-y-3">
                <li><Link href="/talent" className="text-gray-400 hover:text-[var(--accent)] transition-colors cursor-pointer interactive">Discover Talent</Link></li>
                <li><Link href="/jobs/post" className="text-gray-400 hover:text-[var(--accent)] transition-colors cursor-pointer interactive">Post Opportunities</Link></li>
                <li><Link href="/enterprise" className="text-gray-400 hover:text-[var(--accent)] transition-colors cursor-pointer interactive">Enterprise</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-200 mb-6">Resources</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 hover:text-[var(--accent)] transition-colors cursor-pointer interactive">About</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-[var(--accent)] transition-colors cursor-pointer interactive">Contact</Link></li>
                <li><Link href="/help" className="text-gray-400 hover:text-[var(--accent)] transition-colors cursor-pointer interactive">Help Center</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-[var(--accent)] transition-colors cursor-pointer interactive">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © 2024 Dozyr. All rights reserved. Crafted with passion for the remote work revolution.
            </p>
            <div className="flex items-center space-x-6">
              <Link href="/terms" className="text-gray-500 hover:text-[var(--accent)] transition-colors text-sm cursor-pointer interactive">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-gray-500 hover:text-[var(--accent)] transition-colors text-sm cursor-pointer interactive">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}