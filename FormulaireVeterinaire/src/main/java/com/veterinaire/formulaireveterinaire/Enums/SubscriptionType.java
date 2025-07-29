package com.veterinaire.formulaireveterinaire.Enums;

public enum SubscriptionType {
    SIX_MONTHS("6M"),
    ONE_YEAR("1Y");

    private final String code;

    SubscriptionType(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
