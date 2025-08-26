import React, { useState, useEffect, useRef } from 'react';

interface Product {
  id: string;
  title: string;
  partNumber: string;
  image?: string;
  brand?: string;
}

interface SearchResultsProps {
  searchQuery: string;
  onBackToSearch: () => void;
  onProductClick: (product: any) => void;
  searchMode?: string; // Novo prop para identificar o modo
  plateSearchData?: any; // Dados da busca por placa
  carInfo?: any; // Informações do carro
  companies?: any[]; // Adicionar companies como prop opcional
  companySearchData?: any; // Dados da busca por empresa
}

const SearchResults: React.FC<SearchResultsProps> = ({ searchQuery, /* onBackToSearch, */ onProductClick, searchMode, plateSearchData, carInfo, companies = [], companySearchData }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResultsLoading, setIsResultsLoading] = useState(false);
  
  // Log para rastrear mudanças no estado de produtos
  useEffect(() => {
    // Só logar se houver produtos, ou se não houver produtos mas o carregamento inicial já terminou
    if (products.length > 0 || (products.length === 0 && !isLoading)) {
      console.log('📊 [STATE CHANGE] Produtos mudaram para:', products.length, 'produtos');
    }
  }, [products, isLoading]); // Adicionar isLoading às dependências
  // const [suggestions, setSuggestions] = useState<string[]>([]); // COMENTADO - não utilizado após remoção da busca superior
  
  // Cache para armazenar dados de páginas já carregadas
  const [pageCache, setPageCache] = useState<{[key: string]: any}>({});
  // const [showSuggestions, setShowSuggestions] = useState(false); // COMENTADO - não utilizado após remoção da busca superior
  
  // Ref para controlar requisições obsoletas
  const currentRequestRef = useRef<AbortController | null>(null);
  // const [currentSearchQuery, setCurrentSearchQuery] = useState(searchQuery); // COMENTADO - não utilizado após remoção da busca superior
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cepInput, setCepInput] = useState('');
  const [includeObsolete, setIncludeObsolete] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);

  // Buscar dados reais do backend - FORÇANDO NOVO DEPLOY
  const fetchProducts = async (query: string) => {
    console.log('🚀 [FETCH] Iniciando fetchProducts para query:', query, 'página:', currentPage, 'timestamp:', new Date().toISOString());
    console.log('🔍 [FETCH DEBUG] Stack trace:', new Error().stack?.split('\n').slice(1, 4).join('\n'));
    
    // Resetar filtros apenas se for uma busca completamente nova (não paginação)
    if (currentPage === 1 && !companySearchData && !plateSearchData) {
      console.log('🔄 [RESET] Resetando filtros para busca completamente nova');
      setIncludeObsolete(false);
      setShowAvailability(false);
    }
    
    // Criar chave única para o cache (query + página + filtros)
    const cacheKey = `${query}_${currentPage}_${includeObsolete}_${showAvailability}`;
    
    // Verificar se já temos os dados em cache
    if (pageCache[cacheKey]) {
      console.log('💾 [CACHE] Usando dados do cache para página:', currentPage);
      const cachedData = pageCache[cacheKey];
      setProducts(cachedData.products);
      setTotalResults(cachedData.total);
      setOriginalData(cachedData.originalData);
      setAvailableFilters(cachedData.filters);
      setIsLoading(false);
      return;
    }
    
    // Cancelar requisição anterior se existir
    if (currentRequestRef.current) {
      console.log('❌ [CANCEL] Cancelando requisição anterior para página:', currentPage);
      currentRequestRef.current.abort();
    }
    
    // Criar novo AbortController para esta requisição
    currentRequestRef.current = new AbortController();
    const abortController = currentRequestRef.current;
    
    console.log('🌐 [API] Fazendo requisição à API para página:', currentPage);
    try {
      // Se temos dados da busca por empresa E estamos na primeira página E NÃO há filtros ativos, usar eles diretamente
      if (companySearchData && companySearchData.results && currentPage === 1 && !includeObsolete && !showAvailability) {
        console.log('💾 [CACHE] Usando dados em cache da empresa (sem filtros)');
        const data = companySearchData;
        
        // Transformar dados do backend para o formato esperado
        const transformedProducts = data.results?.map((item: any, index: number) => {
          // Pegar o item do tipo 'desc' com o maior número de caracteres
          const descNames = item.names?.filter((n: any) => n.type === 'desc') || [];
          const descName = descNames.reduce((longest: any, current: any) => 
            (current.name?.length || 0) > (longest.name?.length || 0) ? current : longest, 
            { name: 'Produto sem nome' }
          );
          
          // Para busca por empresa, mostrar o primeiro SKU
          const skuNames = item.names?.filter((n: any) => n.type === 'sku') || [];
          const selectedSku = skuNames[0] || { name: 'N/A' };
          
          // Buscar a primeira imagem disponível
          let firstImage = null;
          if (item.images && item.images.length > 0) {
            firstImage = item.images[0].url || item.images[0];
          } else if (item.image) {
            firstImage = item.image;
          }
          
          return {
            id: item.id || item.part_group?.id || `product_${index}`,
            title: descName?.name || 'Produto sem nome',
            partNumber: selectedSku?.name || 'N/A',
            image: firstImage || '/placeholder-product.jpg',
            brand: selectedSku?.name || null
          };
        }) || [];
        
        setProducts(transformedProducts);
        setTotalResults(data.total || 0);
        
        // Armazenar dados originais para filtragem
        setOriginalData(data.results || []);
        
        // Extrair filtros dos resultados
        const filters = extractFiltersFromResults(data.results || []);
        setAvailableFilters(filters);
        
        setIsLoading(false);
        return;
      }
      
      // Se temos dados da empresa mas não estamos na primeira página, fazer nova busca
      if (companySearchData && companySearchData.results && currentPage > 1) {
        // Continuar com a busca normal abaixo
      }
      
      // Se temos dados da busca por placa, usar eles diretamente (apenas primeira página)
      if (searchMode === 'plate' && plateSearchData && plateSearchData.parts && currentPage === 1) {
        const data = plateSearchData.parts;
        
        // Transformar dados do backend para o formato esperado
        const transformedProducts = data.results?.map((item: any, index: number) => {
          // Pegar o item do tipo 'desc' com o maior número de caracteres
          const descNames = item.names?.filter((n: any) => n.type === 'desc') || [];
          let descName = { name: 'Produto sem nome' };
          if (descNames.length > 0) {
            descName = descNames.reduce((longest: any, current: any) => 
              (current.name?.length || 0) > (longest.name?.length || 0) ? current : longest, 
              descNames[0]
            );
          }
          
          // Para busca por placa, mostrar o primeiro SKU
          const skuNames = item.names?.filter((n: any) => n.type === 'sku') || [];
          const selectedSku = skuNames[0] || { name: 'N/A' };
          
          // Buscar a primeira imagem disponível
          let firstImage = null;
          if (item.images && item.images.length > 0) {
            firstImage = item.images[0].url || item.images[0];
          } else if (item.image) {
            firstImage = item.image;
          }
          
          return {
            id: item.id || item.part_group?.id || `product_${index}`,
            title: descName?.name || 'Produto sem nome',
            partNumber: selectedSku?.name || 'N/A',
            image: firstImage || '/placeholder-product.jpg',
            brand: selectedSku?.name || null
          };
        }) || [];
        
        setProducts(transformedProducts);
        setTotalResults(data.total || 0);
        
        // Armazenar dados originais para filtragem
        setOriginalData(data.results || []);
        
        // Extrair filtros dos resultados
        const filters = extractFiltersFromResults(data.results || []);
        setAvailableFilters(filters);
        
        setIsLoading(false);
        return;
      }
      
      // Para busca por placa em outras páginas, fazer nova requisição à API
      if (searchMode === 'plate' && currentPage > 1) {
        // Extrair a placa da query (remover hífen se existir)
        const plate = query.replace('-', '');
        const apiUrl = `http://95.217.76.135:8080/api/v1/plate-search/${plate}?page=${currentPage}&pageSize=16`;
        
        console.log('🚗 [PLATE API] Chamando API:', apiUrl);
        
        try {
          const response = await fetch(apiUrl, { signal: abortController.signal });
          if (response.ok) {
            const data = await response.json();
            
            // Verificar se houve erro na API
            if (!data.success) {
              console.error('❌ [PLATE API ERROR] Erro na API:', data.error || data.details);
              setProducts([]);
              setTotalResults(0);
              setIsLoading(false);
              return;
            }
            
            if (data.data?.parts) {
              const partsData = data.data.parts;
              
              // Aplicar filtros se necessário
              let filteredResults = partsData.results || [];
              
              // Filtrar por obsoletos se especificado
              if (includeObsolete) {
                filteredResults = filteredResults.filter((item: any) => {
                  return item.stocks && item.stocks.some((stock: any) => stock.obsolete === true);
                });
              }
              
              // Filtrar por disponibilidade se especificado
              if (showAvailability) {
                filteredResults = filteredResults.filter((item: any) => {
                  return item.stocks && item.stocks.some((stock: any) => stock.quantity > 0);
                });
              }
              
              // Atualizar total com base nos filtros
              const totalFiltered = filteredResults.length;
              console.log('🔍 [FILTER DEBUG] Total original:', partsData.results?.length || 0, 'Total filtrado:', totalFiltered, 'includeObsolete:', includeObsolete, 'showAvailability:', showAvailability);
              
              // Transformar dados do backend para o formato esperado
              const transformedProducts = filteredResults.map((item: any, index: number) => {
                // Pegar o item do tipo 'desc' com o maior número de caracteres
                const descNames = item.names?.filter((n: any) => n.type === 'desc') || [];
                let descName = { name: 'Produto sem nome' };
                if (descNames.length > 0) {
                  descName = descNames.reduce((longest: any, current: any) => 
                    (current.name?.length || 0) > (longest.name?.length || 0) ? current : longest, 
                    descNames[0]
                  );
                }
                
                // Para busca por placa, mostrar o primeiro SKU
                const skuNames = item.names?.filter((n: any) => n.type === 'sku') || [];
                const selectedSku = skuNames[0] || { name: 'N/A' };
                
                // Buscar a primeira imagem disponível
                let firstImage = null;
                if (item.images && item.images.length > 0) {
                  firstImage = item.images[0].url || item.images[0];
                } else if (item.image) {
                  firstImage = item.image;
                }
                
                return {
                  id: item.id || item.part_group?.id || `product_${index}`,
                  title: descName?.name || 'Produto sem nome',
                  partNumber: selectedSku?.name || 'N/A',
                  image: firstImage || '/placeholder-product.jpg',
                  brand: selectedSku?.name || null
                };
              }) || [];
              
              // Salvar dados no cache
              const cacheKey = `${query}_${currentPage}_${includeObsolete}_${showAvailability}`;
              const cacheData = {
                products: transformedProducts,
                total: totalFiltered,
                originalData: filteredResults,
                filters: extractFiltersFromResults(filteredResults)
              };
              setPageCache(prev => ({ ...prev, [cacheKey]: cacheData }));
              console.log('💾 [CACHE] Salvando dados no cache para página:', currentPage);
              
              setProducts(transformedProducts);
              setTotalResults(totalFiltered);
              
              // Armazenar dados originais para filtragem
              setOriginalData(filteredResults);
              
              // Extrair filtros dos resultados
              const filters = extractFiltersFromResults(filteredResults);
              setAvailableFilters(filters);
              
              setIsLoading(false);
              return;
            }
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            console.log('❌ [CANCEL] Requisição cancelada para página:', currentPage);
            return;
          }
          console.error('Erro ao buscar página da busca por placa:', error);
        }
      }
      
      let apiUrl;
      
      // Determinar tipo de busca baseado no modo
      if (searchMode === 'find') {
        // Busca por localização (modo onde encontrar)
        const isCompanySearch = companies.some(company => 
          query.toLowerCase().includes(company.name.toLowerCase())
        );
        
        // Se temos companySearchData, é definitivamente uma busca por empresa
        if (companySearchData && companySearchData.results) {
          apiUrl = `http://95.217.76.135:8080/api/v1/search?company=${encodeURIComponent(query)}&searchMode=find&page_size=16&page=${currentPage}`;
        } else if (isCompanySearch) {
          apiUrl = `http://95.217.76.135:8080/api/v1/search?company=${encodeURIComponent(query)}&searchMode=find&page_size=16&page=${currentPage}`;
        } else if (selectedCity && !query.trim() && !selectedState) {
          // Caso especial: apenas cidade selecionada (sem query nem estado)
          apiUrl = `http://95.217.76.135:8080/api/v1/search?city=${encodeURIComponent(selectedCity)}&searchMode=find&page_size=16&page=${currentPage}`;

        } else if (selectedState && !query.trim()) {
          // Caso especial: apenas estado selecionado (sem query)
          apiUrl = `http://95.217.76.135:8080/api/v1/search?state=${encodeURIComponent(selectedState)}&searchMode=find&page_size=16&page=${currentPage}`;

        } else {
          apiUrl = `http://95.217.76.135:8080/api/v1/search?q=${encodeURIComponent(query)}&page_size=16&page=${currentPage}`;
        }
        
        // Adicionar filtros se selecionados (apenas quando há query)
        if (selectedState && query.trim()) {
          apiUrl += `&state=${encodeURIComponent(selectedState)}`;

        }
        if (selectedCity && query.trim()) {
          apiUrl += `&city=${encodeURIComponent(selectedCity)}`;

        }
        if (cepInput.trim()) {
          apiUrl += `&cep=${encodeURIComponent(cepInput.trim())}`;

        }

      } else {
        // Busca normal (modo catálogo)
        apiUrl = `http://95.217.76.135:8080/api/v1/search?q=${encodeURIComponent(query)}&page_size=16&page=${currentPage}`;
      }
      
      // Adicionar filtros de obsoletos e disponibilidade
      if (includeObsolete) {
        apiUrl += `&include_obsolete=true`;
        console.log('🔧 [FILTER] Adicionando filtro obsoletos: true');
      }
      if (showAvailability) {
        apiUrl += `&available_only=true`;
        console.log('🔧 [FILTER] Adicionando filtro estoque: true');
      }
      
      console.log('🔧 [FILTER] URL final da API:', apiUrl);
      console.log('🔧 [FILTER] searchMode:', searchMode);
      console.log('🔧 [FILTER] companySearchData:', !!companySearchData);
      console.log('🔧 [FILTER] includeObsolete:', includeObsolete);
      console.log('🔧 [FILTER] showAvailability:', showAvailability);
      

      
              const response = await fetch(apiUrl, { signal: abortController.signal });
        if (response.ok) {
          const data = await response.json();
          console.log('📊 [API RESPONSE] Dados recebidos - página:', currentPage, 'total:', data.total, 'resultados:', data.results?.length, 'URL chamada:', apiUrl);
          
          // Aplicar filtros client-side ANTES da transformação
          let filteredResults = data.results || [];
          
          // Verificar se é busca por SKU específico (exato)
          const isExactSkuSearch = query.length >= 3 && query.length <= 10 && /^[A-Z0-9]+$/i.test(query);
          
          if (isExactSkuSearch) {
            // Para busca exata por SKU, filtrar apenas o item que tem o SKU exato
            filteredResults = filteredResults.filter((item: any) => {
              const skuNames = item.names?.filter((n: any) => n.type === 'sku') || [];
              return skuNames.some((sku: any) => 
                sku.name?.toUpperCase() === query.toUpperCase()
              );
            });
            console.log('🎯 [SKU EXACT] Busca por SKU exato:', query, '- Resultados filtrados:', filteredResults.length);
          }
          
          // Filtrar por obsoletos se especificado
          if (includeObsolete) {
            filteredResults = filteredResults.filter((item: any) => {
              return item.stocks && item.stocks.some((stock: any) => stock.obsolete === true);
            });
          }
          
          // Filtrar por disponibilidade se especificado
          if (showAvailability) {
            filteredResults = filteredResults.filter((item: any) => {
              return item.stocks && item.stocks.some((stock: any) => stock.quantity > 0);
            });
          }
          
          // Transformar dados filtrados para o formato esperado
          const transformedProducts = filteredResults.map((item: any, index: number) => {
          // Pegar o item do tipo 'desc' com o maior número de caracteres
          const descNames = item.names?.filter((n: any) => n.type === 'desc') || [];
          let descName = { name: 'Produto sem nome' };
          if (descNames.length > 0) {
            descName = descNames.reduce((longest: any, current: any) => 
              (current.name?.length || 0) > (longest.name?.length || 0) ? current : longest, 
              descNames[0]
            );
            
          }
          
          // Determinar o SKU correto baseado no tipo de busca
          const searchQueryUpper = query.toUpperCase();
          const skuNames = item.names?.filter((n: any) => n.type === 'sku') || [];

          
          // Verificar se é busca por SKU direto
          const directSku = skuNames.find((n: any) => 
            n.name?.toUpperCase() === searchQueryUpper
          );
          
          // Verificar se é busca por marca
          const brandSku = skuNames.find((n: any) => 
            n.brand?.name?.toUpperCase().includes(searchQueryUpper)
          );
          
          // Determinar qual SKU mostrar
          let selectedSku = null;
          if (directSku) {
            // Busca por SKU direto - mostrar o SKU pesquisado
            selectedSku = directSku;
          } else if (brandSku) {
            // Busca por marca - mostrar o SKU da marca
            selectedSku = brandSku;
          } else {
            // Busca por nome/descrição/placa/empresa - mostrar o primeiro SKU
            selectedSku = skuNames[0] || { name: 'N/A' };
          }
          
          const skuName = selectedSku;
          
          // Buscar a primeira imagem disponível
          let firstImage = null;
          if (item.images && item.images.length > 0) {
            firstImage = item.images[0].url || item.images[0];
          } else if (item.image) {
            firstImage = item.image;
          }
          
          // SKU selecionado para mostrar abaixo do título
          const brandSkuName = selectedSku?.name || null;
          
          // Usar o nome real do SKU
          const displayCode = skuName?.name || 'N/A';
          
          const transformedProduct = {
            id: item.id || item.part_group?.id || `product_${index}`,
            title: cleanModelName(descName?.name) || 'Produto sem nome',
            partNumber: displayCode,
            image: firstImage || '/placeholder-product.jpg',
            brand: brandSkuName
          };
          return transformedProduct;
        }) || [];
        
        // Salvar dados no cache
        const cacheKey = `${query}_${currentPage}_${includeObsolete}_${showAvailability}`;
        const cacheData = {
          products: transformedProducts,
          total: filteredResults.length,
          originalData: filteredResults,
          filters: extractFiltersFromResults(filteredResults)
        };
        setPageCache(prev => ({ ...prev, [cacheKey]: cacheData }));
        console.log('💾 [CACHE] Salvando dados no cache para página:', currentPage);
        
        // Armazenar dados originais para filtragem
        setOriginalData(filteredResults);
        setProducts(transformedProducts);
        setTotalResults(filteredResults.length);
        
        // DEBUG: Verificar se o filtro SKU exato funcionou
        if (isExactSkuSearch) {
          console.log('🔍 [DEBUG] Total original da API:', data.total);
          console.log('🔍 [DEBUG] Total após filtro SKU exato:', filteredResults.length);
          console.log('🔍 [DEBUG] Total definido no estado:', filteredResults.length);
        }
        
        // Extrair filtros dos resultados
        const filters = extractFiltersFromResults(data.results || []);
        setAvailableFilters(filters);
      } else {
        console.error('❌ [API ERROR] Erro na resposta da API:', response.status);
        console.log('🧹 [STATE CLEAR] Limpando estado devido a erro da API');
        setProducts([]);
        setTotalResults(0);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('❌ [CANCEL] Requisição cancelada para página:', currentPage);
        return;
      }
      console.error('❌ [FETCH ERROR] Erro ao buscar produtos:', error);
      console.log('🧹 [STATE CLEAR] Limpando estado devido a erro no fetch');
      setProducts([]);
      setTotalResults(0);
    }
  };

  // Função para limpar nome do modelo (remover prefixos desnecessários)
  const cleanModelName = (modelName: string) => {
    if (!modelName) return modelName;
    
    // Regras de limpeza
    const cleanRules = [
      { pattern: /^CHEV\s+/i, replacement: '' }, // Remove "CHEV " do início
      // Adicionar mais regras aqui conforme necessário
    ];
    
    let cleanedName = modelName;
    cleanRules.forEach(rule => {
      cleanedName = cleanedName.replace(rule.pattern, rule.replacement);
    });
    
    return cleanedName;
  };

  // Buscar sugestões reais da API - COMENTADO - não utilizado após remoção da busca superior
  /*
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
  */

  // Efeito para mudanças na busca (resetar página)
  useEffect(() => {
    console.log('🔄 [SEARCH CHANGE] Mudança na busca detectada:', {
      searchQuery,
      includeObsolete,
      showAvailability,
      companySearchData: !!companySearchData,
      plateSearchData: !!plateSearchData,
      searchMode
    });
    
    // Resetar página quando a busca muda
    setCurrentPage(1);
    
    // Fazer fetchProducts aqui para busca inicial
    if (searchQuery) {
      console.log('🚀 [INITIAL SEARCH] Iniciando busca inicial para:', searchQuery);
      setIsLoading(true);
      fetchProducts(searchQuery).finally(() => setIsLoading(false));
    }
  }, [searchQuery, includeObsolete, showAvailability, companySearchData, plateSearchData, searchMode]);

  // Efeito para mudanças de página (sem resetar)
  useEffect(() => {
    console.log('🔄 [PAGINATION] Mudança de página detectada:', {
      currentPage,
      searchMode,
      searchQuery,
      totalResults
    });
    
    // Só fazer requisição se não estiver carregando inicialmente E se não for página 1 (que já foi feita na busca inicial)
    if (isLoading || (currentPage === 1 && searchQuery)) {
      console.log('⏳ [PAGINATION] Ignorando mudança de página - carregamento inicial ou página 1 já carregada');
      return;
    }
    
    // Para busca por placa, sempre fazer nova requisição quando mudar página
    if (searchMode === 'plate') {
      console.log('🚗 [PLATE] Fazendo nova requisição para página:', currentPage);
      setIsResultsLoading(true);
      fetchProducts(searchQuery).finally(() => setIsResultsLoading(false));
      return;
    }
    
    // Para outras buscas, fazer nova requisição quando mudar página
    console.log('🔍 [SEARCH] Fazendo nova requisição para página:', currentPage);
    setIsResultsLoading(true);
    fetchProducts(searchQuery).finally(() => setIsResultsLoading(false));
  }, [currentPage]);

  // Debug: Log quando searchQuery muda
  useEffect(() => {
    console.log('🔍 [QUERY CHANGE] searchQuery mudou para:', searchQuery);
  }, [searchQuery]);

  // Debug: Log quando searchMode muda
  useEffect(() => {
    console.log('🎭 [MODE CHANGE] searchMode mudou para:', searchMode);
  }, [searchMode]);

  // Debug: Log quando produtos mudam (apenas se não for estado inicial)
  useEffect(() => {
    if (products.length > 0 || (products.length === 0 && !isLoading)) {
      console.log('📦 [PRODUCTS UPDATE] Produtos atualizados:', products.length, 'página atual:', currentPage, 'timestamp:', new Date().toISOString());
    }
  }, [products, currentPage, isLoading]);

  // Processar dados da empresa quando chegarem
  useEffect(() => {
    console.log('🏢 [COMPANY DEBUG] companySearchData mudou:', {
      hasData: !!companySearchData,
      hasResults: !!(companySearchData && companySearchData.results),
      resultsLength: companySearchData?.results?.length || 0,
      pageSize: companySearchData?.page_size,
      total: companySearchData?.total
    });
    
    if (companySearchData && companySearchData.results) {
      console.log('🏢 [COMPANY] Processando dados da empresa recebidos');
      // NÃO fazer fetchProducts aqui - os dados já estão em companySearchData
      // O fetchProducts será chamado pelo useEffect de searchQuery, mas será ignorado
      // porque companySearchData existe e será usado diretamente
    }
  }, [companySearchData]);

  // Dados originais para filtragem
  const [originalData, setOriginalData] = useState<any[]>([]);

  // Filtros ativos
  const [activeFilters, setActiveFilters] = useState({
    ceps: [] as string[],
    families: [] as string[],
    subfamilies: [] as string[],
    productTypes: [] as string[],
    lines: [] as string[],
    manufacturers: [] as string[],
    models: [] as string[],
    brands: [] as string[]
  });

  // Extrair filtros dos dados reais
  const [availableFilters, setAvailableFilters] = useState({
    ceps: new Set<string>(),
    families: new Set<string>(),
    subfamilies: new Set<string>(),
    productTypes: new Set<string>(),
    lines: new Set<string>(),
    manufacturers: new Set<string>(),
    models: new Set<string>(),
    brands: new Set<string>()
  });

  // Aplicar filtros quando activeFilters, includeObsolete ou showAvailability mudar
  useEffect(() => {
    if (originalData.length > 0) {
      applyFilters();
    }
  }, [activeFilters, includeObsolete, showAvailability, originalData]);





  const extractFiltersFromResults = (results: any[]) => {
    const filters = {
      ceps: new Set<string>(),
      families: new Set<string>(),
      subfamilies: new Set<string>(),
      productTypes: new Set<string>(),
      lines: new Set<string>(),
      manufacturers: new Set<string>(),
      models: new Set<string>(),
      brands: new Set<string>()
    };

    results.forEach((item) => {
      
      // Extrair CEPs das empresas que têm estoque
      if (item.stocks && Array.isArray(item.stocks)) {
        item.stocks.forEach((stock: any) => {
          if (stock.company && stock.company.zip_code) {
            filters.ceps.add(stock.company.zip_code);
          }
        });
      }
      
      // Extrair aplicações (linha, montadora, modelo) - apenas se tiver aplicações válidas
      if (item.applications && Array.isArray(item.applications) && item.applications.length > 0) {
        item.applications.forEach((app: any) => {
          if (app.line) {
            filters.lines.add(app.line);
          }
          if (app.manufacturer) {
            filters.manufacturers.add(app.manufacturer);
          }
          if (app.model) {
            filters.models.add(app.model);
          }
        });
              }

              // Extrair família do part_group (está aninhada dentro de subfamily)
        if (item.part_group?.product_type?.subfamily?.family?.description) {
          filters.families.add(item.part_group.product_type.subfamily.family.description);
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
      if (item.names && Array.isArray(item.names)) {
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
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters.lines.includes(line)) {
        newFilters.lines = newFilters.lines.filter(l => l !== line);
      } else {
        newFilters.lines = [...newFilters.lines, line];
      }
      return newFilters;
    });
  };

  const handleManufacturerToggle = (manufacturer: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters.manufacturers.includes(manufacturer)) {
        newFilters.manufacturers = newFilters.manufacturers.filter(m => m !== manufacturer);
      } else {
        newFilters.manufacturers = [...newFilters.manufacturers, manufacturer];
      }
      return newFilters;
    });
  };

  const handleModelToggle = (model: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters.models.includes(model)) {
        newFilters.models = newFilters.models.filter(m => m !== model);
      } else {
        newFilters.models = [...newFilters.models, model];
      }
      return newFilters;
    });
  };

  const handleBrandToggle = (brand: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters.brands.includes(brand)) {
        newFilters.brands = newFilters.brands.filter(b => b !== brand);
      } else {
        newFilters.brands = [...newFilters.brands, brand];
      }
      return newFilters;
    });
  };



  const handleFamilyToggle = (family: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters.families.includes(family)) {
        newFilters.families = newFilters.families.filter(f => f !== family);
      } else {
        newFilters.families = [...newFilters.families, family];
      }
      return newFilters;
    });
  };

  const handleSubfamilyToggle = (subfamily: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters.subfamilies.includes(subfamily)) {
        newFilters.subfamilies = newFilters.subfamilies.filter(s => s !== subfamily);
      } else {
        newFilters.subfamilies = [...newFilters.subfamilies, subfamily];
      }
      return newFilters;
    });
  };

  const handleProductTypeToggle = (productType: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters.productTypes.includes(productType)) {
        newFilters.productTypes = newFilters.productTypes.filter(p => p !== productType);
      } else {
        newFilters.productTypes = [...newFilters.productTypes, productType];
      }
      return newFilters;
    });
  };

  // Função para aplicar filtros dinamicamente
  const applyFilters = () => {
    if (originalData.length === 0) {
      return;
    }

    // Sempre começar com todos os dados originais
    let filteredData = [...originalData];

    // Aplicar filtros de estoque e obsoletos primeiro
    if (showAvailability) {
      filteredData = filteredData.filter(item => {
        // Considerar null/undefined como 0 em estoque
        const hasStock = item.stocks && item.stocks.length > 0 && 
          item.stocks.some((stock: any) => (stock.quantity || 0) > 0);
        return hasStock;
      });
    }

    if (!includeObsolete) {
      filteredData = filteredData.filter(item => {
        // Considerar null/undefined como não obsoleto
        const isObsolete = item.stocks && item.stocks.some((stock: any) => stock.obsolete === true);
        return !isObsolete;
      });
    }

    // Aplicar filtros de aplicação (montadora e modelo) juntos
    if (activeFilters.manufacturers.length > 0 || activeFilters.models.length > 0) {
      filteredData = filteredData.filter(item => {
        // Se o item não tem aplicações, não deve aparecer quando filtros de aplicação estão ativos
        if (!item.applications || item.applications.length === 0) {
          return false;
        }
        
        // Verificar se o item tem pelo menos uma aplicação que atende aos filtros
        const hasValidApplication = item.applications.some((app: any) => {
          const manufacturerMatch = activeFilters.manufacturers.length === 0 || 
            activeFilters.manufacturers.includes(app.manufacturer);
          const modelMatch = activeFilters.models.length === 0 || 
            activeFilters.models.includes(app.model);
          
          return manufacturerMatch && modelMatch;
        });
        
        return hasValidApplication;
      });
    }

    if (activeFilters.families.length > 0) {
      filteredData = filteredData.filter(item => {
        const family = item.part_group?.product_type?.subfamily?.family?.description;
        return family && activeFilters.families.includes(family);
      });
    }

    if (activeFilters.subfamilies.length > 0) {
      filteredData = filteredData.filter(item => {
        const subfamily = item.part_group?.product_type?.subfamily?.description;
        return subfamily && activeFilters.subfamilies.includes(subfamily);
      });
    }

    if (activeFilters.productTypes.length > 0) {
      filteredData = filteredData.filter(item => {
        const productType = item.part_group?.product_type?.description;
        return productType && activeFilters.productTypes.includes(productType);
      });
    }

    if (activeFilters.lines.length > 0) {
      filteredData = filteredData.filter(item => {
        return item.applications?.some((app: any) => 
          activeFilters.lines.includes(app.line)
        );
      });
    }

    if (activeFilters.brands.length > 0) {
      filteredData = filteredData.filter(item => {
        return item.names?.some((name: any) => 
          name.brand?.name && activeFilters.brands.includes(name.brand.name)
        );
      });
    }



    // Transformar dados filtrados
    const transformedProducts = filteredData.map((item: any, index: number) => {
      // Pegar o item do tipo 'desc' com o maior número de caracteres
      const descNames = item.names?.filter((n: any) => n.type === 'desc') || [];
      let descName = { name: 'Produto sem nome' };
      if (descNames.length > 0) {
        descName = descNames.reduce((longest: any, current: any) => 
          (current.name?.length || 0) > (longest.name?.length || 0) ? current : longest, 
          descNames[0]
        );
      }
      
      // Determinar o SKU correto baseado no tipo de busca
      const searchQueryUpper = searchQuery.toUpperCase();
      const skuNames = item.names?.filter((n: any) => n.type === 'sku') || [];
      
      // Verificar se é busca por SKU direto
      const directSku = skuNames.find((n: any) => 
        n.name?.toUpperCase() === searchQueryUpper
      );
      
      // Verificar se é busca por marca
      const brandSku = skuNames.find((n: any) => 
        n.brand?.name?.toUpperCase().includes(searchQueryUpper)
      );
      
      // Determinar qual SKU mostrar
      let selectedSku = null;
      if (directSku) {
        // Busca por SKU direto - mostrar o SKU pesquisado
        selectedSku = directSku;
      } else if (brandSku) {
        // Busca por marca - mostrar o SKU da marca
        selectedSku = brandSku;
      } else {
        // Busca por nome/descrição/placa/empresa - mostrar o primeiro SKU
        selectedSku = skuNames[0] || { name: 'N/A' };
      }
      
      const skuName = selectedSku;
      
      // Buscar a primeira imagem disponível
      let firstImage = null;
      if (item.images && item.images.length > 0) {
        firstImage = item.images[0].url || item.images[0];
      } else if (item.image) {
        firstImage = item.image;
      }
      
      // SKU selecionado para mostrar abaixo do título
      const brandSkuName = selectedSku?.name || null;
      
      // Usar o nome real do SKU
      const displayCode = skuName?.name || 'N/A';
      
      return {
        id: item.id || item.part_group?.id || `product_${index}`,
        title: descName?.name || 'Produto sem nome',
        partNumber: displayCode,
        image: firstImage || '/placeholder-product.jpg',
        brand: brandSkuName
      };
    });

    setProducts(transformedProducts);
    // Não sobrescrever totalResults aqui - manter o total original da API

    // Atualizar filtros disponíveis baseado nos dados filtrados
    const newFilters = extractFiltersFromResults(filteredData);
    setAvailableFilters(newFilters);
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    console.log('Filtrar por estado:', state);
    
    // Limpar cidade quando estado muda
    setSelectedCity('');
    
    // Refazer a busca com o novo filtro de estado
    if (searchMode === 'find') {
      setIsLoading(true);
      fetchProducts(searchQuery).finally(() => setIsLoading(false));
    }
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    console.log('Filtrar por cidade:', city);
    
    // Refazer a busca com o novo filtro de cidade
    if (searchMode === 'find') {
      setIsLoading(true);
      fetchProducts(searchQuery).finally(() => setIsLoading(false));
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
      fetchProducts(searchQuery).finally(() => setIsLoading(false));
    }
  };



  const handleObsoleteToggle = () => {
    console.log('🔘 [TOGGLE] Clicou em obsoleto - valor atual:', includeObsolete);
    const newValue = !includeObsolete;
    console.log('🔘 [TOGGLE] Novo valor obsoleto:', newValue);
    setIncludeObsolete(newValue);
    // Forçar nova busca com filtros atualizados
    setCurrentPage(1);
    setPageCache({});
  };

  const handleAvailabilityToggle = () => {
    console.log('🔘 [TOGGLE] Clicou em estoque - valor atual:', showAvailability);
    const newValue = !showAvailability;
    console.log('🔘 [TOGGLE] Novo valor estoque:', newValue);
    setShowAvailability(newValue);
    // Forçar nova busca com filtros atualizados
    setCurrentPage(1);
    setPageCache({});
  };

  // Loading inicial apenas na primeira renderização
  if (isLoading && products.length === 0) {
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

      {/* Search Bar - REMOVIDA */}

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
                      {(() => {
                        // Para busca por empresa, usar dados das empresas do grupo
                        const availableStates = new Set();
                        if (companySearchData && companySearchData.results && companySearchData.results.length > 0) {
                          // Extrair estados das empresas que têm estoque
                          companySearchData.results.forEach((item: any) => {
                            if (item.stocks && item.stocks.length > 0) {
                              item.stocks.forEach((stock: any) => {
                                if (stock.company && stock.company.state) {
                                  availableStates.add(stock.company.state);
                                }
                              });
                            }
                          });
                        }
                        return Array.from(availableStates).sort().map((state: any) => (
                          <option key={state} value={state}>{state}</option>
                        ));
                      })()}
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
                                              {(() => {
                          // Para busca por empresa, usar dados das empresas do grupo
                          const availableCities = new Set();
                          if (companySearchData && companySearchData.results && companySearchData.results.length > 0) {
                            // Extrair cidades das empresas que têm estoque
                            companySearchData.results.forEach((item: any) => {
                              if (item.stocks && item.stocks.length > 0) {
                                item.stocks.forEach((stock: any) => {
                                  if (stock.company && stock.company.city) {
                                    // Se há estado selecionado, filtrar por estado
                                    if (!selectedState || stock.company.state === selectedState) {
                                      availableCities.add(stock.company.city);
                                    }
                                  }
                                });
                              }
                            });
                          }
                          return Array.from(availableCities).sort().map((city: any) => (
                            <option key={city} value={city}>{city}</option>
                          ));
                        })()}
                    </select>
                  </div>



                </>
              )}

              {/* Toggles sempre visíveis */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">Filtrar Itens Obsoletos</label>
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

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">Filtrar Itens com Estoque</label>
                    <button
                      onClick={handleAvailabilityToggle}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                        showAvailability ? 'bg-red-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showAvailability ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Filtros gerais para ambos os modos */}
              <div className="space-y-6">


                {/* Família */}
                {availableFilters.families && availableFilters.families.size > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Família</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {Array.from(availableFilters.families).map((family) => (
                        <label key={family} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={activeFilters.families.includes(family)}
                            onChange={() => handleFamilyToggle(family)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{family}</span>
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
                            checked={activeFilters.subfamilies.includes(subfamily)}
                            onChange={() => handleSubfamilyToggle(subfamily)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{subfamily}</span>
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
                            checked={activeFilters.productTypes.includes(productType)}
                            onChange={() => handleProductTypeToggle(productType)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{productType}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linhas */}
                {availableFilters.lines && availableFilters.lines.size > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Linha</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {Array.from(availableFilters.lines).map((line) => (
                        <label key={line} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={activeFilters.lines.includes(line)}
                            onChange={() => handleLineToggle(line)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700 font-medium">{line.toUpperCase()}</span>
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
                            checked={activeFilters.manufacturers.includes(manufacturer)}
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
                            checked={activeFilters.models.includes(model)}
                            onChange={() => handleModelToggle(model)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{model}</span>
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
                            checked={activeFilters.brands.includes(brand)}
                            onChange={() => handleBrandToggle(brand)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{brand}</span>
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
              {/* Texto da pesquisa */}
              <div className="mb-3">
                <h2 className="text-xl font-semibold text-gray-800">
                  Resultados para: <span className="text-red-600">"{searchQuery}"</span>
                </h2>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  {!isLoading && totalResults > 0 ? (
                    <p className="text-gray-600">Encontramos {totalResults.toLocaleString()} produtos.</p>
                  ) : isLoading ? (
                    <p className="text-gray-600">Buscando produtos...</p>
                  ) : (
                    <p className="text-gray-600">Nenhum produto encontrado.</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
                  <select
                    // value={sortBy} // This line was removed as per the new_code
                    onChange={() => {
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

            {/* Loading apenas na área de resultados */}
            {isResultsLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Carregando resultados...</p>
                </div>
              </div>
            )}

            {/* Car Information - Only show for plate search */}
            {carInfo && searchMode === 'plate' && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-blue-800">Informações do Veículo</h3>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Car Image */}
                  <div className="flex-shrink-0">
                    {(() => {
                      // Buscar a primeira imagem das aplicações das peças
                      let carImage = null;
                      if (plateSearchData?.parts?.results && plateSearchData.parts.results.length > 0) {
                        const firstProduct = plateSearchData.parts.results[0];
                        if (firstProduct.applications && firstProduct.applications.length > 0) {
                          // Encontrar aplicação que corresponde ao carro atual
                          const matchingApp = firstProduct.applications.find((app: any) => 
                            app.manufacturer === carInfo.marca && 
                            app.model === carInfo.modelo?.split(' ')[0] // Pegar primeira palavra do modelo
                          );
                          if (matchingApp?.image) {
                            carImage = matchingApp.image;
                          } else if (firstProduct.applications[0]?.image) {
                            carImage = firstProduct.applications[0].image;
                          }
                        }
                      }
                      
                      return carImage ? (
                        <div className="w-32 h-24 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                          <img 
                            src={carImage} 
                            alt={`${carInfo.marca} ${carInfo.modelo}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const nextSibling = e.currentTarget.nextSibling as HTMLElement;
                              if (nextSibling) {
                                nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="text-center" style={{ display: 'none' }}>
                            <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className="w-32 h-24 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                      );
                    })()}
                  </div>
                  
                  {/* Car Details */}
                  <div className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Marca:</span>
                        <p className="text-gray-900">{carInfo.marca || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Modelo:</span>
                        <p className="text-gray-900">{carInfo.modelo || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Ano:</span>
                        <p className="text-gray-900">{carInfo.ano || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Versão:</span>
                        <p className="text-gray-900">{carInfo.versao || carInfo.ano_modelo || carInfo.ano || 'N/A'}</p>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      As peças mostradas são compatíveis com este veículo.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => onProductClick(product)}
                >
                  {/* Product Image */}
                  <div className="h-48 bg-white flex items-center justify-center overflow-hidden">
                    {product.image && product.image !== '/placeholder-product.jpg' ? (
                      <img 
                        src={product.image} 
                        alt={product.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextSibling = e.currentTarget.nextSibling as HTMLElement;
                          if (nextSibling) {
                            nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className="text-center transform transition-transform duration-300 hover:scale-110" style={{ display: product.image && product.image !== '/placeholder-product.jpg' ? 'none' : 'flex' }}>
                      <img src="/part-icon.png" alt="Peça" className="w-16 h-16 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Catalogo</p>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm uppercase">
                      {product.title}
                    </h3>
                    {product.brand && (
                      <p className="text-sm text-red-600 font-medium">
                        {product.brand}
                      </p>
                    )}
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
                      console.log('⬅️ [PREV] Clique no botão anterior - página atual:', currentPage, '-> nova página:', currentPage - 1);
                      setCurrentPage(currentPage - 1);
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
                  console.log('🔢 [PAGINATION DEBUG] totalResults:', totalResults, 'totalPages:', totalPages, 'currentPage:', currentPage);
                  let pageNumber: number;
                  
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
                        console.log('🔢 [PAGE] Clique na página:', pageNumber, '- página atual:', currentPage);
                        setCurrentPage(pageNumber);
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
                      console.log('➡️ [NEXT] Clique no botão próximo - página atual:', currentPage, '-> nova página:', currentPage + 1);
                      setCurrentPage(currentPage + 1);
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
};

export default SearchResults; 