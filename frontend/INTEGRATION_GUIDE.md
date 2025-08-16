# Guia de Integração - Analytics Frontend

Este guia explica como integrar o sistema de analytics no frontend React do PartExplorer.

## 🚀 Instalação

### 1. Importar o Analytics
```javascript
import { useAnalytics } from '../utils/analytics';
import AnalyticsWidget from '../components/AnalyticsWidget';
```

### 2. Adicionar o Widget
```jsx
// No seu componente principal (App.jsx)
import AnalyticsWidget from './components/AnalyticsWidget';

function App() {
  return (
    <div className="App">
      {/* Seu conteúdo existente */}
      <AnalyticsWidget />
    </div>
  );
}
```

## 📊 Uso Básico

### Hook useAnalytics
```javascript
import { useAnalytics } from '../utils/analytics';

const MyComponent = () => {
  const analytics = useAnalytics();
  
  // Rastrear clique
  const handleClick = () => {
    analytics.trackClick(event.target, 'button');
  };
  
  // Rastrear ação
  const handleAction = () => {
    analytics.trackAction('user_login', { method: 'email' });
  };
  
  return (
    <button onClick={handleClick}>
      Clique aqui
    </button>
  );
};
```

## 🎯 Eventos Disponíveis

### 1. Page Views (Automático)
```javascript
// Rastreado automaticamente quando a página muda
// Não precisa fazer nada
```

### 2. Clicks (Automático)
```javascript
// Rastreado automaticamente em todos os cliques
// Para categorizar, use:
analytics.trackClick(element, 'category');
```

### 3. Ações Customizadas
```javascript
analytics.trackAction('action_name', {
  // dados adicionais
  userId: '123',
  category: 'user',
  value: 100
});
```

### 4. Buscas
```javascript
const handleSearch = (query, results) => {
  analytics.trackSearch(query, results.length);
};
```

### 5. Visualização de Peças
```javascript
const handlePartView = (part) => {
  analytics.trackPartView(
    part.id,
    part.name,
    part.category
  );
};
```

### 6. Erros
```javascript
// Rastreado automaticamente
// Para erros customizados:
try {
  // código que pode dar erro
} catch (error) {
  analytics.trackError(error, {
    context: 'payment_process',
    userId: user.id
  });
}
```

## 🎨 Personalização do Widget

### Estilos CSS
```css
/* Personalizar cores */
.analytics-widget {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --background-color: white;
  --text-color: #333;
}

/* Esconder o widget em produção */
.production .analytics-widget {
  display: none;
}
```

### Configuração
```javascript
// No analytics.js, você pode modificar:
const analytics = new Analytics({
  endpoint: '/api/analytics/event',
  batchSize: 10,
  flushInterval: 30000,
  debug: process.env.NODE_ENV === 'development'
});
```

## 📈 Métricas em Tempo Real

### Widget de Métricas
O widget mostra:
- **Tempo na página atual**
- **Eventos capturados na sessão**
- **Visitantes ativos no site**
- **Visualizações hoje**
- **Tempo médio de sessão**
- **Taxa de rejeição**

### API de Métricas
```javascript
// Buscar métricas em tempo real
const fetchMetrics = async () => {
  const response = await fetch('/api/analytics/realtime');
  const data = await response.json();
  
  console.log('Visitantes ativos:', data.visitors);
  console.log('Visualizações hoje:', data.pageViews);
};
```

## 🔧 Configuração Avançada

### 1. Filtros de Eventos
```javascript
// No analytics.js
class Analytics {
  constructor() {
    this.filters = [
      // Filtrar eventos de bots
      (event) => !event.userAgent.includes('bot'),
      // Filtrar eventos de desenvolvimento
      (event) => !event.url.includes('localhost')
    ];
  }
  
  sendEvent(eventData) {
    // Aplicar filtros
    if (this.filters.every(filter => filter(eventData))) {
      // enviar evento
    }
  }
}
```

