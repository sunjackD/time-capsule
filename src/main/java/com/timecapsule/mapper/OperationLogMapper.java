package com.timecapsule.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.timecapsule.entity.OperationLog;
import org.apache.ibatis.annotations.Mapper;

/**
 * 操作日志Mapper接口
 */
@Mapper
public interface OperationLogMapper extends BaseMapper<OperationLog> {
} 