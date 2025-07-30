import React, { useState, useEffect } from 'react';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);


  // Buscar sugestões reais da API
  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) return [];
    
    try {
      const response = await fetch(`http://95.217.76.135:8080/api/v1/search/suggestions?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        return data.suggestions || [];
      }
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
    }
    
    return [];
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      setShowSuggestions(false);
      
      try {
        const response = await fetch(`http://95.217.76.135:8080/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Resultados da busca:', data);
        }
      } catch (error) {
        console.error('Erro na busca:', error);
      }
      
      setTimeout(() => setIsSearching(false), 2000);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length >= 2) {
      const newSuggestions = await fetchSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const popularSearches = [
    'Amortecedor dianteiro',
    'Pastilha de freio',
    'Filtro de óleo',
    'Correia dentada',
    'Bateria automotiva',
    'Rolamento',
    'Junta do cabeçote',
    'Bomba de água'
  ];

  const partners = [
    'Amazonas', 'Orletti', 'Ford', 'GM', 'Volkswagen', 
    'Fiat', 'Toyota', 'Honda', 'Hyundai', 'Chevrolet'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-lg mr-3 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                PartExplorer
              </h1>
            </div>

            {/* Navigation - Centralizado com hover */}
            <nav className="hidden md:flex space-x-8 absolute left-1/2 transform -translate-x-1/2">
              <a href="#" className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Sobre</a>
              <a href="#" className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Contato</a>
              <a href="#" className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Loja</a>
            </nav>

            {/* Language Selector com Globo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5a2 2 0 002 2h.01M15 3.935V5a2 2 0 012 2v.01M8 3.935V3.935M15 3.935V3.935" />
                </svg>
                <span className="text-gray-700 font-medium text-sm">PT</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Partner Slider - Movido para cima */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden">
              <div className="flex animate-scroll">
                {/* Primeira linha de logos */}
                {partners.map((partner, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 mx-8 flex items-center justify-center"
                    style={{ minWidth: '140px' }}
                  >
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 w-32 h-20 flex items-center justify-center hover:shadow-lg transition-shadow duration-200">
                      <span className="text-gray-700 font-semibold text-sm">
                        {partner}
                      </span>
                    </div>
                  </div>
                ))}
                {/* Duplicar para efeito contínuo */}
                {partners.map((partner, index) => (
                  <div
                    key={`duplicate-${index}`}
                    className="flex-shrink-0 mx-8 flex items-center justify-center"
                    style={{ minWidth: '140px' }}
                  >
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 w-32 h-20 flex items-center justify-center hover:shadow-lg transition-shadow duration-200">
                      <span className="text-gray-700 font-semibold text-sm">
                        {partner}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Hero Section with Search */}
        <section className="bg-gradient-to-br from-orange-50 via-white to-blue-50 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main Title */}
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
                Qual peça você está procurando?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Encontre as peças que você precisa de forma rápida e fácil. 
                Catálogo completo com milhares de peças automotivas.
              </p>
            </div>



            {/* Search Input with Autocomplete */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Digite o nome da peça, código ou marca..."
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-full focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 shadow-lg"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white p-3 rounded-full transition-all duration-200 shadow-lg"
                >
                  {isSearching ? (
                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Autocomplete Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </form>

            {/* Popular Searches */}
            <div className="text-center">
              <p className="text-gray-700 mb-4 font-medium">Buscas populares:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(search)}
                    className="bg-white hover:bg-orange-50 text-gray-800 font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm shadow-sm border border-gray-200 hover:border-orange-300"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* Features Section - Por que escolher o PartExplorer? */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Por que escolher o PartExplorer?
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                A plataforma mais completa para encontrar peças automotivas
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Busca Inteligente</h4>
                <p className="text-gray-600">Encontre peças rapidamente com nossa tecnologia de busca avançada</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Catálogo Completo</h4>
                <p className="text-gray-600">Milhares de peças de todas as marcas e modelos</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Resultados Rápidos</h4>
                <p className="text-gray-600">Obtenha resultados em segundos com nossa tecnologia otimizada</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Cores do Tripadvisor (fundo cinza claro, texto escuro) */}
      <footer className="bg-gray-100 text-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Coluna 1: Sobre */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-900">Sobre</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200 no-underline visited:text-gray-700">Nossa História</a></li>
                <li><a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200 no-underline visited:text-gray-700">Missão e Valores</a></li>
                <li><a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200 no-underline visited:text-gray-700">Equipe</a></li>
              </ul>
            </div>

            {/* Coluna 2: Ajuda */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-900">Ajuda</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200 no-underline visited:text-gray-700">FAQ</a></li>
                <li><a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200 no-underline visited:text-gray-700">Suporte</a></li>
                <li><a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200 no-underline visited:text-gray-700">Termos de Serviço</a></li>
                <li><a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200 no-underline visited:text-gray-700">Política de Privacidade</a></li>
              </ul>
            </div>

            {/* Coluna 3: Contato */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-900">Contato</h4>
              <ul className="space-y-2">
                <li className="text-gray-700">Email: contato@partexplorer.com</li>
                <li className="text-gray-700">Telefone: (XX) XXXX-XXXX</li>
                <li className="text-gray-700">Endereço: Rua Exemplo, 123, Cidade - UF</li>
              </ul>
            </div>

            {/* Coluna 4: Redes Sociais - Corrigido */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-900">Siga-nos</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.2.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="text-center mt-8 border-t border-gray-300 pt-8">
            <p className="text-gray-600 text-sm">
              © 2025 PartExplorer. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 