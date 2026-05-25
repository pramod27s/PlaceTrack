package org.pramod.backend.company;

/**
 * The columns of the placement pipeline. A company card moves left-to-right
 * through these as the process progresses. REJECTED is a terminal side-state.
 */
public enum Stage {
    APPLIED,
    PPT,
    OA,
    SHORTLISTED,
    GD,
    TECH,
    HR,
    OFFER,
    REJECTED
}
