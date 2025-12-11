package services.order.util;

import java.nio.charset.StandardCharsets;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import services.order.model.exception.ZaloPayException;

@Component
@RequiredArgsConstructor
public class ZaloPayMacCalculator {

  public String calculateMac(String data, String key) {
    try {
      Mac hmacSHA256 = Mac.getInstance("HmacSHA256");
      SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
      hmacSHA256.init(secretKey);

      byte[] hashBytes = hmacSHA256.doFinal(data.getBytes(StandardCharsets.UTF_8));
      return bytesToHex(hashBytes);
    } catch (Exception e) {
      throw new ZaloPayException("Failed to calculate MAC", e);
    }
  }

  private String bytesToHex(byte[] bytes) {
    StringBuilder sb = new StringBuilder(bytes.length * 2);
    for (byte b : bytes) {
      sb.append(String.format("%02x", b));
    }
    return sb.toString();
  }
}
