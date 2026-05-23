package org.pramod.backend.round;

/** Lifecycle of a single round. */
public enum RoundStatus {
    SCHEDULED,
    COMPLETED,
    CLEARED,
    FAILED,
    CANCELLED
}
