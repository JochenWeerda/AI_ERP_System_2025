package com.valeo.auth.service.impl;

import com.valeo.auth.dto.AuthRequest;
import com.valeo.auth.dto.AuthResponse;
import com.valeo.auth.dto.TokenValidationResponse;
import com.valeo.auth.exception.AuthenticationException;
import com.valeo.auth.exception.InvalidTokenException;
import com.valeo.auth.service.AuthService;
import com.valeo.auth.service.JwtService;
import com.valeo.auth.service.OdooService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * Implementierung des AuthService-Interfaces.
 * Verantwortlich für die Authentifizierung und Tokenverwaltung.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final OdooService odooService;
    private final JwtService jwtService;

    /**
     * Authentifiziert einen Benutzer mit Odoo-Anmeldedaten und gibt ein JWT-Token zurück.
     *
     * @param request Die Authentifizierungsanfrage mit Benutzername und Passwort
     * @return AuthResponse mit dem JWT-Token und Benutzerinformationen
     * @throws AuthenticationException wenn die Authentifizierung fehlschlägt
     */
    @Override
    public AuthResponse authenticate(AuthRequest request) {
        log.debug("Authentifiziere Benutzer: {}", request.getUsername());
        
        try {
            // Benutzer bei Odoo authentifizieren
            Map<String, Object> userData = odooService.authenticate(
                request.getUsername(), 
                request.getPassword(), 
                request.getDatabase()
            );
            
            Integer userId = (Integer) userData.get("user_id");
            String username = (String) userData.get("username");
            List<String> roles = (List<String>) userData.get("roles");
            String companyId = userData.get("company_id").toString();
            String companyName = (String) userData.get("company_name");
            
            // JWT-Token generieren
            String token = jwtService.generateToken(userId, username, roles, companyId, companyName);
            long expiresIn = jwtService.getExpirationTime();
            
            return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .username(username)
                .roles(roles)
                .companyId(companyId)
                .companyName(companyName)
                .build();
                
        } catch (Exception e) {
            log.error("Authentifizierung fehlgeschlagen für Benutzer {}: {}", request.getUsername(), e.getMessage());
            throw new AuthenticationException("Authentifizierung fehlgeschlagen: " + e.getMessage(), e);
        }
    }

    /**
     * Validiert ein JWT-Token und gibt Benutzerinformationen zurück.
     * Die Validierungsergebnisse werden für 5 Minuten gecached.
     *
     * @param token Das zu validierende JWT-Token
     * @return TokenValidationResponse mit Benutzerinformationen
     * @throws InvalidTokenException wenn das Token ungültig ist
     */
    @Override
    @Cacheable(value = "tokenValidation", key = "#token")
    public TokenValidationResponse validateToken(String token) {
        log.debug("Validiere Token");
        
        try {
            // Token validieren
            Map<String, Object> claims = jwtService.validateToken(token);
            
            String username = (String) claims.get("sub");
            List<String> roles = (List<String>) claims.get("roles");
            String companyId = (String) claims.get("companyId");
            String companyName = (String) claims.get("companyName");
            Date expiration = jwtService.getExpirationDateFromToken(token);
            
            // Prüfen, ob das Token bald abläuft (weniger als 10% der Gültigkeitsdauer)
            boolean nearingExpiry = jwtService.isTokenNearingExpiry(token);
            
            return TokenValidationResponse.builder()
                .valid(true)
                .username(username)
                .roles(roles)
                .companyId(companyId)
                .companyName(companyName)
                .expiresAt(expiration.getTime() / 1000)
                .nearingExpiry(nearingExpiry)
                .build();
                
        } catch (Exception e) {
            log.warn("Token-Validierung fehlgeschlagen: {}", e.getMessage());
            throw new InvalidTokenException("Ungültiges Token: " + e.getMessage(), e);
        }
    }

    /**
     * Erneuert ein JWT-Token, wenn es gültig ist, aber bald abläuft.
     * Löscht den Cache-Eintrag für das alte Token.
     *
     * @param token Das zu erneuernde JWT-Token
     * @return AuthResponse mit dem neuen JWT-Token
     * @throws InvalidTokenException wenn das Token ungültig ist
     */
    @Override
    @CacheEvict(value = "tokenValidation", key = "#token")
    public AuthResponse refreshToken(String token) {
        log.debug("Erneuere Token");
        
        try {
            // Token validieren
            TokenValidationResponse validationResponse = validateToken(token);
            
            if (!validationResponse.isValid()) {
                throw new InvalidTokenException("Token kann nicht erneuert werden, da es ungültig ist");
            }
            
            // Neues Token generieren
            Integer userId = Integer.parseInt(jwtService.getUserIdFromToken(token));
            String username = validationResponse.getUsername();
            List<String> roles = validationResponse.getRoles();
            String companyId = validationResponse.getCompanyId();
            String companyName = validationResponse.getCompanyName();
            
            String newToken = jwtService.generateToken(userId, username, roles, companyId, companyName);
            long expiresIn = jwtService.getExpirationTime();
            
            return AuthResponse.builder()
                .token(newToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .username(username)
                .roles(roles)
                .companyId(companyId)
                .companyName(companyName)
                .build();
                
        } catch (Exception e) {
            log.error("Token-Erneuerung fehlgeschlagen: {}", e.getMessage());
            throw new InvalidTokenException("Token-Erneuerung fehlgeschlagen: " + e.getMessage(), e);
        }
    }
} 