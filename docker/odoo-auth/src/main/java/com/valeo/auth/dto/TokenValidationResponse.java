package com.valeo.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO für die Tokenvalidierungsantwort.
 * Enthält Informationen über das validierte Token und den Benutzer.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenValidationResponse {

    /**
     * Gibt an, ob das Token gültig ist.
     */
    private boolean valid;

    /**
     * Der Benutzername des Tokeninhabers.
     */
    private String username;

    /**
     * Die Rollen des Benutzers.
     */
    private List<String> roles;

    /**
     * Die ID des Unternehmens des Benutzers.
     */
    private String companyId;

    /**
     * Der Name des Unternehmens des Benutzers.
     */
    private String companyName;

    /**
     * Die Ablaufzeit des Tokens als Unix-Timestamp.
     */
    private long expiresAt;

    /**
     * Gibt an, ob das Token bald abläuft (< 10% der Gültigkeitsdauer).
     */
    private boolean nearingExpiry;
} 