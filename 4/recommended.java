// Final Improved Code (Combining Recommendations)
import java.util.*;
import java.util.stream.Collectors;

public List<UserRecord> processUserData(List<Map<String, Object>> data) {
    if (data == null || data.isEmpty()) {
        return Collections.emptyList();
    }

    return data.stream()
        .filter(Objects::nonNull)
        .map(userMap -> {
            String id = Objects.toString(userMap.get("id"), "");
            String name = Objects.toString(userMap.get("name"), "");
            String email = Objects.toString(userMap.get("email"), "");
            boolean active = Set.of("active", "enabled").contains(
                Objects.toString(userMap.get("status"), "").toLowerCase()
            );
            return new UserRecord(id, name, email, active);
        })
        .collect(Collectors.toList());
}

public boolean saveToDatabase(List<UserRecord> users) {
    try (Connection conn = dataSource.getConnection()) {
        conn.setAutoCommit(false);
        String sql = "INSERT INTO users (id, name, email, active) VALUES (?, ?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (UserRecord user : users) {
                ps.setString(1, user.id());
                ps.setString(2, user.name());
                ps.setString(3, user.email());
                ps.setBoolean(4, user.active());
                ps.addBatch();
            }
            ps.executeBatch();
            conn.commit();
            return true;
        }
    } catch (SQLException e) {
        logger.error("Failed to save users", e);
        return false;
    }
}

// Immutable record (Java 14+)
public record UserRecord(String id, String name, String email, boolean active) {}
Key Improvements:

Type Safety: Uses UserRecord instead of Map.

Validation: Null checks and default values.

Security: Parameterized SQL queries.

Performance: Batch inserts and stream processing.
