FROM nginx:alpine

# Copiar configuração personalizada para desenvolvimento
COPY nginx.dev.conf /etc/nginx/nginx.conf

# Expor portas
EXPOSE 80 443

# Comando padrão
CMD ["nginx", "-g", "daemon off;"]

# Copiar configuração personalizada para desenvolvimento
COPY nginx.dev.conf /etc/nginx/nginx.conf

# Expor portas
EXPOSE 80 443

# Comando padrão
CMD ["nginx", "-g", "daemon off;"]


