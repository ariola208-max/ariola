import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, Terminal, Copy, Check, Edit, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Command {
  id: string
  name: string
  description: string
  command: string
  category: string
  created_at: string
  updated_at: string
  created_by: string
  is_active: boolean
}

export default function Commands() {
  const { user, isAdmin } = useAuth()
  const [commands, setCommands] = useState<Command[]>([])
  const [filteredCommands, setFilteredCommands] = useState<Command[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCommand, setEditingCommand] = useState<Command | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const categories = [
    'all', 'system', 'network', 'database', 'development', 'security', 'monitoring', 'deployment'
  ]

  useEffect(() => {
    fetchCommands()
  }, [])

  useEffect(() => {
    filterCommands()
  }, [commands, searchTerm, selectedCategory])

  const fetchCommands = async () => {
    try {
      const { data, error } = await supabase
        .from('commands')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCommands(data || [])
    } catch (error) {
      console.error('Error fetching commands:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCommands = () => {
    let filtered = commands

    if (searchTerm) {
      filtered = filtered.filter(cmd =>
        cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cmd.command.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(cmd => cmd.category === selectedCategory)
    }

    setFilteredCommands(filtered)
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleAddCommand = async (commandData: Omit<Command, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('commands')
        .insert({
          ...commandData,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error
      setCommands([data, ...commands])
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding command:', error)
    }
  }

  const handleUpdateCommand = async (id: string, updates: Partial<Command>) => {
    try {
      const { data, error } = await supabase
        .from('commands')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setCommands(commands.map(cmd => cmd.id === id ? data : cmd))
      setEditingCommand(null)
    } catch (error) {
      console.error('Error updating command:', error)
    }
  }

  const handleDeleteCommand = async (id: string) => {
    if (!confirm('Are you sure you want to delete this command?')) return

    try {
      const { error } = await supabase
        .from('commands')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      setCommands(commands.filter(cmd => cmd.id !== id))
    } catch (error) {
      console.error('Error deleting command:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Command <span className="text-gradient">Library</span>
          </h1>
          <p className="text-dark-300 text-lg">
            Discover and manage your command collection
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search commands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field pl-10 pr-8 appearance-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            {user && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Command</span>
              </button>
            )}
          </div>
        </div>

        {/* Commands Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredCommands.map((command) => (
              <motion.div
                key={command.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{command.name}</h3>
                    <span className="bg-primary-600/20 text-primary-400 px-3 py-1 rounded-full text-sm">
                      {command.category}
                    </span>
                  </div>
                  
                  {(isAdmin || command.created_by === user?.id) && (
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingCommand(command)}
                        className="p-2 text-dark-400 hover:text-primary-400 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCommand(command.id)}
                        className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <p className="text-dark-300 mb-4">{command.description}</p>
                
                <div className="bg-dark-700 rounded-lg p-4 relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-4 h-4 text-primary-400" />
                      <span className="text-sm text-dark-400">Command</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(command.command, command.id)}
                      className="p-1 text-dark-400 hover:text-primary-400 transition-colors"
                    >
                      {copiedId === command.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <code className="text-primary-300 text-sm break-all">
                    {command.command}
                  </code>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredCommands.length === 0 && (
          <div className="text-center py-12">
            <Terminal className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark-400 mb-2">No commands found</h3>
            <p className="text-dark-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Add/Edit Command Modal */}
      <CommandModal
        isOpen={showAddModal || !!editingCommand}
        onClose={() => {
          setShowAddModal(false)
          setEditingCommand(null)
        }}
        onSubmit={editingCommand ? 
          (data) => handleUpdateCommand(editingCommand.id, data) : 
          handleAddCommand
        }
        command={editingCommand}
        categories={categories.filter(cat => cat !== 'all')}
      />
    </div>
  )
}

interface CommandModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  command?: Command | null
  categories: string[]
}

function CommandModal({ isOpen, onClose, onSubmit, command, categories }: CommandModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    command: '',
    category: 'system',
    is_active: true
  })

  useEffect(() => {
    if (command) {
      setFormData({
        name: command.name,
        description: command.description,
        command: command.command,
        category: command.category,
        is_active: command.is_active
      })
    } else {
      setFormData({
        name: '',
        description: '',
        command: '',
        category: 'system',
        is_active: true
      })
    }
  }, [command])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-dark-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold mb-6">
          {command ? 'Edit Command' : 'Add New Command'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field w-full"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-field w-full"
              required
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field w-full h-24 resize-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Command</label>
            <textarea
              value={formData.command}
              onChange={(e) => setFormData({ ...formData, command: e.target.value })}
              className="input-field w-full h-32 resize-none font-mono text-sm"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {command ? 'Update' : 'Add'} Command
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}