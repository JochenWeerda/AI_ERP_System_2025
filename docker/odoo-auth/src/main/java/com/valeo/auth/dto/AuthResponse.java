package com.valeo.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO für die Authentifizierungsantwort.
 * Enthält das JWT-Token und Benutzerinformationen.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    /**
     * Das JWT-Token für die Authentifizierung bei API-Anfragen.
     */
    private String token;

    /**
     * Der Typ des Tokens, standardmäßig "Bearer".
     */
    private String tokenType;

    /**
     * Die Ablaufzeit des Tokens in Sekunden.
     */
    private long expiresIn;

    /**
     * Der Benutzername des authentifizierten Benutzers.
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
} 