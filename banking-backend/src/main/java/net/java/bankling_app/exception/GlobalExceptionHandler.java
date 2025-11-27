package net.java.bankling_app.exception;


import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;

@ControllerAdvice
public class GlobalExceptionHandler {

    // Handle specific exception - AccountException

    @ExceptionHandler(AccountException.class)
    public ResponseEntity<ErrorDetails> handleAccountException(AccountException exception,
                                                               WebRequest webRequest){
        ErrorDetails errorDetails = new ErrorDetails(
                LocalDateTime.now(),
                exception.getMessage(),
                webRequest.getDescription(false),
                "ACCOUNT_NOT-FOUND"
        );

            return new ResponseEntity<>(errorDetails, HttpStatus.NOT_FOUND);
    }

    //Handle Generic Exception
@ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDetails> handleGenericException(Exception exception,
                                                               WebRequest  webRequest){
        ErrorDetails errorDetails  = new ErrorDetails(
                LocalDateTime.now(),
                exception.getMessage(),
                webRequest.getDescription(false),
                "INTERNET_SERVER_ERROR"

        );
        return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
