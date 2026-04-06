package project.TeamFive.ExLMS.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

/**
 * Base class cho các entity hỗ trợ soft delete.
 * Khi gọi repository.delete(), thực tế chỉ set deleted_at thay vì xóa thật.
 * @SQLRestriction tự động lọc các bản ghi đã xóa trong mọi query.
 */
@Getter
@Setter
@MappedSuperclass
@SQLRestriction("deleted_at IS NULL")
public abstract class SoftDeletableEntity extends BaseEntity {

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    /**
     * Thực hiện soft delete: đặt deleted_at = now().
     * Gọi method này thay cho repository.delete().
     */
    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    /**
     * Kiểm tra entity có đang bị soft-deleted không.
     */
    public boolean isDeleted() {
        return this.deletedAt != null;
    }
}
