package com.financeflow.app;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Fase 9 — "alternative billing only" da Google Play (EEE). A app cobra as
 * subscrições com a EasyPay; antes de cada compra a Google exige, por esta
 * ordem: confirmar que o programa está disponível para o utilizador, mostrar
 * o ecrã informativo da Google e obter um token da transação, que o servidor
 * usa para a reportar à Google Play Developer API em até 24 h
 * (server/utils/googlePlayBilling.ts, context/PLAY-STORE.md, secção 5).
 *
 * Uma só chamada do lado web — composables/useAlternativeBilling.ts:
 *   prepare() → { status: "ready", token }
 *             | { status: "canceled" }            (fechou o ecrã da Google)
 *             | { status: "unavailable", code }   (fora do EEE, sem inscrição…)
 */
@CapacitorPlugin(name = "AlternativeBilling")
public class AlternativeBillingPlugin extends Plugin {

    private BillingClient billingClient;

    @Override
    public void load() {
        billingClient = BillingClient.newBuilder(getContext())
            .enableAlternativeBillingOnly()
            // Obrigatórios para o build() da biblioteca; esta app não vende
            // nada pela faturação da Google, por isso a lista fica sempre vazia.
            .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
            .setListener((billingResult, purchases) -> { })
            .build();
    }

    @Override
    protected void handleOnDestroy() {
        if (billingClient != null) billingClient.endConnection();
    }

    @PluginMethod
    public void prepare(PluginCall call) {
        if (billingClient.isReady()) {
            checkAvailability(call);
            return;
        }
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult result) {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    checkAvailability(call);
                } else {
                    unavailable(call, result);
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                // A próxima chamada volta a ligar (isReady() dá false).
            }
        });
    }

    private void checkAvailability(PluginCall call) {
        billingClient.isAlternativeBillingOnlyAvailableAsync(result -> {
            if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                unavailable(call, result);
                return;
            }
            getActivity().runOnUiThread(() -> showInformationDialog(call));
        });
    }

    private void showInformationDialog(PluginCall call) {
        // A Google só mostra o ecrã na 1.ª compra do utilizador neste
        // dispositivo; nas seguintes responde OK de imediato.
        billingClient.showAlternativeBillingOnlyInformationDialog(getActivity(), result -> {
            int code = result.getResponseCode();
            if (code == BillingClient.BillingResponseCode.USER_CANCELED) {
                JSObject ret = new JSObject();
                ret.put("status", "canceled");
                call.resolve(ret);
                return;
            }
            if (code != BillingClient.BillingResponseCode.OK) {
                unavailable(call, result);
                return;
            }
            createToken(call);
        });
    }

    private void createToken(PluginCall call) {
        billingClient.createAlternativeBillingOnlyReportingDetailsAsync((result, details) -> {
            if (result.getResponseCode() != BillingClient.BillingResponseCode.OK || details == null) {
                unavailable(call, result);
                return;
            }
            JSObject ret = new JSObject();
            ret.put("status", "ready");
            ret.put("token", details.getExternalTransactionToken());
            call.resolve(ret);
        });
    }

    private void unavailable(PluginCall call, BillingResult result) {
        JSObject ret = new JSObject();
        ret.put("status", "unavailable");
        ret.put("code", result.getResponseCode());
        call.resolve(ret);
    }
}
