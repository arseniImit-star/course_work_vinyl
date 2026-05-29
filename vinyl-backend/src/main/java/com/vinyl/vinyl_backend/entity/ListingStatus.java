// entity/ListingStatus.java
package com.vinyl.vinyl_backend.entity;

public enum ListingStatus {
    ACTIVE("Активно"),
    SOLD("Продано"),
    CLOSED("Закрыто");

    private final String displayName;

    ListingStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}