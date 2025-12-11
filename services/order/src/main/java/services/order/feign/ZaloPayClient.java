package services.order.feign;

import java.util.Map;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "zalopay-client", url = "${zalopay.url}")
public interface ZaloPayClient {
  @PostMapping(path = "/createorder", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
  Map<String, Object> createOrder(@RequestBody Map<String, String> requestParams);

  @PostMapping(path = "/getstatusbyapptransid", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
  Map<String, Object> checkOrder(@RequestBody Map<String, String> requestParams);

  @PostMapping(path = "/partialrefund", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
  Map<String, Object> refundOrder(@RequestBody Map<String, String> requestParams);

  @PostMapping(path = "/getpartialrefundstatus", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
  Map<String, Object> checkRefundOrder(@RequestBody Map<String, String> requestParams);
}
