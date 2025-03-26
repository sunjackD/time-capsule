package com.timecapsule.service;

/**
 * 数据备份服务接口
 */
public interface BackupService {
    
    /**
     * 备份留言数据为SQL文件
     *
     * @return 备份文件路径
     */
    String backupMessagesToSql();
} 