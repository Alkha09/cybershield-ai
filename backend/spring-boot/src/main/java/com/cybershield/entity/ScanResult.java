package com.cybershield.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "scan_results")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ScanResult {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ScanType type;

    @Column(nullable = false, length = 2000)
    private String input;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ResultType result;

    @Column(nullable = false)
    private Double confidence;

    @Column(length = 4000)
    private String threats;

    @Column(length = 4000)
    private String details;

    private Integer processingTime;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum ScanType {
        URL, EMAIL, SMS, WHATSAPP, TEXT, SCREENSHOT
    }

    public enum ResultType {
        SAFE, SUSPICIOUS, PHISHING, MALICIOUS
    }
}
