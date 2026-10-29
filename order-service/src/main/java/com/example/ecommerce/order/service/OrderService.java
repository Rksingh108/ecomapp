package com.example.ecommerce.order.service;
import com.example.ecommerce.order.dto.OrderRequest;
import com.example.ecommerce.order.entity.Order;
import com.example.ecommerce.order.entity.OrderStatus;
import com.example.ecommerce.order.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.List;
@Service
public class OrderService {
  private final OrderRepository repository;
  public OrderService(OrderRepository repository) { this.repository = repository; }
  public List<Order> findAll() { return repository.findAll(); }
  public Order findById(Long id) {
    return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + id));
  }
  @Transactional
  public Order create(OrderRequest request) {
    Order entity = new Order();
    entity.setUserId(request.getUserId());
entity.setProductId(request.getProductId());
entity.setQuantity(request.getQuantity());
    return repository.save(entity);
  }
  @Transactional
  public Order update(Long id, OrderRequest request) {
    Order entity = findById(id);
    entity.setUserId(request.getUserId());
entity.setProductId(request.getProductId());
entity.setQuantity(request.getQuantity());
    return repository.save(entity);
  }
  public void delete(Long id) {
    if (!repository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + id);
    repository.deleteById(id);
  }

    public Order updateStatus(Long id, OrderStatus status) {
        Order entity = findById(id);
        entity.setStatus(status);
        return repository.save(entity);
    }
}
