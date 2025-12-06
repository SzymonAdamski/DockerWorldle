# Instrukcja wykonania screenshotów dla sprawozdania

## Lista wymaganych screenshotów:

### Rys. 0: wordle-app.png
**Opis:** Działająca aplikacja Wordle PL w przeglądarce  
**Jak zrobić:**
1. Uruchom aplikację (backend + frontend)
2. Otwórz przeglądarkę: http://localhost:8080
3. Zagraj w grę (wpisz kilka liter)
4. Zrób screenshot całego okna przeglądarki

---

### Rys. 1: linux-terminal.png
**Opis:** Terminal z podstawowymi komendami Linux  
**Jak zrobić:**
```bash
# Uruchom w terminalu:
ls -la
pwd
mkdir test-folder
cd test-folder
touch test-file.txt
cat /etc/os-release
```
Zrób screenshot terminala po wykonaniu tych komend

---

### Rys. 2: git-branch.png
**Opis:** Tworzenie i przełączanie się między branchami  
**Jak zrobić:**
```bash
cd k:\dockerwordle
git branch feature/sprawozdanie
git checkout feature/sprawozdanie
git branch -a
git log --oneline --graph -5
```
Zrób screenshot terminala

---

### Rys. 3: ssh-keygen.png
**Opis:** Generowanie klucza SSH  
**Jak zrobić:**
```bash
ssh-keygen -t ed25519 -C "twoj.email@example.com"
# Naciśnij Enter 3 razy (domyślna lokalizacja, bez passphrase)
cat ~/.ssh/id_ed25519.pub
```
Zrób screenshot terminala pokazujący:
- Proces generowania klucza
- Wyświetlony klucz publiczny

---

### Rys. 4: github-ssh-keys.png
**Opis:** Dodawanie klucza SSH do GitHub  
**Jak zrobić:**
1. Zaloguj się na GitHub
2. Przejdź do Settings → SSH and GPG keys
3. Kliknij "New SSH key"
4. Wklej klucz publiczny
5. Zrób screenshot strony z listą kluczy SSH (po dodaniu)

---

### Rys. 5: docker-build-backend.png
**Opis:** Budowanie obrazu Docker dla backendu  
**Jak zrobić:**
```bash
cd k:\dockerwordle
docker build -t wordle-backend:latest ./backend
docker images | grep wordle
```
Zrób screenshot terminala podczas/po buildzie

---

### Rys. 6: docker-compose-up.png
**Opis:** Uruchamianie aplikacji za pomocą Docker Compose  
**Jak zrobić:**
```bash
cd k:\dockerwordle
docker-compose up -d
docker-compose ps
docker-compose logs --tail=20
```
Zrób screenshot pokazujący:
- Status kontenerów (docker-compose ps)
- Fragment logów

---

### Rys. 7: github-actions-workflow.png
**Opis:** Workflow GitHub Actions w akcji  
**Jak zrobić:**
1. Otwórz https://github.com/SzymonAdamski/DockerWorldle
2. Przejdź do zakładki "Actions"
3. Kliknij na najnowszy workflow run
4. Zrób screenshot pokazujący:
   - Listę kroków (steps)
   - Status (passed/failed)
   - Zielone checkmarki przy zakończonych krokach

---

### Rys. 8: kubectl-apply.png
**Opis:** Deployment do Kubernetes  
**Jak zrobić:**
```bash
# Jeśli masz zainstalowany kubectl i klaster K8s:
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```
Zrób screenshot terminala z outputem

**UWAGA:** Jeśli nie masz K8s, możesz użyć Minikube:
```bash
minikube start
kubectl apply -f k8s/
```

---

### Rys. 9: kubectl-get-pods.png
**Opis:** Lista podów w Kubernetes  
**Jak zrobić:**
```bash
kubectl get pods
kubectl get services
kubectl get deployments
```
Zrób screenshot terminala pokazujący:
- Listę podów (STATUS: Running)
- Listę serwisów
- Listę deployments z liczbą replik

---

## Dodatkowe screenshoty (opcjonalne):

### docker-logs.png
```bash
docker-compose logs backend
```

### git-commit-push.png
```bash
git add .
git commit -m "Test commit"
git push origin main
```

### app-game-win.png
- Zagraj w Wordle i wygraj
- Zrób screenshot z komunikatem o wygranej

---

## Jak zapisać screenshoty:

1. Użyj narzędzia Snipping Tool (Windows) lub Snip & Sketch
2. Zapisz w formacie PNG
3. Umieść w folderze `screenshots/` z odpowiednią nazwą
4. Sprawdź czy nazwa pliku zgadza się z nazwą w sprawozdaniu

## Alternatywnie - użyj placeholder:

Jeśli nie możesz wykonać niektórych screenów (np. Kubernetes), możesz:
1. Znaleźć podobny przykład w internecie
2. Stworzyć diagram pokazujący konfigurację
3. Dodać komentarz w sprawozdaniu: "Przykładowy deployment w środowisku testowym"
