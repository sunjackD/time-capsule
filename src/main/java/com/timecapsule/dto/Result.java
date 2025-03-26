package com.timecapsule.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * 统一返回结果封装
 */
@Data
public class Result<T> implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 状态码
     */
    private Integer code;
    
    /**
     * 返回消息
     */
    private String message;
    
    /**
     * 返回数据
     */
    private T data;
    
    /**
     * 成功返回结果
     *
     * @param <T> 数据类型
     * @return 结果
     */
    public static <T> Result<T> success() {
        return success(null);
    }
    
    /**
     * 成功返回结果
     *
     * @param data 返回数据
     * @param <T>  数据类型
     * @return 结果
     */
    public static <T> Result<T> success(T data) {
        return success("操作成功", data);
    }
    
    /**
     * 成功返回结果
     *
     * @param message 提示信息
     * @param data    返回数据
     * @param <T>     数据类型
     * @return 结果
     */
    public static <T> Result<T> success(String message, T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage(message);
        result.setData(data);
        return result;
    }
    
    /**
     * 失败返回结果
     *
     * @param <T> 数据类型
     * @return 结果
     */
    public static <T> Result<T> failed() {
        return failed("操作失败");
    }
    
    /**
     * 失败返回结果
     *
     * @param message 提示信息
     * @param <T>     数据类型
     * @return 结果
     */
    public static <T> Result<T> failed(String message) {
        return failed(500, message);
    }
    
    /**
     * 失败返回结果
     *
     * @param code    状态码
     * @param message 提示信息
     * @param <T>     数据类型
     * @return 结果
     */
    public static <T> Result<T> failed(Integer code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }
} 