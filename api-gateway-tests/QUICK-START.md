# VALERO NeuroERP API-Gateway Kurzanleitung

## 1. Statusprüfung

Überprüfen Sie den Status der Testumgebung:

```powershell
.\api-gateway-tests\check-status.ps1
```

## 2. Hosts-Datei aktualisieren

Führen Sie das folgende Skript **als Administrator** aus:

```powershell
.\api-gateway-tests\update-hosts.ps1
```

## 3. API-Gateway testen

Führen Sie den folgenden Befehl aus, um die API-Gateway-Funktionalität zu testen:

```powershell
.\api-gateway-tests\test-gateway.ps1
```

## 4. Performance-Tests durchführen

```powershell
.\api-gateway-tests\run-performance-test.ps1
```

## 5. Zwischen Gateways wechseln

### Zu Traefik wechseln
```powershell
.\api-gateway-tests\switch-gateway.ps1 -Gateway traefik
```

### Kong installieren
```powershell
.\api-gateway-tests\kong-install.ps1
```

### Zu Kong wechseln
```powershell
.\api-gateway-tests\switch-gateway.ps1 -Gateway kong
```

## 6. Zugriffs-URLs

- Traefik-Dashboard: http://dashboard.traefik.test:9080/dashboard/
- Mock-Service (Traefik): http://mock.test:9080/get
- Kong-Admin: http://kong-admin.test:9080/
- Mock-Service (Kong): http://mock.test:30081/get

## 7. Aufräumen

Um die Testumgebung zu bereinigen:

```powershell
.\api-gateway-tests\cleanup.ps1
``` 