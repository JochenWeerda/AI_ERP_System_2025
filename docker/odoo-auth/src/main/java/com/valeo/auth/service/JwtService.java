package com.valeo.auth.service;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * Service-Interface für die JWT-Token-Erstellung und -Validierung.
 */
public interface JwtService {

    /**
     * Generiert ein JWT-Token für einen Benutzer.
     *
     * @param userId      Die ID des Benutzers
     * @param username    Der Benutzername
     * @param roles       Die Rollen des Benutzers
     * @param companyId   Die ID des Unternehmens des Benutzers
     * @param companyName Der Name des Unternehmens des Benutzers
     * @return Das generierte JWT-Token
     */
    String generateToken(Integer userId, String username, List<String> roles, String companyId, String companyName);

    /**
     * Validiert ein JWT-Token und gibt die Claims zurück.
     *
     * @param token Das zu validierende JWT-Token
     * @return Die Claims des Tokens
     * @throws com.valeo.auth.exception.InvalidTokenException wenn das Token ungültig ist
     */
    Map<String, Object> validateToken(String token);

    /**
     * Holt das Ablaufdatum aus einem JWT-Token.
     *
     * @param token Das JWT-Token
     * @return Das Ablaufdatum des Tokens
     * @throws com.valeo.auth.exception.InvalidTokenException wenn das Token ungültig ist
     */
    Date getExpirationDateFromToken(String token);

    /**
     * Prüft, ob ein JWT-Token bald abläuft.
     *
     * @param token Das JWT-Token
     * @return true, wenn das Token bald abläuft, sonst false
     * @throws com.valeo.auth.exception.InvalidTokenException wenn das Token ungültig ist
     */
    boolean isTokenNearingExpiry(String token);

    /**
     * Holt die Benutzer-ID aus einem JWT-Token.
     *
     * @param token Das JWT-Token
     * @return Die Benutzer-ID
     * @throws com.valeo.auth.exception.InvalidTokenException wenn das Token ungültig ist
     */
    String getUserIdFromToken(String token);

    /**
     * Gibt die Ablaufzeit des Tokens in Sekunden zurück.
     *
     * @return Die Ablaufzeit des Tokens in Sekunden
     */
    long getExpirationTime();
} 