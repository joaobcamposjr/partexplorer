#!/usr/bin/env python3
"""
Script para exportar dados do Prometheus para PowerBI
Autor: Sistema de Monitoramento PartExplorer
"""

import requests
import pandas as pd
import json
from datetime import datetime, timedelta
import argparse
import sys
import os

class PrometheusExporter:
    def __init__(self, prometheus_url="http://localhost:9090"):
        self.prometheus_url = prometheus_url
        self.session = requests.Session()
    
    def query_prometheus(self, query, start_time, end_time, step="1m"):
        """Executa uma query no Prometheus"""
        url = f"{self.prometheus_url}/api/v1/query_range"
        params = {
            'query': query,
            'start': start_time.isoformat() + 'Z',
            'end': end_time.isoformat() + 'Z',
            'step': step
        }
        
        try:
            response = self.session.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Erro ao consultar Prometheus: {e}")
            return None
    
    def get_nginx_metrics(self, start_time, end_time):
        """Coleta métricas do nginx"""
        metrics = {}
        
        # Requests por segundo
        result = self.query_prometheus(
            'rate(nginx_http_requests_total[5m])',
            start_time, end_time
        )
        if result and result['status'] == 'success':
            metrics['requests_per_second'] = self._parse_prometheus_result(result)
        
        # Response time
        result = self.query_prometheus(
            'histogram_quantile(0.95, rate(nginx_http_request_duration_seconds_bucket[5m]))',
            start_time, end_time
        )
        if result and result['status'] == 'success':
            metrics['response_time_95p'] = self._parse_prometheus_result(result)
        
        # Error rate
        result = self.query_prometheus(
            'rate(nginx_http_requests_total{status=~"5.."}[5m])',
            start_time, end_time
        )
        if result and result['status'] == 'success':
            metrics['error_rate'] = self._parse_prometheus_result(result)
        
        return metrics
    
    def get_system_metrics(self, start_time, end_time):
        """Coleta métricas do sistema"""
        metrics = {}
        
        # CPU usage
        result = self.query_prometheus(
            '100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)',
            start_time, end_time
        )
        if result and result['status'] == 'success':
            metrics['cpu_usage'] = self._parse_prometheus_result(result)
        
        # Memory usage
        result = self.query_prometheus(
            '(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100',
            start_time, end_time
        )
        if result and result['status'] == 'success':
            metrics['memory_usage'] = self._parse_prometheus_result(result)
        
        # Disk usage
        result = self.query_prometheus(
            '(node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100',
            start_time, end_time
        )
        if result and result['status'] == 'success':
            metrics['disk_usage'] = self._parse_prometheus_result(result)
        
        return metrics
    
    def get_analytics_metrics(self, start_time, end_time):
        """Coleta métricas de analytics"""
        metrics = {}
        
        # Page views
        result = self.query_prometheus(
            'rate(analytics_pageviews_total[5m])',
            start_time, end_time
        )
        if result and result['status'] == 'success':
            metrics['page_views'] = self._parse_prometheus_result(result)
        
        # Session duration
        result = self.query_prometheus(
            'avg(rate(analytics_session_duration_seconds[1h]))',
            start_time, end_time
        )
        if result and result['status'] == 'success':
            metrics['session_duration'] = self._parse_prometheus_result(result)
        
        # Search queries
        result = self.query_prometheus(
            'rate(analytics_search_total[5m])',
            start_time, end_time
        )
        if result and result['status'] == 'success':
            metrics['search_queries'] = self._parse_prometheus_result(result)
        
        return metrics
    
    def _parse_prometheus_result(self, result):
        """Converte resultado do Prometheus para DataFrame"""
        data = []
        for series in result['data']['result']:
            metric = series['metric']
            for value in series['values']:
                timestamp, val = value
                data.append({
                    'timestamp': datetime.fromtimestamp(timestamp),
                    'value': float(val),
                    **metric
                })
        return pd.DataFrame(data)
    
    def export_to_csv(self, metrics, output_dir="powerbi_export"):
        """Exporta métricas para arquivos CSV"""
        os.makedirs(output_dir, exist_ok=True)
        
        for metric_name, df in metrics.items():
            if not df.empty:
                filename = f"{output_dir}/{metric_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                df.to_csv(filename, index=False)
                print(f"✅ Exportado: {filename}")
    
    def export_to_json(self, metrics, output_file="powerbi_export/metrics.json"):
        """Exporta métricas para JSON"""
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        json_data = {}
        for metric_name, df in metrics.items():
            if not df.empty:
                json_data[metric_name] = df.to_dict('records')
        
        with open(output_file, 'w') as f:
            json.dump(json_data, f, indent=2, default=str)
        
        print(f"✅ Exportado: {output_file}")
    
    def generate_powerbi_query(self, metrics):
        """Gera query para PowerBI"""
        queries = []
        
        for metric_name, df in metrics.items():
            if not df.empty:
                # Converter DataFrame para formato PowerBI
                query = f"""
// {metric_name}
let
    Source = Csv.Document(File.Contents("C:\\\\path\\\\to\\\\{metric_name}.csv"),[Delimiter=",", Columns=3, QuoteStyle=QuoteStyle.Csv]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",{{{{"timestamp", type datetime}}, {{"value", type number}}}})
in
    #"Changed Type"
"""
                queries.append(query)
        
        return queries

