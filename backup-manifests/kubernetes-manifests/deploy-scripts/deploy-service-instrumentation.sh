#!/bin/bash
# Bash-Skript zum Deployment der Observability-Instrumentierungen
# für alle Services im ERP-System

echo -e "\e[32m===========================================\e[0m"
echo -e "\e[32mObservability-Instrumentierung für das ERP-System\e[0m"
echo -e "\e[32m===========================================\e[0m"
echo ""

# Verzeichnis für Instrumentierungen
INSTRUMENTATION_DIR="../service-instrumentation"

# Pfad überprüfen
if [ ! -d "$INSTRUMENTATION_DIR" ]; then
    echo -e "\e[31mFehler: Das Verzeichnis $INSTRUMENTATION_DIR wurde nicht gefunden.\e[0m"
    exit 1
fi

# Namespace prüfen und erstellen
echo -e "\e[36mÜberprüfe ERP-System Namespace...\e[0m"
if ! kubectl get namespace erp-system &> /dev/null; then
    echo -e "\e[33mNamespace erp-system existiert nicht. Wird erstellt...\e[0m"
    kubectl create namespace erp-system
    echo -e "\e[32mNamespace erp-system wurde erstellt.\e[0m"
else
    echo -e "\e[32mNamespace erp-system existiert bereits.\e[0m"
fi

# Alert-Rules zuerst anwenden, da sie von anderen Services verwendet werden
echo -e "\e[36mWende Alert-Rules an...\e[0m"
ALERT_RULES_PATH="$INSTRUMENTATION_DIR/alertmanager-rules.yaml"
if [ -f "$ALERT_RULES_PATH" ]; then
    kubectl apply -f "$ALERT_RULES_PATH"
    echo -e "\e[32mAlert-Rules wurden erfolgreich angewendet.\e[0m"
else
    echo -e "\e[33mWarnung: $ALERT_RULES_PATH wurde nicht gefunden.\e[0m"
fi

# Finance-Service instrumentieren
echo -e "\e[36mInstrumentiere Finance-Service...\e[0m"
FINANCE_SERVICE_PATH="$INSTRUMENTATION_DIR/finance-service-instrumentation.yaml"
if [ -f "$FINANCE_SERVICE_PATH" ]; then
    kubectl apply -f "$FINANCE_SERVICE_PATH"
    echo -e "\e[32mFinance-Service-Instrumentierung wurde erfolgreich angewendet.\e[0m"
else
    echo -e "\e[33mWarnung: $FINANCE_SERVICE_PATH wurde nicht gefunden.\e[0m"
fi

# Auth-Service instrumentieren
echo -e "\e[36mInstrumentiere Auth-Service...\e[0m"
AUTH_SERVICE_PATH="$INSTRUMENTATION_DIR/auth-service-instrumentation.yaml"
if [ -f "$AUTH_SERVICE_PATH" ]; then
    kubectl apply -f "$AUTH_SERVICE_PATH"
    echo -e "\e[32mAuth-Service-Instrumentierung wurde erfolgreich angewendet.\e[0m"
else
    echo -e "\e[33mWarnung: $AUTH_SERVICE_PATH wurde nicht gefunden.\e[0m"
fi

# Beleg-Service instrumentieren
echo -e "\e[36mInstrumentiere Beleg-Service...\e[0m"
BELEG_SERVICE_PATH="$INSTRUMENTATION_DIR/beleg-service-instrumentation.yaml"
if [ -f "$BELEG_SERVICE_PATH" ]; then
    kubectl apply -f "$BELEG_SERVICE_PATH"
    echo -e "\e[32mBeleg-Service-Instrumentierung wurde erfolgreich angewendet.\e[0m"
else
    echo -e "\e[33mWarnung: $BELEG_SERVICE_PATH wurde nicht gefunden.\e[0m"
fi

# Reporting-Service instrumentieren
echo -e "\e[36mInstrumentiere Reporting-Service...\e[0m"
REPORTING_SERVICE_PATH="$INSTRUMENTATION_DIR/reporting-service-patch.yaml"
if [ -f "$REPORTING_SERVICE_PATH" ]; then
    kubectl apply -f "$REPORTING_SERVICE_PATH"
    echo -e "\e[32mReporting-Service-Instrumentierung wurde erfolgreich angewendet.\e[0m"
