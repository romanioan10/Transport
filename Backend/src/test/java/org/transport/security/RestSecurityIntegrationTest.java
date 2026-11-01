package org.transport.security;

import jakarta.servlet.Filter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.junit.jupiter.web.SpringJUnitWebConfig;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.transport.config.CorsConfig;
import org.transport.config.PasswordConfig;
import org.transport.config.SecurityConfig;
import org.transport.controller.*;
import org.transport.exception.GlobalExceptionHandler;
import org.transport.model.User;
import org.transport.model.UserRole;
import org.transport.model.UserStatus;
import org.transport.repository.*;
import org.transport.service.*;
import tools.jackson.databind.json.JsonMapper;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Real MVC, validation, security filters, JWTs and services; only persistence is mocked. */
@SpringJUnitWebConfig(RestSecurityIntegrationTest.TestConfig.class)
class RestSecurityIntegrationTest {

    private static final String SECRET = "test-only-signing-secret-at-least-32-bytes";
    private static final String PASSWORD = "test-password-123";

    @Autowired private WebApplicationContext context;
    @Autowired private UserRepository users;
    @Autowired private VehicleRepository vehicles;
    @Autowired private UserVehicleRepository assignments;
    @Autowired private JwtService jwt;
    @Autowired private PasswordEncoder encoder;
    @Autowired private JsonMapper json;

    private MockMvc mvc;
    private User user;
    private String token;

    @BeforeEach
    void setUp() {
        reset(users, vehicles, assignments);
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .addFilters(context.getBean("springSecurityFilterChain", Filter.class)).build();
        user = User.builder().id(1L).email("client@example.com")
                .password(encoder.encode(PASSWORD)).firstName("Test").lastName("Client")
                .role(UserRole.CLIENT).status(UserStatus.ACTIVE).build();
        when(users.findByEmail(user.getEmail())).thenAnswer(call -> Optional.of(user));
        token = jwt.generateToken(user.getEmail());
    }

