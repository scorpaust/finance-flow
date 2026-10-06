package com.dinismcosta.financeflow;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Upgrade 01 — Google Play Billing (context/features/upgrades/
 * 01-google-play-billing-android.md). A Google cobra; esta classe só mostra
 * os preços da Google, abre o ecrã de compra e devolve o token da compra. A
 * confirmação (acknowledge) e o plano ficam no servidor
 * (server/utils/googlePlay.ts), nunca aqui.
 *
 * Lado web: composables/usePlayBilling.ts
 *   getProducts({ productIds })   → { status: "ok", products } | { status: "unavailable", code }
 *   purchase({ productId, offerToken, accountId, oldPurchaseToken?, replacementMode? })
 *                                 → { status: "purchased" | "pending", purchaseToken, productIds }
 *                                 | { status: "canceled" | "already_owned" | "error", code }
 *   queryPurchases()              → { status: "ok", purchases }
 *   evento "purchasesUpdated"     → compras que mudaram fora de uma chamada (ex. pendente → paga)
 */
@CapacitorPlugin(name = "PlayBilling")
public class PlayBillingPlugin extends Plugin implements PurchasesUpdatedListener {

    private BillingClient billingClient;
    private PluginCall purchaseCall;
    private final Map<String, ProductDetails> products = new HashMap<>();

    @Override
    public void load() {
        billingClient = BillingClient.newBuilder(getContext())
            .setListener(this)
            .enablePendingPurchases(
                PendingPurchasesParams.newBuilder().enableOneTimeProducts().enablePrepaidPlans().build()
            )
            .build();
    }

    @Override
    protected void handleOnDestroy() {
        if (billingClient != null) billingClient.endConnection();
    }

