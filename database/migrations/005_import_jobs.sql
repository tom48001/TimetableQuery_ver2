-- Durable progress for the single-process import worker. Also created by the
-- backend at startup so existing Docker volumes need no manual installation.
USE school_management;
CREATE TABLE IF NOT EXISTS import_jobs (
  job_id CHAR(36) PRIMARY KEY,
  owner_id BIGINT NOT NULL,
  status ENUM('pending','processing','success','failed') NOT NULL DEFAULT 'pending',
  total_rows INT UNSIGNED NOT NULL DEFAULT 0,
  processed_rows INT UNSIGNED NOT NULL DEFAULT 0,
  error_message TEXT NULL,
  result_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_import_jobs_owner (owner_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