    @Test
    void anonymousRequestReturnsJson401() throws Exception {
        mvc.perform(api(get("/api/users/me")))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("WWW-Authenticate", "Bearer"))
                .andExpect(jsonPath("$.error").value("UNAUTHORIZED"))
                .andExpect(jsonPath("$.path").value("/api/users/me"));
    }

    @Test
    void validTokenReadsOwnProfileWithoutPassword() throws Exception {
        mvc.perform(auth(get("/api/users/me")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(user.getEmail()))
                .andExpect(jsonPath("$.role").value("CLIENT"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void clientCannotListUsersAndReceives403InsteadOf500() throws Exception {
        mvc.perform(auth(get("/api/users")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("FORBIDDEN"));
        verify(users, never()).search(any(), any(), any());
    }

    @Test
    void adminCanListUsers() throws Exception {
        user.setRole(UserRole.ADMIN);
        mvc.perform(auth(get("/api/users"))).andExpect(status().isOk());
        verify(users).search(null, null, null);
    }

    @Test
    void clientCannotAccessAssignmentsOrDriverEndpoint() throws Exception {
        mvc.perform(auth(get("/api/assignments"))).andExpect(status().isForbidden());
        mvc.perform(auth(get("/api/drivers/me"))).andExpect(status().isForbidden());
    }

    @Test
    void driverCanReadOwnDriverDetails() throws Exception {
        user.setRole(UserRole.DRIVER);
        mvc.perform(auth(get("/api/drivers/me")))
                .andExpect(status().isOk());
    }

    @Test
    void disablingAccountRejectsAnAlreadyIssuedTokenOnNextRequest() throws Exception {
        mvc.perform(auth(get("/api/users/me"))).andExpect(status().isOk());
        user.setStatus(UserStatus.DISABLED);
        mvc.perform(auth(get("/api/users/me"))).andExpect(status().isUnauthorized());
    }

    @Test
    void changingRoleUpdatesAuthorizationForTheSameToken() throws Exception {
        user.setRole(UserRole.ADMIN);
        mvc.perform(auth(get("/api/users"))).andExpect(status().isOk());
        user.setRole(UserRole.CLIENT);
        mvc.perform(auth(get("/api/users"))).andExpect(status().isForbidden());
    }

    @Test
    void deletedAccountCannotUseItsExistingToken() throws Exception {
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.empty());
        mvc.perform(auth(get("/api/users/me"))).andExpect(status().isUnauthorized());
    }

    @Test
    void malformedExpiredAndWrongSignatureTokensAreRejected() throws Exception {
        String expired = io.jsonwebtoken.Jwts.builder().setSubject(user.getEmail())
                .setExpiration(new java.util.Date(0))
                .signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                        SECRET.getBytes(java.nio.charset.StandardCharsets.UTF_8)))
                .compact();
        String wrongSignature = new JwtService("different-test-signing-secret-at-least-32-bytes", 60_000)
                .generateToken(user.getEmail());
        for (String invalid : new String[]{"not-a-jwt", expired, wrongSignature}) {
            mvc.perform(api(get("/api/users/me")).header("Authorization", "Bearer " + invalid))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Test
    void loginIsPublicEvenWithStaleBearerHeaderAndApiContextPath() throws Exception {
        mvc.perform(api(post("/api/auth/login"))
                        .header("Authorization", "Bearer stale-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(user.getEmail(), PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString());
    }

    @Test
    void allInvalidLoginCasesReturnTheSame401Message() throws Exception {
        mvc.perform(api(post("/api/auth/login")).contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("missing@example.com", PASSWORD)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
        mvc.perform(api(post("/api/auth/login")).contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(user.getEmail(), "wrong-password")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
        user.setStatus(UserStatus.DISABLED);
        mvc.perform(api(post("/api/auth/login")).contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(user.getEmail(), PASSWORD)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    void registrationCreatesOnlyAClientAndHashesThePassword() throws Exception {
        when(users.save(any(User.class))).thenAnswer(call -> call.getArgument(0));
        String response = mvc.perform(api(post("/api/auth/register")).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"new@example.com","password":"new-password-123",
                                 "firstName":"New","lastName":"Client","role":"ADMIN"}
                                """))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        var saved = org.mockito.ArgumentCaptor.forClass(User.class);
        verify(users).save(saved.capture());
        assertThat(saved.getValue().getRole()).isEqualTo(UserRole.CLIENT);
        assertThat(saved.getValue().getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(encoder.matches("new-password-123", saved.getValue().getPassword())).isTrue();
        assertThat(jwt.extractEmail(json.readTree(response).get("token").asText()))
                .isEqualTo("new@example.com");
    }

    @Test
    void duplicateRegistrationReturnsConflict() throws Exception {
        mvc.perform(api(post("/api/auth/register")).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"client@example.com","password":"password123",
                                 "firstName":"Test","lastName":"Client"}
                                """))
                .andExpect(status().isConflict());
        verify(users, never()).save(any());
    }

    @Test
    void registrationValidatesInput() throws Exception {
        mvc.perform(api(post("/api/auth/register")).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }

    @Test
    void allowedCorsPreflightDoesNotRequireAToken() throws Exception {
        mvc.perform(api(options("/api/users/me"))
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

    @Test
    void unknownCorsOriginIsRejected() throws Exception {
        mvc.perform(api(options("/api/users/me"))
                        .header("Origin", "https://unknown.example")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }

    @Test
    void otherActuatorEndpointsAreNotPublic() throws Exception {
        mvc.perform(api(get("/api/actuator/info"))).andExpect(status().isUnauthorized());
        mvc.perform(auth(get("/api/actuator/info"))).andExpect(status().isForbidden());
    }

    @Test
    void persistenceFailureIsNotDisguisedAsInvalidCredentials() throws Exception {
        when(users.findByEmail(user.getEmail()))
                .thenThrow(new org.springframework.dao.DataAccessResourceFailureException("database unavailable"));
        org.assertj.core.api.Assertions.assertThatThrownBy(
                        () -> mvc.perform(auth(get("/api/users/me"))))
                .isInstanceOf(org.springframework.dao.DataAccessResourceFailureException.class);
    }

    private MockHttpServletRequestBuilder api(MockHttpServletRequestBuilder request) {
        String uri = request.buildRequest(context.getServletContext()).getRequestURI();
        return request.contextPath("/api").servletPath(uri.substring("/api".length()));
    }

    private MockHttpServletRequestBuilder auth(MockHttpServletRequestBuilder request) {
        return api(request).header("Authorization", "Bearer " + token);
    }

    private String loginBody(String email, String password) {
        return json.writeValueAsString(java.util.Map.of("email", email, "password", password));
    }

    @Configuration
    @EnableWebMvc
    @EnableWebSecurity
    @Import({SecurityConfig.class, CorsConfig.class, PasswordConfig.class,
            JwtAuthenticationFilter.class, CustomUserDetailsService.class, SecurityErrorHandler.class,
            AuthController.class, UserController.class, VehicleController.class,
            AssignmentController.class, DriverController.class,
            AuthService.class, UserService.class, VehicleService.class,
            AssignmentService.class, DriverService.class, GlobalExceptionHandler.class})
    static class TestConfig {
        @Bean UserRepository users() { return mock(UserRepository.class); }
        @Bean VehicleRepository vehicles() { return mock(VehicleRepository.class); }
        @Bean UserVehicleRepository assignments() { return mock(UserVehicleRepository.class); }
        @Bean JwtService jwtService() { return new JwtService(SECRET, 60_000); }
        @Bean JsonMapper jsonMapper() { return JsonMapper.builder().findAndAddModules().build(); }
    }
}
