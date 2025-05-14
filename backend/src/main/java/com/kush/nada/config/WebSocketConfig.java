package com.kush.nada.config;

import com.kush.nada.services.JwtService;
import com.kush.nada.services.MyUserDetailsService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  private static final Logger logger = LoggerFactory.getLogger(WebSocketConfig.class);

  private final JwtService jwtService;
  private final MyUserDetailsService userDetailsService;

  @Autowired
  public WebSocketConfig(JwtService jwtService, MyUserDetailsService userDetailsService) {
    this.jwtService = jwtService;
    this.userDetailsService = userDetailsService;
  }

  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    config.enableSimpleBroker("/topic");
    config.setApplicationDestinationPrefixes("/app");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")

            .setAllowedOriginPatterns("http://localhost:5173")
            .addInterceptors(handshakeInterceptor())
            .withSockJS();

  }
  @Bean
  public HandshakeInterceptor handshakeInterceptor() {
    return new HandshakeInterceptor() {
      @Override
      public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                     WebSocketHandler wsHandler, Map<String, Object> attributes) {
        if (request instanceof ServletServerHttpRequest) {
          HttpServletRequest servletRequest = ((ServletServerHttpRequest) request).getServletRequest();
          String authToken = servletRequest.getParameter("authToken");

          if (authToken != null) {
            try {
              String username = jwtService.extractUserName(authToken);
              UserDetails userDetails = userDetailsService.loadUserByUsername(username);

              if (jwtService.validateToken(authToken, userDetails)) {
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.info("WebSocket handshake authorized for user: {}", username);
                return true;
              } else {
                logger.warn("WebSocket handshake unauthorized. Invalid token.");
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
              }
            } catch (Exception e) {
              logger.error("WebSocket handshake failed: {}", e.getMessage());
              response.setStatusCode(HttpStatus.UNAUTHORIZED);
              return false;
            }
          } else {
            logger.warn("WebSocket handshake unauthorized. Missing authToken.");
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
          }
        }
        return true;
      }

      @Override
      public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                 WebSocketHandler wsHandler, Exception exception) {
        // No post-handshake actions required
      }
    };
  }
}
