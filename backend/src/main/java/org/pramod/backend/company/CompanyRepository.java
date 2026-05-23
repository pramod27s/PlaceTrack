package org.pramod.backend.company;

import org.pramod.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    List<Company> findByUserOrderByUpdatedAtDesc(User user);

    Optional<Company> findByIdAndUser(Long id, User user);

    long countByUser(User user);
}
