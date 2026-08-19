package com.example.kanban.dto;

import com.example.kanban.entity.TaskStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDto {

    private Long id;

    @NotBlank(message = "제목은 필수 입력 사항입니다.")
    private String title;

    private String description;

    private TaskStatus status;

    // React 화면의 HIGH / MEDIUM / LOW 연동을 위해 추가
    private String priority;

    // React 화면의 #tag 연동용 (Dev, QA, Design 등)
    private String category;

    private Integer displayOrder;

    // React로 JSON 전달 시 날짜 문자열 포맷팅
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime updatedAt;
}