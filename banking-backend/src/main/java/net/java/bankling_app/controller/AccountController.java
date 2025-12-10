package net.java.bankling_app.controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import net.java.bankling_app.dto.AccountDto;
import net.java.bankling_app.dto.TransactionDto;
import net.java.bankling_app.dto.TransferFungDto;
import net.java.bankling_app.service.AccountService;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
@CrossOrigin(origins = { "http://localhost:5173" })
@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }


    // Add Account Rest Api
@PostMapping
    public ResponseEntity<AccountDto> addAccount (@RequestBody AccountDto accountDto){
        return new ResponseEntity<>(accountService.createAccount(accountDto), HttpStatus.CREATED);
    }

    // Get Account Rest API
    @GetMapping("/{id}")
    public ResponseEntity<AccountDto>getAccountById(@PathVariable  Long id){
        AccountDto accountDto = accountService.getAccountById(id);
        return ResponseEntity.ok(accountDto);
    }
    // Deposit Rest API
    @PutMapping("/{id}/deposit")
    public ResponseEntity<AccountDto>deposit(@PathVariable  Long id,
                                             @RequestBody  Map<String, Double> request){


        Double amount = request.get("amount");

        AccountDto accountDto = accountService.deposit(id, request.get("amount"));
   return ResponseEntity.ok(accountDto);
    }

    // withdraw Rest API
    @PutMapping("/{id}/withdraw")
    public  ResponseEntity<AccountDto>withdraw(@PathVariable Long id,
                                               @RequestBody Map<String, Double> request){

        Double amount = request.get("amount");
        AccountDto accountDto = accountService.withdraw(id, request.get("amount"));
        return ResponseEntity.ok(accountDto);
    }

    // Get All Account Rest API
    @GetMapping
    public ResponseEntity<List<AccountDto>> getAllAccount(){
        List<AccountDto> accounts = accountService.getAllAccounts();
        return ResponseEntity.ok(accounts);
    }

    // Delete Account Rest API
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAccount(@PathVariable Long id){
        accountService.deleteAccount(id);
        return ResponseEntity.ok("Account is deleted successfully!");
    }

    //Build transfer REST API

    @PostMapping("/transfer")
    public ResponseEntity<String> transferFund(@RequestBody TransferFungDto transferFungDto){
        accountService.transferFunds(transferFungDto);
        return ResponseEntity.ok("Transfer Successfull");
    }


    // Build transactions REST API

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<TransactionDto>> fetchAccountTransaction(@PathVariable("id") Long accountId){

        List<TransactionDto> transactions = accountService.getAccountTransactions(accountId);
        return ResponseEntity.ok(transactions);
    }
}
