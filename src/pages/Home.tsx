import React from 'react'
import { Link } from 'react-router-dom'
import { Terminal, Shield, Zap, Users, ArrowRight, Code, Database, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user, isAdmin } = useAuth()

  const features = [
    {
      icon: Terminal,
      title: 'Command Library',
      description: 'Comprehensive collection of commands organized by categories for easy access and management.',
      color: 'text-blue-400'
    },
    {
      icon: Shield,
      title: 'Admin Controls',
      description: 'Powerful administration tools for managing users, commands, and system configurations.',
      color: 'text-green-400'
    },
    {
      icon: Zap,
      title: 'Fast Execution',
      description: 'Lightning-fast command execution with real-time feedback and error handling.',
      color: 'text-yellow-400'
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Complete user management system with role-based access control and permissions.',
      color: 'text-purple-400'
    },
    {
      icon: Code,
      title: 'Developer Friendly',
      description: 'Built with developers in mind, featuring clean APIs and extensive documentation.',
      color: 'text-cyan-400'
    },
    {
      icon: Database,
      title: 'Data Management',
      description: 'Robust database management with backup, restore, and migration capabilities.',
      color: 'text-red-400'
    }
  ]

  const stats = [
    { label: 'Commands Available', value: '500+' },
    { label: 'Active Users', value: '1,200+' },
    { label: 'Categories', value: '25+' },
    { label: 'Uptime', value: '99.9%' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23334155" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gradient">Ariola</span>
            </h1>
            <p className="text-xl md:text-2xl text-dark-300 mb-8 max-w-3xl mx-auto">
              Advanced command management and administration platform designed for developers and system administrators
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/commands" className="btn-primary text-lg px-8 py-4">
                Explore Commands
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              {!user && (
                <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                  Get Started
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="btn-secondary text-lg px-8 py-4">
                  <Shield className="w-5 h-5 mr-2" />
                  Admin Panel
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-dark-400 text-sm md:text-base">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Powerful <span className="text-gradient">Features</span>
            </h2>
            <p className="text-xl text-dark-300 max-w-3xl mx-auto">
              Everything you need to manage commands, users, and system administration in one comprehensive platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card hover:scale-105 transition-transform duration-200"
                >
                  <div className={`w-12 h-12 rounded-lg bg-dark-700 flex items-center justify-center mb-4 ${feature.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-dark-300">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of developers and administrators who trust Ariola for their command management needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Link to="/login" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                    Sign Up Free
                  </Link>
                  <Link to="/commands" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200">
                    View Commands
                  </Link>
                </>
              ) : (
                <Link to="/commands" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                  Explore Commands
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}