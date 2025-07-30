import React, { useState, useEffect } from 'react';

interface Product {
  id: string;
  title: string;
  partNumber: string;
  brand: string;
  applications: string[];
  price: number;
  stockCount: number;
  isObsolete?: boolean;
  image?: string;
}

interface SearchResultsProps {
  searchQuery: string;
  onBackToSearch: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ searchQuery, onBackToSearch }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [showOnlyObsolete, setShowOnlyObsolete] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  // Dados simulados baseados no print
  const mockProducts: Product[] = [
    {
      id: '1',
      title: 'PEDAL DO FREIO',
      partNumber: '35218562024',
      brand: 'BMW',
      applications: ['BMW'],
      price: 523.22,
      stockCount: 1,
      image: '/placeholder-product.jpg'
    },
    {
      id: '2',
      title: 'PEDAL DE FREIO',
      partNumber: '4B4F721100',
      brand: 'Yamaha',
      applications: ['Yamaha'],
      price: 213.75,
      stockCount: 2,
      image: '/placeholder-product.jpg'
    },
    {
      id: '3',
      title: 'PEDAL DE FREIO',
      partNumber: '35218392702',
      brand: 'BMW',
      applications: ['BMW'],
      price: 2443.08,
      stockCount: 1,
      isObsolete: true,
      image: '/placeholder-product.jpg'
    },
    {
      id: '4',
      title: 'PEDAL DE FREIO',
      partNumber: '123456789',
      brand: 'Honda',
      applications: ['Honda'],
      price: 977.30,
      stockCount: 2,
      image: '/placeholder-product.jpg'
    }
  ];

  const brands = ['Genuína', 'Honda Motos', 'Yamaha', 'UNIVERSAL', 'Fiat', 'Peugeot', 'Volkswagen', 'Jeep', 'Kia', 'Renault-Estoril'];
  const manufacturers = ['Honda Motos', 'Yamaha', 'Fiat', 'Peugeot', 'Volkswagen', 'Ford', 'Renault'];

  useEffect(() => {
    // Simular carregamento
    setTimeout(() => {
      setProducts(mockProducts);
      setTotalResults(1368);
      setLoading(false);
    }, 1000);
  }, []);

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handleManufacturerToggle = (manufacturer: string) => {
    setSelectedManufacturers(prev => 
      prev.includes(manufacturer) 
        ? prev.filter(m => m !== manufacturer)
        : [...prev, manufacturer]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando resultados...</p>
          </div>
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
              <div className="w-8 h-8 bg-orange-500 rounded-lg mr-3 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                PartExplorer
              </h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8 absolute left-1/2 transform -translate-x-1/2">
              <a href="#" className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Fornecedores</a>
              <a href="#" className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Lotes de Peças</a>
              <a href="#" className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Como funciona</a>
              <a href="#" className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Dúvidas</a>
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 text-sm">06293-030</span>
              <button className="text-gray-700 hover:text-gray-900 text-sm font-medium">Entrar</button>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                Anunciar
              </button>
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
                value={searchQuery}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Digite o que você está procurando..."
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
              Buscar
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
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
              {/* Localização */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Localização</h3>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">CEP</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Informe o CEP"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm">Me localize</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Mostrar apenas Obsoletos */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Mostrar apenas Obsoletos</label>
                  <button
                    onClick={() => setShowOnlyObsolete(!showOnlyObsolete)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showOnlyObsolete ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showOnlyObsolete ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Marcas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Marcas</h3>
                <input
                  type="text"
                  placeholder="Pesquisar por mais resultados..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {brands.map((brand) => (
                    <label key={brand} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandToggle(brand)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Montadora */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Montadora</h3>
                <input
                  type="text"
                  placeholder="Pesquisar por mais resultados..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {manufacturers.map((manufacturer) => (
                    <label key={manufacturer} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedManufacturers.includes(manufacturer)}
                        onChange={() => handleManufacturerToggle(manufacturer)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{manufacturer}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600">Encontramos {totalResults.toLocaleString()} produtos.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="relevance">Relevância</option>
                    <option value="price-low">Menor preço</option>
                    <option value="price-high">Maior preço</option>
                    <option value="name">Nome</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  {/* Product Image */}
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-gray-500 text-sm">PeçaDireta</p>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    {product.isObsolete && (
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded mb-2">
                        OBSOLETO
                      </span>
                    )}
                    
                    <h3 className="font-bold text-gray-800 mb-2">
                      {product.title} - {product.partNumber}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Marca:</span> {product.brand}
                    </p>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Aplicações:</span> {product.applications.join(', ')}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-bold text-gray-800">
                          A partir de R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 text-green-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="text-sm font-medium">
                          {product.stockCount} loja(s) em estoque
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults; 