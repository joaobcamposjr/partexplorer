# PartExplorer - Catálogo de Peças

## 🚀 Deploy Automático via GitHub Actions

### **Configuração Inicial:**

1. **Adicionar Secrets no GitHub:**
   - Vá em `Settings > Secrets and variables > Actions`
   - Adicione: `VPS_SSH_KEY` (sua chave SSH privada da VPS)

2. **Configurar VPS:**
   ```bash
   # Na VPS
   sudo apt update
   sudo apt install docker.io docker-compose
   sudo usermod -aG docker $USER
   ```

3. **Push para GitHub:**
   ```bash
   git add .
   git commit -m "Setup CI/CD"
   git push origin main
   ```

### **Deploy Automático:**

✅ **Push para `main` → Deploy automático**  
✅ **Health checks automáticos**  
✅ **Rollback em caso de erro**  
✅ **Logs detalhados no GitHub**

### **URLs de Acesso:**

- **Frontend:** http://95.217.76.135:3000
- **Backend:** http://95.217.76.135:8080
- **API Docs:** http://95.217.76.135:8080/docs

### **Monitoramento:**

- **GitHub Actions:** Ver logs de deploy
- **VPS:** `docker ps` para status dos containers
- **Logs:** `docker logs partexplorer-frontend`

### **Deploy Manual (se necessário):**

```bash
# Na VPS
cd /home/jbcdev/partexplorer
./scripts/deploy.sh
```# Teste GitHub Actions
