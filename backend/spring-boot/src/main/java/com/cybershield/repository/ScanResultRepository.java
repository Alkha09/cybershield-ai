package com.cybershield.repository;

import com.cybershield.entity.ScanResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScanResultRepository extends JpaRepository<ScanResult, String> {
    List<ScanResult> findByUserIdOrderByCreatedAtDesc(String userId);
    long countByUserId(String userId);
    long countByUserIdAndResult(String userId, ScanResult.ResultType result);
}
