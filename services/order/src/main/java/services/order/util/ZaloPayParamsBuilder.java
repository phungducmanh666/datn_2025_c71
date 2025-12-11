package services.order.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import services.order.model.constant.ZaloPayConstants;
import services.order.model.exception.ZaloPayException;
import services.order.model.request.ZaloPayOrderRequest;

@Component
@RequiredArgsConstructor
public class ZaloPayParamsBuilder {

  @Value("${zalopay.appid}")
  private String appId;

  @Value("${zalopay.key1}")
  private String key1;

  private final ObjectMapper objectMapper;
  private final ZaloPayMacCalculator macCalculator;
  private final ZaloPayTransactionIdGenerator idGenerator;

  public Map<String, String> buildCreateOrderParams(ZaloPayOrderRequest request) {
    try {
      long timestamp = idGenerator.getCurrentTimestamp();

      Map<String, Object> embedData = createEmbedData(request.getRedirectUrl());
      List<Map<String, Object>> items = createItems(request.getAmount());

      Map<String, String> params = new HashMap<>();
      params.put("appid", appId);
      params.put("appuser", request.getAppUser());
      params.put("apptime", String.valueOf(timestamp));
      params.put("amount", String.valueOf(request.getAmount()));
      params.put("apptransid", request.getAppTransId());
      params.put("embeddata", objectMapper.writeValueAsString(embedData));
      params.put("item", objectMapper.writeValueAsString(items));
      params.put("description", request.getDescription());
      params.put("bankcode", request.getBankCode());

      String mac = calculateCreateOrderMac(params);
      params.put("mac", mac);

      return params;
    } catch (Exception e) {
      throw new ZaloPayException("Failed to build create order params", e);
    }
  }

  public Map<String, String> buildCheckOrderParams(String appTransId) {
    Map<String, String> params = new HashMap<>();
    params.put("appid", appId);
    params.put("apptransid", appTransId);

    String hmacInput = String.join("|", appId, appTransId, key1);
    String mac = macCalculator.calculateMac(hmacInput, key1);
    params.put("mac", mac);

    return params;
  }

  public Map<String, String> buildRefundParams(Long zpTransId, Long amount, String description) {
    String refundId = idGenerator.generateRefundId(appId);
    long timestamp = idGenerator.getCurrentTimestamp();

    Map<String, String> params = new HashMap<>();
    params.put("mrefundid", refundId);
    params.put("appid", appId);
    params.put("zptransid", String.valueOf(zpTransId));
    params.put("amount", String.valueOf(amount));
    params.put("timestamp", String.valueOf(timestamp));
    params.put("description", description);

    String hmacInput = String.join("|",
        appId,
        String.valueOf(zpTransId),
        String.valueOf(amount),
        description,
        String.valueOf(timestamp));

    String mac = macCalculator.calculateMac(hmacInput, key1);
    params.put("mac", mac);

    return params;
  }

  public Map<String, String> buildCheckRefundParams(String refundId) {
    long timestamp = idGenerator.getCurrentTimestamp();

    Map<String, String> params = new HashMap<>();
    params.put("appid", appId);
    params.put("mrefundid", refundId);
    params.put("timestamp", String.valueOf(timestamp));

    String hmacInput = String.join("|", appId, refundId, String.valueOf(timestamp));
    String mac = macCalculator.calculateMac(hmacInput, key1);
    params.put("mac", mac);

    return params;
  }

  private Map<String, Object> createEmbedData(String redirectUrl) {
    Map<String, Object> embedData = new HashMap<>();
    embedData.put("merchantinfo", ZaloPayConstants.MERCHANT_INFO);
    embedData.put("redirecturl", redirectUrl);
    return embedData;
  }

  private List<Map<String, Object>> createItems(Long amount) {
    Map<String, Object> item = new HashMap<>();
    item.put("itemid", ZaloPayConstants.DEFAULT_ITEM_ID);
    item.put("itemname", ZaloPayConstants.DEFAULT_ITEM_NAME);
    item.put("itemprice", amount);
    item.put("itemquantity", 1);

    List<Map<String, Object>> items = new ArrayList<>();
    items.add(item);
    return items;
  }

  private String calculateCreateOrderMac(Map<String, String> params) {
    String hmacInput = String.join("|",
        params.get("appid"),
        params.get("apptransid"),
        params.get("appuser"),
        params.get("amount"),
        params.get("apptime"),
        params.get("embeddata"),
        params.get("item"));
    return macCalculator.calculateMac(hmacInput, key1);
  }
}
