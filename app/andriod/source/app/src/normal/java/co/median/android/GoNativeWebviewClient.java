package co.median.android;

import android.graphics.Bitmap;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Message;
import android.webkit.ClientCertRequest;
import android.webkit.SslErrorHandler;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.util.Map;
import java.util.Objects;

import co.median.median_core.GoNativeWebviewInterface;

/**
 * Created by weiyin on 9/9/15.
 */
public class GoNativeWebviewClient extends WebViewClient {
    private static final String TAG = GoNativeWebviewClient.class.getName();
    private final UrlNavigation urlNavigation;
    private final MainActivity activity;
    private boolean userAgentCheckDoneForNonRootWindow = false;

    public GoNativeWebviewClient(MainActivity mainActivity, UrlNavigation urlNavigation) {
        this.urlNavigation = urlNavigation;
        this.activity = mainActivity;
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        return urlNavigation.shouldOverrideUrlLoading((GoNativeWebviewInterface)view, url);
    }

    public boolean shouldOverrideUrlLoading(WebView view, String url, boolean isReload) {
        return urlNavigation.shouldOverrideUrlLoading((GoNativeWebviewInterface)view, url, isReload, false);
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            Uri uri = request.getUrl();
            return urlNavigation.shouldOverrideUrlLoading((GoNativeWebviewInterface)view, uri.toString(), false, request.isRedirect());
        }
        return super.shouldOverrideUrlLoading(view, request);
    }

    @Override
    public void onPageStarted(WebView view, String url, Bitmap favicon) {
        super.onPageStarted(view, url, favicon);

        urlNavigation.onPageStarted(url);
    }

    @Override
    public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);

        urlNavigation.onPageFinished((GoNativeWebviewInterface)view, url);
    }

    @Override
    public void onPageCommitVisible(WebView view, String url) {
        urlNavigation.onPageCommitVisible(url);
        super.onPageCommitVisible(view, url);
    }

    @Override
    public void onFormResubmission(WebView view, Message dontResend, Message resend) {
        urlNavigation.onFormResubmission((GoNativeWebviewInterface)view, dontResend, resend);
    }

    @Override
    public void doUpdateVisitedHistory(WebView view, String url, boolean isReload) {
        urlNavigation.doUpdateVisitedHistory((GoNativeWebviewInterface)view, url, isReload);
    }

    @Override
    public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
        urlNavigation.onReceivedError((GoNativeWebviewInterface) view, errorCode, description, failingUrl);
    }

    @Override
    public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
        urlNavigation.onReceivedError((GoNativeWebviewInterface) view, error.getErrorCode(),
                error.getDescription().toString(), request.getUrl().toString());
    }

    @Override
    public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
        handler.cancel();
        urlNavigation.onReceivedSslError(error, view.getUrl());
    }

    @Override
    public void onReceivedClientCertRequest(WebView view, ClientCertRequest request) {
        urlNavigation.onReceivedClientCertRequest(view.getUrl(), request);
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
        return urlNavigation.interceptHtml((LeanWebView)view, url);
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {

        WebResourceResponse wr = interceptRequestForUserAgent(request);
        if (wr != null) {
            return wr;
        }

        wr = ((GoNativeApplication) activity.getApplicationContext()).mBridge.interceptHtml(activity, request);
        if (wr != null) {
            return wr;
        }

        String method = request.getMethod();
        if (method == null || !method.equalsIgnoreCase("GET")) return null;

        android.net.Uri uri = request.getUrl();
        if (uri == null || !uri.getScheme().startsWith("http")) return null;

        return shouldInterceptRequest(view, uri.toString());
    }

    /**
     * Workaround for an issue where the custom User-Agent does not apply on the first navigation
     * of non-root windows created by {@link GoNativeWebChromeClient#onCreateWindow}.
     * <p>
     * This method intercepts the initial {@link WebResourceRequest} for such windows and compares its
     * User-Agent header with the expected custom one. If there is a mismatch, the request is canceled
     * by returning an empty 204 response. The URL is then manually reloaded in the WebView to ensure
     * the correct User-Agent is applied.
     * <p>
     * This check occurs only once per non-root window created by {@link GoNativeWebChromeClient#onCreateWindow}.
     *
     * @param request The initial {@link WebResourceRequest} to check for User-Agent mismatch.
     */
    private WebResourceResponse interceptRequestForUserAgent(WebResourceRequest request) {
        if (!userAgentCheckDoneForNonRootWindow && activity.isNotRoot() && activity.isFromWindowOpenRequest()) {
            userAgentCheckDoneForNonRootWindow = true;
            String requestUserAgent = request.getRequestHeaders().get("User-Agent");
            if (!Objects.equals(WebViewSetup.userAgent, requestUserAgent)) {
                WebResourceResponse resp = new WebResourceResponse(
                        "text/plain",
                        "UTF-8",
                        new ByteArrayInputStream(new byte[0])
                );
                resp.setStatusCodeAndReasonPhrase(204, "No Content");

                Map<String, String> newHeaders = request.getRequestHeaders();
                newHeaders.put("User-Agent", WebViewSetup.userAgent);
                activity.runOnUiThread(() -> activity.loadUrl(request.getUrl().toString(), newHeaders));
                return resp;
            }
        }
        return null;
    }
}
