package com.cybershield.controller;

import com.cybershield.dto.ScanRequest;
import com.cybershield.dto.ScanResponse;
import com.cybershield.security.JwtUtil;
import com.cybershield.service.ScanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scan")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ScanController {

    private final ScanService scanService;
    private final JwtUtil jwtUtil;

    @PostMapping("/{type}")
    public ResponseEntity<ScanResponse> scan(
            @PathVariable String type,
            @Valid @RequestBody ScanRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String userId = jwtUtil.getUserIdFromToken(token);
        return ResponseEntity.ok(scanService.scan(userId, type, request));
    }

    @GetMapping("/history")
    public ResponseEntity<List<ScanResponse>> getHistory(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String userId = jwtUtil.getUserIdFromToken(token);
        return ResponseEntity.ok(scanService.getHistory(userId));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String userId = jwtUtil.getUserIdFromToken(token);
        return ResponseEntity.ok(scanService.getStats(userId));
    }

    @DeleteMapping("/history")
    public ResponseEntity<Void> clearHistory(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String userId = jwtUtil.getUserIdFromToken(token);
        scanService.clearHistory(userId);
        return ResponseEntity.ok().build();
    }
}
