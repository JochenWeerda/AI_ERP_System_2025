package com.valeo.auth.service;

import java.util.List;
import java.util.Map;

/**
 * Service-Interface für die Kommunikation mit dem Odoo-Backend.
 */
public interface OdooService {

    /**
     * Authentifiziert einen Benutzer bei Odoo.
     *
     * @param username Der Benutzername
     * @param password Das Passwort
     * @param database Die Datenbank (kann null sein, dann wird die konfigurierte Datenbank verwendet)
     * @return Map mit Benutzerinformationen (user_id, username, roles, company_id, company_name)
     * @throws com.valeo.auth.exception.AuthenticationException wenn die Authentifizierung fehlschlägt
     */
    Map<String, Object> authenticate(String username, String password, String database);

    /**
     * Holt die Benutzerinformationen von Odoo.
     *
     * @param userId Die ID des Benutzers
     * @return Map mit Benutzerinformationen (username, roles, company_id, company_name)
     * @throws com.valeo.auth.exception.AuthenticationException wenn der Benutzer nicht gefunden wird
     */
    Map<String, Object> getUserInfo(Integer userId);

    /**
     * Holt die Rollen des Benutzers von Odoo.
     *
     * @param userId Die ID des Benutzers
     * @return Liste der Rollen des Benutzers
     * @throws com.valeo.auth.exception.AuthenticationException wenn die Rollen nicht geholt werden können
     */
    List<String> getUserRoles(Integer userId);

    /**
     * Prüft, ob ein Benutzer existiert.
     *
     * @param userId Die ID des Benutzers
     * @return true, wenn der Benutzer existiert, sonst false
     */
    boolean userExists(Integer userId);
} 