    private void connected(PluginCall call, Runnable action) {
        if (billingClient.isReady()) {
            action.run();
            return;
        }
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult result) {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    action.run();
                } else {
                    status(call, "unavailable", result.getResponseCode());
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                // A próxima chamada volta a ligar (isReady() dá false).
            }
        });
    }

    private static void status(PluginCall call, String status, int code) {
        JSObject ret = new JSObject();
        ret.put("status", status);
        ret.put("code", code);
        call.resolve(ret);
    }

    @PluginMethod
    public void getProducts(PluginCall call) {
        JSArray ids = call.getArray("productIds");
        List<QueryProductDetailsParams.Product> list = new ArrayList<>();
        try {
            for (int i = 0; i < ids.length(); i++) {
                list.add(QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(ids.getString(i))
                    .setProductType(BillingClient.ProductType.SUBS)
                    .build());
            }
        } catch (Exception e) {
            call.reject("productIds inválido");
            return;
        }
        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder().setProductList(list).build();

        connected(call, () -> billingClient.queryProductDetailsAsync(params, (result, details) -> {
            if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                status(call, "unavailable", result.getResponseCode());
                return;
            }
            JSArray out = new JSArray();
            for (ProductDetails pd : details.getProductDetailsList()) {
                products.put(pd.getProductId(), pd);
                JSArray offers = new JSArray();
                List<ProductDetails.SubscriptionOfferDetails> offerList = pd.getSubscriptionOfferDetails();
                if (offerList != null) {
                    for (ProductDetails.SubscriptionOfferDetails offer : offerList) {
                        // Só os base plans (sem promoções): a oferta é a mesma da web.
                        if (offer.getOfferId() != null) continue;
                        List<ProductDetails.PricingPhase> phases = offer.getPricingPhases().getPricingPhaseList();
                        if (phases.isEmpty()) continue;
                        ProductDetails.PricingPhase price = phases.get(phases.size() - 1);
                        JSObject o = new JSObject();
                        o.put("basePlanId", offer.getBasePlanId());
                        o.put("offerToken", offer.getOfferToken());
                        o.put("formattedPrice", price.getFormattedPrice());
                        o.put("priceMicros", price.getPriceAmountMicros());
                        o.put("currency", price.getPriceCurrencyCode());
                        o.put("billingPeriod", price.getBillingPeriod());
                        o.put("prepaid", price.getRecurrenceMode() == ProductDetails.RecurrenceMode.NON_RECURRING);
                        offers.put(o);
                    }
                }
                JSObject p = new JSObject();
                p.put("productId", pd.getProductId());
                p.put("offers", offers);
                out.put(p);
            }
            JSObject ret = new JSObject();
            ret.put("status", "ok");
            ret.put("products", out);
            call.resolve(ret);
        }));
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        String productId = call.getString("productId");
        String offerToken = call.getString("offerToken");
        String accountId = call.getString("accountId");
        String oldPurchaseToken = call.getString("oldPurchaseToken");
        String replacementMode = call.getString("replacementMode");
        ProductDetails pd = productId == null ? null : products.get(productId);
        if (pd == null || offerToken == null || accountId == null) {
            call.reject("Produto não carregado — chamar getProducts() primeiro");
            return;
        }
        if (purchaseCall != null) {
            call.reject("Já há uma compra em curso");
            return;
        }

        BillingFlowParams.ProductDetailsParams item = BillingFlowParams.ProductDetailsParams.newBuilder()
            .setProductDetails(pd)
            .setOfferToken(offerToken)
            .build();
        BillingFlowParams.Builder flow = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(Collections.singletonList(item))
            // Hash do id da conta (servidor) — liga a compra à conta FinanceFlow.
            .setObfuscatedAccountId(accountId);
        if (oldPurchaseToken != null) {
            flow.setSubscriptionUpdateParams(BillingFlowParams.SubscriptionUpdateParams.newBuilder()
                .setOldPurchaseToken(oldPurchaseToken)
                .setSubscriptionReplacementMode(replacementMode(replacementMode))
                .build());
        }

        connected(call, () -> getActivity().runOnUiThread(() -> {
            purchaseCall = call;
            BillingResult result = billingClient.launchBillingFlow(getActivity(), flow.build());
            if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                purchaseCall = null;
                status(call, result.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED ? "canceled" : "error", result.getResponseCode());
            }
        }));
    }

    private static int replacementMode(String mode) {
        if ("CHARGE_PRORATED_PRICE".equals(mode)) {
            return BillingFlowParams.SubscriptionUpdateParams.ReplacementMode.CHARGE_PRORATED_PRICE;
        }
        if ("DEFERRED".equals(mode)) {
            return BillingFlowParams.SubscriptionUpdateParams.ReplacementMode.DEFERRED;
        }
        return BillingFlowParams.SubscriptionUpdateParams.ReplacementMode.CHARGE_FULL_PRICE;
    }

    private static JSObject toJs(Purchase purchase) {
        JSObject o = new JSObject();
        o.put("purchaseToken", purchase.getPurchaseToken());
        o.put("productIds", new JSArray(purchase.getProducts()));
        int state = purchase.getPurchaseState();
        o.put("state", state == Purchase.PurchaseState.PURCHASED ? "purchased" : state == Purchase.PurchaseState.PENDING ? "pending" : "unknown");
        o.put("acknowledged", purchase.isAcknowledged());
        return o;
    }

    @Override
    public void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
        PluginCall call = purchaseCall;
        purchaseCall = null;
        int code = result.getResponseCode();

        if (call == null) {
            // Fora de uma compra iniciada agora (ex. compra pendente que ficou paga).
            if (code == BillingClient.BillingResponseCode.OK && purchases != null) {
                JSArray list = new JSArray();
                for (Purchase p : purchases) list.put(toJs(p));
                JSObject data = new JSObject();
                data.put("purchases", list);
                notifyListeners("purchasesUpdated", data);
            }
            return;
        }

        if (code == BillingClient.BillingResponseCode.OK && purchases != null && !purchases.isEmpty()) {
            JSObject ret = toJs(purchases.get(0));
            ret.put("status", ret.getString("state"));
            call.resolve(ret);
        } else if (code == BillingClient.BillingResponseCode.USER_CANCELED) {
            status(call, "canceled", code);
        } else if (code == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
            status(call, "already_owned", code);
        } else {
            status(call, "error", code);
        }
    }

    @PluginMethod
    public void queryPurchases(PluginCall call) {
        QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.SUBS)
            .build();
        connected(call, () -> billingClient.queryPurchasesAsync(params, (result, purchases) -> {
            if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                status(call, "unavailable", result.getResponseCode());
                return;
            }
            JSArray list = new JSArray();
            for (Purchase p : purchases) list.put(toJs(p));
            JSObject ret = new JSObject();
            ret.put("status", "ok");
            ret.put("purchases", list);
            call.resolve(ret);
        }));
    }
}
