package com.library.smart_campus_backend.feature2.config;

import com.library.smart_campus_backend.auth.model.User;
import com.library.smart_campus_backend.auth.repository.UserRepository;
import com.library.smart_campus_backend.feature2.model.AlertChannel;
import com.library.smart_campus_backend.feature2.model.AlertStatus;
import com.library.smart_campus_backend.feature2.model.Book;
import com.library.smart_campus_backend.feature2.model.BookStatus;
import com.library.smart_campus_backend.feature2.model.RestockAlert;
import com.library.smart_campus_backend.feature2.repository.BookRepository;
import com.library.smart_campus_backend.feature2.repository.RestockAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class Feature2DataSeeder implements CommandLineRunner {
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final RestockAlertRepository alertRepository;

    @Override
    public void run(String... args) throws Exception {
        if (bookRepository.count() == 0) {
            System.out.println("Seeding feature 2 books and alerts...");
            
            Book missing1 = Book.builder().title("Human Computer Interaction").author("Preece, J.").isbn("978-0470669861").status(BookStatus.MISSING).floor("Floor 2").shelf("Shelf B4").build();
            Book missing2 = Book.builder().title("Artificial Intelligence").author("Stuart Russell").isbn("978-0134610993").status(BookStatus.MISSING).floor("Floor 4").shelf("Shelf F1").build();
            Book missing3 = Book.builder().title("The Pragmatic Programmer").author("Andrew Hunt").isbn("978-0135957059").status(BookStatus.MISSING).floor("Floor 3").shelf("Shelf D2").build();
            Book checkedOut1 = Book.builder().title("Usability Engineering").author("Nielsen, J.").isbn("978-0125184069").status(BookStatus.CHECKED_OUT).floor("Floor 2").shelf("Shelf C2").build();
            Book checkedOut2 = Book.builder().title("Clean Code").author("Robert C. Martin").isbn("978-0132350884").status(BookStatus.CHECKED_OUT).floor("Floor 3").shelf("Shelf E2").build();
            
            List<Book> books = bookRepository.saveAll(List.of(
                    missing1, missing2, missing3, checkedOut1, checkedOut2,
                    Book.builder().title("Design of Everyday Things").author("Don Norman").isbn("978-0465050659").status(BookStatus.AVAILABLE).floor("Floor 1").shelf("Shelf A1").build(),
                    Book.builder().title("Advanced Java").author("Schildt, H.").isbn("978-1260440232").status(BookStatus.AVAILABLE).floor("Floor 3").shelf("Shelf D5").build(),
                    Book.builder().title("Introduction to Algorithms").author("Thomas H. Cormen").isbn("978-0262033848").status(BookStatus.AVAILABLE).floor("Floor 1").shelf("Shelf A4").build(),
                    Book.builder().title("Computer Networks").author("Andrew S. Tanenbaum").isbn("978-0132126953").status(BookStatus.AVAILABLE).floor("Floor 2").shelf("Shelf B2").build(),
                    Book.builder().title("Database System Concepts").author("Abraham Silberschatz").isbn("978-0073523323").status(BookStatus.AVAILABLE).floor("Floor 3").shelf("Shelf D1").build(),
                    Book.builder().title("Software Engineering").author("Ian Sommerville").isbn("978-0133943030").status(BookStatus.AVAILABLE).floor("Floor 4").shelf("Shelf E4").build(),
                    Book.builder().title("Design Patterns").author("Erich Gamma").isbn("978-0201633610").status(BookStatus.AVAILABLE).floor("Floor 3").shelf("Shelf D3").build()
            ));

            if (alertRepository.count() == 0) {
                userRepository.findByEmail("student@library.edu").ifPresent(student -> {
                    RestockAlert waitingAlert = RestockAlert.builder()
                            .book(missing1)
                            .user(student)
                            .channels(List.of(AlertChannel.PUSH))
                            .status(AlertStatus.WAITING)
                            .activeAlertKey(student.getId() + "_" + missing1.getId())
                            .build();

                    RestockAlert notifiedAlert = RestockAlert.builder()
                            .book(missing2)
                            .user(student)
                            .channels(List.of(AlertChannel.EMAIL, AlertChannel.PUSH))
                            .status(AlertStatus.NOTIFIED)
                            .isRead(false)
                            .notifiedAt(LocalDateTime.now().minusDays(1))
                            .build();

                    alertRepository.saveAll(List.of(waitingAlert, notifiedAlert));
                });
            }

            System.out.println("Feature 2 books and alerts seeded successfully.");
        }
    }
}
