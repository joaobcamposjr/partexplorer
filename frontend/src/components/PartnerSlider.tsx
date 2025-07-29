import React from 'react'

const PartnerSlider: React.FC = () => {
  const partners = [
    { name: 'Amazonas', logo: '/amazonas.png' },
    { name: 'Orletti', logo: '/orletti.png' },
    { name: 'Ford', logo: '/ford.png' },
    { name: 'GM', logo: '/gm.png' },
    { name: 'Volkswagen', logo: '/vw.png' },
    { name: 'Fiat', logo: '/fiat.png' },
    { name: 'Toyota', logo: '/toyota.png' },
    { name: 'Honda', logo: '/honda.png' }
  ]

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-secondary-800 mb-2">
            Nossos Parceiros
          </h3>
          <p className="text-secondary-600">
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
                style={{ minWidth: '120px' }}
              >
                <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 w-24 h-16 flex items-center justify-center">
                  <span className="text-secondary-600 font-medium text-sm">
                    {partner.name}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Duplicar para efeito contínuo */}
            {partners.map((partner, index) => (
              <div
                key={`duplicate-${index}`}
                className="flex-shrink-0 mx-8 flex items-center justify-center"
                style={{ minWidth: '120px' }}
              >
                <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 w-24 h-16 flex items-center justify-center">
                  <span className="text-secondary-600 font-medium text-sm">
                    {partner.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default PartnerSlider 