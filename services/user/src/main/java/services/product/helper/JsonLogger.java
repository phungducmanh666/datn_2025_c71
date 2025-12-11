package services.product.helper;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

public class JsonLogger {

  private static final String LOG_DIR = "log"; // Thư mục log ở gốc dự án
  private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

  public static void logObject(Object obj) {
    try {
      // 1. Tạo thư mục /log nếu chưa có
      Path logDir = Paths.get(LOG_DIR);
      if (!Files.exists(logDir)) {
        Files.createDirectories(logDir);
      }

      // 2. Tạo tên file dựa vào thời gian hiện tại
      String timestamp = LocalDateTime.now().format(FORMATTER);
      String fileName = timestamp + ".json";
      Path filePath = logDir.resolve(fileName);

      // 3. Convert object sang JSON format đẹp
      ObjectWriter writer = new ObjectMapper().writerWithDefaultPrettyPrinter();
      writer.writeValue(new File(filePath.toString()), obj);

      System.out.println("Đã log object vào: " + filePath.toAbsolutePath());

    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
