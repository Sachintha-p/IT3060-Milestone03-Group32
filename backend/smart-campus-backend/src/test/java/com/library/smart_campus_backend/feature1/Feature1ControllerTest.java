package com.library.smart_campus_backend.feature1;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.library.smart_campus_backend.core.common.ApiResponse;
import com.library.smart_campus_backend.feature1.controller.ReservationController;
import com.library.smart_campus_backend.feature1.dto.ReservationRequest;
import com.library.smart_campus_backend.feature1.service.ReservationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class Feature1ControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ReservationService reservationService;

    @InjectMocks
    private ReservationController reservationController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        org.springframework.web.method.support.HandlerMethodArgumentResolver putPrincipal = new org.springframework.web.method.support.HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(org.springframework.core.MethodParameter parameter) {
                return parameter.getParameterType().isAssignableFrom(org.springframework.security.core.userdetails.UserDetails.class);
            }
            @Override
            public Object resolveArgument(org.springframework.core.MethodParameter parameter, org.springframework.web.method.support.ModelAndViewContainer mavContainer, org.springframework.web.context.request.NativeWebRequest webRequest, org.springframework.web.bind.support.WebDataBinderFactory binderFactory) throws Exception {
                return new org.springframework.security.core.userdetails.User("test@my.sliit.lk", "", java.util.Collections.emptyList());
            }
        };

        mockMvc = MockMvcBuilders.standaloneSetup(reservationController)
                .setCustomArgumentResolvers(putPrincipal)
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    void testValidation_BadDate() throws Exception {
        ReservationRequest req = new ReservationRequest();
        req.setSpaceId(1L);
        // missing date, start time, end time will trigger validation if it works

        mockMvc.perform(post("/api/reservations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetMyReservations() throws Exception {
        mockMvc.perform(get("/api/reservations/me"))
                .andExpect(status().isOk());
    }
}
