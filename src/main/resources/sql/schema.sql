-- 创建数据库
CREATE DATABASE IF NOT EXISTS time_capsule DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE time_capsule;

-- 留言表
CREATE TABLE IF NOT EXISTS message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    content TEXT NOT NULL COMMENT '留言内容',
    username VARCHAR(50) NOT NULL DEFAULT '匿名用户' COMMENT '用户名',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    device_info VARCHAR(255) COMMENT '设备信息'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='留言表';

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_config (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    last_message_time DATETIME COMMENT '最后留言时间',
    reset_countdown BOOLEAN DEFAULT FALSE COMMENT '是否重置倒计时',
    countdown_end_time DATETIME COMMENT '倒计时结束时间',
    config_key VARCHAR(50) UNIQUE COMMENT '配置键',
    config_value VARCHAR(255) COMMENT '配置值'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    operation_type VARCHAR(20) NOT NULL COMMENT '操作类型',
    operation_time DATETIME NOT NULL COMMENT '操作时间',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    device_info VARCHAR(255) COMMENT '设备信息',
    message_id BIGINT COMMENT '留言ID',
    description VARCHAR(255) COMMENT '描述'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 初始化系统配置
INSERT INTO system_config (config_key, config_value, countdown_end_time, last_message_time)
VALUES ('COUNTDOWN_HOURS', '24', DATE_ADD(NOW(), INTERVAL 24 HOUR), NOW())
ON DUPLICATE KEY UPDATE config_value = '24'; 