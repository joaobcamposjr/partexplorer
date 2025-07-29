import React, { useState } from 'react'

const Header: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sobre')

  const navItems = [
    { id: 'sobre', label: 'Sobre' },
    { id: 'contato', label: 'Contato' },
    { id: 'loja', label: 'Loja' }
  ]

  return (
    <header className="bg-white shadow-sm border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-secondary-800">
              PartExplorer
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-link ${
                  activeTab === item.id ? 'nav-link-active' : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right side - Language selector */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5a2 2 0 002 2h.01M15 3.935V5a2 2 0 012 2v.01M8 3.935V3.935M15 3.935V3.935" />
              </svg>
              <span className="text-secondary-700 font-medium">PT</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 