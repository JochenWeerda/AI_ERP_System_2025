package com.valeo.auth.exception;

/**
 * Ausnahme, die geworfen wird, wenn ein Token ungültig ist.
 */
public class InvalidTokenException extends RuntimeException {

    /**
     * Erstellt eine neue InvalidTokenException mit der angegebenen Nachricht.
     *
     * @param message Die Fehlermeldung
     */
    public InvalidTokenException(String message) {
        super(message);
    }

    /**
     * Erstellt eine neue InvalidTokenException mit der angegebenen Nachricht und Ursache.
     *
     * @param message Die Fehlermeldung
     * @param cause   Die Ursache der Ausnahme
     */
    public InvalidTokenException(String message, Throwable cause) {
        super(message, cause);
    }
} 