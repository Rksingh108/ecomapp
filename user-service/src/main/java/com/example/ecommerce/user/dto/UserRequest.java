package com.example.ecommerce.user.dto;
    import jakarta.validation.constraints.*;
import java.math.BigDecimal;

    public class UserRequest {
        @NotBlank
    private String name;
    @NotBlank @Email
    private String email;
        public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    }
