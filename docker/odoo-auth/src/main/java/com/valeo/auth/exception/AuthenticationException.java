package com.valeo.auth.exception;

/**
 * Ausnahme, die geworfen wird, wenn ein Authentifizierungsfehler auftritt.
 */
public class AuthenticationException extends RuntimeException {

    /**
     * Erstellt eine neue AuthenticationException mit der angegebenen Nachricht.
     *
     * @param message Die Fehlermeldung
     */
    public AuthenticationException(String message) {
        super(message);
    }

    /**
     * Erstellt eine neue AuthenticationException mit der angegebenen Nachricht und Ursache.
     *
     * @param message Die Fehlermeldung
     * @param cause   Die Ursache der Ausnahme
     */
    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
} 