else
    echo -e "\e[33mWarnung: $REPORTING_SERVICE_PATH wurde nicht gefunden.\e[0m"
fi

# Document-Service instrumentieren
echo -e "\e[36mInstrumentiere Document-Service...\e[0m"
DOCUMENT_SERVICE_PATH="$INSTRUMENTATION_DIR/document-service-tracing-patch.yaml"
if [ -f "$DOCUMENT_SERVICE_PATH" ]; then
    kubectl apply -f "$DOCUMENT_SERVICE_PATH"
    echo -e "\e[32mDocument-Service-Instrumentierung wurde erfolgreich angewendet.\e[0m"
else
    echo -e "\e[33mWarnung: $DOCUMENT_SERVICE_PATH wurde nicht gefunden.\e[0m"
fi

# Observer-Service instrumentieren
echo -e "\e[36mInstrumentiere Observer-Service...\e[0m"
OBSERVER_SERVICE_PATH="$INSTRUMENTATION_DIR/observer-service-instrumentation.yaml"
if [ -f "$OBSERVER_SERVICE_PATH" ]; then
    kubectl apply -f "$OBSERVER_SERVICE_PATH"
    echo -e "\e[32mObserver-Service-Instrumentierung wurde erfolgreich angewendet.\e[0m"
else
    echo -e "\e[33mWarnung: $OBSERVER_SERVICE_PATH wurde nicht gefunden.\e[0m"
fi

# Grafana-Dashboard für Reporting-Service installieren
echo -e "\e[36mInstalliere Grafana-Dashboard für Reporting-Service...\e[0m"
REPORTING_DASHBOARD_PATH="$INSTRUMENTATION_DIR/reporting-service-grafana-dashboard.json"
if [ -f "$REPORTING_DASHBOARD_PATH" ]; then
    # Dashboard als ConfigMap erstellen
    kubectl create configmap reporting-service-dashboard -n erp-system --from-file=dashboard.json="$REPORTING_DASHBOARD_PATH" --dry-run=client -o yaml | kubectl apply -f -
    
    # Prüfen, ob Grafana-Dashboard-Provider existiert
    if ! kubectl get configmap grafana-dashboard-provisioning -n erp-system &> /dev/null; then
        echo -e "\e[33mWarnung: Grafana-Dashboard-Provider nicht gefunden. Dashboard wurde als ConfigMap erstellt, muss aber manuell in Grafana importiert werden.\e[0m"
    else
        echo -e "\e[32mGrafana-Dashboard für Reporting-Service wurde erfolgreich installiert.\e[0m"
    fi
else
    echo -e "\e[33mWarnung: $REPORTING_DASHBOARD_PATH wurde nicht gefunden.\e[0m"
fi

# Status überprüfen
echo ""
echo -e "\e[36mStatus der Instrumentierungen:\e[0m"
echo -e "\e[36m----------------------------\e[0m"

# ConfigMaps auflisten
echo -e "\e[36mConfigMaps für Service-Instrumentierung:\e[0m"
kubectl get configmaps -n erp-system | grep -E "service-|dashboard|alerting"

# Services neustarten (optional)
echo -n "Möchten Sie die Services neu starten, um die Instrumentierung zu aktivieren? (j/n): "
read RESTART_SERVICES

if [ "$RESTART_SERVICES" = "j" ]; then
    echo -e "\e[36mStarte Services neu...\e[0m"
    kubectl rollout restart deployment/finance-service -n erp-system
    kubectl rollout restart deployment/auth-service -n erp-system
    kubectl rollout restart deployment/reporting-service -n erp-system
    kubectl rollout restart deployment/document-service -n erp-system
    kubectl rollout restart deployment/beleg-service -n erp-system
    kubectl rollout restart deployment/observer-service -n erp-system
    
    echo -e "\e[32mServices werden neu gestartet. Überprüfen Sie den Status mit:\e[0m"
    echo -e "\e[33mkubectl get pods -n erp-system\e[0m"
else
    echo -e "\e[33mBitte starten Sie die Services manuell neu, um die Instrumentierung zu aktivieren.\e[0m"
fi

echo ""
echo -e "\e[32m===========================================\e[0m"
echo -e "\e[32mObservability-Instrumentierung abgeschlossen\e[0m"
echo -e "\e[32m===========================================\e[0m" 