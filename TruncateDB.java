import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class TruncateDB {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://ep-spring-sunset-b489m5c6-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";
        String user = "neondb_owner";
        String password = "npg_WtjB87EPmUzA";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Connected to the database!");
            String sql = "TRUNCATE TABLE feature2_search_history, feature2_restock_alerts_channels, feature2_restock_alerts, feature2_books CASCADE";
            stmt.executeUpdate(sql);
            System.out.println("Tables truncated successfully.");
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
