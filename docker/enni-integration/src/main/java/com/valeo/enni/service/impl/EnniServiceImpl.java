package com.valeo.enni.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.valeo.enni.config.EnniConfig;
import com.valeo.enni.model.Crop;
import com.valeo.enni.model.Farm;
import com.valeo.enni.model.Field;
import com.valeo.enni.service.EnniService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Implementierung des EnniService zur Kommunikation mit der ENNI-API.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EnniServiceImpl implements EnniService {

    private final RestTemplate restTemplate;
    private final EnniConfig enniConfig;
    private final ObjectMapper objectMapper;
    private final XmlMapper xmlMapper;

    /**
     * Holt alle Felder eines Betriebs von der ENNI-API.
     *
     * @param farmId Die ID des Betriebs
     * @return Liste aller Felder des Betriebs
     */
    @Override
    @Cacheable(value = "fields", key = "'farmFields:' + #farmId")
    public List<Field> getFieldsByFarm(String farmId) {
        log.debug("Rufe Felder für Betrieb mit ID: {} von der ENNI-API ab", farmId);
        
        String url = UriComponentsBuilder.fromUriString(enniConfig.getBaseUrl())
                .path("/farms/{farmId}/fields")
                .buildAndExpand(farmId)
                .toUriString();
        
        HttpHeaders headers = createHeaders();
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
        
        ResponseEntity<Field[]> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                Field[].class
        );
        
        if (response.getBody() == null) {
            return Collections.emptyList();
        }
        
        return Arrays.asList(response.getBody());
    }

    /**
     * Holt ein einzelnes Feld von der ENNI-API.
     *
     * @param fieldId Die ID des Felds
     * @return Das Feld oder null, wenn es nicht gefunden wurde
     */
    @Override
    @Cacheable(value = "fields", key = "'field:' + #fieldId")
    public Field getFieldById(String fieldId) {
        log.debug("Rufe Feld mit ID: {} von der ENNI-API ab", fieldId);
        
        String url = UriComponentsBuilder.fromUriString(enniConfig.getBaseUrl())
                .path("/fields/{fieldId}")
                .buildAndExpand(fieldId)
                .toUriString();
        
        HttpHeaders headers = createHeaders();
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
        
        ResponseEntity<Field> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                Field.class
        );
        
        return response.getBody();
    }

    /**
     * Holt alle Betriebe von der ENNI-API.
     *
     * @return Liste aller Betriebe
     */
    @Override
    @Cacheable(value = "enni-responses", key = "'farms'")
    public List<Farm> getAllFarms() {
        log.debug("Rufe alle Betriebe von der ENNI-API ab");
        
        String url = UriComponentsBuilder.fromUriString(enniConfig.getBaseUrl())
                .path("/farms")
                .build()
                .toUriString();
        
        HttpHeaders headers = createHeaders();
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
        
        ResponseEntity<Farm[]> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                Farm[].class
        );
        
        if (response.getBody() == null) {
            return Collections.emptyList();
        }
        
        return Arrays.asList(response.getBody());
    }

    /**
     * Holt alle verfügbaren Kulturen von der ENNI-API.
     *
     * @return Liste aller Kulturen
     */
    @Override
    @Cacheable(value = "crops")
    public List<Crop> getAllCrops() {
        log.debug("Rufe alle Kulturen von der ENNI-API ab");
        
        String url = UriComponentsBuilder.fromUriString(enniConfig.getBaseUrl())
                .path("/crops")
                .build()
                .toUriString();
        
        HttpHeaders headers = createHeaders();
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
        
        ResponseEntity<Crop[]> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                Crop[].class
        );
        
        if (response.getBody() == null) {
            return Collections.emptyList();
        }
        
        return Arrays.asList(response.getBody());
    }

    /**
     * Importiert eine GeoJSON-Datei mit Feldern.
     *
     * @param file       Die GeoJSON-Datei
     * @param farmId     Die ID des Betriebs, zu dem die Felder gehören
     * @param formatName Der Name des Formats (z.B. "ackermatic", "agrooffice")
     * @return Liste der importierten Felder
     */
    @Override
    @CacheEvict(value = {"fields", "enni-responses"}, allEntries = true)
    public List<Field> importFieldsFromGeoJson(MultipartFile file, String farmId, String formatName) {
        log.debug("Importiere GeoJSON-Datei für Betrieb mit ID: {}, Format: {}", farmId, formatName);
        
        try {
            // Diese Implementierung ist ein Platzhalter. In der realen Implementierung würde
            // hier die Datei an die ENNI-API gesendet werden.
            String url = UriComponentsBuilder.fromUriString(enniConfig.getBaseUrl())
                    .path("/imports/geojson")
                    .queryParam("farmId", farmId)
                    .queryParam("formatName", formatName)
                    .build()
                    .toUriString();
            
            HttpHeaders headers = createHeaders();
            
            // In einer realen Implementierung würde hier ein MultipartHttpServletRequest
            // erstellt werden, um die Datei zu senden.
            
            // Platzhalter-Implementierung: Die Datei wird gelesen und als JSON analysiert
            Field[] fields = objectMapper.readValue(file.getInputStream(), Field[].class);
            return Arrays.asList(fields);
            
        } catch (Exception e) {
            log.error("Fehler beim Importieren der GeoJSON-Datei: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Importieren der GeoJSON-Datei", e);
        }
    }

    /**
     * Importiert eine XML-Datei mit Feldern.
     *
     * @param file       Die XML-Datei
     * @param farmId     Die ID des Betriebs, zu dem die Felder gehören
     * @param formatName Der Name des Formats (z.B. "ackermatic", "agrooffice")
     * @return Liste der importierten Felder
     */
    @Override
    @CacheEvict(value = {"fields", "enni-responses"}, allEntries = true)
    public List<Field> importFieldsFromXml(MultipartFile file, String farmId, String formatName) {
        log.debug("Importiere XML-Datei für Betrieb mit ID: {}, Format: {}", farmId, formatName);
        
        try {
            // Diese Implementierung ist ein Platzhalter. In der realen Implementierung würde
            // hier die Datei an die ENNI-API gesendet werden.
            String url = UriComponentsBuilder.fromUriString(enniConfig.getBaseUrl())
                    .path("/imports/xml")
                    .queryParam("farmId", farmId)
                    .queryParam("formatName", formatName)
                    .build()
                    .toUriString();
            
            HttpHeaders headers = createHeaders();
            
            // In einer realen Implementierung würde hier ein MultipartHttpServletRequest
            // erstellt werden, um die Datei zu senden.
            
            // Platzhalter-Implementierung: Die Datei wird gelesen und als XML analysiert
            Field[] fields = xmlMapper.readValue(file.getInputStream(), Field[].class);
            return Arrays.asList(fields);
            
        } catch (Exception e) {
            log.error("Fehler beim Importieren der XML-Datei: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Importieren der XML-Datei", e);
        }
    }

    /**
     * Exportiert Felder als GeoJSON.
     *
     * @param fieldIds   Die IDs der zu exportierenden Felder
     * @param formatName Der Name des Formats (z.B. "ackermatic", "agrooffice")
     * @return InputStream mit den GeoJSON-Daten
     */
    @Override
    public InputStream exportFieldsAsGeoJson(List<String> fieldIds, String formatName) {
        log.debug("Exportiere Felder als GeoJSON, Format: {}, Anzahl Felder: {}", formatName, fieldIds.size());
        
        try {
            // Diese Implementierung ist ein Platzhalter. In der realen Implementierung würde
            // hier eine Anfrage an die ENNI-API gesendet werden.
            String url = UriComponentsBuilder.fromUriString(enniConfig.getBaseUrl())
                    .path("/exports/geojson")
                    .queryParam("formatName", formatName)
                    .build()
                    .toUriString();
            
            HttpHeaders headers = createHeaders();
            HttpEntity<List<String>> requestEntity = new HttpEntity<>(fieldIds, headers);
            
            ResponseEntity<byte[]> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    byte[].class
            );
            
            // Platzhalter-Implementierung: Eine leere GeoJSON-Struktur wird zurückgegeben
            if (response.getBody() == null) {
                String emptyGeoJson = "{ \"type\": \"FeatureCollection\", \"features\": [] }";
                return new ByteArrayInputStream(emptyGeoJson.getBytes());
            }
            
            return new ByteArrayInputStream(response.getBody());
            
        } catch (Exception e) {
            log.error("Fehler beim Exportieren der Felder als GeoJSON: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Exportieren der Felder als GeoJSON", e);
        }
    }

    /**
     * Exportiert Felder als XML.
     *
     * @param fieldIds   Die IDs der zu exportierenden Felder
     * @param formatName Der Name des Formats (z.B. "ackermatic", "agrooffice")
     * @return InputStream mit den XML-Daten
     */
    @Override
    public InputStream exportFieldsAsXml(List<String> fieldIds, String formatName) {
        log.debug("Exportiere Felder als XML, Format: {}, Anzahl Felder: {}", formatName, fieldIds.size());
        
        try {
            // Diese Implementierung ist ein Platzhalter. In der realen Implementierung würde
            // hier eine Anfrage an die ENNI-API gesendet werden.
            String url = UriComponentsBuilder.fromUriString(enniConfig.getBaseUrl())
                    .path("/exports/xml")
                    .queryParam("formatName", formatName)
                    .build()
                    .toUriString();
            
            HttpHeaders headers = createHeaders();
            HttpEntity<List<String>> requestEntity = new HttpEntity<>(fieldIds, headers);
            
            ResponseEntity<byte[]> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    byte[].class
            );
            
            // Platzhalter-Implementierung: Eine leere XML-Struktur wird zurückgegeben
            if (response.getBody() == null) {
                String emptyXml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><fields></fields>";
                return new ByteArrayInputStream(emptyXml.getBytes());
            }
            
            return new ByteArrayInputStream(response.getBody());
            
        } catch (Exception e) {
            log.error("Fehler beim Exportieren der Felder als XML: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Exportieren der Felder als XML", e);
        }
    }

    /**
     * Erstellt einen Düngebedarfsermittlungsbericht für ein Feld.
     *
     * @param fieldId Die ID des Felds
     * @param params  Zusätzliche Parameter für die Düngebedarfsermittlung
     * @return InputStream mit dem PDF-Bericht
     */
    @Override
    public InputStream createFertilizerReport(String fieldId, Map<String, Object> params) {
        log.debug("Erstelle Düngebedarfsermittlungsbericht für Feld mit ID: {}", fieldId);
        
        try {
            // Diese Implementierung ist ein Platzhalter. In der realen Implementierung würde
            // hier eine Anfrage an die ENNI-API gesendet werden.
            String url = UriComponentsBuilder.fromUriString(enniConfig.getBaseUrl())
                    .path("/reports/fertilizer/{fieldId}")
                    .buildAndExpand(fieldId)
                    .toUriString();
            
            HttpHeaders headers = createHeaders();
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(params, headers);
            
            ResponseEntity<byte[]> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    byte[].class
            );
            
            // Platzhalter-Implementierung: Ein leeres PDF wird zurückgegeben
            if (response.getBody() == null) {
                byte[] emptyPdf = new byte[] {}; // In der realen Implementierung wäre hier ein echtes PDF
                return new ByteArrayInputStream(emptyPdf);
            }
            
            return new ByteArrayInputStream(response.getBody());
            
        } catch (Exception e) {
            log.error("Fehler beim Erstellen des Düngebedarfsermittlungsberichts: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Erstellen des Düngebedarfsermittlungsberichts", e);
        }
    }

    /**
     * Synchronisiert Felder zwischen Odoo und ENNI.
     *
     * @param fieldIds Die IDs der zu synchronisierenden Felder
     * @return Liste der synchronisierten Felder
     */
    @Override
    @CacheEvict(value = {"fields", "enni-responses"}, allEntries = true)
    public List<Field> synchronizeFields(List<String> fieldIds) {
        log.debug("Synchronisiere Felder, Anzahl: {}", fieldIds.size());
        
        // Diese Implementierung ist ein Platzhalter. In der realen Implementierung würde
        // hier die Synchronisation zwischen Odoo und ENNI durchgeführt werden.
        
        // Holen der Felder aus ENNI
        List<Field> fields = fieldIds.stream()
                .map(this::getFieldById)
                .filter(field -> field != null)
                .toList();
        
        // Hier würde in der realen Implementierung die Synchronisation mit Odoo stattfinden
        
        return fields;
    }

    /**
     * Aktualisiert ein Feld in der ENNI-API.
     *
     * @param field Das zu aktualisierende Feld
     * @return Das aktualisierte Feld
     */
    @Override
    @CacheEvict(value = {"fields", "enni-responses"}, key = "'field:' + #field.id")
    public Field updateField(Field field) {
        log.debug("Aktualisiere Feld mit ID: {}", field.getId());
        
        String url = UriComponentsBuilder.fromUriString(enniConfig.getBaseUrl())
                .path("/fields/{fieldId}")
                .buildAndExpand(field.getId())
                .toUriString();
        
        HttpHeaders headers = createHeaders();
        HttpEntity<Field> requestEntity = new HttpEntity<>(field, headers);
        
        ResponseEntity<Field> response = restTemplate.exchange(
                url,
                HttpMethod.PUT,
                requestEntity,
                Field.class
        );
        
        return response.getBody();
    }

    /**
     * Erstellt ein neues Feld in der ENNI-API.
     *
     * @param field Das zu erstellende Feld
     * @return Das erstellte Feld
     */
    @Override
    @CacheEvict(value = {"fields", "enni-responses"}, allEntries = true)
    public Field createField(Field field) {
        log.debug("Erstelle neues Feld");
        
        String url = UriComponentsBuilder.fromUriString(enniConfig.getBaseUrl())
                .path("/fields")
                .build()
                .toUriString();
        
        HttpHeaders headers = createHeaders();
        HttpEntity<Field> requestEntity = new HttpEntity<>(field, headers);
        
        ResponseEntity<Field> response = restTemplate.postForEntity(
                url,
                requestEntity,
                Field.class
        );
        
        return response.getBody();
    }

    /**
     * Löscht ein Feld aus der ENNI-API.
     *
     * @param fieldId Die ID des zu löschenden Felds
     * @return true, wenn das Löschen erfolgreich war, sonst false
     */
    @Override
    @CacheEvict(value = {"fields", "enni-responses"}, allEntries = true)
    public boolean deleteField(String fieldId) {
        log.debug("Lösche Feld mit ID: {}", fieldId);
        
        String url = UriComponentsBuilder.fromUriString(enniConfig.getBaseUrl())
                .path("/fields/{fieldId}")
                .buildAndExpand(fieldId)
                .toUriString();
        
        HttpHeaders headers = createHeaders();
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
        
        try {
            restTemplate.exchange(
                    url,
                    HttpMethod.DELETE,
                    requestEntity,
                    Void.class
            );
            return true;
        } catch (Exception e) {
            log.error("Fehler beim Löschen des Felds: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Erstellt die HTTP-Header für die Anfragen an die ENNI-API.
     *
     * @return Die HTTP-Header mit dem API-Schlüssel
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-API-Key", enniConfig.getApiKey());
        return headers;
    }
}
