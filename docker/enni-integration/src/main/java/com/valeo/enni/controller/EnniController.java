package com.valeo.enni.controller;

import com.valeo.enni.model.Crop;
import com.valeo.enni.model.Farm;
import com.valeo.enni.model.Field;
import com.valeo.enni.service.EnniService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller für die ENNI-API.
 * Stellt REST-Endpunkte für die Verwaltung von landwirtschaftlichen Daten bereit.
 */
@RestController
@RequestMapping("/api/v1/enni")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "ENNI API", description = "Endpunkte für die Integration mit der ENNI-Landwirtschaftsplattform")
public class EnniController {

    private final EnniService enniService;

    /**
     * Holt alle Felder eines Betriebs.
     *
     * @param farmId Die ID des Betriebs
     * @return Liste aller Felder des Betriebs
     */
    @GetMapping("/farms/{farmId}/fields")
    @Operation(
            summary = "Holt alle Felder eines Betriebs",
            description = "Gibt eine Liste aller Felder zurück, die zu einem bestimmten Betrieb gehören.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Felder erfolgreich abgerufen"),
                    @ApiResponse(responseCode = "404", description = "Betrieb nicht gefunden"),
                    @ApiResponse(responseCode = "500", description = "Interner Serverfehler")
            }
    )
    public ResponseEntity<List<Field>> getFieldsByFarm(
            @Parameter(description = "ID des Betriebs") @PathVariable String farmId) {
        log.debug("Hole Felder für Betrieb mit ID: {}", farmId);
        List<Field> fields = enniService.getFieldsByFarm(farmId);
        return ResponseEntity.ok(fields);
    }

    /**
     * Holt ein einzelnes Feld.
     *
     * @param fieldId Die ID des Felds
     * @return Das Feld
     */
    @GetMapping("/fields/{fieldId}")
    @Operation(
            summary = "Holt ein einzelnes Feld",
            description = "Gibt die Details eines einzelnen Felds zurück.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Feld erfolgreich abgerufen"),
                    @ApiResponse(responseCode = "404", description = "Feld nicht gefunden"),
                    @ApiResponse(responseCode = "500", description = "Interner Serverfehler")
            }
    )
    public ResponseEntity<Field> getFieldById(
            @Parameter(description = "ID des Felds") @PathVariable String fieldId) {
        log.debug("Hole Feld mit ID: {}", fieldId);
        Field field = enniService.getFieldById(fieldId);
        return ResponseEntity.ok(field);
    }

    /**
     * Holt alle Betriebe.
     *
     * @return Liste aller Betriebe
     */
    @GetMapping("/farms")
    @Operation(
            summary = "Holt alle Betriebe",
            description = "Gibt eine Liste aller Betriebe zurück.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Betriebe erfolgreich abgerufen"),
                    @ApiResponse(responseCode = "500", description = "Interner Serverfehler")
            }
    )
    public ResponseEntity<List<Farm>> getAllFarms() {
        log.debug("Hole alle Betriebe");
        List<Farm> farms = enniService.getAllFarms();
        return ResponseEntity.ok(farms);
    }

    /**
     * Holt alle Kulturen.
     *
     * @return Liste aller Kulturen
     */
    @GetMapping("/crops")
    @Operation(
            summary = "Holt alle Kulturen",
            description = "Gibt eine Liste aller verfügbaren Kulturen zurück.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Kulturen erfolgreich abgerufen"),
                    @ApiResponse(responseCode = "500", description = "Interner Serverfehler")
            }
    )
    public ResponseEntity<List<Crop>> getAllCrops() {
        log.debug("Hole alle Kulturen");
        List<Crop> crops = enniService.getAllCrops();
        return ResponseEntity.ok(crops);
    }

    /**
     * Importiert Felder aus einer GeoJSON-Datei.
     *
     * @param file       Die GeoJSON-Datei
     * @param farmId     Die ID des Betriebs
     * @param formatName Der Name des Formats
     * @return Liste der importierten Felder
     */
    @PostMapping("/imports/geojson")
    @Operation(
            summary = "Importiert Felder aus einer GeoJSON-Datei",
            description = "Importiert Felder aus einer GeoJSON-Datei in das System.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Felder erfolgreich importiert"),
                    @ApiResponse(responseCode = "400", description = "Ungültige Anfrage"),
                    @ApiResponse(responseCode = "500", description = "Interner Serverfehler")
            }
    )
    public ResponseEntity<List<Field>> importFieldsFromGeoJson(
            @Parameter(description = "GeoJSON-Datei") @RequestParam("file") MultipartFile file,
            @Parameter(description = "ID des Betriebs") @RequestParam("farmId") String farmId,
            @Parameter(description = "Name des Formats") @RequestParam("formatName") String formatName) {
        log.debug("Importiere Felder aus GeoJSON für Betrieb mit ID: {}, Format: {}", farmId, formatName);
        List<Field> fields = enniService.importFieldsFromGeoJson(file, farmId, formatName);
        return ResponseEntity.ok(fields);
    }

    /**
     * Importiert Felder aus einer XML-Datei.
     *
     * @param file       Die XML-Datei
     * @param farmId     Die ID des Betriebs
     * @param formatName Der Name des Formats
     * @return Liste der importierten Felder
     */
    @PostMapping("/imports/xml")
    @Operation(
            summary = "Importiert Felder aus einer XML-Datei",
            description = "Importiert Felder aus einer XML-Datei in das System.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Felder erfolgreich importiert"),
                    @ApiResponse(responseCode = "400", description = "Ungültige Anfrage"),
                    @ApiResponse(responseCode = "500", description = "Interner Serverfehler")
            }
    )
    public ResponseEntity<List<Field>> importFieldsFromXml(
            @Parameter(description = "XML-Datei") @RequestParam("file") MultipartFile file,
            @Parameter(description = "ID des Betriebs") @RequestParam("farmId") String farmId,
            @Parameter(description = "Name des Formats") @RequestParam("formatName") String formatName) {
        log.debug("Importiere Felder aus XML für Betrieb mit ID: {}, Format: {}", farmId, formatName);
        List<Field> fields = enniService.importFieldsFromXml(file, farmId, formatName);
        return ResponseEntity.ok(fields);
    }

    /**
     * Exportiert Felder als GeoJSON.
     *
     * @param fieldIds   Die IDs der zu exportierenden Felder
     * @param formatName Der Name des Formats
     * @return GeoJSON-Datei
     */
    @PostMapping("/exports/geojson")
    @Operation(
            summary = "Exportiert Felder als GeoJSON",
            description = "Exportiert ausgewählte Felder als GeoJSON-Datei.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Felder erfolgreich exportiert"),
                    @ApiResponse(responseCode = "400", description = "Ungültige Anfrage"),
                    @ApiResponse(responseCode = "500", description = "Interner Serverfehler")
            }
    )
    public ResponseEntity<InputStreamResource> exportFieldsAsGeoJson(
            @Parameter(description = "IDs der zu exportierenden Felder") @RequestBody List<String> fieldIds,
            @Parameter(description = "Name des Formats") @RequestParam("formatName") String formatName) {
        log.debug("Exportiere Felder als GeoJSON, Format: {}, Anzahl Felder: {}", formatName, fieldIds.size());
        InputStream is = enniService.exportFieldsAsGeoJson(fieldIds, formatName);
        
        InputStreamResource resource = new InputStreamResource(is);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=fields.geojson");
        
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_JSON)
                .body(resource);
    }

    /**
     * Exportiert Felder als XML.
     *
     * @param fieldIds   Die IDs der zu exportierenden Felder
     * @param formatName Der Name des Formats
     * @return XML-Datei
     */
    @PostMapping("/exports/xml")
    @Operation(
            summary = "Exportiert Felder als XML",
            description = "Exportiert ausgewählte Felder als XML-Datei.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Felder erfolgreich exportiert"),
                    @ApiResponse(responseCode = "400", description = "Ungültige Anfrage"),
                    @ApiResponse(responseCode = "500", description = "Interner Serverfehler")
            }
    )
    public ResponseEntity<InputStreamResource> exportFieldsAsXml(
            @Parameter(description = "IDs der zu exportierenden Felder") @RequestBody List<String> fieldIds,
            @Parameter(description = "Name des Formats") @RequestParam("formatName") String formatName) {
        log.debug("Exportiere Felder als XML, Format: {}, Anzahl Felder: {}", formatName, fieldIds.size());
        InputStream is = enniService.exportFieldsAsXml(fieldIds, formatName);
        
        InputStreamResource resource = new InputStreamResource(is);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=fields.xml");
        
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_XML)
                .body(resource);
    }

    /**
     * Erstellt einen Düngebedarfsermittlungsbericht.
     *
     * @param fieldId Die ID des Felds
     * @param params  Zusätzliche Parameter für die Düngebedarfsermittlung
     * @return PDF-Bericht
     */
    @PostMapping("/reports/fertilizer/{fieldId}")
    @Operation(
            summary = "Erstellt einen Düngebedarfsermittlungsbericht",
            description = "Erstellt einen Düngebedarfsermittlungsbericht für ein Feld als PDF.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Bericht erfolgreich erstellt"),
                    @ApiResponse(responseCode = "400", description = "Ungültige Anfrage"),
                    @ApiResponse(responseCode = "404", description = "Feld nicht gefunden"),
                    @ApiResponse(responseCode = "500", description = "Interner Serverfehler")
            }
    )
    public ResponseEntity<InputStreamResource> createFertilizerReport(
            @Parameter(description = "ID des Felds") @PathVariable String fieldId,
            @Parameter(description = "Zusätzliche Parameter") @RequestBody(required = false) Map<String, Object> params) {
        log.debug("Erstelle Düngebedarfsermittlungsbericht für Feld mit ID: {}", fieldId);
        if (params == null) {
            params = new HashMap<>();
        }
        InputStream is = enniService.createFertilizerReport(fieldId, params);
        
        InputStreamResource resource = new InputStreamResource(is);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=fertilizer-report.pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    /**
     * Synchronisiert Felder zwischen Odoo und ENNI.
     *
     * @param fieldIds Die IDs der zu synchronisierenden Felder
     * @return Liste der synchronisierten Felder
     */
    @PostMapping("/sync")
    @Operation(
            summary = "Synchronisiert Felder zwischen Odoo und ENNI",
            description = "Synchronisiert ausgewählte Felder zwischen dem Odoo-Backend und der ENNI-Plattform.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Felder erfolgreich synchronisiert"),
                    @ApiResponse(responseCode = "400", description = "Ungültige Anfrage"),
                    @ApiResponse(responseCode = "500", description = "Interner Serverfehler")
            }
    )
    public ResponseEntity<List<Field>> synchronizeFields(
            @Parameter(description = "IDs der zu synchronisierenden Felder") @RequestBody List<String> fieldIds) {
        log.debug("Synchronisiere Felder, Anzahl: {}", fieldIds.size());
        List<Field> fields = enniService.synchronizeFields(fieldIds);
        return ResponseEntity.ok(fields);
    }

    /**
     * Aktualisiert ein Feld.
     *
     * @param fieldId Die ID des Felds
     * @param field   Das aktualisierte Feld
     * @return Das aktualisierte Feld
     */
    @PutMapping("/fields/{fieldId}")
    @Operation(
            summary = "Aktualisiert ein Feld",
            description = "Aktualisiert die Daten eines bestehenden Felds.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Feld erfolgreich aktualisiert"),
                    @ApiResponse(responseCode = "400", description = "Ungültige Anfrage"),
                    @ApiResponse(responseCode = "404", description = "Feld nicht gefunden"),
                    @ApiResponse(responseCode = "500", description = "Interner Serverfehler")
            }
    )
    public ResponseEntity<Field> updateField(
            @Parameter(description = "ID des Felds") @PathVariable String fieldId,
            @Parameter(description = "Aktualisierte Felddaten", 
                    content = @Content(schema = @Schema(implementation = Field.class)))
            @Valid @RequestBody Field field) {
        log.debug("Aktualisiere Feld mit ID: {}", fieldId);
        field.setId(fieldId); // Stelle sicher, dass die ID gesetzt ist
        Field updatedField = enniService.updateField(field);
        return ResponseEntity.ok(updatedField);
    }

    /**
     * Erstellt ein neues Feld.
     *
     * @param field Das neue Feld
     * @return Das erstellte Feld
     */
    @PostMapping("/fields")
    @Operation(
            summary = "Erstellt ein neues Feld",
            description = "Erstellt ein neues Feld im System.",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Feld erfolgreich erstellt"),
                    @ApiResponse(responseCode = "400", description = "Ungültige Anfrage"),
                    @ApiResponse(responseCode = "500", description = "Interner Serverfehler")
            }
    )
    public ResponseEntity<Field> createField(
            @Parameter(description = "Neue Felddaten", 
                    content = @Content(schema = @Schema(implementation = Field.class)))
            @Valid @RequestBody Field field) {
        log.debug("Erstelle neues Feld");
        Field createdField = enniService.createField(field);
        return ResponseEntity.status(201).body(createdField);
    }

    /**
     * Löscht ein Feld.
     *
     * @param fieldId Die ID des Felds
     * @return Statusmeldung
     */
    @DeleteMapping("/fields/{fieldId}")
    @Operation(
            summary = "Löscht ein Feld",
            description = "Löscht ein Feld aus dem System.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Feld erfolgreich gelöscht"),
                    @ApiResponse(responseCode = "404", description = "Feld nicht gefunden"),
                    @ApiResponse(responseCode = "500", description = "Interner Serverfehler")
            }
    )
    public ResponseEntity<Void> deleteField(
            @Parameter(description = "ID des Felds") @PathVariable String fieldId) {
        log.debug("Lösche Feld mit ID: {}", fieldId);
        boolean deleted = enniService.deleteField(fieldId);
        return ResponseEntity.noContent().build();
    }
} 