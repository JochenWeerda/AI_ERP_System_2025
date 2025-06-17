package com.valeo.auth.controller;

import com.valeo.auth.dto.AuthRequest;
import com.valeo.auth.dto.AuthResponse;
import com.valeo.auth.dto.TokenValidationRequest;
import com.valeo.auth.dto.TokenValidationResponse;
import com.valeo.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/**
 * REST-Controller für die Authentifizierung und Tokenverwaltung.
 * Stellt Endpunkte für die Anmeldung, Tokenvalidierung und -erneuerung bereit.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    /**
     * Authentifiziert einen Benutzer mit Odoo-Anmeldedaten und gibt ein JWT-Token zurück.
     *
     * @param request Die Authentifizierungsanfrage mit Benutzername und Passwort
     * @return ResponseEntity mit dem JWT-Token oder einem Fehler
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        log.debug("Authentifizierungsanfrage für Benutzer: {}", request.getUsername());
        AuthResponse response = authService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Validiert ein JWT-Token und gibt Benutzerinformationen zurück.
     *
     * @param request Die Tokenvalidierungsanfrage mit dem JWT-Token
     * @return ResponseEntity mit Benutzerinformationen oder einem Fehler
     */
    @PostMapping("/validate")
    public ResponseEntity<TokenValidationResponse> validateToken(@Valid @RequestBody TokenValidationRequest request) {
        log.debug("Tokenvalidierungsanfrage empfangen");
        TokenValidationResponse response = authService.validateToken(request.getToken());
        return ResponseEntity.ok(response);
    }

    /**
     * Erneuert ein JWT-Token, wenn es gültig ist, aber bald abläuft.
     *
     * @param request Die Tokenvalidierungsanfrage mit dem JWT-Token
     * @return ResponseEntity mit einem neuen Token oder einem Fehler
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody TokenValidationRequest request) {
        log.debug("Token-Erneuerungsanfrage empfangen");
        AuthResponse response = authService.refreshToken(request.getToken());
        return ResponseEntity.ok(response);
    }

    /**
     * Endpunkt für die Traefik Forward Auth Middleware.
     * Prüft das Token aus dem Authorization-Header und setzt Benutzerinformationen in Response-Headern.
     *
     * @param authorization Der Authorization-Header mit dem Bearer-Token
     * @return 200 OK, wenn das Token gültig ist, sonst 401 Unauthorized
     */
    @GetMapping("/verify")
    public ResponseEntity<Void> verifyToken(@RequestHeader(value = "Authorization", required = false) String authorization) {
        log.debug("Token-Verifizierungsanfrage von Traefik empfangen");
        
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            log.warn("Ungültiger oder fehlender Authorization-Header");
            return ResponseEntity.status(401).build();
        }
        
        String token = authorization.substring(7);
        try {
            TokenValidationResponse validationResponse = authService.validateToken(token);
            
            return ResponseEntity.ok()
                .header("X-Auth-User", validationResponse.getUsername())
                .header("X-Auth-Role", String.join(",", validationResponse.getRoles()))
                .header("X-Auth-Company", validationResponse.getCompanyId())
                .build();
        } catch (Exception e) {
            log.warn("Token-Validierung fehlgeschlagen: {}", e.getMessage());
            return ResponseEntity.status(401).build();
        }
    }
} 