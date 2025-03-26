package com.timecapsule;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 时光留痕应用程序入口
 */
@SpringBootApplication
@EnableScheduling
@MapperScan("com.timecapsule.mapper")
public class TimeCapsuleApplication {

    public static void main(String[] args) {
        SpringApplication.run(TimeCapsuleApplication.class, args);
    }
} 