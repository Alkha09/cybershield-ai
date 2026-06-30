package com.cybershield.service;

import com.cybershield.dto.ScanRequest;
import com.cybershield.dto.ScanResponse;
import com.cybershield.entity.ScanResult;
import com.cybershield.entity.User;
import com.cybershield.repository.ScanResultRepository;
import com.cybershield.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScanService {

    private final ScanResultRepository scanResultRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ml.service.url:http://ml-service:8000}")
    private String mlServiceUrl;

    public ScanResponse scan(String userId, String type, ScanRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long startTime = System.currentTimeMillis();

        // Call ML service
        String mlEndpoint = mlServiceUrl + "/api/predict/" + type.toLowerCase();
        ResponseEntity<Map> mlResponse = restTemplate.postForEntity(mlEndpoint, Map.of("content", request.getContent()), Map.class);

        Map<String, Object> mlResult = mlResponse.getBody();
        long processingTime = (int) (System.currentTimeMillis() - startTime);

        // Parse ML response
        String result = (String) mlResult.get("result");
        Double confidence = (Double) mlResult.get("confidence");
        List<String> threats = (List<String>) mlResult.getOrDefault("threats", List.of());

        // Save to database
        ScanResult scanResult = ScanResult.builder()
                .user(user)
                .type(ScanResult.ScanType.valueOf(type.toUpperCase()))
                .input(request.getContent().substring(0, Math.min(request.getContent().length(), 2000)))
                .result(ScanResult.ResultType.valueOf(result.toUpperCase()))
                .confidence(confidence)
                .threats(String.join(",", threats))
                .details(toJson(mlResult.getOrDefault("details", Map.of())))
                .processingTime((int) processingTime)
                .build();

        scanResultRepository.save(scanResult);

        return mapToResponse(scanResult);
    }

    public List<ScanResponse> getHistory(String userId) {
        return scanResultRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void clearHistory(String userId) {
        List<ScanResult> scans = scanResultRepository.findByUserIdOrderByCreatedAtDesc(userId);
        scanResultRepository.deleteAll(scans);
    }

    public Map<String, Object> getStats(String userId) {
        long total = scanResultRepository.countByUserId(userId);
        long threats = scanResultRepository.countByUserIdAndResult(userId, ScanResult.ResultType.PHISHING)
                + scanResultRepository.countByUserIdAndResult(userId, ScanResult.ResultType.MALICIOUS);
        long safe = scanResultRepository.countByUserIdAndResult(userId, ScanResult.ResultType.SAFE);
        long suspicious = scanResultRepository.countByUserIdAndResult(userId, ScanResult.ResultType.SUSPICIOUS);

        return Map.of(
                "totalScans", total,
                "threatsDetected", threats,
                "safeResults", safe,
                "suspiciousResults", suspicious
        );
    }

    private ScanResponse mapToResponse(ScanResult sr) {
        return ScanResponse.builder()
                .id(sr.getId())
                .type(sr.getType().name().toLowerCase())
                .input(sr.getInput())
                .result(sr.getResult().name().toLowerCase())
                .confidence(sr.getConfidence())
                .threats(sr.getThreats() != null ? Arrays.asList(sr.getThreats().split(",")) : List.of())
                .processingTime(sr.getProcessingTime())
                .createdAt(sr.getCreatedAt())
                .build();
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }
}
