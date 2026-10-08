package com.library.smart_campus_backend.feature3.config;

import com.library.smart_campus_backend.auth.model.Role;
import com.library.smart_campus_backend.auth.model.User;
import com.library.smart_campus_backend.auth.repository.UserRepository;
import com.library.smart_campus_backend.feature3.model.Feature3Book;
import com.library.smart_campus_backend.feature3.model.Feature3StaffSetting;
import com.library.smart_campus_backend.feature3.model.StaffAlert;
import com.library.smart_campus_backend.feature3.repository.Feature3BookRepository;
import com.library.smart_campus_backend.feature3.repository.Feature3StaffSettingRepository;
import com.library.smart_campus_backend.feature3.repository.StaffAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class Feature3DataSeeder implements CommandLineRunner {

    private final StaffAlertRepository alertRepository;
    private final Feature3BookRepository bookRepository;
    private final Feature3StaffSettingRepository settingRepository;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        if (bookRepository.count() == 0) {
            bookRepository.saveAll(List.of(
                Feature3Book.builder().title("Human Computer Interaction").author("Preece, J.").isbn("978-0470666855").shelf("B4").section("Floor 2").status("Missing / Misplaced").build(),
                Feature3Book.builder().title("Advanced Java Programming").author("Smith, A.").isbn("978-1234567890").shelf("A1").section("Floor 1").status("Issued").build(),
                Feature3Book.builder().title("Spring Boot in Action").author("Walls, C.").isbn("978-1617292545").shelf("C3").section("Floor 3").status("Available").build(),
                Feature3Book.builder().title("Clean Code").author("Martin, R.C.").isbn("978-0132350884").shelf("B2").section("Floor 2").status("Available").build(),
                Feature3Book.builder().title("Design Patterns").author("Gamma, E.").isbn("978-0201633610").shelf("A5").section("Floor 1").status("Reshelved").build(),
                Feature3Book.builder().title("Refactoring").author("Fowler, M.").isbn("978-0201485677").shelf("C1").section("Floor 3").status("Available").build(),
                Feature3Book.builder().title("Effective Java").author("Bloch, J.").isbn("978-0134685991").shelf("B1").section("Floor 2").status("Missing / Misplaced").build(),
                Feature3Book.builder().title("Head First Design Patterns").author("Freeman, E.").isbn("978-0596007126").shelf("A3").section("Floor 1").status("Issued").build(),
                Feature3Book.builder().title("Java Concurrency in Practice").author("Goetz, B.").isbn("978-0321349606").shelf("C4").section("Floor 3").status("Available").build(),
                Feature3Book.builder().title("Grokking Algorithms").author("Bhargava, A.").isbn("978-1617292231").shelf("B5").section("Floor 2").status("Available").build(),
                Feature3Book.builder().title("Introduction to Algorithms").author("Cormen, T.").isbn("978-0262033848").shelf("A2").section("Floor 1").status("Reshelved").build(),
                Feature3Book.builder().title("The Pragmatic Programmer").author("Thomas, D.").isbn("978-0135957059").shelf("C2").section("Floor 3").status("Missing / Misplaced").build(),
                Feature3Book.builder().title("Code Complete").author("McConnell, S.").isbn("978-0735619678").shelf("B3").section("Floor 2").status("Issued").build(),
                Feature3Book.builder().title("Structure and Interpretation").author("Abelson, H.").isbn("978-0262510875").shelf("A4").section("Floor 1").status("Available").build(),
                Feature3Book.builder().title("Compilers").author("Aho, A.").isbn("978-0201100884").shelf("C5").section("Floor 3").status("Available").build()
            ));
        }

        if (alertRepository.count() == 0) {
            alertRepository.saveAll(List.of(
                StaffAlert.builder().type("SEATING").message("Floor 3 Group Zone reached 95% capacity. Action: Redirect...").priority("HIGH").zone("GROUP_STUDY").isRead(false).resolved(false).createdAt(LocalDateTime.now().minusHours(1)).build(),
                StaffAlert.builder().type("BOOK").message("5 students requested 'Advanced Java'. Missing. Verify Shelf A1").priority("MEDIUM").zone("QUIET_READING").isRead(false).resolved(false).createdAt(LocalDateTime.now().minusHours(2)).build(),
                StaffAlert.builder().type("MANUAL").message("AC broken in Floor 2.").priority("LOW").zone("SILENT_STUDY").isRead(true).resolved(false).createdAt(LocalDateTime.now().minusDays(1)).build(),
                StaffAlert.builder().type("SEATING").message("Floor 1 Quiet Zone is full.").priority("HIGH").zone("QUIET_READING").isRead(false).resolved(true).createdAt(LocalDateTime.now().minusDays(2)).build(),
                StaffAlert.builder().type("BOOK").message("Misplaced book found in Group Study.").priority("LOW").zone("GROUP_STUDY").isRead(true).resolved(true).createdAt(LocalDateTime.now().minusDays(3)).build(),
                StaffAlert.builder().type("SEATING").message("Floor 2 Silent Pods at 80%.").priority("MEDIUM").zone("SILENT_STUDY").isRead(false).resolved(false).createdAt(LocalDateTime.now().minusMinutes(30)).build(),
                StaffAlert.builder().type("MANUAL").message("Spill in Group Study area.").priority("HIGH").zone("GROUP_STUDY").isRead(false).resolved(false).createdAt(LocalDateTime.now().minusMinutes(15)).build(),
                StaffAlert.builder().type("BOOK").message("New arrivals need shelving.").priority("LOW").zone("LIBRARY").isRead(true).resolved(false).createdAt(LocalDateTime.now().minusHours(5)).build()
            ));
        }

        User staffUser = userRepository.findByEmail("staff@sliit.lk").orElse(null);
        if (staffUser != null && settingRepository.count() == 0) {
            settingRepository.save(Feature3StaffSetting.builder()
                .userId(staffUser.getId())
                .pushAlerts(true)
                .emailDigest(false)
                .build());
        }
    }
}
