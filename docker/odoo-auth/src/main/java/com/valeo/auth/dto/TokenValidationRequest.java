package com.valeo.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

/**
 * DTO für die Tokenvalidierungsanfrage.
 * Enthält das zu validierende JWT-Token.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenValidationRequest {

    /**
     * Das JWT-Token, das validiert werden soll.
     * Darf nicht leer sein.
     */
    @NotBlank(message = "Das Token darf nicht leer sein")
    private String token;
} 