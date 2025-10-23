package com.helpdesk.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attachment")
public class Attachment {

    @Id
    @Column(name = "attachment_id_pk", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ticket_id_fk", nullable = false,
                foreignKey = @ForeignKey(name = "attachment_ticket_id_fk_foreign"))
    private Ticket ticket;

    @Column(name = "filename", nullable = false, length = 255)
    private String filename;

    @Column(name = "filepath", nullable = false, length = 500)
    private String filepath;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    public Attachment() {}

    public Attachment(Long id, Ticket ticket, String filename, String filepath, LocalDateTime uploadedAt) {
        this.id = id;
        this.ticket = ticket;
        this.filename = filename;
        this.filepath = filepath;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Ticket getTicket() { return ticket; }
    public void setTicket(Ticket ticket) { this.ticket = ticket; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public String getFilepath() { return filepath; }
    public void setFilepath(String filepath) { this.filepath = filepath; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
