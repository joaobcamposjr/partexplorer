function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                PartExplorer
              </h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Sobre
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Contato
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Loja
              </a>
            </nav>

            {/* Language Selector */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5a2 2 0 002 2h.01M15 3.935V5a2 2 0 012 2v.01M8 3.935V3.935M15 3.935V3.935" />
                </svg>
                <span className="text-gray-700 font-medium">PT</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section with Search */}
        <section className="bg-gradient-to-b from-orange-50 to-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main Title */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Qual peça você está procurando?
              </h2>
              <p className="text-lg text-gray-600">
                Encontre as peças que você precisa de forma rápida e fácil
              </p>
            </div>

            {/* Search Tabs */}
            <div className="flex justify-center mb-8">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button className="px-4 py-2 rounded-md text-sm font-medium bg-white text-gray-800 shadow-sm">
                  Pesquisar tudo
                </button>
                <button className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-800">
                  Categoria
                </button>
                <button className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-800">
                  Marcas
                </button>
                <button className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-800">
                  Fabricantes
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Digite o nome da peça, código ou marca..."
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-full focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Popular Searches */}
            <div className="text-center mt-8">
              <p className="text-gray-700 mb-3">Buscas populares:</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
                  Amortecedor dianteiro
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
                  Pastilha de freio
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
                  Filtro de óleo
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
                  Correia dentada
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
                  Bateria automotiva
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Slider */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Nossos Parceiros
              </h3>
              <p className="text-gray-600">
                Trabalhamos com as melhores marcas do mercado
              </p>
            </div>

            <div className="relative overflow-hidden">
              <div className="flex animate-scroll">
                {/* Primeira linha de logos */}
                {['Amazonas', 'Orletti', 'Ford', 'GM', 'Volkswagen', 'Fiat', 'Toyota', 'Honda'].map((partner, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 mx-8 flex items-center justify-center"
                    style={{ minWidth: '120px' }}
                  >
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-24 h-16 flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-sm">
                        {partner}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Duplicar para efeito contínuo */}
                {['Amazonas', 'Orletti', 'Ford', 'GM', 'Volkswagen', 'Fiat', 'Toyota', 'Honda'].map((partner, index) => (
                  <div
                    key={`duplicate-${index}`}
                    className="flex-shrink-0 mx-8 flex items-center justify-center"
                    style={{ minWidth: '120px' }}
                  >
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-24 h-16 flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-sm">
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
      <footer className="bg-gray-100 border-t border-gray-200">
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
  )
}

export default App 