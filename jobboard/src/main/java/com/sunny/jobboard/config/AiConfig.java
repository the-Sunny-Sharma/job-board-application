package com.sunny.jobboard.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.client.RestClient;

@Configuration
public class AiConfig {

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    @Value("${spring.ai.openai.base-url}")
    private String baseUrl;

    @Value("${spring.ai.openai.chat.model}")
    private String model;

    /**
     * RestClient that calls Groq's chat completions API directly.
     * No Spring AI → no "extra_body" error.
     */
    @Bean
    @Primary
    public RestClient groqRestClient() {
        return RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    /**
     * Expose the model name as a bean for convenience.
     */
    @Bean
    public String groqModelName() {
        return model;
    }
}