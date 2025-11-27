package net.java.bankling_app.service.impl;
import net.java.bankling_app.dto.TransactionDto;
import net.java.bankling_app.dto.TransferFungDto;
import net.java.bankling_app.entity.Account;
import net.java.bankling_app.dto.AccountDto;
import net.java.bankling_app.entity.Transaction;
import net.java.bankling_app.exception.AccountException;
import net.java.bankling_app.mapper.AccountMapper;
import net.java.bankling_app.repository.AccountRepository;
import net.java.bankling_app.repository.TransactionRepository;
import net.java.bankling_app.service.AccountService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class AccountServiceImpl implements AccountService {

    private AccountRepository accountRepository;

    private TransactionRepository transactionRepository;

    private static final String TRANSACTION_TYPE_DEPOSIT = "DEPOSIT";

    private static final String TRANSACTION_TYPE_WITHDRAW = "WITHDRAW";

    private static final String TRANSACTION_TYPE_TRANSFER= "TRANSFER";

    public AccountServiceImpl(AccountRepository accountRepository,
                              TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    public AccountDto createAccount(AccountDto accountDto) {
        Account account = AccountMapper.mapToAccount(accountDto);
        Account savedAccount = accountRepository.save(account);
        return AccountMapper.mapToAccountDto(savedAccount);

    }

    @Override
    public AccountDto getAccountById(Long id) {

       Account account = accountRepository
               .findById(id)
               .orElseThrow(() -> new AccountException("Account does not exists"));
        return AccountMapper.mapToAccountDto(account);
    }

    @Override
    public AccountDto deposit(Long id, double amount) {

        Account account = accountRepository
                .findById(id)
                .orElseThrow(() -> new AccountException("Account does not exists"));

        double total = account.getBalance() + amount;
        account.setBalance(total);
        Account savedAccount = accountRepository.save(account);

        Transaction transaction = new Transaction();
        transaction.setAccountId(id);
        transaction.setAmount(amount);
        transaction.setTransactionType(TRANSACTION_TYPE_DEPOSIT);
        transaction.setTimestamp(LocalDateTime.now());

        transactionRepository.save(transaction);

        return AccountMapper.mapToAccountDto(savedAccount) ;
    }

    @Override
    public AccountDto withdraw(Long id, double amount) {

        Account account = accountRepository
                .findById(id)
                .orElseThrow(() -> new AccountException("Account does not exists"));

        if(account.getBalance() < amount){
            throw new RuntimeException("Insufficient amount");

        }
        double total = account.getBalance() - amount;
        account.setBalance(total);
        Account savedAccount = accountRepository.save(account);

        Transaction transaction = new Transaction();
        transaction.setAccountId(id);
        transaction.setAmount(amount);
        transaction.setTransactionType(TRANSACTION_TYPE_WITHDRAW);
        transaction.setTimestamp(LocalDateTime.now());

        transactionRepository.save(transaction);


        return AccountMapper.mapToAccountDto(savedAccount);
    }

    @Override
    public List<AccountDto> getAllAccounts() {

        List<Account> accounts = accountRepository.findAll();
       return  accounts.stream().map(account -> AccountMapper.mapToAccountDto(account))
                .collect(Collectors.toList());

    }

    @Override
    public void deleteAccount(Long id) {

        Account account = accountRepository
                .findById(id)
                .orElseThrow(() -> new AccountException("Account does not exists"));

        accountRepository.deleteById(id);
    }

    @Override
    public void transferFunds(TransferFungDto transferFungDto) {

        //Retrieve the account from which we send the amount
        Account fromAccount = accountRepository
                .findById(transferFungDto.fromAccountId())
                .orElseThrow(() -> new AccountException("Account does not exists"));

        if(fromAccount.getBalance() < transferFungDto.amount()) {
            throw new RuntimeException("Insufficient amount");
        }
        // Retrieve the account to which we send the amount
        Account toAccount = accountRepository.findById(transferFungDto.toAccountId())
                .orElseThrow(() -> new AccountException("Account does not exists"));

        //Debit the amount from fromAccount object
        fromAccount.setBalance(fromAccount.getBalance() - transferFungDto.amount());

        //Credit the amount to toAccount object
        toAccount.setBalance(toAccount.getBalance() + transferFungDto.amount());

        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        Transaction transaction = new Transaction();
        transaction.setAccountId(transferFungDto.fromAccountId());
        transaction.setAmount(transferFungDto.amount());
        transaction.setTransactionType(TRANSACTION_TYPE_TRANSFER);
        transaction.setTimestamp(LocalDateTime.now());

        transactionRepository.save(transaction);
    }

    @Override
    public List<TransactionDto> getAccountTransactions(Long accountId) {


        Account account = accountRepository
                .findById(accountId)
                .orElseThrow(() -> new AccountException("Account does not exists"));




        List<Transaction> transactions = transactionRepository
                .findByAccountIdOrderByTimestampDesc(accountId);

     return transactions.stream()
        .map(transaction -> convertEntityToDto(transaction))
        .collect(Collectors.toList());

    }

    private TransactionDto convertEntityToDto(Transaction transaction){
return new TransactionDto(
        transaction.getId(),
        transaction.getAccountId(),
        transaction.getAmount(),
        transaction.getTransactionType(),
        transaction.getTimestamp()
);

    }
}
