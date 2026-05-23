package org.pramod.backend.exception;

/** Thrown for client errors that validation annotations cannot express. */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
