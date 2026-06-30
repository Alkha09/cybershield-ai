package com.cybershield.service;

import com.cybershield.entity.ScanResult;
import com.cybershield.entity.User;
import com.cybershield.repository.ScanResultRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MLService {

    private final ScanResultRepository scanResultRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    public ScanResult detectPhishingUrl(String url, User user) {
        return callMLService("/api/predict/url", Map.of("url", url), user, ScanResult.ScanType.URL, url);
    }

    public ScanResult detectPhishingEmail(String content, User user) {
        return callMLService("/api/predict/email", Map.of("content", content), user, ScanResult.ScanType.EMAIL,
                content.length() > 200 ? content.substring(0, 200) + "..." : content);
    }

    public ScanResult detectPhishingSms(String message, String type, User user) {
        ScanResult.ScanType scanType = "whatsapp".equals(type) ? ScanResult.ScanType.WHATSAPP : ScanResult.ScanType.SMS;
        return callMLService("/api/predict/sms", Map.of("message", message, "type", type), user, scanType, message);
    }

    public ScanResult detectPhishingText(String text, User user) {
        return callMLService("/api/predict/text", Map.of("text", text), user, ScanResult.ScanType.TEXT,
                text.length() > 200 ? text.substring(0, 200) + "..." : text);
    }

    private ScanResult callMLService(String endpoint, Map<String, Object> payload,
                                      User user, ScanResult.ScanType type, String displayInput) {
        long startTime = System.currentTimeMillis();

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    mlServiceUrl + endpoint, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                String resultStr = (String) body.get("result");
                double confidence = ((Number) body.get("confidence")).doubleValue();
                List<String> threats = (List<String>) body.get("threats");
                Map<String, Object> details = (Map<String, Object>) body.get("details");

                ScanResult.ResultStatus status = switch (resultStr.toLowerCase()) {
                    case "phishing" -> ScanResult.ResultStatus.PHISHING;
                    case "suspicious" -> ScanResult.ResultStatus.SUSPICIOUS;
                    case "malicious" -> ScanResult.ResultStatus.MALICIOUS;
                    default -> ScanResult.ResultStatus.SAFE;
                };

                ScanResult scanResult = new ScanResult();
                scanResult.setUser(user);
                scanResult.setType(type);
                scanResult.setInput(displayInput);
                scanResult.setResult(status);
                scanResult.setConfidence(confidence);
                scanResult.setThreats(objectMapper.writeValueAsString(threats));
                scanResult.setDetails(objectMapper.writeValueAsString(details));
                scanResult.setMlModel((String) details.get("model"));
                scanResult.setModelVersion((String) details.get("version"));
                scanResult.setProcessingTime((int) (System.currentTimeMillis() - startTime));
                scanResult.setCreatedAt(LocalDateTime.now());

                // Update user stats
                user.setTotalScans(user.getTotalScans() + 1);
                if (status == ScanResult.ResultStatus.PHISHING || status == ScanResult.ResultStatus.MALICIOUS) {
                    user.setThreatsDetected(user.getThreatsDetected() + 1);
                }

                return scanResultRepository.save(scanResult);
            }
        } catch (Exception e) {
            log.error("ML Service call failed for endpoint {}: {}", endpoint, e.getMessage());
        }

        // Fallback: return error result
        ScanResult errorResult = new ScanResult();
        errorResult.setUser(user);
        errorResult.setType(type);
        errorResult.setInput(displayInput);
        errorResult.setResult(ScanResult.ResultStatus.SAFE);
        errorResult.setConfidence(0.0);
        errorResult.setThreats("[]");
        errorResult.setDetails("{\"error\": \"ML service unavailable\"}");
        errorResult.setMlModel("N/A");
        errorResult.setModelVersion("N/A");
        errorResult.setProcessingTime((int) (System.currentTimeMillis() - startTime));
        errorResult.setCreatedAt(LocalDateTime.now());

        return scanResultRepository.save(errorResult);
    }

    @org.springframework.context.annotation.Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
