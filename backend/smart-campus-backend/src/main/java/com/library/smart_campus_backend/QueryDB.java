package com.library.smart_campus_backend;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class QueryDB {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://ep-spring-sunset-b489m5c6-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";
        String user = "neondb_owner";
        String password = "npg_WtjB87EPmUzA";
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM feature4_admin_settings")) {
            if (rs.next()) {
                System.out.println("___COUNT___=" + rs.getInt(1));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
