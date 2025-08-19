import React, { useState, useEffect } from 'react';

interface ProductDetailProps {
  productId: string;
  onBackToResults: () => void;
}

interface ProductDetail {
  id: string;
  title: string;
  partNumber: string;
  images: string[];
  applications: any[];
  similarProducts: any[];
  stocks: any[];
  technicalSpecs: any;
  names: any[]; // Adicionar names para produtos similares
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onBackToResults }) => {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [currentApplicationPage, setCurrentApplicationPage] = useState(1);
  const applicationsPerPage = 10;

  useEffect(() => {
    fetchProductDetail();
  }, [productId]);

  const fetchProductDetail = async () => {
    try {
      console.log('DEBUG: Buscando produto com ID:', productId);
      const response = await fetch(`http://95.217.76.135:8080/api/v1/parts/${productId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('DEBUG: Resposta da API:', data);
        
        if (data) {
          const productData = data;
          
          // Transformar dados para o formato esperado
          const transformedProduct: ProductDetail = {
            id: productData.part_group?.id || productId,
            title: productData.names?.find((n: any) => n.type === 'desc')?.name || 'Produto sem nome',
            partNumber: productData.names?.find((n: any) => n.type === 'sku')?.name || 'N/A',
            images: productData.images?.map((img: any) => img.url) || ['/part-icon.png'],
            applications: productData.applications || [],
            similarProducts: [], // Será preenchido com busca por SKUs similares
            stocks: productData.stocks || [],
            technicalSpecs: productData.part_group || {},
            names: productData.names || [] // Incluir names para produtos similares
          };
          
          console.log('DEBUG: Produto transformado:', transformedProduct);
          setProduct(transformedProduct);
        } else {
          console.error('DEBUG: Produto não encontrado ou erro na resposta');
        }
      } else {
        console.error('DEBUG: Erro na resposta da API:', response.status);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do produto:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = (company: any) => {
    const phone = company.mobile || company.phone;
    const sku = product?.partNumber;
            const message = `Olá, vim através do site ProEncalho e gostaria de fazer uma cotação da peça ${sku}`;
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePhoneClick = (company: any) => {
    setSelectedCompany(company);
    setShowPhoneModal(true);
  };

  const handleVehicleSearch = (searchTerm: string) => {
    setVehicleSearch(searchTerm);
    setCurrentApplicationPage(1);
  };

  const onBackToHome = () => {
    // Navegar diretamente para home na porta 3000
    window.location.href = 'http://95.217.76.135:3000';
  };

  // Filtrar aplicações baseado na busca
  const filteredApplications = product?.applications?.filter((app: any) => {
    if (!vehicleSearch) return true;
    const searchLower = vehicleSearch.toLowerCase();
    return (
      app.manufacturer?.toLowerCase().includes(searchLower) ||
      app.vehicle?.toLowerCase().includes(searchLower) ||
      app.model?.toLowerCase().includes(searchLower) ||
      app.engine?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Calcular paginação
  const totalApplicationPages = Math.ceil(filteredApplications.length / applicationsPerPage);
  const startIndex = (currentApplicationPage - 1) * applicationsPerPage;
  const endIndex = startIndex + applicationsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Produto não encontrado</p>
          <button 
            onClick={onBackToResults}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Voltar aos resultados
          </button>
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
                onClick={onBackToHome}
              >
                ProEncalho
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
                placeholder="Digite o nome ou código da peça"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
              Buscar
            </button>
            <button 
              onClick={onBackToResults}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Section - Gallery and Technical Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Panel - Product Images */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {product.title} - {product.partNumber}
            </h2>
            
            {/* Main Image */}
            <div className="mb-4">
              <div className="aspect-square bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            {/* Image Gallery */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden aspect-square ${
                      selectedImage === index ? 'border-red-600' : 'border-gray-200'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Technical Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-8">
              {/* Technical Specifications and Similar Products - Unificados */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Ficha Técnica</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Família:</span>
                    <span className="font-medium">{product.technicalSpecs?.product_type?.family?.description || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subfamília:</span>
                    <span className="font-medium">{product.technicalSpecs?.product_type?.subfamily?.description || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium">{product.technicalSpecs?.product_type?.description || 'N/A'}</span>
                  </div>
                  {product.technicalSpecs?.dimension && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Comprimento:</span>
                        <span className="font-medium">{product.technicalSpecs.dimension.length_mm}mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Largura:</span>
                        <span className="font-medium">{product.technicalSpecs.dimension.width_mm}mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Altura:</span>
                        <span className="font-medium">{product.technicalSpecs.dimension.height_mm}mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Peso:</span>
                        <span className="font-medium">{product.technicalSpecs.dimension.weight_kg}kg</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Similar Products */}
                <h3 className="text-xl font-bold text-gray-800 mb-4">Produtos Similares</h3>
                <div className="space-y-3">
                  {(() => {
                    console.log('🔍 [SIMILAR] Product names:', product.names);
                    const skuNames = product.names?.filter((name: any) => name.type === 'sku') || [];
                    console.log('🔍 [SIMILAR] SKU names found:', skuNames.length, skuNames);
                    
                    if (skuNames.length > 0) {
                      return skuNames.map((sku: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{sku.name}</span>
                            <span className="text-gray-600">{sku.brand?.name || 'N/A'}</span>
                          </div>
                        </div>
                      ));
                    } else {
                      return <p className="text-gray-500">Nenhum produto similar encontrado</p>;
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Full Width */}
        <div className="space-y-8">
          {/* Companies with Stock - Full Width */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Estoques disponíveis
            </h3>
            
            {/* Attention Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 text-sm">
                <strong>Atenção:</strong> Os preços podem variar conforme a região de entrega, 
                frete e impostos, a serem acordados entre vendedor e comprador.
              </p>
            </div>

            {/* Companies List - Ordenado por menor preço */}
            <div className="space-y-4">
              {product.stocks
                .sort((a, b) => (a.price || 0) - (b.price || 0))
                .map((stock, index) => (
                <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-green-800">{stock.company.name}</h4>
                      <p className="text-sm text-gray-600">{stock.company.city} / {stock.company.state}</p>
                    </div>
                    <div className="text-right">
                      {stock.obsolete && (
                        <span className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full mb-2">
                          OBSOLETO
                        </span>
                      )}
                      <p className="text-sm text-gray-600">Estoque: {stock.quantity}</p>
                      <p className="font-bold text-lg text-green-800">R$ {stock.price?.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleWhatsAppClick(stock.company)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      <span>Falar com o vendedor</span>
                    </button>
                    <button
                      onClick={() => handlePhoneClick(stock.company)}
                      className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>Ver telefone</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Applications - Full Width */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Aplicação</h3>
            <p className="text-gray-600 mb-4">Aqui você encontra as informações de aplicação desta peça.</p>
            
            {/* Vehicle Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Procurar veículo</label>
              <input
                type="text"
                placeholder="Digite o nome do veículo..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                onChange={(e) => handleVehicleSearch(e.target.value)}
              />
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Montadora</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Veículo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Modelo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Motor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Conf. Motor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Início</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Fim</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedApplications.map((app, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 border-b">{app.manufacturer}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b">{app.vehicle}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b">{app.model}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b">{app.engine}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b">{app.engine_config}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b">{app.year_start}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b">{app.year_end}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalApplicationPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setCurrentApplicationPage(Math.max(1, currentApplicationPage - 1))}
                  disabled={currentApplicationPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← ANTERIOR
                </button>
                <span className="text-sm text-gray-700">
                  {currentApplicationPage}/{totalApplicationPages}
                </span>
                <button
                  onClick={() => setCurrentApplicationPage(Math.min(totalApplicationPages, currentApplicationPage + 1))}
                  disabled={currentApplicationPage === totalApplicationPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  PRÓXIMO →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phone Modal */}
      {showPhoneModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Informações de Contato</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600">Empresa:</span>
                <p className="font-medium">{selectedCompany.name}</p>
              </div>
              {selectedCompany.phone && (
                <div>
                  <span className="text-gray-600">Telefone:</span>
                  <p className="font-medium">{selectedCompany.phone}</p>
                </div>
              )}
              {selectedCompany.mobile && (
                <div>
                  <span className="text-gray-600">Celular:</span>
                  <p className="font-medium">{selectedCompany.mobile}</p>
                </div>
              )}
              {selectedCompany.email && (
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{selectedCompany.email}</p>
                </div>
              )}
              <div>
                <span className="text-gray-600">Endereço:</span>
                <p className="font-medium">
                  {selectedCompany.street}, {selectedCompany.number}
                  <br />
                  {selectedCompany.neighborhood} - {selectedCompany.city}/{selectedCompany.state}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPhoneModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
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
                <li className="text-gray-700">Email: contato@proencalho.com</li>
                <li className="text-gray-700">Telefone: (XX) XXXX-XXXX</li>
                <li className="text-gray-700">Endereço: Rua Exemplo, 123, Cidade - UF</li>
              </ul>
            </div>

            {/* Coluna 4: Redes Sociais */}
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
              © 2025 ProEncalho. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetail; 