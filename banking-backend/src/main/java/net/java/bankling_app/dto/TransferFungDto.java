package net.java.bankling_app.dto;

public record TransferFungDto(Long fromAccountId,
                              Long toAccountId,
                              double amount) {
}
