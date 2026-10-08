package com.library.smart_campus_backend.auth.model;

/**
 * User roles in the Smart Library System.
 * STUDENT — regular library member (can search, borrow, reserve).
 * ADMIN   — librarian / administrator (full management access).
 */
public enum Role {
    STUDENT,
    STAFF,
    ADMIN
}
