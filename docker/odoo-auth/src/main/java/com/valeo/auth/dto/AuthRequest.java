package com.valeo.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

/**
 * DTO für die Authentifizierungsanfrage.
 * Enthält die Benutzeranmeldeinformationen.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthRequest {

    /**
     * Der Benutzername für die Anmeldung bei Odoo.
     * Darf nicht leer sein.
     */
    @NotBlank(message = "Der Benutzername darf nicht leer sein")
    private String username;

    /**
     * Das Passwort für die Anmeldung bei Odoo.
     * Darf nicht leer sein.
     */
    @NotBlank(message = "Das Passwort darf nicht leer sein")
    private String password;

    /**
     * Die Datenbank für die Anmeldung bei Odoo.
     * Optional, da sie in der Konfiguration festgelegt werden kann.
     */
    private String database;
} 