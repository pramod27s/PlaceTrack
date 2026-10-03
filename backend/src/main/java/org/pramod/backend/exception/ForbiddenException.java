package org.pramod.backend.exception;

/** Thrown when an authenticated user acts on a resource they do not own. */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
