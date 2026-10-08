package com.library.smart_campus_backend.feature2.service;

import com.library.smart_campus_backend.auth.model.User;
import com.library.smart_campus_backend.auth.repository.UserRepository;
import com.library.smart_campus_backend.feature2.dto.Feature2SearchHistoryDTO;
import com.library.smart_campus_backend.feature2.model.Feature2SearchHistory;
import com.library.smart_campus_backend.feature2.repository.Feature2SearchHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class Feature2SearchHistoryService {
    private final Feature2SearchHistoryRepository searchHistoryRepository;
    private final UserRepository userRepository;

    @Transactional
    public void addSearchHistory(String email, String query) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        searchHistoryRepository.findByUserIdAndQuery(user.getId(), query).ifPresent(searchHistoryRepository::delete);

        Feature2SearchHistory history = Feature2SearchHistory.builder()
                .user(user)
                .query(query)
                .build();
        searchHistoryRepository.save(history);

        List<Feature2SearchHistory> allHistory = searchHistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        if (allHistory.size() > 10) {
            searchHistoryRepository.deleteAll(allHistory.subList(10, allHistory.size()));
        }
    }

    @Transactional(readOnly = true)
    public List<Feature2SearchHistoryDTO> getSearchHistory(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return searchHistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void clearAllHistory(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        List<Feature2SearchHistory> allHistory = searchHistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        searchHistoryRepository.deleteAll(allHistory);
    }

    @Transactional
    public void deleteHistoryItem(Long id, String email) {
        Feature2SearchHistory history = searchHistoryRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "History item not found"));
        if (!history.getUser().getEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your history item");
        }
        searchHistoryRepository.delete(history);
    }

    private Feature2SearchHistoryDTO mapToDTO(Feature2SearchHistory history) {
        return Feature2SearchHistoryDTO.builder()
                .id(history.getId())
                .query(history.getQuery())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
