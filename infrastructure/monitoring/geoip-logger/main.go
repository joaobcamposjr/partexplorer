package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/lib/pq"
)

// GeoIPLog representa um log de consulta GeoIP
type GeoIPLog struct {
	IPAddress    string    `json:"ip_address"`
	Country      string    `json:"country"`
	CountryCode  string    `json:"country_code"`
	Region       string    `json:"region"`
	RegionName   string    `json:"region_name"`
	City         string    `json:"city"`
	ZipCode      string    `json:"zip_code"`
	Latitude     float64   `json:"latitude"`
	Longitude    float64   `json:"longitude"`
	Timezone     string    `json:"timezone"`
	ISP          string    `json:"isp"`
	Organization string    `json:"organization"`
	Endpoint     string    `json:"endpoint"`
	UserAgent    string    `json:"user_agent"`
	CreatedAt    time.Time `json:"created_at"`
}

// LogRequest representa a requisição para logar
type LogRequest struct {
	GeoIPData GeoIPLog `json:"geoip_data"`
	Endpoint  string   `json:"endpoint"`
	UserAgent string   `json:"user_agent"`
}

var db *sql.DB

func main() {
	// Conectar ao PostgreSQL
	var err error
	db, err = sql.Open("postgres", "host=host.docker.internal dbname=procatalog user=jbcdev password=jbcpass sslmode=disable")
	if err != nil {
		log.Fatal("Erro ao conectar ao banco:", err)
	}
	defer db.Close()

	// Testar conexão
	err = db.Ping()
	if err != nil {
		log.Fatal("Erro ao fazer ping no banco:", err)
	}

	log.Println("✅ GeoIP Logger conectado ao PostgreSQL")

	// Configurar rotas
	http.HandleFunc("/log", handleLog)
	http.HandleFunc("/health", handleHealth)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("🚀 GeoIP Logger rodando na porta %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func handleLog(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	var req LogRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Erro ao decodificar JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Definir timestamp se não fornecido
	if req.GeoIPData.CreatedAt.IsZero() {
		req.GeoIPData.CreatedAt = time.Now()
	}

	// Inserir no banco
	err := insertGeoIPLog(req.GeoIPData, req.Endpoint, req.UserAgent)
	if err != nil {
		log.Printf("❌ Erro ao inserir log: %v", err)
		http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": fmt.Sprintf("Log GeoIP inserido: %s - %s", req.GeoIPData.IPAddress, req.GeoIPData.Country),
	})
}

func insertGeoIPLog(geoip GeoIPLog, endpoint, userAgent string) error {
	query := `
		INSERT INTO partexplorer.geoip_logs 
		(ip_address, country, country_code, region, region_name, city, zip_code, 
		 latitude, longitude, timezone, isp, organization, endpoint, user_agent, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	`

	_, err := db.Exec(query,
		geoip.IPAddress,
		geoip.Country,
		geoip.CountryCode,
		geoip.Region,
		geoip.RegionName,
		geoip.City,
		geoip.ZipCode,
		geoip.Latitude,
		geoip.Longitude,
		geoip.Timezone,
		geoip.ISP,
		geoip.Organization,
		endpoint,
		userAgent,
		geoip.CreatedAt,
	)

	if err != nil {
		return fmt.Errorf("erro ao inserir log: %w", err)
	}

	log.Printf("✅ Log GeoIP inserido: %s - %s", geoip.IPAddress, geoip.Country)
	return nil
}
