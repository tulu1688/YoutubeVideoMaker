CREATE DATABASE IF NOT EXISTS youtube CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS youtube.video
(
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    url VARCHAR(256) NOT NULL,
    status VARCHAR(32) NOT NULL,
    status_message VARCHAR(32),
    frame_count INT(11),
    tags VARCHAR(256),
    title VARCHAR(256),
    description VARCHAR(1024),
    is_deleted TINYINT(1) DEFAULT 0,
    created_timestamp TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
    last_updated_timestamp TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6) NOT NULL
);
CREATE INDEX youtube_idx01 ON youtube.video (url);