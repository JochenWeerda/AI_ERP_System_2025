package com.valeo.enni.service;

import com.valeo.enni.model.Crop;
import com.valeo.enni.model.Farm;
import com.valeo.enni.model.Field;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

/**
 * Service-Schnittstelle für die Kommunikation mit der ENNI-API.
 */
public interface EnniService {

    /**
     * Holt alle Felder eines Betriebs von der ENNI-API.
     *
     * @param farmId Die ID des Betriebs
     * @return Liste aller Felder des Betriebs
     */
    List<Field> getFieldsByFarm(String farmId);

    /**
     * Holt ein einzelnes Feld von der ENNI-API.
     *
     * @param fieldId Die ID des Felds
     * @return Das Feld oder null, wenn es nicht gefunden wurde
     */
    Field getFieldById(String fieldId);

    /**
     * Holt alle Betriebe von der ENNI-API.
     *
     * @return Liste aller Betriebe
     */
    List<Farm> getAllFarms();

    /**
     * Holt alle verfügbaren Kulturen von der ENNI-API.
     *
     * @return Liste aller Kulturen
     */
    List<Crop> getAllCrops();

    /**
     * Importiert eine GeoJSON-Datei mit Feldern.
     *
     * @param file       Die GeoJSON-Datei
     * @param farmId     Die ID des Betriebs, zu dem die Felder gehören
     * @param formatName Der Name des Formats (z.B. "ackermatic", "agrooffice")
     * @return Liste der importierten Felder
     */
    List<Field> importFieldsFromGeoJson(MultipartFile file, String farmId, String formatName);

    /**
     * Importiert eine XML-Datei mit Feldern.
     *
     * @param file       Die XML-Datei
     * @param farmId     Die ID des Betriebs, zu dem die Felder gehören
     * @param formatName Der Name des Formats (z.B. "ackermatic", "agrooffice")
     * @return Liste der importierten Felder
     */
    List<Field> importFieldsFromXml(MultipartFile file, String farmId, String formatName);

    /**
     * Exportiert Felder als GeoJSON.
     *
     * @param fieldIds   Die IDs der zu exportierenden Felder
     * @param formatName Der Name des Formats (z.B. "ackermatic", "agrooffice")
     * @return InputStream mit den GeoJSON-Daten
     */
    InputStream exportFieldsAsGeoJson(List<String> fieldIds, String formatName);

    /**
     * Exportiert Felder als XML.
     *
     * @param fieldIds   Die IDs der zu exportierenden Felder
     * @param formatName Der Name des Formats (z.B. "ackermatic", "agrooffice")
     * @return InputStream mit den XML-Daten
     */
    InputStream exportFieldsAsXml(List<String> fieldIds, String formatName);

    /**
     * Erstellt einen Düngebedarfsermittlungsbericht für ein Feld.
     *
     * @param fieldId Die ID des Felds
     * @param params  Zusätzliche Parameter für die Düngebedarfsermittlung
     * @return InputStream mit dem PDF-Bericht
     */
    InputStream createFertilizerReport(String fieldId, Map<String, Object> params);

    /**
     * Synchronisiert Felder zwischen Odoo und ENNI.
     *
     * @param fieldIds Die IDs der zu synchronisierenden Felder
     * @return Liste der synchronisierten Felder
     */
    List<Field> synchronizeFields(List<String> fieldIds);

    /**
     * Aktualisiert ein Feld in der ENNI-API.
     *
     * @param field Das zu aktualisierende Feld
     * @return Das aktualisierte Feld
     */
    Field updateField(Field field);

    /**
     * Erstellt ein neues Feld in der ENNI-API.
     *
     * @param field Das zu erstellende Feld
     * @return Das erstellte Feld
     */
    Field createField(Field field);

    /**
     * Löscht ein Feld aus der ENNI-API.
     *
     * @param fieldId Die ID des zu löschenden Felds
     * @return true, wenn das Löschen erfolgreich war, sonst false
     */
    boolean deleteField(String fieldId);
} 