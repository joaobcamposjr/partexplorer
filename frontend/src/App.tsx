import React, { useState, useEffect } from 'react';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [stats, setStats] = useState({
    totalSkus: 0,
    totalSearches: 0,
    totalPartners: 0
  });

  // Simular dados reais de buscas populares (em produção viria da API)
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

  // Simular estatísticas (em produção viria da API)
  useEffect(() => {
    setStats({
      totalSkus: 15420,
      totalSearches: 89234,
      totalPartners: 45
    });
  }, []);

  // Simular sugestões de autocomplete
  const generateSuggestions = (query: string) => {
    if (query.length < 2) return [];
    
    const allSuggestions = [
      'Amortecedor dianteiro',
      'Amortecedor traseiro',
      'Pastilha de freio dianteira',
      'Pastilha de freio traseira',
      'Filtro de óleo',
      'Filtro de ar',
      'Filtro de combustível',
      'Correia dentada',
      'Correia alternador',
      'Bateria automotiva',
      'Rolamento roda dianteira',
      'Rolamento roda traseira',
      'Junta do cabeçote',
      'Junta do coletor',
      'Bomba de água',
      'Bomba de óleo',
      'Bomba de combustível',
      'Vela de ignição',
      'Cabos de vela',
      'Distribuidor',
      'Rotor',
      'Tampa do distribuidor',
      'Sensor de oxigênio',
      'Sensor de temperatura',
      'Sensor de pressão do óleo',
      'Termostato',
      'Radiador',
      'Mangueira do radiador',
      'Mangueira do freio',
      'Mangueira do combustível'
    ];

    return allSuggestions
      .filter(item => item.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      setShowSuggestions(false);
      // TODO: Implementar busca real
      console.log('Buscando:', searchQuery);
      setTimeout(() => setIsSearching(false), 2000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length >= 2) {
      const newSuggestions = generateSuggestions(value);
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

            {/* Navigation - Centralizado */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="nav-link">Sobre</a>
              <a href="#" className="nav-link">Contato</a>
              <a href="#" className="nav-link">Loja</a>
            </nav>

            {/* Language Selector */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span className="text-gray-700 font-medium text-sm">PT</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
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

            {/* Search Tabs */}
            <div className="flex justify-center mb-8">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'all', label: 'Pesquisar tudo' },
                  { id: 'category', label: 'Categoria' },
                  { id: 'brands', label: 'Marcas' },
                  { id: 'manufacturers', label: 'Fabricantes' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
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

        {/* Big Numbers Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8">
                <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">
                  {stats.totalSkus.toLocaleString()}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">SKUs Disponíveis</h3>
                <p className="text-gray-600">Peças únicas em nosso catálogo</p>
              </div>

              <div className="text-center p-8">
                <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">
                  {stats.totalSearches.toLocaleString()}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Pesquisas Realizadas</h3>
                <p className="text-gray-600">Busca realizadas pelos usuários</p>
              </div>

              <div className="text-center p-8">
                <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">
                  {stats.totalPartners}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Parceiros</h3>
                <p className="text-gray-600">Marcas e fabricantes parceiros</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
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

        {/* Partner Slider */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Nossos Parceiros
              </h3>
              <p className="text-lg text-gray-600">
                Trabalhamos com as melhores marcas do mercado
              </p>
            </div>

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
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Coluna 1: Sobre */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Sobre</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">Nossa História</a></li>
                <li><a href="#" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">Missão e Valores</a></li>
                <li><a href="#" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">Equipe</a></li>
              </ul>
            </div>

            {/* Coluna 2: Ajuda */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Ajuda</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">FAQ</a></li>
                <li><a href="#" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">Suporte</a></li>
                <li><a href="#" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">Termos de Serviço</a></li>
                <li><a href="#" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">Política de Privacidade</a></li>
              </ul>
            </div>

            {/* Coluna 3: Contato */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Contato</h4>
              <ul className="space-y-2">
                <li className="text-gray-600">Email: contato@partexplorer.com</li>
                <li className="text-gray-600">Telefone: (XX) XXXX-XXXX</li>
                <li className="text-gray-600">Endereço: Rua Exemplo, 123, Cidade - UF</li>
              </ul>
            </div>

            {/* Coluna 4: Redes Sociais */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Siga-nos</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.262c-1.225 0-1.628.76-1.628 1.563V12h2.773l-.443 2.891h-2.33V22C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.34-1.6.56-2.46.66.89-.53 1.57-1.37 1.89-2.37-.83.49-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.47 5.4 7.9 3.56 5.47c-.37.63-.58 1.37-.58 2.17 0 1.49.75 2.81 1.89 3.59-.7-.02-1.37-.21-1.95-.5v.05c0 2.07 1.47 3.8 3.42 4.19-.36.1-.74.15-1.13.15-.28 0-.55-.03-.81-.08.54 1.7 2.11 2.93 3.97 2.96-1.46 1.14-3.3 1.83-5.3 1.83-.34 0-.68-.02-1.01-.06C3.4 20.42 5.7 21 8.12 21c9.73 0 15.04-8.05 15.04-15.04 0-.23-.01-.46-.02-.69.82-.59 1.53-1.33 2.09-2.17z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07c3.252.148 4.771 1.691 4.919 4.919.058 1.265.07 1.645.07 4.85s-.012 3.584-.07 4.85c-.148 3.228-1.667 4.771-4.919 4.919-1.266.058-1.645.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.07-1.645-.07-4.85s.012-3.584.07-4.85c.148-3.228 1.667-4.771 4.919-4.919 1.266-.058 1.645-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072C3.58 0.234 2.31 1.5 2.163 4.053c-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.147 2.553 1.417 3.823 3.97 3.97 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c2.553-.147 3.823-1.417 3.97-3.97.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.147-2.553-1.417-3.823-3.97-3.97-1.28-.058-1.688-.072-4.947-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.44-.645 1.44-1.44s-.645-1.44-1.44-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="text-center mt-8 border-t border-gray-300 pt-8">
            <p className="text-gray-600 text-sm">
              © 2024 PartExplorer. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 