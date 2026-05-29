package com.vinyl.vinyl_backend.entity;

public enum ListingType {
    SALE("Продажа"),
    EXCHANGE("Обмен"),
    SEARCH("Поиск"),
    RECORD("На показ");
    private final String displayName;

    ListingType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}