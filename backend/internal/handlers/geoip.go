package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// GeoIPResponse representa a resposta da API de GeoIP
type GeoIPResponse struct {
	IP          string  `json:"ip"`
	Country     string  `json:"country"`
	CountryCode string  `json:"countryCode"`
	Region      string  `json:"region"`
	RegionName  string  `json:"regionName"`
	City        string  `json:"city"`
	Zip         string  `json:"zip"`
	Lat         float64 `json:"lat"`
	Lon         float64 `json:"lon"`
	Timezone    string  `json:"timezone"`
	ISP         string  `json:"isp"`
	Org         string  `json:"org"`
	AS          string  `json:"as"`
	Query       string  `json:"query"`
}

// GetGeoIPInfo obtém informações de localização do IP
func GetGeoIPInfo(ip string) (*GeoIPResponse, error) {
	// Usar API gratuita do ip-api.com
	url := fmt.Sprintf("http://ip-api.com/json/%s", ip)
	
	client := &http.Client{
		Timeout: 5 * time.Second,
	}
	
	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	
	var geoIP GeoIPResponse
	err = json.Unmarshal(body, &geoIP)
	if err != nil {
		return nil, err
	}
	
	return &geoIP, nil
}

// GetUserLocation retorna a localização do usuário
func GetUserLocation(c *gin.Context) {
	// Tentar obter IP dos headers primeiro (se estiver atrás de proxy)
	ip := c.GetHeader("X-Forwarded-For")
	if ip == "" {
		ip = c.GetHeader("X-Real-IP")
	}
	if ip == "" {
		ip = c.ClientIP()
	}
	
	// Se IP for localhost, usar IP público
	if ip == "127.0.0.1" || ip == "::1" || ip == "localhost" {
		ip = "8.8.8.8" // IP do Google como fallback
	}
	
	geoIP, err := GetGeoIPInfo(ip)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erro ao obter localização",
			"ip":    ip,
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"ip":          geoIP.IP,
		"country":     geoIP.Country,
		"countryCode": geoIP.CountryCode,
		"region":      geoIP.Region,
		"regionName":  geoIP.RegionName,
		"city":        geoIP.City,
		"zip":         geoIP.Zip,
		"lat":         geoIP.Lat,
		"lon":         geoIP.Lon,
		"timezone":    geoIP.Timezone,
		"isp":         geoIP.ISP,
		"org":         geoIP.Org,
	})
}

// GetUserLocationSimple retorna apenas informações básicas
func GetUserLocationSimple(c *gin.Context) {
	ip := c.ClientIP()
	
	geoIP, err := GetGeoIPInfo(ip)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"country": "Unknown",
			"city":    "Unknown",
			"ip":      ip,
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"country": geoIP.Country,
		"city":    geoIP.City,
		"ip":      geoIP.IP,
	})
}
