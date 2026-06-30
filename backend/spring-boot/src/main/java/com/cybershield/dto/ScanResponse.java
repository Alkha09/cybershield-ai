package com.cybershield.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScanResponse {
    private String id;
    private String type;
    private String input;
    private String result;
    private Double confidence;
    private List<String> threats;
    private Object details;
    private Integer processingTime;
    private LocalDateTime createdAt;
}
