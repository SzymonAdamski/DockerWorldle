# Wordle PL - Projekt DevOps

> **Polska wersja gry Wordle z pełnym stack''iem DevOps**

 **Demo:** [http://localhost:8080](http://localhost:8080) (lokalnie)  
 **Pełne sprawozdanie:** [SPRAWOZDANIE.md](SPRAWOZDANIE.md)

---

##  Szybki Start

```bash
# Klonowanie repozytorium
git clone https://github.com/SzymonAdamski/DockerWorldle.git
cd DockerWorldle

# Uruchomienie aplikacji
docker-compose up -d

# Aplikacja dostępna na http://localhost:8080
```

---

##  Stack Technologiczny

| Technologia | Zastosowanie |
|-------------|--------------|
| **Node.js + Express** | Backend API |
| **HTML/CSS/JavaScript** | Frontend |
| **Docker** | Konteneryzacja |
| **Docker Compose** | Orkiestracja lokalna |
| **GitHub Actions** | CI/CD Pipeline |
| **Kubernetes** | Orkiestracja produkcyjna |
| **Nginx** | Reverse proxy |

---

##  Dokumentacja

 **[Pełne sprawozdanie laboratoryjne](SPRAWOZDANIE.md)**

Zawiera szczegółowe opisy:
- Linux - podstawowe komendy
- Git - wersjonowanie i SSH
- Docker - konteneryzacja
- Docker Compose - orkiestracja
- CI/CD - GitHub Actions
- Kubernetes - deployment produkcyjny
- Wnioski i best practices

---

##  Funkcjonalności

 Polska wersja Wordle z 365 słowami  
 Responsywny interfejs  
 Backend API z sesyjnym zarządzaniem  
 Konteneryzacja Docker  
 Automatyczne testy CI/CD  
 Gotowość do produkcji (K8s)  

---

##  Komendy

```bash
# Development
docker-compose up        # Uruchom z logami
docker-compose down      # Zatrzymaj
docker-compose restart   # Restart

# Logi
docker-compose logs backend
docker-compose logs frontend

# Build
docker-compose up --build

# Kubernetes (opcjonalnie)
kubectl apply -f k8s/
kubectl get pods
```

---

##  Architektura

```
      
   Frontend     Backend   
  (Nginx:80)        (Node:3000) 
      
                           
        Docker 
              Network
```

---

##  Autor

**Szymon Adamski**  
Projekt laboratoryjny - Cykl życia i narzędzia DevOps  
Data: 6 grudnia 2025

---

##  Licencja

Projekt edukacyjny - MIT License
