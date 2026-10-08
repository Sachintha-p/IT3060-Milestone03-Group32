package com.library.smart_campus_backend.feature3.repository;

import com.library.smart_campus_backend.feature3.model.Feature3Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface Feature3BookRepository extends JpaRepository<Feature3Book, Long> {
    List<Feature3Book> findByTitleContainingIgnoreCaseOrIsbnContainingIgnoreCase(String title, String isbn);
}
