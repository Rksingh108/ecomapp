package com.example.ecommerce.user.service;
import com.example.ecommerce.user.dto.UserRequest;
import com.example.ecommerce.user.entity.User;
import com.example.ecommerce.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.List;
@Service
public class UserService {
  private final UserRepository repository;
  public UserService(UserRepository repository) { this.repository = repository; }
  public List<User> findAll() { return repository.findAll(); }
  public User findById(Long id) {
    return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));
  }
  @Transactional
  public User create(UserRequest request) {
    User entity = new User();
    entity.setName(request.getName());
entity.setEmail(request.getEmail());
    return repository.save(entity);
  }
  @Transactional
  public User update(Long id, UserRequest request) {
    User entity = findById(id);
    entity.setName(request.getName());
entity.setEmail(request.getEmail());
    return repository.save(entity);
  }
  public void delete(Long id) {
    if (!repository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id);
    repository.deleteById(id);
  }
}
