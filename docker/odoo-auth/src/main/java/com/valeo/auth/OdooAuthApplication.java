package com.valeo.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Hauptklasse für den VALEO NeuroERP Odoo-Authentifizierungsdienst.
 * Dieser Dienst stellt die Authentifizierung und Autorisierung für API-Anfragen 
 * an Odoo-Module bereit und verwaltet JWT-Tokens für die API-Gateway-Integration.
 */
@SpringBootApplication
@EnableCaching
@EnableScheduling
public class OdooAuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(OdooAuthApplication.class, args);
    }
} 