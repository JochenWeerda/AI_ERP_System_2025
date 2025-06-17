package com.valeo.auth.service;

import com.valeo.auth.dto.AuthRequest;
import com.valeo.auth.dto.AuthResponse;
import com.valeo.auth.dto.TokenValidationResponse;

/**
 * Service-Interface für die Authentifizierung und Tokenverwaltung.
 */
public interface AuthService {

    /**
     * Authentifiziert einen Benutzer mit Odoo-Anmeldedaten und gibt ein JWT-Token zurück.
     *
     * @param request Die Authentifizierungsanfrage mit Benutzername und Passwort
     * @return AuthResponse mit dem JWT-Token und Benutzerinformationen
     * @throws com.valeo.auth.exception.AuthenticationException wenn die Authentifizierung fehlschlägt
     */
    AuthResponse authenticate(AuthRequest request);

    /**
     * Validiert ein JWT-Token und gibt Benutzerinformationen zurück.
     *
     * @param token Das zu validierende JWT-Token
     * @return TokenValidationResponse mit Benutzerinformationen
     * @throws com.valeo.auth.exception.InvalidTokenException wenn das Token ungültig ist
     */
    TokenValidationResponse validateToken(String token);

    /**
     * Erneuert ein JWT-Token, wenn es gültig ist, aber bald abläuft.
     *
     * @param token Das zu erneuernde JWT-Token
     * @return AuthResponse mit dem neuen JWT-Token
     * @throws com.valeo.auth.exception.InvalidTokenException wenn das Token ungültig ist
     */
    AuthResponse refreshToken(String token);
} 