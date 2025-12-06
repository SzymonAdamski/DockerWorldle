FROM ubuntu:22.04

# Ustaw zmienne środowiskowe dla npm
ENV DEBIAN_FRONTEND=noninteractive

# Instalacja Node.js
RUN apt-get update && \
    apt-get install -y curl ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Sprawdź wersję Node.js i npm
RUN node -v && npm -v

# Ustaw czysty katalog roboczy
WORKDIR /app

# Kopiowanie pliku package.json najpierw (optymalizacja)
COPY package.json ./

# Instalacja zależności
RUN npm install

# Kopiowanie reszty aplikacji
COPY app.js ./

EXPOSE 3000

CMD ["node", "app.js"]
