package com.example.ecommerce.user.controller;
import com.example.ecommerce.user.dto.UserRequest;
import com.example.ecommerce.user.entity.User;
import com.example.ecommerce.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserService service;
  public UserController(UserService service) { this.service = service; }
  @GetMapping public List<User> findAll() { return service.findAll(); }
  @GetMapping("/{id}") public User findById(@PathVariable Long id) { return service.findById(id); }
  @PostMapping @ResponseStatus(HttpStatus.CREATED)
  public User create(@Valid @RequestBody UserRequest request) { return service.create(request); }
  @PutMapping("/{id}") public User update(@PathVariable Long id, @Valid @RequestBody UserRequest request) { return service.update(id, request); }
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) { service.delete(id); }
}
