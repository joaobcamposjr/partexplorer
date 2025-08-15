import React, { useState, useEffect } from 'react';

interface Product {
  id: string;
  title: string;
  partNumber: string;
  image?: string;
}

interface SearchResultsProps {
  searchQuery: string;
  onBackToSearch: () => void;
  onProductClick: (product: any) => void;
  searchMode: 'catalog' | 'find'; // Novo prop para identificar o modo
  companies?: any[]; // Adicionar companies como prop opcional
  cities?: string[]; // Adicionar cities como prop opcional
}

const SearchResults: React.FC<SearchResultsProps> = ({ searchQuery, onBackToSearch, onProductClick, searchMode, companies = [], cities = [] }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState(searchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cepInput, setCepInput] = useState('');
  const [includeObsolete, setIncludeObsolete] = useState(false);

  // Buscar dados reais do backend
  const fetchProducts = async (query: string) => {
    try {
      let apiUrl;
      
      // Determinar tipo de busca baseado no modo
      if (searchMode === 'find') {
        // Busca por localização (modo onde encontrar)
        const isCompanySearch = companies.some(company => 
          query.toLowerCase().includes(company.name.toLowerCase())
        );
        
        if (isCompanySearch) {
          apiUrl = `http://95.217.76.135:8080/api/v1/search?company=${encodeURIComponent(query)}&searchMode=find&page_size=16&page=${currentPage}`;
        } else if (selectedCity && !query.trim() && !selectedState) {
          // Caso especial: apenas cidade selecionada (sem query nem estado)
          apiUrl = `http://95.217.76.135:8080/api/v1/search?city=${encodeURIComponent(selectedCity)}&searchMode=find&page_size=16&page=${currentPage}`;
          console.log('DEBUG: Busca apenas por cidade:', selectedCity);
        } else if (selectedState && !query.trim()) {
          // Caso especial: apenas estado selecionado (sem query)
          apiUrl = `http://95.217.76.135:8080/api/v1/search?state=${encodeURIComponent(selectedState)}&searchMode=find&page_size=16&page=${currentPage}`;
          console.log('DEBUG: Busca apenas por estado:', selectedState);
        } else {
          apiUrl = `http://95.217.76.135:8080/api/v1/search?q=${encodeURIComponent(query)}&searchMode=find&page_size=16&page=${currentPage}`;
        }
        
        // Adicionar filtros se selecionados (apenas quando há query)
        if (selectedState && query.trim()) {
          apiUrl += `&state=${encodeURIComponent(selectedState)}`;
          console.log('DEBUG: Adicionando filtro de estado:', selectedState);
        }
        if (selectedCity && query.trim()) {
          apiUrl += `&city=${encodeURIComponent(selectedCity)}`;
          console.log('DEBUG: Adicionando filtro de cidade:', selectedCity);
        }
        if (cepInput.trim()) {
          apiUrl += `&cep=${encodeURIComponent(cepInput.trim())}`;
          console.log('DEBUG: Adicionando filtro de CEP:', cepInput.trim());
        }

      } else {
        // Busca normal (modo catálogo)
        apiUrl = `http://95.217.76.135:8080/api/v1/search?q=${encodeURIComponent(query)}&page_size=16&page=${currentPage}`;
      }
      
      console.log('DEBUG: URL da API:', apiUrl);
      
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        console.log('Dados do backend:', data);
        
        // Transformar dados do backend para o formato esperado
        const transformedProducts = data.results?.map((item: any, index: number) => {
          // Buscar o nome com descrição mais longa
          const descName = item.names?.find((n: any) => n.type === 'desc');
          const skuName = item.names?.find((n: any) => n.type === 'sku');
          
          return {
            id: item.id || index.toString(),
            title: descName?.name || 'Produto sem nome',
            partNumber: skuName?.name || 'N/A',
            image: '/placeholder-product.jpg'
          };
        }) || [];
        
        console.log('DEBUG: transformedProducts:', transformedProducts);
        console.log('DEBUG: data.total:', data.total);
        
        setProducts(transformedProducts);
        setTotalResults(data.total || transformedProducts.length);
        
        // Extrair filtros dos resultados
        const filters = extractFiltersFromResults(data.results || []);
        console.log('DEBUG: filters extracted:', filters);
        console.log('DEBUG: families count:', filters.families.size);
        console.log('DEBUG: brands count:', filters.brands.size);
        
        setAvailableFilters(filters);
      } else {
        console.error('Erro na resposta da API:', response.status);
        setProducts([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setProducts([]);
      setTotalResults(0);
    }
  };

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

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentSearchQuery(value);
    
    if (value.length >= 2) {
      const newSuggestions = await fetchSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setCurrentSearchQuery(suggestion);
    setShowSuggestions(false);
    
    // Submeter automaticamente a pesquisa
    setIsLoading(true);
    await fetchProducts(suggestion);
    setIsLoading(false);
  };

  useEffect(() => {
    // Resetar página quando a busca muda
    setCurrentPage(1);
    // Carregar dados iniciais
    fetchProducts(searchQuery).finally(() => setIsLoading(false));
  }, [searchQuery]);

  // Extrair filtros dos dados reais
  const [availableFilters, setAvailableFilters] = useState({
    lines: new Set<string>(),
    manufacturers: new Set<string>(),
    models: new Set<string>(),
    families: new Set<string>(),
    subfamilies: new Set<string>(),
    productTypes: new Set<string>(),
    brands: new Set<string>() // Adicionar filtro de marca
  });



  const extractFiltersFromResults = (results: any[]) => {
    const filters = {
      lines: new Set<string>(),
      manufacturers: new Set<string>(),
      models: new Set<string>(),
      families: new Set<string>(),
      subfamilies: new Set<string>(),
      productTypes: new Set<string>(),
      brands: new Set<string>() // Adicionar filtro de marca
    };

    results.forEach(item => {
      // Extrair aplicações (linha, montadora, modelo)
      item.applications?.forEach((app: any) => {
        if (app.line) filters.lines.add(app.line);
        if (app.manufacturer) filters.manufacturers.add(app.manufacturer);
        if (app.model) filters.models.add(app.model);
      });

      // Extrair família do part_group (está aninhada dentro de subfamily)
      if (item.part_group?.product_type?.subfamily?.family?.description) {
        console.log('DEBUG: Family found:', item.part_group.product_type.subfamily.family.description);
        filters.families.add(item.part_group.product_type.subfamily.family.description);
      } else {
        console.log('DEBUG: No family found for item:', item);
      }
      
      // Extrair subfamília do part_group
      if (item.part_group?.product_type?.subfamily?.description) {
        filters.subfamilies.add(item.part_group.product_type.subfamily.description);
      }
      
      // Extrair tipo de produto do part_group
      if (item.part_group?.product_type?.description) {
        filters.productTypes.add(item.part_group.product_type.description);
      }
      
      // Extrair marca dos nomes da peça
      if (item.names) {
        item.names.forEach((name: any) => {
          if (name.brand && name.brand.name && name.brand.name !== 'N/A') {
            filters.brands.add(name.brand.name);
          }
        });
      }
    });

    return filters;
  };

  const handleLineToggle = (line: string) => {
    // Implementar filtro por linha
    console.log('Filtrar por linha:', line);
  };

  const handleManufacturerToggle = (manufacturer: string) => {
    // Implementar filtro por montadora
    console.log('Filtrar por montadora:', manufacturer);
  };

  const handleModelToggle = (model: string) => {
    // Implementar filtro por modelo
    console.log('Filtrar por modelo:', model);
  };

  const handleBrandToggle = (brand: string) => {
    // Implementar filtro por marca
    console.log('Filtrar por marca:', brand);
  };

  const handleFamilyToggle = (family: string) => {
    // Implementar filtro por família
    console.log('Filtrar por família:', family);
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    console.log('Filtrar por estado:', state);
    
    // Limpar cidade quando estado muda
    setSelectedCity('');
    
    // Refazer a busca com o novo filtro de estado
    if (searchMode === 'find') {
      setIsLoading(true);
      fetchProducts(currentSearchQuery).finally(() => setIsLoading(false));
    }
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    console.log('Filtrar por cidade:', city);
    
    // Refazer a busca com o novo filtro de cidade
    if (searchMode === 'find') {
      setIsLoading(true);
      fetchProducts(currentSearchQuery).finally(() => setIsLoading(false));
    }
  };

  const handleCepLocalize = () => {
    if (cepInput.trim()) {
      console.log('Localizando por CEP:', cepInput);
      
      // Determinar estado e cidade baseado no CEP
      let newState = '';
      let newCity = '';
      
      // Mapear CEP para estado/cidade (primeiros 2 dígitos)
      const cepPrefix = cepInput.substring(0, 2);
      if (cepPrefix === '01') {
        newState = 'SP';
        newCity = 'São Paulo';
      } else if (cepPrefix === '20') {
        newState = 'RJ';
        newCity = 'Rio de Janeiro';
      } else if (cepPrefix === '30') {
        newState = 'MG';
        newCity = 'Belo Horizonte';
      }
      
      // Atualizar filtros baseado no CEP
      setSelectedState(newState);
      setSelectedCity(newCity);
      
      // Refazer busca com CEP
      setIsLoading(true);
      fetchProducts(currentSearchQuery).finally(() => setIsLoading(false));
    }
  };



  const handleObsoleteToggle = () => {
    setIncludeObsolete(!includeObsolete);
    // Implementar filtro por obsoletos
    console.log('Incluir obsoletos:', !includeObsolete);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-600 rounded-lg mr-3 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h1 
                className="text-2xl font-bold text-gray-800 cursor-pointer hover:text-red-600 transition-colors duration-200"
                onClick={() => window.location.href = 'http://95.217.76.135:3000'}
              >
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
                <img src="/globe-icon.png" alt="Idioma" className="w-6 h-6" />
                <span className="text-gray-700 font-medium text-sm">PT</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={currentSearchQuery}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Digite o que você está procurando..."
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Autocomplete Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            <button 
              onClick={() => {
                setIsLoading(true);
                fetchProducts(currentSearchQuery).finally(() => setIsLoading(false));
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Buscar
            </button>
            <button 
              onClick={() => {
                setCurrentSearchQuery('');
                setProducts([]);
                setTotalResults(0);
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Limpar
            </button>
            <button 
              onClick={onBackToSearch}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Filtros */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              
              {/* Filtros específicos para "Onde Encontrar" */}
              {searchMode === 'find' && !companies.some(company => 
                searchQuery.toLowerCase().includes(company.name.toLowerCase())
              ) && (
                <>
                  {/* Localização */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Localização</h3>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">CEP</label>
                      <input
                        type="text"
                        value={cepInput}
                        onChange={(e) => setCepInput(e.target.value)}
                        placeholder="Informe o CEP"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                      <button 
                        onClick={handleCepLocalize}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm">Me localize</span>
                      </button>
                    </div>
                  </div>

                  {/* Estado */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado</h3>
                    <select 
                      value={selectedState}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Todos os estados</option>
                      <option value="SP">SP</option>
                      <option value="RJ">RJ</option>
                      <option value="MG">MG</option>
                    </select>
                  </div>

                  {/* Cidade */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Cidade</h3>
                    <select 
                      value={selectedCity}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Todas as cidades</option>
                      {cities
                        .filter(city => {
                          // Se não há estado selecionado, mostrar todas as cidades
                          if (!selectedState) return true;
                          
                          // Filtrar cidades por estado selecionado
                          const companiesInState = companies.filter(company => company.state === selectedState);
                          const citiesInState = companiesInState.map(company => company.city).filter(city => city);
                          return citiesInState.includes(city);
                        })
                        .map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                  </div>



                  {/* Toggle Obsoletos */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">Incluir peças obsoletas</label>
                      <button
                        onClick={handleObsoleteToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                          includeObsolete ? 'bg-red-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            includeObsolete ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Filtros gerais para ambos os modos */}
              <div className="space-y-6">
                {/* Linhas */}
                {availableFilters.lines && availableFilters.lines.size > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Linhas</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {Array.from(availableFilters.lines).map((line) => (
                        <label key={line} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            onChange={() => handleLineToggle(line)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700 font-medium">{line.toUpperCase()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Marca */}
                {availableFilters.brands && availableFilters.brands.size > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Marca</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {Array.from(availableFilters.brands).map((brand) => (
                        <label key={brand} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            onChange={() => handleBrandToggle(brand)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Montadora */}
                {availableFilters.manufacturers && availableFilters.manufacturers.size > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Montadora</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {Array.from(availableFilters.manufacturers).map((manufacturer) => (
                        <label key={manufacturer} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            onChange={() => handleManufacturerToggle(manufacturer)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{manufacturer}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modelo */}
                {availableFilters.models && availableFilters.models.size > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Modelo</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {Array.from(availableFilters.models).map((model) => (
                        <label key={model} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            onChange={() => handleModelToggle(model)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{model}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Família */}
                {availableFilters.families && availableFilters.families.size > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Família</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {Array.from(availableFilters.families).map((family) => (
                        <label key={family} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            onChange={() => handleFamilyToggle(family)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700 font-medium">{family.toUpperCase()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subfamília */}
                {availableFilters.subfamilies && availableFilters.subfamilies.size > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Subfamília</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {Array.from(availableFilters.subfamilies).map((subfamily) => (
                        <label key={subfamily} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            onChange={() => handleLineToggle(subfamily)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700 font-medium">{subfamily.toUpperCase()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tipo de Produto */}
                {availableFilters.productTypes && availableFilters.productTypes.size > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Tipo de Produto</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {Array.from(availableFilters.productTypes).map((productType) => (
                        <label key={productType} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            onChange={() => handleLineToggle(productType)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{productType}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600">Encontramos {totalResults.toLocaleString()} produtos.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
                  <select
                    // value={sortBy} // This line was removed as per the new_code
                    onChange={(e) => {
                      // setSortBy(e.target.value); // This line was removed as per the new_code
                    }}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="a-z">A-Z</option>
                    <option value="z-a">Z-A</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => onProductClick(product)}
                >
                  {/* Product Image */}
                  <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    <div className="text-center transform transition-transform duration-300 hover:scale-110">
                      <img src="/part-icon.png" alt="Peça" className="w-16 h-16 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">PartExplorer</p>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {product.partNumber}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {Math.ceil(totalResults / 16) > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                {/* Previous button */}
                <button
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      setIsLoading(true);
                      fetchProducts(currentSearchQuery).finally(() => setIsLoading(false));
                    }
                  }}
                  disabled={currentPage <= 1}
                  className={`px-3 py-2 rounded-md ${
                    currentPage <= 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  ←
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, Math.ceil(totalResults / 16)) }, (_, index) => {
                  const totalPages = Math.ceil(totalResults / 16);
                  let pageNumber;
                  
                  if (totalPages <= 5) {
                    pageNumber = index + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + index;
                  } else {
                    pageNumber = currentPage - 2 + index;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => {
                        setCurrentPage(pageNumber);
                        setIsLoading(true);
                        fetchProducts(currentSearchQuery).finally(() => setIsLoading(false));
                      }}
                      className={`px-3 py-2 rounded-md ${
                        currentPage === pageNumber
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {/* Next button */}
                <button
                  onClick={() => {
                    if (currentPage < Math.ceil(totalResults / 16)) {
                      setCurrentPage(currentPage + 1);
                      setIsLoading(true);
                      fetchProducts(currentSearchQuery).finally(() => setIsLoading(false));
                    }
                  }}
                  disabled={currentPage >= Math.ceil(totalResults / 16)}
                  className={`px-3 py-2 rounded-md ${
                    currentPage >= Math.ceil(totalResults / 16)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
};

export default SearchResults; 