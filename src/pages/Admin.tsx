import React, { useState, useEffect } from 'react'
import { Users, Terminal, Database, Settings, Shield, Activity, Trash2, Edit, UserCheck, UserX } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface UserProfile {
  id: string
  email: string
  full_name: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

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

interface AdminStats {
  totalUsers: number
  totalCommands: number
  activeCommands: number
  adminUsers: number
}

export default function Admin() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<UserProfile[]>([])
  const [commands, setCommands] = useState<Command[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCommands: 0,
    activeCommands: 0,
    adminUsers: 0
  })
  const [loading, setLoading] = useState(true)

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'commands', name: 'Commands', icon: Terminal },
    { id: 'database', name: 'Database', icon: Database },
    { id: 'settings', name: 'Settings', icon: Settings },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Fetch commands
      const { data: commandsData, error: commandsError } = await supabase
        .from('commands')
        .select('*')
        .order('created_at', { ascending: false })

      if (commandsError) throw commandsError

      setUsers(usersData || [])
      setCommands(commandsData || [])

      // Calculate stats
      const totalUsers = usersData?.length || 0
      const totalCommands = commandsData?.length || 0
      const activeCommands = commandsData?.filter(cmd => cmd.is_active).length || 0
      const adminUsers = usersData?.filter(user => user.is_admin).length || 0

      setStats({
        totalUsers,
        totalCommands,
        activeCommands,
        adminUsers
      })
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_admin: !isAdmin, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_admin: !isAdmin } : user
      ))
    } catch (error) {
      console.error('Error updating user admin status:', error)
    }
  }

  const deleteCommand = async (commandId: string) => {
    if (!confirm('Are you sure you want to permanently delete this command?')) return

    try {
      const { error } = await supabase
        .from('commands')
        .delete()
        .eq('id', commandId)

      if (error) throw error
      
      setCommands(commands.filter(cmd => cmd.id !== commandId))
      setStats(prev => ({
        ...prev,
        totalCommands: prev.totalCommands - 1,
        activeCommands: prev.activeCommands - (commands.find(cmd => cmd.id === commandId)?.is_active ? 1 : 0)
      }))
    } catch (error) {
      console.error('Error deleting command:', error)
    }
  }

  const toggleCommandStatus = async (commandId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('commands')
        .update({ is_active: !isActive, updated_at: new Date().toISOString() })
        .eq('id', commandId)

      if (error) throw error
      
      setCommands(commands.map(cmd => 
        cmd.id === commandId ? { ...cmd, is_active: !isActive } : cmd
      ))
      
      setStats(prev => ({
        ...prev,
        activeCommands: prev.activeCommands + (isActive ? -1 : 1)
      }))
    } catch (error) {
      console.error('Error updating command status:', error)
    }
  }

  const resetDatabase = async () => {
    if (!confirm('Are you sure you want to reset the database? This action cannot be undone!')) return
    if (!confirm('This will delete ALL data. Type "RESET" to confirm:') || 
        prompt('Type "RESET" to confirm:') !== 'RESET') return

    try {
      // Delete all commands
      const { error: commandsError } = await supabase
        .from('commands')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (commandsError) throw commandsError

      // Reset non-admin users
      const { error: usersError } = await supabase
        .from('user_profiles')
        .update({ is_admin: false })
        .neq('id', user?.id) // Keep current user as admin

      if (usersError) throw usersError

      alert('Database reset successfully!')
      fetchData()
    } catch (error) {
      console.error('Error resetting database:', error)
      alert('Error resetting database. Please try again.')
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
          <h1 className="text-4xl font-bold mb-4 flex items-center">
            <Shield className="w-10 h-10 mr-4 text-primary-400" />
            Admin <span className="text-gradient">Panel</span>
          </h1>
          <p className="text-dark-300 text-lg">
            Manage users, commands, and system settings
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-dark-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-400'
                        : 'border-transparent text-dark-400 hover:text-dark-300 hover:border-dark-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                      <p className="text-dark-400">Total Users</p>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Terminal className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold">{stats.activeCommands}</p>
                      <p className="text-dark-400">Active Commands</p>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Database className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold">{stats.totalCommands}</p>
                      <p className="text-dark-400">Total Commands</p>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold">{stats.adminUsers}</p>
                      <p className="text-dark-400">Admin Users</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {commands.slice(0, 5).map((command) => (
                    <div key={command.id} className="flex items-center justify-between py-2 border-b border-dark-700 last:border-b-0">
                      <div>
                        <p className="font-medium">{command.name}</p>
                        <p className="text-sm text-dark-400">
                          Created {new Date(command.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        command.is_active 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {command.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h3 className="text-xl font-semibold mb-6">User Management</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-700">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Joined</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-dark-700/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-medium">
                                {user.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {user.full_name}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-dark-300">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.is_admin 
                              ? 'bg-red-500/20 text-red-400' 
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {user.is_admin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-dark-300">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleUserAdmin(user.id, user.is_admin)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.is_admin
                                ? 'text-red-400 hover:bg-red-500/20'
                                : 'text-green-400 hover:bg-green-500/20'
                            }`}
                            title={user.is_admin ? 'Remove Admin' : 'Make Admin'}
                          >
                            {user.is_admin ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'commands' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h3 className="text-xl font-semibold mb-6">Command Management</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-700">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Created</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commands.map((command) => (
                      <tr key={command.id} className="border-b border-dark-700/50">
                        <td className="py-3 px-4 font-medium">{command.name}</td>
                        <td className="py-3 px-4">
                          <span className="bg-primary-600/20 text-primary-400 px-2 py-1 rounded-full text-xs">
                            {command.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            command.is_active 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {command.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-dark-300">
                          {new Date(command.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleCommandStatus(command.id, command.is_active)}
                              className={`p-2 rounded-lg transition-colors ${
                                command.is_active
                                  ? 'text-yellow-400 hover:bg-yellow-500/20'
                                  : 'text-green-400 hover:bg-green-500/20'
                              }`}
                              title={command.is_active ? 'Deactivate' : 'Activate'}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteCommand(command.id)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'database' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="card">
                <h3 className="text-xl font-semibold mb-4 text-red-400">Danger Zone</h3>
                <p className="text-dark-300 mb-6">
                  These actions are irreversible. Please be careful.
                </p>
                
                <div className="space-y-4">
                  <div className="border border-red-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-red-400 mb-2">Reset Database</h4>
                    <p className="text-dark-300 text-sm mb-4">
                      This will delete all commands and reset user permissions (except your admin status).
                    </p>
                    <button
                      onClick={resetDatabase}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Reset Database
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h3 className="text-xl font-semibold mb-6">System Settings</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Application Settings</h4>
                  <p className="text-dark-300 text-sm mb-4">
                    Configure global application settings and preferences.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Allow User Registration</p>
                        <p className="text-sm text-dark-400">Enable new users to register accounts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Command Approval Required</p>
                        <p className="text-sm text-dark-400">New commands require admin approval</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}