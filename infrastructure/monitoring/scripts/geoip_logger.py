#!/usr/bin/env python3
"""
Script para inserir logs do GeoIP no PostgreSQL
Este script pode ser chamado pelo backend para registrar consultas GeoIP
"""

import psycopg2
import json
import sys
from datetime import datetime

def log_geoip_request(geoip_data, endpoint, user_agent=None):
    """
    Insere log de consulta GeoIP no PostgreSQL
    
    Args:
        geoip_data (dict): Dados retornados pela API GeoIP
        endpoint (str): Endpoint chamado (/api/geoip/location ou /api/geoip/simple)
        user_agent (str): User-Agent do cliente
    """
    
    try:
        # Conectar ao PostgreSQL
        conn = psycopg2.connect(
            host="localhost",
            database="procatalog",
            user="jbcdev",
            password="jbcdev"
        )
        
        cursor = conn.cursor()
        
        # Preparar dados para inserção
        query = """
        INSERT INTO partexplorer.geoip_logs 
        (ip_address, country, country_code, region, region_name, city, zip_code, 
         latitude, longitude, timezone, isp, organization, endpoint, user_agent, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        data = (
            geoip_data.get('ip', ''),
            geoip_data.get('country', ''),
            geoip_data.get('countryCode', ''),
            geoip_data.get('region', ''),
            geoip_data.get('regionName', ''),
            geoip_data.get('city', ''),
            geoip_data.get('zip', ''),
            geoip_data.get('lat', 0),
            geoip_data.get('lon', 0),
            geoip_data.get('timezone', ''),
            geoip_data.get('isp', ''),
            geoip_data.get('org', ''),
            endpoint,
            user_agent or '',
            datetime.now()
        )
        
        cursor.execute(query, data)
        conn.commit()
        
        print(f"✅ Log GeoIP inserido: {geoip_data.get('ip', 'N/A')} - {geoip_data.get('country', 'N/A')}")
        
    except Exception as e:
        print(f"❌ Erro ao inserir log GeoIP: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    # Exemplo de uso via linha de comando
    if len(sys.argv) < 3:
        print("Uso: python geoip_logger.py '{\"ip\":\"8.8.8.8\",\"country\":\"United States\"}' /api/geoip/location")
        sys.exit(1)
    
    geoip_data = json.loads(sys.argv[1])
    endpoint = sys.argv[2]
    user_agent = sys.argv[3] if len(sys.argv) > 3 else None
    
    log_geoip_request(geoip_data, endpoint, user_agent)

