package com.valeo.auth.service.impl;

import com.valeo.auth.exception.InvalidTokenException;
import com.valeo.auth.service.JwtService;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.security.Key;
import java.util.*;

/**
 * Implementierung des JwtService-Interfaces.
 * Verantwortlich für die Erstellung und Validierung von JWT-Tokens.
 */
@Service
@Slf4j
public class JwtServiceImpl implements JwtService {

    @Value("${auth.jwt.secret-key}")
    private String secretKey;

    @Value("${auth.jwt.expiration}")
    private long expirationTime;

    @Value("${auth.jwt.issuer:valeo-neuroerp-auth}")
    private String issuer;

    private Key key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secretKey));
    }

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
    @Override
    public String generateToken(Integer userId, String username, List<String> roles, String companyId, String companyName) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime * 1000);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId.toString());
        claims.put("roles", roles);
        claims.put("companyId", companyId);
        claims.put("companyName", companyName);

        return Jwts.builder()
            .setClaims(claims)
            .setSubject(username)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .setIssuer(issuer)
            .setId(UUID.randomUUID().toString())
            .signWith(key)
            .compact();
    }

    /**
     * Validiert ein JWT-Token und gibt die Claims zurück.
     *
     * @param token Das zu validierende JWT-Token
     * @return Die Claims des Tokens
     * @throws InvalidTokenException wenn das Token ungültig ist
     */
    @Override
    public Map<String, Object> validateToken(String token) {
        try {
            Jws<Claims> claimsJws = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);

            Claims claims = claimsJws.getBody();
            Date expiration = claims.getExpiration();

            if (expiration.before(new Date())) {
                throw new InvalidTokenException("Token ist abgelaufen");
            }

            return new HashMap<>(claims);
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Ungültiges JWT-Token: {}", e.getMessage());
            throw new InvalidTokenException("Ungültiges JWT-Token: " + e.getMessage(), e);
        }
    }

    /**
     * Holt das Ablaufdatum aus einem JWT-Token.
     *
     * @param token Das JWT-Token
     * @return Das Ablaufdatum des Tokens
     * @throws InvalidTokenException wenn das Token ungültig ist
     */
    @Override
    public Date getExpirationDateFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
            return claims.getExpiration();
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Fehler beim Lesen des Ablaufdatums aus Token: {}", e.getMessage());
            throw new InvalidTokenException("Fehler beim Lesen des Ablaufdatums aus Token: " + e.getMessage(), e);
        }
    }

    /**
     * Prüft, ob ein JWT-Token bald abläuft.
     * Ein Token gilt als "bald ablaufend", wenn weniger als 10% der Gültigkeitsdauer übrig sind.
     *
     * @param token Das JWT-Token
     * @return true, wenn das Token bald abläuft, sonst false
     * @throws InvalidTokenException wenn das Token ungültig ist
     */
    @Override
    public boolean isTokenNearingExpiry(String token) {
        Date expiration = getExpirationDateFromToken(token);
        Date now = new Date();
        
        // Berechne die verbleibende Zeit in Millisekunden
        long remainingTime = expiration.getTime() - now.getTime();
        
        // Wenn weniger als 10% der Gültigkeitsdauer übrig sind, gilt das Token als "bald ablaufend"
        return remainingTime < (expirationTime * 100);  // 10% von expirationTime in Millisekunden
    }

    /**
     * Holt die Benutzer-ID aus einem JWT-Token.
     *
     * @param token Das JWT-Token
     * @return Die Benutzer-ID
     * @throws InvalidTokenException wenn das Token ungültig ist
     */
    @Override
    public String getUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
            return claims.get("userId", String.class);
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Fehler beim Lesen der Benutzer-ID aus Token: {}", e.getMessage());
            throw new InvalidTokenException("Fehler beim Lesen der Benutzer-ID aus Token: " + e.getMessage(), e);
        }
    }

    /**
     * Gibt die Ablaufzeit des Tokens in Sekunden zurück.
     *
     * @return Die Ablaufzeit des Tokens in Sekunden
     */
    @Override
    public long getExpirationTime() {
        return expirationTime;
    }
} 