### 2. Buffer Local
```javascript
// Os eventos são armazenados localmente antes do envio
// Para persistir entre sessões:
localStorage.setItem('analytics_buffer', JSON.stringify(events));
```

### 3. Modo Offline
```javascript
// Os eventos são armazenados quando offline
// E enviados quando a conexão é restaurada
window.addEventListener('online', () => {
  analytics.sendBatchEvents();
});
```

## 🎨 Exemplos de Implementação

### Componente de Busca
```jsx
import { useAnalytics } from '../utils/analytics';

const SearchComponent = () => {
  const analytics = useAnalytics();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleSearch = async (searchQuery) => {
    try {
      const response = await fetch(`/api/search?q=${searchQuery}`);
      const data = await response.json();
      
      setResults(data.results);
      
      // Rastrear busca
      analytics.trackSearch(searchQuery, data.results.length);
      
    } catch (error) {
      analytics.trackError(error, { context: 'search' });
    }
  };
  
  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
      />
      <button onClick={() => handleSearch(query)}>
        Buscar
      </button>
    </div>
  );
};
```

### Componente de Lista de Peças
```jsx
import { useAnalytics } from '../utils/analytics';

const PartsList = ({ parts }) => {
  const analytics = useAnalytics();
  
  const handlePartClick = (part) => {
    // Rastrear visualização de peça
    analytics.trackPartView(part.id, part.name, part.category);
    
    // Navegar para detalhes
    navigate(`/parts/${part.id}`);
  };
  
  return (
    <div className="parts-list">
      {parts.map(part => (
        <div 
          key={part.id}
          className="part-item"
          onClick={() => handlePartClick(part)}
        >
          <h3>{part.name}</h3>
          <p>{part.category}</p>
        </div>
      ))}
    </div>
  );
};
```

### Componente de Login
```jsx
import { useAnalytics } from '../utils/analytics';

const LoginForm = () => {
  const analytics = useAnalytics();
  
  const handleLogin = async (credentials) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        // Rastrear login bem-sucedido
        analytics.trackAction('login_success', {
          method: 'email',
          userId: credentials.email
        });
      } else {
        // Rastrear falha no login
        analytics.trackAction('login_failed', {
          method: 'email',
          reason: 'invalid_credentials'
        });
      }
      
    } catch (error) {
      analytics.trackError(error, { context: 'login' });
    }
  };
  
  return (
    <form onSubmit={handleLogin}>
      {/* campos do formulário */}
    </form>
  );
};
```

## 🔍 Debug e Desenvolvimento

### Modo Debug
```javascript
// No console do navegador
window.analytics = analytics; // Acesso global para debug

// Ver eventos capturados
console.log(analytics.events);

// Ver métricas atuais
console.log(analytics.getMetrics());
```

### Logs de Desenvolvimento
```javascript
// Os eventos são logados no console em desenvolvimento
// Para desabilitar:
analytics.debug = false;
```

## 📊 Visualização dos Dados

### Grafana
- Acesse: http://localhost:3001
- Credenciais: admin/admin123
- Dashboards disponíveis:
  - Nginx Overview
  - Business Metrics
  - System Performance

### Prometheus
- Acesse: http://localhost:9090
- Queries úteis:
  ```promql
  # Page views por minuto
  rate(analytics_pageviews_total[1m])
  
  # Tempo médio de sessão
  avg(analytics_session_duration_seconds)
  
  # Top páginas
  topk(10, sum by (page) (analytics_pageviews_total))
  ```

## 🚀 Próximos Passos

1. **Implementar métricas customizadas** para seu negócio
2. **Criar dashboards específicos** no Grafana
3. **Configurar alertas** para eventos importantes
4. **Integrar com PowerBI** usando o script de exportação
5. **Adicionar autenticação** para dados sensíveis

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar console do navegador
2. Verificar logs do backend
3. Testar conectividade com APIs
4. Consultar documentação do Grafana/Prometheus
