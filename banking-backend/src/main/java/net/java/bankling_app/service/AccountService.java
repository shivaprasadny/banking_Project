package net.java.bankling_app.service;

import net.java.bankling_app.dto.AccountDto;
import net.java.bankling_app.dto.TransactionDto;
import net.java.bankling_app.dto.TransferFungDto;

import java.util.List;


public interface AccountService {

    AccountDto createAccount(AccountDto accountDto);

    AccountDto getAccountById(Long id);

    AccountDto deposit(Long id, double amount);

    AccountDto withdraw(Long id, double amount);

    List<AccountDto> getAllAccounts();

    void deleteAccount(Long id);

    void transferFunds(TransferFungDto transferFungDto);

    List<TransactionDto> getAccountTransactions(Long accountId);
}
