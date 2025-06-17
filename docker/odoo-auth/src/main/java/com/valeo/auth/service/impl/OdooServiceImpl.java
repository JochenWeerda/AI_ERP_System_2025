package com.valeo.auth.service.impl;

import com.valeo.auth.exception.AuthenticationException;
import com.valeo.auth.service.OdooService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.xmlrpc.XmlRpcException;
import org.apache.xmlrpc.client.XmlRpcClient;
import org.apache.xmlrpc.client.XmlRpcClientConfigImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementierung des OdooService-Interfaces.
 * Verantwortlich für die Kommunikation mit dem Odoo-Backend über XML-RPC.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OdooServiceImpl implements OdooService {

    @Value("${odoo.url}")
    private String odooUrl;

    @Value("${odoo.database}")
    private String odooDatabase;

    @Value("${odoo.admin-user}")
    private String odooAdminUser;

    @Value("${odoo.admin-password}")
    private String odooAdminPassword;

    @Value("${auth.roles}")
    private Map<String, String> roleMapping;

    /**
     * Authentifiziert einen Benutzer bei Odoo.
     *
     * @param username Der Benutzername
     * @param password Das Passwort
     * @param database Die Datenbank (kann null sein, dann wird die konfigurierte Datenbank verwendet)
     * @return Map mit Benutzerinformationen (user_id, username, roles, company_id, company_name)
     * @throws AuthenticationException wenn die Authentifizierung fehlschlägt
     */
    @Override
    public Map<String, Object> authenticate(String username, String password, String database) {
        String db = database != null ? database : odooDatabase;
        
        try {
            XmlRpcClient client = createCommonClient();
            Object[] params = new Object[] { db, username, password, Collections.emptyMap() };
            Integer userId = (Integer) client.execute("authenticate", params);
            
            if (userId <= 0) {
                throw new AuthenticationException("Ungültige Anmeldedaten");
            }
            
            // Benutzerinformationen abrufen
            Map<String, Object> userInfo = getUserInfo(userId);
            userInfo.put("user_id", userId);
            userInfo.put("username", username);
            
            return userInfo;
            
        } catch (XmlRpcException | MalformedURLException e) {
            log.error("Fehler bei der Authentifizierung: {}", e.getMessage());
            throw new AuthenticationException("Authentifizierung fehlgeschlagen: " + e.getMessage(), e);
        }
    }

    /**
     * Holt die Benutzerinformationen von Odoo.
     *
     * @param userId Die ID des Benutzers
     * @return Map mit Benutzerinformationen (username, roles, company_id, company_name)
     * @throws AuthenticationException wenn der Benutzer nicht gefunden wird
     */
    @Override
    @Cacheable(value = "userInfo", key = "#userId")
    public Map<String, Object> getUserInfo(Integer userId) {
        try {
            XmlRpcClient client = createObjectClient();
            
            // Administratorzugriff für API-Anfragen
            Object[] params = new Object[] {
                odooDatabase,
                getAdminUserId(),
                odooAdminPassword,
                "res.users",
                "read",
                new Object[] { userId },
                new Object[] { "name", "company_id", "groups_id" }
            };
            
            Object[] result = (Object[]) client.execute("execute_kw", params);
            
            if (result.length == 0) {
                throw new AuthenticationException("Benutzer nicht gefunden");
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> userInfo = (Map<String, Object>) result[0];
            
            // Unternehmensname abrufen
            Object[] companyId = (Object[]) userInfo.get("company_id");
            String companyName = (String) companyId[1];
            
            // Rollen abrufen
            List<String> roles = getUserRoles(userId);
            
            Map<String, Object> info = new HashMap<>();
            info.put("roles", roles);
            info.put("company_id", companyId[0].toString());
            info.put("company_name", companyName);
            
            return info;
            
        } catch (XmlRpcException | MalformedURLException e) {
            log.error("Fehler beim Abrufen der Benutzerinformationen: {}", e.getMessage());
            throw new AuthenticationException("Benutzerinformationen konnten nicht abgerufen werden: " + e.getMessage(), e);
        }
    }

    /**
     * Holt die Rollen des Benutzers von Odoo.
     *
     * @param userId Die ID des Benutzers
     * @return Liste der Rollen des Benutzers
     * @throws AuthenticationException wenn die Rollen nicht geholt werden können
     */
    @Override
    @Cacheable(value = "userRoles", key = "#userId")
    public List<String> getUserRoles(Integer userId) {
        try {
            XmlRpcClient client = createObjectClient();
            
            // Administratorzugriff für API-Anfragen
            Object[] params = new Object[] {
                odooDatabase,
                getAdminUserId(),
                odooAdminPassword,
                "res.users",
                "read",
                new Object[] { userId },
                new Object[] { "groups_id" }
            };
            
            Object[] result = (Object[]) client.execute("execute_kw", params);
            
            if (result.length == 0) {
                throw new AuthenticationException("Benutzer nicht gefunden");
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> userInfo = (Map<String, Object>) result[0];
            
            // Benutzergruppen abrufen
            Object[] groupIds = (Object[]) userInfo.get("groups_id");
            
            // Gruppennamen abrufen
            params = new Object[] {
                odooDatabase,
                getAdminUserId(),
                odooAdminPassword,
                "res.groups",
                "read",
                groupIds,
                new Object[] { "name", "category_id" }
            };
            
            result = (Object[]) client.execute("execute_kw", params);
            
            // Rollen aus Gruppen extrahieren
            Set<String> roles = new HashSet<>();
            roles.add("USER"); // Basisrolle für alle authentifizierten Benutzer
            
            for (Object group : result) {
                @SuppressWarnings("unchecked")
                Map<String, Object> groupInfo = (Map<String, Object>) group;
                String groupName = (String) groupInfo.get("name");
                
                // Kategorie der Gruppe abrufen, falls vorhanden
                Object[] categoryId = (Object[]) groupInfo.get("category_id");
                if (categoryId != null && categoryId.length > 0) {
                    String category = (String) categoryId[1];
                    String fullName = category + " / " + groupName;
                    
                    // Rolle aus der Konfiguration abrufen oder Standardwert verwenden
                    String role = roleMapping.getOrDefault(fullName, "ROLE_" + groupName.toUpperCase().replace(" ", "_"));
                    roles.add(role);
                }
            }
            
            return new ArrayList<>(roles);
            
        } catch (XmlRpcException | MalformedURLException e) {
            log.error("Fehler beim Abrufen der Benutzerrollen: {}", e.getMessage());
            throw new AuthenticationException("Benutzerrollen konnten nicht abgerufen werden: " + e.getMessage(), e);
        }
    }

    /**
     * Prüft, ob ein Benutzer existiert.
     *
     * @param userId Die ID des Benutzers
     * @return true, wenn der Benutzer existiert, sonst false
     */
    @Override
    public boolean userExists(Integer userId) {
        try {
            XmlRpcClient client = createObjectClient();
            
            // Administratorzugriff für API-Anfragen
            Object[] params = new Object[] {
                odooDatabase,
                getAdminUserId(),
                odooAdminPassword,
                "res.users",
                "search_count",
                new Object[] { Arrays.asList("id", "=", userId) }
            };
            
            Integer count = (Integer) client.execute("execute_kw", params);
            return count > 0;
            
        } catch (XmlRpcException | MalformedURLException e) {
            log.error("Fehler beim Prüfen der Benutzerexistenz: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Erstellt einen XML-RPC-Client für den Common-Endpunkt.
     *
     * @return XML-RPC-Client
     * @throws MalformedURLException wenn die URL ungültig ist
     */
    private XmlRpcClient createCommonClient() throws MalformedURLException {
        XmlRpcClientConfigImpl config = new XmlRpcClientConfigImpl();
        config.setServerURL(new URL(odooUrl + "/xmlrpc/2/common"));
        config.setEnabledForExtensions(true);
        
        XmlRpcClient client = new XmlRpcClient();
        client.setConfig(config);
        
        return client;
    }

    /**
     * Erstellt einen XML-RPC-Client für den Object-Endpunkt.
     *
     * @return XML-RPC-Client
     * @throws MalformedURLException wenn die URL ungültig ist
     */
    private XmlRpcClient createObjectClient() throws MalformedURLException {
        XmlRpcClientConfigImpl config = new XmlRpcClientConfigImpl();
        config.setServerURL(new URL(odooUrl + "/xmlrpc/2/object"));
        config.setEnabledForExtensions(true);
        
        XmlRpcClient client = new XmlRpcClient();
        client.setConfig(config);
        
        return client;
    }

    /**
     * Holt die ID des Admin-Benutzers.
     *
     * @return ID des Admin-Benutzers
     * @throws XmlRpcException wenn die Anfrage fehlschlägt
     * @throws MalformedURLException wenn die URL ungültig ist
     */
    private Integer getAdminUserId() throws XmlRpcException, MalformedURLException {
        XmlRpcClient client = createCommonClient();
        Object[] params = new Object[] { odooDatabase, odooAdminUser, odooAdminPassword, Collections.emptyMap() };
        return (Integer) client.execute("authenticate", params);
    }
} 