def main():
    parser = argparse.ArgumentParser(description='Exportar dados do Prometheus para PowerBI')
    parser.add_argument('--prometheus-url', default='http://localhost:9090', 
                       help='URL do Prometheus')
    parser.add_argument('--start-time', default='1h', 
                       help='Tempo inicial (ex: 1h, 24h, 7d)')
    parser.add_argument('--end-time', default='now', 
                       help='Tempo final (ex: now, 2024-01-01T00:00:00Z)')
    parser.add_argument('--output-dir', default='powerbi_export', 
                       help='Diretório de saída')
    parser.add_argument('--format', choices=['csv', 'json', 'both'], default='both',
                       help='Formato de saída')
    parser.add_argument('--generate-powerbi', action='store_true',
                       help='Gerar queries do PowerBI')
    
    args = parser.parse_args()
    
    # Calcular timestamps
    end_time = datetime.utcnow()
    if args.end_time != 'now':
        end_time = datetime.fromisoformat(args.end_time.replace('Z', '+00:00'))
    
    if args.start_time.endswith('h'):
        hours = int(args.start_time[:-1])
        start_time = end_time - timedelta(hours=hours)
    elif args.start_time.endswith('d'):
        days = int(args.start_time[:-1])
        start_time = end_time - timedelta(days=days)
    else:
        start_time = datetime.fromisoformat(args.start_time.replace('Z', '+00:00'))
    
    print(f"📊 Exportando dados do Prometheus")
    print(f"   Período: {start_time} até {end_time}")
    print(f"   Prometheus: {args.prometheus_url}")
    print(f"   Saída: {args.output_dir}")
    print()
    
    # Inicializar exportador
    exporter = PrometheusExporter(args.prometheus_url)
    
    # Coletar métricas
    all_metrics = {}
    
    print("🔍 Coletando métricas do nginx...")
    nginx_metrics = exporter.get_nginx_metrics(start_time, end_time)
    all_metrics.update(nginx_metrics)
    
    print("🔍 Coletando métricas do sistema...")
    system_metrics = exporter.get_system_metrics(start_time, end_time)
    all_metrics.update(system_metrics)
    
    print("🔍 Coletando métricas de analytics...")
    analytics_metrics = exporter.get_analytics_metrics(start_time, end_time)
    all_metrics.update(analytics_metrics)
    
    # Exportar dados
    if args.format in ['csv', 'both']:
        print("\n📁 Exportando para CSV...")
        exporter.export_to_csv(all_metrics, args.output_dir)
    
    if args.format in ['json', 'both']:
        print("\n📁 Exportando para JSON...")
        exporter.export_to_json(all_metrics, f"{args.output_dir}/metrics.json")
    
    if args.generate_powerbi:
        print("\n🔧 Gerando queries do PowerBI...")
        queries = exporter.generate_powerbi_query(all_metrics)
        powerbi_file = f"{args.output_dir}/powerbi_queries.txt"
        with open(powerbi_file, 'w') as f:
            for query in queries:
                f.write(query + "\n\n")
        print(f"✅ Queries do PowerBI salvas em: {powerbi_file}")
    
    # Resumo
    print(f"\n📈 Resumo da exportação:")
    for metric_name, df in all_metrics.items():
        if not df.empty:
            print(f"   {metric_name}: {len(df)} registros")
    
    print(f"\n✅ Exportação concluída! Arquivos salvos em: {args.output_dir}")

if __name__ == "__main__":
    main()
