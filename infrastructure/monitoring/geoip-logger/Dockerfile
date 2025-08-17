FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copiar go.mod
COPY go.mod ./
RUN go mod download && go get github.com/lib/pq

# Copiar código fonte
COPY . .

# Compilar
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o geoip-logger .

# Imagem final
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/geoip-logger .

EXPOSE 8081

CMD ["./geoip-logger"]
