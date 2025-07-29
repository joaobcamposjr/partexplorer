import React, { useState } from 'react'

const SearchSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('tudo')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const tabs = [
    { id: 'tudo', label: 'Pesquisar tudo' },
    { id: 'categoria', label: 'Categoria' },
    { id: 'marcas', label: 'Marcas' },
    { id: 'fabricantes', label: 'Fabricantes' }
  ]

  const popularSuggestions = [
    'Amortecedor dianteiro',
    'Pastilha de freio',
    'Filtro de óleo',
    'Correia dentada',
    'Bateria automotiva'
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Pesquisando:', searchQuery)
    // Aqui será implementada a integração com a API
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e)
    }
  }

  return (
    <section className="bg-gradient-to-b from-primary-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título principal */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-secondary-800 mb-4">
            Qual peça você está procurando?
          </h2>
          <p className="text-lg text-secondary-600">
            Encontre as peças que você precisa de forma rápida e fácil
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-secondary-100 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-secondary-800 shadow-sm'
                    : 'text-secondary-600 hover:text-secondary-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Campo de busca */}
        <div className="relative max-w-2xl mx-auto">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyPress={handleKeyPress}
                placeholder="Digite o nome da peça, código ou marca..."
                className="w-full px-6 py-4 text-lg border-2 border-secondary-200 rounded-full focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Sugestões */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-secondary-200 rounded-lg shadow-lg z-10">
              <div className="p-4">
                <h4 className="text-sm font-medium text-secondary-700 mb-3">Sugestões populares:</h4>
                <div className="space-y-2">
                  {popularSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion)
                        setShowSuggestions(false)
                      }}
                      className="block w-full text-left px-3 py-2 text-secondary-600 hover:bg-secondary-50 rounded-md transition-colors duration-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default SearchSection 