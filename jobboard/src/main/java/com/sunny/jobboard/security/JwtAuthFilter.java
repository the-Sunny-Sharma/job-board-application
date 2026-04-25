package com.sunny.jobboard.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException{

        // 1. Get Authorization header
        final String authHeader = request.getHeader("Authorization");

        // 2. If no token or wrong format - skip this filter
        if(authHeader == null || !authHeader.startsWith("Bearer ")){
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract token (remove "Bearer " prefix)
        final String token = authHeader.substring(7);

        // 4. Extract email from token
        final String email = jwtUtil.extractEmail(token);

        // 5. If email found and user not already authenticated
        if(email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            //6.Load user from DB
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            //7. Validate token
            if(jwtUtil.isTokenValid(token)){

                //8. Create Authentication object
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                //9. Set authentication in SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authToken);

            }
        }

        //10. Continue the filter chain
        filterChain.doFilter(request, response);
    }
}
