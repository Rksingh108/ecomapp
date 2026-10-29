package com.example.ecommerce.product.service;
import com.example.ecommerce.product.dto.ProductRequest;
import com.example.ecommerce.product.entity.Product;
import com.example.ecommerce.product.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.List;
@Service
public class ProductService {
  private final ProductRepository repository;
  public ProductService(ProductRepository repository) { this.repository = repository; }
  public List<Product> findAll() { return repository.findAll(); }
  public Product findById(Long id) {
    return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: " + id));
  }
  @Transactional
  public Product create(ProductRequest request) {
    Product entity = new Product();
    entity.setName(request.getName());
entity.setDescription(request.getDescription());
entity.setPrice(request.getPrice());
entity.setStock(request.getStock());
    return repository.save(entity);
  }
  @Transactional
  public Product update(Long id, ProductRequest request) {
    Product entity = findById(id);
    entity.setName(request.getName());
entity.setDescription(request.getDescription());
entity.setPrice(request.getPrice());
entity.setStock(request.getStock());
    return repository.save(entity);
  }
  public void delete(Long id) {
    if (!repository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: " + id);
    repository.deleteById(id);
  }
}
