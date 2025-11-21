FROM ubuntu:22.04

WORKDIR /var/www/html

# Instalacja Nginx
RUN apt-get update && \
    apt-get install -y nginx && \
    rm -rf /var/lib/apt/lists/*

# Kopiowanie plików
COPY index.html .
COPY static/ ./static/
COPY nginx/default.conf /etc/nginx/sites-available/default

# Aktywacja konfiguracji
RUN rm -f /etc/nginx/sites-enabled/default && \
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/

# USUŃ testowanie konfiguracji - nie działa podczas budowy!
# RUN nginx -t  # <-- USUŃ TĘ LINIĘ

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
