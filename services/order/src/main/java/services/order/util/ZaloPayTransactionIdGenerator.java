package services.order.util;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.TimeZone;
import java.util.UUID;

import org.springframework.stereotype.Component;

@Component
public class ZaloPayTransactionIdGenerator {

  private static final String DATE_FORMAT = "yyMMdd";
  private static final String TIMEZONE = "GMT+7";

  public String generateAppTransId() {
    String datePart = getCurrentDatePart();
    String uniquePart = UUID.randomUUID().toString().replace("-", "");
    return datePart + "_" + uniquePart;
  }

  public String generateRefundId(String appId) {
    String datePart = getCurrentDatePart();
    String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    return datePart + "_" + appId + "_" + randomPart;
  }

  private String getCurrentDatePart() {
    Calendar cal = new GregorianCalendar(TimeZone.getTimeZone(TIMEZONE));
    SimpleDateFormat fmt = new SimpleDateFormat(DATE_FORMAT);
    fmt.setCalendar(cal);
    return fmt.format(cal.getTime());
  }

  public long getCurrentTimestamp() {
    return System.currentTimeMillis();
  }
}
