package com.dinismcosta.financeflow;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Plugin local (não vem de um pacote npm) — tem de ser registado à mão,
        // antes de super.onCreate().
        registerPlugin(AlternativeBillingPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
