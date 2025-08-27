import React, { useState, useEffect } from 'react';
import SearchResults from './components/SearchResults';
import ProductDetail from './components/ProductDetail';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  // const [showSuggestions, setShowSuggestions] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // const [includeObsolete, setIncludeObsolete] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Array de banners com URLs das imagens
  const banners = [
    // Página 1
    { id: 1, url: "https://d2lqd82paitn9j.cloudfront.net/loja_multimarcas.jpg", alt: "Banner 1" },
    { id: 2, url: "https://scontent.fcgh39-1.fna.fbcdn.net/v/t39.30808-6/366319971_122098398362002793_4872592219685059890_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=wHK101Axi-EQ7kNvwH3G8mX&_nc_oc=AdnLACJvnci_w4v8-TjJktuDmHAnYToSGVPCi4k_i2K2995eXPRXMe_f8XfSyj1eHa0j86WViT9QV4AzWN81WrzO&_nc_zt=23&_nc_ht=scontent.fcgh39-1.fna&_nc_gid=wB__7lo4foO0-yFGg4LV-Q&oh=00_AfWRHEZGaxkmR6NIeAJY5KZjphkCIPU4RtU4kTwufJOSzA&oe=68B4307B", alt: "Banner 2" },
    { id: 3, url: "https://scontent.fcgh39-1.fna.fbcdn.net/v/t39.30808-6/471354190_998391418994310_8044535907662938705_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=EV4OCwJzRC0Q7kNvwECGc_8&_nc_oc=AdkLZsGq1wsk2GEddA5xPAsp-aV0w3L0tUiGqRFxyZ152664N9-65uu8aD2pJZI5ewjqv3oz50oz47KFJOOR4d2N&_nc_zt=23&_nc_ht=scontent.fcgh39-1.fna&_nc_gid=KU2DHzQbn0C_O7IQNi2Lcw&oh=00_AfWnmXVZibHb0KeMNfr15kQzhgJuTX3Ci4I0o4JJOR3ziA&oe=68B4203D", alt: "Banner 3" },
    // Página 2
    { id: 4, url: "https://d2lqd82paitn9j.cloudfront.net/loja_multimarcas.jpg", alt: "Banner 4" },
    { id: 5, url: "https://scontent.fcgh39-1.fna.fbcdn.net/v/t39.30808-6/366319971_122098398362002793_4872592219685059890_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=wHK101Axi-EQ7kNvwH3G8mX&_nc_oc=AdnLACJvnci_w4v8-TjJktuDmHAnYToSGVPCi4k_i2K2995eXPRXMe_f8XfSyj1eHa0j86WViT9QV4AzWN81WrzO&_nc_zt=23&_nc_ht=scontent.fcgh39-1.fna&_nc_gid=wB__7lo4foO0-yFGg4LV-Q&oh=00_AfWRHEZGaxkmR6NIeAJY5KZjphkCIPU4RtU4kTwufJOSzA&oe=68B4307B", alt: "Banner 5" },
    { id: 6, url: "https://scontent.fcgh39-1.fna.fbcdn.net/v/t39.30808-6/471354190_998391418994310_8044535907662938705_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=EV4OCwJzRC0Q7kNvwECG4d2N&_nc_zt=23&_nc_ht=scontent.fcgh39-1.fna&_nc_gid=KU2DHzQbn0C_O7IQNi2Lcw&oh=00_AfWnmXVZibHb0KeMNfr15kQzhgJuTX3Ci4I0o4JJOR3ziA&oe=68B4203D", alt: "Banner 6" }
  ];

  // Auto-rotation a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // const [selectedState, setSelectedState] = useState('');
  const [plateSearchData, setPlateSearchData] = useState<any>(null);
  const [searchMode, setSearchMode] = useState<'search' | 'plate' | 'find'>('search');
  // const [selectedCity, setSelectedCity] = useState('');
 // Ref para controlar drag de forma síncrona

  // Buscar empresas da API
  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://95.217.76.135:8080/api/v1/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    }
  };

  // Buscar marcas da API
  const fetchBrands = async () => {
    try {
      const response = await fetch('http://95.217.76.135:8080/api/v1/brands');
      if (response.ok) {
        const data = await response.json();
        setBrands(data.brands || []);
      }
    } catch (error) {
      console.error('Erro ao buscar marcas:', error);
    }
  };

  // Função para buscar URL da marca
  const getBrandLogoUrl = (brandName: string) => {
    const brand = brands.find(b => b.name.toUpperCase() === brandName.toUpperCase());
    return brand?.logo_url || `https://logo.clearbit.com/${brandName.toLowerCase()}.com`;
  };

  useEffect(() => {
    fetchCompanies();
    fetchBrands();
  }, []);

  // Auto-rotation removido conforme solicitado

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
    
    console.log('🔍 [SEARCH] Iniciando busca com query:', searchQuery);
    console.log('🔍 [SEARCH] Estados atuais - isSearching:', isSearching, 'showResults:', showResults);
    
    // Mudar para tela de loading imediatamente
    setIsSearching(true);
    // setShowSuggestions(false);
    setShowResults(false);
    
    console.log('🔍 [SEARCH] Estados após mudança - isSearching: true, showResults: false');
    
    try {
            // Verificar se é uma placa (formato brasileiro: 3 letras + 4 números OU 3 letras + hífen + 4 números)
      const isPlate = /^[A-Za-z]{3}[0-9]{4}$/.test(searchQuery) || /^[A-Za-z]{3}-[0-9]{4}$/.test(searchQuery);
      console.log('🔍 [SEARCH] É placa?', isPlate, 'Query:', searchQuery);
      
      if (isPlate) {
        console.log('🚗 [PLATE] Detectada placa, fazendo busca por placa...');
        const startTime = Date.now();
        // Remover tracinho se existir (ex: EBH-0173 -> EBH0173)
        const plateForSearch = searchQuery.replace('-', '');
        const response = await fetch(`http://95.217.76.135:8080/api/v1/plate-search/${plateForSearch}`);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log('🚗 [PLATE] Response status:', response.status, 'Duration:', duration + 'ms');
        
        if (response.ok) {
          const data = await response.json();
          console.log('🚗 [PLATE] Dados retornados:', data);
          console.log('🚗 [PLATE] Cache usado?', duration < 1000 ? 'SIM (cache)' : 'NÃO (busca externa)');
          
          // Armazenar dados da busca por placa
          if (data.success && data.data) {
            setPlateSearchData(data.data);
            setSearchMode('plate');
          } else {
            setPlateSearchData(null);
            setSearchMode('search');
          }
        } else {
          const errorText = await response.text();
          console.error('🚗 [PLATE] Erro na busca por placa:', response.status, errorText);
          setPlateSearchData(null);
          setSearchMode('search');
        }
      } else {
        setPlateSearchData(null);
        setSearchMode('search');
      }
    } catch (error) {
      console.error('🔍 [SEARCH] Erro na busca:', error);
    } finally {
      // Sempre mostrar resultados após a busca (com sucesso ou erro)
      console.log('🔍 [SEARCH] Finalizando busca - mudando para resultados');
      setIsSearching(false);
      setShowResults(true);
      console.log('🔍 [SEARCH] Estados finais - isSearching: false, showResults: true');
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length >= 2) {
      const newSuggestions = await fetchSuggestions(value);
      setSuggestions(newSuggestions);
      // setShowSuggestions(newSuggestions.length > 0);
    } else {
      // setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setSearchQuery(suggestion);
    // setShowSuggestions(false);
    
    // Submeter automaticamente a pesquisa
    setIsSearching(true);
    
    try {
              const response = await fetch(`http://95.217.76.135:8080/api/v1/search?q=${encodeURIComponent(suggestion)}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Resultados da busca:', data);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
    }
    
    setTimeout(() => {
      setIsSearching(false);
      setShowResults(true);
    }, 1000);
  };

  // const handleBackToSearch = () => {
  //   setShowResults(false);
  //   setSearchQuery('');
  // };

  const handleProductClick = (product: any) => {
    console.log('DEBUG: Produto clicado:', product);
    console.log('DEBUG: ID do produto:', product.id);
    setSelectedProduct(product);
    setShowProductDetail(true);
    setShowResults(false);
  };

  const handleBackToResults = () => {
    setShowProductDetail(false);
    setShowResults(true);
    setSelectedProduct(null);
  };

  const handleBackToSearch = () => {
    setShowResults(false);
    setCompanySearchData(null); // Limpar dados da empresa
    setPlateSearchData(null); // Limpar dados da placa
    setSearchMode('search'); // Resetar modo
  };

  // const handleBackToHome = () => {
  //   setShowResults(false);
  //   setShowProductDetail(false);
  //   setSelectedProduct(null);
  //   setSearchQuery('');
  // };



  // const popularSearches = [
  //   'Amortecedor dianteiro',
  //   'Pastilha de freio',
  //   'Filtro de óleo',
  //   'Correia dentada',
  //   'Bateria automotiva',
  //   'Rolamento',
  //   'Junta do cabeçote',
  //   'Bomba de água'
  // ];

  // const states = [
  //   { code: 'SP', name: 'São Paulo' },
  //   { code: 'RJ', name: 'Rio de Janeiro' },
  //   { code: 'MG', name: 'Minas Gerais' }
  // ];

  const [companySearchData, setCompanySearchData] = useState<any>(null);

  const handleCompanyClick = async (groupName: string) => {
    // Filtrar por empresa - buscar todas as peças que a empresa tem em estoque
    console.log('Filtrar por empresa com group_name:', groupName);
    console.log('Empresas disponíveis:', companies);
    
    if (groupName) {
      console.log('Fazendo busca por grupo:', groupName);
      setSearchQuery(groupName);
      setSearchMode('find');

      setShowResults(true);
      
      // Fazer a busca automaticamente usando o parâmetro company com group_name
      try {
        const response = await fetch(`http://95.217.76.135:8080/api/v1/search?company=${encodeURIComponent(groupName)}&searchMode=find&page_size=16&page=1`);
        if (response.ok) {
          const data = await response.json();
          console.log('Resultados da busca por grupo:', data);
          setCompanySearchData(data); // Armazenar dados da empresa
        } else {
          console.error('Erro na resposta da API:', response.status);
          setCompanySearchData(null);
        }
      } catch (error) {
        console.error('Erro na busca por empresa:', error);
        setCompanySearchData(null);
      }
    } else {
      console.error('Group name não fornecido');
    }
  };

  // const handleStateChange = (stateCode: string) => {
  //   // Filtrar por estado
  //   console.log('Filtrar por estado:', stateCode);
  //   // Implementar filtro por estado
  // };

  // const handleCityChange = (cityName: string) => {
  //   // Filtrar por cidade
  //   console.log('Filtrar por cidade:', cityName);
  //   // Implementar filtro por cidade
  // };



  // // Get unique states from companies
  // const getUniqueStates = () => {
  //   console.log('DEBUG: Empresas disponíveis:', companies);
  //   const states = companies
  //     .map(company => company.state)
  //     .filter(state => state && state.trim() !== '')
  //     .filter((state, index, arr) => arr.indexOf(state) === index)
  //     .sort();
  //   
  //   console.log('DEBUG: Estados únicos encontrados:', states);
  //   return states;
  // };

  // Renderizar tela de loading se isSearching for true
  if (isSearching) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Buscando...</h2>
          <p className="text-gray-600">Aguarde enquanto processamos sua busca</p>
        </div>
      </div>
    );
  }

  // Renderizar página de resultados se showResults for true
  if (showResults) {
    // Se for placa, remover tracinho para a busca
    const processedQuery = /^[A-Za-z]{3}-[0-9]{4}$/.test(searchQuery) 
      ? searchQuery.replace('-', '') 
      : searchQuery;
      
    return <SearchResults 
      searchQuery={processedQuery} 
      onBackToSearch={handleBackToSearch}
      onProductClick={handleProductClick}
      searchMode={searchMode}
      plateSearchData={plateSearchData}
      carInfo={plateSearchData?.car_info}
      companySearchData={companySearchData}
      companies={companies}
    />;
  }

  // Renderizar página de detalhes do produto se showProductDetail for true
  if (showProductDetail && selectedProduct) {
    return <ProductDetail productId={selectedProduct.id} onBackToResults={handleBackToResults} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navbar */}
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
              <h1 className="text-2xl font-bold text-gray-800">
                Catalogo
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

      {/* Main Content */}
      <main className="flex-1">
        {/* Banner Slider - NOVO SLIDE */}
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
                            {/* Banner Carousel - 3 BANNERS POR PÁGINA COM LOOP */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-800 ease-in-out"
                  style={{ 
                    transform: `translateX(-${currentBannerIndex * 100}%)`
                  }}
                >
                  {/* Criar páginas com 3 banners cada */}
                  {Array.from({ length: banners.length }, (_, pageIndex) => {
                    // Calcular os 3 banners para esta página
                    const banner1Index = pageIndex;
                    const banner2Index = (pageIndex + 1) % banners.length;
                    const banner3Index = (pageIndex + 2) % banners.length;
                    
                    return (
                      <div key={pageIndex} className="flex-shrink-0 w-full flex gap-4">
                        {/* Banner 1 (lateral esquerdo) */}
                        <div className="flex-1 h-[200px] rounded-lg overflow-hidden shadow-xl transform scale-95">
                          <img 
                            src={banners[banner1Index].url} 
                            alt={banners[banner1Index].alt}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Banner 2 (central - foco) */}
                        <div className="flex-1 h-[220px] rounded-xl overflow-hidden shadow-xl transform scale-105">
                          <img 
                            src={banners[banner2Index].url} 
                            alt={banners[banner2Index].alt}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Banner 3 (lateral direito) */}
                        <div className="flex-1 h-[200px] rounded-lg overflow-hidden shadow-xl transform scale-95">
                          <img 
                            src={banners[banner3Index].url} 
                            alt={banners[banner3Index].alt}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Navegação - Setas */}
              <button 
                onClick={() => setCurrentBannerIndex(prev => prev === 0 ? banners.length - 1 : prev - 1)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                onClick={() => setCurrentBannerIndex(prev => prev === banners.length - 1 ? 0 : prev + 1)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Indicadores - Bolinhas */}
              <div className="flex justify-center mt-4 space-x-2">
                {banners.map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => setCurrentBannerIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      currentBannerIndex === index ? 'bg-red-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>



        {/* Hero Section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">


               {/* Frase de Efeito */}
               <div className="text-center mb-8">
                 <h2 className="text-5xl font-bold text-gray-800 mb-2">
                   O Maior Estoque de Peças Online
                 </h2>
                 <p className="text-lg text-gray-600">
                   Encontre a peça certa para seu veículo
                 </p>
               </div>

               {/* Search Form */}
               <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
                 <div className="flex gap-4 items-center">
                   {/* Main Search Input */}
                   <div className="flex-1 relative">
                     <input
                       type="text"
                       value={searchQuery}
                       onChange={handleInputChange}
                                            placeholder="Digite o nome da peça, código, marca ou placa..."
                       className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm"
                     />
                     {/* Suggestions Dropdown */}
                     {suggestions.length > 0 && (
                       <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                         {suggestions.map((suggestion, index) => (
                           <button
                             key={index}
                             type="button"
                             onClick={() => handleSuggestionClick(suggestion)}
                             className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                           >
                             {suggestion}
                           </button>
                         ))}
                       </div>
                     )}
                   </div>



                   {/* Search Button */}
                   <button
                     type="submit"
                     className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors duration-200 shadow-sm w-12 h-12 flex items-center justify-center"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                     </svg>
                   </button>
                 </div>
               </form>

               {/* Partner Slider - Movido para entre pesquisa e marcas */}
               <section className="py-20 bg-white mt-12 w-screen -ml-[calc(50vw-50%)] -mr-[calc(50vw-50%)]">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                   <div className="text-center mb-8">
                     <h3 className="text-2xl font-bold text-gray-800 mb-2">Empresas Parceiras</h3>
                     <p className="text-gray-600">Encontre peças das melhores empresas do mercado</p>
                   </div>
                   <div className="relative overflow-hidden max-w-7xl mx-auto">
                     {/* Partner Logos Slider */}
                     <div className="overflow-hidden">
                       <div 
                         className="flex animate-scroll slider-container"
                         onMouseEnter={(e) => {
                           const target = e.currentTarget;
                           target.style.animationPlayState = 'paused';
                         }}
                         onMouseLeave={(e) => {
                           const target = e.currentTarget;
                           target.style.animationPlayState = 'running';
                         }}
                       >
                         {companies
                           .filter((company, index, self) => 
                             index === self.findIndex(c => c.group_name === company.group_name)
                           )
                           .map((company, index) => (
                           <div
                             key={company.id || index}
                             onClick={() => handleCompanyClick(company.group_name || '')}
                             className="flex-shrink-0 w-48 h-24 bg-white border border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:shadow-lg transition-all duration-200 relative z-10 mx-4"
                           >
                             {company.image_url ? (
                               <>
                                 <img 
                                   src={company.image_url} 
                                   alt={company.name}
                                   className="max-w-full max-h-full object-contain pointer-events-none"
                                   onError={(e) => {
                                     const target = e.currentTarget as HTMLImageElement;
                                     target.style.display = 'none';
                                     const nextSibling = target.nextElementSibling as HTMLElement;
                                     if (nextSibling) {
                                       nextSibling.style.display = 'flex';
                                     }
                                   }}
                                 />
                                 <span className="text-gray-600 font-medium text-center px-4 pointer-events-none hidden">{company.name}</span>
                               </>
                             ) : (
                               <span className="text-gray-600 font-medium text-center px-4 pointer-events-none">{company.name}</span>
                             )}
                           </div>
                         ))}
                         {/* Duplicar empresas para loop infinito */}
                         {companies
                           .filter((company, index, self) => 
                             index === self.findIndex(c => c.group_name === company.group_name)
                           )
                           .map((company, index) => (
                           <div
                             key={`duplicate-${company.id || index}`}
                             onClick={() => handleCompanyClick(company.group_name || '')}
                             className="flex-shrink-0 w-48 h-24 bg-white border border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:shadow-lg transition-all duration-200 relative z-10 mx-4"
                           >
                             {company.image_url ? (
                               <>
                                 <img 
                                   src={company.image_url} 
                                   alt={company.name}
                                   className="max-w-full max-h-full object-contain pointer-events-none"
                                   onError={(e) => {
                                     const target = e.currentTarget as HTMLImageElement;
                                     target.style.display = 'none';
                                     const nextSibling = target.nextElementSibling as HTMLElement;
                                     if (nextSibling) {
                                       nextSibling.style.display = 'flex';
                                     }
                                   }}
                                 />
                                 <span className="text-gray-600 font-medium text-center px-4 pointer-events-none hidden">{company.name}</span>
                               </>
                             ) : (
                               <span className="text-gray-600 font-medium text-center px-4 pointer-events-none">{company.name}</span>
                             )}
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>
                 </div>
               </section>

                {/* Busca por Marcas */}
                <div className="text-center mb-16 mt-12">
                  <p className="text-gray-700 mb-4 font-medium">Busca por Marcas:</p>
                  {/* Primeira fileira de 7 marcas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 max-w-6xl mx-auto">
                    {brands.length > 0 && ['Toyota', 'Renault', 'Ford', 'Chevrolet', 'Chery', 'Fiat', 'Honda'].map((brandName, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchQuery(brandName);
                          setShowResults(true);
                        }}
                        className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-red-300"
                      >
                        <div className="w-32 h-20 bg-white rounded-lg flex items-center justify-center mb-2">
                          <img 
                            src={getBrandLogoUrl(brandName)}
                            alt={brandName}
                            className="w-20 h-16 object-contain"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <span className="text-gray-500 text-base font-bold hidden">
                            {brandName.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {/* Segunda fileira de 7 marcas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 max-w-6xl mx-auto mt-4">
                    {brands.length > 0 && ['Volkswagen', 'Hyundai', 'Jeep', 'Kia', 'Nissan', 'Peugeot', 'Ram'].map((brandName, index) => (
                      <button
                        key={index + 7}
                        onClick={() => {
                          setSearchQuery(brandName);
                          setShowResults(true);
                        }}
                        className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-red-300"
                      >
                        <div className="w-32 h-20 bg-white rounded-lg flex items-center justify-center mb-2">
                          <img 
                            src={getBrandLogoUrl(brandName)}
                            alt={brandName}
                            className="w-20 h-16 object-contain"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <span className="text-gray-500 text-base font-bold hidden">
                            {brandName.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {/* Terceira fileira de 7 marcas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 max-w-6xl mx-auto mt-4">
                    {brands.length > 0 && ['Citroen', 'Audi', 'BYD', 'Volvo', 'Scania', 'Iveco', 'Mercedes'].map((brandName, index) => (
                      <button
                        key={index + 14}
                        onClick={() => {
                          setSearchQuery(brandName);
                          setShowResults(true);
                        }}
                        className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-red-300"
                      >
                        <div className="w-32 h-20 bg-white rounded-lg flex items-center justify-center mb-2">
                          <img 
                            src={getBrandLogoUrl(brandName)}
                            alt={brandName}
                            className="w-20 h-16 object-contain"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <span className="text-gray-500 text-base font-bold hidden">
                            {brandName.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
            </div>
          </div>
        </section>

        {/* Features Section - Por que escolher o PartExplorer? */}
        <section className="py-16 bg-white">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Por que escolher o Catalogo?
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                A plataforma mais completa para encontrar peças automotivas
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Busca Inteligente</h4>
                <p className="text-gray-600">Encontre peças rapidamente com nossa tecnologia de busca avançada</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Catálogo Completo</h4>
                <p className="text-gray-600">Milhares de peças de todas as marcas e modelos</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <footer className="bg-gray-100 text-gray-800 py-8">
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
                <li className="text-gray-700">Email: contato@Catalogo.com</li>
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
              © 2025 Catalogo. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 